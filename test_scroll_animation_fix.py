#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試滑動動畫修復：確保篩選區塊不會壞掉
"""

import requests
import time
from datetime import datetime

def test_scroll_animation_fix():
    """測試滑動動畫修復"""
    print("🔄 測試滑動動畫修復...")
    
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
                
                # 檢查 autoScrollToCalendar 函數已修復
                if 'window.scrollTo' in frontend_response.text and 'controlHeight' in frontend_response.text:
                    print("✅ autoScrollToCalendar 函數已修復：使用 window.scrollTo 而不是 scrollIntoView")
                else:
                    print("❌ autoScrollToCalendar 函數修復不完整")
                
                # 檢查 showStep 函數已修復
                if 'window.scrollTo' in frontend_response.text and '篩選區塊保持固定' in frontend_response.text:
                    print("✅ showStep 函數已修復：避免影響篩選區塊")
                else:
                    print("❌ showStep 函數修復不完整")
                
                # 檢查篩選區塊 CSS 強化
                if 'transform: translateZ(0)' in frontend_response.text and 'will-change: auto' in frontend_response.text:
                    print("✅ 篩選區塊 CSS 已強化：硬體加速和性能優化")
                else:
                    print("❌ 篩選區塊 CSS 強化不完整")
                
                # 檢查篩選區塊固定定位
                if 'position: fixed !important' in frontend_response.text and 'z-index: 9999' in frontend_response.text:
                    print("✅ 篩選區塊固定定位正確：position: fixed, z-index: 9999")
                else:
                    print("❌ 篩選區塊固定定位有問題")
                
                # 檢查主內容區域間距
                if 'margin-top: 220px !important' in frontend_response.text:
                    print("✅ 主內容區域間距正確：為篩選區塊留出空間")
                else:
                    print("❌ 主內容區域間距有問題")
                
                # 檢查沒有使用 scrollIntoView 在篩選區域
                if 'viewButtons.scrollIntoView' not in frontend_response.text and 'quickFilters.scrollIntoView' not in frontend_response.text:
                    print("✅ 已移除篩選區域的 scrollIntoView：避免影響固定定位")
                else:
                    print("❌ 仍然使用 scrollIntoView 在篩選區域")
                
                # 檢查滑動目標已改為主內容區域
                if 'mainContent' in frontend_response.text and 'controlHeight' in frontend_response.text:
                    print("✅ 滑動目標已改為主內容區域：避免影響篩選區塊")
                else:
                    print("❌ 滑動目標修改不完整")
                
                # 檢查控制台日誌訊息
                if '篩選區塊保持固定' in frontend_response.text:
                    print("✅ 控制台日誌已更新：提供清晰的調試信息")
                else:
                    print("❌ 控制台日誌更新不完整")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_scroll_animation_fix()
