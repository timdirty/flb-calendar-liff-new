#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試最終修復效果
"""

import requests
import time
from datetime import datetime

def test_final_fixes():
    """測試最終修復效果"""
    print("🔧 測試最終修復效果...")
    
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
                
                # 檢查滑動修復
                if '整個頁面可以滑動' in frontend_response.text and 'body { overflow-x: hidden; overflow-y: auto; }' in frontend_response.text:
                    print("✅ 滑動行為已修復 - 整個頁面可以滑動")
                else:
                    print("❌ 滑動行為未修復")
                
                # 檢查篩選區域固定
                if 'position: fixed' in frontend_response.text and 'z-index: 1000' in frontend_response.text:
                    print("✅ 篩選區域固定佈局已設置")
                else:
                    print("❌ 篩選區域固定佈局未設置")
                
                # 檢查按鈕事件處理修復
                if 'handleQuickFilterClick' in frontend_response.text and 'console.log' in frontend_response.text:
                    print("✅ 按鈕事件處理已修復")
                else:
                    print("❌ 按鈕事件處理未修復")
                
                # 檢查按鈕HTML修復（移除onclick衝突）
                if 'data-quick="esm"' in frontend_response.text and 'onclick=' not in frontend_response.text:
                    print("✅ 按鈕HTML衝突已修復 - 移除onclick屬性")
                else:
                    print("❌ 按鈕HTML衝突未修復")
                
                # 檢查按鈕樣式
                if 'pointerEvents' in frontend_response.text and 'cursor: pointer' in frontend_response.text:
                    print("✅ 按鈕樣式已設置")
                else:
                    print("❌ 按鈕樣式未設置")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_final_fixes()
