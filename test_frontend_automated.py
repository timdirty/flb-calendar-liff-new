#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
前端功能自動化測試腳本
使用 Selenium 或 requests 測試前端功能
"""

import requests
import json
from datetime import datetime, timedelta
import sys
import time

# 本地伺服器配置
BASE_URL = "http://localhost:5001"

def test_api_endpoints():
    """測試所有 API 端點"""
    print("🔍 測試 API 端點...")
    
    endpoints = [
        ("/api/health", "健康檢查"),
        ("/api/debug", "調試信息"),
        ("/api/events", "所有事件"),
        ("/api/teachers", "講師列表")
    ]
    
    results = []
    
    for endpoint, name in endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
            if response.status_code == 200:
                print(f"✅ {name}: OK")
                results.append((name, True, response.json() if 'json' in response.headers.get('content-type', '') else response.text[:100]))
            else:
                print(f"❌ {name}: HTTP {response.status_code}")
                results.append((name, False, f"HTTP {response.status_code}"))
        except Exception as e:
            print(f"❌ {name}: {str(e)}")
            results.append((name, False, str(e)))
    
    return results

def test_instructor_endpoints():
    """測試講師相關端點"""
    print("\n🔍 測試講師相關端點...")
    
    # 先獲取講師列表
    try:
        response = requests.get(f"{BASE_URL}/api/teachers", timeout=10)
        if response.status_code != 200:
            print("❌ 無法獲取講師列表")
            return False
        
        teachers_data = response.json()
        teachers = teachers_data['teachers']
        print(f"✅ 獲取到 {len(teachers)} 位講師")
        
        # 測試每個講師的事件端點
        for teacher in teachers:
            teacher_name = teacher['name']
            try:
                response = requests.get(f"{BASE_URL}/api/events/{teacher_name}", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ {teacher_name}: {data['total']} 個事件")
                else:
                    print(f"❌ {teacher_name}: HTTP {response.status_code}")
                    return False
            except Exception as e:
                print(f"❌ {teacher_name}: {str(e)}")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ 講師端點測試失敗: {str(e)}")
        return False

def test_filtering_logic():
    """測試篩選邏輯"""
    print("\n🔍 測試篩選邏輯...")
    
    try:
        # 獲取所有事件
        response = requests.get(f"{BASE_URL}/api/events", timeout=10)
        if response.status_code != 200:
            print("❌ 無法獲取所有事件")
            return False
        
        all_events = response.json()['data']
        print(f"✅ 獲取到 {len(all_events)} 個事件")
        
        # 測試日期篩選
        now = datetime.now()
        today = now.date()
        
        today_events = []
        week_events = []
        month_events = []
        
        for event in all_events:
            event_date = datetime.fromisoformat(event['start'].replace('Z', '+00:00')).date()
            
            if event_date == today:
                today_events.append(event)
            
            # 本週篩選
            week_start = today - timedelta(days=today.weekday())
            week_end = week_start + timedelta(days=6)
            if week_start <= event_date <= week_end:
                week_events.append(event)
            
            # 本月篩選
            if event_date.year == now.year and event_date.month == now.month:
                month_events.append(event)
        
        print(f"📅 今日事件: {len(today_events)} 個")
        print(f"📅 本週事件: {len(week_events)} 個")
        print(f"📅 本月事件: {len(month_events)} 個")
        
        # 測試講師篩選
        instructors = set(event['instructor'] for event in all_events)
        print(f"👥 講師列表: {sorted(instructors)}")
        
        for instructor in sorted(instructors):
            instructor_events = [event for event in all_events if event['instructor'] == instructor]
            print(f"👨‍🏫 {instructor}: {len(instructor_events)} 個事件")
        
        # 測試時段篩選
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
        
        print(f"🕐 早上事件: {len(morning_events)} 個")
        print(f"🕐 下午事件: {len(afternoon_events)} 個")
        print(f"🕐 晚上事件: {len(evening_events)} 個")
        
        return True
        
    except Exception as e:
        print(f"❌ 篩選邏輯測試失敗: {str(e)}")
        return False

def test_frontend_page():
    """測試前端頁面載入"""
    print("\n🔍 測試前端頁面載入...")
    
    pages = [
        ("/", "首頁"),
        ("/perfect-calendar.html", "行事曆頁面"),
        ("/test-frontend.html", "測試頁面")
    ]
    
    results = []
    
    for page, name in pages:
        try:
            response = requests.get(f"{BASE_URL}{page}", timeout=10)
            if response.status_code == 200:
                content = response.text
                if 'html' in content.lower():
                    print(f"✅ {name}: HTML 頁面載入成功")
                    results.append((name, True, f"HTML 頁面 ({len(content)} 字元)"))
                else:
                    print(f"⚠️ {name}: 非 HTML 內容")
                    results.append((name, False, "非 HTML 內容"))
            else:
                print(f"❌ {name}: HTTP {response.status_code}")
                results.append((name, False, f"HTTP {response.status_code}"))
        except Exception as e:
            print(f"❌ {name}: {str(e)}")
            results.append((name, False, str(e)))
    
    return results

def test_data_consistency():
    """測試資料一致性"""
    print("\n🔍 測試資料一致性...")
    
    try:
        # 獲取所有事件
        events_response = requests.get(f"{BASE_URL}/api/events", timeout=10)
        if events_response.status_code != 200:
            print("❌ 無法獲取所有事件")
            return False
        
        all_events = events_response.json()['data']
        
        # 獲取講師列表
        teachers_response = requests.get(f"{BASE_URL}/api/teachers", timeout=10)
        if teachers_response.status_code != 200:
            print("❌ 無法獲取講師列表")
            return False
        
        teachers = teachers_response.json()['teachers']
        teacher_names = [t['name'] for t in teachers]
        
        # 檢查事件中的講師是否都在講師列表中
        event_instructors = set(event['instructor'] for event in all_events)
        missing_instructors = event_instructors - set(teacher_names)
        
        if missing_instructors:
            print(f"⚠️ 事件中有講師不在講師列表中: {missing_instructors}")
        else:
            print("✅ 所有事件講師都在講師列表中")
        
        # 檢查講師事件數量一致性
        for teacher in teachers:
            teacher_name = teacher['name']
            
            # 從所有事件中篩選
            filtered_events = [event for event in all_events if event['instructor'] == teacher_name]
            
            # 從 API 端點獲取
            try:
                api_response = requests.get(f"{BASE_URL}/api/events/{teacher_name}", timeout=10)
                if api_response.status_code == 200:
                    api_events = api_response.json()['data']
                    
                    if len(filtered_events) == len(api_events):
                        print(f"✅ {teacher_name}: 事件數量一致 ({len(filtered_events)} 個)")
                    else:
                        print(f"❌ {teacher_name}: 事件數量不一致 (篩選: {len(filtered_events)}, API: {len(api_events)})")
                        return False
                else:
                    print(f"❌ {teacher_name}: API 請求失敗")
                    return False
            except Exception as e:
                print(f"❌ {teacher_name}: API 請求錯誤: {str(e)}")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ 資料一致性測試失敗: {str(e)}")
        return False

def main():
    """主測試函數"""
    print("🧪 開始前端功能自動化測試")
    print("=" * 60)
    
    # 執行所有測試
    test_results = []
    
    # API 端點測試
    api_results = test_api_endpoints()
    test_results.append(("API 端點", all(result[1] for result in api_results)))
    
    # 講師端點測試
    instructor_ok = test_instructor_endpoints()
    test_results.append(("講師端點", instructor_ok))
    
    # 篩選邏輯測試
    filtering_ok = test_filtering_logic()
    test_results.append(("篩選邏輯", filtering_ok))
    
    # 前端頁面測試
    page_results = test_frontend_page()
    test_results.append(("前端頁面", all(result[1] for result in page_results)))
    
    # 資料一致性測試
    consistency_ok = test_data_consistency()
    test_results.append(("資料一致性", consistency_ok))
    
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
        print("🎉 所有測試通過！前端功能正常運作")
        sys.exit(0)
    else:
        print("⚠️ 部分測試失敗，請檢查相關功能")
        sys.exit(1)

if __name__ == "__main__":
    main()
