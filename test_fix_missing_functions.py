#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試缺失函數已修復
"""

import requests
import time
from datetime import datetime

def test_fix_missing_functions():
    """測試缺失函數已修復"""
    print("🔄 測試缺失函數已修復...")
    
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
                
                # 檢查 renderEvents 函數已恢復
                if 'function renderEvents()' in frontend_response.text:
                    print("✅ renderEvents 函數已恢復")
                else:
                    print("❌ renderEvents 函數仍然缺失")
                
                # 檢查 showError 函數已恢復
                if 'function showError(' in frontend_response.text:
                    print("✅ showError 函數已恢復")
                else:
                    print("❌ showError 函數仍然缺失")
                
                # 檢查 createEventCard 函數已恢復
                if 'function createEventCard(' in frontend_response.text:
                    print("✅ createEventCard 函數已恢復")
                else:
                    print("❌ createEventCard 函數仍然缺失")
                
                # 檢查主要視圖按鈕仍然存在
                if '今日' in frontend_response.text and '本週' in frontend_response.text and '本月' in frontend_response.text and '全部' in frontend_response.text:
                    print("✅ 主要視圖按鈕仍然存在")
                else:
                    print("❌ 主要視圖按鈕缺失")
                
                # 檢查篩選區域仍然存在
                if 'control-section' in frontend_response.text:
                    print("✅ 篩選區域仍然存在")
                else:
                    print("❌ 篩選區域缺失")
                
                # 檢查沒有快速篩選相關代碼
                if 'quick-filter' not in frontend_response.text:
                    print("✅ 快速篩選相關代碼已完全移除")
                else:
                    print("❌ 快速篩選相關代碼仍然存在")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_fix_missing_functions()
