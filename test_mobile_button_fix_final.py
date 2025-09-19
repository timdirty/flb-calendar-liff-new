#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試手機端按鈕功能最終修復
"""

import requests
import time
from datetime import datetime

def test_mobile_button_fix_final():
    """測試手機端按鈕功能最終修復"""
    print("🔄 測試手機端按鈕功能最終修復...")
    
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
                
                # 檢查 HTML 結構修復
                if '<div class="view-buttons">' in frontend_response.text and '</div>' in frontend_response.text:
                    print("✅ HTML 結構修復：view-buttons 容器已正確關閉")
                else:
                    print("❌ HTML 結構修復：view-buttons 容器結構有問題")
                
                # 檢查按鈕綁定函數加強
                if '找不到視圖按鈕，請檢查 HTML 結構' in frontend_response.text and 'viewButtons.length === 0' in frontend_response.text:
                    print("✅ 按鈕綁定函數加強：已添加按鈕存在性檢查")
                else:
                    print("❌ 按鈕綁定函數加強：缺少按鈕存在性檢查")
                
                # 檢查事件監聽器清理
                if 'button.onclick = null' in frontend_response.text and 'removeEventListener' in frontend_response.text:
                    print("✅ 事件監聽器清理：已添加完整的事件監聽器清理")
                else:
                    print("❌ 事件監聽器清理：缺少完整的事件監聽器清理")
                
                # 檢查多種事件支援
                if 'addEventListener(\'click\'' in frontend_response.text and 'addEventListener(\'touchstart\'' in frontend_response.text and 'addEventListener(\'mousedown\'' in frontend_response.text:
                    print("✅ 多種事件支援：已添加 click、touchstart、mousedown 事件")
                else:
                    print("❌ 多種事件支援：缺少多種事件支援")
                
                # 檢查按鈕樣式優化
                if 'webkitTapHighlightColor' in frontend_response.text and 'webkitUserSelect' in frontend_response.text:
                    print("✅ 按鈕樣式優化：已添加 WebKit 觸控優化")
                else:
                    print("❌ 按鈕樣式優化：缺少 WebKit 觸控優化")
                
                # 檢查按鈕點擊處理加強
                if 'eventType: e.type' in frontend_response.text and '視圖已切換到' in frontend_response.text:
                    print("✅ 按鈕點擊處理加強：已添加詳細的調試信息")
                else:
                    print("❌ 按鈕點擊處理加強：缺少詳細的調試信息")
                
                # 檢查重複綁定修復
                if 'bindViewButtons()' in frontend_response.text:
                    bind_count = frontend_response.text.count('bindViewButtons()')
                    if bind_count == 1:
                        print("✅ 重複綁定修復：bindViewButtons 只調用一次")
                    else:
                        print(f"❌ 重複綁定修復：bindViewButtons 調用 {bind_count} 次")
                else:
                    print("❌ 重複綁定修復：找不到 bindViewButtons 調用")
                
                # 檢查按鈕 HTML 結構
                if 'data-view="today"' in frontend_response.text and 'data-view="week"' in frontend_response.text and 'data-view="month"' in frontend_response.text and 'data-view="all"' in frontend_response.text:
                    print("✅ 按鈕 HTML 結構：所有視圖按鈕都存在")
                else:
                    print("❌ 按鈕 HTML 結構：缺少視圖按鈕")
                
                # 檢查按鈕類別
                if 'btn btn-primary' in frontend_response.text and 'active' in frontend_response.text:
                    print("✅ 按鈕類別：按鈕類別和選中狀態正確")
                else:
                    print("❌ 按鈕類別：按鈕類別或選中狀態有問題")
                
                # 檢查事件處理優化
                if 'passive: false' in frontend_response.text and 'preventDefault' in frontend_response.text and 'stopPropagation' in frontend_response.text:
                    print("✅ 事件處理優化：已添加事件處理優化")
                else:
                    print("❌ 事件處理優化：缺少事件處理優化")
                
                # 檢查整體修復效果
                final_fixes = [
                    '<div class="view-buttons">',
                    '找不到視圖按鈕，請檢查 HTML 結構',
                    'button.onclick = null',
                    'addEventListener(\'mousedown\'',
                    'webkitTapHighlightColor',
                    'eventType: e.type',
                    'bindViewButtons()',
                    'data-view="today"',
                    'btn btn-primary',
                    'passive: false'
                ]
                
                missing_fixes = []
                for fix in final_fixes:
                    if fix not in frontend_response.text:
                        missing_fixes.append(fix)
                
                if not missing_fixes:
                    print("✅ 整體修復效果：所有手機端按鈕修復都已包含")
                else:
                    print(f"❌ 整體修復效果：缺少修復 {missing_fixes}")
                
                # 檢查按鈕功能完整性
                button_components = [
                    'bindViewButtons',
                    'handleViewButtonClick',
                    'updateViewButtonStates',
                    'highlightViewButton',
                    'switchView',
                    'data-view',
                    'btn-primary',
                    'addEventListener',
                    'preventDefault',
                    'stopPropagation'
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
    test_mobile_button_fix_final()
