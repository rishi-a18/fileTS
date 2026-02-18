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

    try:
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
        
        # Robust parsing
        import json
        import re
        from datetime import datetime
        
        text = response.text
        # Clean up markdown code blocks if present
        text = text.replace('```json', '').replace('```', '')
        
        extracted_data = {'extracted_date': None, 'priority': 'Medium'}

        # Find JSON substring
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            json_str = match.group(0)
            try:
                extracted_data = json.loads(json_str)
            except json.JSONDecodeError:
                print(f"Failed to decode JSON: {json_str}")
        else:
            print(f"Failed to find JSON in response: {text}")
        
        # Fallback if date is None or extraction failed
        if not extracted_data.get('extracted_date'):
            print("Trying Regex fallback for date...")
            # Simple regex for YYYY-MM-DD
            date_match = re.search(r'\d{4}-\d{2}-\d{2}', text)
            if date_match:
                 extracted_data['extracted_date'] = date_match.group(0)
            else:
                 # Try other formats? For now let's just stick to what prompt asked or what we can easily parse
                 pass
        
        return extracted_data
            
    except Exception as e:
        print(f"Error in AI extraction: {e}")
        return {'extracted_date': None, 'priority': 'Medium'}
