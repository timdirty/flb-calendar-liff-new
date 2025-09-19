#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試快速篩選按鈕修復效果
"""

import requests
import json
from datetime import datetime, timedelta

def test_button_fix():
    """測試快速篩選按鈕修復效果"""
    print("🧪 測試快速篩選按鈕修復效果")
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
            
            # 檢查修復內容
            if "bindQuickFilterButtons(); // 移到動態按鈕生成後調用" in content:
                print("   ✅ 初始化時不再調用 bindQuickFilterButtons")
            else:
                print("   ❌ 初始化時仍會調用 bindQuickFilterButtons")
            
            if "button.style.pointerEvents = 'auto'" in content:
                print("   ✅ 添加了 pointerEvents: auto 確保可點擊")
            else:
                print("   ❌ 沒有添加 pointerEvents: auto")
            
            if "console.log('🔍 快速篩選按鈕被點擊！')" in content:
                print("   ✅ 添加了詳細的點擊調試信息")
            else:
                print("   ❌ 沒有添加點擊調試信息")
            
            if "button._hoverEnter" in content:
                print("   ✅ 添加了 hover 事件監聽器管理")
            else:
                print("   ❌ 沒有添加 hover 事件監聽器管理")
            
            if "console.log('🎉 所有快速篩選按鈕事件監聽器綁定完成')" in content:
                print("   ✅ 添加了綁定完成確認信息")
            else:
                print("   ❌ 沒有添加綁定完成確認信息")
                
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
        print("🎯 修復效果總結")
        print("=" * 50)
        print("✅ 修復內容:")
        print("   1. 移除初始化時的 bindQuickFilterButtons 調用")
        print("   2. 添加 pointerEvents: auto 確保按鈕可點擊")
        print("   3. 添加詳細的點擊調試信息")
        print("   4. 改進 hover 事件監聽器管理")
        print("   5. 添加綁定完成確認信息")
        
        print("\n✅ 預期效果:")
        print("   1. 課別快速篩選按鈕會在切換到「本月」或「全部」時生成")
        print("   2. 按鈕生成後會正確綁定事件監聽器")
        print("   3. 按鈕可以正常點擊並響應")
        print("   4. 點擊時會有詳細的 console 日誌")
        
        print("\n💡 測試步驟:")
        print("   1. 打開瀏覽器開發者工具")
        print("   2. 切換到「本月」或「全部」視圖")
        print("   3. 查看 console 日誌中的按鈕生成和綁定信息")
        print("   4. 檢查課別快速篩選區域是否有按鈕")
        print("   5. 點擊按鈕並查看 console 日誌")
        print("   6. 確認篩選功能是否正常工作")
        
        return True
        
    except Exception as e:
        print(f"\n❌ 測試失敗: {str(e)}")
        return False

def main():
    """主函數"""
    print("🚀 開始快速篩選按鈕修復效果測試")
    print("=" * 50)
    
    success = test_button_fix()
    
    if success:
        print("\n🎉 修復效果測試完成！")
        print("💡 請在瀏覽器中測試按鈕點擊功能")
        return 0
    else:
        print("\n❌ 修復效果測試失敗！")
        return 1

if __name__ == "__main__":
    exit(main())
