import streamlit as st
from PIL import Image
from ocr_utils import extract_text_from_pdf_bytes_openai
from openai_utils import classify_document, extract_field

# -------------------- MONGODB SETUP --------------------
import os, re
from pymongo import MongoClient, ASCENDING
from dotenv import load_dotenv
from datetime import datetime
from difflib import SequenceMatcher

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("MONGODB_DB", "idp")
EXTRACTIONS_COLL = os.getenv("MONGODB_COLLECTION", "extractions")
PROMPTS_COLL = os.getenv("MONGODB_PROMPTS_COLLECTION", "field_prompts")

def _client():
    if not MONGO_URI:
        raise RuntimeError("MONGODB_URI is not set. Add it to your environment or .env file.")
    return MongoClient(MONGO_URI)

def _db():
    return _client()[DB_NAME]

def _extractions():
    return _db()[EXTRACTIONS_COLL]

def _prompts():
    return _db()[PROMPTS_COLL]

def _ensure_indexes():
    try:
        _extractions().create_index([("created_at", ASCENDING)])
        _extractions().create_index([("doc_type", ASCENDING)])
        _prompts().create_index([("doc_type", ASCENDING)], unique=True)
    except Exception:
        pass  # non-fatal

# -------------------- FUZZY MATCHING HELPERS --------------------
_WORD_RE = re.compile(r"[A-Za-z0-9]+")

def _normalize(s: str) -> str:
    """Uppercase, strip non-alnum, collapse whitespace."""
    tokens = _WORD_RE.findall(s or "")
    return " ".join(tokens).upper()

def _token_set(s: str) -> set:
    return set(_normalize(s).split())

def _jaccard(a: set, b: set) -> float:
    if not a and not b:
        return 1.0
    inter = len(a & b)
    union = len(a | b) or 1
    return inter / union

def _ratio(a: str, b: str) -> float:
    return SequenceMatcher(None, _normalize(a), _normalize(b)).ratio()

def _best_match(input_type: str, candidates: list[dict]) -> tuple[dict | None, float, str]:
    """
    Given input_type and candidate docs (with doc_type and aliases),
    return (best_doc, best_score, matched_label).
    Score combines jaccard and sequence ratio.
    """
    best = (None, 0.0, "")
    a_norm = _normalize(input_type)
    a_set = set(a_norm.split())

    for doc in candidates:
        labels = [doc.get("doc_type", "")]
        labels += list(doc.get("aliases", [])) if isinstance(doc.get("aliases"), list) else []

        for label in labels:
            b_norm = _normalize(label)
            score = 0.55 * _ratio(a_norm, b_norm) + 0.45 * _jaccard(a_set, set(b_norm.split()))
            if score > best[1]:
                best = (doc, score, label)

    return best

def get_fields_for_doc_type_fuzzy(doc_type_input: str, min_score: float = 0.72):
    """
    1) Try exact (case-insensitive) doc_type match.
    2) Else fuzzy match across doc_type and optional aliases.
    Returns: (fields_list, resolved_doc_type, matched_label, score)
    """
    # Exact (case-insensitive) first
    exact = _prompts().find_one({"doc_type": {"$regex": f"^{re.escape(doc_type_input)}$", "$options": "i"}})
    if exact and "fields" in exact:
        return exact["fields"], exact["doc_type"], exact.get("doc_type"), 1.0

    # Pull minimal candidate info for fuzzy
    cur = _prompts().find({}, {"doc_type": 1, "aliases": 1, "fields": 1})
    candidates = list(cur)

    if not candidates:
        return [], None, None, 0.0

    best_doc, best_score, matched_label = _best_match(doc_type_input, candidates)
    if best_doc and best_score >= min_score and "fields" in best_doc:
        return best_doc["fields"], best_doc.get("doc_type"), matched_label, best_score

    return [], None, None, best_score

# -------------------- STORE EXTRACTION --------------------
def store_extraction(*, fields: dict, doc_type_detected: str | None, doc_type_resolved: str | None,
                     matched_label: str | None, matched_score: float, ocr_text: str | None, filename: str | None):
    _extractions().insert_one({
        "doc_type_detected": doc_type_detected,  # from classifier
        "doc_type_resolved": doc_type_resolved,  # canonical doc_type from prompts
        "matched_label": matched_label,          # which alias/label matched
        "matched_score": matched_score,          # similarity score (0..1)
        "extracted_fields": fields,
        "ocr_text": ocr_text,
        "filename": filename,
        "created_at": datetime.utcnow()
    })

# -------------------------------------------------------

st.set_page_config(page_title="IDP Prototype", layout="wide")

with st.sidebar:
    st.image(r"C:\Users\vaibh\OneDrive\Desktop\Infrrd\IS\Intelligent-Document-Processing\Icon.png", width=500)
    st.markdown("# Intelligent Document Processing")
    st.markdown("---")
    uploaded_file = st.file_uploader("Select a PDF document", type=["pdf"])
    st.write("Upload a PDF to begin.")

# Prepare indexes (safe to call each run)
_ensure_indexes()

ocr_text = ""
if uploaded_file is not None:
    pdf_bytes = uploaded_file.read()

    with st.spinner("Extracting text from PDF..."):
        ocr_text = extract_text_from_pdf_bytes_openai(pdf_bytes)

    st.markdown("---")
    st.markdown("### Document Classification", unsafe_allow_html=True)
    doc_type_detected = classify_document(ocr_text)
    st.success(f"Document Type: {doc_type_detected}")

    # --- Fetch questions for this doc_type from MongoDB (FUZZY) ---
    fields_cfg, doc_type_resolved, matched_label, score = get_fields_for_doc_type_fuzzy(doc_type_detected)

    if not fields_cfg:
        st.error(
            f"No field prompts found in '{PROMPTS_COLL}' for detected doc_type: '{doc_type_detected}'.\n"
            f"(Fuzzy best score: {score:.2f}). Add this doc type (or an alias) and re-run."
        )
        st.stop()

    if doc_type_resolved != doc_type_detected:
        st.info(f"Matched to prompt set: '{doc_type_resolved}' via label '{matched_label}' (score {score:.2f}).")

    st.markdown("---")
    col_ocr, col_fields = st.columns([1, 1])

    with col_ocr:
        st.markdown("#### Uploaded PDF", unsafe_allow_html=True)
        import fitz  # PyMuPDF
        pdf_doc = fitz.open(stream=pdf_bytes, filetype='pdf')
        page = pdf_doc.load_page(0)
        pix = page.get_pixmap(dpi=150)
        mode = "RGBA" if pix.alpha else "RGB"
        img = Image.frombytes(mode, (pix.width, pix.height), pix.samples)
        if mode == "RGBA":
            img = img.convert("RGB")
        st.image(img, caption="Page 1 Preview", width=350)

    with col_fields:
        st.markdown("#### Fields", unsafe_allow_html=True)

        extracted_fields = {}
        for f in fields_cfg:
            name = f.get("name")
            question = f.get("question")
            if not name or not question:
                continue
            value = extract_field(ocr_text, name, question)
            extracted_fields[name] = value
            st.info(f"{name}: {value}")

        # Save populated fields + OCR text + matching metadata
        try:
            store_extraction(
                fields=extracted_fields,
                doc_type_detected=doc_type_detected,
                doc_type_resolved=doc_type_resolved,
                matched_label=matched_label,
                matched_score=score,
                ocr_text=ocr_text,
                filename=getattr(uploaded_file, "name", None)
            )
        except Exception as e:
            st.error(f"Could not save extraction: {e}")
