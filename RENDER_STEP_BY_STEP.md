# Render 部署完整步驟指南（中文版）

## 🎯 目標

把您的「素材代下平台」部署到 Render 雲服務器，讓全世界都能訪問。

---

## 📌 前置準備

✅ GitHub 倉庫已創建：https://github.com/jackdydy/brand-material-downloader
✅ 所有代碼已上傳到 GitHub
✅ 您有 GitHub 帳號

---

## 第一步：訪問 Render 官網

1. 打開瀏覽器
2. 訪問 https://render.com
3. 點擊右上角 **「Sign up」**（註冊）

---

## 第二步：用 GitHub 帳號登入 Render

1. 點擊 **「Continue with GitHub」**
2. 授權 Render 訪問您的 GitHub
3. 點擊 **「Authorize render」**
4. 完成註冊

---

## 第三步：創建 Web Service

1. 登入 Render 後，您會看到儀表板
2. 點擊 **「+ New」** 按鈕（右上角）
3. 選擇 **「Web Service」**

---

## 第四步：連接 GitHub 倉庫

1. 在「Connect a repository」部分，點擊 **「Connect GitHub」**
2. 搜索 **「brand-material-downloader」**
3. 點擊倉庫名稱進行連接
4. 點擊 **「Connect」**

---

## 第五步：配置部署設置

填寫以下信息：

| 字段 | 值 |
|------|-----|
| **Name** | `brand-material-downloader` |
| **Environment** | `Node` |
| **Build Command** | `pnpm install && pnpm build` |
| **Start Command** | `pnpm start` |
| **Plan** | `Free` (或 `Starter` 以獲得更好性能) |

---

## 第六步：添加環境變數

1. 向下滾動到 **「Environment」** 部分
2. 點擊 **「Add Environment Variable」**
3. 添加以下變數（複製粘貼）：

```
NODE_ENV=production
```

4. 繼續添加其他變數：

```
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

**注意**：暫時可以留空，部署後再填寫。

---

## 第七步：配置數據庫

### 選項 A：使用 Render 的 PostgreSQL（簡單）

1. 在 Render 儀表板中，點擊 **「+ New」**
2. 選擇 **「PostgreSQL」**
3. 填寫數據庫名稱：`brand-material-db`
4. 點擊 **「Create Database」**
5. 複製連接字符串
6. 粘貼到 Web Service 的 `DATABASE_URL` 環境變數

### 選項 B：使用外部 MySQL（推薦）

如果您已有 MySQL 服務器：

1. 準備連接字符串：`mysql://user:password@host:port/database`
2. 粘貼到 Web Service 的 `DATABASE_URL` 環境變數

---

## 第八步：部署

1. 點擊 **「Create Web Service」** 按鈕
2. 等待部署完成（通常 5-10 分鐘）
3. 查看日誌確保沒有錯誤

---

## 第九步：訪問您的應用

部署完成後，您會看到一個 URL：

```
https://brand-material-downloader.onrender.com
```

點擊這個 URL 訪問您的應用！

---

## 🔍 檢查部署狀態

1. 在 Render 儀表板中，找到您的 Web Service
2. 查看 **「Status」** 欄位
3. 如果顯示 **「Live」**，說明部署成功
4. 如果顯示 **「Build failed」**，點擊查看日誌了解錯誤

---

## 📊 查看日誌

1. 在 Web Service 頁面，點擊 **「Logs」** 標籤
2. 查看實時日誌
3. 如果有錯誤，會在這裡顯示

---

## 🆘 常見問題

### 問題 1：部署失敗，顯示 "Build failed"

**解決方案**：
1. 檢查 GitHub 倉庫中是否有所有必要的文件
2. 查看 Render 日誌了解具體錯誤
3. 確保 `package.json` 文件正確

### 問題 2：應用啟動後立即崩潰

**解決方案**：
1. 檢查環境變數是否正確設置
2. 檢查數據庫連接字符串
3. 查看應用日誌了解錯誤信息

### 問題 3：無法訪問應用

**解決方案**：
1. 確保部署狀態是 「Live」
2. 等待 5-10 分鐘讓應用完全啟動
3. 清除瀏覽器緩存並重新訪問

---

## ✅ 部署完成檢查清單

- [ ] GitHub 倉庫已創建
- [ ] Render 帳號已創建
- [ ] Web Service 已連接到 GitHub
- [ ] 環境變數已設置
- [ ] 數據庫已配置
- [ ] 部署完成（Status 顯示 「Live」）
- [ ] 可以訪問應用 URL
- [ ] 前台頁面正常顯示
- [ ] API 可以正常工作

---

## 🚀 下一步

部署完成後，您可以：

1. **配置自定義域名**
   - 在 Render 中添加自定義域名
   - 指向您的應用

2. **設置自動部署**
   - 每次推送到 GitHub 時自動部署

3. **監控應用**
   - 查看性能指標
   - 設置告警

4. **優化性能**
   - 升級到 Starter 計劃
   - 添加 Redis 緩存

---

## 📞 需要幫助？

1. 查看 Render 官方文檔：https://render.com/docs
2. 查看應用日誌了解錯誤
3. 聯繫 Render 支持

---

**祝您部署順利！** 🎉
