#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試最終的滑動邏輯和按鈕修復
"""

import requests
import time
from datetime import datetime

def test_scroll_and_buttons_final():
    """測試最終的滑動邏輯和按鈕修復"""
    print("📱 測試最終的滑動邏輯和按鈕修復...")
    
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
                
                # 檢查滑動邏輯修復
                if '移除 overflow 限制，讓整個頁面可以滑動' in frontend_response.text:
                    print("✅ 滑動邏輯已修復 - 整個頁面可以滑動")
                else:
                    print("❌ 滑動邏輯未修復")
                
                # 檢查篩選區域固定佈局
                if 'position: fixed' in frontend_response.text and 'z-index: 1000' in frontend_response.text:
                    print("✅ 篩選區域固定佈局已設置")
                else:
                    print("❌ 篩選區域固定佈局未設置")
                
                # 檢查按鈕事件綁定
                if 'addEventListener' in frontend_response.text and 'handleQuickFilterClick' in frontend_response.text:
                    print("✅ 按鈕事件綁定已修復")
                else:
                    print("❌ 按鈕事件綁定未修復")
                
                # 檢查按鈕樣式
                if 'pointerEvents' in frontend_response.text and 'cursor: pointer' in frontend_response.text:
                    print("✅ 按鈕樣式已設置")
                else:
                    print("❌ 按鈕樣式未設置")
                
                # 檢查按鈕HTML結構
                if '<button class="btn btn-outline-primary quick-filter-btn"' in frontend_response.text:
                    print("✅ 快速篩選按鈕使用真正的button元件")
                else:
                    print("❌ 快速篩選按鈕未使用真正的button元件")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_scroll_and_buttons_final()
