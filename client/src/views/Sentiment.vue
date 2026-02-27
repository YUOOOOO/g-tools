<template>
  <div class="sentiment-page">
    <!-- 趋势预测信号 -->
    <section class="section" v-if="predict">
      <h2>趋势预测信号</h2>
      <div class="signal-banner" :class="predict.signal">
        <div class="signal-score">{{ predict.score }}</div>
        <div class="signal-label">{{ predict.signalZh }}</div>
        <div class="signal-confidence">置信度 {{ predict.confidence }}%</div>
      </div>
      <div class="outlook-row">
        <div class="outlook-card">
          <span class="outlook-title">短期</span>
          <span class="outlook-text">{{ predict.shortTerm }}</span>
        </div>
        <div class="outlook-card">
          <span class="outlook-title">中期</span>
          <span class="outlook-text">{{ predict.midTerm }}</span>
        </div>
        <div class="outlook-card">
          <span class="outlook-title">长期</span>
          <span class="outlook-text">{{ predict.longTerm }}</span>
        </div>
      </div>
      <div class="factors-grid">
        <div class="factor-card" v-for="f in predict.factors" :key="f.name">
          <div class="factor-top">
            <span class="factor-name">{{ f.nameZh }}</span>
            <span class="factor-weight">权重 {{ (f.weight * 100).toFixed(0) }}%</span>
          </div>
          <div class="factor-score" :class="scoreClass(f.score)">
            {{ f.score > 0 ? '+' : '' }}{{ f.score }}
            <span class="factor-tag">{{ scoreTag(f.score) }}</span>
          </div>
          <div class="factor-reason">{{ f.reason }}</div>
        </div>
      </div>
    </section>

    <!-- 全球报价 -->
    <section class="section" v-if="quotes">
      <h2>全球核心报价</h2>
      <div class="quotes-grid">
        <div class="quote-card" v-for="q in quoteList" :key="q.symbol">
          <div class="quote-top">
            <span class="quote-name">{{ q.label }}</span>
            <span class="quote-symbol">{{ q.symbol }}</span>
          </div>
          <div class="quote-price">{{ q.price }}</div>
          <div class="quote-change" :class="q.changePercent >= 0 ? 'up' : 'down'">
            {{ q.changePercent >= 0 ? '+' : '' }}{{ q.changePercent.toFixed(2) }}%
          </div>
        </div>
      </div>
    </section>

    <!-- 宏观经济指标 -->
    <section class="section" v-if="macro.length">
      <h2>宏观经济指标</h2>
      <div class="macro-grid">
        <div class="macro-card" v-for="m in macro" :key="m.key">
          <div class="macro-name">{{ m.nameZh }}</div>
          <div class="macro-value">{{ m.latestValue }}</div>
          <div class="macro-trend" :class="m.trend">
            <span class="macro-trend-label">
              {{ m.trend === 'up' ? '↑ 上涨' : m.trend === 'down' ? '↓ 下跌' : '→ 震荡' }}
            </span>
            <span class="macro-trend-value">
              {{ m.change >= 0 ? '+' : '' }}{{ m.change.toFixed(2) }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <div class="loading" v-if="loading">加载中...</div>
    <div class="error" v-if="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRefreshInterval } from '../useRefreshInterval'

interface Factor {
  name: string
  nameZh: string
  weight: number
  score: number
  reason: string
}

interface Prediction {
  score: number
  signal: string
  signalZh: string
  confidence: number
  factors: Factor[]
  shortTerm: string
  midTerm: string
  longTerm: string
}

interface Quote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

interface MacroIndicator {
  key: string
  nameZh: string
  latestValue: number
  change: number
  trend: string
}

const predict = ref<Prediction | null>(null)
const quotes = ref<Record<string, Quote> | null>(null)
const macro = ref<MacroIndicator[]>([])
const refreshInterval = useRefreshInterval()
const loading = ref(true)
const error = ref('')
let timer: ReturnType<typeof setInterval>

const quoteLabels: Record<string, string> = {
  gold: '主力期金', silver: '主力期银', gld: 'GLD ETF', slv: 'SLV ETF',
  oil: '原油', copper: '铜', dxy: '美元指数', tnx: '10Y国债',
  vix: '恐慌指数', usdcny: 'USD/CNY'
}

const quoteList = computed(() => {
  if (!quotes.value) return []
  return Object.entries(quotes.value).map(([key, q]) => ({
    ...q,
    label: quoteLabels[key] || q.name
  }))
})

function scoreClass(score: number) {
  if (score > 0) return 'up'
  if (score < 0) return 'down'
  return 'neutral'
}

function scoreTag(score: number) {
  if (score > 0) return '看涨'
  if (score < 0) return '看跌'
  return '震荡'
}

async function fetchAll() {
  try {
    const [pRes, qRes, mRes] = await Promise.all([
      fetch('/api/vdj/predict'),
      fetch('/api/vdj/quotes'),
      fetch('/api/vdj/macro')
    ])
    const [pJson, qJson, mJson] = await Promise.all([
      pRes.json(), qRes.json(), mRes.json()
    ])
    if (pJson.prediction) predict.value = pJson.prediction
    if (qJson.quotes) quotes.value = qJson.quotes
    if (mJson.indicators) {
      macro.value = mJson.indicators.map((i: any) => ({
        key: i.key, nameZh: i.nameZh,
        latestValue: i.latestValue, change: i.change, trend: i.trend
      }))
    }
    error.value = ''
  } catch {
    error.value = '获取数据失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAll()
  timer = setInterval(fetchAll, refreshInterval.value * 1000)
})

watch(refreshInterval, (val) => {
  clearInterval(timer)
  timer = setInterval(fetchAll, val * 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.sentiment-page {
  max-width: 1000px;
  margin: 0 auto;
}

.section {
  margin-bottom: 32px;
}

.section h2 {
  font-size: 18px;
  color: #333;
  margin-bottom: 16px;
}

/* Signal banner */
.signal-banner {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.signal-score {
  font-size: 36px;
  font-weight: 700;
  color: #333;
  min-width: 60px;
}

.signal-banner.bullish .signal-score { color: #f56c6c; }
.signal-banner.bearish .signal-score { color: #67c23a; }

.signal-label {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.signal-confidence {
  margin-left: auto;
  font-size: 13px;
  color: #999;
}

/* Outlook */
.outlook-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.outlook-card {
  background: #fff;
  border-radius: 10px;
  padding: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.outlook-title {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 6px;
}

.outlook-text {
  font-size: 13px;
  color: #333;
  line-height: 1.5;
}

/* Factors grid */
.factors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.factor-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.factor-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.factor-name {
  font-size: 13px;
  color: #333;
  font-weight: 600;
}

.factor-weight {
  font-size: 11px;
  color: #bbb;
}

.factor-score {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 6px;
}

.factor-score.up { color: #f56c6c; }
.factor-score.down { color: #67c23a; }
.factor-score.neutral { color: #999; }

.factor-tag {
  font-size: 12px;
  font-weight: 600;
  margin-left: 6px;
  padding: 2px 8px;
  border-radius: 4px;
  vertical-align: middle;
}

.factor-score.up .factor-tag {
  background: #fef0f0;
  color: #f56c6c;
}

.factor-score.down .factor-tag {
  background: #f0f9eb;
  color: #67c23a;
}

.factor-score.neutral .factor-tag {
  background: #f5f5f5;
  color: #999;
}

.factor-reason {
  font-size: 12px;
  color: #888;
  line-height: 1.5;
}

/* Quotes grid */
.quotes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.quote-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.quote-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.quote-name {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.quote-symbol {
  font-size: 11px;
  color: #bbb;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
}

.quote-price {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.quote-change {
  font-size: 14px;
  font-weight: 500;
}

.quote-change.up { color: #f56c6c; }
.quote-change.down { color: #67c23a; }

/* Macro grid */
.macro-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.macro-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.macro-name {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.macro-value {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.macro-trend {
  font-size: 13px;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.macro-trend.up { color: #f56c6c; }
.macro-trend.down { color: #67c23a; }
.macro-trend.flat { color: #999; }

@media (max-width: 768px) {
  .outlook-row {
    grid-template-columns: 1fr;
  }

  .signal-banner {
    flex-wrap: wrap;
    padding: 16px;
    gap: 10px;
  }

  .signal-score {
    font-size: 28px;
  }

  .signal-confidence {
    margin-left: 0;
    width: 100%;
  }

  .factors-grid {
    grid-template-columns: 1fr;
  }

  .quotes-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .quote-price {
    font-size: 18px;
  }

  .macro-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .macro-value {
    font-size: 18px;
  }

  .section h2 {
    font-size: 16px;
  }
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
