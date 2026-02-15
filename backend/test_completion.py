import requests
import unittest

BASE_URL = 'http://127.0.0.1:5000/api'

class TestCompletion(unittest.TestCase):
    def setUp(self):
        self.admin_token = self.login('admin', 'admin123')
        self.section_token = self.login('section_a', 'sec123')
        self.operator_token = self.login('operator', 'op123')

    def login(self, username, password):
        response = requests.post(f'{BASE_URL}/auth/login', json={'username': username, 'password': password})
        return response.json().get('token')

    def test_completion_flow(self):
        # 1. Operator uploads a file to Section A
        files = {'file': ('test.txt', 'dummy content')}
        headers = {'Authorization': f'Bearer {self.operator_token}'}
        data = {'section_id': 1} # Assuming Section A is ID 1
        
        upload_res = requests.post(f'{BASE_URL}/file/upload', files=files, data=data, headers=headers)
        if upload_res.status_code != 201:
            print(f"Upload failed: {upload_res.text}")
            return
            
        file_id = upload_res.json()['file_id']
        print(f"File uploaded with ID: {file_id}")
        
        # 2. Try to complete as Operator (Should Fail)
        res = requests.put(f'{BASE_URL}/file/{file_id}/complete', headers=headers)
        self.assertEqual(res.status_code, 403)
        print("Operator denied completion correctly.")
        
        # 3. Complete as Section Officer (Should Success)
        section_headers = {'Authorization': f'Bearer {self.section_token}'}
        res = requests.put(f'{BASE_URL}/file/{file_id}/complete', headers=section_headers)
        self.assertEqual(res.status_code, 200)
        print("Section Officer completed file successfully.")

if __name__ == '__main__':
    unittest.main()
