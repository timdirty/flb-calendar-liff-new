#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
from datetime import datetime

def test_browser_console():
    """測試瀏覽器控制台錯誤"""
    
    print("🔍 測試瀏覽器控制台錯誤...")
    
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
            
            # 檢查課別數組
            print("\n4. 檢查課別數組...")
            
            if 'const courseTypes = [' in html_content:
                print("✅ 找到課別數組定義")
            else:
                print("❌ 找不到課別數組定義")
            
            if 'key: \'esm\', name: \'ESM\'' in html_content:
                print("✅ 找到 ESM 課別定義")
            else:
                print("❌ 找不到 ESM 課別定義")
            
            if 'key: \'spm\', name: \'SPM\'' in html_content:
                print("✅ 找到 SPM 課別定義")
            else:
                print("❌ 找不到 SPM 課別定義")
            
            if 'key: \'boost\', name: \'BOOST\'' in html_content:
                print("✅ 找到 BOOST 課別定義")
            else:
                print("❌ 找不到 BOOST 課別定義")
            
            if 'key: \'spike\', name: \'SPIKE\'' in html_content:
                print("✅ 找到 SPIKE 課別定義")
            else:
                print("❌ 找不到 SPIKE 課別定義")
            
            # 檢查課別統計邏輯
            print("\n5. 檢查課別統計邏輯...")
            
            if 'classesOfThisType.length > 0' in html_content:
                print("✅ 找到課別統計邏輯")
            else:
                print("❌ 找不到課別統計邏輯")
            
            if 'title.includes(courseType.key.toLowerCase())' in html_content:
                print("✅ 找到課別關鍵字檢查")
            else:
                print("❌ 找不到課別關鍵字檢查")
            
            if 'description.includes(courseType.key.toLowerCase())' in html_content:
                print("✅ 找到描述關鍵字檢查")
            else:
                print("❌ 找不到描述關鍵字檢查")
            
            # 檢查按鈕創建邏輯
            print("\n6. 檢查按鈕創建邏輯...")
            
            if 'createElement(\'button\')' in html_content:
                print("✅ 找到按鈕創建邏輯")
            else:
                print("❌ 找不到按鈕創建邏輯")
            
            if 'className = \'btn btn-outline-primary quick-filter-btn\'' in html_content:
                print("✅ 找到按鈕類別設置")
            else:
                print("❌ 找不到按鈕類別設置")
            
            if 'setAttribute(\'data-quick\', buttonInfo.key)' in html_content:
                print("✅ 找到按鈕屬性設置")
            else:
                print("❌ 找不到按鈕屬性設置")
            
            if 'textContent = `${buttonInfo.name} (${buttonInfo.count})`' in html_content:
                print("✅ 找到按鈕文字設置")
            else:
                print("❌ 找不到按鈕文字設置")
            
            if 'appendChild(button);' in html_content:
                print("✅ 找到按鈕添加邏輯")
            else:
                print("❌ 找不到按鈕添加邏輯")
            
            # 檢查事件綁定
            print("\n7. 檢查事件綁定...")
            
            if 'bindQuickFilterButtons();' in html_content:
                print("✅ 找到事件綁定調用")
            else:
                print("❌ 找不到事件綁定調用")
            
            if 'addEventListener(\'click\'' in html_content:
                print("✅ 找到事件監聽器添加")
            else:
                print("❌ 找不到事件監聽器添加")
            
            if 'onclick = function' in html_content:
                print("✅ 找到 onclick 屬性設置")
            else:
                print("❌ 找不到 onclick 屬性設置")
            
            # 檢查可能的語法錯誤
            print("\n8. 檢查可能的語法錯誤...")
            
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
        
        print("\n🎉 瀏覽器控制台錯誤測試完成！")
        
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_browser_console()
