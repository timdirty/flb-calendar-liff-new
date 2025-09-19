#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
from datetime import datetime

def test_quick_filter_debug():
    """測試快速篩選按鈕的調試信息"""
    
    print("🔍 測試快速篩選按鈕調試...")
    
    try:
        # 測試後端 API
        print("\n1. 測試後端 API...")
        response = requests.get('http://localhost:5001/api/events')
        if response.status_code == 200:
            events = response.json()['data']
            print(f"✅ 後端事件數量: {len(events)}")
            
            # 檢查事件中的課別
            course_types = {}
            for event in events:
                title = event.get('title', '').lower()
                description = event.get('description', '').lower()
                
                if 'esm' in title or 'esm' in description:
                    course_types['esm'] = course_types.get('esm', 0) + 1
                if 'spm' in title or 'spm' in description:
                    course_types['spm'] = course_types.get('spm', 0) + 1
                if 'boost' in title or 'boost' in description:
                    course_types['boost'] = course_types.get('boost', 0) + 1
                if 'spike' in title or 'spike' in description:
                    course_types['spike'] = course_types.get('spike', 0) + 1
            
            print("📊 課別統計:")
            for course_type, count in course_types.items():
                print(f"  - {course_type.upper()}: {count} 個")
        else:
            print(f"❌ 後端 API 錯誤: {response.status_code}")
            return
        
        # 測試前端頁面
        print("\n2. 測試前端頁面...")
        response = requests.get('http://localhost:5001/')
        if response.status_code == 200:
            html_content = response.text
            
            # 檢查課別快速篩選容器
            if 'courseTypeQuickFilters' in html_content:
                print("✅ 找到 courseTypeQuickFilters 容器")
            else:
                print("❌ 找不到 courseTypeQuickFilters 容器")
            
            # 檢查快速篩選按鈕
            if 'quick-filter-btn' in html_content:
                print("✅ 找到 quick-filter-btn 類別")
            else:
                print("❌ 找不到 quick-filter-btn 類別")
            
            # 檢查 updateCourseTypeQuickFilters 函數
            if 'updateCourseTypeQuickFilters' in html_content:
                print("✅ 找到 updateCourseTypeQuickFilters 函數")
            else:
                print("❌ 找不到 updateCourseTypeQuickFilters 函數")
            
            # 檢查 getFilteredEvents 函數
            if 'getFilteredEvents' in html_content:
                print("✅ 找到 getFilteredEvents 函數")
            else:
                print("❌ 找不到 getFilteredEvents 函數")
            
            # 檢查 bindQuickFilterButtons 函數
            if 'bindQuickFilterButtons' in html_content:
                print("✅ 找到 bindQuickFilterButtons 函數")
            else:
                print("❌ 找不到 bindQuickFilterButtons 函數")
            
            # 檢查 handleQuickFilter 函數
            if 'handleQuickFilter' in html_content:
                print("✅ 找到 handleQuickFilter 函數")
            else:
                print("❌ 找不到 handleQuickFilter 函數")
            
            # 檢查初始化調用
            if 'updateCourseTypeQuickFilters();' in html_content:
                print("✅ 找到 updateCourseTypeQuickFilters() 調用")
            else:
                print("❌ 找不到 updateCourseTypeQuickFilters() 調用")
            
            # 檢查課別快速篩選按鈕的實際內容
            if 'ESM' in html_content and 'SPM' in html_content:
                print("✅ 找到 ESM 和 SPM 按鈕")
            else:
                print("❌ 找不到 ESM 和 SPM 按鈕")
            
            if 'BOOST' in html_content and 'SPIKE' in html_content:
                print("✅ 找到 BOOST 和 SPIKE 按鈕")
            else:
                print("❌ 找不到 BOOST 和 SPIKE 按鈕")
                
        else:
            print(f"❌ 前端頁面錯誤: {response.status_code}")
            return
        
        print("\n🎉 快速篩選調試測試完成！")
        
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_quick_filter_debug()
