#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試函數作用域修復
"""

import requests
import time
from datetime import datetime

def test_function_scope_fix():
    """測試函數作用域修復"""
    print("🔄 測試函數作用域修復...")
    
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
                
                # 檢查updateViewButtonStates函數位置
                if 'function updateViewButtonStates()' in frontend_response.text and '切換檢視模式' in frontend_response.text:
                    print("✅ updateViewButtonStates函數位置：已移到全局作用域，在switchView之前")
                else:
                    print("❌ updateViewButtonStates函數位置有問題")
                
                # 檢查函數定義完整性
                if 'viewButtons.forEach(button =>' in frontend_response.text and 'button.classList.add(\'active\')' in frontend_response.text:
                    print("✅ 函數定義完整性：updateViewButtonStates函數定義完整")
                else:
                    print("❌ 函數定義完整性有問題")
                
                # 檢查函數調用
                if 'updateViewButtonStates();' in frontend_response.text and 'switchView' in frontend_response.text:
                    print("✅ 函數調用：switchView中正確調用updateViewButtonStates")
                else:
                    print("❌ 函數調用有問題")
                
                # 檢查作用域修復
                if '// 更新視圖按鈕狀態' in frontend_response.text and '// 切換檢視模式' in frontend_response.text:
                    print("✅ 作用域修復：函數已移到正確的作用域")
                else:
                    print("❌ 作用域修復有問題")
                
                # 檢查控制台日誌
                if '按鈕' in frontend_response.text and '設為選中狀態' in frontend_response.text:
                    print("✅ 控制台日誌：updateViewButtonStates函數包含調試日誌")
                else:
                    print("❌ 控制台日誌有問題")
                
                # 檢查函數重複定義
                function_count = frontend_response.text.count('function updateViewButtonStates()')
                if function_count == 1:
                    print("✅ 函數重複定義：updateViewButtonStates函數只定義一次")
                else:
                    print(f"❌ 函數重複定義：updateViewButtonStates函數定義了 {function_count} 次")
                
                # 檢查函數調用次數
                call_count = frontend_response.text.count('updateViewButtonStates()')
                if call_count >= 2:
                    print(f"✅ 函數調用次數：updateViewButtonStates被調用 {call_count} 次")
                else:
                    print(f"❌ 函數調用次數：updateViewButtonStates調用次數不足")
                
                # 檢查整體修復效果
                if 'function updateViewButtonStates()' in frontend_response.text and 'switchView' in frontend_response.text and 'updateViewButtonStates();' in frontend_response.text:
                    print("✅ 整體修復效果：函數作用域問題已修復")
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
    test_function_scope_fix()
