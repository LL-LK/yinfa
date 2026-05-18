/**
 * MCP 客户端路由
 * yinfa 后端作为 MCP 客户端，调用 lvyou-agi 的 /mcp 端点
 * 协议：JSON-RPC 2.0 over HTTP
 * 
 * MCP 方法：
 *   tools/list     → 列出可用工具
 *   tools/call     → 调用具体工具
 *   sampling/createMessage → LLM 请求采样（yinfa 后端处理）
 */

import { Router, Request, Response } from 'express';
import axios, { AxiosInstance } from 'axios';
import { randomUUID } from 'crypto';

const router = Router();

// ==================== 配置 ====================

const LVYOU_AGI_BASE_URL = process.env.LVYOU_AGI_URL || 'http://localhost:8001';
const LVYOU_AGI_MCP_KEY = process.env.LVYOU_AGI_MCP_KEY || '';
const REQUEST_TIMEOUT = 30000; // 30秒超时

// 创建 HTTP 客户端（复用来避免每次创建新连接）
let lvyouAgiClient: AxiosInstance | null = null;

function getLvyouAgiClient(): AxiosInstance {
  if (!lvyouAgiClient) {
    lvyouAgiClient = axios.create({
      baseURL: LVYOU_AGI_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        ...(LVYOU_AGI_MCP_KEY ? { 'Authorization': `Bearer ${LVYOU_AGI_MCP_KEY}` } : {}),
      },
    });
  }
  return lvyouAgiClient;
}

// ==================== 会话管理 ====================

interface McpSession {
  id: string;
  createdAt: Date;
  lastUsed: Date;
}

const sessions = new Map<string, McpSession>();

function getOrCreateSession(sessionId?: string): string {
  if (sessionId && sessions.has(sessionId)) {
    const session = sessions.get(sessionId)!;
    session.lastUsed = new Date();
    return sessionId;
  }
  const newId = sessionId || randomUUID();
  sessions.set(newId, { id: newId, createdAt: new Date(), lastUsed: new Date() });
  return newId;
}

// 定期清理过期会话（10分钟未使用）
setInterval(() => {
  const now = Date.now();
  const MAX_AGE_MS = 10 * 60 * 1000;
  const expiredIds: string[] = [];
  sessions.forEach((session, id) => {
    if (now - session.lastUsed.getTime() > MAX_AGE_MS) {
      expiredIds.push(id);
    }
  });
  expiredIds.forEach(id => sessions.delete(id));
}, 2 * 60 * 1000); // 每2分钟检查一次

// ==================== MCP 请求转发核心 ====================

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number | null;
  method: string;
  params?: Record<string, any>;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

/**
 * 向 lvyou-agi 发送 JSON-RPC 请求
 */
async function callLvyouAgiMcp(request: JsonRpcRequest): Promise<JsonRpcResponse> {
  const client = getLvyouAgiClient();
  try {
    const response = await client.post('/mcp', request);
    return response.data as JsonRpcResponse;
  } catch (err: any) {
    if (err.response) {
      // lvyou-agi 返回了错误响应
      return err.response.data as JsonRpcResponse;
    }
    // 网络错误等
    return {
      jsonrpc: '2.0',
      id: request.id ?? null,
      error: {
        code: -32603,
        message: `Internal error: ${err.message}`,
        data: err.code,
      },
    };
  }
}

// ==================== tools/call 工具映射表 ====================

// lvyou-agi 的工具定义（与 mcp_handler.py 中一致）
// chat, plan_trip, search_knowledge, update_preferences

// ==================== 路由处理 ====================

/**
 * MCP 端点
 * POST /api/mcp — 转发 JSON-RPC 请求到 lvyou-agi
 * GET  /api/mcp — 获取工具列表（可用作健康检查）
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as JsonRpcRequest;

    // 基本验证
    if (!body || body.jsonrpc !== '2.0' || !body.method) {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: body?.id ?? null,
        error: { code: -32600, message: 'Invalid Request' },
      } as JsonRpcResponse);
    }

    const { method, params = {}, id } = body;

    // 会话处理
    if (params.sessionId) {
      params.session_id = getOrCreateSession(params.sessionId);
      delete params.sessionId;
    } else {
      params.session_id = getOrCreateSession();
    }

    const requestId = id ?? null;

    // 处理 sampling/createMessage（yinfa 后端自己处理，不转发）
    if (method === 'sampling/createMessage') {
      return res.status(200).json({
        jsonrpc: '2.0',
        id: requestId,
        result: {
          model: 'yinfa-backend-llm',
          stopReason: 'end_turn',
          role: 'user',
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                type: 'sampling_response',
                message: 'yinfa handles sampling internally',
              }),
            },
          ],
        },
      } as JsonRpcResponse);
    }

    // 处理 tools/call，转换参数格式
    if (method === 'tools/call') {
      const toolName = params.name;
      const toolArgs = params.arguments || {};

      // 确保 session_id 一致
      if (!toolArgs.session_id) {
        toolArgs.session_id = params.session_id;
      }

      const requestForLvyouAgi: JsonRpcRequest = {
        jsonrpc: '2.0',
        id: requestId,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: toolArgs,
          session_id: params.session_id,
        },
      };

      const response = await callLvyouAgiMcp(requestForLvyouAgi);
      return res.status(200).json(response);
    }

    // 处理 tools/list，直接转发
    if (method === 'tools/list') {
      const response = await callLvyouAgiMcp({
        jsonrpc: '2.0',
        id: requestId,
        method: 'tools/list',
        params: {},
      });
      return res.status(200).json(response);
    }

    // 未知方法
    return res.status(200).json({
      jsonrpc: '2.0',
      id: requestId,
      error: { code: -32601, message: `Method not found: ${method}` },
    } as JsonRpcResponse);
  } catch (err: any) {
    return res.status(200).json({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32603, message: `Internal error: ${err.message}` },
    } as JsonRpcResponse);
  }
});

// GET /api/mcp — 工具列表（健康检查/发现）
router.get('/', async (req: Request, res: Response) => {
  try {
    const response = await callLvyouAgiMcp({
      jsonrpc: '2.0',
      id: null,
      method: 'tools/list',
      params: {},
    });
    return res.status(200).json(response);
  } catch (err: any) {
    return res.status(503).json({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32603, message: `Cannot reach lvyou-agi: ${err.message}` },
    });
  }
});

export default router;