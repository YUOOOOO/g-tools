<template>
  <div class="settings-page">
    <h2>系统设置</h2>
    <div class="setting-card">
      <div class="setting-header">数据刷新间隔</div>
      <div class="setting-body">
        <div class="interval-options">
          <button
            v-for="opt in options"
            :key="opt"
            class="interval-btn"
            :class="{ active: interval === opt }"
            @click="interval = opt"
          >{{ opt }}秒</button>
        </div>
        <div class="custom-row">
          <span class="custom-label">自定义（秒）</span>
          <input
            type="number"
            class="custom-input"
            :value="interval"
            min="5"
            max="300"
            @change="onCustomChange"
          />
        </div>
        <div class="setting-hint">当前：每 {{ interval }} 秒刷新一次，所有页面生效</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRefreshInterval } from '../useRefreshInterval'

const interval = useRefreshInterval()
const options = [10, 15, 30, 60, 120]

function onCustomChange(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  if (val >= 5 && val <= 300) {
    interval.value = val
  }
}
</script>

<style scoped>
.settings-page h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
}

.setting-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  max-width: 500px;
}

.setting-header {
  padding: 16px 20px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.setting-body {
  padding: 20px;
}

.interval-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.interval-btn {
  padding: 8px 18px;
  font-size: 13px;
  border: 1px solid #eee;
  border-radius: 6px;
  background: #fff;
  color: #666;
  cursor: pointer;
  transition: all 0.15s;
}

.interval-btn:hover {
  border-color: #e6a23c;
  color: #e6a23c;
}

.interval-btn.active {
  background: #fdf6ec;
  border-color: #e6a23c;
  color: #e6a23c;
  font-weight: 600;
}

.custom-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.custom-label {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
}

.custom-input {
  width: 80px;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
}

.custom-input:focus {
  border-color: #e6a23c;
}

.setting-hint {
  font-size: 12px;
  color: #bbb;
}
</style>
