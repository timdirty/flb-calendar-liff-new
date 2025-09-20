#!/usr/bin/env python3
"""
FLB 簽到系統代理服務
用於解決 CSP connect-src 限制問題
"""

from flask import Flask, request, jsonify
import requests
import json
from datetime import datetime

app = Flask(__name__)

# FLB 簽到系統 API 基礎 URL
FLB_API_BASE_URL = "https://liff-sttendence-0908-production.up.railway.app"

@app.route('/api/attendance/course-students', methods=['POST'])
def get_course_students():
    """代理獲取課程學生列表"""
    try:
        data = request.get_json()
        
        # 轉發請求到 FLB API
        response = requests.post(
            f"{FLB_API_BASE_URL}/api/course-students",
            json=data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        response.raise_for_status()
        return jsonify(response.json())
        
    except requests.exceptions.RequestException as e:
        return jsonify({
            'success': False,
            'error': f'API 請求失敗: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'伺服器錯誤: {str(e)}'
        }), 500

@app.route('/api/attendance/student-attendance', methods=['POST'])
def mark_student_attendance():
    """代理學生簽到"""
    try:
        data = request.get_json()
        
        # 轉發請求到 FLB API
        response = requests.post(
            f"{FLB_API_BASE_URL}/api/student-attendance",
            json=data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        response.raise_for_status()
        return jsonify(response.json())
        
    except requests.exceptions.RequestException as e:
        return jsonify({
            'success': False,
            'error': f'API 請求失敗: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'伺服器錯誤: {str(e)}'
        }), 500

@app.route('/api/attendance/teachers', methods=['GET'])
def get_teachers():
    """代理獲取講師列表"""
    try:
        response = requests.get(
            f"{FLB_API_BASE_URL}/api/teachers",
            timeout=30
        )
        
        response.raise_for_status()
        return jsonify(response.json())
        
    except requests.exceptions.RequestException as e:
        return jsonify({
            'success': False,
            'error': f'API 請求失敗: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'伺服器錯誤: {str(e)}'
        }), 500

@app.route('/api/attendance/courses', methods=['POST'])
def get_courses():
    """代理獲取課程列表"""
    try:
        data = request.get_json()
        
        response = requests.post(
            f"{FLB_API_BASE_URL}/api/courses",
            json=data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        response.raise_for_status()
        return jsonify(response.json())
        
    except requests.exceptions.RequestException as e:
        return jsonify({
            'success': False,
            'error': f'API 請求失敗: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'伺服器錯誤: {str(e)}'
        }), 500

@app.route('/api/attendance/teacher-report', methods=['POST'])
def teacher_checkin():
    """代理講師簽到"""
    try:
        data = request.get_json()
        
        response = requests.post(
            f"{FLB_API_BASE_URL}/api/teacher-report",
            json=data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        response.raise_for_status()
        return jsonify(response.json())
        
    except requests.exceptions.RequestException as e:
        return jsonify({
            'success': False,
            'error': f'API 請求失敗: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'伺服器錯誤: {str(e)}'
        }), 500

@app.route('/api/attendance/direct-step3', methods=['POST'])
def get_direct_step3_url():
    """代理獲取直接跳轉 URL"""
    try:
        data = request.get_json()
        
        response = requests.post(
            f"{FLB_API_BASE_URL}/api/direct-step3",
            json=data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        response.raise_for_status()
        return jsonify(response.json())
        
    except requests.exceptions.RequestException as e:
        return jsonify({
            'success': False,
            'error': f'API 請求失敗: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'伺服器錯誤: {str(e)}'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """健康檢查端點"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'FLB Attendance Proxy'
    })

if __name__ == '__main__':
    print("🚀 啟動 FLB 簽到系統代理服務...")
    print(f"📡 代理目標: {FLB_API_BASE_URL}")
    print("🔗 可用端點:")
    print("  - GET  /api/attendance/teachers")
    print("  - POST /api/attendance/courses")
    print("  - POST /api/attendance/course-students")
    print("  - POST /api/attendance/student-attendance")
    print("  - POST /api/attendance/teacher-report")
    print("  - POST /api/attendance/direct-step3")
    print("  - GET  /health")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
