#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試手機端UI修復效果
"""

import requests
import time
from datetime import datetime

def test_mobile_ui_fixes():
    """測試手機端UI修復效果"""
    print("🔄 測試手機端UI修復效果...")
    
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
                
                # 檢查滑動提示修復
                if 'top: -25px' in frontend_response.text and 'font-size: 0.6rem' in frontend_response.text:
                    print("✅ 滑動提示修復：位置調整到 -25px，字體縮小到 0.6rem")
                else:
                    print("❌ 滑動提示修復有問題")
                
                # 檢查統計信息字體縮小
                if 'font-size: 0.75rem' in frontend_response.text and 'white-space: nowrap' in frontend_response.text:
                    print("✅ 統計信息字體縮小：字體調整到 0.75rem，強制單行顯示")
                else:
                    print("❌ 統計信息字體縮小有問題")
                
                # 檢查空白空間減少
                if 'padding: 6px !important' in frontend_response.text and 'padding: 8px 8px 4px 8px' in frontend_response.text:
                    print("✅ 空白空間減少：篩選區域內邊距減少到 6px，主內容底部間距減少到 4px")
                else:
                    print("❌ 空白空間減少有問題")
                
                # 檢查按鈕高亮功能
                if 'highlightViewButton' in frontend_response.text and 'scale(1.05)' in frontend_response.text:
                    print("✅ 按鈕高亮功能：添加了 highlightViewButton 函數和縮放動畫")
                else:
                    print("❌ 按鈕高亮功能有問題")
                
                # 檢查滑動時按鈕觸發
                if 'highlightViewButton(nextView)' in frontend_response.text and 'highlightViewButton(prevView)' in frontend_response.text:
                    print("✅ 滑動時按鈕觸發：左右滑動時會調用 highlightViewButton")
                else:
                    print("❌ 滑動時按鈕觸發有問題")
                
                # 檢查視圖按鈕間距調整
                if 'margin: 4px 0 !important' in frontend_response.text:
                    print("✅ 視圖按鈕間距調整：減少上下間距到 4px")
                else:
                    print("❌ 視圖按鈕間距調整有問題")
                
                # 檢查滑動提示樣式優化
                if 'box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)' in frontend_response.text and 'border: 1px solid rgba(255, 193, 7, 0.3)' in frontend_response.text:
                    print("✅ 滑動提示樣式優化：添加了陰影和邊框效果")
                else:
                    print("❌ 滑動提示樣式優化有問題")
                
                # 檢查統計信息樣式優化
                if 'text-overflow: ellipsis' in frontend_response.text and 'max-width: 100%' in frontend_response.text:
                    print("✅ 統計信息樣式優化：添加了文字溢出處理和最大寬度限制")
                else:
                    print("❌ 統計信息樣式優化有問題")
                
                # 檢查按鈕高亮動畫
                if 'boxShadow = \'0 4px 8px rgba(0, 123, 255, 0.3)\'' in frontend_response.text and 'setTimeout' in frontend_response.text:
                    print("✅ 按鈕高亮動畫：添加了陰影效果和定時器動畫")
                else:
                    print("❌ 按鈕高亮動畫有問題")
                
                # 檢查整體UI優化
                if '減少內邊距' in frontend_response.text and '減少上下間距' in frontend_response.text:
                    print("✅ 整體UI優化：多處間距調整，減少空白空間")
                else:
                    print("❌ 整體UI優化有問題")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_mobile_ui_fixes()
