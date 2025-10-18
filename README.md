# Intelligent Document Processing (IDP) Prototype

This project is a proof-of-concept for intelligent document processing using OpenAI Vision and Streamlit. It allows you to upload a PDF, view a preview, extract OCR text using OpenAI's vision models, classify the document, and extract key fields—all in a modern web UI.

## Features
- Upload PDF documents via the sidebar
- Preview the first page of the PDF
- OCR extraction using OpenAI Vision API (GPT-4 Vision)
- Document type classification using OpenAI
- Field extraction for key fields (customizable in code)
- Results displayed in a clean, two-column layout
- OCR text is logged to the terminal for debugging

## Setup
1. **Clone the repository**
2. **Install dependencies**
   ```powershell
      pip install -r requirements.txt
   ```
3. **Set your OpenAI API key**
   ```powershell
      $env:OPENAI_API_KEY="sk-..."
   ```
4. **Run the app**
   ```powershell
      streamlit run main.py
   ```

## Usage
- Use the sidebar to upload a PDF document.
- The main area will show a preview of the first page and extracted fields.
- Document type and field values are extracted using OpenAI's API.
- OCR text is printed in your terminal for traceability.

## Customization
- To change the fields/questions for extraction, edit the `fields` list in `main.py`.
- To adjust the PDF preview size, change the `width` parameter in the `st.image` call.

## Requirements
- Python 3.8+
- OpenAI API access with vision model enabled (e.g., GPT-4 Vision)
- Poppler is **not required** (uses PyMuPDF for PDF rendering)

## Notes
- This is a prototype. For production, add authentication, error handling, and security.
- Large PDFs may take longer to process and may hit OpenAI rate limits.

## License
MIT
