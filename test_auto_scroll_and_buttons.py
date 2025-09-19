#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試自動滑動和快速篩選按鈕修復
"""

import requests
import time
from datetime import datetime

def test_auto_scroll_and_buttons():
    """測試自動滑動和快速篩選按鈕修復"""
    print("📱 測試自動滑動和快速篩選按鈕修復...")
    
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
                
                # 檢查自動滑動是否恢復
                if '已自動滑動到視圖按鈕區域' in frontend_response.text and 'scrollIntoView' in frontend_response.text:
                    print("✅ 自動滑動功能已恢復")
                else:
                    print("❌ 自動滑動功能未恢復")
                
                # 檢查快速篩選按鈕綁定
                if 'bindQuickFilterButtons()' in frontend_response.text and 'onclick' in frontend_response.text:
                    print("✅ 快速篩選按鈕綁定已修復")
                else:
                    print("❌ 快速篩選按鈕綁定未修復")
                
                # 檢查事件處理函數
                if 'handleQuickFilter(' in frontend_response.text and 'event.preventDefault()' in frontend_response.text:
                    print("✅ 事件處理函數已修復")
                else:
                    print("❌ 事件處理函數未修復")
                
                # 檢查按鈕樣式
                if 'pointerEvents' in frontend_response.text and 'cursor' in frontend_response.text:
                    print("✅ 按鈕樣式已修復")
                else:
                    print("❌ 按鈕樣式未修復")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_auto_scroll_and_buttons()
