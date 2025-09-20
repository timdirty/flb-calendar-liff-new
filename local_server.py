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
    'url': 'https://funlearnbar.synology.me:9102/caldav/',
    'username': 'testacount',
    'password': 'testacount',
    'calendar_path': 'testacount/'
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
        if CALDAV_CONFIG['calendar_path']:
            caldav_url = f"{CALDAV_CONFIG['url']}{CALDAV_CONFIG['calendar_path']}"
        else:
            caldav_url = CALDAV_CONFIG['url']
        
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
        
        # 發送請求 - 使用 Basic Auth
        from requests.auth import HTTPBasicAuth
        response = requests.request(
            'PROPFIND',
            caldav_url,
            data=propfind_body,
            headers=headers,
            auth=HTTPBasicAuth(CALDAV_CONFIG['username'], CALDAV_CONFIG['password']),
            timeout=30
        )
        
        print(f"📡 CalDAV 請求狀態: {response.status_code}")
        print(f"📡 回應標頭: {dict(response.headers)}")
        
        if response.status_code == 207:  # Multi-Status
            print("✅ CalDAV 請求成功")
            
            # 解析 XML 回應
            try:
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
                        print(f"📅 找到 iCal 內容: {len(ical_content)} 字元")
                        
                        # 解析 iCal 內容
                        parsed_events = parse_ical_content(ical_content)
                        events.extend(parsed_events)
                        print(f"📅 解析出 {len(parsed_events)} 個事件")
                
                real_events = events
                print(f"✅ 成功抓取 {len(real_events)} 個真實事件")
                return True
                
            except ET.ParseError as e:
                print(f"❌ XML 解析失敗: {str(e)}")
                print(f"原始回應: {response.text[:500]}...")
                return False
            
        elif response.status_code == 401:
            print("❌ CalDAV 認證失敗 (401)")
            print("💡 請檢查用戶名和密碼是否正確")
            print(f"回應內容: {response.text}")
            return False
        elif response.status_code == 404:
            print("❌ CalDAV 日曆路徑不存在 (404)")
            print("💡 請檢查日曆路徑是否正確")
            print(f"回應內容: {response.text}")
            return False
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
    print(f"🔍 解析標題: {title}")
    
    # 檢查是否包含已知講師名稱（不區分大小寫）
    for teacher in REAL_TEACHERS:
        teacher_name = teacher['name'].upper()
        if teacher_name in title.upper():
            print(f"✅ 找到講師: {teacher['name']}")
            return teacher['name']
    
    # 嘗試從標題中提取講師名稱（如果標題格式是 "講師名稱 課程名稱"）
    # 這裡可以根據實際的標題格式來調整
    words = title.split()
    if len(words) > 0:
        potential_instructor = words[0].upper()
        # 檢查是否為已知講師
        for teacher in REAL_TEACHERS:
            if teacher['name'].upper() == potential_instructor:
                print(f"✅ 從標題提取講師: {teacher['name']}")
                return teacher['name']
    
    print(f"⚠️ 未找到講師，使用預設值: UNKNOWN")
    return 'UNKNOWN'

# 嘗試抓取真實 CalDAV 資料
caldav_success = fetch_caldav_events()

# 如果 CalDAV 抓取失敗或沒有事件，使用真實格式的模擬資料
if not caldav_success or len(real_events) == 0:
    if caldav_success and len(real_events) == 0:
        print("⚠️ CalDAV 連接成功但沒有事件，使用真實格式的模擬資料")
    else:
        print("⚠️ CalDAV 抓取失敗，使用真實格式的模擬資料")
    
    from mock_caldav_data import generate_realistic_caldav_events, generate_realistic_teachers
    real_events = generate_realistic_caldav_events()
    REAL_TEACHERS = generate_realistic_teachers()
    print(f"✅ 生成 {len(real_events)} 個真實格式事件")
    print(f"✅ 生成 {len(REAL_TEACHERS)} 位真實講師")
    
    # 更新模擬資料為真實格式資料
    mock_events = real_events
    MOCK_TEACHERS = REAL_TEACHERS

@app.route('/')
def index():
    """首頁 - 重定向到 perfect-calendar.html"""
    return send_from_directory('.', 'perfect-calendar.html')

@app.route('/perfect-calendar.html')
def calendar():
    """行事曆頁面"""
    return send_from_directory('.', 'perfect-calendar.html')

@app.route('/test-frontend.html')
def test_frontend():
    """前端功能測試頁面"""
    return send_from_directory('.', 'test-frontend.html')

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

# FLB 簽到系統代理端點
FLB_API_BASE_URL = "https://liff-sttendence-0908-production.up.railway.app"

@app.route('/api/attendance/course-students', methods=['POST'])
def get_course_students():
    """代理獲取課程學生列表"""
    try:
        data = request.get_json()
        print(f"[{datetime.now()}] POST /api/attendance/course-students - {data}")
        
        # 轉發請求到 FLB API
        response = requests.post(
            f"{FLB_API_BASE_URL}/api/course-students",
            json=data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        response.raise_for_status()
        result = response.json()
        print(f"[{datetime.now()}] FLB API 回應: {result}")
        return jsonify(result)
        
    except requests.exceptions.RequestException as e:
        print(f"[{datetime.now()}] FLB API 請求失敗: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'API 請求失敗: {str(e)}'
        }), 500
    except Exception as e:
        print(f"[{datetime.now()}] 伺服器錯誤: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'伺服器錯誤: {str(e)}'
        }), 500

@app.route('/api/attendance/student-attendance', methods=['POST'])
def mark_student_attendance():
    """代理學生簽到"""
    try:
        data = request.get_json()
        print(f"[{datetime.now()}] POST /api/attendance/student-attendance - {data}")
        
        # 轉發請求到 FLB API
        response = requests.post(
            f"{FLB_API_BASE_URL}/api/student-attendance",
            json=data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        response.raise_for_status()
        result = response.json()
        print(f"[{datetime.now()}] FLB API 回應: {result}")
        return jsonify(result)
        
    except requests.exceptions.RequestException as e:
        print(f"[{datetime.now()}] FLB API 請求失敗: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'API 請求失敗: {str(e)}'
        }), 500
    except Exception as e:
        print(f"[{datetime.now()}] 伺服器錯誤: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'伺服器錯誤: {str(e)}'
        }), 500

@app.route('/api/attendance/teachers', methods=['GET'])
def get_attendance_teachers():
    """代理獲取講師列表"""
    try:
        print(f"[{datetime.now()}] GET /api/attendance/teachers")
        
        response = requests.get(
            f"{FLB_API_BASE_URL}/api/teachers",
            timeout=30
        )
        
        response.raise_for_status()
        result = response.json()
        print(f"[{datetime.now()}] FLB API 回應: {result}")
        return jsonify(result)
        
    except requests.exceptions.RequestException as e:
        print(f"[{datetime.now()}] FLB API 請求失敗: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'API 請求失敗: {str(e)}'
        }), 500
    except Exception as e:
        print(f"[{datetime.now()}] 伺服器錯誤: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'伺服器錯誤: {str(e)}'
        }), 500

@app.route('/api/attendance/courses', methods=['POST'])
def get_attendance_courses():
    """代理獲取課程列表"""
    try:
        data = request.get_json()
        print(f"[{datetime.now()}] POST /api/attendance/courses - {data}")
        
        response = requests.post(
            f"{FLB_API_BASE_URL}/api/courses",
            json=data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        response.raise_for_status()
        result = response.json()
        print(f"[{datetime.now()}] FLB API 回應: {result}")
        return jsonify(result)
        
    except requests.exceptions.RequestException as e:
        print(f"[{datetime.now()}] FLB API 請求失敗: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'API 請求失敗: {str(e)}'
        }), 500
    except Exception as e:
        print(f"[{datetime.now()}] 伺服器錯誤: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'伺服器錯誤: {str(e)}'
        }), 500

@app.route('/api/attendance/teacher-report', methods=['POST'])
def teacher_checkin():
    """代理講師簽到"""
    try:
        data = request.get_json()
        print(f"[{datetime.now()}] POST /api/attendance/teacher-report - {data}")
        
        response = requests.post(
            f"{FLB_API_BASE_URL}/api/teacher-report",
            json=data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        response.raise_for_status()
        result = response.json()
        print(f"[{datetime.now()}] FLB API 回應: {result}")
        return jsonify(result)
        
    except requests.exceptions.RequestException as e:
        print(f"[{datetime.now()}] FLB API 請求失敗: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'API 請求失敗: {str(e)}'
        }), 500
    except Exception as e:
        print(f"[{datetime.now()}] 伺服器錯誤: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'伺服器錯誤: {str(e)}'
        }), 500

@app.route('/api/attendance/direct-step3', methods=['POST'])
def get_direct_step3_url():
    """代理獲取直接跳轉 URL"""
    try:
        data = request.get_json()
        print(f"[{datetime.now()}] POST /api/attendance/direct-step3 - {data}")
        
        response = requests.post(
            f"{FLB_API_BASE_URL}/api/direct-step3",
            json=data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        response.raise_for_status()
        result = response.json()
        print(f"[{datetime.now()}] FLB API 回應: {result}")
        return jsonify(result)
        
    except requests.exceptions.RequestException as e:
        print(f"[{datetime.now()}] FLB API 請求失敗: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'API 請求失敗: {str(e)}'
        }), 500
    except Exception as e:
        print(f"[{datetime.now()}] 伺服器錯誤: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'伺服器錯誤: {str(e)}'
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
    print("\n📋 簽到系統代理端點:")
    print("  - POST /api/attendance/course-students")
    print("  - POST /api/attendance/student-attendance")
    print("  - GET  /api/attendance/teachers")
    print("  - POST /api/attendance/courses")
    print("  - POST /api/attendance/teacher-report")
    print("  - POST /api/attendance/direct-step3")
    print("\n按 Ctrl+C 停止伺服器")
    
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True,
        threaded=True
    )
