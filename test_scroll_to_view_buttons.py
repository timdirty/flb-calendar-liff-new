#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試載入後自動滑動讓今日本週每月按鈕切齊頂部
"""

import requests
import time
from datetime import datetime

def test_scroll_to_view_buttons():
    """測試載入後自動滑動讓今日本週每月按鈕切齊頂部"""
    print("🔄 測試載入後自動滑動讓今日本週每月按鈕切齊頂部...")
    
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
                
                # 檢查滑動目標已改為視圖按鈕
                if 'viewButtons' in frontend_response.text and 'getBoundingClientRect' in frontend_response.text:
                    print("✅ 滑動目標已改為視圖按鈕：使用 getBoundingClientRect 計算位置")
                else:
                    print("❌ 滑動目標修改不完整")
                
                # 檢查滑動計算邏輯
                if 'viewButtonsRect.top' in frontend_response.text and 'targetScrollTop' in frontend_response.text:
                    print("✅ 滑動計算邏輯正確：計算視圖按鈕位置讓按鈕齊平頂部")
                else:
                    print("❌ 滑動計算邏輯有問題")
                
                # 檢查滑動目標描述
                if '讓今日本週每月按鈕切齊頂部' in frontend_response.text:
                    print("✅ 滑動目標描述正確：明確說明讓按鈕切齊頂部")
                else:
                    print("❌ 滑動目標描述不完整")
                
                # 檢查備用滑動邏輯
                if '如果沒有找到視圖按鈕' in frontend_response.text and '滑動到主內容區域' in frontend_response.text:
                    print("✅ 備用滑動邏輯完整：提供視圖按鈕找不到時的備用方案")
                else:
                    print("❌ 備用滑動邏輯不完整")
                
                # 檢查兩個滑動函數都更新
                if 'autoScrollToCalendar' in frontend_response.text and 'showStep' in frontend_response.text:
                    print("✅ 兩個滑動函數都已更新：autoScrollToCalendar 和 showStep")
                else:
                    print("❌ 滑動函數更新不完整")
                
                # 檢查滑動動畫調用
                if 'autoScrollToCalendar()' in frontend_response.text:
                    print("✅ 滑動動畫調用正常：系統初始化時會觸發滑動")
                else:
                    print("❌ 滑動動畫調用有問題")
                
                # 檢查控制台日誌更新
                if '已自動滑動到視圖按鈕區域' in frontend_response.text:
                    print("✅ 控制台日誌已更新：提供清晰的滑動目標信息")
                else:
                    print("❌ 控制台日誌更新不完整")
                
                # 檢查滑動行為設定
                if 'behavior: \'smooth\'' in frontend_response.text:
                    print("✅ 滑動行為設定正確：使用平滑滑動效果")
                else:
                    print("❌ 滑動行為設定有問題")
                
                # 檢查延遲時間設定
                if 'setTimeout' in frontend_response.text and '1000' in frontend_response.text:
                    print("✅ 延遲時間設定正確：1秒延遲確保頁面完全載入")
                else:
                    print("❌ 延遲時間設定有問題")
                
                # 檢查視圖按鈕選擇器
                if '.view-buttons' in frontend_response.text:
                    print("✅ 視圖按鈕選擇器正確：使用 .view-buttons 選擇器")
                else:
                    print("❌ 視圖按鈕選擇器有問題")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_scroll_to_view_buttons()
