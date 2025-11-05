const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Storage methods
    getStorageLocations: () => ipcRenderer.invoke('get-storage-locations'),
    addStorageLocation: (location) => ipcRenderer.invoke('add-storage-location', location),
    removeStorageLocation: (location) => ipcRenderer.invoke('remove-storage-location', location),
    
    // Scraping methods
    getScrapingSettings: () => ipcRenderer.invoke('get-scraping-settings'),
    saveScrapingSettings: (settings) => ipcRenderer.invoke('save-scraping-settings', settings),
    startScraping: (options) => ipcRenderer.invoke('start-scraping', options),
    stopScraping: () => ipcRenderer.invoke('stop-scraping'),
    getScrapingStatus: () => ipcRenderer.invoke('get-scraping-status'),
    getScrapingResults: () => ipcRenderer.invoke('get-scraping-results'),
    
    // Export/Import methods
    exportData: (data) => ipcRenderer.invoke('export-data', data),
    importData: () => ipcRenderer.invoke('import-data'),
    
    // Backup methods
    getBackupLocations: () => ipcRenderer.invoke('get-backup-locations'),
    addBackupLocation: (location) => ipcRenderer.invoke('add-backup-location', location),
    removeBackupLocation: (location) => ipcRenderer.invoke('remove-backup-location', location),
    createBackup: (backupData) => ipcRenderer.invoke('create-backup', backupData),
    restoreBackup: (backupPath) => ipcRenderer.invoke('restore-backup', backupPath),
    
    // Utility methods
    showItemInFolder: (path) => ipcRenderer.invoke('show-item-in-folder', path),
    openExternal: (url) => ipcRenderer.invoke('open-external', url)
});