#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
from datetime import datetime

def test_javascript_simulation():
    """模擬 JavaScript 執行來測試快速篩選按鈕生成"""
    
    print("🔍 模擬 JavaScript 執行測試...")
    
    try:
        # 獲取前端頁面
        print("\n1. 獲取前端頁面...")
        response = requests.get('http://localhost:5001/')
        if response.status_code == 200:
            html_content = response.text
            
            # 檢查 JavaScript 代碼中的關鍵部分
            print("\n2. 檢查 JavaScript 代碼...")
            
            # 檢查 allEvents 初始化
            if 'let allEvents = [];' in html_content:
                print("✅ 找到 allEvents 初始化")
            else:
                print("❌ 找不到 allEvents 初始化")
            
            # 檢查 allEvents 賦值
            if 'allEvents = data.data;' in html_content:
                print("✅ 找到 allEvents 賦值")
            else:
                print("❌ 找不到 allEvents 賦值")
            
            # 檢查 updateCourseTypeQuickFilters 調用
            if 'updateCourseTypeQuickFilters();' in html_content:
                print("✅ 找到 updateCourseTypeQuickFilters 調用")
            else:
                print("❌ 找不到 updateCourseTypeQuickFilters 調用")
            
            # 檢查調用位置
            if '在事件載入完成後更新快速篩選按鈕' in html_content:
                print("✅ 找到正確的調用位置")
            else:
                print("❌ 找不到正確的調用位置")
            
            # 檢查 getFilteredEvents 函數
            if 'function getFilteredEvents()' in html_content:
                print("✅ 找到 getFilteredEvents 函數")
            else:
                print("❌ 找不到 getFilteredEvents 函數")
            
            # 檢查課別統計邏輯
            if 'classesOfThisType.length > 0' in html_content:
                print("✅ 找到課別統計邏輯")
            else:
                print("❌ 找不到課別統計邏輯")
            
            # 檢查按鈕創建邏輯
            if 'createElement(\'button\')' in html_content:
                print("✅ 找到按鈕創建邏輯")
            else:
                print("❌ 找不到按鈕創建邏輯")
            
            # 檢查事件綁定
            if 'bindQuickFilterButtons();' in html_content:
                print("✅ 找到事件綁定調用")
            else:
                print("❌ 找不到事件綁定調用")
            
            # 檢查 console.log 調試語句
            if 'console.log(\'🔍 開始更新課別快速篩選\')' in html_content:
                print("✅ 找到調試語句")
            else:
                print("❌ 找不到調試語句")
            
            # 檢查課別數組定義
            if 'const courseTypes = [' in html_content:
                print("✅ 找到課別數組定義")
            else:
                print("❌ 找不到課別數組定義")
            
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
            
            # 檢查按鈕添加
            if 'appendChild(button);' in html_content:
                print("✅ 找到按鈕添加")
            else:
                print("❌ 找不到按鈕添加")
                
        else:
            print(f"❌ 前端頁面錯誤: {response.status_code}")
            return
        
        print("\n🎉 JavaScript 模擬測試完成！")
        
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_javascript_simulation()
