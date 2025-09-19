#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試視圖篩選邏輯
"""

import requests
import json
from datetime import datetime, timedelta

def test_view_filtering():
    """測試視圖篩選邏輯"""
    print("🔄 測試視圖篩選邏輯...")
    
    try:
        # 獲取事件數據
        response = requests.get('http://localhost:5001/api/events', timeout=10)
        if response.status_code == 200:
            data = response.json()
            events = data['data']
            print(f"✅ 獲取 {len(events)} 個事件")
            
            # 分析事件日期分布
            now = datetime.now()
            today = datetime(now.year, now.month, now.day)
            
            # 計算本週範圍
            day_of_week = now.weekday()  # 0=Monday, 6=Sunday
            days_to_monday = day_of_week
            week_start = today - timedelta(days=days_to_monday)
            week_end = week_start + timedelta(days=6)
            week_end = week_end.replace(hour=23, minute=59, second=59, microsecond=999)
            
            # 統計各視圖的事件數量
            today_events = []
            week_events = []
            month_events = []
            all_events = []
            
            for event in events:
                event_date = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
                event_date_local = event_date.replace(tzinfo=None)
                
                # 今日
                if (event_date_local.year == today.year and 
                    event_date_local.month == today.month and 
                    event_date_local.day == today.day):
                    today_events.append(event)
                
                # 本週
                if week_start <= event_date_local <= week_end:
                    week_events.append(event)
                
                # 本月
                if (event_date_local.year == now.year and 
                    event_date_local.month == now.month):
                    month_events.append(event)
                
                # 全部
                all_events.append(event)
            
            print(f"\n📊 視圖篩選統計:")
            print(f"今日: {len(today_events)} 個事件")
            print(f"本週: {len(week_events)} 個事件")
            print(f"本月: {len(month_events)} 個事件")
            print(f"全部: {len(all_events)} 個事件")
            
            # 檢查本週範圍
            print(f"\n📅 本週範圍: {week_start.strftime('%Y-%m-%d')} 到 {week_end.strftime('%Y-%m-%d')}")
            print(f"今天: {today.strftime('%Y-%m-%d %A')}")
            
            # 顯示一些樣本事件
            print(f"\n📋 今日事件樣本:")
            for i, event in enumerate(today_events[:3]):
                event_date = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
                print(f"  {i+1}. {event['title']} - {event_date.strftime('%Y-%m-%d %H:%M')}")
            
            print(f"\n📋 本週事件樣本:")
            for i, event in enumerate(week_events[:3]):
                event_date = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
                print(f"  {i+1}. {event['title']} - {event_date.strftime('%Y-%m-%d %H:%M')}")
            
            print(f"\n📋 本月事件樣本:")
            for i, event in enumerate(month_events[:3]):
                event_date = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
                print(f"  {i+1}. {event['title']} - {event_date.strftime('%Y-%m-%d %H:%M')}")
            
            # 測試前端篩選
            print(f"\n🌐 測試前端篩選...")
            frontend_response = requests.get('http://localhost:5001/perfect-calendar.html', timeout=10)
            if frontend_response.status_code == 200:
                print("✅ 前端頁面載入成功")
                
                # 檢查篩選邏輯
                if 'getViewFilteredEvents' in frontend_response.text:
                    print("❌ 發現未使用的 getViewFilteredEvents 函數")
                else:
                    print("✅ 沒有未使用的篩選函數")
                
                # 檢查 renderEvents 中的視圖篩選
                if 'case \'本週\':' in frontend_response.text:
                    print("✅ renderEvents 包含本週篩選邏輯")
                else:
                    print("❌ renderEvents 缺少本週篩選邏輯")
                
                if 'case \'本月\':' in frontend_response.text:
                    print("✅ renderEvents 包含本月篩選邏輯")
                else:
                    print("❌ renderEvents 缺少本月篩選邏輯")
                
                if 'case \'全部\':' in frontend_response.text:
                    print("✅ renderEvents 包含全部篩選邏輯")
                else:
                    print("❌ renderEvents 缺少全部篩選邏輯")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_view_filtering()
