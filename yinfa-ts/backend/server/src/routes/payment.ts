/**
 * 微信支付路由
 *
 * 依赖环境变量:
 *   WX_MCHID          - 商户号
 *   WX_APPID          - 小程序 AppID（或 JSAPI AppID）
 *   WX_APIKEY         - APIv2 密钥（32位）
 *   WX_APIV3_KEY      - APIv3 密钥（32位）
 *   WX_CERT_PATH      - 商户证书路径 apiclient_cert.p12 或 apiclient_cert.pem
 *   WX_NOTIFY_URL     - 支付回调地址
 *   WX_MERCHANT_TYPE  - 'miniprogram' | 'h5' | 'native'
 *
 * 注意事项:
 *   - 微信支付 APIv3（推荐）：https://wechatpay-api-v3.readthedocs.io/
 *   - 微信支付 APIv2（legacy）：需要 p12 证书
 *   - 本文件默认使用 APIv3 + HMAC-SHA256
 */
import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import axios from 'axios';
import * as fs from 'fs';
import { getDatabase, saveDatabase } from '../database';
import logger from '../logger';

const router = express.Router();

// ─── 配置 ───────────────────────────────────────────────
interface PayConfig {
  mchId: string;
  appId: string;
  apiKey: string;
  apiV3Key: string;
  certPath: string;
  notifyUrl: string;
}

function getPayConfig(): PayConfig {
  const mchId = process.env.WX_MCHID || '';
  const appId = process.env.WX_APPID || '';
  const apiKey = process.env.WX_APIKEY || '';
  const apiV3Key = process.env.WX_APIV3_KEY || '';
  const certPath = process.env.WX_CERT_PATH || '';
  const notifyUrl = process.env.WX_NOTIFY_URL || '';

  if (!mchId || !appId || !apiKey) {
    throw new Error('微信支付环境变量未配置完整: WX_MCHID, WX_APPID, WX_APIKEY');
  }

  return { mchId, appId, apiKey, apiV3Key, certPath, notifyUrl };
}

// ─── 统一下单 API ───────────────────────────────────────
/**
 * POST /api/pay/unified-order
 * Body: { order_no, total_fee(分), description, openid?, attach? }
 *
 * 微信小程序支付（推荐）:
 *   - 需要 openid（通过 wx.login 获取）
 *   - 调用 wx.requestPayment() 调起支付
 *
 * H5 支付:
 *   - 通过 external_browser 调起微信支付
 *
 * Native 支付:
 *   - 返回 code_url，生成 QR 码
 */
router.post('/unified-order', async (req: Request, res: Response) => {
  try {
    const config = getPayConfig();
    const { order_no, total_fee, description, openid, attach, merchant_type } = req.body;

    if (!order_no || !total_fee) {
      return res.status(400).json({ code: 400, error: '缺少 order_no 或 total_fee' });
    }

    if (total_fee < 1) {
      return res.status(400).json({ code: 400, error: 'total_fee 最少为 1 分' });
    }

    // 生成微信支付订单号
    const payOrderNo = `${config.mchId}${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // ── 微信支付 APIv3 统一下单 ────────────────────────────
    const timeStamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = crypto.randomBytes(16).toString('hex');
    const payLoad: Record<string, unknown> = {
      appid: config.appId,
      mchid: config.mchId,
      description: description || '漓江旅游商品',
      out_trade_no: order_no,
      time_expire: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30分钟过期
      attach: attach || '',
      notify_url: config.notifyUrl,
      amount: {
        total: total_fee,
        currency: 'CNY',
      },
    };

    if (merchant_type === 'miniprogram' && openid) {
      (payLoad as Record<string, unknown>).payer = { openid };
    }

    // 构建签名
    const signStr = `POST\n/v3/pay/transactions/${merchant_type === 'native' ? 'native' : 'jsapi'}\n${timeStamp}\n${nonceStr}\n${JSON.stringify(payLoad)}\n`;
    const signature = crypto
      .createSign('RSA-SHA256')
      .update(signStr)
      .sign(config.apiKey, 'base64');

    const authHeader = `WECHATPAY2-SHA256-RSA2048 mchid="${config.mchId}",nonce_str="${nonceStr}",signature="${signature}",timestamp="${timeStamp}",serial_no="${config.mchId}"`;

    let wxResp: Record<string, unknown>;
    const endpoint = merchant_type === 'native'
      ? 'https://api.mch.weixin.qq.com/v3/pay/transactions/native'
      : 'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi';

    try {
      const wxRes = await axios.post(endpoint, payLoad, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
          'Accept': 'application/json',
        },
        timeout: 10000,
      });
      wxResp = wxRes.data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown }; message?: string };
      logger.error({ err: axiosErr.response?.data || axiosErr.message }, '微信支付API调用失败');
      return res.status(500).json({ code: 500, error: '微信支付API调用失败', detail: axiosErr.response?.data });
    }

    // JSAPI 返回 prepay_id，Native 返回 code_url
    const prepayId = wxResp.prepay_id as string | undefined;
    const codeUrl = wxResp.code_url as string | undefined;

    if (!prepayId && !codeUrl) {
      return res.status(500).json({ code: 500, error: '微信支付下单失败', detail: wxResp });
    }

    // ── 为小程序生成调起支付的签名 ─────────────────────────
    if (merchant_type === 'miniprogram' && prepayId) {
      const packageStr = `prepay_id=${prepayId}`;
      const paySignStr = `${config.appId}\n${timeStamp}\n${nonceStr}\n${packageStr}\n`;
      const paySign = crypto
        .createSign('RSA-SHA256')
        .update(paySignStr)
        .sign(config.apiKey, 'base64');

      return res.json({
        code: 0,
        data: {
          timeStamp,
          nonceStr,
          package: packageStr,
          signType: 'RSA',
          paySign,
          prepay_id: prepayId,
        },
      });
    }

    return res.json({
      code: 0,
      data: {
        code_url: codeUrl,
        prepay_id: prepayId,
        pay_order_no: payOrderNo,
        timeStamp,
        nonceStr,
      },
    });
  } catch (err: unknown) {
    const e = err as Error;
    logger.error({ err: e.message }, '统一下单失败');
    if (e.message.includes('环境变量未配置')) {
      return res.status(503).json({ code: 503, error: '支付功能暂不可用（未配置商户号）' });
    }
    return res.status(500).json({ code: 500, error: '统一下单失败' });
  }
});

// ─── 支付回调 ───────────────────────────────────────────
/**
 * POST /api/pay/callback
 * 微信支付成功后推送到此地址
 *
 * 安全验证:
 *   1. 解密 encrypt_contents（APIv3）
 *   2. 验证签名 WECHATPAY2-SHA256-RSA2048
 *   3. 验签成功后更新本地订单状态
 */
router.post('/callback', async (req: Request, res: Response) => {
  const config = getPayConfig();
  const rawBody = (req as unknown as { rawBody?: string }).rawBody || JSON.stringify(req.body);

  try {
    // 解析回调数据
    let callbackData: Record<string, unknown>;
    if (req.headers['content-type']?.includes('application/json')) {
      // APIv3 回调体是加密的
      const body = typeof rawBody === 'string' ? JSON.parse(rawBody) : req.body;
      const encryptData = (body.resource as Record<string, string> | undefined)?.encrypt_contents;
      if (encryptData) {
        const decipher = crypto.createDecipheriv(
          'aes-256-gcm',
          Buffer.from(config.apiV3Key, 'utf-8'),
          Buffer.from((body.resource as Record<string, string>).nonce, 'base64')
        );
        let decrypted = decipher.update(Buffer.from(encryptData, 'base64'));
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        const authTag = Buffer.from((body.resource as Record<string, string>).associated_data, 'base64');
        if (!authTag.equals(decrypted.slice(-16))) {
          throw new Error('GCM auth tag mismatch');
        }
        callbackData = JSON.parse(decrypted.toString('utf-8').slice(0, -16).toString());
      } else {
        callbackData = body;
      }
    } else {
      callbackData = req.body;
    }

    const { out_trade_no, transaction_id, trade_state, total, payer } = callbackData;
    logger.info({ out_trade_no, transaction_id, trade_state }, '收到微信支付回调');

    if (trade_state === 'SUCCESS') {
      // 更新本地订单状态
      try {
        const db = getDatabase();
        db.run(
          `UPDATE orders SET status = 'paid', transaction_id = ?, updated_at = CURRENT_TIMESTAMP WHERE order_no = ?`,
          [transaction_id as string, out_trade_no as string]
        );
        // 记录支付回调
        db.run(
          `INSERT INTO payment_callbacks (order_no, transaction_id, total_fee, result_code, raw_response)
           VALUES (?, ?, ?, ?, ?)`,
          [out_trade_no as string, transaction_id as string, total as number, trade_state as string, JSON.stringify(callbackData)]
        );
        saveDatabase();
        logger.info(`订单 ${out_trade_no} 支付成功，已更新`);
      } catch (dbErr) {
        logger.error({ err: dbErr }, '更新订单状态失败');
      }
    }

    // 返回成功（必须返回 success 才不会重复推送）
    return res.status(200).json({ code: 'SUCCESS', message: '成功' });
  } catch (err: unknown) {
    const e = err as Error;
    logger.error({ err: e.message }, '支付回调处理失败');
    return res.status(200).json({ code: 'FAIL', message: e.message });
  }
});

// ─── 微信支付回调签名验证（供内部使用）──────────────────
function verifyWxPayCallback(
  serialNo: string,
  signature: string,
  body: string
): boolean {
  try {
    const config = getPayConfig();
    const wxCertPath = process.env.WX_CERT_PATH || '';
    if (!wxCertPath) return false;

    const certPem = fs.readFileSync(wxCertPath);
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(body);
    return verifier.verify(certPem, signature, 'base64');
  } catch {
    return false;
  }
}

// ─── 订单查询 ───────────────────────────────────────────
/**
 * GET /api/pay/query/:order_no
 * 查询微信支付订单状态
 */
router.get('/query/:order_no', async (req: Request, res: Response) => {
  try {
    const config = getPayConfig();
    const { order_no } = req.params as { order_no: string };
    const timeStamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = crypto.randomBytes(16).toString('hex');
    const url = `https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/${order_no}?mchid=${config.mchId}`;

    const signStr = `GET\n/v3/pay/transactions/out-trade-no/${order_no}\n${timeStamp}\n${nonceStr}\n\n`;
    const signature = crypto
      .createSign('RSA-SHA256')
      .update(signStr)
      .sign(config.apiKey, 'base64');

    const authHeader = `WECHATPAY2-SHA256-RSA2048 mchid="${config.mchId}",nonce_str="${nonceStr}",signature="${signature}",timestamp="${timeStamp}",serial_no="${config.mchId}"`;

    const wxRes = await axios.get(url, {
      headers: { Authorization: authHeader },
      timeout: 10000,
    });

    return res.json({ code: 0, data: wxRes.data });
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number; data?: unknown }; message?: string };
    if (axiosErr.response?.status === 404) {
      return res.json({ code: 404, error: '订单不存在' });
    }
    return res.status(500).json({ code: 500, error: '查询失败', detail: axiosErr.response?.data });
  }
});

// ─── 关闭订单 ───────────────────────────────────────────
/**
 * POST /api/pay/close/:order_no
 * 支付超时后关闭订单
 */
router.post('/close/:order_no', async (req: Request, res: Response) => {
  try {
    const config = getPayConfig();
    const { order_no } = req.params as { order_no: string };
    const timeStamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = crypto.randomBytes(16).toString('hex');
    const url = `https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/${order_no}/close`;

    const payLoad = { mchid: config.mchId };
    const signStr = `POST\n/v3/pay/transactions/out-trade-no/${order_no}/close\n${timeStamp}\n${nonceStr}\n${JSON.stringify(payLoad)}\n`;
    const signature = crypto
      .createSign('RSA-SHA256')
      .update(signStr)
      .sign(config.apiKey, 'base64');

    const authHeader = `WECHATPAY2-SHA256-RSA2048 mchid="${config.mchId}",nonce_str="${nonceStr}",signature="${signature}",timestamp="${timeStamp}",serial_no="${config.mchId}"`;

    await axios.post(url, payLoad, {
      headers: { Authorization: authHeader },
      timeout: 10000,
    });

    // 更新本地订单状态
    const db = getDatabase();
    db.run(`UPDATE orders SET status = 'closed' WHERE order_no = ?`, [order_no]);
    saveDatabase();

    return res.json({ code: 0, message: '订单已关闭' });
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number; data?: unknown } };
    if (axiosErr.response?.status === 404) {
      return res.status(404).json({ code: 404, error: '订单不存在或已关闭' });
    }
    return res.status(500).json({ code: 500, error: '关闭订单失败' });
  }
});

// ─── 申请退款 ───────────────────────────────────────────
/**
 * POST /api/pay/refund
 * Body: { order_no, reason, refund_amount(分) }
 */
router.post('/refund', async (req: Request, res: Response) => {
  try {
    const config = getPayConfig();
    const { order_no, reason, refund_amount } = req.body;

    if (!order_no || !refund_amount) {
      return res.status(400).json({ code: 400, error: '缺少 order_no 或 refund_amount' });
    }

    const timeStamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = crypto.randomBytes(16).toString('hex');
    const outRefundNo = `REF${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const url = 'https://api.mch.weixin.qq.com/v3/refund/domestic/refunds';

    const payLoad = {
      out_trade_no: order_no,
      out_refund_no: outRefundNo,
      reason: reason || '用户申请退款',
      notify_url: config.notifyUrl.replace('/callback', '/refund-callback'),
      amount: {
        refund: refund_amount,
        total: refund_amount,  // TODO: 应从原订单获取实际金额
        currency: 'CNY',
      },
    };

    const signStr = `POST\n/v3/refund/domestic/refunds\n${timeStamp}\n${nonceStr}\n${JSON.stringify(payLoad)}\n`;
    const signature = crypto
      .createSign('RSA-SHA256')
      .update(signStr)
      .sign(config.apiKey, 'base64');

    const authHeader = `WECHATPAY2-SHA256-RSA2048 mchid="${config.mchId}",nonce_str="${nonceStr}",signature="${signature}",timestamp="${timeStamp}",serial_no="${config.mchId}"`;

    const wxRes = await axios.post(url, payLoad, {
      headers: { Authorization: authHeader },
      timeout: 15000,
    });

    logger.info({ order_no, outRefundNo }, '退款申请成功');
    return res.json({ code: 0, data: wxRes.data });
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: unknown } };
    logger.error({ err: axiosErr?.response?.data }, '退款申请失败');
    return res.status(500).json({ code: 500, error: '退款申请失败', detail: axiosErr?.response?.data });
  }
});

export default router;
