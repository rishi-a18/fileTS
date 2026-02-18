import os
import google.generativeai as genai
import logging
# import re
import re
from datetime import datetime
import json
import dotenv
dotenv.load_dotenv()

# Configure logging
logging.basicConfig(filename='extraction.log', level=logging.INFO, encoding='utf-8', filemode='w')

def extract_metadata_test(file_path):
    logging.info(f"Testing extraction for: {file_path}")
    print(f"Testing extraction for: {file_path}")
    if not os.path.exists(file_path):
        logging.error("File not found!")
        return

    # List models to debug 404
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                logging.info(f"Available model: {m.name}")
    except Exception as e:
        logging.error(f"Error listing models: {e}")

    extracted_data = {'extracted_date': None, 'priority': 'Medium'}
    
    try:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        # Use a model that is available in the list
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        logging.info(f"Uploading file to Gemini...")
        # Upload the file to Gemini
        sample_file = genai.upload_file(path=file_path, display_name="Test File")
        
        prompt = """
        Extract the following information from the document:
        1. Complaint/Document Date. Return in YYYY-MM-DD format only. If the date is in DD-MM-YYYY or other formats, convert it to YYYY-MM-DD.
        2. Priority (Low, Medium, High, Critical) based on the content urgency.
        
        Output valid JSON only: {"extracted_date": "YYYY-MM-DD", "priority": "Level"}
        """
        
        logging.info("Generating content...")
        response = model.generate_content([sample_file, prompt])
        logging.info(f"Gemini response text: {response.text}")
        
        text = response.text
        text = text.replace('```json', '').replace('```', '')
        
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            json_str = match.group(0)
            try:
                data = json.loads(json_str)
                extracted_data['priority'] = data.get('priority', 'Medium')
                
                date_str = data.get('extracted_date')
                if date_str:
                    for fmt in ('%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y', '%m-%d-%Y', '%m/%d/%Y'):
                         try:
                             dt = datetime.strptime(date_str, fmt)
                             extracted_data['extracted_date'] = dt.strftime('%Y-%m-%d')
                             break
                         except ValueError:
                             continue
            except json.JSONDecodeError:
                logging.error(f"Failed to decode JSON: {json_str}")
    except Exception as e:
        logging.error(f"Error in AI extraction: {e}")

    # Fallback
    if not extracted_data.get('extracted_date'):
        logging.info("Trying Regex fallback...")
        try:
            content = ""
            import PyPDF2
            with open(file_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    content += page.extract_text() + "\n"
            
            logging.info(f"Extracted content length: {len(content)}")
            logging.info(f"Content preview: {content[:500]}") # Log content


            # Regex for various date formats with flexible whitespace
            # Matches YYYY -MM -DD, DD -MM -YYYY, DD / MM / YYYY
            date_patterns = [
                r'\b(\d{4})\s*-\s*(\d{1,2})\s*-\s*(\d{1,2})\b', # YYYY-MM-DD with spaces
                r'\b(\d{1,2})\s*-\s*(\d{1,2})\s*-\s*(\d{4})\b', # DD-MM-YYYY with spaces
                r'\b(\d{1,2})\s*/\s*(\d{1,2})\s*/\s*(\d{4})\b'  # DD/MM/YYYY with spaces
            ]
            
            found_date = None
            for pattern in date_patterns:
                match = re.search(pattern, content)
                if match:
                    groups = match.groups()
                    if len(groups[0]) == 4: # YYYY-MM-DD
                        found_date = f"{groups[0]}-{groups[1].zfill(2)}-{groups[2].zfill(2)}"
                    else: # DD-MM-YYYY or DD/MM/YYYY -> assume DD-MM-YYYY
                        found_date = f"{groups[2]}-{groups[1].zfill(2)}-{groups[0].zfill(2)}"
                    break
            
            if found_date:
                 extracted_data['extracted_date'] = found_date
                 logging.info(f"Regex fallback found: {found_date}")
            else:
                 logging.info("Regex fallback failed to find a date.")
                 
        except Exception as e:
             logging.error(f"Error in fallback: {e}")

    logging.info(f"Final extracted data: {extracted_data}")
    print(f"Final extracted data: {extracted_data}")

if __name__ == "__main__":
    extract_metadata_test("d:\\file_mgmt\\file_management_system\\fileTS\\backend\\uploads\\coll_letter_1.pdf")
