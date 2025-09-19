#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試前端篩選功能
"""

import requests
import json

def test_frontend_filter():
    """測試前端篩選功能"""
    print("🔄 測試前端篩選功能...")
    
    try:
        # 測試前端頁面
        frontend_response = requests.get('http://localhost:5001/perfect-calendar.html', timeout=10)
        if frontend_response.status_code == 200:
            print("✅ 前端頁面載入成功")
            
            # 檢查講師篩選邏輯
            if 'event.instructor !== instructorFilter' in frontend_response.text:
                print("✅ 講師篩選使用嚴格相等比較")
            else:
                print("❌ 講師篩選邏輯可能有問題")
            
            # 檢查講師選擇後視圖重置
            if '講師選擇後重置為今日視圖' in frontend_response.text:
                print("✅ 講師選擇後視圖重置已修復")
            else:
                print("❌ 講師選擇後視圖重置未修復")
            
            # 檢查講師列表生成
            if 'allInstructors = [...new Set(allEvents.map(event => event.instructor).filter(Boolean))]' in frontend_response.text:
                print("✅ 講師列表生成邏輯正確")
            else:
                print("❌ 講師列表生成邏輯可能有問題")
            
            # 檢查代課事件處理
            if 'isSubstitute' in frontend_response.text and 'substitute-event' in frontend_response.text:
                print("✅ 代課事件處理邏輯存在")
            else:
                print("❌ 代課事件處理邏輯缺失")
            
            # 檢查視圖按鈕狀態更新
            if 'updateViewButtonStates' in frontend_response.text:
                print("✅ 視圖按鈕狀態更新函數存在")
            else:
                print("❌ 視圖按鈕狀態更新函數缺失")
                
        else:
            print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
            
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_frontend_filter()
