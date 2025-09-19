#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試背景監聽事件移除
"""

import requests
import time
from datetime import datetime

def test_remove_background_events():
    """測試背景監聽事件移除"""
    print("🔄 測試背景監聽事件移除...")
    
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
                
                # 檢查背景監聽事件是否已移除
                if 'setInterval(updateDateTime, 1000)' not in frontend_response.text:
                    print("✅ 背景時間更新移除：每秒更新時間的 setInterval 已移除")
                else:
                    print("❌ 背景時間更新移除：每秒更新時間的 setInterval 仍然存在")
                
                if 'setInterval(updateAllCountdowns, 60000)' not in frontend_response.text:
                    print("✅ 背景倒數計時移除：每分鐘更新倒數計時的 setInterval 已移除")
                else:
                    print("❌ 背景倒數計時移除：每分鐘更新倒數計時的 setInterval 仍然存在")
                
                # 檢查重複綁定是否已移除
                bindViewButtons_count = frontend_response.text.count('bindViewButtons()')
                if bindViewButtons_count <= 3:  # 只保留必要的調用
                    print(f"✅ 重複綁定移除：bindViewButtons 調用次數減少到 {bindViewButtons_count}")
                else:
                    print(f"❌ 重複綁定移除：bindViewButtons 調用次數仍然過多 ({bindViewButtons_count})")
                
                # 檢查延遲調用是否已移除
                setTimeout_count = frontend_response.text.count('setTimeout')
                if setTimeout_count <= 10:  # 只保留必要的延遲
                    print(f"✅ 延遲調用移除：setTimeout 調用次數減少到 {setTimeout_count}")
                else:
                    print(f"❌ 延遲調用移除：setTimeout 調用次數仍然過多 ({setTimeout_count})")
                
                # 檢查核心功能是否保留
                core_functions = [
                    'bindViewButtons',
                    'handleViewButtonClick',
                    'instructorSelect',
                    'renderEvents',
                    'switchView',
                    'updateStats'
                ]
                
                missing_functions = []
                for func in core_functions:
                    if func not in frontend_response.text:
                        missing_functions.append(func)
                
                if not missing_functions:
                    print("✅ 核心功能保留：所有核心功能都已保留")
                else:
                    print(f"❌ 核心功能保留：缺少功能 {missing_functions}")
                
                # 檢查整體優化效果
                background_events_removed = [
                    'setInterval(updateDateTime, 1000)' not in frontend_response.text,
                    'setInterval(updateAllCountdowns, 60000)' not in frontend_response.text,
                    bindViewButtons_count <= 3,
                    setTimeout_count <= 10
                ]
                
                if all(background_events_removed):
                    print("✅ 整體優化效果：所有背景監聽事件都已移除，系統應該更穩定")
                else:
                    print("❌ 整體優化效果：部分背景監聽事件仍然存在")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_remove_background_events()
