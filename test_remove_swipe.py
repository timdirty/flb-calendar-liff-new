#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試滑動功能移除
"""

import requests
import time
from datetime import datetime

def test_remove_swipe():
    """測試滑動功能移除"""
    print("🔄 測試滑動功能移除...")
    
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
                
                # 檢查滑動功能是否已移除
                if 'setupMobileSwipeNavigation' not in frontend_response.text:
                    print("✅ 滑動功能移除：setupMobileSwipeNavigation 函數已移除")
                else:
                    print("❌ 滑動功能移除：setupMobileSwipeNavigation 函數仍然存在")
                
                # 檢查滑動事件監聽器是否已移除
                if 'touchstart' not in frontend_response.text or 'touchmove' not in frontend_response.text or 'touchend' not in frontend_response.text:
                    print("✅ 滑動事件監聽器移除：觸控事件監聽器已移除")
                else:
                    print("❌ 滑動事件監聽器移除：觸控事件監聽器仍然存在")
                
                # 檢查滑動提示是否已移除
                if 'swipe-hint' not in frontend_response.text and '左右滑動切換' not in frontend_response.text:
                    print("✅ 滑動提示移除：滑動提示相關元素已移除")
                else:
                    print("❌ 滑動提示移除：滑動提示相關元素仍然存在")
                
                # 檢查滑動動畫是否已移除
                if 'swipeHint' not in frontend_response.text:
                    print("✅ 滑動動畫移除：swipeHint 動畫已移除")
                else:
                    print("❌ 滑動動畫移除：swipeHint 動畫仍然存在")
                
                # 檢查按鈕功能是否保留
                if 'bindViewButtons' in frontend_response.text and 'handleViewButtonClick' in frontend_response.text:
                    print("✅ 按鈕功能保留：按鈕相關功能已保留")
                else:
                    print("❌ 按鈕功能保留：按鈕相關功能缺失")
                
                # 檢查篩選功能是否保留
                if 'instructorSelect' in frontend_response.text and 'renderEvents' in frontend_response.text:
                    print("✅ 篩選功能保留：篩選相關功能已保留")
                else:
                    print("❌ 篩選功能保留：篩選相關功能缺失")
                
                # 檢查整體移除效果
                swipe_removed = [
                    'setupMobileSwipeNavigation' not in frontend_response.text,
                    'swipe-hint' not in frontend_response.text,
                    '左右滑動切換' not in frontend_response.text,
                    'swipeHint' not in frontend_response.text
                ]
                
                if all(swipe_removed):
                    print("✅ 整體移除效果：所有滑動相關功能都已移除")
                else:
                    print("❌ 整體移除效果：部分滑動相關功能仍然存在")
                
                # 檢查核心功能保留
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
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_remove_swipe()
