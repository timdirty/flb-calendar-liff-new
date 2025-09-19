#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試 iOS Safari 按鈕功能修復
"""

import requests
import time
from datetime import datetime

def test_ios_safari_fix():
    """測試 iOS Safari 按鈕功能修復"""
    print("🔄 測試 iOS Safari 按鈕功能修復...")
    
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
                
                # 檢查 iOS 設備檢測
                if 'isIOS = /iPad|iPhone|iPod/.test(userAgent)' in frontend_response.text and 'isSafari = /Safari/.test(userAgent)' in frontend_response.text:
                    print("✅ iOS 設備檢測：已添加 iOS 和 Safari 檢測邏輯")
                else:
                    print("❌ iOS 設備檢測：缺少 iOS 和 Safari 檢測邏輯")
                
                # 檢查 iOS 特殊樣式設置
                if 'minHeight = \'44px\'' in frontend_response.text and 'iOS 最小觸控區域' in frontend_response.text:
                    print("✅ iOS 特殊樣式：已添加 iOS 最小觸控區域設置")
                else:
                    print("❌ iOS 特殊樣式：缺少 iOS 最小觸控區域設置")
                
                # 檢查 iOS 觸控優化
                if 'button.style.webkitAppearance = \'none\'' in frontend_response.text and 'button.style.appearance = \'none\'' in frontend_response.text:
                    print("✅ iOS 觸控優化：已添加 WebKit 外觀重置")
                else:
                    print("❌ iOS 觸控優化：缺少 WebKit 外觀重置")
                
                # 檢查 iOS 特殊事件處理
                if 'iOS Safari 主要方案：touchstart + touchend' in frontend_response.text and 'iOS Safari 備用方案：click' in frontend_response.text:
                    print("✅ iOS 特殊事件處理：已添加 iOS Safari 專用事件處理")
                else:
                    print("❌ iOS 特殊事件處理：缺少 iOS Safari 專用事件處理")
                
                # 檢查 iOS 強制重新綁定
                if 'iOS Safari 強制重新綁定按鈕' in frontend_response.text and 'setTimeout(() => {' in frontend_response.text:
                    print("✅ iOS 強制重新綁定：已添加 iOS Safari 強制重新綁定機制")
                else:
                    print("❌ iOS 強制重新綁定：缺少 iOS Safari 強制重新綁定機制")
                
                # 檢查 iOS 按鈕測試函數
                if 'function testIOSButtons()' in frontend_response.text and 'iOS Safari 按鈕測試' in frontend_response.text:
                    print("✅ iOS 按鈕測試函數：已添加 iOS Safari 按鈕測試函數")
                else:
                    print("❌ iOS 按鈕測試函數：缺少 iOS Safari 按鈕測試函數")
                
                # 檢查 iOS 樣式設置
                if 'button.style.display = \'block\'' in frontend_response.text and 'button.style.width = \'100%\'' in frontend_response.text:
                    print("✅ iOS 樣式設置：已添加 iOS 專用樣式設置")
                else:
                    print("❌ iOS 樣式設置：缺少 iOS 專用樣式設置")
                
                # 檢查 iOS 事件監聽器
                if 'iOS 按鈕 touchstart 觸發' in frontend_response.text and 'iOS 按鈕 touchend 觸發' in frontend_response.text:
                    print("✅ iOS 事件監聽器：已添加 iOS 專用事件監聽器")
                else:
                    print("❌ iOS 事件監聽器：缺少 iOS 專用事件監聽器")
                
                # 檢查 iOS 強制 onclick
                if 'iOS 按鈕 onclick 觸發' in frontend_response.text and 'iOS Safari 強制 onclick' in frontend_response.text:
                    print("✅ iOS 強制 onclick：已添加 iOS Safari 強制 onclick 處理")
                else:
                    print("❌ iOS 強制 onclick：缺少 iOS Safari 強制 onclick 處理")
                
                # 檢查 iOS 測試調用
                if 'testIOSButtons()' in frontend_response.text and 'iOS Safari 特殊測試' in frontend_response.text:
                    print("✅ iOS 測試調用：已添加 iOS Safari 測試調用")
                else:
                    print("❌ iOS 測試調用：缺少 iOS Safari 測試調用")
                
                # 檢查整體修復效果
                ios_fixes = [
                    'isIOS = /iPad|iPhone|iPod/.test(userAgent)',
                    'minHeight = \'44px\'',
                    'button.style.webkitAppearance = \'none\'',
                    'iOS Safari 主要方案：touchstart + touchend',
                    'iOS Safari 強制重新綁定按鈕',
                    'function testIOSButtons()',
                    'button.style.display = \'block\'',
                    'iOS 按鈕 touchstart 觸發',
                    'iOS 按鈕 onclick 觸發',
                    'testIOSButtons()'
                ]
                
                missing_fixes = []
                for fix in ios_fixes:
                    if fix not in frontend_response.text:
                        missing_fixes.append(fix)
                
                if not missing_fixes:
                    print("✅ 整體修復效果：所有 iOS Safari 按鈕修復都已包含")
                else:
                    print(f"❌ 整體修復效果：缺少修復 {missing_fixes}")
                
                # 檢查 iOS 功能完整性
                ios_components = [
                    'isIOS',
                    'isSafari',
                    'minHeight',
                    'webkitAppearance',
                    'touchstart',
                    'touchend',
                    'onclick',
                    'testIOSButtons',
                    'setTimeout',
                    'console.log'
                ]
                
                missing_components = []
                for component in ios_components:
                    if component not in frontend_response.text:
                        missing_components.append(component)
                
                if not missing_components:
                    print("✅ iOS 功能完整性：所有 iOS Safari 功能組件都已包含")
                else:
                    print(f"❌ iOS 功能完整性：缺少組件 {missing_components}")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_ios_safari_fix()
