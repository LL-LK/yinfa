<template>
  <div :class="['transport', 'font-mode-' + appStore.fontSizeMode, 'page-content']">
    <div class="banner banner-sunrise">
      <span class="banner-icon">🚌</span>
      <div>
        <span class="banner-title">交通出行</span>
        <span class="banner-desc">出行无忧·老人友好指南</span>
      </div>
    </div>

    <div class="quick-btns">
      <div class="qb-btn" @click="callTaxi">
        <span class="qb-icon">🚕</span>
        <span class="qb-label">呼叫出租车</span>
      </div>
      <div class="qb-btn" @click="$router.push('/traffic')">
        <span class="qb-icon">🚦</span>
        <span class="qb-label">查看路况</span>
      </div>
    </div>

    <div class="mode-list">
      <div v-for="item in modes" :key="item.id" class="mode-item">
        <div class="mi-header">
          <span class="mi-icon">{{ item.icon }}</span>
          <div class="mi-title-row">
            <span class="mi-name">{{ item.name }}</span>
            <span class="mi-badge">{{ item.suitable }}</span>
          </div>
        </div>
        <span class="mi-desc">{{ item.desc }}</span>
        <span class="mi-tips">💡 {{ item.tips }}</span>
      </div>
    </div>

    <div class="tips-list">
      <div v-for="(item, idx) in tips" :key="idx" class="tl-item">
        <span class="tl-icon">{{ item.icon }}</span>
        <span class="tl-text">{{ item.text }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '../stores/app'

const appStore = useAppStore()

const modes = [
  { id: 1, icon: '🚕', name: '出租车/网约车', suitable: '推荐', desc: '桂林市区出租车起步价8元，滴滴等网约车也十分便捷。建议使用打车软件预约，避免路边拦车。', tips: '高峰期市中心可能较难打到车，建议错峰出行。可在路边扬招或使用滴滴出行小程序。' },
  { id: 2, icon: '🚌', name: '公交车', suitable: '实惠', desc: '桂林公交线路覆盖主要景区，票价2元起，65岁以上老人凭老年卡免费乘车。', tips: '热门线路如2路、16路可直达象鼻山等景点。建议下载"桂林公交"APP查看实时到站信息。' },
  { id: 3, icon: '⛴️', name: '漓江游船', suitable: '特色', desc: '从磨盘山码头或竹江码头出发，可乘船游览漓江至阳朔，全程约4小时，沿途可欣赏漓江精华山水。', tips: '游船票建议提前一天预订。老年人建议选择空调豪华船，舒适度更高。' },
  { id: 4, icon: '🚲', name: '共享单车/电动车', suitable: '短途', desc: '桂林市区和阳朔设有大量共享单车和电动车停放点，适合短距离出行。', tips: '老年人建议选择电动车助力模式，骑行时注意交通安全，佩戴头盔。' },
  { id: 5, icon: '🚄', name: '高铁/动车', suitable: '远途', desc: '桂林站、桂林北站、桂林西站均有高铁和动车停靠，可快速到达周边城市。', tips: '老年人持身份证可在售票窗口享受优先购票服务。建议提前到站，从容候车。' },
]

const tips = [
  { icon: '🎫', text: '65岁以上老人凭证件可享受公交车免费乘车优惠' },
  { icon: '📱', text: '建议安装"桂林出行"APP，查看公交实时位置和路线' },
  { icon: '🏥', text: '出行前告知家人行程安排，保持手机电量充足' },
  { icon: '💊', text: '随身携带常用药品和紧急联系人信息卡' },
  { icon: '🕐', text: '桂林景区游览建议错开上下班高峰期出行' },
]

function callTaxi() {
  appStore.speak('呼叫出租车')
  alert('正在呼叫出租车...')
}
</script>

<style scoped>
.transport { background: var(--bg); padding-bottom: 20px; min-height: 100vh; }

.banner { padding: 18px 15px; display: flex; align-items: center; gap: 10px; border-radius: 12px; margin: 10px; }
.banner-sunrise { background: linear-gradient(135deg, #D4A853 0%, #2E8B57 60%, #3A7CC3 100%); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.banner-icon { font-size: 23px; }
.banner-title { display: block; font-size: 19px; font-weight: 700; color: #fff; text-shadow: 0 1px 4px rgba(0,0,0,0.3); }
.banner-desc { display: block; font-size: 12px; opacity: 0.9; margin-top: 2px; color: #fff; }

.quick-btns { display: flex; margin: 10px; gap: 8px; }
.qb-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; background: var(--bg-card); border-radius: 8px; padding: 14px 10px; box-shadow: var(--shadow-sm); cursor: pointer; transition: all 0.15s; }
.qb-btn:active { background: var(--bg-hover); transform: scale(0.97); }
.qb-icon { font-size: 19px; }
.qb-label { font-size: 17px; font-weight: 600; color: var(--text-primary); }

.mode-list { padding: 0 10px; }
.mode-item { background: var(--bg-card); border-radius: 8px; padding: 14px; margin-bottom: 8px; box-shadow: var(--shadow-sm); transition: all 0.15s; }
.mi-header { display: flex; align-items: center; margin-bottom: 8px; }
.mi-icon { font-size: 28px; margin-right: 10px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: var(--primary-light); border-radius: 8px; }
.mi-title-row { display: flex; align-items: center; gap: 6px; flex: 1; }
.mi-name { font-size: 17px; font-weight: 700; color: var(--text-primary); }
.mi-badge { font-size: 12px; padding: 3px 7px; background: var(--accent-light); color: var(--accent-dark); border-radius: 10px; font-weight: 600; }
.mi-desc { display: block; font-size: 15px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 6px; margin-left: 50px; }
.mi-tips { display: block; font-size: 14px; color: var(--text-hint); margin-left: 50px; padding: 6px 8px; background: var(--bg); border-radius: 4px; }

.tips-list { background: var(--bg-card); margin: 0 10px; border-radius: 8px; padding: 10px 12px; box-shadow: var(--shadow-sm); }
.tl-item { display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border-light); }
.tl-item:last-child { border-bottom: none; }
.tl-icon { font-size: 19px; margin-right: 8px; }
.tl-text { flex: 1; font-size: 15px; color: var(--text-primary); font-weight: 500; }
</style>