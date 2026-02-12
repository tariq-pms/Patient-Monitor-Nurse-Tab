import cv2
import re
import difflib
import pandas as pd
import numpy as np

import logging

# Suppress PaddleOCR logging
logging.getLogger("ppocr").setLevel(logging.ERROR)

from paddleocr import PaddleOCR


ocr = PaddleOCR(use_gpu=False, lang='en')
# print("PaddleOCR loaded successfully!") # Commented out to prevent JSON parse error

def pattern_4(image_path, ocr):
    """
    End-to-end RES extraction from LCD image using PaddleOCR.
    Returns a pandas DataFrame instead of JSON.
    """

    # ==================================================
    # STEP 0: Load image
    # ==================================================
    import sys
    sys.stderr.write(f"DEBUG: Processing image {image_path}\n")
    sys.stderr.flush()
    
    img = cv2.imread(image_path)
    if img is None:
        sys.stderr.write("DEBUG: Image load failed\n")
        sys.stderr.flush()
        raise ValueError("❌ Image not loaded. Check path.")

    # ==================================================
    # STEP 1: Force landscape orientation
    # ==================================================
    h, w = img.shape[:2]
    if h > w:
        img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)

    # ==================================================
    # STEP 2: Detect LCD (blue region)
    # ==================================================
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    lower_blue = np.array([90, 40, 40])
    upper_blue = np.array([140, 255, 255])
    mask = cv2.inRange(hsv, lower_blue, upper_blue)

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 9))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        sys.stderr.write("DEBUG: No blue contours found\n")
        sys.stderr.flush()
        return pd.DataFrame(columns=["value", "unit", "flag"])

    lcd_contour = max(contours, key=cv2.contourArea)

    # ==================================================
    # STEP 3: Auto de-skew using LCD angle
    # ==================================================
    rect = cv2.minAreaRect(lcd_contour)
    angle = rect[-1]
    if angle < -45:
        angle += 90

    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)

    img = cv2.warpAffine(
        img, M, (w, h),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REPLICATE
    )

    # ==================================================
    # STEP 4: Re-detect LCD & crop
    # ==================================================
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    mask = cv2.inRange(hsv, lower_blue, upper_blue)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return pd.DataFrame(columns=["value", "unit", "flag"])

    lcd_contour = max(contours, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(lcd_contour)
    lcd = img[y:y+h, x:x+w]

    # ==================================================
    # STEP 5: OCR-optimized preprocessing
    # ==================================================
    lab = cv2.cvtColor(lcd, cv2.COLOR_BGR2LAB)
    L, _, _ = cv2.split(lab)

    blur = cv2.GaussianBlur(L, (7, 7), 0)
    enhanced = cv2.addWeighted(L, 1.6, blur, -0.6, 0)

    stripe_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 3))
    clean = cv2.morphologyEx(enhanced, cv2.MORPH_OPEN, stripe_kernel)

    ocr_ready = cv2.normalize(clean, None, 0, 255, cv2.NORM_MINMAX)

    # ==================================================
    # STEP 6: PaddleOCR
    # ==================================================
    result = ocr.ocr(ocr_ready, cls=True)

    # ==================================================
    # STEP 7: Flatten OCR tokens
    # ==================================================
    tokens = []
    for line in result:
        for word in line:
            text = word[1][0].strip()
            if text:
                tokens.append(text)

    stream = " ".join(tokens)
    sys.stderr.write(f"DEBUG: OCR Tokens: {stream}\n")
    sys.stderr.flush()

    # ==================================================
    # STEP 8: Locate Anchor (Res / Result / Total / Bilirubin)
    # ==================================================
    # Expanded keywords to catch "Total Bilirubin" or just "Bilirubin"
    anchor_pattern = r"\b(res|result|total|bili)\w*"
    anchor_match = re.search(anchor_pattern, stream, re.IGNORECASE)
    
    value = None
    after_anchor = ""

    if anchor_match:
        sys.stderr.write(f"DEBUG: Anchor found: {anchor_match.group()}\n")
        sys.stderr.flush()
        after_anchor = stream[anchor_match.end():]
        value_match = re.search(r"\d+(?:\.\d+)?", after_anchor)
        if value_match:
            value = value_match.group()
            sys.stderr.write(f"DEBUG: Value found after anchor: {value}\n")
            sys.stderr.flush()
    else:
        sys.stderr.write("DEBUG: No anchor found, trying fallback\n")
        sys.stderr.flush()
        # Fallback: If no keyword found, check if the stream ITSELF is just a number/short text
        # Common on simple LCDs showing just "12.5"
        value_match = re.search(r"\d+(?:\.\d+)?", stream)
        if value_match:
            value = value_match.group()
            sys.stderr.write(f"DEBUG: Value found via fallback: {value}\n")
            sys.stderr.flush()

    if not value:
         sys.stderr.write("DEBUG: No value extracted\n")
         sys.stderr.flush()
         return pd.DataFrame(columns=["value", "unit", "flag"])

    # ==================================================
    # STEP 10: Flag detection (HI / H1 / Hl / noise-safe)
    # ==================================================
    # Search for flag in the text after the value (or whole stream if we fell back)
    search_context = after_anchor if after_anchor else stream
    hi_pattern = re.compile(r"h[\|l1i]?", re.IGNORECASE)
    flag = "HI" if hi_pattern.search(search_context) else "LO"

    # ==================================================
    # FINAL: DataFrame output
    # ==================================================
    return pd.DataFrame([{
        "test": "Total Bilirubin",
        "result": value,
        "unit": "mg/dL",
        "flag": flag
    }])

if __name__ == "__main__":
    # For testing, you might want to accept command line args for path
    import sys
    import json
    
    img_path = sys.argv[1] if len(sys.argv) > 1 else "D:\\Downloads\\Paddle\\Pattern_4_image_1.png"
    
    try:
        df = pattern_4(img_path, ocr)
        # Output JSON explicitly for the node server
        print(df.to_json(orient='records'))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
