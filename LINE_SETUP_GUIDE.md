# LINE 通知設定指南

## 概述
本系統已整合LINE通知功能，會在學生簽到時自動發送通知給管理員Tim和相關講師。

## 已完成的設定
- ✅ LINE Channel Access Token 已設定
- ✅ 通知API端點已建立
- ✅ 前端通知邏輯已實現
- ✅ 通知格式已按照要求設計

## 需要完成的設定

### 1. 獲取Tim的LINE用戶ID

要讓通知發送給Tim，需要獲取Tim的LINE用戶ID。有幾種方法：

#### 方法一：通過LINE Bot測試
1. 讓Tim加你的LINE Bot為好友
2. 發送一條測試訊息給Bot
3. 在Bot的webhook中查看用戶ID

#### 方法二：通過現有的LINE Bot
如果你已經有LINE Bot，可以：
1. 讓Tim發送訊息給Bot
2. 在Bot的後台查看用戶ID
3. 用戶ID格式類似：`U1234567890abcdef1234567890abcdef1`

### 2. 更新環境變數

在Railway或本地環境中設定：

```bash
# 設定Tim的LINE用戶ID
LINE_USER_ID=Tim的實際LINE用戶ID

# 或者直接在server.js中修改
const LINE_USER_ID = 'Tim的實際LINE用戶ID';
```

### 3. 測試通知功能

#### 本地測試
```bash
# 啟動服務器
node server.js

# 訪問測試頁面
http://localhost:3000/test-notification.html
```

#### 測試API
```bash
curl -X POST http://localhost:3000/api/student-attendance-notification \
  -H "Content-Type: application/json" \
  -d '{
    "message": "測試通知",
    "teacherName": "Ted",
    "courseName": "SPM",
    "presentStudents": ["學生1"],
    "absentStudents": [],
    "unmarkedStudents": []
  }'
```

## 通知格式

系統會發送以下格式的通知：

```
📚 學生簽到通知

👨‍🏫 講師：Ted
📖 課程：SPM
📅 日期：2025/9/21

✅ 出席 (1人)：
Essie

⏳ 未選擇 (1人)：
Luna

⏰ 簽到時間：2025/9/21 上午10:33:16
```

## 功能特點

1. **自動觸發**：學生簽到後3秒自動發送通知
2. **智能分類**：自動統計出席/缺席/未選擇的學生
3. **防重複**：每次簽到只發送一次通知
4. **多目標**：同時發送給管理員和講師
5. **錯誤處理**：發送失敗時會顯示錯誤訊息

## 故障排除

### 常見問題

1. **"LINE Channel Access Token 未設定"**
   - 檢查環境變數是否正確設定
   - 確認Token格式正確

2. **"沒有有效的發送目標"**
   - 檢查LINE_USER_ID是否設定
   - 確認用戶ID格式正確

3. **"所有通知發送失敗"**
   - 檢查用戶ID是否有效
   - 確認用戶已加Bot為好友
   - 檢查Token權限

### 日誌檢查

查看服務器日誌：
```bash
# 本地運行時查看控制台輸出
node server.js

# 或查看Railway日誌
railway logs
```

## 下一步

1. 獲取Tim的LINE用戶ID
2. 更新環境變數
3. 測試通知功能
4. 部署到生產環境

完成這些步驟後，學生簽到系統就會自動發送通知給Tim了！
