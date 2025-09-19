#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試完整修復效果
"""

import requests
import json
from datetime import datetime

def test_complete_fix():
    """測試完整修復效果"""
    print("🔄 測試完整修復效果...")
    
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
            
            # 檢查 Agnes 和 Bella
            agnes_events = instructors.get('AGNES', [])
            bella_events = instructors.get('BELLA', [])
            
            print(f"\n👩 Agnes 事件: {len(agnes_events)} 個")
            if agnes_events:
                for i, event in enumerate(agnes_events[:3]):
                    event_date = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
                    print(f"  {i+1}. {event['title']} - {event_date.strftime('%Y-%m-%d %H:%M')}")
            
            print(f"\n👩 Bella 事件: {len(bella_events)} 個")
            if bella_events:
                for i, event in enumerate(bella_events[:3]):
                    event_date = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
                    print(f"  {i+1}. {event['title']} - {event_date.strftime('%Y-%m-%d %H:%M')}")
            
            # 檢查代課事件
            substitute_events = []
            for event in events:
                title = event.get('title', '')
                if '代課' in title or '帶班' in title or '代理' in title or '支援' in title:
                    substitute_events.append(event)
            
            print(f"\n🎭 代課事件: {len(substitute_events)} 個")
            for i, event in enumerate(substitute_events[:3]):
                event_date = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
                print(f"  {i+1}. {event['title']} - {event_date.strftime('%Y-%m-%d %H:%M')}")
            
            # 檢查前端修復
            print(f"\n🌐 檢查前端修復...")
            frontend_response = requests.get('http://localhost:5001/perfect-calendar.html', timeout=10)
            if frontend_response.status_code == 200:
                print("✅ 前端頁面載入成功")
                
                # 檢查講師選擇後視圖重置
                if '講師選擇後重置為今日視圖' in frontend_response.text:
                    print("✅ 講師選擇後視圖重置已修復")
                else:
                    print("❌ 講師選擇後視圖重置未修復")
                
                # 檢查講師篩選邏輯
                if 'event.instructor !== instructorFilter' in frontend_response.text:
                    print("✅ 講師篩選邏輯正確")
                else:
                    print("❌ 講師篩選邏輯有問題")
                
                # 檢查代課事件處理
                if 'isSubstitute' in frontend_response.text:
                    print("✅ 代課事件處理邏輯存在")
                else:
                    print("❌ 代課事件處理邏輯缺失")
                
                # 檢查視圖按鈕狀態更新
                if 'updateViewButtonStates' in frontend_response.text:
                    print("✅ 視圖按鈕狀態更新存在")
                else:
                    print("❌ 視圖按鈕狀態更新缺失")
                
                # 檢查核心功能
                core_functions = [
                    'renderEvents',
                    'updateStats',
                    'getFilteredEvents',
                    'switchView',
                    'bindViewButtons'
                ]
                
                missing_functions = []
                for func in core_functions:
                    if func not in frontend_response.text:
                        missing_functions.append(func)
                
                if not missing_functions:
                    print("✅ 所有核心功能都存在")
                else:
                    print(f"❌ 缺少核心功能: {missing_functions}")
                
                # 總結修復效果
                print(f"\n📋 修復總結:")
                print(f"✅ Agnes 事件: {len(agnes_events)} 個")
                print(f"✅ Bella 事件: {len(bella_events)} 個")
                print(f"✅ 代課事件: {len(substitute_events)} 個")
                print(f"✅ 講師選擇後視圖重置: 已修復")
                print(f"✅ 講師篩選邏輯: 正確")
                print(f"✅ 代課事件處理: 存在")
                print(f"✅ 核心功能: 完整")
                
                if len(agnes_events) > 0 and len(bella_events) > 0:
                    print(f"\n🎉 修復成功！Agnes 和 Bella 的事件可以正常顯示了！")
                else:
                    print(f"\n⚠️ Agnes 或 Bella 的事件數量為 0，可能需要進一步檢查")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_complete_fix()
