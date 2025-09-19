#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試講師顯示問題
"""

import requests
import json
from datetime import datetime

def test_instructor_display():
    """測試講師顯示問題"""
    print("🔄 測試講師顯示問題...")
    
    try:
        # 獲取事件數據
        response = requests.get('http://localhost:5001/api/events', timeout=10)
        if response.status_code == 200:
            data = response.json()
            events = data['data']
            print(f"✅ 獲取 {len(events)} 個事件")
            
            # 分析講師分布
            instructors = {}
            substitute_events = []
            
            for event in events:
                instructor = event.get('instructor', 'Unknown')
                if instructor not in instructors:
                    instructors[instructor] = []
                instructors[instructor].append(event)
                
                # 檢查是否為代課事件
                title = event.get('title', '')
                description = event.get('description', '')
                if '代課' in title or '帶班' in title or '代理' in title or '支援' in title:
                    substitute_events.append(event)
                    print(f"🎭 代課事件: {title} - {instructor}")
            
            print(f"\n📊 講師事件統計:")
            for instructor, events_list in sorted(instructors.items()):
                print(f"{instructor}: {len(events_list)} 個事件")
            
            print(f"\n🎭 代課事件統計: {len(substitute_events)} 個")
            
            # 檢查 Agnes 和 Bella 的事件
            agnes_events = instructors.get('Agnes', [])
            bella_events = instructors.get('Bella', [])
            
            print(f"\n👩 Agnes 事件: {len(agnes_events)} 個")
            for i, event in enumerate(agnes_events[:5]):  # 顯示前5個
                event_date = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
                print(f"  {i+1}. {event['title']} - {event_date.strftime('%Y-%m-%d %H:%M')}")
            
            print(f"\n👩 Bella 事件: {len(bella_events)} 個")
            for i, event in enumerate(bella_events[:5]):  # 顯示前5個
                event_date = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
                print(f"  {i+1}. {event['title']} - {event_date.strftime('%Y-%m-%d %H:%M')}")
            
            # 檢查前端篩選邏輯
            print(f"\n🌐 檢查前端篩選邏輯...")
            frontend_response = requests.get('http://localhost:5001/perfect-calendar.html', timeout=10)
            if frontend_response.status_code == 200:
                print("✅ 前端頁面載入成功")
                
                # 檢查講師篩選邏輯
                if 'instructorFilter && event.instructor !== instructorFilter' in frontend_response.text:
                    print("✅ 講師篩選邏輯存在")
                else:
                    print("❌ 講師篩選邏輯缺失")
                
                # 檢查代課事件處理
                if 'isSubstitute' in frontend_response.text:
                    print("✅ 代課事件處理邏輯存在")
                else:
                    print("❌ 代課事件處理邏輯缺失")
                
                # 檢查預設視圖設定
                if 'currentView = \'今日\'' in frontend_response.text:
                    print("✅ 預設視圖設為今日")
                else:
                    print("❌ 預設視圖設定可能有問題")
                
                # 檢查講師選擇後的視圖重置
                if 'instructorSelect' in frontend_response.text and 'addEventListener' in frontend_response.text:
                    print("✅ 講師選擇事件監聽器存在")
                else:
                    print("❌ 講師選擇事件監聽器缺失")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_instructor_display()
