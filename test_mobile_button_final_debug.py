#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試手機端按鈕功能最終調試
"""

import requests
import time
from datetime import datetime

def test_mobile_button_final_debug():
    """測試手機端按鈕功能最終調試"""
    print("🔄 測試手機端按鈕功能最終調試...")
    
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
                
                # 檢查調試日誌加強
                if 'console.log(\'🔗 開始綁定視圖按鈕...\')' in frontend_response.text:
                    print("✅ 調試日誌加強：已添加詳細的綁定調試日誌")
                else:
                    print("❌ 調試日誌加強：缺少綁定調試日誌")
                
                if 'console.log(\'🎯 handleViewButtonClick 被調用\')' in frontend_response.text:
                    print("✅ 點擊處理調試：已添加詳細的點擊處理調試日誌")
                else:
                    print("❌ 點擊處理調試：缺少點擊處理調試日誌")
                
                # 檢查按鈕綁定加強
                if 'onclick = function(e)' in frontend_response.text and 'addEventListener(\'click\'' in frontend_response.text:
                    print("✅ 按鈕綁定加強：已添加 onclick 和 addEventListener 雙重綁定")
                else:
                    print("❌ 按鈕綁定加強：缺少雙重綁定")
                
                # 檢查按鈕樣式加強
                if 'position: \'relative\'' in frontend_response.text and 'zIndex: \'10\'' in frontend_response.text:
                    print("✅ 按鈕樣式加強：已添加 position 和 zIndex 樣式")
                else:
                    print("❌ 按鈕樣式加強：缺少 position 和 zIndex 樣式")
                
                # 檢查延遲綁定
                if '延遲綁定按鈕（手機端確保）' in frontend_response.text and 'setTimeout(() => {' in frontend_response.text:
                    print("✅ 延遲綁定：已添加延遲綁定機制")
                else:
                    print("❌ 延遲綁定：缺少延遲綁定機制")
                
                # 檢查事件清理加強
                if 'removeEventListener(\'mousedown\'' in frontend_response.text and 'button.onclick = null' in frontend_response.text:
                    print("✅ 事件清理加強：已添加完整的事件清理")
                else:
                    print("❌ 事件清理加強：缺少完整的事件清理")
                
                # 檢查觸控事件加強
                if 'touchstart 觸發' in frontend_response.text and 'touchend 觸發' in frontend_response.text:
                    print("✅ 觸控事件加強：已添加觸控事件調試日誌")
                else:
                    print("❌ 觸控事件加強：缺少觸控事件調試日誌")
                
                # 檢查按鈕選擇器檢查
                if 'view-buttons 容器存在，但沒有按鈕' in frontend_response.text and '容器內容:' in frontend_response.text:
                    print("✅ 按鈕選擇器檢查：已添加 DOM 結構檢查")
                else:
                    print("❌ 按鈕選擇器檢查：缺少 DOM 結構檢查")
                
                # 檢查點擊處理加強
                if 'buttonText: this.textContent' in frontend_response.text and 'buttonClass: this.className' in frontend_response.text:
                    print("✅ 點擊處理加強：已添加詳細的按鈕信息調試")
                else:
                    print("❌ 點擊處理加強：缺少按鈕信息調試")
                
                # 檢查綁定時機
                if '系統初始化完成，開始綁定按鈕' in frontend_response.text and '延遲綁定按鈕（手機端確保）' in frontend_response.text:
                    print("✅ 綁定時機：已添加多個綁定時機")
                else:
                    print("❌ 綁定時機：缺少多個綁定時機")
                
                # 檢查整體修復效果
                final_fixes = [
                    'console.log(\'🔗 開始綁定視圖按鈕...\')',
                    'console.log(\'🎯 handleViewButtonClick 被調用\')',
                    'onclick = function(e)',
                    'addEventListener(\'click\'',
                    'position: \'relative\'',
                    'zIndex: \'10\'',
                    '延遲綁定按鈕（手機端確保）',
                    'removeEventListener(\'mousedown\'',
                    'touchstart 觸發',
                    'view-buttons 容器存在，但沒有按鈕',
                    'buttonText: this.textContent',
                    '系統初始化完成，開始綁定按鈕'
                ]
                
                missing_fixes = []
                for fix in final_fixes:
                    if fix not in frontend_response.text:
                        missing_fixes.append(fix)
                
                if not missing_fixes:
                    print("✅ 整體修復效果：所有手機端按鈕最終修復都已包含")
                else:
                    print(f"❌ 整體修復效果：缺少修復 {missing_fixes}")
                
                # 檢查按鈕功能完整性
                button_components = [
                    'bindViewButtons',
                    'handleViewButtonClick',
                    'onclick',
                    'addEventListener',
                    'touchstart',
                    'touchend',
                    'mousedown',
                    'preventDefault',
                    'stopPropagation',
                    'console.log',
                    'setTimeout',
                    'updateViewButtonStates'
                ]
                
                missing_components = []
                for component in button_components:
                    if component not in frontend_response.text:
                        missing_components.append(component)
                
                if not missing_components:
                    print("✅ 按鈕功能完整性：所有按鈕功能組件都已包含")
                else:
                    print(f"❌ 按鈕功能完整性：缺少組件 {missing_components}")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_mobile_button_final_debug()
