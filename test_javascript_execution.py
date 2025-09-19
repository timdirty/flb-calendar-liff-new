#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
from datetime import datetime

def test_javascript_execution():
    """測試 JavaScript 執行狀態"""
    
    print("🔍 測試 JavaScript 執行狀態...")
    
    try:
        # 測試前端頁面
        print("\n1. 獲取前端頁面...")
        response = requests.get('http://localhost:5001/')
        if response.status_code == 200:
            html_content = response.text
            
            # 檢查 JavaScript 錯誤處理
            if 'console.log' in html_content:
                print("✅ 找到 console.log 調試語句")
            else:
                print("❌ 找不到 console.log 調試語句")
            
            # 檢查課別快速篩選的具體實現
            if 'const courseTypes = [' in html_content:
                print("✅ 找到 courseTypes 數組定義")
            else:
                print("❌ 找不到 courseTypes 數組定義")
            
            # 檢查按鈕創建邏輯
            if 'createElement(\'button\')' in html_content:
                print("✅ 找到按鈕創建邏輯")
            else:
                print("❌ 找不到按鈕創建邏輯")
            
            # 檢查事件綁定
            if 'addEventListener(\'click\'' in html_content:
                print("✅ 找到事件監聽器綁定")
            else:
                print("❌ 找不到事件監聽器綁定")
            
            # 檢查 onclick 屬性
            if 'button.onclick = function' in html_content:
                print("✅ 找到 onclick 屬性設置")
            else:
                print("❌ 找不到 onclick 屬性設置")
            
            # 檢查初始化調用順序
            init_sequence = [
                'updateTodayQuickFilters();',
                'updateWeekQuickFilters();',
                'updateCourseTypeQuickFilters();'
            ]
            
            for i, call in enumerate(init_sequence):
                if call in html_content:
                    print(f"✅ 找到初始化調用 {i+1}: {call}")
                else:
                    print(f"❌ 找不到初始化調用 {i+1}: {call}")
            
            # 檢查課別快速篩選的顯示邏輯
            if 'buttonsToShow.forEach' in html_content:
                print("✅ 找到按鈕顯示邏輯")
            else:
                print("❌ 找不到按鈕顯示邏輯")
            
            # 檢查課別統計邏輯
            if 'classesOfThisType.length > 0' in html_content:
                print("✅ 找到課別統計邏輯")
            else:
                print("❌ 找不到課別統計邏輯")
            
            # 檢查課別關鍵字檢查
            if 'title.includes(courseType.key.toLowerCase())' in html_content:
                print("✅ 找到課別關鍵字檢查")
            else:
                print("❌ 找不到課別關鍵字檢查")
            
            # 檢查 DOM 元素查找
            if 'getElementById(\'courseTypeQuickFilters\')' in html_content:
                print("✅ 找到 DOM 元素查找")
            else:
                print("❌ 找不到 DOM 元素查找")
            
            # 檢查容器查找
            if 'querySelector(\'.quick-filter-buttons\')' in html_content:
                print("✅ 找到容器查找")
            else:
                print("❌ 找不到容器查找")
                
        else:
            print(f"❌ 前端頁面錯誤: {response.status_code}")
            return
        
        print("\n🎉 JavaScript 執行狀態測試完成！")
        
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_javascript_execution()
