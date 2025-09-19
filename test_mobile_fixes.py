#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試手機版本修復效果
"""

import requests
import time
from datetime import datetime

def test_mobile_fixes():
    """測試手機版本修復效果"""
    print("📱 測試手機版本修復效果...")
    
    try:
        # 測試伺服器連接
        response = requests.get('http://localhost:5001/api/events', timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 伺服器連接成功，獲取 {len(data['data'])} 個事件")
            
            # 測試前端頁面
            print("\n🌐 測試前端頁面...")
            frontend_response = requests.get('http://localhost:5001/perfect-calendar.html', timeout=10)
            if frontend_response.status_code == 200:
                print("✅ 前端頁面載入成功")
                
                # 檢查手機版本CSS修復
                if 'height: 100vh' in frontend_response.text and 'overflow: hidden' in frontend_response.text:
                    print("✅ 找到手機版本滑動修復CSS")
                else:
                    print("❌ 沒有找到手機版本滑動修復CSS")
                
                # 檢查main-content包裝器
                if 'main-content' in frontend_response.text:
                    print("✅ 找到main-content包裝器")
                else:
                    print("❌ 沒有找到main-content包裝器")
                
                # 檢查快速篩選按鈕顯示邏輯修復
                if 'courseTypeQuickFilters.style.display = \'block\'' in frontend_response.text:
                    print("✅ 找到快速篩選按鈕顯示邏輯修復")
                else:
                    print("❌ 沒有找到快速篩選按鈕顯示邏輯修復")
                
                # 檢查預設今日模式
                if 'let currentView = \'今日\'' in frontend_response.text:
                    print("✅ 找到預設今日模式設定")
                else:
                    print("❌ 沒有找到預設今日模式設定")
                
                # 檢查重寫的快速篩選函數
                if '🚀 開始重寫課別快速篩選功能...' in frontend_response.text:
                    print("✅ 找到重寫的快速篩選函數")
                else:
                    print("❌ 沒有找到重寫的快速篩選函數")
                
                # 檢查直接的onclick處理
                if 'onclick="handleQuickFilter(' in frontend_response.text:
                    print("✅ 找到直接的onclick事件處理")
                else:
                    print("❌ 沒有找到直接的onclick事件處理")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_mobile_fixes()
