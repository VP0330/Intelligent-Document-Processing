import os
import openai

openai.api_key = os.getenv("OPENAI_API_KEY")

def classify_document(text):
    """Classify document type using OpenAI API (ChatCompletion)."""
    messages = [
        {"role": "system", "content": "You are a helpful assistant that classifies mortage document types."},
        {"role": "user", "content": f"Classify the following document: {text}, return only the type in string format (eg: Uniform Residential Loan Application, Uniform Residential Loan Application - Additional Borrower)."}
    ]
    response = openai.ChatCompletion.create(
        model="gpt-4.1",
        messages=messages,
        max_tokens=10
    )
    return response.choices[0].message.content.strip()

def extract_field(text, field_name, question):
    """Extract a field from OCR text using OpenAI API (ChatCompletion)."""
    messages = [
        {"role": "system", "content": "You are a helpful assistant that extracts fields from documents."},
        {"role": "user", "content": f"Extract the {field_name} from the following document text. {question}\nText: {text}\n{field_name}:"}
    ]
    response = openai.ChatCompletion.create(
        model="gpt-4.1",
        messages=messages,
        max_tokens=50
    )
    return response.choices[0].message.content.strip()
