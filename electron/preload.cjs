const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('capital', {
  getState: () => ipcRenderer.invoke('portfolio:get-state'),
  saveAsset: asset => ipcRenderer.invoke('asset:save', asset),
  deleteAsset: id => ipcRenderer.invoke('asset:delete', id),
  saveLiability: liability => ipcRenderer.invoke('liability:save', liability),
  deleteLiability: id => ipcRenderer.invoke('liability:delete', id),
  payLiability: (id, payment) => ipcRenderer.invoke('liability:pay', id, payment),
  refreshRates: () => ipcRenderer.invoke('rates:refresh'),
  setExternalRequests: enabled => ipcRenderer.invoke('rates:set-external-requests', enabled),
  exportJson: () => ipcRenderer.invoke('data:export-json'),
  importJson: () => ipcRenderer.invoke('data:import-json'),
  exportCsv: () => ipcRenderer.invoke('data:export-csv'),
  backup: () => ipcRenderer.invoke('data:backup'),
  reset: demo => ipcRenderer.invoke('data:reset', demo),
  onUpdated: callback => {
    const listener = (_event, state) => callback(state)
    ipcRenderer.on('portfolio:updated', listener)
    return () => ipcRenderer.removeListener('portfolio:updated', listener)
  },
})
