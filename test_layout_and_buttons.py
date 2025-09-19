#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試佈局修復和快速篩選按鈕修復
"""

import requests
import time
from datetime import datetime

def test_layout_and_buttons():
    """測試佈局修復和快速篩選按鈕修復"""
    print("📱 測試佈局修復和快速篩選按鈕修復...")
    
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
                
                # 檢查篩選區域固定佈局
                if 'position: fixed' in frontend_response.text and 'z-index: 1000' in frontend_response.text:
                    print("✅ 篩選區域固定佈局已設置")
                else:
                    print("❌ 篩選區域固定佈局未設置")
                
                # 檢查主內容區域邊距
                if 'margin-top: 200px' in frontend_response.text:
                    print("✅ 主內容區域邊距已設置")
                else:
                    print("❌ 主內容區域邊距未設置")
                
                # 檢查事件委託綁定
                if 'handleQuickFilterDelegate' in frontend_response.text and 'addEventListener' in frontend_response.text:
                    print("✅ 事件委託綁定已設置")
                else:
                    print("❌ 事件委託綁定未設置")
                
                # 檢查按鈕樣式設置
                if 'pointerEvents' in frontend_response.text and 'cursor: pointer' in frontend_response.text:
                    print("✅ 按鈕樣式設置已修復")
                else:
                    print("❌ 按鈕樣式設置未修復")
                
                # 檢查重新綁定邏輯
                if 'setTimeout' in frontend_response.text and 'bindQuickFilterButtons' in frontend_response.text:
                    print("✅ 重新綁定邏輯已設置")
                else:
                    print("❌ 重新綁定邏輯未設置")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_layout_and_buttons()
