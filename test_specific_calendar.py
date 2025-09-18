#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試具體的日曆項目
"""

import requests
from requests.auth import HTTPBasicAuth
import xml.etree.ElementTree as ET

def test_specific_calendar():
    """測試具體的日曆項目"""
    print("🔍 測試具體的日曆項目")
    print("=" * 50)
    
    # 從之前的調試結果中，我們知道有這些日曆
    calendars = [
        '/caldav.php/testacount/qwiymrcu/',
        '/caldav.php/testacount/qukmen/',
        '/caldav.php/testacount/lnwbvu/',
        '/caldav.php/testacount/ltvxjeh/',
        '/caldav.php/testacount/osikiz/',
        '/caldav.php/testacount/xdtbj/',
        '/caldav.php/testacount/jzeblk/',
        '/caldav.php/testacount/muqmqxqy/',
        '/caldav.php/testacount/rptffmz/',
        '/caldav.php/testacount/mcskmf/',
        '/caldav.php/testacount/waoaqdsq/',
        '/caldav.php/testacount/phatvkdb/',
        '/caldav.php/testacount/siicqjqc/',
        '/caldav.php/testacount/wutswfs/',
        '/caldav.php/testacount/xfgdzu/',
        '/caldav.php/testacount/fzbbf/',
        '/caldav.php/testacount/eciccpso/'
    ]
    
    config = {
        'url': 'https://funlearnbar.synology.me:9102',
        'username': 'testacount',
        'password': 'testacount'
    }
    
    namespaces = {
        'D': 'DAV:',
        'C': 'urn:ietf:params:xml:ns:caldav'
    }
    
    for i, calendar_path in enumerate(calendars[:5]):  # 只測試前5個
        print(f"\n📅 測試日曆 {i+1}: {calendar_path}")
        
        try:
            calendar_url = config['url'] + calendar_path
            
            response = requests.request(
                'PROPFIND',
                calendar_url,
                data='''<?xml version="1.0" encoding="utf-8"?>
<D:propfind xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
    <D:prop>
        <D:getetag/>
        <C:calendar-data/>
    </D:prop>
</D:propfind>''',
                headers={
                    'Content-Type': 'application/xml',
                    'Depth': '1'
                },
                auth=HTTPBasicAuth(config['username'], config['password']),
                timeout=30
            )
            
            print(f"   狀態碼: {response.status_code}")
            
            if response.status_code == 207:
                print("   ✅ PROPFIND 成功")
                
                # 解析回應
                root = ET.fromstring(response.content)
                responses = root.findall('.//D:response', namespaces)
                print(f"   找到 {len(responses)} 個回應項目")
                
                events_found = 0
                for response_elem in responses:
                    # 查找 calendar-data
                    calendar_data_elem = response_elem.find('.//C:calendar-data', namespaces)
                    if calendar_data_elem is not None and calendar_data_elem.text:
                        ical_content = calendar_data_elem.text
                        print(f"   📅 找到 iCal 內容: {len(ical_content)} 字元")
                        
                        # 簡單解析 iCal 內容
                        lines = ical_content.split('\n')
                        for line in lines:
                            if line.startswith('BEGIN:VEVENT'):
                                events_found += 1
                            elif line.startswith('SUMMARY:'):
                                summary = line.replace('SUMMARY:', '').strip()
                                print(f"      事件: {summary}")
                        
                        if events_found > 0:
                            print(f"   🎉 找到 {events_found} 個事件！")
                            print(f"   ✅ 推薦使用日曆路徑: {calendar_path}")
                            return calendar_path
                
                print(f"   📊 找到 {events_found} 個事件")
                
            else:
                print(f"   ❌ PROPFIND 失敗: {response.status_code}")
                print(f"   回應內容: {response.text[:200]}...")
        
        except Exception as e:
            print(f"   ❌ 測試失敗: {str(e)}")
    
    print("\n❌ 沒有找到包含事件的日曆")
    return None

def main():
    """主函數"""
    print("🚀 開始測試具體日曆項目")
    print("=" * 50)
    
    result = test_specific_calendar()
    
    if result:
        print(f"\n🎉 找到有效日曆: {result}")
        print("💡 請更新 CalDAV 配置使用此日曆路徑")
    else:
        print("\n❌ 沒有找到包含事件的日曆")
        print("💡 可能需要檢查 CalDAV 伺服器設定或添加事件")

if __name__ == "__main__":
    main()
