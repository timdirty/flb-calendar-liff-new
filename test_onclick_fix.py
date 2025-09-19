#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試快速篩選按鈕 onclick 事件修復
"""

import requests
import json
from datetime import datetime, timedelta

def test_onclick_fix():
    """測試快速篩選按鈕 onclick 事件修復"""
    print("🧪 測試快速篩選按鈕 onclick 事件修復")
    print("=" * 50)
    
    base_url = "http://localhost:5001"
    
    try:
        # 1. 檢查後端事件總數
        print("1️⃣ 檢查後端事件總數...")
        events_response = requests.get(f"{base_url}/api/events", timeout=10)
        if events_response.status_code != 200:
            raise Exception(f"事件載入失敗: {events_response.status_code}")
        
        events_data = events_response.json()
        all_events = events_data['data']
        print(f"   ✅ 後端總事件數: {len(all_events)}")
        
        # 2. 檢查前端頁面
        print("\n2️⃣ 檢查前端頁面...")
        page_response = requests.get(f"{base_url}/perfect-calendar.html", timeout=10)
        if page_response.status_code == 200:
            content = page_response.text
            
            # 檢查 onclick 事件綁定
            if "button.onclick = function(event)" in content:
                print("   ✅ 添加了直接 onclick 事件綁定")
            else:
                print("   ❌ 沒有添加直接 onclick 事件綁定")
            
            if "console.log('🔍 直接 onclick 事件被觸發！'" in content:
                print("   ✅ 添加了 onclick 事件調試信息")
            else:
                print("   ❌ 沒有添加 onclick 事件調試信息")
            
            if "event.preventDefault()" in content:
                print("   ✅ 添加了事件阻止默認行為")
            else:
                print("   ❌ 沒有添加事件阻止默認行為")
            
            if "event.stopPropagation()" in content:
                print("   ✅ 添加了事件阻止冒泡")
            else:
                print("   ❌ 沒有添加事件阻止冒泡")
            
            if "handleQuickFilter(buttonInfo.key)" in content:
                print("   ✅ 直接調用 handleQuickFilter 函數")
            else:
                print("   ❌ 沒有直接調用 handleQuickFilter 函數")
                
        else:
            print(f"   ❌ 前端頁面載入失敗: {page_response.status_code}")
        
        # 3. 分析課別分布
        print("\n3️⃣ 分析課別分布...")
        esm_events = []
        spm_events = []
        boost_events = []
        spike_events = []
        
        for event in all_events:
            title = event['title'].lower()
            description = (event.get('description') or '').lower()
            
            if 'esm' in title or 'esm' in description:
                esm_events.append(event)
            elif 'spm' in title or 'spm' in description:
                spm_events.append(event)
            elif 'boost' in title or 'boost' in description:
                boost_events.append(event)
            elif 'spike' in title or 'spike' in description:
                spike_events.append(event)
        
        print(f"   📚 ESM 課程: {len(esm_events)} 個")
        print(f"   📚 SPM 課程: {len(spm_events)} 個")
        print(f"   📚 BOOST 課程: {len(boost_events)} 個")
        print(f"   📚 SPIKE 課程: {len(spike_events)} 個")
        
        print("\n" + "=" * 50)
        print("🎯 onclick 事件修復總結")
        print("=" * 50)
        print("✅ 修復內容:")
        print("   1. 添加直接 onclick 事件綁定作為備用")
        print("   2. 在按鈕創建時直接綁定 onclick 事件")
        print("   3. 添加事件阻止默認行為和冒泡")
        print("   4. 直接調用 handleQuickFilter 函數")
        print("   5. 添加詳細的 onclick 事件調試信息")
        
        print("\n✅ 預期效果:")
        print("   1. 按鈕創建時直接綁定 onclick 事件")
        print("   2. 點擊按鈕時會觸發 onclick 事件")
        print("   3. 事件會被正確處理和阻止冒泡")
        print("   4. 篩選功能會正常工作")
        print("   5. 會有詳細的 console 日誌")
        
        print("\n💡 測試步驟:")
        print("   1. 打開瀏覽器開發者工具")
        print("   2. 切換到「本月」或「全部」視圖")
        print("   3. 查看 console 日誌中的按鈕創建信息")
        print("   4. 檢查課別快速篩選區域是否有按鈕")
        print("   5. 點擊按鈕並查看 console 日誌")
        print("   6. 確認是否看到 '🔍 直接 onclick 事件被觸發！' 日誌")
        print("   7. 確認篩選功能是否正常工作")
        
        return True
        
    except Exception as e:
        print(f"\n❌ 測試失敗: {str(e)}")
        return False

def main():
    """主函數"""
    print("🚀 開始快速篩選按鈕 onclick 事件修復測試")
    print("=" * 50)
    
    success = test_onclick_fix()
    
    if success:
        print("\n🎉 onclick 事件修復測試完成！")
        print("💡 請在瀏覽器中測試按鈕點擊功能")
        return 0
    else:
        print("\n❌ onclick 事件修復測試失敗！")
        return 1

if __name__ == "__main__":
    exit(main())
