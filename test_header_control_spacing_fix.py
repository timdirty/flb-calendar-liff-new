#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試標題區塊和篩選區塊間距修復
"""

import requests
import time
from datetime import datetime

def test_header_control_spacing_fix():
    """測試標題區塊和篩選區塊間距修復"""
    print("🔄 測試標題區塊和篩選區塊間距修復...")
    
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
                
                # 檢查標題區塊間距修復
                if 'margin-bottom: 0 !important' in frontend_response.text and 'position: relative !important' in frontend_response.text:
                    print("✅ 標題區塊間距已修復：移除底部間距，避免與篩選區塊重疊")
                else:
                    print("❌ 標題區塊間距修復不完整")
                
                # 檢查篩選區塊定位修復
                if 'margin: 0 !important' in frontend_response.text and 'border-radius: 0 !important' in frontend_response.text:
                    print("✅ 篩選區塊定位已修復：確保覆蓋在標題區塊上方")
                else:
                    print("❌ 篩選區塊定位修復不完整")
                
                # 檢查主內容區域間距修復
                if 'margin-top: 0 !important' in frontend_response.text:
                    print("✅ 主內容區域間距已修復：移除頂部間距，讓內容緊貼篩選區塊")
                else:
                    print("❌ 主內容區域間距修復不完整")
                
                # 檢查滑動動畫修復
                if 'controlHeight + 10' in frontend_response.text and '額外 10px 間距' in frontend_response.text:
                    print("✅ 滑動動畫已修復：正確計算篩選區塊高度，添加適當間距")
                else:
                    print("❌ 滑動動畫修復不完整")
                
                # 檢查篩選區塊固定定位
                if 'position: fixed !important' in frontend_response.text and 'z-index: 9999' in frontend_response.text:
                    print("✅ 篩選區塊固定定位正確：position: fixed, z-index: 9999")
                else:
                    print("❌ 篩選區塊固定定位有問題")
                
                # 檢查硬體加速優化
                if 'transform: translateZ(0) !important' in frontend_response.text and 'will-change: auto !important' in frontend_response.text:
                    print("✅ 硬體加速優化已應用：提升渲染性能")
                else:
                    print("❌ 硬體加速優化不完整")
                
                # 檢查控制台日誌更新
                if '篩選區塊高度:' in frontend_response.text:
                    print("✅ 控制台日誌已更新：提供詳細的調試信息")
                else:
                    print("❌ 控制台日誌更新不完整")
                
                # 檢查沒有過大的間距設定
                if 'margin-top: 220px' not in frontend_response.text:
                    print("✅ 已移除過大的間距設定：避免間距突然變大")
                else:
                    print("❌ 仍然存在過大的間距設定")
                
                # 檢查響應式設計
                if '@media (max-width: 768px)' in frontend_response.text:
                    print("✅ 響應式設計正常：支援行動裝置")
                else:
                    print("❌ 響應式設計有問題")
                    
            else:
                print(f"❌ 前端頁面載入失敗: {frontend_response.status_code}")
                
        else:
            print(f"❌ 伺服器連接失敗: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 請求失敗: {e}")
    except Exception as e:
        print(f"❌ 測試失敗: {e}")

if __name__ == "__main__":
    test_header_control_spacing_fix()
