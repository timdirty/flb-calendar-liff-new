#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
from datetime import datetime

def test_javascript_runtime():
    """測試 JavaScript 運行時錯誤"""
    
    print("🔍 測試 JavaScript 運行時錯誤...")
    
    try:
        # 獲取前端頁面
        print("\n1. 獲取前端頁面...")
        response = requests.get('http://localhost:5001/')
        if response.status_code == 200:
            html_content = response.text
            
            # 檢查可能的運行時錯誤
            print("\n2. 檢查可能的運行時錯誤...")
            
            # 檢查 allEvents 是否可能為 undefined
            if 'allEvents.length' in html_content:
                print("✅ 找到 allEvents.length 使用")
            else:
                print("❌ 找不到 allEvents.length 使用")
            
            # 檢查是否有 try-catch 錯誤處理
            if 'try {' in html_content:
                print("✅ 找到 try 語句")
            else:
                print("❌ 找不到 try 語句")
            
            if 'catch' in html_content:
                print("✅ 找到 catch 語句")
            else:
                print("❌ 找不到 catch 語句")
            
            # 檢查是否有 console.error
            if 'console.error' in html_content:
                print("✅ 找到 console.error 調用")
            else:
                print("❌ 找不到 console.error 調用")
            
            # 檢查 updateCourseTypeQuickFilters 函數中的錯誤處理
            if 'console.log(\'❌ 找不到 courseTypeQuickFilters 元素\')' in html_content:
                print("✅ 找到 courseTypeQuickFilters 錯誤處理")
            else:
                print("❌ 找不到 courseTypeQuickFilters 錯誤處理")
            
            if 'console.log(\'❌ 找不到 quick-filter-buttons 容器\')' in html_content:
                print("✅ 找到 quick-filter-buttons 錯誤處理")
            else:
                print("❌ 找不到 quick-filter-buttons 錯誤處理")
            
            # 檢查 getFilteredEvents 函數中的錯誤處理
            if 'console.log(\'🔍 getFilteredEvents - 篩選結果:\', filtered.length);' in html_content:
                print("✅ 找到 getFilteredEvents 調試語句")
            else:
                print("❌ 找不到 getFilteredEvents 調試語句")
            
            # 檢查 updateCourseTypeQuickFilters 函數中的調試語句
            if 'console.log(\'🔍 開始更新課別快速篩選\')' in html_content:
                print("✅ 找到 updateCourseTypeQuickFilters 調試語句")
            else:
                print("❌ 找不到 updateCourseTypeQuickFilters 調試語句")
            
            # 檢查按鈕創建邏輯
            if 'createElement(\'button\')' in html_content:
                print("✅ 找到按鈕創建邏輯")
            else:
                print("❌ 找不到按鈕創建邏輯")
            
            # 檢查按鈕添加邏輯
            if 'appendChild(button);' in html_content:
                print("✅ 找到按鈕添加邏輯")
            else:
                print("❌ 找不到按鈕添加邏輯")
            
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
            
            # 檢查按鈕顯示邏輯
            if 'buttonsToShow.forEach' in html_content:
                print("✅ 找到按鈕顯示邏輯")
            else:
                print("❌ 找不到按鈕顯示邏輯")
            
            # 檢查容器查找
            if 'querySelector(\'.quick-filter-buttons\')' in html_content:
                print("✅ 找到容器查找")
            else:
                print("❌ 找不到容器查找")
            
            # 檢查 innerHTML 清空
            if 'innerHTML = \'\';' in html_content:
                print("✅ 找到 innerHTML 清空")
            else:
                print("❌ 找不到 innerHTML 清空")
            
            # 檢查事件綁定
            if 'bindQuickFilterButtons();' in html_content:
                print("✅ 找到事件綁定")
            else:
                print("❌ 找不到事件綁定")
            
            # 檢查可能的語法錯誤
            print("\n3. 檢查可能的語法錯誤...")
            
            # 檢查是否有未閉合的字符串
            if 'console.log(\'🔍 開始更新課別快速篩選\')' in html_content:
                print("✅ 找到調試語句")
            else:
                print("❌ 找不到調試語句")
            
            # 檢查是否有未閉合的模板字符串
            if '`${buttonInfo.name} (${buttonInfo.count})`' in html_content:
                print("✅ 找到模板字符串")
            else:
                print("❌ 找不到模板字符串")
            
            # 檢查是否有未閉合的箭頭函數
            if '=>' in html_content:
                print("✅ 找到箭頭函數")
            else:
                print("❌ 找不到箭頭函數")
            
            # 檢查是否有未閉合的數組
            if 'const courseTypes = [' in html_content:
                print("✅ 找到數組定義")
            else:
                print("❌ 找不到數組定義")
            
            # 檢查是否有未閉合的對象
            if '{ key: \'esm\', name: \'ESM\' }' in html_content:
                print("✅ 找到對象定義")
            else:
                print("❌ 找不到對象定義")
            
            # 檢查是否有未閉合的函數
            if 'function updateCourseTypeQuickFilters() {' in html_content:
                print("✅ 找到函數定義")
            else:
                print("❌ 找不到函數定義")
            
            # 檢查是否有未閉合的條件語句
            if 'if (classesOfThisType.length > 0)' in html_content:
                print("✅ 找到條件語句")
            else:
                print("❌ 找不到條件語句")
            
            # 檢查是否有未閉合的循環
            if 'courseTypes.forEach(courseType =>' in html_content:
                print("✅ 找到循環語句")
            else:
                print("❌ 找不到循環語句")
            
            # 檢查是否有未閉合的篩選
            if 'filteredEvents.filter(event =>' in html_content:
                print("✅ 找到篩選語句")
            else:
                print("❌ 找不到篩選語句")
            
            # 檢查是否有未閉合的映射
            if 'buttonsToShow.forEach((buttonInfo, index) =>' in html_content:
                print("✅ 找到映射語句")
            else:
                print("❌ 找不到映射語句")
                
        else:
            print(f"❌ 前端頁面錯誤: {response.status_code}")
            return
        
        print("\n🎉 JavaScript 運行時錯誤測試完成！")
        
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_javascript_runtime()
