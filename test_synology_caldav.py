#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試 Synology CalDAV 伺服器連接
"""

import requests
from requests.auth import HTTPBasicAuth
import xml.etree.ElementTree as ET

def test_synology_caldav():
    """測試 Synology CalDAV 伺服器"""
    print("🧪 測試 Synology CalDAV 伺服器")
    print("=" * 50)
    
    # CalDAV 配置 - 嘗試不同的路徑
    configs = [
        {
            'name': '根路徑',
            'url': 'https://funlearnbar.synology.me:9102/',
            'username': 'testacount',
            'password': 'testacount'
        },
        {
            'name': 'caldav 路徑',
            'url': 'https://funlearnbar.synology.me:9102/caldav/',
            'username': 'testacount',
            'password': 'testacount'
        },
        {
            'name': 'caldav 路徑（無斜線）',
            'url': 'https://funlearnbar.synology.me:9102/caldav',
            'username': 'testacount',
            'password': 'testacount'
        }
    ]
    
    for config in configs:
        print(f"\n📡 測試配置: {config['name']}")
        print(f"   URL: {config['url']}")
        print(f"   用戶名: {config['username']}")
        print(f"   密碼: {'*' * len(config['password'])}")
        
        try:
            # 1. 測試基本連接
            print("\n   1️⃣ 測試基本連接...")
            response = requests.get(config['url'], auth=HTTPBasicAuth(config['username'], config['password']), timeout=30)
            print(f"      狀態碼: {response.status_code}")
            print(f"      回應標頭: {dict(response.headers)}")
            
            if response.status_code == 200:
                print("      ✅ 基本連接成功")
            elif response.status_code == 404:
                print("      ⚠️ 路徑不存在，但伺服器回應正常")
            else:
                print(f"      ❌ 基本連接失敗: {response.status_code}")
                print(f"      回應內容: {response.text[:200]}...")
                continue
            
            # 2. 測試 PROPFIND 請求
            print("\n   2️⃣ 測試 PROPFIND 請求...")
            
            headers = {
                'Content-Type': 'application/xml',
                'Depth': '1'
            }
            
            propfind_body = '''<?xml version="1.0" encoding="utf-8"?>
<D:propfind xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
    <D:prop>
        <D:getetag/>
        <C:calendar-data/>
    </D:prop>
</D:propfind>'''
            
            response = requests.request(
                'PROPFIND',
                config['url'],
                data=propfind_body,
                headers=headers,
                auth=HTTPBasicAuth(config['username'], config['password']),
                timeout=30
            )
            
            print(f"      狀態碼: {response.status_code}")
            print(f"      回應標頭: {dict(response.headers)}")
            
            if response.status_code == 207:
                print("      ✅ PROPFIND 請求成功")
                
                # 3. 解析回應
                print("\n   3️⃣ 解析回應...")
                try:
                    root = ET.fromstring(response.content)
                    print(f"      XML 根元素: {root.tag}")
                    
                    # 定義命名空間
                    namespaces = {
                        'D': 'DAV:',
                        'C': 'urn:ietf:params:xml:ns:caldav'
                    }
                    
                    # 查找回應項目
                    responses = root.findall('.//D:response', namespaces)
                    print(f"      找到 {len(responses)} 個回應項目")
                    
                    # 查找日曆資料
                    calendar_data_count = 0
                    events_found = 0
                    
                    for i, response_elem in enumerate(responses):
                        print(f"\n      📅 回應項目 {i+1}:")
                        
                        # 查找 href
                        href_elem = response_elem.find('.//D:href', namespaces)
                        if href_elem is not None:
                            print(f"         HREF: {href_elem.text}")
                        
                        # 查找 calendar-data
                        calendar_data_elem = response_elem.find('.//C:calendar-data', namespaces)
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
                        print("      🎉 成功找到日曆事件！")
                        print(f"      ✅ 推薦使用配置: {config['name']}")
                        print(f"      📡 推薦 URL: {config['url']}")
                        return True
                    else:
                        print("      ⚠️ 沒有找到日曆事件")
                        
                except ET.ParseError as e:
                    print(f"      ❌ XML 解析失敗: {str(e)}")
                    print(f"      原始回應: {response.text[:500]}...")
                    
            elif response.status_code == 401:
                print("      ❌ 認證失敗 (401)")
                print("      💡 請檢查用戶名和密碼")
            elif response.status_code == 404:
                print("      ❌ 日曆路徑不存在 (404)")
                print("      💡 請檢查日曆路徑是否正確")
            else:
                print(f"      ❌ PROPFIND 請求失敗: {response.status_code}")
                print(f"      回應內容: {response.text[:200]}...")
                
        except requests.exceptions.SSLError as e:
            print(f"      ❌ SSL 錯誤: {str(e)}")
            print("      💡 可能需要忽略 SSL 證書驗證")
        except requests.exceptions.ConnectionError as e:
            print(f"      ❌ 連接錯誤: {str(e)}")
            print("      💡 請檢查網路連接和伺服器地址")
        except Exception as e:
            print(f"      ❌ 測試失敗: {str(e)}")
    
    return False

def main():
    """主測試函數"""
    print("🚀 開始 Synology CalDAV 測試")
    print("=" * 50)
    
    success = test_synology_caldav()
    
    if success:
        print("\n🎉 Synology CalDAV 測試成功！")
        print("💡 可以開始使用真實的 CalDAV 資料")
        return 0
    else:
        print("\n❌ Synology CalDAV 測試失敗！")
        print("💡 請檢查伺服器設定和認證資訊")
        return 1

if __name__ == "__main__":
    exit(main())