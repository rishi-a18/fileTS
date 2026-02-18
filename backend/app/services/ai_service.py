import os
import google.generativeai as genai
from flask import current_app

def extract_metadata(file_path):
    """
    Extracts metadata from the given file using Gemini API.
    Returns a dictionary with extracted_date and priority.
    """
    api_key = current_app.config.get('GEMINI_API_KEY')
    if not api_key:
        print("Gemini API Key not found.")
        return {'extracted_date': None, 'priority': 'Medium'}

    extracted_data = {'extracted_date': None, 'priority': 'Medium'}
    
    try:
        if api_key:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            print(f"Uploading file to Gemini: {file_path}")
            # Upload the file to Gemini
            sample_file = genai.upload_file(path=file_path, display_name="Uploaded File")
            
            prompt = """
            Extract the following information from the document:
            1. Complaint/Document Date (YYYY-MM-DD format). If multiple dates are present, pick the most relevant one (e.g. date of application/complaint).
            2. Priority (Low, Medium, High, Critical) based on the content urgency.
            
            Output valid JSON only: {"extracted_date": "YYYY-MM-DD", "priority": "Level"}
            """
            
            response = model.generate_content([sample_file, prompt])
            print(f"Gemini response: {response.text}")
            
            text = response.text
            # Clean up markdown code blocks if present
            text = text.replace('```json', '').replace('```', '')
            
            # Find JSON substring
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                json_str = match.group(0)
                try:
                    extracted_data = json.loads(json_str)
                except json.JSONDecodeError:
                    print(f"Failed to decode JSON: {json_str}")
    except Exception as e:
        print(f"Error in AI extraction or API call: {e}")
        # Continue to fallback
        
    # Fallback if date is None (either extraction failed, API failed, or API key missing)
    if not extracted_data.get('extracted_date'):
        print("Trying Regex fallback on local file content...")
        try:
            content = ""
            ext = os.path.splitext(file_path)[1].lower()
            
            if ext == '.txt':
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
            elif ext == '.pdf':
                import PyPDF2
                with open(file_path, 'rb') as f:
                    reader = PyPDF2.PdfReader(f)
                    for page in reader.pages:
                        content += page.extract_text() + "\n"
            
            # Simple regex for YYYY-MM-DD
            # Also support DD-MM-YYYY and DD/MM/YYYY
            date_match = re.search(r'\b\d{4}-\d{2}-\d{2}\b', content)
            if not date_match:
                 date_match = re.search(r'\b\d{2}-\d{2}-\d{4}\b', content)
            if not date_match:
                 date_match = re.search(r'\b\d{2}/\d{2}/\d{4}\b', content)

            if date_match:
                 raw_date = date_match.group(0)
                 # Normalize to YYYY-MM-DD for consistency if needed, but DB expects date object
                 # The calling function upload_file parses it using datetime.strptime(extracted_date, '%Y-%m-%d')
                 # So we MUST return YYYY-MM-DD.
                 
                 # Attempt simple normalization
                 if '/' in raw_date:
                     parts = raw_date.split('/')
                     if len(parts[0]) == 2: # DD/MM/YYYY
                         raw_date = f"{parts[2]}-{parts[1]}-{parts[0]}"
                 elif '-' in raw_date:
                     parts = raw_date.split('-')
                     if len(parts[0]) == 2: # DD-MM-YYYY
                         raw_date = f"{parts[2]}-{parts[1]}-{parts[0]}"
                 
                 extracted_data['extracted_date'] = raw_date
                 print(f"Regex fallback found: {raw_date}")
            else:
                 print("Regex fallback failed to find a date.")
                 
        except Exception as e:
             print(f"Error in local fallback extraction: {e}")

    return extracted_data
