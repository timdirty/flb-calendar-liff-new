#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試手機端滑動功能改進
"""

import requests
import time
from datetime import datetime

def test_mobile_swipe_improvements():
    """測試手機端滑動功能改進"""
    print("🔄 測試手機端滑動功能改進...")
    
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
                if 'top: -30px' in frontend_response.text and 'font-size: 0.55rem' in frontend_response.text:
                    print("✅ 滑動提示修復：位置調整到 -30px，字體縮小到 0.55rem")
                else:
                    print("❌ 滑動提示修復有問題")
                
                # 檢查滑動提示樣式優化
                if 'max-width: 90%' in frontend_response.text and 'word-break: keep-all' in frontend_response.text:
                    print("✅ 滑動提示樣式優化：添加最大寬度限制和文字斷行控制")
                else:
                    print("❌ 滑動提示樣式優化有問題")
                
                # 檢查按鈕脈衝動畫
                if '@keyframes buttonPulse' in frontend_response.text and 'scale(1.15)' in frontend_response.text:
                    print("✅ 按鈕脈衝動畫：添加了 buttonPulse 動畫和縮放效果")
                else:
                    print("❌ 按鈕脈衝動畫有問題")
                
                # 檢查按鈕高亮功能改進
                if 'scale(1.1)' in frontend_response.text and 'boxShadow = \'0 6px 12px rgba(0, 123, 255, 0.4)\'' in frontend_response.text:
                    print("✅ 按鈕高亮功能改進：增強了縮放效果和陰影")
                else:
                    print("❌ 按鈕高亮功能改進有問題")
                
                # 檢查滑動過度動作改進
                if 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' in frontend_response.text and '0.4s' in frontend_response.text:
                    print("✅ 滑動過度動作改進：使用 cubic-bezier 緩動函數和 0.4s 動畫時間")
                else:
                    print("❌ 滑動過度動作改進有問題")
                
                # 檢查滑動觸發閾值調整
                if 'Math.abs(diffX) > 30' in frontend_response.text:
                    print("✅ 滑動觸發閾值調整：從 50px 調整到 30px，更靈敏")
                else:
                    print("❌ 滑動觸發閾值調整有問題")
                
                # 檢查滑動視覺反饋改進
                if 'Math.max(-20, Math.min(20, diffX * 0.15))' in frontend_response.text:
                    print("✅ 滑動視覺反饋改進：限制移動範圍並調整敏感度")
                else:
                    print("❌ 滑動視覺反饋改進有問題")
                
                # 檢查動態滑動提示
                if 'swipe-hint' in frontend_response.text and '切換到下一個' in frontend_response.text:
                    print("✅ 動態滑動提示：添加了即時滑動方向提示")
                else:
                    print("❌ 動態滑動提示有問題")
                
                # 檢查按鈕點擊事件改進
                if 'e.stopPropagation()' in frontend_response.text and 'highlightViewButton(view)' in frontend_response.text:
                    print("✅ 按鈕點擊事件改進：防止滑動干擾並添加高亮動畫")
                else:
                    print("❌ 按鈕點擊事件改進有問題")
                
                # 檢查切換動畫改進
                if 'translateX(-15px)' in frontend_response.text and 'setTimeout(() => {' in frontend_response.text:
                    print("✅ 切換動畫改進：增強了切換動畫效果和時間")
                else:
                    print("❌ 切換動畫改進有問題")
                
                # 檢查整體滑動體驗
                if '更平順的過度' in frontend_response.text and '更明顯的效果' in frontend_response.text:
                    print("✅ 整體滑動體驗：多處改進提升用戶體驗")
                else:
                    print("❌ 整體滑動體驗有問題")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_mobile_swipe_improvements()
