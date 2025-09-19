#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
from datetime import datetime

def test_simple_final_solution_final_final():
    """簡單最終解決方案最終最終測試"""
    
    print("🔍 簡單最終解決方案最終最終測試...")
    
    try:
        # 獲取前端頁面
        print("\n1. 獲取前端頁面...")
        response = requests.get('http://localhost:5001/')
        if response.status_code == 200:
            html_content = response.text
            
            # 檢查課別快速篩選按鈕的實際內容
            print("\n2. 檢查課別快速篩選按鈕的實際內容...")
            
            # 檢查課別快速篩選容器
            if 'id="courseTypeQuickFilters"' in html_content:
                print("✅ 找到 courseTypeQuickFilters 容器")
            else:
                print("❌ 找不到 courseTypeQuickFilters 容器")
            
            # 檢查課別快速篩選按鈕容器
            if 'class="quick-filter-buttons"' in html_content:
                print("✅ 找到 quick-filter-buttons 容器")
            else:
                print("❌ 找不到 quick-filter-buttons 容器")
            
            # 檢查按鈕是否實際存在
            if 'ESM (' in html_content:
                print("✅ 找到 ESM 按鈕")
            else:
                print("❌ 找不到 ESM 按鈕")
            
            if 'SPM (' in html_content:
                print("✅ 找到 SPM 按鈕")
            else:
                print("❌ 找不到 SPM 按鈕")
            
            if 'BOOST (' in html_content:
                print("✅ 找到 BOOST 按鈕")
            else:
                print("❌ 找不到 BOOST 按鈕")
            
            if 'SPIKE (' in html_content:
                print("✅ 找到 SPIKE 按鈕")
            else:
                print("❌ 找不到 SPIKE 按鈕")
            
            # 檢查按鈕的具體內容
            print("\n3. 檢查按鈕的具體內容...")
            
            # 查找所有包含課別名稱的按鈕
            import re
            button_pattern = r'<button[^>]*class="[^"]*quick-filter-btn[^"]*"[^>]*>([^<]+)</button>'
            buttons = re.findall(button_pattern, html_content)
            
            print(f"📊 找到 {len(buttons)} 個快速篩選按鈕:")
            for i, button in enumerate(buttons):
                print(f"  {i+1}. {button}")
            
            # 檢查課別快速篩選按鈕的具體位置
            print("\n4. 檢查課別快速篩選按鈕的具體位置...")
            
            # 查找課別快速篩選區域
            course_type_section = re.search(r'<div class="quick-filter-group" id="courseTypeQuickFilters"[^>]*>.*?</div>', html_content, re.DOTALL)
            if course_type_section:
                section_content = course_type_section.group(0)
                print("✅ 找到課別快速篩選區域")
                
                # 檢查區域內是否有按鈕
                if '<button' in section_content:
                    print("✅ 區域內有按鈕")
                else:
                    print("❌ 區域內沒有按鈕")
                
                # 檢查區域內的具體內容
                print("📄 區域內容:")
                print(section_content[:200] + "..." if len(section_content) > 200 else section_content)
            else:
                print("❌ 找不到課別快速篩選區域")
            
            # 檢查是否有動態生成的按鈕
            print("\n5. 檢查是否有動態生成的按鈕...")
            
            if '<!-- 按鈕會動態生成 -->' in html_content:
                print("✅ 找到動態生成註釋")
            else:
                print("❌ 找不到動態生成註釋")
            
            # 檢查是否有實際的按鈕內容
            if 'ESM' in html_content and 'SPM' in html_content:
                print("✅ 找到課別名稱")
            else:
                print("❌ 找不到課別名稱")
            
            # 檢查是否有按鈕數量
            if '(' in html_content and ')' in html_content:
                print("✅ 找到括號（可能包含數量）")
            else:
                print("❌ 找不到括號")
                
        else:
            print(f"❌ 前端頁面錯誤: {response.status_code}")
            return
        
        print("\n🎉 簡單最終解決方案最終最終測試完成！")
        
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_simple_final_solution_final_final()
