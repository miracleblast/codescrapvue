<template>
  <div class="tab-content active" id="scraper">
    <div class="tab-header">
      <h2><iconify-icon icon="iconamoon:cloud-download-light"></iconify-icon> Code Scraper</h2>
      <p>Extract code from multiple platforms with advanced configuration</p>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <button class="btn btn-primary" @click="startQuickScraping">
        <iconify-icon icon="material-symbols:rocket-launch"></iconify-icon>
        Quick Scrape (Default Settings)
      </button>
      <button class="btn btn-secondary" @click="showAdvancedSettings = !showAdvancedSettings">
        <iconify-icon icon="material-symbols:settings"></iconify-icon>
        Advanced Settings
      </button>
    </div>

    <!-- Scraping Configuration -->
    <div class="scraping-configuration">
      <div class="config-section">
        <h3>Search Configuration</h3>
        
        <div class="form-group">
          <label for="searchQuery">Search Query</label>
          <input 
            type="text" 
            id="searchQuery" 
            v-model="scrapingConfig.query"
            placeholder="Enter programming language, framework, or specific code pattern..."
          >
        </div>

        <div class="form-group">
          <label for="platformSelect">Platforms to Search</label>
          <select id="platformSelect" v-model="scrapingConfig.platform" @change="handlePlatformChange">
            <option value="github">GitHub</option>
            <option value="stackoverflow">Stack Overflow</option>
            <option value="gitlab">GitLab</option>
            <option value="codepen">CodePen</option>
            <option value="global">Global Web Search</option>
          </select>
        </div>

        <div class="form-group">
          <label for="maxResults">Maximum Results</label>
          <input 
            type="number" 
            id="maxResults" 
            v-model.number="scrapingConfig.maxResults"
            min="1" 
            max="1000"
          >
        </div>
      </div>

      <!-- Advanced Settings -->
      <div v-if="showAdvancedSettings" class="advanced-settings">
        <h3>Advanced Configuration</h3>
        
        <div class="form-row">
          <div class="form-group">
            <label for="fileTypes">File Types</label>
            <select id="fileTypes" v-model="scrapingConfig.fileTypes" multiple>
              <option value=".js">JavaScript</option>
              <option value=".py">Python</option>
              <option value=".java">Java</option>
              <option value=".cpp">C++</option>
              <option value=".html">HTML</option>
              <option value=".css">CSS</option>
              <option value=".php">PHP</option>
              <option value=".rb">Ruby</option>
              <option value=".go">Go</option>
              <option value=".rs">Rust</option>
            </select>
          </div>

          <div class="form-group">
            <label for="languageFilter">Programming Language</label>
            <select id="languageFilter" v-model="scrapingConfig.language">
              <option value="">Any Language</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="php">PHP</option>
              <option value="ruby">Ruby</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="scrapingConfig.includeForks">
            Include Forked Repositories
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="scrapingConfig.includeArchived">
            Include Archived Repositories
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="scrapingConfig.downloadFiles">
            Download Source Files
          </label>
        </div>
      </div>
    </div>

    <!-- Proxy & Account Selection -->
    <div class="execution-config">
      <h3>Execution Configuration</h3>
      
      <div class="form-row">
        <div class="form-group">
          <label for="proxyGroup">Proxy Group</label>
          <select id="proxyGroup" v-model="scrapingConfig.proxyGroup">
            <option value="none">No Proxy</option>
            <option v-for="group in proxyGroups" :key="group" :value="group">{{ group }}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="accountSelection">Account</label>
          <select id="accountSelection" v-model="scrapingConfig.account">
            <option value="none">No Account</option>
            <option v-for="account in accounts" :key="account.id" :value="account.id">
              {{ account.platform }} - {{ account.username }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="requestDelay">Request Delay (ms)</label>
        <input 
          type="range" 
          id="requestDelay" 
          v-model.number="scrapingConfig.requestDelay"
          min="100" 
          max="5000" 
          step="100"
        >
        <span>{{ scrapingConfig.requestDelay }}ms</span>
      </div>
    </div>

    <!-- Scraping Controls -->
    <div class="scraping-controls">
      <button 
        class="btn btn-primary" 
        :disabled="isScraping || !scrapingConfig.query"
        @click="startScraping"
      >
        <iconify-icon v-if="isScraping" icon="svg-spinners:bars-rotate-fade"></iconify-icon>
        <iconify-icon v-else icon="material-symbols:play-arrow"></iconify-icon>
        {{ isScraping ? 'Scraping...' : 'Start Scraping' }}
      </button>

      <button 
        class="btn btn-danger" 
        :disabled="!isScraping"
        @click="stopScraping"
      >
        <iconify-icon icon="material-symbols:stop"></iconify-icon>
        Stop Scraping
      </button>

      <button class="btn btn-outline" @click="exportResults" :disabled="results.length === 0">
        <iconify-icon icon="material-symbols:download"></iconify-icon>
        Export Results
      </button>
    </div>

    <!-- Progress Tracking -->
    <div v-if="isScraping || progress.total > 0" class="progress-section">
      <h3>Scraping Progress</h3>
      
      <div class="progress-container">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${progress.percentage}%` }"
          ></div>
        </div>
        <div class="progress-text">
          {{ progress.current }} / {{ progress.total }} items processed
          ({{ progress.percentage }}%)
        </div>
      </div>

      <div class="progress-details">
        <div class="progress-item">
          <span>Platform:</span>
          <span>{{ progress.platform }}</span>
        </div>
        <div class="progress-item">
          <span>Status:</span>
          <span>{{ progress.status }}</span>
        </div>
        <div class="progress-item">
          <span>Speed:</span>
          <span>{{ progress.speed }} items/min</span>
        </div>
      </div>
    </div>

    <!-- Real-time Logs -->
    <div class="logs-section">
      <div class="logs-header">
        <h3>Scraping Logs</h3>
        <button class="btn btn-sm btn-outline" @click="clearLogs">
          <iconify-icon icon="material-symbols:clear-all"></iconify-icon>
          Clear Logs
        </button>
      </div>
      
      <div class="logs-container">
        <div 
          v-for="(log, index) in logs" 
          :key="index"
          class="log-entry"
          :class="`log-${log.type}`"
        >
          <iconify-icon :icon="getLogIcon(log.type)"></iconify-icon>
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
        
        <div v-if="logs.length === 0" class="no-logs">
          <iconify-icon icon="material-symbols:info"></iconify-icon>
          Logs will appear here when scraping starts
        </div>
      </div>
    </div>

    <!-- Results Display -->
    <div v-if="results.length > 0" class="results-section">
      <div class="results-header">
        <h3>Scraping Results ({{ results.length }} items)</h3>
        <div class="results-actions">
          <button class="btn btn-sm btn-outline" @click="clearResults">
            <iconify-icon icon="material-symbols:clear-all"></iconify-icon>
            Clear Results
          </button>
        </div>
      </div>

      <div class="results-grid">
        <div 
          v-for="(result, index) in results" 
          :key="index"
          class="result-card"
        >
          <div class="result-header">
            <div class="result-platform">
              <iconify-icon :icon="getPlatformIcon(result.platform)"></iconify-icon>
              {{ result.platform }}
            </div>
            <div class="result-actions">
              <button class="btn-icon" @click="viewResult(result)">
                <iconify-icon icon="material-symbols:visibility"></iconify-icon>
              </button>
              <button class="btn-icon" @click="downloadResult(result)">
                <iconify-icon icon="material-symbols:download"></iconify-icon>
              </button>
            </div>
          </div>
          
          <div class="result-content">
            <h4 class="result-title">{{ result.title }}</h4>
            <p class="result-description" v-if="result.description">
              {{ result.description }}
            </p>
            
            <div class="result-meta">
              <div v-if="result.language" class="result-language">
                <iconify-icon icon="material-symbols:code"></iconify-icon>
                {{ result.language }}
              </div>
              <div v-if="result.stars" class="result-stars">
                <iconify-icon icon="material-symbols:star"></iconify-icon>
                {{ result.stars }}
              </div>
              <div class="result-date">
                <iconify-icon icon="material-symbols:calendar-today"></iconify-icon>
                {{ formatDate(result.date) }}
              </div>
            </div>
          </div>
          
          <div class="result-footer">
            <a :href="result.url" target="_blank" class="result-link">
              View Source
              <iconify-icon icon="material-symbols:open-in-new"></iconify-icon>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Result Viewer Modal -->
    <div v-if="selectedResult" class="modal-overlay" @click="selectedResult = null">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedResult.title }}</h3>
          <button class="btn-icon" @click="selectedResult = null">
            <iconify-icon icon="material-symbols:close"></iconify-icon>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="result-details">
            <div class="detail-item">
              <strong>Platform:</strong> {{ selectedResult.platform }}
            </div>
            <div class="detail-item">
              <strong>URL:</strong> 
              <a :href="selectedResult.url" target="_blank">{{ selectedResult.url }}</a>
            </div>
            <div v-if="selectedResult.language" class="detail-item">
              <strong>Language:</strong> {{ selectedResult.language }}
            </div>
            <div v-if="selectedResult.description" class="detail-item">
              <strong>Description:</strong> {{ selectedResult.description }}
            </div>
          </div>
          
          <div v-if="selectedResult.code" class="code-preview">
            <h4>Code Preview</h4>
            <pre><code>{{ selectedResult.code }}</code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { CodeScraper } from '../../playwright/code-scraper.js'

export default {
  name: 'CodeScraper',
  data() {
    return {
      isScraping: false,
      showAdvancedSettings: false,
      selectedResult: null,
      scrapingConfig: {
        query: '',
        platform: 'github',
        maxResults: 50,
        fileTypes: ['.js', '.py', '.java'],
        language: '',
        includeForks: false,
        includeArchived: false,
        downloadFiles: true,
        proxyGroup: 'none',
        account: 'none',
        requestDelay: 1000
      },
      progress: {
        current: 0,
        total: 0,
        percentage: 0,
        platform: '',
        status: 'Ready',
        speed: 0
      },
      logs: [],
      results: [],
      proxyGroups: [],
      accounts: [],
      scraper: null
    }
  },
  async mounted() {
    await this.loadProxyGroups()
    await this.loadAccounts()
    this.initializeScraper()
    
    // Load previous results
    const savedResults = localStorage.getItem('codeScraperResults')
    if (savedResults) {
      this.results = JSON.parse(savedResults)
    }
  },
  methods: {
    initializeScraper() {
      this.scraper = new CodeScraper({
        headless: true,
        timeout: 30000
      })
    },
    
    async loadProxyGroups() {
      try {
        if (window.electronAPI) {
          const result = await window.electronAPI.getProxyGroups()
          if (result.success) {
            this.proxyGroups = result.groups
          }
        }
      } catch (error) {
        console.error('Error loading proxy groups:', error)
      }
    },
    
    async loadAccounts() {
      try {
        const savedAccounts = localStorage.getItem('codeScraperAccounts')
        if (savedAccounts) {
          this.accounts = JSON.parse(savedAccounts)
        }
      } catch (error) {
        console.error('Error loading accounts:', error)
      }
    },
    
    handlePlatformChange() {
      if (this.scrapingConfig.platform === 'global') {
        this.addLog('info', 'Global web scraping enabled. This will search across the entire web.')
      }
    },
    
    async startQuickScraping() {
      this.scrapingConfig.query = 'javascript react nodejs python'
      this.scrapingConfig.maxResults = 25
      this.scrapingConfig.platform = 'github'
      
      this.addLog('info', 'Starting quick scraping session with default settings...')
      await this.startScraping()
    },
    
    async startScraping() {
      if (!this.scrapingConfig.query.trim()) {
        this.addLog('error', 'Please enter a search query')
        return
      }
      
      this.isScraping = true
      this.progress = {
        current: 0,
        total: this.scrapingConfig.maxResults,
        percentage: 0,
        platform: this.scrapingConfig.platform,
        status: 'Initializing...',
        speed: 0
      }
      
      this.addLog('info', `Starting scraping session: ${this.scrapingConfig.query}`)
      
      try {
        await this.scraper.initialize()
        
        // Start the scraping process
        if (this.scrapingConfig.platform === 'github') {
          await this.scrapeGitHub()
        } else if (this.scrapingConfig.platform === 'stackoverflow') {
          await this.scrapeStackOverflow()
        } else if (this.scrapingConfig.platform === 'global') {
          await this.scrapeGlobalWeb()
        }
        
        this.addLog('success', `Scraping completed! Found ${this.results.length} results`)
        
      } catch (error) {
        this.addLog('error', `Scraping failed: ${error.message}`)
        console.error('Scraping error:', error)
      } finally {
        this.isScraping = false
        this.progress.status = 'Completed'
        
        // Save results to localStorage
        localStorage.setItem('codeScraperResults', JSON.stringify(this.results))
        
        if (this.scraper) {
          await this.scraper.close()
        }
      }
    },
    
    async scrapeGitHub() {
      this.progress.status = 'Searching GitHub...'
      
      const results = await this.scraper.scrapeGitHub(this.scrapingConfig.query, {
        maxResults: this.scrapingConfig.maxResults,
        language: this.scrapingConfig.language,
        includeForks: this.scrapingConfig.includeForks
      })
      
      // Update results with platform info
      this.results = results.map(result => ({
        ...result,
        platform: 'github',
        date: new Date().toISOString(),
        id: this.generateId()
      }))
      
      this.progress.current = this.results.length
      this.progress.percentage = Math.round((this.results.length / this.scrapingConfig.maxResults) * 100)
    },
    
    async scrapeStackOverflow() {
      this.progress.status = 'Searching Stack Overflow...'
      this.addLog('info', 'Stack Overflow scraping would be implemented here')
      
      // Simulate results for demo
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      this.results = [{
        id: this.generateId(),
        title: 'Stack Overflow Example Result',
        description: 'This would be actual Stack Overflow content',
        url: 'https://stackoverflow.com/questions/example',
        platform: 'stackoverflow',
        language: 'javascript',
        date: new Date().toISOString()
      }]
    },
    
    async scrapeGlobalWeb() {
      this.progress.status = 'Searching global web...'
      this.addLog('info', 'Global web scraping would be implemented here')
      
      // Simulate results for demo
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      this.results = [{
        id: this.generateId(),
        title: 'Global Web Search Result',
        description: 'This would be content from various websites across the web',
        url: 'https://example.com/code-snippet',
        platform: 'web',
        language: 'python',
        date: new Date().toISOString()
      }]
    },
    
    stopScraping() {
      this.isScraping = false
      this.progress.status = 'Stopped by user'
      this.addLog('warning', 'Scraping stopped by user')
      
      if (this.scraper) {
        this.scraper.close()
      }
    },
    
    addLog(type, message) {
      this.logs.unshift({
        type,
        message,
        time: new Date().toLocaleTimeString()
      })
      
      // Keep only last 100 logs
      if (this.logs.length > 100) {
        this.logs = this.logs.slice(0, 100)
      }
    },
    
    clearLogs() {
      this.logs = []
    },
    
    clearResults() {
      this.results = []
      localStorage.removeItem('codeScraperResults')
      this.addLog('info', 'Results cleared')
    },
    
    viewResult(result) {
      this.selectedResult = result
    },
    
    downloadResult(result) {
      this.addLog('info', `Downloading: ${result.title}`)
      // Implementation for downloading individual result
    },
    
    exportResults() {
      if (this.results.length === 0) {
        this.addLog('error', 'No results to export')
        return
      }
      
      const dataStr = JSON.stringify(this.results, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const link = document.createElement('a')
      link.href = URL.createObjectURL(dataBlob)
      link.download = `code-scraper-results-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      
      this.addLog('success', `Exported ${this.results.length} results to JSON`)
    },
    
    getLogIcon(type) {
      const icons = {
        info: 'material-symbols:info',
        success: 'material-symbols:check-circle',
        warning: 'material-symbols:warning',
        error: 'material-symbols:error'
      }
      return icons[type] || icons.info
    },
    
    getPlatformIcon(platform) {
      const icons = {
        github: 'mdi:github',
        stackoverflow: 'simple-icons:stackoverflow',
        gitlab: 'mdi:gitlab',
        codepen: 'simple-icons:codepen',
        web: 'material-symbols:public'
      }
      return icons[platform] || 'material-symbols:code'
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    },
    
    generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2)
    }
  },
  
  beforeUnmount() {
    if (this.scraper) {
      this.scraper.close()
    }
  }
}
</script>

<style scoped>
.quick-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.scraping-configuration,
.execution-config {
  background: var(--card-bg);
  border-radius: var(--radius);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-color);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: 1rem;
}

.scraping-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.progress-section {
  background: var(--card-bg);
  border-radius: var(--radius);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-color);
}

.progress-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.progress-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.logs-section {
  background: var(--card-bg);
  border-radius: var(--radius);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-color);
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.logs-container {
  height: 200px;
  overflow-y: auto;
  background: var(--bg-primary);
  border-radius: var(--radius);
  padding: 1rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.log-entry {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  border-bottom: 1px solid var(--border-color);
}

.log-info { color: var(--text-primary); }
.log-success { color: var(--success); }
.log-warning { color: var(--warning); }
.log-error { color: var(--error); }

.log-time {
  color: var(--text-secondary);
  font-size: 0.75rem;
  min-width: 80px;
}

.no-logs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  justify-content: center;
  height: 100%;
}

.results-section {
  background: var(--card-bg);
  border-radius: var(--radius);
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.result-card {
  background: var(--bg-primary);
  border-radius: var(--radius);
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.result-platform {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.result-actions {
  display: flex;
  gap: 0.5rem;
}

.result-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.result-description {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.result-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.result-meta > div {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.result-footer {
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
}

.result-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary);
  text-decoration: none;
  font-size: 0.9rem;
}

.result-link:hover {
  text-decoration: underline;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 2rem;
}

.modal-content {
  background: var(--card-bg);
  border-radius: var(--radius);
  padding: 2rem;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid var(--border-color);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-item {
  margin-bottom: 0.5rem;
}

.detail-item a {
  color: var(--primary);
  text-decoration: none;
}

.detail-item a:hover {
  text-decoration: underline;
}

.code-preview {
  background: var(--bg-primary);
  border-radius: var(--radius);
  padding: 1rem;
  border: 1px solid var(--border-color);
}

.code-preview pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .scraping-controls {
    flex-direction: column;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
    padding: 1rem;
  }
}
</style>