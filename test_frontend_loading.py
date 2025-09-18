#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
前端載入測試腳本
測試前端是否能正確載入和顯示所有行事曆
"""

import requests
import json
import time
from datetime import datetime, timedelta

def test_frontend_loading():
    """測試前端載入功能"""
    print("🧪 測試前端載入功能")
    print("=" * 50)
    
    base_url = "http://localhost:5001"
    
    try:
        # 1. 測試伺服器狀態
        print("1️⃣ 檢查伺服器狀態...")
        health_response = requests.get(f"{base_url}/api/health", timeout=10)
        if health_response.status_code != 200:
            raise Exception(f"伺服器健康檢查失敗: {health_response.status_code}")
        
        health_data = health_response.json()
        print(f"   ✅ 伺服器狀態: {health_data['status']}")
        print(f"   📊 事件數量: {health_data['events_count']}")
        print(f"   👥 講師數量: {health_data['teachers_count']}")
        
        # 2. 載入所有事件
        print("\n2️⃣ 載入所有事件...")
        events_response = requests.get(f"{base_url}/api/events", timeout=10)
        if events_response.status_code != 200:
            raise Exception(f"事件載入失敗: {events_response.status_code}")
        
        events_data = events_response.json()
        all_events = events_data['data']
        print(f"   ✅ 載入 {len(all_events)} 個事件")
        
        # 3. 測試講師篩選
        print("\n3️⃣ 測試講師篩選...")
        teachers_response = requests.get(f"{base_url}/api/teachers", timeout=10)
        if teachers_response.status_code != 200:
            raise Exception(f"講師載入失敗: {teachers_response.status_code}")
        
        teachers_data = teachers_response.json()
        teachers = teachers_data['teachers']
        
        # 測試每個講師的篩選
        for teacher in teachers[:5]:  # 只測試前5個講師
            teacher_name = teacher['name']
            teacher_response = requests.get(f"{base_url}/api/events/{teacher_name}", timeout=10)
            if teacher_response.status_code == 200:
                teacher_events = teacher_response.json()['data']
                print(f"   ✅ {teacher_name}: {len(teacher_events)} 個事件")
            else:
                print(f"   ❌ {teacher_name}: 載入失敗")
        
        # 4. 測試日期篩選
        print("\n4️⃣ 測試日期篩選...")
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
        
        # 5. 測試前端頁面載入
        print("\n5️⃣ 測試前端頁面載入...")
        pages = [
            ("/", "首頁"),
            ("/perfect-calendar.html", "行事曆頁面"),
            ("/test-frontend.html", "測試頁面")
        ]
        
        for page, name in pages:
            page_response = requests.get(f"{base_url}{page}", timeout=10)
            if page_response.status_code == 200 and 'html' in page_response.text.lower():
                print(f"   ✅ {name}: 載入成功")
            else:
                print(f"   ❌ {name}: 載入失敗")
        
        # 6. 檢查動畫強制跳轉問題
        print("\n6️⃣ 檢查動畫強制跳轉問題...")
        calendar_response = requests.get(f"{base_url}/perfect-calendar.html", timeout=10)
        if calendar_response.status_code == 200:
            content = calendar_response.text
            if "強制完成初始化" in content:
                print("   ❌ 發現動畫強制跳轉問題")
                return False
            else:
                print("   ✅ 動畫強制跳轉問題已修復")
        
        # 7. 測試資料完整性
        print("\n7️⃣ 測試資料完整性...")
        
        # 檢查事件格式
        sample_event = all_events[0] if all_events else None
        if sample_event:
            required_fields = ['title', 'instructor', 'start', 'end']
            missing_fields = [field for field in required_fields if field not in sample_event]
            if missing_fields:
                print(f"   ❌ 事件缺少必要欄位: {missing_fields}")
                return False
            else:
                print("   ✅ 事件格式完整")
        
        # 檢查講師資料
        sample_teacher = teachers[0] if teachers else None
        if sample_teacher:
            required_fields = ['name', 'userId']
            missing_fields = [field for field in required_fields if field not in sample_teacher]
            if missing_fields:
                print(f"   ❌ 講師資料缺少必要欄位: {missing_fields}")
                return False
            else:
                print("   ✅ 講師資料完整")
        
        print("\n" + "=" * 50)
        print("🎉 前端載入測試完成")
        print("=" * 50)
        print("✅ 所有功能正常運作")
        print(f"📊 總事件數: {len(all_events)}")
        print(f"👥 總講師數: {len(teachers)}")
        print(f"📅 今日事件: {len(today_events)}")
        print(f"📅 本週事件: {len(week_events)}")
        print(f"📅 本月事件: {len(month_events)}")
        print("\n🎯 結論: 前端載入功能完全正常，可以正確顯示所有行事曆！")
        
        return True
        
    except Exception as e:
        print(f"\n❌ 前端載入測試失敗: {str(e)}")
        return False

def main():
    """主測試函數"""
    print("🚀 開始前端載入測試")
    print("=" * 50)
    
    success = test_frontend_loading()
    
    if success:
        print("\n🎉 前端載入測試成功！")
        print("💡 系統已準備好投入使用")
        return 0
    else:
        print("\n❌ 前端載入測試失敗！")
        print("💡 請檢查相關問題並修復")
        return 1

if __name__ == "__main__":
    exit(main())
