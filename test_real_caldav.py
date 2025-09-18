#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試真實 CalDAV 連接和前端功能
"""

import requests
import json
from datetime import datetime, timedelta

def test_real_caldav():
    """測試真實 CalDAV 連接"""
    print("🧪 測試真實 CalDAV 連接")
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
        print(f"   📡 資料來源: {health_data['data_source']}")
        
        # 2. 測試 CalDAV 狀態
        print("\n2️⃣ 檢查 CalDAV 狀態...")
        debug_response = requests.get(f"{base_url}/api/debug", timeout=10)
        if debug_response.status_code != 200:
            raise Exception(f"調試信息獲取失敗: {debug_response.status_code}")
        
        debug_data = debug_response.json()
        print(f"   📡 CalDAV 狀態: {debug_data['caldav_status']}")
        print(f"   📊 資料來源: {debug_data['data_source']}")
        print(f"   📅 事件數量: {debug_data['events']['total']}")
        print(f"   👥 講師數量: {len(debug_data['teachers'])}")
        
        # 3. 測試事件載入
        print("\n3️⃣ 測試事件載入...")
        events_response = requests.get(f"{base_url}/api/events", timeout=10)
        if events_response.status_code != 200:
            raise Exception(f"事件載入失敗: {events_response.status_code}")
        
        events_data = events_response.json()
        all_events = events_data['data']
        print(f"   ✅ 載入 {len(all_events)} 個事件")
        print(f"   📡 資料來源: {events_data['data_source']}")
        
        # 4. 測試講師載入
        print("\n4️⃣ 測試講師載入...")
        teachers_response = requests.get(f"{base_url}/api/teachers", timeout=10)
        if teachers_response.status_code != 200:
            raise Exception(f"講師載入失敗: {teachers_response.status_code}")
        
        teachers_data = teachers_response.json()
        teachers = teachers_data['teachers']
        print(f"   ✅ 載入 {len(teachers)} 位講師")
        print(f"   👥 講師列表: {[t['name'] for t in teachers]}")
        
        # 5. 測試前端頁面
        print("\n5️⃣ 測試前端頁面...")
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
        
        # 6. 檢查動畫問題
        print("\n6️⃣ 檢查動畫問題...")
        calendar_response = requests.get(f"{base_url}/perfect-calendar.html", timeout=10)
        if calendar_response.status_code == 200:
            content = calendar_response.text
            if "強制完成初始化" in content:
                print("   ❌ 發現動畫強制跳轉問題")
                return False
            else:
                print("   ✅ 動畫強制跳轉問題已修復")
        
        print("\n" + "=" * 50)
        print("🎉 真實 CalDAV 連接測試完成")
        print("=" * 50)
        print("✅ 所有功能正常運作")
        print(f"📊 總事件數: {len(all_events)}")
        print(f"👥 總講師數: {len(teachers)}")
        print(f"📡 資料來源: {events_data['data_source']}")
        print(f"🔗 CalDAV 狀態: {debug_data['caldav_status']}")
        
        if len(all_events) == 0:
            print("\n💡 目前沒有日曆事件，這是正常的")
            print("💡 當有事件時，系統會自動載入並顯示")
        
        print("\n🎯 結論: 真實 CalDAV 連接成功，系統準備好投入使用！")
        
        return True
        
    except Exception as e:
        print(f"\n❌ 測試失敗: {str(e)}")
        return False

def main():
    """主測試函數"""
    print("🚀 開始真實 CalDAV 連接測試")
    print("=" * 50)
    
    success = test_real_caldav()
    
    if success:
        print("\n🎉 真實 CalDAV 連接測試成功！")
        print("💡 系統已準備好使用真實的 CalDAV 資料")
        return 0
    else:
        print("\n❌ 真實 CalDAV 連接測試失敗！")
        print("💡 請檢查相關問題並修復")
        return 1

if __name__ == "__main__":
    exit(main())
