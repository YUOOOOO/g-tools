<template>
  <div class="layout">
    <!-- Mobile hamburger -->
    <button class="mobile-hamburger" @click="menuOpen = !menuOpen">
      <span></span>
      <span></span>
      <span></span>
    </button>
    
    <header class="header">
      <div class="logo">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="13" fill="#e6a23c" stroke="#d4940a" stroke-width="1"/>
          <text x="14" y="18" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">G</text>
        </svg>
        <span class="logo-text">G-Tools</span>
      </div>
      <nav class="desktop-nav">
        <router-link to="/" class="menu-item" exact-active-class="active" @click="menuOpen = false">
          <span class="menu-icon">📊</span>仪表盘
        </router-link>
        <router-link to="/sentiment" class="menu-item" active-class="active" @click="menuOpen = false">
          <span class="menu-icon">🧠</span>市场情绪
        </router-link>
        <router-link to="/intel" class="menu-item" active-class="active" @click="menuOpen = false">
          <span class="menu-icon">📡</span>实时情报
        </router-link>
        <router-link to="/settings" class="menu-item" active-class="active" @click="menuOpen = false">
          <span class="menu-icon">⚙️</span>系统设置
        </router-link>
      </nav>
      <!-- Desktop price ticker -->
      <div class="price-ticker" v-if="prices.length">
        <div class="ticker-item" v-for="item in prices" :key="item.symbol">
          <span class="ticker-name">{{ item.name }}</span>
          <span class="ticker-price">{{ item.currency }}{{ item.price }}</span>
          <span class="ticker-change" :class="item.change >= 0 ? 'up' : 'down'">
            {{ item.change >= 0 ? '+' : '' }}{{ item.change_pct }}%
          </span>
        </div>
      </div>
    </header>
    
    <aside class="sidebar" :class="{ open: menuOpen }">
      <div class="logo mobile-only">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="13" fill="#e6a23c" stroke="#d4940a" stroke-width="1"/>
          <text x="14" y="18" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">G</text>
        </svg>
        <span class="logo-text">G-Tools</span>
      </div>
      <nav>
        <router-link to="/" class="menu-item" exact-active-class="active" @click="menuOpen = false">
          <span class="menu-icon">📊</span>仪表盘
        </router-link>
        <router-link to="/sentiment" class="menu-item" active-class="active" @click="menuOpen = false">
          <span class="menu-icon">🧠</span>市场情绪
        </router-link>
        <router-link to="/intel" class="menu-item" active-class="active" @click="menuOpen = false">
          <span class="menu-icon">📡</span>实时情报
        </router-link>
        <router-link to="/settings" class="menu-item" active-class="active" @click="menuOpen = false">
          <span class="menu-icon">⚙️</span>系统设置
        </router-link>
      </nav>
    </aside>
    <main class="content">
      <router-view />
    </main>
    
    <div class="overlay" :class="{ show: menuOpen }" @click="menuOpen = false"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface GoldPrice {
  source: string
  name: string
  symbol: string
  currency: string
  price: number
  change: number
  change_pct: number
  update_time: string
}

const menuOpen = ref(false)
const prices = ref<GoldPrice[]>([])

onMounted(async () => {
  try {
    const res = await fetch('/api/gold')
    const json = await res.json()
    if (json.code === 200) {
      prices.value = json.data
    }
  } catch {}
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #f5f5f5;
  -webkit-font-smoothing: antialiased;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

a {
  text-decoration: none;
  color: inherit;
}

.layout {
  min-height: 100vh;
  display: block;
}

.header {
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 50;
  gap: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.desktop-nav {
  display: flex;
  gap: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 14px;
  color: #666;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.menu-item:hover {
  background: #f9f9f9;
  color: #333;
}

.menu-item.active {
  background: #fdf6ec;
  color: #e6a23c;
  font-weight: 600;
}

.menu-icon {
  font-size: 14px;
}

/* Price ticker */
.price-ticker {
  margin-left: auto;
  display: flex;
  gap: 20px;
  overflow-x: auto;
}

.ticker-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  white-space: nowrap;
}

.ticker-name {
  color: #666;
}

.ticker-price {
  font-weight: 600;
  color: #333;
}

.ticker-change {
  font-weight: 500;
}

.ticker-change.up {
  color: #f56c6c;
}

.ticker-change.down {
  color: #67c23a;
}

.sidebar {
  display: none;
}

.content {
  padding: 24px;
}

/* Mobile */
.mobile-hamburger {
  display: none;
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 101;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: 40px;
  height: 40px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
}

.mobile-hamburger span {
  display: block;
  width: 20px;
  height: 2px;
  background: #333;
  margin: 0 auto;
}

.overlay {
  display: none;
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .header {
    display: none;
  }

  .mobile-hamburger {
    display: flex;
  }

  .sidebar {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 200px;
    height: 100vh;
    flex-direction: column;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 100;
    padding: 20px 0;
    background: #fff;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .mobile-only {
    display: flex !important;
    padding: 0 20px 20px;
    border-bottom: 1px solid #eee;
    margin-bottom: 12px;
  }

  .sidebar nav {
    flex-direction: column;
  }

  .menu-item {
    padding: 12px 20px;
  }

  .content {
    padding: 16px;
  }
}
</style>
