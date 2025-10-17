import fitz  # PyMuPDF
import openai
import os
import base64
from PIL import Image
from io import BytesIO


def extract_text_from_pdf_bytes_openai(pdf_bytes, model="gpt-4.1-mini", dpi=300):
    """Convert PDF bytes to images and extract text from each page using OpenAI Vision API."""
    openai.api_key = os.getenv("OPENAI_API_KEY")
    doc = fitz.open(stream=pdf_bytes, filetype='pdf')
    all_text = ""

    def image_to_base64(img):
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode()

    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=dpi)
        mode = "RGBA" if pix.alpha else "RGB"
        img = Image.frombytes(mode, (pix.width, pix.height), pix.samples)
        if mode == "RGBA":
            img = img.convert("RGB")
        img_b64 = image_to_base64(img)
        prompt = "Extract all text from this document image."
        response = openai.ChatCompletion.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant that extracts text from document images."},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{img_b64}"}}
                    ]
                }
            ],
            max_tokens=1024
        )
        page_text = response.choices[0].message.content.strip()
        all_text += f"\n--- Page {i+1} ---\n{page_text}\n"
    return all_text


def extract_text_from_pdf_bytes_openai(pdf_bytes, model="gpt-4.1-mini", dpi=300):
    """Convert PDF bytes to images and extract text from each page using OpenAI Vision API."""
    openai.api_key = os.getenv("OPENAI_API_KEY")
    doc = fitz.open(stream=pdf_bytes, filetype='pdf')
    all_text = ""

    def image_to_base64(img):
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode()

    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=dpi)
        mode = "RGBA" if pix.alpha else "RGB"
        img = Image.frombytes(mode, (pix.width, pix.height), pix.samples)
        if mode == "RGBA":
            img = img.convert("RGB")
        img_b64 = image_to_base64(img)
        prompt = "Extract all text from this document image."
        response = openai.ChatCompletion.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant that extracts text from document images."},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{img_b64}"}}
                    ]
                }
            ],
            max_tokens=1024
        )
        page_text = response.choices[0].message.content.strip()
        all_text += f"\n--- Page {i+1} ---\n{page_text}\n"
    return all_text
