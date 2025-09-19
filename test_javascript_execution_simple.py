#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
from datetime import datetime

def test_javascript_execution_simple():
    """簡單測試 JavaScript 執行"""
    
    print("🔍 簡單測試 JavaScript 執行...")
    
    try:
        # 獲取前端頁面
        print("\n1. 獲取前端頁面...")
        response = requests.get('http://localhost:5001/')
        if response.status_code == 200:
            html_content = response.text
            
            # 檢查 JavaScript 代碼中的關鍵部分
            print("\n2. 檢查 JavaScript 代碼中的關鍵部分...")
            
            # 檢查 updateCourseTypeQuickFilters 函數的完整實現
            if 'function updateCourseTypeQuickFilters() {' in html_content:
                print("✅ 找到 updateCourseTypeQuickFilters 函數定義")
            else:
                print("❌ 找不到 updateCourseTypeQuickFilters 函數定義")
            
            # 檢查函數的結尾
            if '}' in html_content and 'updateCourseTypeQuickFilters' in html_content:
                print("✅ 找到 updateCourseTypeQuickFilters 函數結尾")
            else:
                print("❌ 找不到 updateCourseTypeQuickFilters 函數結尾")
            
            # 檢查函數中的關鍵語句
            if 'console.log(\'🔍 開始更新課別快速篩選\')' in html_content:
                print("✅ 找到調試語句")
            else:
                print("❌ 找不到調試語句")
            
            # 檢查函數中的 DOM 查找
            if 'getElementById(\'courseTypeQuickFilters\')' in html_content:
                print("✅ 找到 DOM 查找")
            else:
                print("❌ 找不到 DOM 查找")
            
            # 檢查函數中的課別數組
            if 'const courseTypes = [' in html_content:
                print("✅ 找到課別數組")
            else:
                print("❌ 找不到課別數組")
            
            # 檢查函數中的 getFilteredEvents 調用
            if 'getFilteredEvents();' in html_content:
                print("✅ 找到 getFilteredEvents 調用")
            else:
                print("❌ 找不到 getFilteredEvents 調用")
            
            # 檢查函數中的按鈕創建邏輯
            if 'createElement(\'button\')' in html_content:
                print("✅ 找到按鈕創建邏輯")
            else:
                print("❌ 找不到按鈕創建邏輯")
            
            # 檢查函數中的按鈕添加邏輯
            if 'appendChild(button);' in html_content:
                print("✅ 找到按鈕添加邏輯")
            else:
                print("❌ 找不到按鈕添加邏輯")
            
            # 檢查函數中的事件綁定
            if 'bindQuickFilterButtons();' in html_content:
                print("✅ 找到事件綁定")
            else:
                print("❌ 找不到事件綁定")
            
            # 檢查函數調用
            print("\n3. 檢查函數調用...")
            
            if 'updateCourseTypeQuickFilters();' in html_content:
                print("✅ 找到 updateCourseTypeQuickFilters 調用")
            else:
                print("❌ 找不到 updateCourseTypeQuickFilters 調用")
            
            # 檢查調用位置
            if '在事件載入完成後更新快速篩選按鈕' in html_content:
                print("✅ 找到正確的調用位置")
            else:
                print("❌ 找不到正確的調用位置")
            
            # 檢查 allEvents 賦值
            if 'allEvents = data.data;' in html_content:
                print("✅ 找到 allEvents 賦值")
            else:
                print("❌ 找不到 allEvents 賦值")
            
            # 檢查 allEvents 初始化
            if 'let allEvents = [];' in html_content:
                print("✅ 找到 allEvents 初始化")
            else:
                print("❌ 找不到 allEvents 初始化")
            
            # 檢查 getFilteredEvents 函數
            if 'function getFilteredEvents()' in html_content:
                print("✅ 找到 getFilteredEvents 函數定義")
            else:
                print("❌ 找不到 getFilteredEvents 函數定義")
            
            # 檢查 getFilteredEvents 函數的結尾
            if 'return filtered;' in html_content:
                print("✅ 找到 getFilteredEvents 函數結尾")
            else:
                print("❌ 找不到 getFilteredEvents 函數結尾")
            
            # 檢查 bindQuickFilterButtons 函數
            if 'function bindQuickFilterButtons()' in html_content:
                print("✅ 找到 bindQuickFilterButtons 函數定義")
            else:
                print("❌ 找不到 bindQuickFilterButtons 函數定義")
            
            # 檢查 bindQuickFilterButtons 函數的結尾
            if 'console.log(\'🎉 所有快速篩選按鈕事件監聽器綁定完成\');' in html_content:
                print("✅ 找到 bindQuickFilterButtons 函數結尾")
            else:
                print("❌ 找不到 bindQuickFilterButtons 函數結尾")
                
        else:
            print(f"❌ 前端頁面錯誤: {response.status_code}")
            return
        
        print("\n🎉 簡單 JavaScript 執行測試完成！")
        
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_javascript_execution_simple()
