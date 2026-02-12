import cv2
import re
import difflib
import pandas as pd


import sys
import json
import os

# Suppress PaddleOCR logging
os.environ['GLOG_minloglevel'] = '2'

from paddleocr import PaddleOCR
import logging
logging.getLogger("ppocr").setLevel(logging.ERROR)

def Pattern_3(img_path, ocr):
    """
    Takes an image path, runs PaddleOCR,
    extracts Na, K, Cl values,
    returns a structured DataFrame.
    """

    # --------------------------------------------------
    # STEP 1: Run OCR
    # --------------------------------------------------
    if not os.path.exists(img_path):
        return pd.DataFrame()

    result = ocr.ocr(img_path, cls=True)

    if not result or result[0] is None:
        sys.stderr.write("DEBUG: OCR result is empty or None\n")
        return pd.DataFrame(columns=["test", "result", "unit", "flag"])

    # --------------------------------------------------
    # STEP 2: Flatten OCR tokens
    # --------------------------------------------------
    tokens = []
    for line in result:
        for word in line:
            text = word[1][0].strip()
            if text:
                tokens.append(text)
                
    sys.stderr.write(f"DEBUG: Found {len(tokens)} tokens: {tokens}\n")

    # --------------------------------------------------
    # STEP 3: Test configuration
    # --------------------------------------------------
    tests = {
        "Na": ["na"],
        "K": ["k"],
        "Cl": ["cl", "c1"]
    }

    rows = []

    # --------------------------------------------------
    # STEP 4: Sequential extraction
    # --------------------------------------------------
    for test_name, aliases in tests.items():
        value = None

        for i, token in enumerate(tokens):
            if token.lower() in aliases:
                lookahead = tokens[i + 1:i + 5]

                for t in lookahead:
                    match = re.search(r"\d+(?:\.\d+)?", t)
                    if match:
                        value = match.group()
                        break
                break

        rows.append({
            "test": test_name,
            "result": value,
            "unit": "mmol/L",
            "flag": None
        })

    # --------------------------------------------------
    # STEP 5: Return DataFrame
    # --------------------------------------------------
    return pd.DataFrame(rows)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)

    image_path = sys.argv[1]
    
    try:
        # Initialize OCR here to avoid printing garbage on import
        ocr_engine = PaddleOCR(use_gpu=False, lang='en', show_log=False)
        
        df = Pattern_3(image_path, ocr_engine)
        
        if not df.empty:
            # Replace NaN with None or empty string
            df = df.where(pd.notnull(df), "")
            print(json.dumps(df.to_dict(orient="records")))
        else:
            print(json.dumps([]))
            
    except Exception as e:
        print(json.dumps({"error": str(e)}))
