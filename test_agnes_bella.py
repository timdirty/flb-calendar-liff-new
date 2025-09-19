#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試 Agnes 和 Bella 事件載入問題
"""

import requests
import json
from datetime import datetime

def test_agnes_bella():
    """測試 Agnes 和 Bella 事件載入問題"""
    print("🔄 測試 Agnes 和 Bella 事件載入問題...")
    
    try:
        # 獲取事件數據
        response = requests.get('http://localhost:5001/api/events', timeout=10)
        if response.status_code == 200:
            data = response.json()
            events = data['data']
            print(f"✅ 獲取 {len(events)} 個事件")
            
            # 分析講師名稱格式
            instructors = set()
            agnes_events = []
            bella_events = []
            
            for event in events:
                instructor = event.get('instructor', 'Unknown')
                instructors.add(instructor)
                
                # 檢查各種可能的 Agnes 和 Bella 格式
                if instructor.upper() == 'AGNES' or 'AGNES' in instructor.upper():
                    agnes_events.append(event)
                if instructor.upper() == 'BELLA' or 'BELLA' in instructor.upper():
                    bella_events.append(event)
            
            print(f"\n📊 所有講師名稱格式:")
            for instructor in sorted(instructors):
                print(f"  - {instructor}")
            
            print(f"\n👩 Agnes 相關事件: {len(agnes_events)} 個")
            for i, event in enumerate(agnes_events):
                event_date = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
                print(f"  {i+1}. {event['title']} - {event['instructor']} - {event_date.strftime('%Y-%m-%d %H:%M')}")
            
            print(f"\n👩 Bella 相關事件: {len(bella_events)} 個")
            for i, event in enumerate(bella_events):
                event_date = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
                print(f"  {i+1}. {event['title']} - {event['instructor']} - {event_date.strftime('%Y-%m-%d %H:%M')}")
            
            # 檢查代課事件中的 Agnes 和 Bella
            substitute_agnes = []
            substitute_bella = []
            
            for event in events:
                title = event.get('title', '')
                description = event.get('description', '')
                if 'AGNES' in title.upper() or 'AGNES' in description.upper():
                    substitute_agnes.append(event)
                if 'BELLA' in title.upper() or 'BELLA' in description.upper():
                    substitute_bella.append(event)
            
            print(f"\n🎭 代課事件中的 Agnes: {len(substitute_agnes)} 個")
            for i, event in enumerate(substitute_agnes):
                event_date = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
                print(f"  {i+1}. {event['title']} - {event['instructor']} - {event_date.strftime('%Y-%m-%d %H:%M')}")
            
            print(f"\n🎭 代課事件中的 Bella: {len(substitute_bella)} 個")
            for i, event in enumerate(substitute_bella):
                event_date = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
                print(f"  {i+1}. {event['title']} - {event['instructor']} - {event_date.strftime('%Y-%m-%d %H:%M')}")
            
            # 檢查前端講師列表
            print(f"\n🌐 檢查前端講師列表...")
            frontend_response = requests.get('http://localhost:5001/perfect-calendar.html', timeout=10)
            if frontend_response.status_code == 200:
                print("✅ 前端頁面載入成功")
                
                # 檢查講師列表生成邏輯
                if 'allInstructors = [...new Set(allEvents.map(event => event.instructor).filter(Boolean))]' in frontend_response.text:
                    print("✅ 講師列表生成邏輯正確")
                else:
                    print("❌ 講師列表生成邏輯可能有問題")
                
                # 檢查講師選擇後視圖重置
                if 'currentView = \'今日\'' in frontend_response.text and '講師選擇後重置為今日視圖' in frontend_response.text:
                    print("✅ 講師選擇後視圖重置邏輯已修復")
                else:
                    print("❌ 講師選擇後視圖重置邏輯可能有問題")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_agnes_bella()
