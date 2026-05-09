# 在 Render 上部署素材代下平台

## 📋 快速開始

### 第 1 步：準備 GitHub 倉庫

1. 訪問 https://github.com/jackdydy/brand-material-downloader
2. 確保以下文件已上傳：
   - `render.yaml` - Render 配置文件
   - `Procfile` - 啟動命令
   - `package.json` - 依賴配置
   - `server/` 和 `client/` - 源代碼

### 第 2 步：在 Render 上創建服務

1. **訪問** https://render.com
2. **登入或註冊**（用 GitHub 帳號最簡單）
3. **點擊** `+ New` → `Web Service`
4. **連接 GitHub**
   - 授權 Render 訪問您的 GitHub
   - 選擇 `brand-material-downloader` 倉庫
5. **配置部署**
   - Name: `brand-material-downloader`
   - Environment: `Node`
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`
   - Plan: `Free` (或 `Starter` 以獲得更好性能)

### 第 3 步：配置環境變數

在 Render 儀表板中，進入 `Environment` 標籤，添加以下環境變數：

```
NODE_ENV=production
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=your_jwt_secret_here
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://oauth.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=your_owner_id
OWNER_NAME=Your Name
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_api_key
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
XILING_EMAIL=jackdydy@gmail.com
XILING_PASSWORD_ENCRYPTED=encrypted_password
```

### 第 4 步：配置數據庫

#### 選項 A：使用 Render 的 PostgreSQL（推薦）

1. 在 Render 儀表板中，點擊 `+ New` → `PostgreSQL`
2. 配置數據庫名稱和用戶
3. 複製連接字符串到 `DATABASE_URL`

#### 選項 B：使用外部 MySQL 數據庫

1. 準備 MySQL 連接字符串
2. 格式：`mysql://user:password@host:port/database`
3. 粘貼到 `DATABASE_URL`

**注意**：項目使用 MySQL/TiDB，但 Render 提供 PostgreSQL。您需要：
- 使用外部 MySQL 服務（如 PlanetScale、AWS RDS）
- 或修改 `drizzle.config.ts` 使用 PostgreSQL

### 第 5 步：部署

1. **點擊** `Deploy`
2. **等待部署完成**（通常 5-10 分鐘）
3. **查看日誌**確保沒有錯誤
4. **訪問您的應用**
   - URL 格式：`https://brand-material-downloader.onrender.com`

---

## 🔧 常見問題

### Q1: 部署失敗，顯示 "Build failed"

**原因**：依賴安裝失敗或構建命令錯誤

**解決方案**：
1. 檢查 `package.json` 是否正確
2. 查看 Render 日誌了解具體錯誤
3. 確保 `pnpm` 已安裝

### Q2: 應用啟動後立即崩潰

**原因**：環境變數缺失或數據庫連接失敗

**解決方案**：
1. 檢查所有環境變數是否正確設置
2. 驗證 `DATABASE_URL` 連接字符串
3. 查看應用日誌

### Q3: 數據庫遷移失敗

**原因**：數據庫架構不匹配

**解決方案**：
1. 手動運行遷移：`pnpm db:push`
2. 或使用 Render 的 shell 訪問應用並運行命令

### Q4: 如何更新應用？

**方案 1**：自動部署（推薦）
- 每次推送到 GitHub `main` 分支時自動部署

**方案 2**：手動部署
- 在 Render 儀表板中點擊 `Manual Deploy`

---

## 📊 監控和日誌

1. **查看日誌**：Render 儀表板 → `Logs`
2. **監控性能**：Render 儀表板 → `Metrics`
3. **設置告警**：Render 儀表板 → `Alerts`

---

## 🚀 優化建議

### 性能優化

1. **使用 Starter 計劃**（Free 計劃會在 15 分鐘無活動後休眠）
2. **添加 Redis 緩存**
3. **使用 CDN 加速靜態資源**

### 成本優化

1. **使用 Free 計劃**進行開發
2. **按需升級到 Starter**（$7/月）
3. **使用共享數據庫**降低成本

---

## 📝 部署檢查清單

- [ ] GitHub 倉庫已創建並包含所有代碼
- [ ] `render.yaml` 和 `Procfile` 已上傳
- [ ] Render 帳號已創建
- [ ] Web Service 已連接到 GitHub
- [ ] 所有環境變數已設置
- [ ] 數據庫已配置
- [ ] 部署完成且應用正常運行
- [ ] 前台可以訪問
- [ ] API 端點可以正常工作

---

## 🆘 需要幫助？

1. 查看 Render 官方文檔：https://render.com/docs
2. 檢查應用日誌了解錯誤信息
3. 聯繫 Render 支持

---

**最後更新**：2026-05-09
