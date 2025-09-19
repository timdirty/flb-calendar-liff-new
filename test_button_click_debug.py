#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
調試快速篩選按鈕點擊問題
"""

import requests
import json
from datetime import datetime, timedelta

def test_button_click_debug():
    """調試快速篩選按鈕點擊問題"""
    print("🔍 調試快速篩選按鈕點擊問題")
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
            
            # 檢查課別分布
            esm_count = content.count('esm')
            spm_count = content.count('spm')
            boost_count = content.count('boost')
            spike_count = content.count('spike')
            
            print(f"   📊 關鍵字出現次數:")
            print(f"      - 'esm': {esm_count} 次")
            print(f"      - 'spm': {spm_count} 次")
            print(f"      - 'boost': {boost_count} 次")
            print(f"      - 'spike': {spike_count} 次")
            
            # 檢查動態按鈕生成邏輯
            if "createElement('button')" in content:
                print("   ✅ 動態按鈕生成邏輯存在")
            else:
                print("   ❌ 動態按鈕生成邏輯不存在")
            
            # 檢查事件監聽器綁定
            if "addEventListener('click', handleQuickFilterClick)" in content:
                print("   ✅ 事件監聽器綁定邏輯存在")
            else:
                print("   ❌ 事件監聽器綁定邏輯不存在")
            
            # 檢查初始化調用
            if "updateCourseTypeQuickFilters()" in content:
                print("   ✅ updateCourseTypeQuickFilters 函數調用存在")
            else:
                print("   ❌ updateCourseTypeQuickFilters 函數調用不存在")
            
            # 檢查課別篩選邏輯
            if "['esm', 'spm', 'boost', 'spike'].includes(currentQuickFilter)" in content:
                print("   ✅ 課別篩選邏輯存在")
            else:
                print("   ❌ 課別篩選邏輯不存在")
                
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
        
        # 4. 檢查可能的問題
        print("\n4️⃣ 檢查可能的問題...")
        
        # 檢查是否有 console.log 調試信息
        console_log_count = content.count('console.log')
        console_warn_count = content.count('console.warn')
        console_error_count = content.count('console.error')
        
        print(f"   🔍 調試信息統計:")
        print(f"      - console.log: {console_log_count} 個")
        print(f"      - console.warn: {console_warn_count} 個")
        print(f"      - console.error: {console_error_count} 個")
        
        # 檢查事件監聽器綁定時機
        if "bindQuickFilterButtons()" in content:
            print("   ✅ bindQuickFilterButtons 函數調用存在")
        else:
            print("   ❌ bindQuickFilterButtons 函數調用不存在")
        
        # 檢查按鈕生成時機
        if "updateCourseTypeQuickFilters()" in content:
            print("   ✅ updateCourseTypeQuickFilters 函數調用存在")
        else:
            print("   ❌ updateCourseTypeQuickFilters 函數調用不存在")
        
        print("\n" + "=" * 50)
        print("🎯 調試結果總結")
        print("=" * 50)
        print("✅ 可能的原因:")
        print("   1. 課別快速篩選按鈕沒有在頁面載入時生成")
        print("   2. 事件監聽器綁定時機不對")
        print("   3. 按鈕生成後沒有正確綁定事件")
        print("   4. CSS 樣式問題")
        
        print("\n✅ 修復建議:")
        print("   1. 確保 updateCourseTypeQuickFilters() 在頁面載入時被調用")
        print("   2. 確保 bindQuickFilterButtons() 在動態生成按鈕後被調用")
        print("   3. 添加更多 console.log 來調試按鈕生成和綁定過程")
        print("   4. 檢查按鈕是否正確生成並添加到 DOM")
        
        print("\n💡 測試步驟:")
        print("   1. 打開瀏覽器開發者工具")
        print("   2. 切換到「本月」或「全部」視圖")
        print("   3. 查看 console 日誌中的按鈕綁定信息")
        print("   4. 檢查課別快速篩選區域是否有按鈕")
        print("   5. 嘗試點擊按鈕並查看 console 日誌")
        
        return True
        
    except Exception as e:
        print(f"\n❌ 調試失敗: {str(e)}")
        return False

def main():
    """主函數"""
    print("🚀 開始快速篩選按鈕點擊問題調試")
    print("=" * 50)
    
    success = test_button_click_debug()
    
    if success:
        print("\n🎉 調試完成！")
        print("💡 請按照建議進行進一步測試")
        return 0
    else:
        print("\n❌ 調試失敗！")
        return 1

if __name__ == "__main__":
    exit(main())
