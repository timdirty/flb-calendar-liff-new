#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
模擬真實 CalDAV 資料生成器
生成與真實 CalDAV 格式相同的測試資料
"""

from datetime import datetime, timedelta
import random

def generate_realistic_caldav_events():
    """生成模擬真實 CalDAV 格式的事件資料"""
    
    # 真實講師資料
    instructors = [
        "TIM", "ALICE", "BOB", "YOKI", "XIAN", "TED", "GILLIAN", 
        "BELLA", "JAMES", "HANSEN", "DANIEL", "EASON", "AGNES", "IVAN", "Dirty"
    ]
    
    # 課程類型
    course_types = ["SPIKE", "ESM", "SPM"]
    
    # 地點
    locations = ["樂程坊 Funlearnbar", "松山", "信義", "台北", "新北"]
    
    events = []
    
    # 生成未來 30 天的事件
    base_date = datetime.now()
    
    for i in range(30):
        current_date = base_date + timedelta(days=i)
        
        # 每天生成 1-5 個事件
        num_events = random.randint(1, 5)
        
        for j in range(num_events):
            instructor = random.choice(instructors)
            course_type = random.choice(course_types)
            location = random.choice(locations)
            
            # 生成時間 (8:00-18:00)
            hour = random.randint(8, 17)
            minute = random.choice([0, 15, 30, 45])
            
            start_time = current_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
            end_time = start_time + timedelta(hours=1, minutes=30)
            
            # 生成週數
            week_num = random.randint(1, 4)
            
            # 生成真實格式的標題
            weekday_names = ['一', '二', '三', '四', '五', '六', '日']
            weekday = weekday_names[current_date.weekday()]
            
            title = f"{course_type} {weekday} {hour:02d}:{minute:02d}-{end_time.hour:02d}:{end_time.minute:02d} {location} 第{week_num}週"
            
            # 生成描述
            description = f"{instructor} 助教:無 教案:{course_type}教案:範例課程"
            
            event = {
                'title': title,
                'instructor': instructor,
                'start': start_time.isoformat() + '.000',
                'end': end_time.isoformat() + '.000',
                'location': location,
                'description': description
            }
            
            events.append(event)
    
    return events

def generate_realistic_teachers():
    """生成真實講師資料"""
    return [
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
        },
        {
            "name": "YOKI",
            "link": "https://docs.google.com/spreadsheets/d/yoki-link",
            "webApi": "",
            "reportApi": "",
            "userId": "yoki-user-id"
        },
        {
            "name": "XIAN",
            "link": "https://docs.google.com/spreadsheets/d/xian-link",
            "webApi": "",
            "reportApi": "",
            "userId": "xian-user-id"
        },
        {
            "name": "TED",
            "link": "https://docs.google.com/spreadsheets/d/ted-link",
            "webApi": "",
            "reportApi": "",
            "userId": "ted-user-id"
        },
        {
            "name": "GILLIAN",
            "link": "https://docs.google.com/spreadsheets/d/gillian-link",
            "webApi": "",
            "reportApi": "",
            "userId": "gillian-user-id"
        },
        {
            "name": "BELLA",
            "link": "https://docs.google.com/spreadsheets/d/bella-link",
            "webApi": "",
            "reportApi": "",
            "userId": "bella-user-id"
        },
        {
            "name": "JAMES",
            "link": "https://docs.google.com/spreadsheets/d/james-link",
            "webApi": "",
            "reportApi": "",
            "userId": "james-user-id"
        },
        {
            "name": "HANSEN",
            "link": "https://docs.google.com/spreadsheets/d/hansen-link",
            "webApi": "",
            "reportApi": "",
            "userId": "hansen-user-id"
        },
        {
            "name": "DANIEL",
            "link": "https://docs.google.com/spreadsheets/d/daniel-link",
            "webApi": "",
            "reportApi": "",
            "userId": "daniel-user-id"
        },
        {
            "name": "EASON",
            "link": "https://docs.google.com/spreadsheets/d/eason-link",
            "webApi": "",
            "reportApi": "",
            "userId": "eason-user-id"
        },
        {
            "name": "AGNES",
            "link": "https://docs.google.com/spreadsheets/d/agnes-link",
            "webApi": "",
            "reportApi": "",
            "userId": "agnes-user-id"
        },
        {
            "name": "IVAN",
            "link": "https://docs.google.com/spreadsheets/d/ivan-link",
            "webApi": "",
            "reportApi": "",
            "userId": "ivan-user-id"
        },
        {
            "name": "Dirty",
            "link": "https://docs.google.com/spreadsheets/d/dirty-link",
            "webApi": "",
            "reportApi": "",
            "userId": "dirty-user-id"
        }
    ]

if __name__ == "__main__":
    # 生成測試資料
    events = generate_realistic_caldav_events()
    teachers = generate_realistic_teachers()
    
    print(f"生成了 {len(events)} 個事件")
    print(f"生成了 {len(teachers)} 位講師")
    
    # 顯示前幾個事件
    print("\n前5個事件:")
    for i, event in enumerate(events[:5]):
        print(f"{i+1}. {event['title']} ({event['instructor']})")
    
    # 顯示講師統計
    instructor_counts = {}
    for event in events:
        instructor = event['instructor']
        instructor_counts[instructor] = instructor_counts.get(instructor, 0) + 1
    
    print(f"\n講師事件統計:")
    for instructor, count in sorted(instructor_counts.items()):
        print(f"  {instructor}: {count} 個事件")
