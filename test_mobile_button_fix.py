#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試手機端按鈕功能修復
"""

import requests
import time
from datetime import datetime

def test_mobile_button_fix():
    """測試手機端按鈕功能修復"""
    print("🔄 測試手機端按鈕功能修復...")
    
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
                
                # 檢查bindViewButtons函數位置
                if 'function bindViewButtons()' in frontend_response.text and 'function handleViewButtonClick' in frontend_response.text:
                    print("✅ bindViewButtons函數位置：已移到全局作用域")
                else:
                    print("❌ bindViewButtons函數位置有問題")
                
                # 檢查handleViewButtonClick函數位置
                if 'function handleViewButtonClick(e)' in frontend_response.text and 'e.preventDefault()' in frontend_response.text:
                    print("✅ handleViewButtonClick函數位置：已移到全局作用域")
                else:
                    print("❌ handleViewButtonClick函數位置有問題")
                
                # 檢查函數定義順序
                if 'handleViewButtonClick' in frontend_response.text and 'bindViewButtons' in frontend_response.text:
                    # 檢查handleViewButtonClick是否在bindViewButtons之前定義
                    handle_pos = frontend_response.text.find('function handleViewButtonClick')
                    bind_pos = frontend_response.text.find('function bindViewButtons')
                    if handle_pos < bind_pos:
                        print("✅ 函數定義順序：handleViewButtonClick在bindViewButtons之前定義")
                    else:
                        print("❌ 函數定義順序有問題")
                else:
                    print("❌ 函數定義順序檢查失敗")
                
                # 檢查觸控事件監聽器
                if 'touchstart' in frontend_response.text and 'passive: false' in frontend_response.text:
                    print("✅ 觸控事件監聽器：添加了touchstart事件支援手機端")
                else:
                    print("❌ 觸控事件監聽器有問題")
                
                # 檢查按鈕樣式設置
                if 'touchAction = \'manipulation\'' in frontend_response.text and 'pointerEvents = \'auto\'' in frontend_response.text:
                    print("✅ 按鈕樣式設置：添加了手機端觸控優化")
                else:
                    print("❌ 按鈕樣式設置有問題")
                
                # 檢查函數調用
                if 'bindViewButtons()' in frontend_response.text and '系統初始化完成' in frontend_response.text:
                    print("✅ 函數調用：在系統初始化時正確調用bindViewButtons")
                else:
                    print("❌ 函數調用有問題")
                
                # 檢查事件監聽器清理
                if 'removeEventListener' in frontend_response.text and 'click' in frontend_response.text:
                    print("✅ 事件監聽器清理：添加了舊事件監聽器清理機制")
                else:
                    print("❌ 事件監聽器清理有問題")
                
                # 檢查強制重新渲染
                if '強制重新渲染' in frontend_response.text and 'setTimeout' in frontend_response.text:
                    print("✅ 強制重新渲染：添加了按鈕點擊後的強制重新渲染")
                else:
                    print("❌ 強制重新渲染有問題")
                
                # 檢查函數重複定義
                bind_count = frontend_response.text.count('function bindViewButtons()')
                handle_count = frontend_response.text.count('function handleViewButtonClick')
                if bind_count == 1 and handle_count == 1:
                    print("✅ 函數重複定義：bindViewButtons和handleViewButtonClick各定義一次")
                else:
                    print(f"❌ 函數重複定義：bindViewButtons定義{bind_count}次，handleViewButtonClick定義{handle_count}次")
                
                # 檢查整體修復效果
                if 'function bindViewButtons()' in frontend_response.text and 'function handleViewButtonClick' in frontend_response.text and 'touchstart' in frontend_response.text:
                    print("✅ 整體修復效果：手機端按鈕功能修復完成")
                else:
                    print("❌ 整體修復效果有問題")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_mobile_button_fix()
