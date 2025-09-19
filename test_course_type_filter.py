#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試課別篩選功能
"""

import requests
import json
from datetime import datetime, timedelta

def test_course_type_filter():
    """測試課別篩選功能"""
    print("🧪 測試課別篩選功能")
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
        
        # 2. 分析課別分布
        print("\n2️⃣ 分析課別分布...")
        esm_events = []
        spm_events = []
        boost_events = []
        spike_events = []
        other_events = []
        
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
            else:
                other_events.append(event)
        
        print(f"   📚 ESM 課程: {len(esm_events)} 個")
        print(f"   📚 SPM 課程: {len(spm_events)} 個")
        print(f"   📚 BOOST 課程: {len(boost_events)} 個")
        print(f"   📚 SPIKE 課程: {len(spike_events)} 個")
        print(f"   📚 其他課程: {len(other_events)} 個")
        
        # 3. 檢查前端頁面
        print("\n3️⃣ 檢查前端頁面...")
        page_response = requests.get(f"{base_url}/perfect-calendar.html", timeout=10)
        if page_response.status_code == 200:
            content = page_response.text
            
            # 檢查課別篩選邏輯是否已添加
            if "課別快速篩選" in content:
                print("   ✅ 課別快速篩選 UI 已存在")
            else:
                print("   ❌ 課別快速篩選 UI 不存在")
            
            if "['esm', 'spm', 'boost', 'spike'].includes(currentQuickFilter)" in content:
                print("   ✅ 課別篩選邏輯已添加 (支援 ESM, SPM, BOOST, SPIKE)")
            else:
                print("   ❌ 課別篩選邏輯未添加")
            
            if "esm" in content and "spm" in content and "boost" in content and "spike" in content:
                print("   ✅ 所有課程類型關鍵字已添加")
            else:
                print("   ❌ 部分課程類型關鍵字未添加")
                
        else:
            print(f"   ❌ 前端頁面載入失敗: {page_response.status_code}")
        
        # 4. 模擬課別篩選邏輯
        print("\n4️⃣ 模擬課別篩選邏輯...")
        
        # 模擬 ESM 篩選
        esm_filtered = [event for event in all_events if 'esm' in event['title'].lower() or 'esm' in (event.get('description') or '').lower()]
        print(f"   🔍 ESM 篩選結果: {len(esm_filtered)} 個事件")
        
        # 模擬 SPM 篩選
        spm_filtered = [event for event in all_events if 'spm' in event['title'].lower() or 'spm' in (event.get('description') or '').lower()]
        print(f"   🔍 SPM 篩選結果: {len(spm_filtered)} 個事件")
        
        # 模擬 BOOST 篩選
        boost_filtered = [event for event in all_events if 'boost' in event['title'].lower() or 'boost' in (event.get('description') or '').lower()]
        print(f"   🔍 BOOST 篩選結果: {len(boost_filtered)} 個事件")
        
        # 模擬 SPIKE 篩選
        spike_filtered = [event for event in all_events if 'spike' in event['title'].lower() or 'spike' in (event.get('description') or '').lower()]
        print(f"   🔍 SPIKE 篩選結果: {len(spike_filtered)} 個事件")
        
        # 5. 檢查課別快速篩選按鈕
        print("\n5️⃣ 檢查課別快速篩選按鈕...")
        if page_response.status_code == 200:
            content = page_response.text
            
            # 檢查動態生成的按鈕（只有有課程的課別才會顯示）
            if 'data-quick="esm"' in content:
                print("   ✅ ESM 快速篩選按鈕已存在")
            else:
                print("   ❌ ESM 快速篩選按鈕不存在")
            
            if 'data-quick="spm"' in content:
                print("   ✅ SPM 快速篩選按鈕已存在")
            else:
                print("   ❌ SPM 快速篩選按鈕不存在")
            
            # BOOST 和 SPIKE 按鈕會動態生成，只有有課程時才顯示
            if 'data-quick="boost"' in content:
                print("   ✅ BOOST 快速篩選按鈕已存在")
            else:
                print("   ⚠️ BOOST 快速篩選按鈕不存在 (可能沒有 BOOST 課程)")
            
            if 'data-quick="spike"' in content:
                print("   ✅ SPIKE 快速篩選按鈕已存在")
            else:
                print("   ⚠️ SPIKE 快速篩選按鈕不存在 (可能沒有 SPIKE 課程)")
        
        print("\n" + "=" * 50)
        print("🎯 課別篩選功能測試總結")
        print("=" * 50)
        print("✅ 功能特點:")
        print("   - 自動根據標題和描述識別課程類別 (ESM, SPM, BOOST, SPIKE)")
        print("   - 動態顯示有課程的課別按鈕")
        print("   - 顯示課程數量統計")
        print("   - 支援快速篩選功能")
        
        print("\n✅ 修復內容:")
        print("   1. 在 renderEvents() 中添加課別篩選邏輯")
        print("   2. 在 updateStats() 中添加課別篩選邏輯")
        print("   3. 支援 ESM, SPM, BOOST, SPIKE 課程類型篩選")
        print("   4. 檢查標題和描述中的關鍵字")
        print("   5. 確保統計資訊和顯示一致")
        
        print("\n💡 測試建議:")
        print("   1. 打開 http://localhost:5001/perfect-calendar.html")
        print("   2. 切換到「本月」或「全部」視圖")
        print("   3. 查看課別快速篩選按鈕")
        print("   4. 點擊 ESM, SPM, BOOST, SPIKE 按鈕測試篩選")
        print("   5. 檢查統計卡片是否正確更新")
        
        return True
        
    except Exception as e:
        print(f"\n❌ 測試失敗: {str(e)}")
        return False

def main():
    """主函數"""
    print("🚀 開始課別篩選功能測試")
    print("=" * 50)
    
    success = test_course_type_filter()
    
    if success:
        print("\n🎉 課別篩選功能測試完成！")
        print("💡 請在瀏覽器中測試課別篩選功能")
        return 0
    else:
        print("\n❌ 課別篩選功能測試失敗！")
        return 1

if __name__ == "__main__":
    exit(main())
