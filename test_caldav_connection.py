#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CalDAV 連接測試腳本
測試不同的 CalDAV 配置和認證方式
"""

import requests
from requests.auth import HTTPBasicAuth
import xml.etree.ElementTree as ET

def test_caldav_connection():
    """測試 CalDAV 連接"""
    print("🔍 測試 CalDAV 連接...")
    
    # 測試不同的 CalDAV 配置
    configs = [
        {
            'name': 'iCloud CalDAV (標準)',
            'url': 'https://caldav.icloud.com',
            'username': 'timdirty@icloud.com',
            'password': 'TimDirty2024!',
            'calendar_path': '/calendars/timdirty@icloud.com/'
        },
        {
            'name': 'iCloud CalDAV (應用程式密碼)',
            'url': 'https://caldav.icloud.com',
            'username': 'timdirty@icloud.com',
            'password': 'TimDirty2024!',
            'calendar_path': '/calendars/timdirty@icloud.com/'
        },
        {
            'name': 'iCloud CalDAV (完整 URL)',
            'url': 'https://caldav.icloud.com/calendars/timdirty@icloud.com/',
            'username': 'timdirty@icloud.com',
            'password': 'TimDirty2024!',
            'calendar_path': ''
        }
    ]
    
    for config in configs:
        print(f"\n📡 測試配置: {config['name']}")
        print(f"   URL: {config['url']}")
        print(f"   用戶名: {config['username']}")
        print(f"   日曆路徑: {config['calendar_path']}")
        
        try:
            # 構建完整 URL
            if config['calendar_path']:
                full_url = config['url'] + config['calendar_path']
            else:
                full_url = config['url']
            
            # 構建 PROPFIND 請求
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
            
            # 發送請求
            response = requests.request(
                'PROPFIND',
                full_url,
                data=propfind_body,
                headers=headers,
                auth=HTTPBasicAuth(config['username'], config['password']),
                timeout=30
            )
            
            print(f"   狀態碼: {response.status_code}")
            print(f"   回應標頭: {dict(response.headers)}")
            
            if response.status_code == 207:
                print("   ✅ 連接成功！")
                
                # 嘗試解析回應
                try:
                    root = ET.fromstring(response.content)
                    print(f"   📅 XML 解析成功，根元素: {root.tag}")
                    
                    # 檢查是否有事件
                    namespaces = {
                        'D': 'DAV:',
                        'C': 'urn:ietf:params:xml:ns:caldav'
                    }
                    
                    responses = root.findall('.//D:response', namespaces)
                    print(f"   📅 找到 {len(responses)} 個回應項目")
                    
                    calendar_data_count = 0
                    for response_elem in responses:
                        calendar_data_elem = response_elem.find('.//C:calendar-data', namespaces)
                        if calendar_data_elem is not None and calendar_data_elem.text:
                            calendar_data_count += 1
                    
                    print(f"   📅 找到 {calendar_data_count} 個日曆資料項目")
                    
                    if calendar_data_count > 0:
                        print("   🎉 成功找到日曆資料！")
                        return True
                    else:
                        print("   ⚠️ 沒有找到日曆資料")
                        
                except ET.ParseError as e:
                    print(f"   ❌ XML 解析失敗: {str(e)}")
                    print(f"   原始回應: {response.text[:200]}...")
                    
            elif response.status_code == 401:
                print("   ❌ 認證失敗 (401)")
                print("   💡 請檢查用戶名和密碼")
                print("   💡 對於 iCloud，可能需要使用應用程式密碼")
            elif response.status_code == 404:
                print("   ❌ 日曆路徑不存在 (404)")
                print("   💡 請檢查日曆路徑是否正確")
            else:
                print(f"   ❌ 請求失敗: {response.status_code}")
                print(f"   回應內容: {response.text[:200]}...")
                
        except Exception as e:
            print(f"   ❌ 連接失敗: {str(e)}")
    
    return False

def test_icloud_app_password():
    """測試 iCloud 應用程式密碼"""
    print("\n🔑 測試 iCloud 應用程式密碼...")
    print("💡 對於 iCloud CalDAV，您需要：")
    print("1. 在 iCloud 設定中啟用 CalDAV")
    print("2. 生成應用程式密碼")
    print("3. 使用應用程式密碼而不是 Apple ID 密碼")
    
    # 這裡可以添加實際的應用程式密碼測試
    app_password = input("請輸入 iCloud 應用程式密碼（或按 Enter 跳過）: ").strip()
    
    if app_password:
        config = {
            'url': 'https://caldav.icloud.com',
            'username': 'timdirty@icloud.com',
            'password': app_password,
            'calendar_path': '/calendars/timdirty@icloud.com/'
        }
        
        try:
            full_url = config['url'] + config['calendar_path']
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
                full_url,
                data=propfind_body,
                headers=headers,
                auth=HTTPBasicAuth(config['username'], config['password']),
                timeout=30
            )
            
            print(f"📡 狀態碼: {response.status_code}")
            
            if response.status_code == 207:
                print("✅ 應用程式密碼認證成功！")
                return True
            else:
                print(f"❌ 應用程式密碼認證失敗: {response.status_code}")
                print(f"回應內容: {response.text}")
                
        except Exception as e:
            print(f"❌ 測試失敗: {str(e)}")
    
    return False

def main():
    """主測試函數"""
    print("🧪 CalDAV 連接測試")
    print("=" * 50)
    
    # 測試基本連接
    if test_caldav_connection():
        print("\n🎉 CalDAV 連接測試成功！")
        return True
    
    # 測試應用程式密碼
    if test_icloud_app_password():
        print("\n🎉 應用程式密碼測試成功！")
        return True
    
    print("\n❌ 所有 CalDAV 連接測試失敗")
    print("\n💡 建議：")
    print("1. 檢查 iCloud 設定中是否啟用了 CalDAV")
    print("2. 生成 iCloud 應用程式密碼")
    print("3. 確認日曆路徑是否正確")
    print("4. 檢查網路連接和防火牆設定")
    
    return False

if __name__ == "__main__":
    main()
