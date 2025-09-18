#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
調試 CalDAV 回應，檢查為什麼沒有載入事件
"""

import requests
from requests.auth import HTTPBasicAuth
import xml.etree.ElementTree as ET

def debug_caldav_response():
    """調試 CalDAV 回應"""
    print("🔍 調試 CalDAV 回應")
    print("=" * 50)
    
    # CalDAV 配置
    config = {
        'url': 'https://funlearnbar.synology.me:9102/caldav/',
        'username': 'testacount',
        'password': 'testacount'
    }
    
    try:
        # 1. 測試根路徑
        print("1️⃣ 測試根路徑...")
        response = requests.request(
            'PROPFIND',
            config['url'],
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
        print(f"   回應標頭: {dict(response.headers)}")
        
        if response.status_code == 207:
            print("   ✅ 根路徑 PROPFIND 成功")
            
            # 解析 XML
            root = ET.fromstring(response.content)
            namespaces = {
                'D': 'DAV:',
                'C': 'urn:ietf:params:xml:ns:caldav'
            }
            
            responses = root.findall('.//D:response', namespaces)
            print(f"   找到 {len(responses)} 個回應項目")
            
            for i, response_elem in enumerate(responses):
                print(f"\n   📅 回應項目 {i+1}:")
                
                # 查找 href
                href_elem = response_elem.find('.//D:href', namespaces)
                if href_elem is not None:
                    href = href_elem.text
                    print(f"      HREF: {href}")
                    
                    # 測試這個路徑
                    test_path = f"https://funlearnbar.synology.me:9102{href}"
                    print(f"      測試路徑: {test_path}")
                    
                    # 2. 測試具體路徑
                    print(f"\n   2️⃣ 測試路徑: {href}")
                    test_response = requests.request(
                        'PROPFIND',
                        test_path,
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
                    
                    print(f"      狀態碼: {test_response.status_code}")
                    
                    if test_response.status_code == 207:
                        print("      ✅ 路徑 PROPFIND 成功")
                        
                        # 解析回應
                        test_root = ET.fromstring(test_response.content)
                        test_responses = test_root.findall('.//D:response', namespaces)
                        print(f"      找到 {len(test_responses)} 個子項目")
                        
                        # 查找日曆資料
                        calendar_data_count = 0
                        events_found = 0
                        
                        for j, test_response_elem in enumerate(test_responses):
                            print(f"\n      📅 子項目 {j+1}:")
                            
                            # 查找 href
                            test_href_elem = test_response_elem.find('.//D:href', namespaces)
                            if test_href_elem is not None:
                                href = test_href_elem.text
                                print(f"         HREF: {href}")
                                
                                # 如果是具體的日曆項目（不是目錄），測試它
                                if href != '/caldav.php/testacount/' and href.endswith('/'):
                                    print(f"         🔍 測試具體日曆: {href}")
                                    
                                    # 測試這個具體日曆
                                    calendar_url = f"https://funlearnbar.synology.me:9102{href}"
                                    calendar_response = requests.request(
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
                                    
                                    if calendar_response.status_code == 207:
                                        print(f"         ✅ 日曆 PROPFIND 成功")
                                        
                                        # 解析日曆回應
                                        calendar_root = ET.fromstring(calendar_response.content)
                                        calendar_responses = calendar_root.findall('.//D:response', namespaces)
                                        print(f"         找到 {len(calendar_responses)} 個日曆項目")
                                        
                                        for k, calendar_response_elem in enumerate(calendar_responses):
                                            # 查找 calendar-data
                                            calendar_data_elem = calendar_response_elem.find('.//C:calendar-data', namespaces)
                                            if calendar_data_elem is not None and calendar_data_elem.text:
                                                calendar_data_count += 1
                                                ical_content = calendar_data_elem.text
                                                print(f"         📅 找到 iCal 內容: {len(ical_content)} 字元")
                                                
                                                # 簡單解析 iCal 內容
                                                lines = ical_content.split('\n')
                                                for line in lines:
                                                    if line.startswith('BEGIN:VEVENT'):
                                                        events_found += 1
                                                    elif line.startswith('SUMMARY:'):
                                                        summary = line.replace('SUMMARY:', '').strip()
                                                        print(f"           事件: {summary}")
                                                
                                                if events_found > 0:
                                                    print(f"         🎉 在日曆 {href} 找到事件！")
                                                    return href
                                    else:
                                        print(f"         ❌ 日曆 PROPFIND 失敗: {calendar_response.status_code}")
                            
                            # 查找 calendar-data
                            calendar_data_elem = test_response_elem.find('.//C:calendar-data', namespaces)
                            if calendar_data_elem is not None and calendar_data_elem.text:
                                calendar_data_count += 1
                                ical_content = calendar_data_elem.text
                                print(f"         📅 找到 iCal 內容: {len(ical_content)} 字元")
                                
                                # 簡單解析 iCal 內容
                                lines = ical_content.split('\n')
                                for line in lines:
                                    if line.startswith('BEGIN:VEVENT'):
                                        events_found += 1
                                    elif line.startswith('SUMMARY:'):
                                        summary = line.replace('SUMMARY:', '').strip()
                                        print(f"           事件: {summary}")
                        
                        print(f"\n      📊 統計:")
                        print(f"         日曆資料項目: {calendar_data_count}")
                        print(f"         找到事件: {events_found}")
                        
                        if events_found > 0:
                            print(f"      🎉 在路徑 {href} 找到事件！")
                            return href
                    else:
                        print(f"      ❌ 路徑 PROPFIND 失敗: {test_response.status_code}")
                        print(f"      回應內容: {test_response.text[:200]}...")
        
        else:
            print(f"   ❌ 根路徑 PROPFIND 失敗: {response.status_code}")
            print(f"   回應內容: {response.text[:200]}...")
    
    except Exception as e:
        print(f"   ❌ 調試失敗: {str(e)}")
    
    return None

def main():
    """主函數"""
    print("🚀 開始 CalDAV 回應調試")
    print("=" * 50)
    
    result = debug_caldav_response()
    
    if result:
        print(f"\n🎉 找到有效路徑: {result}")
        print("💡 請更新 CalDAV 配置使用此路徑")
    else:
        print("\n❌ 沒有找到有效的事件路徑")
        print("💡 可能需要檢查 CalDAV 伺服器設定")

if __name__ == "__main__":
    main()
