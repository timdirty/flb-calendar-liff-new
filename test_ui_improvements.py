#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試UI改進效果
"""

import requests
import time
from datetime import datetime

def test_ui_improvements():
    """測試UI改進效果"""
    print("🔄 測試UI改進效果...")
    
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
                
                # 檢查滑動提示動畫改進
                if 'font-size: 0.8rem' in frontend_response.text and 'color: rgba(0, 0, 0, 0.8)' in frontend_response.text:
                    print("✅ 滑動提示動畫改進：字體放大到 0.8rem，顏色加深到黑色")
                else:
                    print("❌ 滑動提示動畫改進有問題")
                
                # 檢查滑動提示樣式增強
                if 'padding: 6px 16px' in frontend_response.text and 'border-radius: 16px' in frontend_response.text:
                    print("✅ 滑動提示樣式增強：增加內邊距和圓角半徑")
                else:
                    print("❌ 滑動提示樣式增強有問題")
                
                # 檢查按鈕選中效果
                if 'btn-primary.active' in frontend_response.text and 'linear-gradient(135deg, #ffc107, #ff9800)' in frontend_response.text:
                    print("✅ 按鈕選中效果：添加了漸層背景和選中樣式")
                else:
                    print("❌ 按鈕選中效果有問題")
                
                # 檢查按鈕未選中效果
                if 'btn-primary:not(.active)' in frontend_response.text and 'rgba(255, 193, 7, 0.3)' in frontend_response.text:
                    print("✅ 按鈕未選中效果：添加了淡色背景和邊框")
                else:
                    print("❌ 按鈕未選中效果有問題")
                
                # 檢查按鈕懸停效果
                if 'btn-primary:hover' in frontend_response.text and 'scale(1.02)' in frontend_response.text:
                    print("✅ 按鈕懸停效果：添加了縮放和過度動畫")
                else:
                    print("❌ 按鈕懸停效果有問題")
                
                # 檢查地址統一處理
                if '樂程坊 FunLearnBar' in frontend_response.text and '站前教室' in frontend_response.text:
                    print("✅ 地址統一處理：統一地址為樂程坊 FunLearnBar")
                else:
                    print("❌ 地址統一處理有問題")
                
                # 檢查按鈕狀態更新函數
                if 'updateViewButtonStates' in frontend_response.text and 'classList.add(\'active\')' in frontend_response.text:
                    print("✅ 按鈕狀態更新函數：添加了 updateViewButtonStates 函數")
                else:
                    print("❌ 按鈕狀態更新函數有問題")
                
                # 檢查按鈕初始化
                if '設置初始選中狀態' in frontend_response.text and 'updateViewButtonStates()' in frontend_response.text:
                    print("✅ 按鈕初始化：在初始化時設置選中狀態")
                else:
                    print("❌ 按鈕初始化有問題")
                
                # 檢查滑動提示圖標大小
                if 'font-size: 0.9rem' in frontend_response.text and 'margin-right: 6px' in frontend_response.text:
                    print("✅ 滑動提示圖標大小：箭頭圖標放大並增加間距")
                else:
                    print("❌ 滑動提示圖標大小有問題")
                
                # 檢查按鈕選中狀態同步
                if 'updateViewButtonStates()' in frontend_response.text and 'switchView' in frontend_response.text:
                    print("✅ 按鈕選中狀態同步：在 switchView 中調用狀態更新")
                else:
                    print("❌ 按鈕選中狀態同步有問題")
                
                # 檢查整體UI改進
                if 'font-weight: 500' in frontend_response.text and 'box-shadow: 0 3px 6px' in frontend_response.text:
                    print("✅ 整體UI改進：多處樣式優化提升視覺效果")
                else:
                    print("❌ 整體UI改進有問題")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_ui_improvements()
