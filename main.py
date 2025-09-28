import streamlit as st
from PIL import Image
from ocr_utils import extract_text_from_image
from openai_utils import classify_document, extract_field

st.title("Intelligent Document Processing Proof of Concept")

uploaded_file = st.file_uploader("Upload a document (image only for now)", type=["png", "jpg", "jpeg"])

ocr_text = ""
if uploaded_file is not None:
    image = Image.open(uploaded_file)
    ocr_text = extract_text_from_image(image)
    st.subheader("OCR Extracted Text")
    st.text_area("Extracted Text", ocr_text, height=200)

    doc_type = classify_document(ocr_text)
    st.subheader("Document Type")
    st.write(doc_type)

    field_name = st.text_input("Field to extract (e.g., Invoice Number)")
    question = st.text_input("Question for extraction (e.g., What is the invoice number?)")
    if field_name and question:
        field_value = extract_field(ocr_text, field_name, question)
        st.subheader(f"Extracted {field_name}")
        st.write(field_value)
