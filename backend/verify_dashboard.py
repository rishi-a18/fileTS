import requests
import json

BASE_URL = 'http://127.0.0.1:5000'

def login(username, password):
    url = f'{BASE_URL}/api/auth/login'
    data = {'username': username, 'password': password}
    response = requests.post(url, json=data)
    if response.status_code == 200:
        return response.json()['token']
    else:
        print(f"Login failed for {username}: {response.text}")
        return None

def get_stats(token):
    url = f'{BASE_URL}/api/dashboard/stats'
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Get stats failed: {response.text}")
        return None

def verify():
    print("--- Verifying Dashboard Stats ---")

    # 1. Admin (Global)
    print("\n1. Testing Admin (Global View)")
    admin_token = login('admin', 'admin123')
    if admin_token:
        stats = get_stats(admin_token)
        if stats:
            print(f"Admin Overview Total: {stats['overview']['total']}")
            print(f"Admin Sections Count: {len(stats['sections'])}")
            if len(stats['sections']) > 1:
                print("PASS: Admin sees multiple sections.")
            else:
                print("FAIL: Admin should see multiple sections.")

    # 2. Section Officer (Section A)
    print("\n2. Testing Section Officer (Section A)")
    # Assuming seed data created 'section_a'
    section_token = login('section_a', 'sec123') 
    if section_token:
        stats = get_stats(section_token)
        if stats:
            print(f"Section A Overview Total: {stats['overview']['total']}")
            print(f"Section A Sections Count: {len(stats['sections'])}")
            if len(stats['sections']) == 1 and stats['sections'][0]['name'] == 'A':
                print("PASS: Section Officer sees only Section A.")
            else:
                print(f"FAIL: Section Officer saw {len(stats['sections'])} sections: {[s['name'] for s in stats['sections']]}")

if __name__ == "__main__":
    verify()
