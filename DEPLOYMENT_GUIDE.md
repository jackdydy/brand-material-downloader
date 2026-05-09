# 素材代下平台 - 部署指南

## 📋 目錄

1. [系統架構](#系統架構)
2. [環境要求](#環境要求)
3. [本地開發](#本地開發)
4. [部署到雲服務器](#部署到雲服務器)
5. [配置說明](#配置說明)
6. [常見問題](#常見問題)

---

## 系統架構

```
┌─────────────────────────────────────────────────────────────┐
│                     前台（React + Tailwind）                 │
│  - 素材連結輸入                                              │
│  - 卡密驗證                                                  │
│  - 下載連結展示                                              │
└────────────────────────┬────────────────────────────────────┘
                         │ tRPC API
┌────────────────────────▼────────────────────────────────────┐
│                  後端（Express + tRPC）                      │
│  - 卡密驗證邏輯                                              │
│  - 小靈素材自動化對接                                        │
│  - 下載歷史記錄                                              │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              數據庫（MySQL/TiDB）                            │
│  - 小靈配置表                                               │
│  - 卡密表                                                   │
│  - 下載歷史表                                               │
│  - 卡密使用記錄表                                            │
└─────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│         小靈素材（Playwright 自動化）                        │
│  - 自動登入                                                 │
│  - 提交素材連結                                              │
│  - 獲取百度網盤下載連結                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 環境要求

### 本地開發環境

- **Node.js**: v18+ (推薦 v22)
- **pnpm**: v10+
- **MySQL**: v8+ 或 TiDB
- **Playwright**: 已包含在依賴中

### 雲服務器環境

- **操作系統**: Ubuntu 20.04+ 或 CentOS 8+
- **CPU**: 2 核心+
- **內存**: 2GB+
- **存儲**: 10GB+
- **網絡**: 穩定的互聯網連接

---

## 本地開發

### 1. 克隆項目

```bash
cd /home/ubuntu/brand-material-downloader
```

### 2. 安裝依賴

```bash
pnpm install
```

### 3. 配置環境變數

創建 `.env.local` 文件（在項目根目錄）：

```env
# 數據庫配置
DATABASE_URL="mysql://user:password@localhost:3306/brand_material_downloader"

# OAuth 配置（Manus 平台提供）
VITE_APP_ID="your_app_id"
OAUTH_SERVER_URL="https://oauth.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"
JWT_SECRET="your_jwt_secret"

# 小靈素材配置（可選，用於測試）
XILING_EMAIL="jackdydy@gmail.com"
XILING_PASSWORD_ENCRYPTED="encrypted_password"
```

### 4. 初始化數據庫

```bash
pnpm db:push
```

### 5. 啟動開發服務器

```bash
pnpm dev
```

訪問 `http://localhost:5173` 查看前台。

### 6. 測試後端 API

使用 Postman 或 curl 測試：

```bash
# 驗證卡密
curl -X POST http://localhost:5173/api/trpc/xiling.validateCardKey \
  -H "Content-Type: application/json" \
  -d '{"cardKey": "7olqmzrV0"}'

# 提交下載請求
curl -X POST http://localhost:5173/api/trpc/xiling.submitDownload \
  -H "Content-Type: application/json" \
  -d '{
    "materialUrl": "https://elements.envato.com/...",
    "cardKey": "7olqmzrV0"
  }'
```

---

## 部署到雲服務器

### 推薦的雲服務提供商

1. **Manus 內置託管**（推薦）
   - 優點：集成度高、自動化部署、無需配置
   - 缺點：需要通過 Manus 平台

2. **Railway**
   - 優點：簡單易用、自動化部署、免費額度
   - 成本：按使用量計費

3. **Render**
   - 優點：免費層級、自動化部署
   - 成本：免費 + 付費升級

4. **Vercel + Serverless**
   - 優點：前端託管優秀
   - 缺點：後端需要額外配置

### 使用 Manus 內置託管（推薦）

1. 登錄 Manus 平台
2. 點擊「發佈」按鈕
3. 選擇「部署」
4. 等待自動部署完成

### 使用 Railway 部署

1. **連接 GitHub**
   - 將項目推送到 GitHub
   - 在 Railway 上連接 GitHub 倉庫

2. **配置環境變數**
   - 在 Railway 儀表板中添加所有 `.env` 變數

3. **配置數據庫**
   - 在 Railway 上創建 MySQL 服務
   - 複製連接字符串到 `DATABASE_URL`

4. **部署**
   - Railway 會自動檢測 Node.js 項目
   - 自動運行 `pnpm install` 和 `pnpm build`
   - 自動啟動 `pnpm start`

### 使用 Render 部署

1. **連接 GitHub**
   - 在 Render 上創建新的 Web Service
   - 連接 GitHub 倉庫

2. **配置構建和啟動命令**
   - 構建命令：`pnpm install && pnpm build`
   - 啟動命令：`pnpm start`

3. **配置環境變數**
   - 在 Render 儀表板中添加所有環境變數

4. **配置數據庫**
   - 創建 PostgreSQL 或 MySQL 數據庫
   - 複製連接字符串

---

## 配置說明

### 小靈素材帳號配置

#### 方式 1: 直接在代碼中配置（不推薦）

編輯 `server/xilingRouter.ts`：

```typescript
const result = await executeDownload(
  {
    email: "your_email@gmail.com",
    password: "your_password",
  },
  input.materialUrl
);
```

#### 方式 2: 使用環境變數（推薦）

1. 在 `.env.local` 中添加：

```env
XILING_EMAIL="your_email@gmail.com"
XILING_PASSWORD_ENCRYPTED="encrypted_password"
```

2. 編輯 `server/xilingRouter.ts`，使用環境變數：

```typescript
const xilingEmail = process.env.XILING_EMAIL;
const xilingPassword = process.env.XILING_PASSWORD_ENCRYPTED;

// 解密密碼（需要實現解密邏輯）
const decryptedPassword = decryptPassword(xilingPassword);

const result = await executeDownload(
  {
    email: xilingEmail,
    password: decryptedPassword,
  },
  input.materialUrl
);
```

#### 方式 3: 使用數據庫配置（最安全）

1. 在後台管理頁面添加小靈帳號
2. 密碼加密存儲在數據庫
3. 運行時從數據庫讀取

### 卡密管理

#### 添加卡密

```bash
# 通過 SQL 直接插入
INSERT INTO card_keys (
  key_value,
  type,
  total_quota,
  remaining_quota,
  expires_at,
  status,
  xiling_config_id
) VALUES (
  '7olqmzrV0',
  'per_download',
  1,
  1,
  -1,
  'active',
  1
);
```

#### 查看卡密使用情況

```bash
SELECT 
  ck.key_value,
  ck.type,
  ck.remaining_quota,
  COUNT(cku.id) as usage_count,
  SUM(cku.quota_used) as total_used
FROM card_keys ck
LEFT JOIN card_key_usage cku ON ck.id = cku.card_key_id
GROUP BY ck.id;
```

---

## 常見問題

### Q1: 小靈素材登入失敗

**原因**: 帳號密碼錯誤、帳號被鎖定、網絡問題

**解決方案**:
1. 驗證帳號密碼是否正確
2. 檢查小靈素材帳號是否被鎖定
3. 檢查服務器網絡連接
4. 查看日誌文件 `.manus-logs/devserver.log`

### Q2: 下載連結提取失敗

**原因**: 小靈素材頁面結構改變、Playwright 選擇器不匹配

**解決方案**:
1. 更新 `server/xilingAutomation.ts` 中的選擇器
2. 手動訪問小靈素材檢查頁面結構
3. 調整 Playwright 等待時間

### Q3: 卡密驗證總是失敗

**原因**: 卡密不存在、卡密已過期、卡密額度用完

**解決方案**:
1. 檢查卡密是否存在於數據庫
2. 檢查卡密有效期
3. 檢查卡密剩餘額度
4. 查看 `downloadHistory` 表中的錯誤信息

### Q4: 如何修改網站名稱和 Logo?

**修改網站名稱**:
- 編輯 `client/src/pages/Home.tsx` 中的 `<h1>` 標籤

**修改 Logo**:
- 替換 `client/src/pages/Home.tsx` 中的 Logo 元素
- 或使用圖片：`<img src="logo.png" alt="Logo" />`

### Q5: 如何添加更多卡密類型?

1. 編輯 `drizzle/schema.ts` 中的 `cardKeys` 表
2. 更新 `type` 枚舉值
3. 運行 `pnpm db:push`
4. 更新前台和後端邏輯

---

## 安全建議

1. **密碼加密**: 所有密碼必須加密存儲
2. **環境變數**: 敏感信息存儲在環境變數中
3. **HTTPS**: 生產環境必須使用 HTTPS
4. **速率限制**: 添加 API 速率限制防止濫用
5. **日誌記錄**: 記錄所有下載請求用於審計
6. **定期備份**: 定期備份數據庫

---

## 性能優化

1. **緩存**: 使用 Redis 緩存卡密驗證結果
2. **異步處理**: 使用隊列系統處理下載任務
3. **CDN**: 使用 CDN 加速靜態資源
4. **數據庫索引**: 為常用查詢字段添加索引
5. **連接池**: 使用數據庫連接池

---

## 監控和日誌

### 查看開發日誌

```bash
tail -f .manus-logs/devserver.log
tail -f .manus-logs/browserConsole.log
tail -f .manus-logs/networkRequests.log
```

### 設置告警

1. 監控下載失敗率
2. 監控卡密驗證失敗率
3. 監控 API 響應時間
4. 監控數據庫連接

---

## 聯繫支持

如有問題，請：
1. 查看本指南的常見問題部分
2. 檢查項目日誌文件
3. 提交 GitHub Issue
4. 聯繫技術支持

---

**最後更新**: 2026-05-09
**版本**: 1.0.0
