<template>
  <div class="app-container">
    <!-- Sidebar Navigation - EXACT copy from your index.html -->
    <nav class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <iconify-icon icon="material-symbols:code" class="logo-icon"></iconify-icon>
          <h2>CodeScraper Pro</h2>
        </div>
      </div>
      
      <ul class="nav-menu">
        <li class="nav-item">
          <router-link to="/" class="nav-link" active-class="active">
            <iconify-icon class="nav-icon" icon="majesticons:dashboard-line"></iconify-icon>
            <span>Dashboard</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/download" class="nav-link" active-class="active">
            <iconify-icon class="nav-icon" icon="material-symbols:download"></iconify-icon>
            <span>Download App</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/scraper" class="nav-link" active-class="active">
            <iconify-icon class="nav-icon" icon="iconamoon:cloud-download-light"></iconify-icon>
            <span>Code Scraper</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/code" class="nav-link" active-class="active">
            <iconify-icon class="nav-icon" icon="material-symbols:code-blocks"></iconify-icon>
            <span>Code Editor</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/storage" class="nav-link" active-class="active">
            <iconify-icon class="nav-icon" icon="solar:folder-with-files-linear"></iconify-icon>
            <span>Storage</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/proxy" class="nav-link" active-class="active">
            <iconify-icon class="nav-icon" icon="material-symbols:security"></iconify-icon>
            <span>Proxy Management</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/accounts" class="nav-link" active-class="active">
            <iconify-icon class="nav-icon" icon="material-symbols:person"></iconify-icon>
            <span>Account Management</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/settings" class="nav-link" active-class="active">
            <iconify-icon class="nav-icon" icon="material-symbols:settings"></iconify-icon>
            <span>Settings</span>
          </router-link>
        </li>
      </ul>

      <div class="sidebar-footer">
        <button class="help-btn" @click="showHelp = true">
          <iconify-icon icon="material-symbols:help"></iconify-icon>
          <span>Help & Guide</span>
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <router-view></router-view>
    </main>

    <!-- Help Modal -->
    <HelpModal v-if="showHelp" @close="showHelp = false" />
  </div>
</template>

<script>
import HelpModal from './components/HelpModal.vue'

export default {
  name: 'App',
  components: { HelpModal },
  data() {
    return {
      showHelp: false
    }
  },
  mounted() {
    this.checkElectronAPI()
  },
  methods: {
    checkElectronAPI() {
      if (!window.electronAPI) {
        console.warn('Electron API not available - running in browser mode')
      }
    }
  }
}
</script>