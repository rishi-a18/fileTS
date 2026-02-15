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
        
        # Upload the file to Gemini
        sample_file = genai.upload_file(path=file_path, display_name="Uploaded File")
        
        prompt = """
        Extract the following information from the document:
        1. Complaint/Document Date (YYYY-MM-DD format)
        2. Priority (Low, Medium, High, Critical) based on the content urgency.
        
        Output valid JSON only: {"extracted_date": "YYYY-MM-DD", "priority": "Level"}
        """
        
        response = model.generate_content([sample_file, prompt])
        
        # Basic parsing (improve for robust JSON extraction)
        import json
        import re
        
        text = response.text
        # Find JSON substring
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            json_str = match.group(0)
            return json.loads(json_str)
        else:
            return {'extracted_date': None, 'priority': 'Medium'}
            
    except Exception as e:
        print(f"Error in AI extraction: {e}")
        return {'extracted_date': None, 'priority': 'Medium'}
