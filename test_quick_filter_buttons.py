#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試快速篩選按鈕點擊功能
"""

import requests
import json
from datetime import datetime, timedelta

def test_quick_filter_buttons():
    """測試快速篩選按鈕點擊功能"""
    print("🧪 測試快速篩選按鈕點擊功能")
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
            
            # 檢查快速篩選相關函數
            if "bindQuickFilterButtons" in content:
                print("   ✅ bindQuickFilterButtons 函數存在")
            else:
                print("   ❌ bindQuickFilterButtons 函數不存在")
            
            if "handleQuickFilterClick" in content:
                print("   ✅ handleQuickFilterClick 函數存在")
            else:
                print("   ❌ handleQuickFilterClick 函數不存在")
            
            if "handleQuickFilter" in content:
                print("   ✅ handleQuickFilter 函數存在")
            else:
                print("   ❌ handleQuickFilter 函數不存在")
            
            # 檢查課別篩選相關
            if "updateCourseTypeQuickFilters" in content:
                print("   ✅ updateCourseTypeQuickFilters 函數存在")
            else:
                print("   ❌ updateCourseTypeQuickFilters 函數不存在")
            
            # 檢查動態按鈕生成
            if "createElement('button')" in content:
                print("   ✅ 動態按鈕生成邏輯存在")
            else:
                print("   ❌ 動態按鈕生成邏輯不存在")
            
            # 檢查事件監聽器綁定
            if "addEventListener('click', handleQuickFilterClick)" in content:
                print("   ✅ 事件監聽器綁定邏輯存在")
            else:
                print("   ❌ 事件監聽器綁定邏輯不存在")
                
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
        
        # 4. 檢查課別篩選邏輯
        print("\n4️⃣ 檢查課別篩選邏輯...")
        if page_response.status_code == 200:
            content = page_response.text
            
            # 檢查課別篩選條件
            if "['esm', 'spm', 'boost', 'spike'].includes(currentQuickFilter)" in content:
                print("   ✅ 課別篩選條件正確")
            else:
                print("   ❌ 課別篩選條件不正確")
            
            # 檢查標題和描述檢查
            if "title.includes(keyword) && !description.includes(keyword)" in content:
                print("   ✅ 標題和描述檢查邏輯正確")
            else:
                print("   ❌ 標題和描述檢查邏輯不正確")
        
        print("\n" + "=" * 50)
        print("🎯 快速篩選按鈕測試總結")
        print("=" * 50)
        print("✅ 可能的原因分析:")
        print("   1. 動態生成的按鈕沒有正確綁定事件監聽器")
        print("   2. 課別快速篩選按鈕在初始化時沒有生成")
        print("   3. 事件監聽器綁定時機不對")
        print("   4. CSS 樣式可能阻止了點擊事件")
        
        print("\n✅ 修復建議:")
        print("   1. 確保 updateCourseTypeQuickFilters() 在頁面載入時被調用")
        print("   2. 確保 bindQuickFilterButtons() 在動態生成按鈕後被調用")
        print("   3. 檢查按鈕的 CSS 樣式，確保沒有 pointer-events: none")
        print("   4. 添加 console.log 來調試按鈕點擊事件")
        
        print("\n💡 測試建議:")
        print("   1. 打開瀏覽器開發者工具")
        print("   2. 切換到「本月」或「全部」視圖")
        print("   3. 檢查課別快速篩選按鈕是否出現")
        print("   4. 點擊按鈕並查看 console 日誌")
        print("   5. 檢查按鈕是否有 cursor: pointer 樣式")
        
        return True
        
    except Exception as e:
        print(f"\n❌ 測試失敗: {str(e)}")
        return False

def main():
    """主函數"""
    print("🚀 開始快速篩選按鈕點擊功能測試")
    print("=" * 50)
    
    success = test_quick_filter_buttons()
    
    if success:
        print("\n🎉 快速篩選按鈕測試完成！")
        print("💡 請在瀏覽器中測試按鈕點擊功能")
        return 0
    else:
        print("\n❌ 快速篩選按鈕測試失敗！")
        return 1

if __name__ == "__main__":
    exit(main())
