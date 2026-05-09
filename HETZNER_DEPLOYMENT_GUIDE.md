# 🚀 Hetzner Cloud 完整部署指引（零代碼）

> 預估完成時間：30-45 分鐘
> 月費：約 USD $8.21（HK$64）

---

## 📋 第一步：註冊 Hetzner Cloud（5 分鐘）

### 1. 前往註冊頁面
👉 https://www.hetzner.com/cloud

### 2. 點擊「Sign Up」
- 填寫您的電郵地址和密碼
- 驗證電郵

### 3. 完成帳號驗證
- 需要提供信用卡或 PayPal
- Hetzner 會預扣 €1（會退回）

### 4. 創建項目
- 登入後點擊「New Project」
- 命名為「Material Downloader」

---

## 🖥️ 第二步：創建伺服器（5 分鐘）

### 1. 點擊「Add Server」

### 2. 選擇配置
| 項目 | 選擇 |
|------|------|
| **Location** | Ashburn, VA（美國，推薦）或 Helsinki（歐洲）|
| **Image** | Ubuntu 24.04 |
| **Type** | **CPX21**（3 vCPU + 4GB RAM + 80GB）|
| **Networking** | 保持默認 |
| **SSH Keys** | 跳過（用密碼登入）|
| **Volumes** | 不需要 |
| **Firewalls** | 不需要 |
| **Backups** | 可選（+20% 費用，建議開）|
| **Name** | material-downloader |

### 3. 點擊「Create & Buy Now」

### 4. 記錄伺服器資訊
創建後您會看到：
- **IP 地址**：例如 `123.45.67.89`
- **Root 密碼**：會發送到您的電郵

**請保存好這兩項資訊！**

---

## 🔐 第三步：登入伺服器（5 分鐘）

### Windows 用戶：
1. 下載並安裝 [PuTTY](https://www.putty.org/)
2. 開啟 PuTTY
3. Host Name 輸入：您的伺服器 IP
4. Port: 22
5. 點擊「Open」
6. 用戶名輸入：`root`
7. 密碼輸入：電郵收到的密碼（複製貼上）

### Mac/Linux 用戶：
開啟終端機（Terminal），輸入：
```bash
ssh root@您的伺服器IP
```
然後輸入密碼。

### 首次登入會要求改密碼
- 輸入舊密碼
- 設定新密碼（記得保存）

---

## 🚀 第四步：一鍵部署（10 分鐘）

### 1. 在伺服器上執行以下命令：

```bash
# 下載部署腳本
curl -O https://raw.githubusercontent.com/jackdydy/brand-material-downloader/main/deploy.sh

# 給予執行權限
chmod +x deploy.sh

# 執行部署
bash deploy.sh
```

### 2. 第一次執行會停下來讓您配置

腳本會提示您編輯 `.env` 檔案。執行：
```bash
nano /opt/brand-material-downloader/.env
```

### 3. 填入以下配置：

```bash
# 必填項目：
DATABASE_URL=mysql://...  # 請聯繫我獲取
JWT_SECRET=隨機字串       # 用以下指令生成
XILING_EMAIL=您的小靈素材帳號
XILING_PASSWORD=您的小靈素材密碼
```

### 4. 生成 JWT_SECRET
按 `Ctrl+X` 退出 nano，然後執行：
```bash
openssl rand -hex 32
```
複製輸出的字串，再次編輯 .env，貼到 `JWT_SECRET=` 後面。

### 5. 保存並退出
- 按 `Ctrl+X`
- 按 `Y` 確認保存
- 按 `Enter`

### 6. 再次執行部署：
```bash
bash deploy.sh
```

腳本會：
- ✅ 自動安裝 Docker
- ✅ 構建應用鏡像
- ✅ 啟動服務
- ✅ 顯示訪問地址

---

## ✅ 第五步：測試訪問（5 分鐘）

### 1. 在瀏覽器開啟：
```
http://您的伺服器IP
```

例如：`http://123.45.67.89`

您應該看到您的素材代下平台！

### 2. 測試流程：
1. 提交一個測試素材連結
2. 輸入測試卡密
3. 等待結果

---

## 🌐 第六步（可選）：綁定域名

### 如果您有域名：

1. **在域名服務商（如 GoDaddy、Namecheap）添加 A 記錄：**
   - Type: A
   - Name: @ （或子域名如 download）
   - Value: 您的伺服器 IP

2. **編輯 Caddyfile：**
```bash
nano /opt/brand-material-downloader/Caddyfile
```

3. **修改為：**
```
您的域名.com {
    reverse_proxy app:3000
}
```

4. **重啟服務：**
```bash
cd /opt/brand-material-downloader
docker compose restart caddy
```

5. **等待 1-2 分鐘**，Caddy 會自動申請 SSL 證書，然後您就能用 `https://您的域名.com` 訪問了！

---

## 🛠️ 常用維護指令

### 查看日誌：
```bash
cd /opt/brand-material-downloader
docker compose logs -f app
```

### 重啟服務：
```bash
docker compose restart
```

### 更新代碼：
```bash
cd /opt/brand-material-downloader
git pull
docker compose down
docker compose up -d --build
```

### 查看狀態：
```bash
docker compose ps
```

### 停止服務：
```bash
docker compose down
```

---

## 💡 故障排除

### 問題 1：無法訪問網站
**檢查防火牆：**
```bash
ufw allow 80
ufw allow 443
ufw allow 22
```

### 問題 2：應用無法啟動
**查看詳細日誌：**
```bash
docker compose logs app
```

### 問題 3：Playwright 啟動失敗
**確認伺服器有足夠記憶體：**
```bash
free -h
```
應該至少 4GB RAM。

### 問題 4：資料庫連接失敗
**檢查 DATABASE_URL 格式：**
- 確保是 `mysql://` 開頭
- 確保用戶名、密碼、主機都正確

---

## 📞 需要幫助？

部署過程中如有任何問題，告訴我：
1. 您卡在哪一步
2. 錯誤信息（截圖或文字）
3. 您執行了什麼指令

我會立即幫您解決！

---

## 🎉 部署完成後

您將擁有：
- ✅ 24/7 運行的素材代下平台
- ✅ 自動化下載流程
- ✅ 卡密管理系統
- ✅ 訂單追蹤功能
- ✅ 隨時可擴展（升級伺服器配置即可）

**月費：約 USD $8.21（HK$64）**

開始接單賺錢吧！💰
