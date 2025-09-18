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

app = Flask(__name__)
CORS(app)  # 允許跨域請求

# 模擬講師資料
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

# 儲存模擬事件
mock_events = generate_mock_events()

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
    
    response = {
        "success": True,
        "teachers": MOCK_TEACHERS,
        "cached": False
    }
    
    print(f"[{datetime.now()}] 返回 {len(MOCK_TEACHERS)} 位講師")
    return jsonify(response)

@app.route('/api/events', methods=['GET'])
def get_events():
    """獲取事件列表 API"""
    print(f"[{datetime.now()}] GET /api/events")
    
    response = {
        "success": True,
        "data": mock_events,
        "total": len(mock_events)
    }
    
    print(f"[{datetime.now()}] 返回 {len(mock_events)} 個事件")
    return jsonify(response)

@app.route('/api/events/<instructor>', methods=['GET'])
def get_events_by_instructor(instructor):
    """根據講師獲取事件列表 API"""
    print(f"[{datetime.now()}] GET /api/events/{instructor}")
    
    filtered_events = [event for event in mock_events if event['instructor'] == instructor]
    
    response = {
        "success": True,
        "data": filtered_events,
        "total": len(filtered_events),
        "instructor": instructor
    }
    
    print(f"[{datetime.now()}] 返回講師 {instructor} 的 {len(filtered_events)} 個事件")
    return jsonify(response)

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康檢查 API"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "events_count": len(mock_events),
        "teachers_count": len(MOCK_TEACHERS)
    })

@app.route('/api/debug', methods=['GET'])
def debug_info():
    """調試信息 API"""
    return jsonify({
        "server": "local-flask-server",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "events": {
            "total": len(mock_events),
            "by_instructor": {
                instructor: len([e for e in mock_events if e['instructor'] == instructor])
                for instructor in set(e['instructor'] for e in mock_events)
            }
        },
        "teachers": MOCK_TEACHERS
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
    print(f"📊 載入 {len(mock_events)} 個模擬事件")
    print(f"👥 載入 {len(MOCK_TEACHERS)} 位講師")
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
