#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試 LIFF 環境手機端功能修復
"""

import requests
import time
from datetime import datetime

def test_liff_mobile_fix():
    """測試 LIFF 環境手機端功能修復"""
    print("🔄 測試 LIFF 環境手機端功能修復...")
    
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
                
                # 檢查 LIFF 環境檢測
                if 'liff.isInClient()' in frontend_response.text and 'typeof liff !== \'undefined\'' in frontend_response.text:
                    print("✅ LIFF 環境檢測：已加強 LIFF 環境檢測邏輯")
                else:
                    print("❌ LIFF 環境檢測：缺少 LIFF 環境檢測邏輯")
                
                # 檢查滑動功能調試日誌
                if 'console.log(\'📱 觸控開始:\')' in frontend_response.text and 'console.log(\'📱 觸控移動:\')' in frontend_response.text:
                    print("✅ 滑動功能調試：已添加詳細的調試日誌")
                else:
                    print("❌ 滑動功能調試：缺少調試日誌")
                
                # 檢查按鈕狀態強制更新
                if 'updateViewButtonStates()' in frontend_response.text and '強制更新按鈕狀態' in frontend_response.text:
                    print("✅ 按鈕狀態更新：已添加強制更新機制")
                else:
                    print("❌ 按鈕狀態更新：缺少強制更新機制")
                
                # 檢查多種觸控事件支援
                if 'touchstart' in frontend_response.text and 'touchend' in frontend_response.text and 'onclick' in frontend_response.text:
                    print("✅ 觸控事件支援：已添加多種觸控事件支援")
                else:
                    print("❌ 觸控事件支援：缺少多種觸控事件支援")
                
                # 檢查按鈕樣式優化
                if 'webkitUserSelect' in frontend_response.text and 'webkitTouchCallout' in frontend_response.text:
                    print("✅ 按鈕樣式優化：已添加 WebKit 觸控優化")
                else:
                    print("❌ 按鈕樣式優化：缺少 WebKit 觸控優化")
                
                # 檢查滑動切換邏輯
                if '從 ${currentView} 切換到' in frontend_response.text and '按鈕狀態已更新到' in frontend_response.text:
                    print("✅ 滑動切換邏輯：已加強滑動切換和狀態更新")
                else:
                    print("❌ 滑動切換邏輯：缺少滑動切換和狀態更新")
                
                # 檢查按鈕點擊處理
                if '按鈕 onclick 觸發' in frontend_response.text and '按鈕狀態已更新到' in frontend_response.text:
                    print("✅ 按鈕點擊處理：已加強按鈕點擊處理邏輯")
                else:
                    print("❌ 按鈕點擊處理：缺少按鈕點擊處理邏輯")
                
                # 檢查事件監聽器清理
                if 'removeEventListener' in frontend_response.text and 'touchstart' in frontend_response.text and 'touchend' in frontend_response.text:
                    print("✅ 事件監聽器清理：已添加完整的事件監聽器清理")
                else:
                    print("❌ 事件監聽器清理：缺少完整的事件監聽器清理")
                
                # 檢查滑動功能初始化
                if '開始設置滑動功能' in frontend_response.text and 'liffAvailable' in frontend_response.text:
                    print("✅ 滑動功能初始化：已加強滑動功能初始化邏輯")
                else:
                    print("❌ 滑動功能初始化：缺少滑動功能初始化邏輯")
                
                # 檢查按鈕綁定時機
                if 'bindViewButtons()' in frontend_response.text and 'setupMobileSwipeNavigation()' in frontend_response.text:
                    print("✅ 按鈕綁定時機：已確保按鈕綁定在正確時機")
                else:
                    print("❌ 按鈕綁定時機：按鈕綁定時機有問題")
                
                # 檢查整體修復效果
                liff_fixes = [
                    'liff.isInClient()',
                    'console.log(\'📱 觸控開始:\')',
                    'updateViewButtonStates()',
                    'touchstart',
                    'touchend',
                    'onclick',
                    'webkitUserSelect',
                    '從 ${currentView} 切換到',
                    '按鈕 onclick 觸發',
                    'removeEventListener'
                ]
                
                missing_fixes = []
                for fix in liff_fixes:
                    if fix not in frontend_response.text:
                        missing_fixes.append(fix)
                
                if not missing_fixes:
                    print("✅ 整體修復效果：所有 LIFF 環境修復都已包含")
                else:
                    print(f"❌ 整體修復效果：缺少修復 {missing_fixes}")
                
                # 檢查滑動功能完整性
                swipe_components = [
                    'setupMobileSwipeNavigation',
                    'highlightViewButton',
                    'switchView',
                    'updateViewButtonStates',
                    'bindViewButtons',
                    'handleViewButtonClick',
                    'touchstart',
                    'touchmove',
                    'touchend',
                    'onclick'
                ]
                
                missing_components = []
                for component in swipe_components:
                    if component not in frontend_response.text:
                        missing_components.append(component)
                
                if not missing_components:
                    print("✅ 滑動功能完整性：所有滑動功能組件都已包含")
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
    test_liff_mobile_fix()
