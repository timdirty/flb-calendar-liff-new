#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試統計區塊整合效果
"""

import requests
import time
from datetime import datetime

def test_stats_integration():
    """測試統計區塊整合效果"""
    print("📊 測試統計區塊整合效果...")
    
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
                
                # 檢查是否移除了獨立統計區域
                if 'statsContainer' not in frontend_response.text and 'stats-grid' not in frontend_response.text:
                    print("✅ 已移除獨立統計區域")
                else:
                    print("❌ 仍然存在獨立統計區域")
                
                # 檢查是否添加了文字統計
                if 'stats-text' in frontend_response.text and 'totalEventsText' in frontend_response.text:
                    print("✅ 已添加文字統計區域")
                else:
                    print("❌ 沒有找到文字統計區域")
                
                # 檢查統計文字格式
                if '總事件: 0' in frontend_response.text and '講師: 0' in frontend_response.text:
                    print("✅ 統計文字格式正確")
                else:
                    print("❌ 統計文字格式不正確")
                
                # 檢查updateStats函數是否更新
                if 'totalEventsText' in frontend_response.text and 'instructorCountText' in frontend_response.text:
                    print("✅ updateStats函數已更新")
                else:
                    print("❌ updateStats函數未更新")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_stats_integration()
