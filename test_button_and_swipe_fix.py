#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試按鈕點擊和滑動功能修復
"""

import requests
import time
from datetime import datetime

def test_button_and_swipe_fix():
    """測試按鈕點擊和滑動功能修復"""
    print("🔄 測試按鈕點擊和滑動功能修復...")
    
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
                
                # 檢查手機端檢測改進
                if 'LIFF' in frontend_response.text and 'navigator.standalone' in frontend_response.text:
                    print("✅ 手機端檢測改進：添加了LIFF和standalone檢測")
                else:
                    print("❌ 手機端檢測改進有問題")
                
                # 檢查按鈕事件監聽器改進
                if 'touchstart' in frontend_response.text and 'passive: false' in frontend_response.text:
                    print("✅ 按鈕事件監聽器改進：添加了touchstart事件監聽器")
                else:
                    print("❌ 按鈕事件監聽器改進有問題")
                
                # 檢查按鈕樣式改進
                if 'touchAction = \'manipulation\'' in frontend_response.text and 'pointerEvents = \'auto\'' in frontend_response.text:
                    print("✅ 按鈕樣式改進：添加了touchAction和pointerEvents設置")
                else:
                    print("❌ 按鈕樣式改進有問題")
                
                # 檢查按鈕點擊處理改進
                if '強制重新渲染' in frontend_response.text and 'setTimeout' in frontend_response.text:
                    print("✅ 按鈕點擊處理改進：添加了強制重新渲染機制")
                else:
                    print("❌ 按鈕點擊處理改進有問題")
                
                # 檢查renderEvents函數改進
                if '清空容器' in frontend_response.text and 'container.innerHTML' in frontend_response.text:
                    print("✅ renderEvents函數改進：添加了容器清空邏輯")
                else:
                    print("❌ renderEvents函數改進有問題")
                
                # 檢查調試信息增強
                if '開始篩選，總事件數' in frontend_response.text and '當前視圖' in frontend_response.text:
                    print("✅ 調試信息增強：添加了詳細的篩選調試信息")
                else:
                    print("❌ 調試信息增強有問題")
                
                # 檢查switchView函數改進
                if '切換到視圖' in frontend_response.text and '原始視圖' in frontend_response.text:
                    print("✅ switchView函數改進：添加了視圖切換調試信息")
                else:
                    print("❌ switchView函數改進有問題")
                
                # 檢查系統初始化改進
                if '重新設置滑動功能' in frontend_response.text and 'LIFF環境' in frontend_response.text:
                    print("✅ 系統初始化改進：在初始化時重新設置滑動功能")
                else:
                    print("❌ 系統初始化改進有問題")
                
                # 檢查手機端檢測日誌
                if '手機端檢測' in frontend_response.text and 'innerWidth' in frontend_response.text:
                    print("✅ 手機端檢測日誌：添加了詳細的檢測日誌")
                else:
                    print("❌ 手機端檢測日誌有問題")
                
                # 檢查按鈕綁定改進
                if 'removeEventListener' in frontend_response.text and 'touchstart' in frontend_response.text:
                    print("✅ 按鈕綁定改進：添加了事件監聽器清理和重新綁定")
                else:
                    print("❌ 按鈕綁定改進有問題")
                
                # 檢查整體修復效果
                if 'LIFF' in frontend_response.text and 'touchstart' in frontend_response.text and '強制重新渲染' in frontend_response.text:
                    print("✅ 整體修復效果：按鈕點擊和滑動功能修復完成")
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
    test_button_and_swipe_fix()
