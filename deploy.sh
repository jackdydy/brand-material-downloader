#!/bin/bash
# ===================================
# Hetzner 一鍵部署腳本
# ===================================
# 在 Hetzner 伺服器上執行此腳本即可完成部署
# 使用方法: bash deploy.sh

set -e

echo "========================================="
echo "🚀 素材代下平台 - 一鍵部署腳本"
echo "========================================="

# 1. 檢查並安裝 Docker
if ! command -v docker &> /dev/null; then
    echo "📦 安裝 Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# 2. 檢查並安裝 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "📦 安裝 Docker Compose..."
    apt-get update && apt-get install -y docker-compose-plugin
fi

# 3. 檢查 Git
if ! command -v git &> /dev/null; then
    echo "📦 安裝 Git..."
    apt-get install -y git
fi

# 4. 克隆或更新代碼
PROJECT_DIR="/opt/brand-material-downloader"
if [ ! -d "$PROJECT_DIR" ]; then
    echo "📥 克隆代碼..."
    git clone https://github.com/jackdydy/brand-material-downloader.git $PROJECT_DIR
else
    echo "🔄 更新代碼..."
    cd $PROJECT_DIR && git pull
fi

cd $PROJECT_DIR

# 5. 創建 .env 檔案（如果不存在）
if [ ! -f ".env" ]; then
    echo "⚙️  創建 .env 檔案..."
    cp env-template.txt .env
    echo ""
    echo "⚠️  請編輯 .env 檔案填入您的配置："
    echo "    nano .env"
    echo ""
    echo "編輯完成後，再次執行此腳本即可完成部署"
    exit 0
fi

# 6. 構建並啟動服務
echo "🔨 構建 Docker 鏡像..."
docker compose build

echo "🚀 啟動服務..."
docker compose up -d

# 7. 顯示狀態
sleep 5
echo ""
echo "========================================="
echo "✅ 部署完成！"
echo "========================================="
echo ""
echo "📊 服務狀態:"
docker compose ps
echo ""
echo "📝 查看日誌:"
echo "    docker compose logs -f app"
echo ""
echo "🌐 訪問您的網站:"
SERVER_IP=$(curl -s ifconfig.me)
echo "    http://$SERVER_IP"
echo ""
echo "💡 提示: 如果要使用域名 + HTTPS，請編輯 Caddyfile"
echo "========================================="
