#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試重做的快速篩選功能
"""

import requests
import time
from datetime import datetime

def test_rebuilt_quick_filter():
    """測試重做的快速篩選功能"""
    print("🔄 測試重做的快速篩選功能...")
    
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
                
                # 檢查篩選區域固定修復
                if 'position: fixed !important' in frontend_response.text and 'z-index: 9999 !important' in frontend_response.text:
                    print("✅ 篩選區域固定修復 - 使用 !important 強制固定")
                else:
                    print("❌ 篩選區域固定修復未完成")
                
                # 檢查重做的快速篩選功能
                if 'handleQuickFilterDirect' in frontend_response.text:
                    print("✅ 重做的快速篩選功能已實現")
                else:
                    print("❌ 重做的快速篩選功能未實現")
                
                # 檢查按鈕生成函數
                if 'generateQuickFilterButtons' in frontend_response.text:
                    print("✅ 按鈕生成函數已實現")
                else:
                    print("❌ 按鈕生成函數未實現")
                
                # 檢查簡化的onclick處理
                if 'onclick="handleQuickFilterDirect' in frontend_response.text:
                    print("✅ 簡化的onclick處理已實現")
                else:
                    print("❌ 簡化的onclick處理未實現")
                
                # 檢查CSS強制固定
                if '!important' in frontend_response.text and 'position: fixed' in frontend_response.text:
                    print("✅ CSS強制固定已實現")
                else:
                    print("❌ CSS強制固定未實現")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_rebuilt_quick_filter()
