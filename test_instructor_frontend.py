#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試講師前端載入問題
"""

import requests
import json
from datetime import datetime

def test_instructor_frontend():
    """測試講師前端載入問題"""
    print("🔄 測試講師前端載入問題...")
    
    try:
        # 獲取事件數據
        response = requests.get('http://localhost:5001/api/events', timeout=10)
        if response.status_code == 200:
            data = response.json()
            events = data['data']
            print(f"✅ 獲取 {len(events)} 個事件")
            
            # 分析講師分布
            instructors = {}
            for event in events:
                instructor = event.get('instructor', 'Unknown')
                if instructor not in instructors:
                    instructors[instructor] = []
                instructors[instructor].append(event)
            
            print(f"\n📊 講師事件統計:")
            for instructor, events_list in sorted(instructors.items()):
                print(f"{instructor}: {len(events_list)} 個事件")
            
            # 檢查 AGNES 和 BELLA 的事件
            agnes_events = instructors.get('AGNES', [])
            bella_events = instructors.get('BELLA', [])
            
            print(f"\n👩 AGNES 事件: {len(agnes_events)} 個")
            for i, event in enumerate(agnes_events[:3]):
                event_date = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
                print(f"  {i+1}. {event['title']} - {event_date.strftime('%Y-%m-%d %H:%M')}")
            
            print(f"\n👩 BELLA 事件: {len(bella_events)} 個")
            for i, event in enumerate(bella_events[:3]):
                event_date = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
                print(f"  {i+1}. {event['title']} - {event_date.strftime('%Y-%m-%d %H:%M')}")
            
            # 檢查前端講師列表生成
            print(f"\n🌐 檢查前端講師列表生成...")
            frontend_response = requests.get('http://localhost:5001/perfect-calendar.html', timeout=10)
            if frontend_response.status_code == 200:
                print("✅ 前端頁面載入成功")
                
                # 檢查講師列表生成邏輯
                if 'allInstructors = [...new Set(allEvents.map(event => event.instructor).filter(Boolean))]' in frontend_response.text:
                    print("✅ 講師列表生成邏輯正確")
                else:
                    print("❌ 講師列表生成邏輯有問題")
                
                # 檢查講師下拉選單填充
                if 'populateInstructorDropdown' in frontend_response.text:
                    print("✅ 講師下拉選單填充函數存在")
                else:
                    print("❌ 講師下拉選單填充函數缺失")
                
                # 檢查講師篩選邏輯
                if 'event.instructor !== instructorFilter' in frontend_response.text:
                    print("✅ 講師篩選邏輯存在")
                else:
                    print("❌ 講師篩選邏輯缺失")
                
                # 檢查預設視圖設定
                if 'currentView = \'今日\'' in frontend_response.text:
                    print("✅ 預設視圖設為今日")
                else:
                    print("❌ 預設視圖設定有問題")
                
                # 檢查今日按鈕預設狀態
                if 'updateViewButtonStates' in frontend_response.text:
                    print("✅ 視圖按鈕狀態更新函數存在")
                else:
                    print("❌ 視圖按鈕狀態更新函數缺失")
                
                # 檢查初始化時是否調用 updateViewButtonStates
                if 'updateViewButtonStates()' in frontend_response.text:
                    print("✅ 初始化時調用 updateViewButtonStates")
                else:
                    print("❌ 初始化時未調用 updateViewButtonStates")
                
                # 檢查講師選擇後的重置邏輯
                if '講師選擇後重置為今日視圖' in frontend_response.text:
                    print("✅ 講師選擇後重置邏輯存在")
                else:
                    print("❌ 講師選擇後重置邏輯缺失")
                
                # 檢查事件載入完成後的處理
                if 'loadEvents' in frontend_response.text and 'populateInstructorDropdown' in frontend_response.text:
                    print("✅ 事件載入後處理邏輯存在")
                else:
                    print("❌ 事件載入後處理邏輯缺失")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_instructor_frontend()
