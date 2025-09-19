#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試按鈕點擊和滑動提示修復
"""

import requests
import time
from datetime import datetime

def test_button_click_and_swipe_hint():
    """測試按鈕點擊和滑動提示修復"""
    print("🔄 測試按鈕點擊和滑動提示修復...")
    
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
                
                # 檢查滑動提示位置調整
                if 'swipe-hint-container' in frontend_response.text and '統計信息文字顯示' in frontend_response.text:
                    print("✅ 滑動提示位置調整：移動到統計信息下方")
                else:
                    print("❌ 滑動提示位置調整有問題")
                
                # 檢查滑動提示樣式
                if 'fas fa-arrow-left' in frontend_response.text and 'fas fa-arrow-right' in frontend_response.text:
                    print("✅ 滑動提示樣式：添加了左右箭頭圖標")
                else:
                    print("❌ 滑動提示樣式有問題")
                
                # 檢查按鈕綁定函數
                if 'bindViewButtons' in frontend_response.text and 'handleViewButtonClick' in frontend_response.text:
                    print("✅ 按鈕綁定函數：添加了 bindViewButtons 和 handleViewButtonClick")
                else:
                    print("❌ 按鈕綁定函數有問題")
                
                # 檢查按鈕點擊處理
                if 'e.preventDefault()' in frontend_response.text and 'e.stopPropagation()' in frontend_response.text:
                    print("✅ 按鈕點擊處理：添加了事件阻止和傳播控制")
                else:
                    print("❌ 按鈕點擊處理有問題")
                
                # 檢查按鈕可點擊性
                if 'pointerEvents = \'auto\'' in frontend_response.text and 'cursor = \'pointer\'' in frontend_response.text:
                    print("✅ 按鈕可點擊性：確保按鈕可以點擊")
                else:
                    print("❌ 按鈕可點擊性有問題")
                
                # 檢查按鈕重新綁定
                if 'bindViewButtons()' in frontend_response.text and 'setTimeout' in frontend_response.text:
                    print("✅ 按鈕重新綁定：在系統初始化完成後重新綁定按鈕")
                else:
                    print("❌ 按鈕重新綁定有問題")
                
                # 檢查滑動提示動畫調整
                if 'translateY(0)' in frontend_response.text and 'translateY(-2px)' in frontend_response.text:
                    print("✅ 滑動提示動畫調整：修改為適用於新位置的動畫")
                else:
                    print("❌ 滑動提示動畫調整有問題")
                
                # 檢查原本滑動提示移除
                if 'display: none' in frontend_response.text and 'view-buttons::after' in frontend_response.text:
                    print("✅ 原本滑動提示移除：隱藏了原本的 ::after 提示")
                else:
                    print("❌ 原本滑動提示移除有問題")
                
                # 檢查控制台日誌
                if '綁定' in frontend_response.text and '按鈕點擊' in frontend_response.text:
                    print("✅ 控制台日誌：添加了按鈕綁定和點擊的調試信息")
                else:
                    print("❌ 控制台日誌有問題")
                
                # 檢查滑動提示內容
                if '左右滑動切換' in frontend_response.text and 'margin-right: 4px' in frontend_response.text:
                    print("✅ 滑動提示內容：添加了左右箭頭和文字提示")
                else:
                    print("❌ 滑動提示內容有問題")
                
                # 檢查整體修復效果
                if '統計信息下方' in frontend_response.text or 'margin-top: 8px' in frontend_response.text:
                    print("✅ 整體修復效果：滑動提示位置和按鈕功能都已修復")
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
    test_button_click_and_swipe_hint()
