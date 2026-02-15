import requests
import unittest

BASE_URL = 'http://127.0.0.1:5000/api'

class TestBackend(unittest.TestCase):
    def setUp(self):
        self.auth_token = None

    def test_01_login(self):
        # Login as admin
        response = requests.post(f'{BASE_URL}/auth/login', json={'username': 'admin', 'password': 'admin123'})
        self.assertEqual(response.status_code, 200)
        self.assertIn('token', response.json())
        TestBackend.token = response.json()['token']
        print("\nLogin successful, token retrieved.")

    def test_02_stats(self):
        headers = {'Authorization': f'Bearer {TestBackend.token}'}
        response = requests.get(f'{BASE_URL}/dashboard/stats', headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn('overview', response.json())
        print("Dashboard stats retrieved.")
        
    def test_03_report(self):
        headers = {'Authorization': f'Bearer {TestBackend.token}'}
        response = requests.get(f'{BASE_URL}/reports/daily', headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers['Content-Type'], 'application/pdf')
        print("Report retrieved.")

if __name__ == '__main__':
    # Need to verify server is running before executing this
    # For now, just print instruction
    print("Run Flask server first!")
    unittest.main()
