import requests
import os

BASE_URL = 'http://127.0.0.1:5000/api'

def test_view_file():
    # 1. Login as Admin (who can view all)
    auth = requests.post(f'{BASE_URL}/auth/login', json={'username': 'admin', 'password': 'admin123'})
    token = auth.json().get('token')
    headers = {'Authorization': f'Bearer {token}'}
    
    # 2. List files to get an ID
    files_res = requests.get(f'{BASE_URL}/file/', headers=headers)
    files = files_res.json().get('files', [])
    
    if not files:
        print("No files to view.")
        return

    file_id = files[0]['id']
    filename = files[0]['filename']
    print(f"Attempting to view file ID: {file_id}, Name: {filename}")
    
    # 3. View File
    view_res = requests.get(f'{BASE_URL}/file/{file_id}/view', headers=headers)
    
    if view_res.status_code == 200:
        print(f"Success! Content length: {len(view_res.content)}")
        with open(f'downloaded_{filename}', 'wb') as f:
            f.write(view_res.content)
        print(f"Saved to downloaded_{filename}")
    else:
        print(f"Failed: {view_res.status_code} - {view_res.text}")

if __name__ == '__main__':
    test_view_file()
