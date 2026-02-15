import requests
import io
import PyPDF2

BASE_URL = 'http://127.0.0.1:5000'

def login(username, password):
    url = f'{BASE_URL}/api/auth/login'
    data = {'username': username, 'password': password}
    response = requests.post(url, json=data)
    if response.status_code == 200:
        return response.json()['token']
    return None

def verify_report_content():
    print("--- Verifying Daily Report Content ---")
    
    # Login as Admin to get full report
    token = login('admin', 'admin123')
    if not token:
        print("Login failed")
        return

    url = f'{BASE_URL}/api/reports/daily'
    headers = {'Authorization': f'Bearer {token}'}
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        print("Report downloaded successfully.")
        
        # Read PDF content
        with io.BytesIO(response.content) as f:
            reader = PyPDF2.PdfReader(f)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
            
            print("\n--- PDF Extracted Text ---")
            print(text)
            
            # Check for new metrics
            if "Total=" in text and "Completed=" in text:
                print("\nPASS: Found 'Total=' and 'Completed=' in report.")
            else:
                print("\nFAIL: Missing new metrics in report.")
    else:
        print(f"Failed to download report: {response.text}")

if __name__ == "__main__":
    verify_report_content()
