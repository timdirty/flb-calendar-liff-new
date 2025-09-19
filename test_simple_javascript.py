#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
from datetime import datetime

def test_simple_javascript():
    """簡單測試 JavaScript 執行"""
    
    print("🔍 簡單測試 JavaScript 執行...")
    
    try:
        # 獲取前端頁面
        print("\n1. 獲取前端頁面...")
        response = requests.get('http://localhost:5001/')
        if response.status_code == 200:
            html_content = response.text
            
            # 檢查 JavaScript 語法
            print("\n2. 檢查 JavaScript 語法...")
            
            # 檢查是否有語法錯誤
            if 'return false;' in html_content:
                print("✅ 找到 return false; 語句")
            else:
                print("❌ 找不到 return false; 語句")
            
            # 檢查是否有未閉合的括號
            open_braces = html_content.count('{')
            close_braces = html_content.count('}')
            print(f"📊 大括號統計: 開 {open_braces}, 閉 {close_braces}")
            
            if open_braces == close_braces:
                print("✅ 大括號平衡")
            else:
                print("❌ 大括號不平衡")
            
            # 檢查是否有未閉合的括號
            open_parens = html_content.count('(')
            close_parens = html_content.count(')')
            print(f"📊 小括號統計: 開 {open_parens}, 閉 {close_parens}")
            
            if open_parens == close_parens:
                print("✅ 小括號平衡")
            else:
                print("❌ 小括號不平衡")
            
            # 檢查是否有未閉合的方括號
            open_brackets = html_content.count('[')
            close_brackets = html_content.count(']')
            print(f"📊 方括號統計: 開 {open_brackets}, 閉 {close_brackets}")
            
            if open_brackets == close_brackets:
                print("✅ 方括號平衡")
            else:
                print("❌ 方括號不平衡")
            
            # 檢查關鍵函數
            print("\n3. 檢查關鍵函數...")
            
            if 'function updateCourseTypeQuickFilters()' in html_content:
                print("✅ 找到 updateCourseTypeQuickFilters 函數定義")
            else:
                print("❌ 找不到 updateCourseTypeQuickFilters 函數定義")
            
            if 'function getFilteredEvents()' in html_content:
                print("✅ 找到 getFilteredEvents 函數定義")
            else:
                print("❌ 找不到 getFilteredEvents 函數定義")
            
            if 'function bindQuickFilterButtons()' in html_content:
                print("✅ 找到 bindQuickFilterButtons 函數定義")
            else:
                print("❌ 找不到 bindQuickFilterButtons 函數定義")
            
            # 檢查函數調用
            print("\n4. 檢查函數調用...")
            
            if 'updateCourseTypeQuickFilters();' in html_content:
                print("✅ 找到 updateCourseTypeQuickFilters 調用")
            else:
                print("❌ 找不到 updateCourseTypeQuickFilters 調用")
            
            if 'getFilteredEvents();' in html_content:
                print("✅ 找到 getFilteredEvents 調用")
            else:
                print("❌ 找不到 getFilteredEvents 調用")
            
            if 'bindQuickFilterButtons();' in html_content:
                print("✅ 找到 bindQuickFilterButtons 調用")
            else:
                print("❌ 找不到 bindQuickFilterButtons 調用")
            
            # 檢查變量
            print("\n5. 檢查變量...")
            
            if 'let allEvents = [];' in html_content:
                print("✅ 找到 allEvents 初始化")
            else:
                print("❌ 找不到 allEvents 初始化")
            
            if 'allEvents = data.data;' in html_content:
                print("✅ 找到 allEvents 賦值")
            else:
                print("❌ 找不到 allEvents 賦值")
            
            # 檢查 DOM 元素
            print("\n6. 檢查 DOM 元素...")
            
            if 'getElementById(\'courseTypeQuickFilters\')' in html_content:
                print("✅ 找到 courseTypeQuickFilters 元素查找")
            else:
                print("❌ 找不到 courseTypeQuickFilters 元素查找")
            
            if 'querySelector(\'.quick-filter-buttons\')' in html_content:
                print("✅ 找到 quick-filter-buttons 容器查找")
            else:
                print("❌ 找不到 quick-filter-buttons 容器查找")
                
        else:
            print(f"❌ 前端頁面錯誤: {response.status_code}")
            return
        
        print("\n🎉 簡單 JavaScript 測試完成！")
        
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_simple_javascript()
