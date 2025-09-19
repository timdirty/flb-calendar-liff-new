#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試手機端按鈕功能調試
"""

import requests
import time
from datetime import datetime

def test_mobile_button_debug():
    """測試手機端按鈕功能調試"""
    print("🔄 測試手機端按鈕功能調試...")
    
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
                
                # 檢查按鈕 HTML 結構
                if '<button class="btn btn-primary active" data-view="today">今日</button>' in frontend_response.text:
                    print("✅ 今日按鈕：HTML 結構正確")
                else:
                    print("❌ 今日按鈕：HTML 結構有問題")
                
                if '<button class="btn btn-primary" data-view="week">本週</button>' in frontend_response.text:
                    print("✅ 本週按鈕：HTML 結構正確")
                else:
                    print("❌ 本週按鈕：HTML 結構有問題")
                
                if '<button class="btn btn-primary" data-view="month">本月</button>' in frontend_response.text:
                    print("✅ 本月按鈕：HTML 結構正確")
                else:
                    print("❌ 本月按鈕：HTML 結構有問題")
                
                if '<button class="btn btn-primary" data-view="all">全部</button>' in frontend_response.text:
                    print("✅ 全部按鈕：HTML 結構正確")
                else:
                    print("❌ 全部按鈕：HTML 結構有問題")
                
                # 檢查按鈕容器結構
                if '<div class="view-buttons">' in frontend_response.text and '</div>' in frontend_response.text:
                    print("✅ 按鈕容器：view-buttons 容器結構正確")
                else:
                    print("❌ 按鈕容器：view-buttons 容器結構有問題")
                
                # 檢查按鈕綁定函數
                if 'function bindViewButtons()' in frontend_response.text:
                    print("✅ 按鈕綁定函數：bindViewButtons 函數存在")
                else:
                    print("❌ 按鈕綁定函數：bindViewButtons 函數不存在")
                
                # 檢查按鈕點擊處理函數
                if 'function handleViewButtonClick(e)' in frontend_response.text:
                    print("✅ 按鈕點擊處理：handleViewButtonClick 函數存在")
                else:
                    print("❌ 按鈕點擊處理：handleViewButtonClick 函數不存在")
                
                # 檢查事件監聽器
                if 'addEventListener(\'click\'' in frontend_response.text:
                    print("✅ 點擊事件：click 事件監聽器存在")
                else:
                    print("❌ 點擊事件：click 事件監聽器不存在")
                
                if 'addEventListener(\'touchstart\'' in frontend_response.text:
                    print("✅ 觸控事件：touchstart 事件監聽器存在")
                else:
                    print("❌ 觸控事件：touchstart 事件監聽器不存在")
                
                # 檢查按鈕樣式
                if 'pointerEvents = \'auto\'' in frontend_response.text:
                    print("✅ 按鈕樣式：pointerEvents 設置正確")
                else:
                    print("❌ 按鈕樣式：pointerEvents 設置有問題")
                
                if 'touchAction = \'manipulation\'' in frontend_response.text:
                    print("✅ 觸控樣式：touchAction 設置正確")
                else:
                    print("❌ 觸控樣式：touchAction 設置有問題")
                
                # 檢查函數調用
                if 'bindViewButtons()' in frontend_response.text:
                    bind_count = frontend_response.text.count('bindViewButtons()')
                    print(f"✅ 函數調用：bindViewButtons 調用 {bind_count} 次")
                else:
                    print("❌ 函數調用：bindViewButtons 未調用")
                
                # 檢查初始化順序
                if '系統初始化完成' in frontend_response.text and 'bindViewButtons()' in frontend_response.text:
                    print("✅ 初始化順序：系統初始化後調用 bindViewButtons")
                else:
                    print("❌ 初始化順序：初始化順序有問題")
                
                # 檢查按鈕選擇器
                if 'querySelectorAll(\'.view-buttons .btn-primary\')' in frontend_response.text:
                    print("✅ 按鈕選擇器：選擇器語法正確")
                else:
                    print("❌ 按鈕選擇器：選擇器語法有問題")
                
                # 檢查按鈕數量檢查
                if 'viewButtons.length === 0' in frontend_response.text:
                    print("✅ 按鈕數量檢查：已添加按鈕數量檢查")
                else:
                    print("❌ 按鈕數量檢查：缺少按鈕數量檢查")
                
                # 檢查事件清理
                if 'removeEventListener' in frontend_response.text and 'button.onclick = null' in frontend_response.text:
                    print("✅ 事件清理：已添加事件清理機制")
                else:
                    print("❌ 事件清理：缺少事件清理機制")
                
                # 檢查調試日誌
                if 'console.log(\'🔗 綁定' in frontend_response.text and 'console.log(\'📱 按鈕點擊' in frontend_response.text:
                    print("✅ 調試日誌：已添加詳細的調試日誌")
                else:
                    print("❌ 調試日誌：缺少調試日誌")
                
                # 檢查整體問題
                issues = []
                if 'bindViewButtons()' not in frontend_response.text:
                    issues.append("bindViewButtons 未調用")
                if 'handleViewButtonClick' not in frontend_response.text:
                    issues.append("handleViewButtonClick 不存在")
                if 'addEventListener(\'click\'' not in frontend_response.text:
                    issues.append("click 事件監聽器不存在")
                if 'pointerEvents = \'auto\'' not in frontend_response.text:
                    issues.append("pointerEvents 未設置")
                if 'querySelectorAll(\'.view-buttons .btn-primary\')' not in frontend_response.text:
                    issues.append("按鈕選擇器有問題")
                
                if not issues:
                    print("✅ 整體檢查：沒有發現明顯問題")
                else:
                    print(f"❌ 整體檢查：發現問題 {issues}")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_mobile_button_debug()
