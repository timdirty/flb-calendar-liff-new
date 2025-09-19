#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試手機端滑動功能調試
"""

import requests
import time
from datetime import datetime

def test_mobile_swipe_debug():
    """測試手機端滑動功能調試"""
    print("🔄 測試手機端滑動功能調試...")
    
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
                
                # 檢查滑動功能相關函數
                functions_to_check = [
                    'setupMobileSwipeNavigation',
                    'highlightViewButton', 
                    'switchView',
                    'updateViewButtonStates',
                    'bindViewButtons',
                    'handleViewButtonClick'
                ]
                
                for func in functions_to_check:
                    if f'function {func}' in frontend_response.text:
                        print(f"✅ {func} 函數：已定義")
                    else:
                        print(f"❌ {func} 函數：未定義")
                
                # 檢查滑動功能初始化
                if 'setupMobileSwipeNavigation()' in frontend_response.text:
                    print("✅ 滑動功能初始化：已調用")
                else:
                    print("❌ 滑動功能初始化：未調用")
                
                # 檢查手機端檢測邏輯
                if 'LIFF' in frontend_response.text and 'navigator.userAgent.includes' in frontend_response.text:
                    print("✅ 手機端檢測：包含 LIFF 檢測")
                else:
                    print("❌ 手機端檢測：缺少 LIFF 檢測")
                
                # 檢查觸控事件監聽器
                if 'touchstart' in frontend_response.text and 'touchmove' in frontend_response.text and 'touchend' in frontend_response.text:
                    print("✅ 觸控事件監聽器：已添加")
                else:
                    print("❌ 觸控事件監聽器：未添加")
                
                # 檢查滑動邏輯
                if 'viewOrder' in frontend_response.text and 'currentViewIndex' in frontend_response.text:
                    print("✅ 滑動邏輯：包含視圖切換邏輯")
                else:
                    print("❌ 滑動邏輯：缺少視圖切換邏輯")
                
                # 檢查按鈕狀態更新
                if 'highlightViewButton' in frontend_response.text and 'switchView' in frontend_response.text:
                    print("✅ 按鈕狀態更新：包含高亮和切換邏輯")
                else:
                    print("❌ 按鈕狀態更新：缺少高亮和切換邏輯")
                
                # 檢查事件監聽器設置
                if 'addEventListener' in frontend_response.text and 'touchstart' in frontend_response.text:
                    print("✅ 事件監聽器設置：已添加觸控事件")
                else:
                    print("❌ 事件監聽器設置：未添加觸控事件")
                
                # 檢查滑動閾值
                if 'diffX > 50' in frontend_response.text and 'diffX < -50' in frontend_response.text:
                    print("✅ 滑動閾值：已設置滑動檢測閾值")
                else:
                    print("❌ 滑動閾值：未設置滑動檢測閾值")
                
                # 檢查滑動動畫
                if 'translateX' in frontend_response.text and 'transform' in frontend_response.text:
                    print("✅ 滑動動畫：包含視覺反饋動畫")
                else:
                    print("❌ 滑動動畫：缺少視覺反饋動畫")
                
                # 檢查函數調用順序
                if 'bindViewButtons()' in frontend_response.text and 'setupMobileSwipeNavigation()' in frontend_response.text:
                    print("✅ 函數調用順序：包含按鈕綁定和滑動設置")
                else:
                    print("❌ 函數調用順序：缺少按鈕綁定或滑動設置")
                
                # 檢查 LIFF 環境支援
                if 'navigator.userAgent.includes(\'LIFF\')' in frontend_response.text:
                    print("✅ LIFF 環境支援：已添加 LIFF 檢測")
                else:
                    print("❌ LIFF 環境支援：未添加 LIFF 檢測")
                
                # 檢查被動事件監聽器
                if 'passive: true' in frontend_response.text and 'passive: false' in frontend_response.text:
                    print("✅ 被動事件監聽器：正確設置了被動和非被動事件")
                else:
                    print("❌ 被動事件監聽器：未正確設置被動事件")
                
                # 檢查滑動功能完整性
                swipe_components = [
                    'setupMobileSwipeNavigation',
                    'highlightViewButton',
                    'switchView', 
                    'touchstart',
                    'touchmove',
                    'touchend',
                    'viewOrder',
                    'currentViewIndex'
                ]
                
                missing_components = []
                for component in swipe_components:
                    if component not in frontend_response.text:
                        missing_components.append(component)
                
                if not missing_components:
                    print("✅ 滑動功能完整性：所有組件都已包含")
                else:
                    print(f"❌ 滑動功能完整性：缺少組件 {missing_components}")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_mobile_swipe_debug()
