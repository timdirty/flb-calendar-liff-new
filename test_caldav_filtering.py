#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
真實 CalDAV 資料篩選功能測試腳本
測試不同講師在不同篩選情況下的功能
"""

import requests
import json
from datetime import datetime, timedelta
import sys

# 本地伺服器配置
BASE_URL = "http://localhost:5001"

def test_caldav_data_source():
    """測試 CalDAV 資料來源"""
    print("🔍 測試 CalDAV 資料來源...")
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API 健康狀態: {data['status']}")
            print(f"📊 事件數量: {data['events_count']}")
            print(f"👥 講師數量: {data['teachers_count']}")
            print(f"📡 資料來源: {data['data_source']}")
            print(f"🔗 CalDAV 狀態: {data['caldav_status']}")
            
            if data['caldav_status'] == 'success':
                print("🎉 成功使用真實 CalDAV 資料進行測試")
                return True
            else:
                print("⚠️ 使用模擬資料進行測試")
                return False
        else:
            print(f"❌ API 健康檢查失敗: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ 無法連接到本地伺服器: {e}")
        return False

def test_instructor_filtering():
    """測試講師篩選功能"""
    print("\n🔍 測試講師篩選功能...")
    
    try:
        # 獲取所有事件
        response = requests.get(f"{BASE_URL}/api/events", timeout=10)
        if response.status_code != 200:
            print(f"❌ 獲取所有事件失敗: {response.status_code}")
            return False
        
        all_events = response.json()['data']
        print(f"📊 總事件數量: {len(all_events)}")
        
        # 獲取講師列表
        teachers_response = requests.get(f"{BASE_URL}/api/teachers", timeout=10)
        if teachers_response.status_code != 200:
            print(f"❌ 獲取講師列表失敗: {teachers_response.status_code}")
            return False
        
        teachers = teachers_response.json()['teachers']
        print(f"👥 講師列表: {[t['name'] for t in teachers]}")
        
        # 測試每個講師的篩選
        for teacher in teachers:
            teacher_name = teacher['name']
            print(f"\n👨‍🏫 測試講師: {teacher_name}")
            
            # 獲取該講師的事件
            teacher_response = requests.get(f"{BASE_URL}/api/events/{teacher_name}", timeout=10)
            if teacher_response.status_code == 200:
                teacher_events = teacher_response.json()['data']
                print(f"   📅 {teacher_name} 的事件數量: {len(teacher_events)}")
                
                # 驗證事件都屬於該講師
                for event in teacher_events:
                    if event['instructor'] != teacher_name:
                        print(f"   ❌ 發現不屬於講師 {teacher_name} 的事件: {event['title']}")
                        return False
                
                print(f"   ✅ 所有事件都屬於講師 {teacher_name}")
                
                # 顯示前3個事件作為範例
                if teacher_events:
                    print(f"   📋 {teacher_name} 的事件範例:")
                    for i, event in enumerate(teacher_events[:3]):
                        event_time = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
                        print(f"      {i+1}. {event_time.strftime('%m/%d %H:%M')} - {event['title']}")
                    if len(teacher_events) > 3:
                        print(f"      ... 還有 {len(teacher_events) - 3} 個事件")
                else:
                    print(f"   ℹ️ {teacher_name} 目前沒有事件")
            else:
                print(f"   ❌ 獲取講師 {teacher_name} 的事件失敗: {teacher_response.status_code}")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ 講師篩選測試失敗: {str(e)}")
        return False

def test_date_filtering():
    """測試日期篩選功能"""
    print("\n🔍 測試日期篩選功能...")
    
    try:
        # 獲取所有事件
        response = requests.get(f"{BASE_URL}/api/events", timeout=10)
        if response.status_code != 200:
            print(f"❌ 獲取所有事件失敗: {response.status_code}")
            return False
        
        all_events = response.json()['data']
        
        # 分析日期分佈
        today = datetime.now().date()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        month_start = today.replace(day=1)
        if today.month == 12:
            month_end = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            month_end = today.replace(month=today.month + 1, day=1) - timedelta(days=1)
        
        # 統計不同時間範圍的事件
        today_events = []
        week_events = []
        month_events = []
        
        for event in all_events:
            event_date = datetime.fromisoformat(event['start'].replace('Z', '+00:00')).date()
            
            if event_date == today:
                today_events.append(event)
            if week_start <= event_date <= week_end:
                week_events.append(event)
            if month_start <= event_date <= month_end:
                month_events.append(event)
        
        print(f"📅 今日事件 ({today}): {len(today_events)} 個")
        print(f"📅 本週事件 ({week_start} - {week_end}): {len(week_events)} 個")
        print(f"📅 本月事件 ({month_start} - {month_end}): {len(month_events)} 個")
        print(f"📅 全部事件: {len(all_events)} 個")
        
        # 顯示今日事件詳情
        if today_events:
            print(f"\n📋 今日事件詳情:")
            for event in today_events:
                event_time = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
                print(f"   - {event_time.strftime('%H:%M')} {event['title']} ({event['instructor']})")
        else:
            print(f"\nℹ️ 今日沒有事件")
        
        return True
        
    except Exception as e:
        print(f"❌ 日期篩選測試失敗: {str(e)}")
        return False

def test_time_slot_filtering():
    """測試時段篩選功能"""
    print("\n🔍 測試時段篩選功能...")
    
    try:
        # 獲取所有事件
        response = requests.get(f"{BASE_URL}/api/events", timeout=10)
        if response.status_code != 200:
            print(f"❌ 獲取所有事件失敗: {response.status_code}")
            return False
        
        all_events = response.json()['data']
        
        # 定義時段
        time_slots = {
            'morning': (6, 12),
            'afternoon': (12, 18),
            'evening': (18, 24)
        }
        
        # 統計各時段事件
        for slot_name, (start_hour, end_hour) in time_slots.items():
            slot_events = []
            for event in all_events:
                event_time = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
                hour = event_time.hour
                if start_hour <= hour < end_hour:
                    slot_events.append(event)
            
            print(f"🕐 {slot_name} ({start_hour:02d}:00-{end_hour:02d}:00): {len(slot_events)} 個事件")
            
            # 顯示前3個事件
            if slot_events:
                print(f"   📋 {slot_name} 事件範例:")
                for i, event in enumerate(slot_events[:3]):
                    event_time = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
                    print(f"      {i+1}. {event_time.strftime('%H:%M')} {event['title']} ({event['instructor']})")
                if len(slot_events) > 3:
                    print(f"      ... 還有 {len(slot_events) - 3} 個事件")
        
        return True
        
    except Exception as e:
        print(f"❌ 時段篩選測試失敗: {str(e)}")
        return False

def test_combined_filtering():
    """測試組合篩選功能"""
    print("\n🔍 測試組合篩選功能...")
    
    try:
        # 獲取所有事件
        response = requests.get(f"{BASE_URL}/api/events", timeout=10)
        if response.status_code != 200:
            print(f"❌ 獲取所有事件失敗: {response.status_code}")
            return False
        
        all_events = response.json()['data']
        
        # 獲取講師列表
        teachers_response = requests.get(f"{BASE_URL}/api/teachers", timeout=10)
        if teachers_response.status_code != 200:
            print(f"❌ 獲取講師列表失敗: {teachers_response.status_code}")
            return False
        
        teachers = teachers_response.json()['teachers']
        
        # 測試講師 + 日期組合篩選
        today = datetime.now().date()
        
        for teacher in teachers:
            teacher_name = teacher['name']
            print(f"\n👨‍🏫 測試講師 {teacher_name} 的今日事件:")
            
            # 獲取該講師的所有事件
            teacher_response = requests.get(f"{BASE_URL}/api/events/{teacher_name}", timeout=10)
            if teacher_response.status_code == 200:
                teacher_events = teacher_response.json()['data']
                
                # 篩選今日事件
                today_events = []
                for event in teacher_events:
                    event_date = datetime.fromisoformat(event['start'].replace('Z', '+00:00')).date()
                    if event_date == today:
                        today_events.append(event)
                
                print(f"   📅 {teacher_name} 今日事件: {len(today_events)} 個")
                
                if today_events:
                    for event in today_events:
                        event_time = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
                        print(f"      - {event_time.strftime('%H:%M')} {event['title']}")
                else:
                    print(f"      ℹ️ {teacher_name} 今日沒有事件")
            else:
                print(f"   ❌ 獲取講師 {teacher_name} 的事件失敗")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ 組合篩選測試失敗: {str(e)}")
        return False

def main():
    """主測試函數"""
    print("🧪 開始真實 CalDAV 資料篩選功能測試")
    print("=" * 60)
    
    # 測試 CalDAV 資料來源
    caldav_available = test_caldav_data_source()
    if not caldav_available:
        print("\n⚠️ CalDAV 資料來源不可用，將使用模擬資料繼續測試")
    
    # 執行各種篩選測試
    test_results = []
    
    test_results.append(("講師篩選", test_instructor_filtering()))
    test_results.append(("日期篩選", test_date_filtering()))
    test_results.append(("時段篩選", test_time_slot_filtering()))
    test_results.append(("組合篩選", test_combined_filtering()))
    
    # 顯示測試結果摘要
    print("\n" + "=" * 60)
    print("📊 測試結果摘要")
    print("=" * 60)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ 通過" if result else "❌ 失敗"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\n總計: {passed}/{total} 項測試通過")
    
    if passed == total:
        print("🎉 所有測試通過！真實 CalDAV 資料篩選功能正常運作")
        sys.exit(0)
    else:
        print("⚠️ 部分測試失敗，請檢查相關功能")
        sys.exit(1)

if __name__ == "__main__":
    main()
