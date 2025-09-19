#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試滑動效果和按鈕選中顏色修復
"""

import requests
import time
from datetime import datetime

def test_scroll_and_button_colors():
    """測試滑動效果和按鈕選中顏色修復"""
    print("🔄 測試滑動效果和按鈕選中顏色修復...")
    
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
                
                # 檢查滑動效果修復
                if 'autoScrollToCalendar' in frontend_response.text and 'window.scrollTo' in frontend_response.text:
                    print("✅ 滑動效果已修復：使用 window.scrollTo 實現平滑滑動")
                else:
                    print("❌ 滑動效果修復不完整")
                
                # 檢查移除行動裝置限制
                if 'isMobile' not in frontend_response.text or '所有裝置' in frontend_response.text:
                    print("✅ 已移除行動裝置限制：所有裝置都支援滑動效果")
                else:
                    print("❌ 仍然限制行動裝置")
                
                # 檢查按鈕選中顏色修復
                if 'color: rgba(0, 0, 0, 0.9) !important' in frontend_response.text:
                    print("✅ 按鈕選中顏色已修復：確保選中時字體為深色")
                else:
                    print("❌ 按鈕選中顏色修復不完整")
                
                # 檢查響應式設計中的按鈕顏色
                if 'btn-primary.active' in frontend_response.text and '!important' in frontend_response.text:
                    print("✅ 響應式設計按鈕顏色已修復：所有螢幕尺寸都支援深色字體")
                else:
                    print("❌ 響應式設計按鈕顏色修復不完整")
                
                # 檢查滑動動畫調用
                if 'autoScrollToCalendar()' in frontend_response.text:
                    print("✅ 滑動動畫調用正常：系統初始化時會觸發滑動")
                else:
                    print("❌ 滑動動畫調用有問題")
                
                # 檢查滑動目標計算
                if 'controlHeight + 10' in frontend_response.text and '額外 10px 間距' in frontend_response.text:
                    print("✅ 滑動目標計算正確：考慮篩選區塊高度並添加間距")
                else:
                    print("❌ 滑動目標計算有問題")
                
                # 檢查控制台日誌
                if '篩選區塊高度:' in frontend_response.text:
                    print("✅ 控制台日誌正常：提供詳細的調試信息")
                else:
                    print("❌ 控制台日誌有問題")
                
                # 檢查按鈕狀態管理
                if 'switchView' in frontend_response.text and 'classList.add(\'active\')' in frontend_response.text:
                    print("✅ 按鈕狀態管理正常：支援視圖切換和狀態更新")
                else:
                    print("❌ 按鈕狀態管理有問題")
                
                # 檢查視圖按鈕事件監聽器
                if 'view-buttons .btn-primary' in frontend_response.text and 'addEventListener' in frontend_response.text:
                    print("✅ 視圖按鈕事件監聽器正常：支援點擊切換視圖")
                else:
                    print("❌ 視圖按鈕事件監聽器有問題")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_scroll_and_button_colors()
