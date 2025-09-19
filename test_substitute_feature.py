#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試代課/帶班功能
"""

import requests
import time
from datetime import datetime

def test_substitute_feature():
    """測試代課/帶班功能"""
    print("🔄 測試代課/帶班功能...")
    
    try:
        # 測試伺服器連接
        response = requests.get('http://localhost:5001/api/events', timeout=10)
        if response.status_code == 200:
            data = response.json()
            events = data['data']
            print(f"✅ 伺服器連接成功，獲取 {len(events)} 個事件")
            
            # 檢查是否有代課事件
            substitute_events = []
            for event in events:
                title = event.get('title', '')
                description = event.get('description', '')
                if any(keyword in title or keyword in description for keyword in ['代課', '帶班', '代理', '支援']):
                    substitute_events.append(event)
            
            print(f"📋 找到 {len(substitute_events)} 個代課/帶班事件")
            
            if substitute_events:
                print("\n📝 代課/帶班事件範例:")
                for i, event in enumerate(substitute_events[:3]):  # 顯示前3個
                    print(f"  {i+1}. {event.get('title', 'N/A')}")
                    print(f"     講師: {event.get('instructor', 'N/A')}")
                    print(f"     時間: {event.get('start', 'N/A')}")
                    print(f"     描述: {event.get('description', 'N/A')}")
                    print()
            
            # 測試前端頁面
            print("🌐 測試前端頁面...")
            frontend_response = requests.get('http://localhost:5001/perfect-calendar.html', timeout=10)
            if frontend_response.status_code == 200:
                print("✅ 前端頁面載入成功")
                
                # 檢查代課檢測函數
                if 'function isSubstitute(event)' in frontend_response.text:
                    print("✅ 代課檢測函數：已添加 isSubstitute 函數")
                else:
                    print("❌ 代課檢測函數：缺少 isSubstitute 函數")
                
                # 檢查代課信息提取函數
                if 'function getSubstituteInfo(event)' in frontend_response.text:
                    print("✅ 代課信息提取函數：已添加 getSubstituteInfo 函數")
                else:
                    print("❌ 代課信息提取函數：缺少 getSubstituteInfo 函數")
                
                # 檢查代課標示樣式
                if 'substitute-badge' in frontend_response.text:
                    print("✅ 代課標示樣式：已添加 substitute-badge 樣式")
                else:
                    print("❌ 代課標示樣式：缺少 substitute-badge 樣式")
                
                # 檢查代課事件卡片樣式
                if 'substitute-event' in frontend_response.text:
                    print("✅ 代課事件卡片樣式：已添加 substitute-event 樣式")
                else:
                    print("❌ 代課事件卡片樣式：缺少 substitute-event 樣式")
                
                # 檢查代課動畫
                if 'substitutePulse' in frontend_response.text and 'substituteBounce' in frontend_response.text:
                    print("✅ 代課動畫：已添加代課相關動畫效果")
                else:
                    print("❌ 代課動畫：缺少代課相關動畫效果")
                
                # 檢查代課關鍵詞檢測
                if '代課' in frontend_response.text and '帶班' in frontend_response.text and '代理' in frontend_response.text and '支援' in frontend_response.text:
                    print("✅ 代課關鍵詞檢測：已添加代課相關關鍵詞")
                else:
                    print("❌ 代課關鍵詞檢測：缺少代課相關關鍵詞")
                
                # 檢查代課信息顯示
                if 'substituteInfo.type' in frontend_response.text and 'substituteInfo.originalInstructor' in frontend_response.text:
                    print("✅ 代課信息顯示：已添加代課信息顯示邏輯")
                else:
                    print("❌ 代課信息顯示：缺少代課信息顯示邏輯")
                
                # 檢查整體功能完整性
                substitute_components = [
                    'isSubstitute',
                    'getSubstituteInfo',
                    'substitute-badge',
                    'substitute-event',
                    'substitutePulse',
                    'substituteBounce',
                    '代課',
                    '帶班',
                    '代理',
                    '支援'
                ]
                
                missing_components = []
                for component in substitute_components:
                    if component not in frontend_response.text:
                        missing_components.append(component)
                
                if not missing_components:
                    print("✅ 整體功能完整性：所有代課/帶班功能組件都已包含")
                else:
                    print(f"❌ 整體功能完整性：缺少組件 {missing_components}")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_substitute_feature()
