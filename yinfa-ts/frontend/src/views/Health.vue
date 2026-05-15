<template>
  <div :class="['health', 'font-mode-' + appStore.fontSizeMode, 'page-content']">
    <div class="header">
      <span class="header-title">💚 健康记录</span>
      <span class="header-desc">每日健康数据记录 · 银发健康守护</span>
    </div>

    <div class="today-summary">
      <div class="sum-item">
        <span class="sum-value">{{ today.bloodPressure }}</span>
        <span class="sum-label">血压 mmHg</span>
      </div>
      <div class="sum-item">
        <span class="sum-value">{{ today.heartRate }}</span>
        <span class="sum-label">心率 bpm</span>
      </div>
      <div class="sum-item">
        <span class="sum-value">{{ today.steps || '6800' }}</span>
        <span class="sum-label">步数</span>
      </div>
      <div class="sum-item">
        <span class="sum-value">{{ today.sleep || '7.5h' }}</span>
        <span class="sum-label">睡眠</span>
      </div>
    </div>

    <div class="record-form">
      <div class="form-title">📝 今日记录</div>

      <div class="form-group">
        <span class="form-label">收缩压/舒张压 (mmHg)</span>
        <div class="form-row">
          <input class="form-input half" type="number" placeholder="收缩压" v-model="recordForm.systolic" />
          <span class="form-sep">/</span>
          <input class="form-input half" type="number" placeholder="舒张压" v-model="recordForm.diastolic" />
        </div>
      </div>

      <div class="form-group">
        <span class="form-label">心率 (次/分钟)</span>
        <input class="form-input" type="number" placeholder="请输入心率" v-model="recordForm.heartRate" />
      </div>

      <div class="form-group">
        <span class="form-label">体重 (kg)</span>
        <input class="form-input" type="number" step="0.1" placeholder="请输入体重" v-model="recordForm.weight" />
      </div>

      <div class="form-group">
        <span class="form-label">备注</span>
        <textarea class="form-textarea" placeholder="记录今日身体状况、用药情况等..." v-model="recordForm.note" />
      </div>

      <div class="submit-btn" @click="saveRecord">
        <span class="submit-icon">💾</span>
        <span>保存今日记录</span>
      </div>
    </div>

    <div class="history-section">
      <div class="section-title">📊 近期记录</div>
      <div class="history-list">
        <div v-for="(rec, idx) in history" :key="idx" class="history-item">
          <div class="hist-date">
            <span class="hist-day">{{ rec.date }}</span>
            <span class="hist-dayofweek">{{ rec.weekday }}</span>
          </div>
          <div class="hist-metrics">
            <span class="hist-metric"><span class="hm-label">血压</span> {{ rec.bp }}</span>
            <span class="hist-metric"><span class="hm-label">心率</span> {{ rec.hr }}</span>
            <span class="hist-metric"><span class="hm-label">体重</span> {{ rec.weight }}</span>
          </div>
          <span v-if="rec.note" class="hist-note">📝 {{ rec.note }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '../stores/app'

const appStore = useAppStore()

const today = ref({ bloodPressure: '128/82', heartRate: '72', steps: '6800', sleep: '7.5h' })
const recordForm = ref({ systolic: '', diastolic: '', heartRate: '', weight: '', note: '' })

const history = ref([
  { date: '5月10日', weekday: '周六', bp: '125/80', hr: '70', weight: '66.5', note: '天气晴好，到象鼻山散步' },
  { date: '5月12日', weekday: '周一', bp: '130/85', hr: '75', weight: '66.8', note: '吃了米粉，血压略高' },
  { date: '5月13日', weekday: '周二', bp: '128/82', hr: '72', weight: '66.7', note: '' },
])

function saveRecord() {
  if (!recordForm.value.systolic && !recordForm.value.heartRate) return
  appStore.speak('保存健康记录')
  alert('健康记录已保存')
}
</script>

<style scoped>
.health { background: var(--bg); min-height: 100vh; padding-bottom: 20px; }

.header { padding: 15px; text-align: center; }
.header-title { font-size: 23px; font-weight: 700; color: var(--text-primary); }
.header-desc { display: block; font-size: 14px; color: var(--text-hint); margin-top: 2px; }

.today-summary {
  display: flex; margin: 0 10px; gap: 6px;
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--cloud) 100%);
  border-radius: 12px; padding: 12px; box-shadow: var(--shadow-sm);
}
.sum-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; }
.sum-value { font-size: 19px; font-weight: 800; color: var(--primary-dark); }
.sum-label { font-size: 12px; color: var(--text-hint); }

.record-form { margin: 10px; background: var(--bg-card); border-radius: 12px; padding: 14px; box-shadow: var(--shadow-sm); }
.form-title { font-size: 17px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; }
.form-group { margin-bottom: 14px; }
.form-label { display: block; font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
.form-input { width: 100%; padding: 12px 10px; background: var(--bg); border: 1px solid var(--border); border-radius: 4px; font-size: 17px; box-sizing: border-box; }
.form-row { display: flex; align-items: center; gap: 6px; }
.form-input.half { width: calc(50% - 10px); }
.form-sep { font-size: 19px; font-weight: 700; color: var(--text-hint); flex-shrink: 0; }
.form-textarea { width: 100%; height: 80px; padding: 10px; background: var(--bg); border: 1px solid var(--border); border-radius: 4px; font-size: 15px; resize: vertical; box-sizing: border-box; font-family: inherit; }

.submit-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: linear-gradient(135deg, var(--success) 0%, var(--success-dark) 100%);
  color: #fff; font-size: 17px; font-weight: 700; padding: 14px;
  border-radius: 12px; cursor: pointer; transition: all 0.15s;
}
.submit-btn:active { transform: scale(0.97); }
.submit-icon { font-size: 17px; }

.history-section { margin: 0 10px; }
.section-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; padding-left: 4px; }
.history-list { display: flex; flex-direction: column; gap: 6px; }
.history-item { background: var(--bg-card); border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 4px; }
.hist-date { display: flex; align-items: baseline; gap: 6px; margin-bottom: 2px; }
.hist-day { font-size: 17px; font-weight: 700; color: var(--text-primary); }
.hist-dayofweek { font-size: 12px; color: var(--text-hint); }
.hist-metrics { display: flex; flex-wrap: wrap; gap: 6px 14px; }
.hist-metric { font-size: 15px; color: var(--text-secondary); font-weight: 500; }
.hm-label { font-size: 13px; color: var(--text-hint); margin-right: 2px; }
.hist-note { font-size: 14px; color: var(--text-secondary); font-style: italic; }
</style>