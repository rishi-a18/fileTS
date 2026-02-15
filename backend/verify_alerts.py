import requests
from datetime import datetime, timedelta

BASE_URL = 'http://127.0.0.1:5000'

def login(username, password):
    url = f'{BASE_URL}/api/auth/login'
    data = {'username': username, 'password': password}
    response = requests.post(url, json=data)
    if response.status_code == 200:
        return response.json()['token']
    return None

def verify_alerts():
    print("--- Verifying Alert System ---")
    
    # 1. Login as Admin
    token = login('admin', 'admin123')
    if not token:
        print("Login failed")
        return

    # 2. Check Alerts Endpoint
    url = f'{BASE_URL}/api/dashboard/alerts'
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        alerts = response.json()
        print(f"Alerts found: {len(alerts)}")
        for alert in alerts:
            print(f"- File: {alert['filename']}, Section: {alert['section']}, % Elapsed: {alert['percentage']}%, Time Left: {alert['time_left']}")
            
            # Validation
            if alert['percentage'] <= 50:
                print("FAIL: Alert shown for file with <= 50% time elapsed.")
            else:
                print("PASS: Alert correctly identified > 50% elapsed.")
    else:
        print(f"Failed to fetch alerts: {response.text}")

if __name__ == "__main__":
    verify_alerts()
