#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試滑動後按鈕修復功能
"""

import requests
import time
from datetime import datetime

def test_swipe_button_fix():
    """測試滑動後按鈕修復功能"""
    print("🔄 測試滑動後按鈕修復功能...")
    
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
                
                # 檢查滑動事件優化
                if '觸控按鈕，跳過滑動處理' in frontend_response.text:
                    print("✅ 滑動事件優化：已添加按鈕區域跳過邏輯")
                else:
                    print("❌ 滑動事件優化：缺少按鈕區域跳過邏輯")
                
                # 檢查 preventDefault 優化
                if '只在確認是滑動時才阻止默認行為' in frontend_response.text and 'if (Math.abs(diffX) > 50)' in frontend_response.text:
                    print("✅ preventDefault 優化：已優化 preventDefault 調用時機")
                else:
                    print("❌ preventDefault 優化：缺少 preventDefault 優化")
                
                # 檢查滑動後按鈕重新綁定
                if '滑動結束後重新綁定按鈕' in frontend_response.text and '非滑動操作後重新綁定按鈕' in frontend_response.text:
                    print("✅ 滑動後按鈕重新綁定：已添加滑動後按鈕重新綁定邏輯")
                else:
                    print("❌ 滑動後按鈕重新綁定：缺少滑動後按鈕重新綁定邏輯")
                
                # 檢查按鈕區域檢測
                if 'e.target.closest(\'.view-buttons .btn-primary\')' in frontend_response.text:
                    print("✅ 按鈕區域檢測：已添加按鈕區域檢測邏輯")
                else:
                    print("❌ 按鈕區域檢測：缺少按鈕區域檢測邏輯")
                
                # 檢查滑動切換後按鈕綁定
                if '按鈕狀態已更新到' in frontend_response.text and '重新綁定按鈕' in frontend_response.text:
                    print("✅ 滑動切換後按鈕綁定：已添加滑動切換後按鈕綁定邏輯")
                else:
                    print("❌ 滑動切換後按鈕綁定：缺少滑動切換後按鈕綁定邏輯")
                
                # 檢查整體修復效果
                swipe_fixes = [
                    '觸控按鈕，跳過滑動處理',
                    '只在確認是滑動時才阻止默認行為',
                    '滑動結束後重新綁定按鈕',
                    '非滑動操作後重新綁定按鈕',
                    'e.target.closest(\'.view-buttons .btn-primary\')',
                    '按鈕狀態已更新到',
                    '重新綁定按鈕'
                ]
                
                missing_fixes = []
                for fix in swipe_fixes:
                    if fix not in frontend_response.text:
                        missing_fixes.append(fix)
                
                if not missing_fixes:
                    print("✅ 整體修復效果：所有滑動後按鈕修復都已包含")
                else:
                    print(f"❌ 整體修復效果：缺少修復 {missing_fixes}")
                
                # 檢查滑動功能完整性
                swipe_components = [
                    'touchstart',
                    'touchmove',
                    'touchend',
                    'preventDefault',
                    'bindViewButtons',
                    'updateViewButtonStates',
                    'switchView',
                    'highlightViewButton'
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
    test_swipe_button_fix()
