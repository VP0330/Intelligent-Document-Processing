import streamlit as st
from PIL import Image
from ocr_utils import extract_text_from_pdf_bytes_openai
from openai_utils import classify_document, extract_field

st.set_page_config(page_title="IDP Prototype", layout="wide")



with st.sidebar:
    st.image(r"C:\Users\vaibh\OneDrive\Desktop\Infrrd\IS\Intelligent-Document-Processing\Icon.png", width=500)
    st.markdown("# Intelligent Document Processing")
    st.markdown("---")
    uploaded_file = st.file_uploader("Select a PDF document", type=["pdf"])
    st.write("Upload a PDF to begin.")

#st.markdown("<h1 style='text-align: center; color: #2c3e50;'>IDP Prototype</h1>", unsafe_allow_html=True)

#st.markdown("<div style='background-color: #f8f9fa; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px #eee;'>", unsafe_allow_html=True)


ocr_text = ""
if uploaded_file is not None:
    pdf_bytes = uploaded_file.read()
    with st.spinner("Extracting text from PDF using OpenAI Vision..."):
        ocr_text = extract_text_from_pdf_bytes_openai(pdf_bytes)
    print("\n--- OCR Extracted Text ---\n")
    print(ocr_text)

    st.markdown("---")
    st.markdown("### Document Classification", unsafe_allow_html=True)
    doc_type = classify_document(ocr_text)
    st.success(f"Document Type: {doc_type}")


    st.markdown("---")
    col_ocr, col_fields = st.columns([1, 1])

    with col_ocr:
        st.markdown("#### Uploaded PDF", unsafe_allow_html=True)
        import fitz
        from PIL import Image
        pdf_doc = fitz.open(stream=pdf_bytes, filetype='pdf')
        page = pdf_doc.load_page(0)
        pix = page.get_pixmap(dpi=150)
        mode = "RGBA" if pix.alpha else "RGB"
        img = Image.frombytes(mode, (pix.width, pix.height), pix.samples)
        if mode == "RGBA":
            img = img.convert("RGB")
        st.image(img, caption="Page 1 Preview", width=350)
        # st.markdown("#### OCR Extracted Text", unsafe_allow_html=True)
        # st.text_area(ocr_text, height=400)


    with col_fields:
        st.markdown("#### Field", unsafe_allow_html=True)

        # Define fields and questions here
        fields = [
            {"name": "Borrower Name", "question": "Extract the Borrower Name. return only the name."},
            {"name": "Lender Loan No", "question": "Extract the Lender Loan Number and return only the number."},
            {"name": "Agency Case Number", "question": "Extract the Agency Case Number and return only the number."},
            {"name": "Date of Birth", "question": "Extract the date of birth and return only the date."},
            {"name": "Current Address", "question": "Extract the current address and return the complete address."},

            # Add more fields/questions as needed
        ]
        for field in fields:
            field_value = extract_field(ocr_text, field["name"], field["question"])
            st.info(f"{field['name']}: {field_value}")
