#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試快速篩選功能已完全移除
"""

import requests
import time
from datetime import datetime

def test_remove_quick_filter():
    """測試快速篩選功能已完全移除"""
    print("🔄 測試快速篩選功能已完全移除...")
    
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
                
                # 檢查快速篩選HTML已移除
                if 'quick-filters' not in frontend_response.text:
                    print("✅ 快速篩選HTML已移除")
                else:
                    print("❌ 快速篩選HTML仍然存在")
                
                # 檢查快速篩選CSS已移除
                if 'quick-filter-btn' not in frontend_response.text:
                    print("✅ 快速篩選CSS已移除")
                else:
                    print("❌ 快速篩選CSS仍然存在")
                
                # 檢查快速篩選JavaScript函數已移除
                if 'updateTodayQuickFilters' not in frontend_response.text:
                    print("✅ 快速篩選JavaScript函數已移除")
                else:
                    print("❌ 快速篩選JavaScript函數仍然存在")
                
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
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_remove_quick_filter()
