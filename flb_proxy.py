#!/usr/bin/env python3
"""
FLB 簽到系統代理服務
專門用於解決 CSP connect-src 限制問題
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)  # 允許跨域請求

# FLB 簽到系統 API 基礎 URL
FLB_API_BASE_URL = "https://liff-sttendence-0908-production.up.railway.app"

@app.route('/api/flb/course-students', methods=['POST'])
def get_course_students():
    """代理獲取課程學生列表"""
    try:
        data = request.get_json()
        print(f"[{datetime.now()}] POST /api/flb/course-students - {data}")
        
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

@app.route('/api/flb/student-attendance', methods=['POST'])
def mark_student_attendance():
    """代理學生簽到"""
    try:
        data = request.get_json()
        print(f"[{datetime.now()}] POST /api/flb/student-attendance - {data}")
        
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

@app.route('/api/flb/teachers', methods=['GET'])
def get_teachers():
    """代理獲取講師列表"""
    try:
        print(f"[{datetime.now()}] GET /api/flb/teachers")
        
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

@app.route('/api/flb/courses', methods=['POST'])
def get_courses():
    """代理獲取課程列表"""
    try:
        data = request.get_json()
        print(f"[{datetime.now()}] POST /api/flb/courses - {data}")
        
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

@app.route('/api/flb/teacher-report', methods=['POST'])
def teacher_checkin():
    """代理講師簽到"""
    try:
        data = request.get_json()
        print(f"[{datetime.now()}] POST /api/flb/teacher-report - {data}")
        
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

@app.route('/api/flb/direct-step3', methods=['POST'])
def get_direct_step3_url():
    """代理獲取直接跳轉 URL"""
    try:
        data = request.get_json()
        print(f"[{datetime.now()}] POST /api/flb/direct-step3 - {data}")
        
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

@app.route('/health', methods=['GET'])
def health_check():
    """健康檢查端點"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'FLB Proxy Service',
        'target_api': FLB_API_BASE_URL
    })

if __name__ == '__main__':
    print("🚀 啟動 FLB 簽到系統代理服務...")
    print(f"📡 代理目標: {FLB_API_BASE_URL}")
    print("🔗 可用端點:")
    print("  - POST /api/flb/course-students")
    print("  - POST /api/flb/student-attendance")
    print("  - GET  /api/flb/teachers")
    print("  - POST /api/flb/courses")
    print("  - POST /api/flb/teacher-report")
    print("  - POST /api/flb/direct-step3")
    print("  - GET  /health")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5002, debug=True)
