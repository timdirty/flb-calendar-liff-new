#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試手機版本滑動修復效果
"""

import requests
import time
from datetime import datetime

def test_mobile_scrolling_fix():
    """測試手機版本滑動修復效果"""
    print("📱 測試手機版本滑動修復效果...")
    
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
                
                # 檢查手機版本滑動修復
                if 'position: fixed' in frontend_response.text and 'height: 0' in frontend_response.text:
                    print("✅ 找到手機版本滑動修復CSS")
                else:
                    print("❌ 沒有找到手機版本滑動修復CSS")
                
                # 檢查固定篩選區域
                if 'position: sticky' in frontend_response.text and 'backdrop-filter: blur' in frontend_response.text:
                    print("✅ 找到固定篩選區域樣式")
                else:
                    print("❌ 沒有找到固定篩選區域樣式")
                
                # 檢查統計欄位縮小
                if 'min-height: 40px' in frontend_response.text and 'font-size: 1rem' in frontend_response.text:
                    print("✅ 找到統計欄位縮小樣式")
                else:
                    print("❌ 沒有找到統計欄位縮小樣式")
                
                # 檢查超小屏幕統計欄位
                if 'min-height: 30px' in frontend_response.text and 'font-size: 0.8rem' in frontend_response.text:
                    print("✅ 找到超小屏幕統計欄位縮小樣式")
                else:
                    print("❌ 沒有找到超小屏幕統計欄位縮小樣式")
                
                # 檢查滑動邏輯修復
                if 'window.innerWidth > 768' in frontend_response.text and '手機版本：跳過自動滑動' in frontend_response.text:
                    print("✅ 找到滑動邏輯修復")
                else:
                    print("❌ 沒有找到滑動邏輯修復")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_mobile_scrolling_fix()
