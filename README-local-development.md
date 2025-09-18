# 講師行事曆檢視 - 本地開發環境

## 📋 概述

這是一個完整的本地開發環境，讓您可以在不依賴 LINE LIFF 認證的情況下測試和開發講師行事曆檢視系統。

## 🚀 快速開始

### 方法一：使用啟動腳本（推薦）

```bash
# 給啟動腳本添加執行權限
chmod +x start_local_test.sh

# 啟動本地測試環境
./start_local_test.sh
```

### 方法二：手動啟動

```bash
# 1. 安裝依賴
pip3 install -r requirements.txt

# 2. 啟動 Flask 伺服器
python3 local_server.py

# 3. 在另一個終端執行測試
python3 test_filtering.py
```

## 📁 文件結構

```
├── perfect-calendar.html          # 主要前端文件（已修改支援本地模式）
├── public/perfect-calendar.html   # 同步版本
├── local_server.py                # 本地 Flask 伺服器
├── test_filtering.py              # 篩選功能測試腳本
├── requirements.txt               # Python 依賴
├── start_local_test.sh            # 一鍵啟動腳本
└── README-local-development.md    # 本說明文件
```

## 🌐 本地環境檢測

系統會自動檢測以下環境並跳過 LINE 認證：

- `localhost`
- `127.0.0.1`
- `0.0.0.0`
- `file://` 協議

## 🔧 功能特色

### 1. 自動環境檢測
- 自動檢測本地環境
- 跳過 LINE LIFF 認證
- 設置模擬用戶資料

### 2. 完整後端模擬
- Flask 伺服器模擬後端 API
- 生成模擬事件資料
- 支援講師篩選 API

### 3. 自動化測試
- 篩選功能自動測試
- 講師篩選驗證
- 日期和時段篩選測試

## 📊 API 端點

| 端點 | 方法 | 說明 |
|------|------|------|
| `/` | GET | 重定向到行事曆頁面 |
| `/perfect-calendar.html` | GET | 行事曆頁面 |
| `/api/health` | GET | 健康檢查 |
| `/api/debug` | GET | 調試信息 |
| `/api/events` | GET | 獲取所有事件 |
| `/api/events/<instructor>` | GET | 根據講師獲取事件 |
| `/api/teachers` | GET | 獲取講師列表 |

## 🧪 測試功能

### 自動測試項目
1. **API 健康檢查** - 驗證伺服器正常運行
2. **事件獲取** - 測試事件資料載入
3. **講師篩選** - 測試講師篩選功能
4. **日期篩選** - 測試今日事件篩選
5. **時段篩選** - 測試早上/下午/晚上篩選
6. **視圖篩選** - 測試今日/本週/本月/全部視圖

### 手動測試
1. 開啟瀏覽器訪問 `http://localhost:5000/perfect-calendar.html`
2. 測試講師選擇功能
3. 測試視圖切換功能
4. 測試各種篩選條件

## 🔍 調試功能

### 控制台日誌
- 詳細的初始化過程日誌
- 篩選過程追蹤
- 錯誤和警告提示

### 調試端點
- `http://localhost:5000/api/debug` - 查看系統狀態
- `http://localhost:5000/api/health` - 健康檢查

## 📝 開發指南

### 修改前端邏輯
1. 編輯 `perfect-calendar.html`
2. 同步修改到 `public/perfect-calendar.html`
3. 重新載入頁面測試

### 修改後端邏輯
1. 編輯 `local_server.py`
2. 重啟 Flask 伺服器
3. 執行測試腳本驗證

### 添加新的測試
1. 編輯 `test_filtering.py`
2. 添加新的測試函數
3. 在 `main()` 函數中調用

## 🐛 常見問題

### 問題1：無法連接到本地伺服器
**解決方案：**
```bash
# 檢查 Flask 伺服器是否運行
curl http://localhost:5000/api/health

# 檢查端口是否被占用
lsof -i :5000
```

### 問題2：Python 依賴安裝失敗
**解決方案：**
```bash
# 使用 pip 而不是 pip3
pip install -r requirements.txt

# 或使用虛擬環境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

### 問題3：篩選功能測試失敗
**解決方案：**
1. 檢查 Flask 伺服器是否正常運行
2. 查看控制台日誌中的錯誤信息
3. 確認模擬資料是否正確生成

## 🔄 與正式版本的差異

| 功能 | 正式版本 | 本地版本 |
|------|----------|----------|
| LINE 認證 | 必需 | 跳過 |
| 講師自動比對 | 自動執行 | 跳過 |
| 後端 API | 真實 API | 模擬 API |
| 事件資料 | 真實 CalDAV | 模擬資料 |
| 調試功能 | 基本 | 增強 |

## 📞 支援

如果在使用過程中遇到問題：

1. 查看控制台日誌
2. 檢查 Flask 伺服器狀態
3. 執行測試腳本診斷
4. 檢查瀏覽器開發者工具

---

**注意：** 這是開發測試版本，不適用於生產環境。正式版本請使用原始的 `perfect-calendar.html` 並部署到支援 LINE LIFF 的環境中。
