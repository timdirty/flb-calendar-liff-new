#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試 Agnes 講師篩選功能
"""

import requests
import json
from datetime import datetime

def test_agnes_filter():
    """測試 Agnes 講師篩選功能"""
    print("🔄 測試 Agnes 講師篩選功能...")
    
    try:
        # 測試伺服器連接
        response = requests.get('http://localhost:5001/api/events', timeout=10)
        if response.status_code == 200:
            data = response.json()
            events = data['data']
            print(f"✅ 伺服器連接成功，獲取 {len(events)} 個事件")
            
            # 檢查 Agnes 的事件
            agnes_events = [e for e in events if e.get('instructor') == 'AGNES']
            print(f"📋 Agnes 事件總數: {len(agnes_events)}")
            
            if agnes_events:
                print("\n📝 Agnes 事件詳情:")
                for i, event in enumerate(agnes_events):
                    print(f"  {i+1}. {event.get('title', 'N/A')}")
                    print(f"     講師: {event.get('instructor', 'N/A')}")
                    print(f"     時間: {event.get('start', 'N/A')}")
                    print(f"     地點: {event.get('location', 'N/A')}")
                    print()
            else:
                print("❌ 沒有找到 Agnes 的事件")
            
            # 檢查講師列表
            instructors = list(set([e.get('instructor') for e in events if e.get('instructor')]))
            print(f"👥 所有講師: {instructors}")
            
            if 'AGNES' in instructors:
                print("✅ Agnes 在講師列表中")
            else:
                print("❌ Agnes 不在講師列表中")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_agnes_filter()
