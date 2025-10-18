# Intelligent Document Processing Proof of Concept

## Features
- Document upload (local file)
- Document classification using OpenAI API
- OCR extraction using pytesseract
- Field extraction using OpenAI API

## Setup
1. Install dependencies: pip install -r requirements.txt
   ```

   ```
2. Set your OpenAI API key as an environment variable:
   ```
set OPENAI_API_KEY=your_api_key_here
   ```
3. Run the main script:
   ```
python main.py
   ```

## Notes
- Tesseract OCR must be installed on your system. Download from https://github.com/tesseract-ocr/tesseract
- This is a local proof of concept. For production, add security, error handling, and a proper UI.
