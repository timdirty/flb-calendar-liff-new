# 🧪 講師報表系統自動化測試指南

## 概述

本系統提供了完整的自動化測試功能，用於驗證講師報表系統的各個組件是否正常工作。

## 測試類型

### 1. 快速測試 (Quick Test)
- **文件**: `quick-test-teacher-report.js`
- **用途**: 快速驗證核心功能
- **時間**: 約 2-3 分鐘
- **特點**: 無頭模式，快速執行

### 2. 完整測試 (Full Test)
- **文件**: `test-teacher-report-automation.js`
- **用途**: 全面測試所有功能
- **時間**: 約 5-10 分鐘
- **特點**: 包含截圖、詳細報告、視覺化測試

## 使用方法

### 方法 1: 使用 npm 腳本

```bash
# 快速測試
npm test
# 或
npm run test:quick

# 完整測試
npm run test:full

# 使用測試腳本
npm run test:run
```

### 方法 2: 直接運行腳本

```bash
# 快速測試
node quick-test-teacher-report.js

# 完整測試
node test-teacher-report-automation.js

# 使用測試啟動腳本
./run-tests.sh quick    # 快速測試
./run-tests.sh full     # 完整測試
```

## 測試內容

### 後端 API 測試
- ✅ 後端 API 健康檢查
- ✅ 講師 Web API 獲取功能
- ✅ 講師報表提交功能
- ✅ 錯誤處理和回應格式

### 前端功能測試
- ✅ 頁面載入和渲染
- ✅ 長按觸控功能
- ✅ 講師簽到切換
- ✅ 講師報表表單填寫和提交
- ✅ 學生簽到切換
- ✅ 響應式設計（手機、平板、桌面）

### 整合測試
- ✅ 前後端 API 整合
- ✅ 資料流轉和狀態管理
- ✅ 錯誤處理和備用方案
- ✅ 用戶體驗流程

## 測試報告

### 快速測試報告
- 控制台輸出測試結果
- 顯示通過/失敗統計
- 列出失敗的測試項目

### 完整測試報告
- 生成 JSON 格式詳細報告
- 生成 HTML 視覺化報告
- 包含測試截圖
- 記錄所有測試步驟和結果

## 測試環境要求

### 系統要求
- Node.js >= 18.0.0
- npm >= 8.0.0
- 足夠的磁碟空間（用於截圖和報告）

### 依賴套件
```bash
npm install puppeteer
```

### 服務器要求
- 後端服務器必須在 `http://localhost:3000` 運行
- 所有 API 端點必須可訪問
- 資料庫連接正常

## 故障排除

### 常見問題

1. **服務器未運行**
   ```
   ❌ 服務器未運行，請先啟動服務器
   ```
   **解決方案**: 運行 `npm start` 或 `node server.js`

2. **Puppeteer 安裝失敗**
   ```
   ❌ Puppeteer 安裝失敗
   ```
   **解決方案**: 運行 `npm install puppeteer`

3. **測試超時**
   ```
   ❌ 測試超時
   ```
   **解決方案**: 檢查網絡連接和服務器響應時間

4. **元素找不到**
   ```
   ❌ 找不到課程卡片
   ```
   **解決方案**: 檢查頁面是否完全載入，或調整等待時間

### 調試模式

要啟用調試模式，修改測試配置：

```javascript
const TEST_CONFIG = {
    headless: false,  // 顯示瀏覽器窗口
    slowMo: 2000,    // 增加操作間隔
    timeout: 60000   // 增加超時時間
};
```

## 持續整合

### GitHub Actions 範例

```yaml
name: Automated Testing
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm start &
      - run: sleep 10
      - run: npm test
```

## 測試最佳實踐

1. **定期運行測試**: 每次代碼變更後運行快速測試
2. **完整測試**: 發布前運行完整測試
3. **監控測試結果**: 關注測試通過率和失敗原因
4. **更新測試**: 當功能變更時更新測試用例
5. **保持測試獨立**: 每個測試應該可以獨立運行

## 支援

如果遇到測試問題，請檢查：

1. 服務器日誌
2. 測試報告中的錯誤訊息
3. 瀏覽器控制台輸出
4. 網絡連接狀態

## 更新日誌

- **v1.0.0**: 初始版本，包含基本測試功能
- **v1.1.0**: 添加響應式設計測試
- **v1.2.0**: 添加講師報表提交測試
- **v1.3.0**: 添加自動化測試腳本和報告生成
