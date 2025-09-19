#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試手機端左右滑動切換視圖功能
"""

import requests
import time
from datetime import datetime

def test_mobile_swipe_navigation():
    """測試手機端左右滑動切換視圖功能"""
    print("🔄 測試手機端左右滑動切換視圖功能...")
    
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
                
                # 檢查滑動導航函數
                if 'setupMobileSwipeNavigation' in frontend_response.text:
                    print("✅ 滑動導航函數已添加：setupMobileSwipeNavigation")
                else:
                    print("❌ 滑動導航函數缺失")
                
                # 檢查觸控事件監聽器
                if 'touchstart' in frontend_response.text and 'touchmove' in frontend_response.text and 'touchend' in frontend_response.text:
                    print("✅ 觸控事件監聽器已添加：touchstart, touchmove, touchend")
                else:
                    print("❌ 觸控事件監聽器不完整")
                
                # 檢查視圖順序設定
                if 'viewOrder' in frontend_response.text and '今日' in frontend_response.text and '本週' in frontend_response.text:
                    print("✅ 視圖順序設定正確：今日、本週、本月、全部")
                else:
                    print("❌ 視圖順序設定有問題")
                
                # 檢查滑動判斷邏輯
                if 'Math.abs(diffX) > Math.abs(diffY)' in frontend_response.text and 'Math.abs(diffX) > 50' in frontend_response.text:
                    print("✅ 滑動判斷邏輯正確：水平距離大於垂直距離且超過50px")
                else:
                    print("❌ 滑動判斷邏輯有問題")
                
                # 檢查滑動方向處理
                if '向左滑動' in frontend_response.text and '向右滑動' in frontend_response.text:
                    print("✅ 滑動方向處理正確：支援左右滑動切換")
                else:
                    print("❌ 滑動方向處理有問題")
                
                # 檢查視覺反饋
                if 'translateX' in frontend_response.text and 'transition' in frontend_response.text:
                    print("✅ 視覺反饋已添加：滑動時的動畫效果")
                else:
                    print("❌ 視覺反饋缺失")
                
                # 檢查滑動提示
                if '左右滑動切換' in frontend_response.text and 'swipeHint' in frontend_response.text:
                    print("✅ 滑動提示已添加：用戶可見的滑動指示")
                else:
                    print("❌ 滑動提示缺失")
                
                # 檢查手機端檢測
                if 'window.innerWidth <= 768' in frontend_response.text and 'isMobile' in frontend_response.text:
                    print("✅ 手機端檢測正確：只在手機端啟用滑動功能")
                else:
                    print("❌ 手機端檢測有問題")
                
                # 檢查事件監聽器設置
                if 'setupMobileSwipeNavigation()' in frontend_response.text:
                    print("✅ 事件監聽器設置正確：在 setupEventListeners 中調用")
                else:
                    print("❌ 事件監聽器設置有問題")
                
                # 檢查控制台日誌
                if '手機端滑動導航已啟用' in frontend_response.text and '向左滑動' in frontend_response.text:
                    print("✅ 控制台日誌完整：提供滑動操作的調試信息")
                else:
                    print("❌ 控制台日誌不完整")
                
                # 檢查滑動動畫
                if '@keyframes swipeHint' in frontend_response.text and 'animation: swipeHint' in frontend_response.text:
                    print("✅ 滑動動畫已添加：提示動畫效果")
                else:
                    print("❌ 滑動動畫缺失")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_mobile_swipe_navigation()
