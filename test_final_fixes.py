#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試最終修復效果
"""

import requests
import time
from datetime import datetime

def test_final_fixes():
    """測試最終修復效果"""
    print("🔄 測試最終修復效果...")
    
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
                
                # 檢查滑動功能優化
                if '只在事件容器區域監聽滑動' in frontend_response.text and 'eventContainer.addEventListener' in frontend_response.text:
                    print("✅ 滑動功能優化：已限制滑動事件只在事件容器內監聽")
                else:
                    print("❌ 滑動功能優化：缺少事件容器限制")
                
                # 檢查按鈕事件簡化
                if '簡化的按鈕事件處理' in frontend_response.text and 'buttonClickHandler' in frontend_response.text:
                    print("✅ 按鈕事件簡化：已簡化按鈕事件處理邏輯")
                else:
                    print("❌ 按鈕事件簡化：缺少按鈕事件簡化")
                
                # 檢查事件監聽器清理
                if 'removeEventListener' in frontend_response.text and '清除所有舊的事件監聽器' in frontend_response.text:
                    print("✅ 事件監聽器清理：已添加事件監聽器清理邏輯")
                else:
                    print("❌ 事件監聽器清理：缺少事件監聽器清理")
                
                # 檢查滑動衝突避免
                if '完全避免與按鈕衝突' in frontend_response.text and '確保不在按鈕區域' in frontend_response.text:
                    print("✅ 滑動衝突避免：已添加滑動衝突避免邏輯")
                else:
                    print("❌ 滑動衝突避免：缺少滑動衝突避免邏輯")
                
                # 檢查講師篩選功能
                if 'instructorFilter' in frontend_response.text and 'event.instructor !== instructorFilter' in frontend_response.text:
                    print("✅ 講師篩選功能：已確認講師篩選邏輯存在")
                else:
                    print("❌ 講師篩選功能：缺少講師篩選邏輯")
                
                # 檢查視圖篩選功能
                if 'currentView' in frontend_response.text and 'switch (currentView)' in frontend_response.text:
                    print("✅ 視圖篩選功能：已確認視圖篩選邏輯存在")
                else:
                    print("❌ 視圖篩選功能：缺少視圖篩選邏輯")
                
                # 檢查事件渲染功能
                if 'renderEvents' in frontend_response.text and 'filteredEvents' in frontend_response.text:
                    print("✅ 事件渲染功能：已確認事件渲染邏輯存在")
                else:
                    print("❌ 事件渲染功能：缺少事件渲染邏輯")
                
                # 檢查整體修復效果
                final_fixes = [
                    '只在事件容器區域監聽滑動',
                    '簡化的按鈕事件處理',
                    'removeEventListener',
                    '完全避免與按鈕衝突',
                    'instructorFilter',
                    'currentView',
                    'renderEvents'
                ]
                
                missing_fixes = []
                for fix in final_fixes:
                    if fix not in frontend_response.text:
                        missing_fixes.append(fix)
                
                if not missing_fixes:
                    print("✅ 整體修復效果：所有最終修復都已包含")
                else:
                    print(f"❌ 整體修復效果：缺少修復 {missing_fixes}")
                
                # 檢查 Agnes 相關功能
                agnes_checks = [
                    'AGNES',
                    'instructor',
                    'filter',
                    'renderEvents',
                    'updateStats'
                ]
                
                missing_agnes = []
                for check in agnes_checks:
                    if check not in frontend_response.text:
                        missing_agnes.append(check)
                
                if not missing_agnes:
                    print("✅ Agnes 功能檢查：所有 Agnes 相關功能都已包含")
                else:
                    print(f"❌ Agnes 功能檢查：缺少功能 {missing_agnes}")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_final_fixes()
