const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('node:path')
const fs = require('node:fs/promises')
const { PortfolioDatabase } = require('./database.cjs')

if (process.env.CAPITAL_USER_DATA) app.setPath('userData', path.resolve(process.env.CAPITAL_USER_DATA))

let database
let mainWindow
const json = value => JSON.stringify(value, null, 2)
const handle = (channel, action) => ipcMain.handle(channel, async (_event, ...args) => action(...args))

async function exportFile(defaultPath, content, filters) {
  const result = await dialog.showSaveDialog(mainWindow, { defaultPath, filters })
  if (result.canceled || !result.filePath) return { canceled: true }
  await fs.writeFile(result.filePath, content, 'utf8')
  return { canceled: false, path: result.filePath }
}

function registerHandlers() {
  handle('portfolio:get-state', () => database.getState())
  handle('asset:save', async asset => {
    const state = database.saveAsset(asset)
    if (!database.externalRequestsEnabled() || asset.category !== 'crypto' || asset.source !== 'coingecko') return state
    const rateError = await database.refreshCryptoRates()
    return { ...database.getState(), rateStatus: rateError ? 'offline' : 'online', rateError: rateError || undefined }
  })
  handle('asset:delete', id => database.deleteAsset(id))
  handle('liability:save', liability => database.saveLiability(liability))
  handle('liability:delete', id => database.deleteLiability(id))
  handle('liability:pay', (id, payment) => database.payLiability(id, payment))
  handle('rates:refresh', () => database.refreshRates())
  handle('rates:set-external-requests', enabled => database.setExternalRequests(enabled))
  handle('data:reset', demo => database.reset(Boolean(demo)))
  handle('data:export-json', () => exportFile(path.join(app.getPath('documents'), 'capital-backup.json'), json(database.exportData()), [{ name: 'Capital Backup', extensions: ['json'] }]))
  handle('data:export-csv', () => {
    const escape = value => `"${String(value ?? '').replaceAll('"', '""')}"`
    const rows = database.getState().assets.map(asset => [asset.name, asset.category, asset.institution, asset.quantity, asset.unit_price, asset.currency, asset.bynValue.toFixed(2), asset.updated_at])
    const csv = '\ufeff' + [['Name','Category','Institution','Quantity','Unit price','Currency','Value BYN','Updated at'], ...rows].map(row => row.map(escape).join(';')).join('\n')
    return exportFile(path.join(app.getPath('documents'), 'capital-assets.csv'), csv, [{ name: 'CSV', extensions: ['csv'] }])
  })
  handle('data:backup', async () => {
    database.db.pragma('wal_checkpoint(TRUNCATE)')
    const result = await dialog.showSaveDialog(mainWindow, { defaultPath: path.join(app.getPath('documents'), 'capital.db'), filters: [{ name: 'SQLite', extensions: ['db'] }] })
    if (result.canceled || !result.filePath) return { canceled: true }
    await fs.copyFile(database.db.name, result.filePath)
    return { canceled: false, path: result.filePath }
  })
  handle('data:import-json', async () => {
    const result = await dialog.showOpenDialog(mainWindow, { properties: ['openFile'], filters: [{ name: 'Capital Backup', extensions: ['json'] }] })
    if (result.canceled || !result.filePaths[0]) return { canceled: true }
    const file = result.filePaths[0]
    const stat = await fs.stat(file)
    if (stat.size > 10 * 1024 * 1024) throw new Error('Файл больше 10 МБ')
    const data = JSON.parse(await fs.readFile(file, 'utf8'))
    const backup = path.join(app.getPath('userData'), 'backups', `capital-${Date.now()}.db`)
    await fs.mkdir(path.dirname(backup), { recursive: true })
    database.db.pragma('wal_checkpoint(TRUNCATE)')
    await fs.copyFile(database.db.name, backup)
    return { canceled: false, state: database.importData(data), backup }
  })
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440, height: 900, minWidth: 390, minHeight: 700,
    title: 'Капитал', backgroundColor: '#111217', show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true },
  })
  mainWindow.once('ready-to-show', () => mainWindow.show())
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url)
    return { action: 'deny' }
  })
  mainWindow.webContents.on('will-navigate', event => {
    if (mainWindow.webContents.getURL() !== event.url) event.preventDefault()
  })
  if (process.env.VITE_DEV_SERVER_URL) mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  else mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
}

app.whenReady().then(async () => {
  database = new PortfolioDatabase(path.join(app.getPath('userData'), 'capital.db'))
  registerHandlers()
  await createWindow()
  database.refreshRates().then(state => mainWindow?.webContents.send('portfolio:updated', state))
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('before-quit', () => database?.close())
