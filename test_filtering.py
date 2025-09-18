#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
篩選功能測試腳本
透過命令列自檢篩選功能
"""

import requests
import json
from datetime import datetime, timedelta
import sys

# 本地伺服器配置
BASE_URL = "http://localhost:5000"

def test_api_health():
    """測試 API 健康狀態"""
    print("🔍 測試 API 健康狀態...")
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API 健康狀態: {data['status']}")
            print(f"📊 事件數量: {data['events_count']}")
            print(f"👥 講師數量: {data['teachers_count']}")
            return True
        else:
            print(f"❌ API 健康檢查失敗: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ 無法連接到本地伺服器: {e}")
        print("💡 請先啟動本地伺服器: python local_server.py")
        return False

def test_get_events():
    """測試獲取所有事件"""
    print("\n🔍 測試獲取所有事件...")
    try:
        response = requests.get(f"{BASE_URL}/api/events", timeout=10)
        if response.status_code == 200:
            data = response.json()
            events = data['data']
            print(f"✅ 成功獲取 {len(events)} 個事件")
            
            # 分析事件資料
            instructors = set(event['instructor'] for event in events)
            print(f"👥 講師列表: {sorted(instructors)}")
            
            # 按講師分組統計
            instructor_counts = {}
            for event in events:
                instructor = event['instructor']
                instructor_counts[instructor] = instructor_counts.get(instructor, 0) + 1
            
            print("📊 各講師事件數量:")
            for instructor, count in sorted(instructor_counts.items()):
                print(f"   {instructor}: {count} 個事件")
            
            return events
        else:
            print(f"❌ 獲取事件失敗: {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
        return None

def test_get_events_by_instructor(instructor):
    """測試根據講師獲取事件"""
    print(f"\n🔍 測試獲取講師 {instructor} 的事件...")
    try:
        response = requests.get(f"{BASE_URL}/api/events/{instructor}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            events = data['data']
            print(f"✅ 成功獲取講師 {instructor} 的 {len(events)} 個事件")
            
            # 驗證所有事件都屬於該講師
            for event in events:
                if event['instructor'] != instructor:
                    print(f"❌ 發現不屬於講師 {instructor} 的事件: {event['title']}")
                    return False
            
            print(f"✅ 所有事件都屬於講師 {instructor}")
            return events
        else:
            print(f"❌ 獲取講師 {instructor} 的事件失敗: {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
        return None

def test_date_filtering(events):
    """測試日期篩選功能"""
    print("\n🔍 測試日期篩選功能...")
    
    if not events:
        print("❌ 沒有事件資料可供測試")
        return False
    
    # 獲取今天的日期
    today = datetime.now().date()
    today_events = []
    
    for event in events:
        event_date = datetime.fromisoformat(event['start'].replace('Z', '+00:00')).date()
        if event_date == today:
            today_events.append(event)
    
    print(f"📅 今天 ({today}) 的事件數量: {len(today_events)}")
    
    if today_events:
        print("📋 今天的事件:")
        for event in today_events[:5]:  # 只顯示前5個
            print(f"   - {event['title']} ({event['instructor']})")
        if len(today_events) > 5:
            print(f"   ... 還有 {len(today_events) - 5} 個事件")
    else:
        print("ℹ️ 今天沒有事件")
    
    return True

def test_time_filtering(events):
    """測試時段篩選功能"""
    print("\n🔍 測試時段篩選功能...")
    
    if not events:
        print("❌ 沒有事件資料可供測試")
        return False
    
    time_slots = {
        'morning': (6, 12),
        'afternoon': (12, 18),
        'evening': (18, 24)
    }
    
    for slot_name, (start_hour, end_hour) in time_slots.items():
        slot_events = []
        for event in events:
            event_time = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
            hour = event_time.hour
            if start_hour <= hour < end_hour:
                slot_events.append(event)
        
        print(f"🕐 {slot_name} ({start_hour:02d}:00-{end_hour:02d}:00): {len(slot_events)} 個事件")
        
        if slot_events:
            for event in slot_events[:3]:  # 只顯示前3個
                event_time = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
                print(f"   - {event_time.strftime('%H:%M')} {event['title']} ({event['instructor']})")
            if len(slot_events) > 3:
                print(f"   ... 還有 {len(slot_events) - 3} 個事件")
    
    return True

def test_instructor_filtering(events):
    """測試講師篩選功能"""
    print("\n🔍 測試講師篩選功能...")
    
    if not events:
        print("❌ 沒有事件資料可供測試")
        return False
    
    # 獲取所有講師
    instructors = set(event['instructor'] for event in events)
    print(f"👥 可用講師: {sorted(instructors)}")
    
    # 測試每個講師的篩選
    for instructor in sorted(instructors):
        instructor_events = [event for event in events if event['instructor'] == instructor]
        print(f"👨‍🏫 講師 {instructor}: {len(instructor_events)} 個事件")
        
        # 測試 API 篩選
        api_events = test_get_events_by_instructor(instructor)
        if api_events is not None:
            if len(api_events) == len(instructor_events):
                print(f"   ✅ API 篩選結果正確")
            else:
                print(f"   ❌ API 篩選結果不正確: 預期 {len(instructor_events)}, 實際 {len(api_events)}")
    
    return True

def test_view_filtering(events):
    """測試視圖篩選功能"""
    print("\n🔍 測試視圖篩選功能...")
    
    if not events:
        print("❌ 沒有事件資料可供測試")
        return False
    
    today = datetime.now().date()
    
    # 今日視圖
    today_events = [event for event in events 
                   if datetime.fromisoformat(event['start'].replace('Z', '+00:00')).date() == today]
    print(f"📅 今日視圖: {len(today_events)} 個事件")
    
    # 本週視圖
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)
    week_events = [event for event in events 
                  if week_start <= datetime.fromisoformat(event['start'].replace('Z', '+00:00')).date() <= week_end]
    print(f"📅 本週視圖 ({week_start} - {week_end}): {len(week_events)} 個事件")
    
    # 本月視圖
    month_start = today.replace(day=1)
    if today.month == 12:
        month_end = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
    else:
        month_end = today.replace(month=today.month + 1, day=1) - timedelta(days=1)
    
    month_events = [event for event in events 
                   if month_start <= datetime.fromisoformat(event['start'].replace('Z', '+00:00')).date() <= month_end]
    print(f"📅 本月視圖 ({month_start} - {month_end}): {len(month_events)} 個事件")
    
    # 全部視圖
    all_events = events
    print(f"📅 全部視圖: {len(all_events)} 個事件")
    
    return True

def main():
    """主測試函數"""
    print("🧪 開始篩選功能測試")
    print("=" * 50)
    
    # 測試 API 健康狀態
    if not test_api_health():
        print("\n❌ API 健康檢查失敗，無法繼續測試")
        sys.exit(1)
    
    # 獲取所有事件
    events = test_get_events()
    if not events:
        print("\n❌ 無法獲取事件資料，測試終止")
        sys.exit(1)
    
    # 執行各種篩選測試
    test_results = []
    
    test_results.append(("日期篩選", test_date_filtering(events)))
    test_results.append(("時段篩選", test_time_filtering(events)))
    test_results.append(("講師篩選", test_instructor_filtering(events)))
    test_results.append(("視圖篩選", test_view_filtering(events)))
    
    # 顯示測試結果摘要
    print("\n" + "=" * 50)
    print("📊 測試結果摘要")
    print("=" * 50)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ 通過" if result else "❌ 失敗"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\n總計: {passed}/{total} 項測試通過")
    
    if passed == total:
        print("🎉 所有測試通過！篩選功能正常運作")
        sys.exit(0)
    else:
        print("⚠️ 部分測試失敗，請檢查相關功能")
        sys.exit(1)

if __name__ == "__main__":
    main()
