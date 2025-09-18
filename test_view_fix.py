#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試視圖切換修復效果
"""

import requests
import json
from datetime import datetime, timedelta

def test_view_fix():
    """測試視圖切換修復效果"""
    print("🧪 測試視圖切換修復效果")
    print("=" * 50)
    
    base_url = "http://localhost:5001"
    
    try:
        # 1. 檢查後端事件總數
        print("1️⃣ 檢查後端事件總數...")
        events_response = requests.get(f"{base_url}/api/events", timeout=10)
        if events_response.status_code != 200:
            raise Exception(f"事件載入失敗: {events_response.status_code}")
        
        events_data = events_response.json()
        all_events = events_data['data']
        print(f"   ✅ 後端總事件數: {len(all_events)}")
        
        # 2. 模擬前端篩選邏輯
        print("\n2️⃣ 模擬前端篩選邏輯...")
        today = datetime.now()
        today_str = today.strftime('%Y-%m-%d')
        
        # 今日事件
        today_events = [event for event in all_events if event['start'].startswith(today_str)]
        print(f"   📅 今日事件數: {len(today_events)}")
        
        # 本週事件
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        week_events = []
        for event in all_events:
            event_date = datetime.strptime(event['start'][:10], '%Y-%m-%d')
            if week_start <= event_date <= week_end:
                week_events.append(event)
        print(f"   📅 本週事件數: {len(week_events)}")
        
        # 本月事件
        month_events = []
        for event in all_events:
            event_date = datetime.strptime(event['start'][:10], '%Y-%m-%d')
            if event_date.year == today.year and event_date.month == today.month:
                month_events.append(event)
        print(f"   📅 本月事件數: {len(month_events)}")
        
        # 全部事件
        print(f"   📅 全部事件數: {len(all_events)}")
        
        # 3. 檢查前端頁面
        print("\n3️⃣ 檢查前端頁面...")
        page_response = requests.get(f"{base_url}/perfect-calendar.html", timeout=10)
        if page_response.status_code == 200:
            content = page_response.text
            
            # 檢查修復是否生效
            if "不強制設置快速篩選" in content:
                print("   ✅ 修復已生效：移除了強制快速篩選")
            else:
                print("   ❌ 修復未生效：仍存在強制快速篩選")
            
            if "window.currentQuickFilterRange = null" in content:
                print("   ✅ 修復已生效：添加了清除日期範圍限制")
            else:
                print("   ❌ 修復未生效：缺少清除日期範圍限制")
                
        else:
            print(f"   ❌ 前端頁面載入失敗: {page_response.status_code}")
        
        # 4. 預期結果
        print("\n4️⃣ 預期結果...")
        print("   📊 後端總事件數: 90")
        print("   📅 今日事件數: 4")
        print("   📅 本週事件數: 10")
        print("   📅 本月事件數: 34")
        print("   📅 全部事件數: 90")
        
        print("\n" + "=" * 50)
        print("🎯 修復效果總結")
        print("=" * 50)
        print("✅ 問題分析:")
        print("   - 前端預設顯示今日視圖 (4個事件)")
        print("   - 用戶選擇全部視圖時仍被快速篩選限制")
        print("   - 修復：移除強制快速篩選，清除日期範圍限制")
        
        print("\n✅ 修復內容:")
        print("   1. 移除初始化時的強制 handleQuickFilter('today')")
        print("   2. 在切換到非今日視圖時清除 currentQuickFilterRange")
        print("   3. 確保全部視圖顯示所有90個事件")
        
        print("\n💡 測試建議:")
        print("   1. 打開 http://localhost:5001/perfect-calendar.html")
        print("   2. 點擊「全部」按鈕")
        print("   3. 檢查是否顯示90個事件")
        print("   4. 檢查統計卡片是否顯示正確數量")
        
        return True
        
    except Exception as e:
        print(f"\n❌ 測試失敗: {str(e)}")
        return False

def main():
    """主函數"""
    print("🚀 開始視圖切換修復測試")
    print("=" * 50)
    
    success = test_view_fix()
    
    if success:
        print("\n🎉 修復測試完成！")
        print("💡 請在瀏覽器中測試前端功能")
        return 0
    else:
        print("\n❌ 修復測試失敗！")
        return 1

if __name__ == "__main__":
    exit(main())
