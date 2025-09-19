#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試篩選邏輯修復
"""

import requests
import json
from datetime import datetime, timedelta

def test_filter_fix():
    """測試篩選邏輯修復"""
    print("🔄 測試篩選邏輯修復...")
    
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
            
            # 檢查前端頁面
            print(f"\n🌐 檢查前端頁面...")
            frontend_response = requests.get('http://localhost:5001/perfect-calendar.html', timeout=10)
            if frontend_response.status_code == 200:
                print("✅ 前端頁面載入成功")
                
                # 檢查未使用的函數是否已移除
                if 'function getViewFilteredEvents()' not in frontend_response.text:
                    print("✅ 未使用的 getViewFilteredEvents 函數已移除")
                else:
                    print("❌ 未使用的 getViewFilteredEvents 函數仍然存在")
                
                # 檢查 updateStats 是否已簡化
                if 'const filteredEvents = getFilteredEvents();' in frontend_response.text:
                    print("✅ updateStats 已簡化，使用 getFilteredEvents")
                else:
                    print("❌ updateStats 未簡化")
                
                # 檢查重複篩選邏輯是否已移除
                switch_count = frontend_response.text.count('switch (currentView)')
                if switch_count <= 2:  # 只應該在 renderEvents 和 updateStats 的日期範圍計算中
                    print(f"✅ 重複篩選邏輯已移除，switch (currentView) 出現 {switch_count} 次")
                else:
                    print(f"❌ 重複篩選邏輯仍然存在，switch (currentView) 出現 {switch_count} 次")
                
                # 檢查核心功能是否保留
                core_functions = [
                    'renderEvents',
                    'updateStats',
                    'getFilteredEvents',
                    'switchView'
                ]
                
                missing_functions = []
                for func in core_functions:
                    if func not in frontend_response.text:
                        missing_functions.append(func)
                
                if not missing_functions:
                    print("✅ 核心功能保留：所有核心功能都已保留")
                else:
                    print(f"❌ 核心功能保留：缺少功能 {missing_functions}")
                
                # 檢查篩選邏輯是否正確
                if 'case \'本週\':' in frontend_response.text and 'case \'本月\':' in frontend_response.text and 'case \'全部\':' in frontend_response.text:
                    print("✅ 篩選邏輯完整：包含本週、本月、全部篩選")
                else:
                    print("❌ 篩選邏輯不完整：缺少部分篩選邏輯")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_filter_fix()
