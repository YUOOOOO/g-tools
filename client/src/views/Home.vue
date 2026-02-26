<template>
  <div class="dashboard">
    <div class="cards" v-if="prices.length">
      <div class="card" v-for="item in prices" :key="item.symbol" @click="selectType(item)">
        <div class="card-top">
          <span class="bank-name">{{ item.name }}</span>
          <span class="symbol">{{ item.symbol }}</span>
        </div>
        <div class="card-price">
          <span class="currency">{{ item.currency }}</span>
          <span class="price">{{ item.price }}</span>
        </div>
        <div class="card-change" :class="item.change >= 0 ? 'up' : 'down'">
          <span>{{ item.change >= 0 ? '+' : '' }}{{ item.change }}</span>
          <span class="pct">{{ item.change_pct >= 0 ? '+' : '' }}{{ item.change_pct }}%</span>
        </div>
        <div class="update-time">更新于 {{ item.update_time }}</div>
      </div>
    </div>

    <div class="loading" v-else-if="loading">加载中...</div>
    <div class="error" v-else-if="error">{{ error }}</div>

    <!-- 走势图区域 -->
    <div class="chart-section" v-if="selectedType">
      <h2>{{ selectedName }} 今日走势</h2>
      <div class="chart-container">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';

interface GoldPrice {
  source: string;
  name: string;
  symbol: string;
  currency: string;
  price: number;
  change: number;
  change_pct: number;
  update_time: string;
  _type?: string;
}

interface ChartPoint {
  t: number;
  p: number;
}

const prices = ref<GoldPrice[]>([]);
const loading = ref(true);
const error = ref('');
const selectedType = ref('');
const selectedName = ref('');
const chartCanvas = ref<HTMLCanvasElement | null>(null);

const typeMap: Record<string, string> = {
  CZB: 'zs', CMBC: 'ms', ICBC: 'icbc', CGB: 'cgb', CIB: 'cib', LONDON: 'gj'
};

async function fetchPrices() {
  loading.value = true;
  error.value = '';
  try {
    const res = await fetch('/api/gold');
    const json = await res.json();
    if (json.code === 200) {
      prices.value = json.data;
    } else {
      error.value = '获取数据失败';
    }
  } catch {
    error.value = '网络请求失败';
  } finally {
    loading.value = false;
  }
}

async function selectType(item: GoldPrice) {
  const type = typeMap[item.symbol] || 'zs';
  selectedType.value = type;
  selectedName.value = item.name;
  await nextTick();
  await fetchChart(type);
}

async function fetchChart(type: string) {
  try {
    const res = await fetch(`/api/chart/${type}`);
    const json = await res.json();
    if (json.code === 200 && json.data?.length) {
      drawChart(json.data);
    }
  } catch {
    // ignore chart errors
  }
}

function drawChart(points: ChartPoint[]) {
  const canvas = chartCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement!.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = 260 * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = '260px';
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = 260;
  const pad = { top: 20, right: 20, bottom: 30, left: 60 };

  const ps = points.map(p => p.p);
  const minP = Math.min(...ps);
  const maxP = Math.max(...ps);
  const range = maxP - minP || 1;

  ctx.clearRect(0, 0, w, h);

  // grid lines
  ctx.strokeStyle = '#eee';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + ((h - pad.top - pad.bottom) / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();
    const val = maxP - (range / 4) * i;
    ctx.fillStyle = '#999';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(val.toFixed(2), pad.left - 8, y + 4);
  }

  // line
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;

  ctx.beginPath();
  ctx.strokeStyle = '#e6a23c';
  ctx.lineWidth = 2;
  points.forEach((pt, i) => {
    const x = pad.left + (i / (points.length - 1)) * chartW;
    const y = pad.top + (1 - (pt.p - minP) / range) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // gradient fill
  const lastX = pad.left + chartW;
  const gradient = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
  gradient.addColorStop(0, 'rgba(230, 162, 60, 0.3)');
  gradient.addColorStop(1, 'rgba(230, 162, 60, 0)');
  ctx.lineTo(lastX, h - pad.bottom);
  ctx.lineTo(pad.left, h - pad.bottom);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // time labels
  ctx.fillStyle = '#999';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  const labelCount = Math.min(6, points.length);
  for (let i = 0; i < labelCount; i++) {
    const idx = Math.floor((i / (labelCount - 1)) * (points.length - 1));
    const x = pad.left + (idx / (points.length - 1)) * chartW;
    const d = new Date(points[idx].t * 1000);
    const label = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    ctx.fillText(label, x, h - 8);
  }
}

onMounted(async () => {
  await fetchPrices();
});
</script>

<style scoped>
.dashboard {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  max-width: 1000px;
  margin: 0 auto;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
}

.card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.bank-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.symbol {
  font-size: 12px;
  color: #bbb;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
}

.card-price {
  margin-bottom: 8px;
}

.currency {
  font-size: 14px;
  color: #999;
  margin-right: 2px;
}

.price {
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

.card-change {
  display: flex;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.card-change.up {
  color: #f56c6c;
}

.card-change.down {
  color: #67c23a;
}

.update-time {
  font-size: 12px;
  color: #ccc;
}

.loading, .error {
  text-align: center;
  padding: 60px 0;
  color: #999;
  font-size: 16px;
}

.error {
  color: #f56c6c;
}

.chart-section {
  max-width: 1000px;
  margin: 32px auto 0;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.chart-section h2 {
  font-size: 18px;
  color: #333;
  margin: 0 0 16px;
}

.chart-container {
  width: 100%;
}
</style>
