# LINE LIFF 設定指南

## 問題說明
目前系統無法獲取LINE用戶ID，是因為缺少正確的LIFF ID配置。

## 解決步驟

### 1. 創建LINE LIFF應用
1. 前往 [LINE Developers Console](https://developers.line.biz/)
2. 登入您的LINE帳號
3. 選擇或創建一個Provider
4. 創建一個新的Channel，選擇「LINE Login」
5. 在Channel設定中，找到「LIFF」選項
6. 點擊「Add」創建新的LIFF應用

### 2. 設定LIFF應用
- **LIFF app name**: FLB講師行事曆檢視
- **Size**: Full
- **Endpoint URL**: `https://flb-calendar-liff-production.up.railway.app/perfect-calendar.html`
- **Scope**: 
  - `profile` (獲取用戶基本資料)
  - `openid` (獲取用戶ID)

### 3. 獲取LIFF ID
創建完成後，您會得到一個LIFF ID，格式類似：`2000000000-XXXXXXXXX`

### 4. 更新代碼
將獲取到的LIFF ID替換到 `perfect-calendar.html` 中的這一行：
```javascript
liffId: '2000000000-XXXXXXXXX', // 請替換為您的LIFF ID
```

### 5. 測試流程
1. 在LINE中打開應用
2. 點擊「綁定帳號」按鈕
3. LINE會跳出授權確認對話框
4. 用戶同意後，系統會自動獲取用戶資料

## 注意事項
- LIFF ID必須正確配置才能觸發授權流程
- 授權流程只會在LINE應用中生效
- 在一般瀏覽器中會顯示「請在LINE應用程式中開啟此頁面」

## 目前狀態
- ✅ LIFF SDK已載入
- ✅ 授權流程代碼已準備
- ❌ 需要正確的LIFF ID
- ❌ 需要LINE Developers Console設定
