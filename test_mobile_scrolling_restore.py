#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試手機端滑動效果恢復和排序方式移除
"""

import requests
import time
from datetime import datetime

def test_mobile_scrolling_restore():
    """測試手機端滑動效果恢復和排序方式移除"""
    print("📱 測試手機端滑動效果恢復和排序方式移除...")
    
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
                
                # 檢查滑動效果恢復
                if 'overflow-y: auto' in frontend_response.text and '-webkit-overflow-scrolling: touch' in frontend_response.text:
                    print("✅ 滑動效果已恢復")
                else:
                    print("❌ 滑動效果未恢復")
                
                # 檢查視圖按鈕sticky定位
                if 'position: sticky' in frontend_response.text and 'top: 0' in frontend_response.text:
                    print("✅ 視圖按鈕sticky定位已設置")
                else:
                    print("❌ 視圖按鈕sticky定位未設置")
                
                # 檢查排序方式是否已移除
                if 'sortOrder' not in frontend_response.text and '排序方式' not in frontend_response.text:
                    print("✅ 排序方式已完全移除")
                else:
                    print("❌ 排序方式未完全移除")
                
                # 檢查排序邏輯是否簡化
                if '按時間排序' in frontend_response.text and 'return eventA - eventB' in frontend_response.text:
                    print("✅ 排序邏輯已簡化為時間排序")
                else:
                    print("❌ 排序邏輯未簡化")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_mobile_scrolling_restore()
