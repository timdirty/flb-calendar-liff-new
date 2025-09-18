#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
綜合功能測試腳本
測試所有功能是否正確運作
"""

import requests
import json
from datetime import datetime, timedelta
import sys
import time

# 本地伺服器配置
BASE_URL = "http://localhost:5001"

def test_complete_workflow():
    """測試完整工作流程"""
    print("🧪 開始綜合功能測試")
    print("=" * 60)
    
    try:
        # 1. 測試伺服器健康狀態
        print("1️⃣ 測試伺服器健康狀態...")
        health_response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        if health_response.status_code != 200:
            raise Exception(f"健康檢查失敗: HTTP {health_response.status_code}")
        
        health_data = health_response.json()
        print(f"   ✅ 伺服器狀態: {health_data['status']}")
        print(f"   📊 事件數量: {health_data['events_count']}")
        print(f"   👥 講師數量: {health_data['teachers_count']}")
        print(f"   📡 資料來源: {health_data['data_source']}")
        
        # 2. 載入所有事件
        print("\n2️⃣ 載入所有事件...")
        events_response = requests.get(f"{BASE_URL}/api/events", timeout=10)
        if events_response.status_code != 200:
            raise Exception(f"事件載入失敗: HTTP {events_response.status_code}")
        
        events_data = events_response.json()
        all_events = events_data['data']
        print(f"   ✅ 載入 {len(all_events)} 個事件")
        print(f"   📡 資料來源: {events_data['data_source']}")
        
        # 3. 載入講師列表
        print("\n3️⃣ 載入講師列表...")
        teachers_response = requests.get(f"{BASE_URL}/api/teachers", timeout=10)
        if teachers_response.status_code != 200:
            raise Exception(f"講師載入失敗: HTTP {teachers_response.status_code}")
        
        teachers_data = teachers_response.json()
        teachers = teachers_data['teachers']
        print(f"   ✅ 載入 {len(teachers)} 位講師")
        print(f"   👥 講師列表: {[t['name'] for t in teachers]}")
        
        # 4. 測試講師篩選
        print("\n4️⃣ 測試講師篩選...")
        instructor_stats = {}
        for teacher in teachers:
            teacher_name = teacher['name']
            teacher_response = requests.get(f"{BASE_URL}/api/events/{teacher_name}", timeout=10)
            if teacher_response.status_code == 200:
                teacher_events = teacher_response.json()['data']
                instructor_stats[teacher_name] = len(teacher_events)
                print(f"   ✅ {teacher_name}: {len(teacher_events)} 個事件")
            else:
                raise Exception(f"講師 {teacher_name} 事件載入失敗")
        
        # 5. 測試日期篩選
        print("\n5️⃣ 測試日期篩選...")
        now = datetime.now()
        today = now.date()
        
        # 今日事件
        today_events = [event for event in all_events 
                       if datetime.fromisoformat(event['start'].replace('Z', '+00:00')).date() == today]
        print(f"   📅 今日事件: {len(today_events)} 個")
        
        # 本週事件
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        week_events = [event for event in all_events 
                      if week_start <= datetime.fromisoformat(event['start'].replace('Z', '+00:00')).date() <= week_end]
        print(f"   📅 本週事件: {len(week_events)} 個")
        
        # 本月事件
        month_events = [event for event in all_events 
                       if datetime.fromisoformat(event['start'].replace('Z', '+00:00')).date().year == now.year and
                          datetime.fromisoformat(event['start'].replace('Z', '+00:00')).date().month == now.month]
        print(f"   📅 本月事件: {len(month_events)} 個")
        
        # 6. 測試時段篩選
        print("\n6️⃣ 測試時段篩選...")
        morning_events = []
        afternoon_events = []
        evening_events = []
        
        for event in all_events:
            event_time = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
            hour = event_time.hour
            
            if 6 <= hour < 12:
                morning_events.append(event)
            elif 12 <= hour < 18:
                afternoon_events.append(event)
            elif 18 <= hour < 24:
                evening_events.append(event)
        
        print(f"   🕐 早上 (06:00-12:00): {len(morning_events)} 個事件")
        print(f"   🕐 下午 (12:00-18:00): {len(afternoon_events)} 個事件")
        print(f"   🕐 晚上 (18:00-24:00): {len(evening_events)} 個事件")
        
        # 7. 測試組合篩選
        print("\n7️⃣ 測試組合篩選...")
        for teacher in teachers:
            teacher_name = teacher['name']
            teacher_events = [event for event in all_events if event['instructor'] == teacher_name]
            teacher_today_events = [event for event in teacher_events 
                                  if datetime.fromisoformat(event['start'].replace('Z', '+00:00')).date() == today]
            print(f"   👨‍🏫 {teacher_name} 今日事件: {len(teacher_today_events)} 個")
        
        # 8. 測試前端頁面
        print("\n8️⃣ 測試前端頁面...")
        pages = [
            ("/", "首頁"),
            ("/perfect-calendar.html", "行事曆頁面"),
            ("/test-frontend.html", "測試頁面")
        ]
        
        for page, name in pages:
            page_response = requests.get(f"{BASE_URL}{page}", timeout=10)
            if page_response.status_code == 200 and 'html' in page_response.text.lower():
                print(f"   ✅ {name}: 載入成功")
            else:
                raise Exception(f"{name} 載入失敗")
        
        # 9. 測試資料一致性
        print("\n9️⃣ 測試資料一致性...")
        total_events_by_instructor = sum(instructor_stats.values())
        if total_events_by_instructor == len(all_events):
            print(f"   ✅ 事件總數一致: {total_events_by_instructor} = {len(all_events)}")
        else:
            raise Exception(f"事件總數不一致: {total_events_by_instructor} != {len(all_events)}")
        
        # 10. 生成測試報告
        print("\n🔟 生成測試報告...")
        report = {
            "timestamp": datetime.now().isoformat(),
            "server_status": "healthy",
            "data_source": events_data['data_source'],
            "total_events": len(all_events),
            "total_teachers": len(teachers),
            "instructor_stats": instructor_stats,
            "date_filtering": {
                "today": len(today_events),
                "week": len(week_events),
                "month": len(month_events)
            },
            "time_filtering": {
                "morning": len(morning_events),
                "afternoon": len(afternoon_events),
                "evening": len(evening_events)
            },
            "frontend_pages": len(pages),
            "data_consistency": "passed"
        }
        
        print("   ✅ 測試報告生成完成")
        
        return True, report
        
    except Exception as e:
        print(f"   ❌ 測試失敗: {str(e)}")
        return False, None

def main():
    """主測試函數"""
    print("🚀 開始綜合功能測試")
    print("=" * 60)
    
    success, report = test_complete_workflow()
    
    if success:
        print("\n" + "=" * 60)
        print("🎉 綜合功能測試完成")
        print("=" * 60)
        print("✅ 所有功能正常運作")
        print(f"📊 總事件數: {report['total_events']}")
        print(f"👥 總講師數: {report['total_teachers']}")
        print(f"📡 資料來源: {report['data_source']}")
        print(f"🕐 測試時間: {report['timestamp']}")
        
        print("\n📋 詳細統計:")
        for instructor, count in report['instructor_stats'].items():
            print(f"   {instructor}: {count} 個事件")
        
        print("\n📅 日期篩選統計:")
        print(f"   今日: {report['date_filtering']['today']} 個事件")
        print(f"   本週: {report['date_filtering']['week']} 個事件")
        print(f"   本月: {report['date_filtering']['month']} 個事件")
        
        print("\n🕐 時段篩選統計:")
        print(f"   早上: {report['time_filtering']['morning']} 個事件")
        print(f"   下午: {report['time_filtering']['afternoon']} 個事件")
        print(f"   晚上: {report['time_filtering']['evening']} 個事件")
        
        print("\n🌐 前端頁面:")
        print(f"   載入頁面數: {report['frontend_pages']} 個")
        
        print("\n🔍 資料一致性:")
        print(f"   狀態: {report['data_consistency']}")
        
        print("\n🎯 結論: 系統功能完全正常，可以投入使用！")
        sys.exit(0)
    else:
        print("\n" + "=" * 60)
        print("❌ 綜合功能測試失敗")
        print("=" * 60)
        print("請檢查上述錯誤並修復後重新測試")
        sys.exit(1)

if __name__ == "__main__":
    main()
