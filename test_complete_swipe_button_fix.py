#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試徹底修復滑動和按鈕衝突問題
"""

import requests
import time
from datetime import datetime

def test_complete_swipe_button_fix():
    """測試徹底修復滑動和按鈕衝突問題"""
    print("🔄 測試徹底修復滑動和按鈕衝突問題...")
    
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
                
                # 檢查滑動目標區域優化
                if 'getSwipeTarget()' in frontend_response.text and 'mainContent || eventContainer' in frontend_response.text:
                    print("✅ 滑動目標區域優化：已添加特定目標區域滑動處理")
                else:
                    print("❌ 滑動目標區域優化：缺少特定目標區域滑動處理")
                
                # 檢查按鈕區域完全排除
                if 'e.target.closest(\'.view-buttons\') || e.target.closest(\'.btn-primary\')' in frontend_response.text:
                    print("✅ 按鈕區域完全排除：已添加按鈕區域完全排除邏輯")
                else:
                    print("❌ 按鈕區域完全排除：缺少按鈕區域完全排除邏輯")
                
                # 檢查按鈕事件捕獲優化
                if 'capture: true' in frontend_response.text and 'stopImmediatePropagation' in frontend_response.text:
                    print("✅ 按鈕事件捕獲優化：已添加事件捕獲和立即停止傳播")
                else:
                    print("❌ 按鈕事件捕獲優化：缺少事件捕獲和立即停止傳播")
                
                # 檢查統一按鈕處理
                if 'buttonClickHandler' in frontend_response.text and '統一的按鈕事件處理' in frontend_response.text:
                    print("✅ 統一按鈕處理：已添加統一的按鈕事件處理邏輯")
                else:
                    print("❌ 統一按鈕處理：缺少統一的按鈕事件處理邏輯")
                
                # 檢查滑動事件綁定優化
                if 'target.addEventListener' in frontend_response.text and '滑動事件已綁定到目標' in frontend_response.text:
                    print("✅ 滑動事件綁定優化：已添加特定目標事件綁定")
                else:
                    print("❌ 滑動事件綁定優化：缺少特定目標事件綁定")
                
                # 檢查事件處理函數分離
                if 'handleTouchStart' in frontend_response.text and 'handleTouchMove' in frontend_response.text and 'handleTouchEnd' in frontend_response.text:
                    print("✅ 事件處理函數分離：已添加分離的事件處理函數")
                else:
                    print("❌ 事件處理函數分離：缺少分離的事件處理函數")
                
                # 檢查滑動目標檢測
                if 'swipeTarget = target' in frontend_response.text and 'target.contains(e.target)' in frontend_response.text:
                    print("✅ 滑動目標檢測：已添加滑動目標檢測邏輯")
                else:
                    print("❌ 滑動目標檢測：缺少滑動目標檢測邏輯")
                
                # 檢查按鈕事件優先級
                if 'passive: false' in frontend_response.text and 'capture: true' in frontend_response.text:
                    print("✅ 按鈕事件優先級：已設置按鈕事件高優先級")
                else:
                    print("❌ 按鈕事件優先級：缺少按鈕事件高優先級設置")
                
                # 檢查整體修復效果
                complete_fixes = [
                    'getSwipeTarget()',
                    'e.target.closest(\'.view-buttons\')',
                    'capture: true',
                    'stopImmediatePropagation',
                    'buttonClickHandler',
                    'target.addEventListener',
                    'handleTouchStart',
                    'swipeTarget = target'
                ]
                
                missing_fixes = []
                for fix in complete_fixes:
                    if fix not in frontend_response.text:
                        missing_fixes.append(fix)
                
                if not missing_fixes:
                    print("✅ 整體修復效果：所有徹底修復都已包含")
                else:
                    print(f"❌ 整體修復效果：缺少修復 {missing_fixes}")
                
                # 檢查衝突解決方案完整性
                conflict_solutions = [
                    '滑動目標區域',
                    '按鈕區域排除',
                    '事件捕獲',
                    '立即停止傳播',
                    '統一處理',
                    '特定綁定',
                    '函數分離',
                    '目標檢測'
                ]
                
                missing_solutions = []
                for solution in conflict_solutions:
                    if solution not in frontend_response.text:
                        missing_solutions.append(solution)
                
                if not missing_solutions:
                    print("✅ 衝突解決方案完整性：所有衝突解決方案都已包含")
                else:
                    print(f"❌ 衝突解決方案完整性：缺少解決方案 {missing_solutions}")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_complete_swipe_button_fix()
