#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試任務顯示區塊已恢復
"""

import requests
import time
from datetime import datetime

def test_restore_event_cards():
    """測試任務顯示區塊已恢復"""
    print("🔄 測試任務顯示區塊已恢復...")
    
    try:
        # 測試伺服器連接
        response = requests.get('http://localhost:5001/api/events', timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 伺服器連接成功，獲取 {len(data['data'])} 個事件")
            
            # 測試前端頁面
            print("\n🌐 測試前端頁面...")
            frontend_response = requests.get('http://localhost:5001/perfect-calendar.html', timeout=10)
            if frontend_response.status_code == 200:
                print("✅ 前端頁面載入成功")
                
                # 檢查 createEventCard 函數已恢復完整結構
                if 'function createEventCard(event)' in frontend_response.text:
                    print("✅ createEventCard 函數存在")
                else:
                    print("❌ createEventCard 函數缺失")
                
                # 檢查事件卡片結構包含完整元素
                if 'event-header' in frontend_response.text and 'event-details' in frontend_response.text:
                    print("✅ 事件卡片結構完整")
                else:
                    print("❌ 事件卡片結構不完整")
                
                # 檢查教案連結功能
                if 'lesson-section' in frontend_response.text and 'lesson-button' in frontend_response.text:
                    print("✅ 教案連結功能已恢復")
                else:
                    print("❌ 教案連結功能缺失")
                
                # 檢查位置連結功能
                if 'location-link' in frontend_response.text and 'location-map-icon' in frontend_response.text:
                    print("✅ 位置連結功能已恢復")
                else:
                    print("❌ 位置連結功能缺失")
                
                # 檢查倒數計時功能
                if 'countdown-timer' in frontend_response.text and 'countdown-text' in frontend_response.text:
                    print("✅ 倒數計時功能已恢復")
                else:
                    print("❌ 倒數計時功能缺失")
                
                # 檢查課程描述功能
                if 'event-description' in frontend_response.text and '課程描述' in frontend_response.text:
                    print("✅ 課程描述功能已恢復")
                else:
                    print("❌ 課程描述功能缺失")
                
                # 檢查講師顏色功能
                if 'instructorColors' in frontend_response.text and 'custom-color' in frontend_response.text:
                    print("✅ 講師顏色功能已恢復")
                else:
                    print("❌ 講師顏色功能缺失")
                
                # 檢查停課標記功能
                if 'cancelled-badge' in frontend_response.text and '停課' in frontend_response.text:
                    print("✅ 停課標記功能已恢復")
                else:
                    print("❌ 停課標記功能缺失")
                
                # 檢查描述清理功能
                if 'NOTION_SYNC' in frontend_response.text and 'cleanDescription' in frontend_response.text:
                    print("✅ 描述清理功能已恢復")
                else:
                    print("❌ 描述清理功能缺失")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_restore_event_cards()
