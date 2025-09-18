#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
調試前端顯示問題
"""

import requests
import json
from datetime import datetime, timedelta

def test_frontend_debug():
    """調試前端顯示問題"""
    print("🔍 調試前端顯示問題")
    print("=" * 50)
    
    base_url = "http://localhost:5001"
    
    try:
        # 1. 檢查後端事件
        print("1️⃣ 檢查後端事件...")
        events_response = requests.get(f"{base_url}/api/events", timeout=10)
        if events_response.status_code != 200:
            raise Exception(f"事件載入失敗: {events_response.status_code}")
        
        events_data = events_response.json()
        all_events = events_data['data']
        print(f"   ✅ 後端總事件數: {len(all_events)}")
        print(f"   📡 資料來源: {events_data['data_source']}")
        
        # 2. 檢查事件日期分布
        print("\n2️⃣ 檢查事件日期分布...")
        today = datetime.now()
        today_str = today.strftime('%Y-%m-%d')
        
        # 統計不同日期的事件數量
        date_counts = {}
        for event in all_events:
            event_date = event['start'][:10]  # 取日期部分
            date_counts[event_date] = date_counts.get(event_date, 0) + 1
        
        print(f"   📅 事件日期分布 (前10個):")
        sorted_dates = sorted(date_counts.items())
        for date, count in sorted_dates[:10]:
            print(f"      {date}: {count} 個事件")
        
        # 3. 檢查今日事件
        print(f"\n3️⃣ 檢查今日事件 ({today_str})...")
        today_events = [event for event in all_events if event['start'].startswith(today_str)]
        print(f"   📅 今日事件數: {len(today_events)}")
        if today_events:
            print("   今日事件:")
            for event in today_events[:5]:
                print(f"      - {event['title']} ({event['instructor']})")
        
        # 4. 檢查本週事件
        print(f"\n4️⃣ 檢查本週事件...")
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        week_events = []
        for event in all_events:
            event_date = datetime.strptime(event['start'][:10], '%Y-%m-%d')
            if week_start <= event_date <= week_end:
                week_events.append(event)
        
        print(f"   📅 本週事件數: {len(week_events)}")
        print(f"   📅 本週範圍: {week_start.strftime('%Y-%m-%d')} 到 {week_end.strftime('%Y-%m-%d')}")
        if week_events:
            print("   本週事件:")
            for event in week_events[:5]:
                print(f"      - {event['title']} ({event['instructor']})")
        
        # 5. 檢查本月事件
        print(f"\n5️⃣ 檢查本月事件...")
        month_events = []
        for event in all_events:
            event_date = datetime.strptime(event['start'][:10], '%Y-%m-%d')
            if event_date.year == today.year and event_date.month == today.month:
                month_events.append(event)
        
        print(f"   📅 本月事件數: {len(month_events)}")
        print(f"   📅 本月範圍: {today.year}年{today.month}月")
        if month_events:
            print("   本月事件:")
            for event in month_events[:5]:
                print(f"      - {event['title']} ({event['instructor']})")
        
        # 6. 檢查講師分布
        print(f"\n6️⃣ 檢查講師分布...")
        instructor_counts = {}
        for event in all_events:
            instructor = event['instructor']
            instructor_counts[instructor] = instructor_counts.get(instructor, 0) + 1
        
        print(f"   👥 講師分布:")
        for instructor, count in sorted(instructor_counts.items()):
            print(f"      {instructor}: {count} 個事件")
        
        # 7. 檢查前端頁面
        print(f"\n7️⃣ 檢查前端頁面...")
        page_response = requests.get(f"{base_url}/perfect-calendar.html", timeout=10)
        if page_response.status_code == 200:
            print("   ✅ 前端頁面載入成功")
            print("   💡 請打開瀏覽器檢查前端顯示")
        else:
            print(f"   ❌ 前端頁面載入失敗: {page_response.status_code}")
        
        print("\n" + "=" * 50)
        print("🎯 調試結果總結")
        print("=" * 50)
        print(f"📊 後端總事件數: {len(all_events)}")
        print(f"📅 今日事件數: {len(today_events)}")
        print(f"📅 本週事件數: {len(week_events)}")
        print(f"📅 本月事件數: {len(month_events)}")
        print(f"👥 講師數量: {len(instructor_counts)}")
        
        if len(all_events) > 0 and len(today_events) == 0:
            print("\n⚠️ 問題分析:")
            print("   - 後端有事件但今日沒有事件")
            print("   - 前端可能預設顯示今日視圖")
            print("   - 建議檢查前端視圖切換邏輯")
        
        return True
        
    except Exception as e:
        print(f"\n❌ 調試失敗: {str(e)}")
        return False

def main():
    """主函數"""
    print("🚀 開始前端顯示問題調試")
    print("=" * 50)
    
    success = test_frontend_debug()
    
    if success:
        print("\n🎉 調試完成！")
        return 0
    else:
        print("\n❌ 調試失敗！")
        return 1

if __name__ == "__main__":
    exit(main())
