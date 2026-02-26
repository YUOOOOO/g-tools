<template>
  <div class="sentiment-page">
    <h2>市场情绪</h2>
    
    <div class="factors" v-if="data">
      <!-- 金价 vs 50日均线 -->
      <div class="factor-card">
        <div class="factor-header">
          <span class="factor-name">📈 金价 vs 50日均线</span>
        </div>
        <div class="factor-content">
          <div class="factor-value" :class="signalClass">
            {{ data.maSignal !== null ? (data.maSignal > 0 ? '+' : '') + data.maSignal + '%' : '--' }}
          </div>
          <div class="factor-detail">
            <span>当前金价: ${{ data.goldPrice }}</span>
            <span>50日均线: ${{ data.ma50 || '--' }}</span>
          </div>
        </div>
        <div class="factor-signal" :class="signalClass">
          {{ signalText }}
        </div>
      </div>

      <!-- 金价涨跌 -->
      <div class="factor-card">
        <div class="factor-header">
          <span class="factor-name">📊 今日涨跌</span>
        </div>
        <div class="factor-content">
          <div class="factor-value" :class="data.goldChange >= 0 ? 'up' : 'down'">
            {{ data.goldChange >= 0 ? '+' : '' }}{{ data.goldChange }}%
          </div>
          <div class="factor-detail">
            <span>国际金价: ${{ data.goldPrice }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="loading" v-else>加载中...</div>
    <div class="error" v-if="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface SentimentData {
  goldPrice: number
  goldChange: number
  ma50: number | null
  maSignal: number | null
}

const data = ref<SentimentData | null>(null)
const loading = ref(true)
const error = ref('')

const signalClass = computed(() => {
  if (!data.value?.maSignal) return ''
  return data.value.maSignal > 0 ? 'up' : 'down'
})

const signalText = computed(() => {
  if (!data.value?.maSignal) return '数据不足'
  const s = data.value.maSignal
  if (s > 2) return '强势上涨'
  if (s > 0) return '偏多'
  if (s > -2) return '偏空'
  return '强势下跌'
})

onMounted(async () => {
  try {
    const res = await fetch('/api/sentiment')
    const json = await res.json()
    if (json.code === 200) {
      data.value = json.data
    } else {
      error.value = '获取数据失败'
    }
  } catch {
    error.value = '网络请求失败'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.sentiment-page {
  max-width: 600px;
}

.sentiment-page h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
}

.factors {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.factor-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.factor-header {
  margin-bottom: 12px;
}

.factor-name {
  font-size: 14px;
  color: #666;
}

.factor-content {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 8px;
}

.factor-value {
  font-size: 32px;
  font-weight: 700;
}

.factor-value.up {
  color: #f56c6c;
}

.factor-value.down {
  color: #67c23a;
}

.factor-detail {
  font-size: 12px;
  color: #999;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.factor-signal {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 4px;
  display: inline-block;
}

.factor-signal.up {
  background: #fef0f0;
  color: #f56c6c;
}

.factor-signal.down {
  background: #f0f9eb;
  color: #67c23a;
}

.loading, .error {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.error {
  color: #f56c6c;
}
</style>
