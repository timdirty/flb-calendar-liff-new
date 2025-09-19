#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試重寫後的快速篩選功能
"""

import requests
import time
from datetime import datetime

def test_rewritten_quick_filter():
    """測試重寫後的快速篩選功能"""
    print("🧪 測試重寫後的快速篩選功能...")
    
    try:
        # 測試伺服器連接
        response = requests.get('http://localhost:5001/api/events', timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 伺服器連接成功，獲取 {len(data['data'])} 個事件")
            
            # 統計各課別數量
            events = data['data']
            esm_count = len([e for e in events if 'esm' in (e.get('title', '') + e.get('description', '')).lower()])
            spm_count = len([e for e in events if 'spm' in (e.get('title', '') + e.get('description', '')).lower()])
            boost_count = len([e for e in events if 'boost' in (e.get('title', '') + e.get('description', '')).lower()])
            spike_count = len([e for e in events if 'spike' in (e.get('title', '') + e.get('description', '')).lower()])
            
            print(f"📊 課別統計:")
            print(f"   ESM: {esm_count} 個")
            print(f"   SPM: {spm_count} 個") 
            print(f"   BOOST: {boost_count} 個")
            print(f"   SPIKE: {spike_count} 個")
            
            # 測試前端頁面
            print("\n🌐 測試前端頁面...")
            frontend_response = requests.get('http://localhost:5001/perfect-calendar.html', timeout=10)
            if frontend_response.status_code == 200:
                print("✅ 前端頁面載入成功")
                
                # 檢查是否包含重寫的函數
                if '🚀 開始重寫課別快速篩選功能...' in frontend_response.text:
                    print("✅ 找到重寫的 updateCourseTypeQuickFilters 函數")
                else:
                    print("❌ 沒有找到重寫的函數")
                
                # 檢查是否包含直接的 onclick 處理
                if 'onclick="handleQuickFilter(' in frontend_response.text:
                    print("✅ 找到直接的 onclick 事件處理")
                else:
                    print("❌ 沒有找到直接的 onclick 處理")
                
                # 檢查課別快速篩選容器
                if 'courseTypeQuickFilters' in frontend_response.text:
                    print("✅ 找到課別快速篩選容器")
                else:
                    print("❌ 沒有找到課別快速篩選容器")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_rewritten_quick_filter()
