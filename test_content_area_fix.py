#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試內容區域大小修復效果
"""

import requests
import time
from datetime import datetime

def test_content_area_fix():
    """測試內容區域大小修復效果"""
    print("📱 測試內容區域大小修復效果...")
    
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
                
                # 檢查是否移除了過度限制的CSS
                if 'position: fixed' not in frontend_response.text or 'height: 0' not in frontend_response.text:
                    print("✅ 已移除過度限制的CSS（position: fixed, height: 0）")
                else:
                    print("❌ 仍然存在過度限制的CSS")
                
                # 檢查是否保留了正常的響應式設計
                if 'padding: 8px' in frontend_response.text and 'max-width: 100%' in frontend_response.text:
                    print("✅ 保留了正常的響應式設計")
                else:
                    print("❌ 沒有找到正常的響應式設計")
                
                # 檢查統計欄位是否仍然縮小
                if 'min-height: 40px' in frontend_response.text and 'font-size: 1rem' in frontend_response.text:
                    print("✅ 統計欄位仍然保持縮小")
                else:
                    print("❌ 統計欄位沒有保持縮小")
                
                # 檢查滑動邏輯是否仍然修復
                if 'window.innerWidth > 768' in frontend_response.text and '手機版本：跳過自動滑動' in frontend_response.text:
                    print("✅ 滑動邏輯修復仍然有效")
                else:
                    print("❌ 滑動邏輯修復失效")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_content_area_fix()
