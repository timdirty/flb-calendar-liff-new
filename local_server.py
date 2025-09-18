#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
本地 Flask 伺服器 - 模擬後端 API
用於本地端測試講師行事曆檢視系統
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime, timedelta
import random
import requests
import xml.etree.ElementTree as ET
from urllib.parse import quote

app = Flask(__name__)
CORS(app)  # 允許跨域請求

# CalDAV 配置
CALDAV_CONFIG = {
    'url': 'https://caldav.icloud.com/',
    'username': 'timdirty@icloud.com',
    'password': 'TimDirty2024!',
    'calendar_path': '/calendars/timdirty@icloud.com/'
}

# 真實講師資料（從原系統獲取）
REAL_TEACHERS = [
    {
        "name": "TIM",
        "link": "https://docs.google.com/spreadsheets/d/1taEbehafRXPIqBvqPYcP8eGbVtPrlen6pt-IIUOMAn0/edit?usp=sharing",
        "webApi": "",
        "reportApi": "",
        "userId": "Udb51363eb6fdc605a6a9816379a38103"
    },
    {
        "name": "ALICE",
        "link": "https://docs.google.com/spreadsheets/d/alice-link",
        "webApi": "",
        "reportApi": "",
        "userId": "alice-user-id"
    },
    {
        "name": "BOB",
        "link": "https://docs.google.com/spreadsheets/d/bob-link",
        "webApi": "",
        "reportApi": "",
        "userId": "bob-user-id"
    }
]

# 模擬講師資料（備用）
MOCK_TEACHERS = [
    {
        "name": "TIM",
        "link": "https://docs.google.com/spreadsheets/d/1taEbehafRXPIqBvqPYcP8eGbVtPrlen6pt-IIUOMAn0/edit?usp=sharing",
        "webApi": "",
        "reportApi": "",
        "userId": "Udb51363eb6fdc605a6a9816379a38103"
    },
    {
        "name": "ALICE",
        "link": "https://docs.google.com/spreadsheets/d/alice-link",
        "webApi": "",
        "reportApi": "",
        "userId": "alice-user-id"
    },
    {
        "name": "BOB",
        "link": "https://docs.google.com/spreadsheets/d/bob-link",
        "webApi": "",
        "reportApi": "",
        "userId": "bob-user-id"
    }
]

# 模擬事件資料
def generate_mock_events():
    """生成模擬事件資料"""
    events = []
    instructors = ["TIM", "ALICE", "BOB"]
    course_types = ["SPIKE", "ESM", "SPM"]
    locations = ["樂程坊 Funlearnbar", "松山", "信義"]
    
    # 生成未來30天的事件
    base_date = datetime.now()
    for i in range(30):
        current_date = base_date + timedelta(days=i)
        
        # 每天生成1-3個事件
        num_events = random.randint(1, 3)
        for j in range(num_events):
            instructor = random.choice(instructors)
            course_type = random.choice(course_types)
            location = random.choice(locations)
            
            # 生成時間 (8:00-18:00)
            hour = random.randint(8, 17)
            minute = random.choice([0, 30])
            
            start_time = current_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
            end_time = start_time + timedelta(hours=1, minutes=30)
            
            # 生成週數
            week_num = random.randint(1, 4)
            
            event = {
                "title": f"{course_type} {['一','二','三','四','五','六','日'][current_date.weekday()]} {hour:02d}:{minute:02d}-{end_time.hour:02d}:{end_time.minute:02d} {location} 第{week_num}週",
                "instructor": instructor,
                "start": start_time.isoformat() + ".000",
                "end": end_time.isoformat() + ".000",
                "location": "樂程坊 Funlearnbar",
                "description": f"{instructor} 助教:無 教案:{course_type}教案:範例課程"
            }
            events.append(event)
    
    return events

# 儲存事件資料
real_events = []
mock_events = generate_mock_events()

def fetch_caldav_events():
    """從 CalDAV 抓取真實事件資料"""
    global real_events
    
    try:
        print("🔄 開始從 CalDAV 抓取真實事件資料...")
        
        # 構建 CalDAV 請求 URL
        caldav_url = f"{CALDAV_CONFIG['url']}{CALDAV_CONFIG['calendar_path']}"
        
        # 構建 PROPFIND 請求
        headers = {
            'Content-Type': 'application/xml',
            'Depth': '1'
        }
        
        # CalDAV PROPFIND 請求體
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
            caldav_url,
            data=propfind_body,
            headers=headers,
            auth=(CALDAV_CONFIG['username'], CALDAV_CONFIG['password']),
            timeout=30
        )
        
        if response.status_code == 207:  # Multi-Status
            print("✅ CalDAV 請求成功")
            
            # 解析 XML 回應
            root = ET.fromstring(response.content)
            
            # 定義命名空間
            namespaces = {
                'D': 'DAV:',
                'C': 'urn:ietf:params:xml:ns:caldav'
            }
            
            events = []
            
            # 遍歷所有回應項目
            for response_elem in root.findall('.//D:response', namespaces):
                # 檢查是否有 calendar-data
                calendar_data_elem = response_elem.find('.//C:calendar-data', namespaces)
                
                if calendar_data_elem is not None and calendar_data_elem.text:
                    ical_content = calendar_data_elem.text
                    
                    # 解析 iCal 內容
                    parsed_events = parse_ical_content(ical_content)
                    events.extend(parsed_events)
            
            real_events = events
            print(f"✅ 成功抓取 {len(real_events)} 個真實事件")
            return True
            
        else:
            print(f"❌ CalDAV 請求失敗: {response.status_code}")
            print(f"回應內容: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ CalDAV 抓取失敗: {str(e)}")
        return False

def parse_ical_content(ical_content):
    """解析 iCal 內容並轉換為事件物件"""
    events = []
    
    try:
        lines = ical_content.split('\n')
        current_event = {}
        in_event = False
        
        for line in lines:
            line = line.strip()
            
            if line == 'BEGIN:VEVENT':
                in_event = True
                current_event = {}
            elif line == 'END:VEVENT':
                if in_event and current_event:
                    # 轉換為標準格式
                    event = convert_ical_to_event(current_event)
                    if event:
                        events.append(event)
                in_event = False
                current_event = {}
            elif in_event and ':' in line:
                key, value = line.split(':', 1)
                current_event[key] = value
        
        return events
        
    except Exception as e:
        print(f"❌ 解析 iCal 內容失敗: {str(e)}")
        return []

def convert_ical_to_event(ical_event):
    """將 iCal 事件轉換為標準事件格式"""
    try:
        # 提取基本資訊
        title = ical_event.get('SUMMARY', '無標題')
        start_str = ical_event.get('DTSTART', '')
        end_str = ical_event.get('DTEND', '')
        description = ical_event.get('DESCRIPTION', '')
        location = ical_event.get('LOCATION', '樂程坊 Funlearnbar')
        
        # 解析時間
        start_time = parse_ical_datetime(start_str)
        end_time = parse_ical_datetime(end_str)
        
        if not start_time or not end_time:
            return None
        
        # 從標題中提取講師資訊
        instructor = extract_instructor_from_title(title)
        
        # 構建事件物件
        event = {
            'title': title,
            'instructor': instructor,
            'start': start_time.isoformat() + '.000',
            'end': end_time.isoformat() + '.000',
            'location': location,
            'description': description
        }
        
        return event
        
    except Exception as e:
        print(f"❌ 轉換 iCal 事件失敗: {str(e)}")
        return None

def parse_ical_datetime(dt_str):
    """解析 iCal 日期時間字串"""
    try:
        if not dt_str:
            return None
        
        # 移除時區資訊（簡化處理）
        if 'T' in dt_str:
            dt_str = dt_str.split('T')[0] + 'T' + dt_str.split('T')[1].split('Z')[0]
        
        # 嘗試解析不同格式
        formats = [
            '%Y%m%dT%H%M%S',
            '%Y%m%d',
            '%Y-%m-%dT%H:%M:%S',
            '%Y-%m-%d'
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(dt_str, fmt)
            except ValueError:
                continue
        
        return None
        
    except Exception as e:
        print(f"❌ 解析日期時間失敗: {str(e)}")
        return None

def extract_instructor_from_title(title):
    """從標題中提取講師名稱"""
    # 簡單的講師名稱提取邏輯
    # 這裡可以根據實際的標題格式來調整
    
    # 檢查是否包含已知講師名稱
    for teacher in REAL_TEACHERS:
        if teacher['name'].upper() in title.upper():
            return teacher['name']
    
    # 如果沒有找到，返回預設值
    return 'UNKNOWN'

# 嘗試抓取真實 CalDAV 資料
caldav_success = fetch_caldav_events()

# 如果 CalDAV 抓取失敗，使用模擬資料
if not caldav_success:
    print("⚠️ CalDAV 抓取失敗，使用模擬資料")
    real_events = mock_events

@app.route('/')
def index():
    """首頁 - 重定向到 perfect-calendar.html"""
    return send_from_directory('.', 'perfect-calendar.html')

@app.route('/perfect-calendar.html')
def calendar():
    """行事曆頁面"""
    return send_from_directory('.', 'perfect-calendar.html')

@app.route('/api/teachers', methods=['GET'])
def get_teachers():
    """獲取講師列表 API"""
    print(f"[{datetime.now()}] GET /api/teachers")
    
    # 使用真實講師資料
    teachers = REAL_TEACHERS if caldav_success else MOCK_TEACHERS
    
    response = {
        "success": True,
        "teachers": teachers,
        "cached": False,
        "data_source": "caldav" if caldav_success else "mock"
    }
    
    print(f"[{datetime.now()}] 返回 {len(teachers)} 位講師 (資料來源: {'CalDAV' if caldav_success else '模擬'})")
    return jsonify(response)

@app.route('/api/events', methods=['GET'])
def get_events():
    """獲取事件列表 API"""
    print(f"[{datetime.now()}] GET /api/events")
    
    # 使用真實事件資料
    events = real_events if caldav_success else mock_events
    
    response = {
        "success": True,
        "data": events,
        "total": len(events),
        "data_source": "caldav" if caldav_success else "mock"
    }
    
    print(f"[{datetime.now()}] 返回 {len(events)} 個事件 (資料來源: {'CalDAV' if caldav_success else '模擬'})")
    return jsonify(response)

@app.route('/api/events/<instructor>', methods=['GET'])
def get_events_by_instructor(instructor):
    """根據講師獲取事件列表 API"""
    print(f"[{datetime.now()}] GET /api/events/{instructor}")
    
    # 使用真實事件資料
    events = real_events if caldav_success else mock_events
    filtered_events = [event for event in events if event['instructor'] == instructor]
    
    response = {
        "success": True,
        "data": filtered_events,
        "total": len(filtered_events),
        "instructor": instructor,
        "data_source": "caldav" if caldav_success else "mock"
    }
    
    print(f"[{datetime.now()}] 返回講師 {instructor} 的 {len(filtered_events)} 個事件 (資料來源: {'CalDAV' if caldav_success else '模擬'})")
    return jsonify(response)

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康檢查 API"""
    # 使用真實資料
    events = real_events if caldav_success else mock_events
    teachers = REAL_TEACHERS if caldav_success else MOCK_TEACHERS
    
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "events_count": len(events),
        "teachers_count": len(teachers),
        "data_source": "caldav" if caldav_success else "mock",
        "caldav_status": "success" if caldav_success else "failed"
    })

@app.route('/api/debug', methods=['GET'])
def debug_info():
    """調試信息 API"""
    # 使用真實資料
    events = real_events if caldav_success else mock_events
    teachers = REAL_TEACHERS if caldav_success else MOCK_TEACHERS
    
    return jsonify({
        "server": "local-flask-server",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "data_source": "caldav" if caldav_success else "mock",
        "caldav_status": "success" if caldav_success else "failed",
        "events": {
            "total": len(events),
            "by_instructor": {
                instructor: len([e for e in events if e['instructor'] == instructor])
                for instructor in set(e['instructor'] for e in events)
            }
        },
        "teachers": teachers,
        "caldav_config": {
            "url": CALDAV_CONFIG['url'],
            "username": CALDAV_CONFIG['username'],
            "calendar_path": CALDAV_CONFIG['calendar_path']
        }
    })

@app.errorhandler(404)
def not_found(error):
    """404 錯誤處理"""
    return jsonify({
        "error": "Not Found",
        "message": "The requested resource was not found",
        "timestamp": datetime.now().isoformat()
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """500 錯誤處理"""
    return jsonify({
        "error": "Internal Server Error",
        "message": "An internal error occurred",
        "timestamp": datetime.now().isoformat()
    }), 500

if __name__ == '__main__':
    print("🚀 啟動本地 Flask 伺服器...")
    
    # 顯示資料來源資訊
    if caldav_success:
        print(f"✅ 成功載入 {len(real_events)} 個真實 CalDAV 事件")
        print(f"👥 載入 {len(REAL_TEACHERS)} 位真實講師")
        print("📡 資料來源: CalDAV (iCloud)")
    else:
        print(f"⚠️ CalDAV 抓取失敗，載入 {len(mock_events)} 個模擬事件")
        print(f"👥 載入 {len(MOCK_TEACHERS)} 位模擬講師")
        print("📡 資料來源: 模擬資料")
    
    print("🌐 伺服器將在 http://localhost:5001 啟動")
    print("📅 行事曆頁面: http://localhost:5001/perfect-calendar.html")
    print("🔍 調試信息: http://localhost:5001/api/debug")
    print("❤️ 健康檢查: http://localhost:5001/api/health")
    print("\n按 Ctrl+C 停止伺服器")
    
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True,
        threaded=True
    )
