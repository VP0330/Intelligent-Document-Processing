import easyocr
import numpy as np

def extract_text_from_image(image):
    """Extract text from a PIL Image object using EasyOCR."""
    reader = easyocr.Reader(['en'])
    img_np = np.array(image)
    result = reader.readtext(img_np, detail=0)
    text = '\n'.join(result)
    return text
