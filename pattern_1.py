
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

def Pattern_1(img_path, ocr):
    """
    Extracts CBC test results from a lab report image.
    """

    # --------------------------------------------------
    # 1. Load image
    # --------------------------------------------------
    if not os.path.exists(img_path):
        return pd.DataFrame()
        
    img = cv2.imread(img_path)
    if img is None:
        return pd.DataFrame()

    # --------------------------------------------------
    # 2. Image normalization (illumination correction)
    # --------------------------------------------------
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    background = cv2.medianBlur(gray, 31)
    normalized = cv2.divide(gray, background, scale=255)

    # --------------------------------------------------
    # 3. OCR
    # --------------------------------------------------
    result = ocr.ocr(normalized, cls=True)
    if not result or result[0] is None:
         return pd.DataFrame()

    # --------------------------------------------------
    # 4. Controlled vocab & unit map (Strict Enforcement)
    # --------------------------------------------------
    TEST_UNIT_MAP = {
        "WBC":  "10^3/µL",
        "LYM":  "10^3/µL",
        "MID":  "10^3/µL",
        "GRA":  "10^3/µL",

        "LYM%": "%",
        "MID%": "%",
        "GRA%": "%",

        "RBC":  "10^6/µL",
        "HGB":  "g/dL",
        "HCT":  "%",
        "MCV":  "fL",
        "MCH":  "pg",
        "MCHC": "g/dL",

        "RDWC": "%",
        "RDWS": "fL",

        "PLT":  "10^3/µL",
        "PCT":  "%",
        "MPV":  "fL",
        "PDWC": "%",
        "PDWS": "fL",

        "PLCR": "%",
        "PLCC": "10^3/µL",

        "MI": None,
        "SI": None,
        "GLR": None,
        "PLR": None,
    }

    # --------------------------------------------------
    # 6. Collect raw OCR lines
    # --------------------------------------------------
    ocr_lines = []
    for block in result:
        for word in block:
            text = word[1][0].strip().replace("[", "L")
            if text:
                ocr_lines.append(text)

    # --------------------------------------------------
    # 7. Trim report to WBC → last WBC
    # --------------------------------------------------
    start_index = None

    # 1️⃣ Primary: WBC or common OCR variants
    for i, line in enumerate(ocr_lines):
        if line.upper().startswith(("WBC", "WHITE BLOOD")): 
            start_index = i
            break

    # 2️⃣ Fallback: MODE line
    if start_index is None or start_index >= 10:
        for i, line in enumerate(ocr_lines):
            if line.startswith("MODE"):
                start_index = i + 1  # exclude MODE itself
                break

    # 3️⃣ Final safeguard
    if start_index is None:
        # Try to find any known key
        for i, line in enumerate(ocr_lines):
             if any(k in line for k in TEST_UNIT_MAP.keys()):
                 start_index = i
                 break
    
    if start_index is None:
        return pd.DataFrame(columns=["Test", "Value", "Unit", "Flag"])

    lines = ocr_lines[start_index:]

    # Initialize lists
    numericals = []
    flags = []

    # --------------------------------------------------
    # 8. Token classification
    # --------------------------------------------------
    for line in lines:
      line_clean = line.strip()

      # Flag detection
      if line_clean in ["H", "L", "["]:
          flags.append(line_clean)
          continue

      # Numeric detection (numbers, decimals, %, ^, units)
      # Allow some looseness
      if (
            re.match(r"^[0-9]", line_clean) or
            re.match(r"^\.[0-9]", line_clean) or
            re.fullmatch(r"(NA|NAN|NIL)", line_clean, re.IGNORECASE)
        ):
            numericals.append(line_clean)
            continue

    # --------------------------------------------------
    # 9. Define words
    # --------------------------------------------------
    words = [
        "WBC", "LYM", "MID", "GRA", "LYM%", "MID%", "GRA%",
        "RBC", "HGB", "HCT", "MCV", "MCH", "MCHC",
        "RDWC", "RDWS",
        "PLT", "PCT", "MPV", "PDWC", "PDWS",
        "PLCR", "PLCC",
        "MI", "SI", "GLR", "PLR"
    ]

    #  --------------------------------------------------
    # 10. Define Full Forms
    # --------------------------------------------------

    full_forms = {
        "WBC": "White Blood Cell Count",
        "LYM": "Lymphocytes",
        "MID": "Mid-sized Cells",
        "GRA": "Granulocytes",
        "LYM%": "Lymphocyte Percentage",
        "MID%": "Mid-sized Cell Percentage",
        "GRA%": "Granulocyte Percentage",
        "RBC": "Red Blood Cell Count",
        "HGB": "Hemoglobin",
        "HCT": "Hematocrit",
        "MCV": "Mean Corpuscular Volume",
        "MCH": "Mean Corpuscular Hemoglobin",
        "MCHC": "Mean Corpuscular Hemoglobin Concentration",
        "RDWC": "Red Cell Distribution Width (CV)",
        "RDWS": "Red Cell Distribution Width (SD)",
        "PLT": "Platelet Count",
        "PCT": "Plateletcrit",
        "MPV": "Mean Platelet Volume",
        "PDWC": "Platelet Distribution Width (CV)",
        "PDWS": "Platelet Distribution Width (SD)",
        "PLCR": "Platelet Large Cell Ratio",
        "PLCC": "Platelet Large Cell Count",
        "MI": "Mentzer Index",
        "SI": "Sehgal Index",
        "GLR": "Granulocyte to Lymphocyte Ratio",
        "PLR": "Platelet to Lymphocyte Ratio",
    }

    # --------------------------------------------------
    # 12. Extract numeric values
    # --------------------------------------------------
    # EXPECTED_COUNT = len(words) # Use known count
    values = []

    for item in numericals:
        # Cut at 10^, %, or first alphabet
        cut_item = re.split(r"(10\^|%|103u|103/|[A-Za-z])", item, maxsplit=1)[0]
        cut_item = cut_item.strip()
        
        # Extract numeric part
        match = re.match(r"^[0-9]*\.?[0-9]+", cut_item)

        if match:
            values.append(cut_item)
        else:
            pass # Skip garbage

    # Match values to words based on simple order for this specific pattern
    # This assumes the OCR reads data in a relatively consistent order
    
    final_data = []
    
    # Simple heuristic: zip words and values if counts are close
    # In a real generic parser, we'd use coordinate sorting (y-axis alignment)
    limit = min(len(words), len(values))
    
    for i in range(limit):
        final_data.append({
            "test": words[i],
            "fullForm": full_forms.get(words[i], words[i]),
            "result": values[i],
            "unit": TEST_UNIT_MAP.get(words[i], ""),
            "flag": "N" # Default
        })
        
    return pd.DataFrame(final_data)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)

    image_path = sys.argv[1]
    
    try:
        # Initialize OCR once here
        ocr_engine = PaddleOCR(use_gpu=False, lang='en', show_log=False)
        
        df = Pattern_1(image_path, ocr_engine)
        
        if not df.empty:
            # Replace NaN with None (which becomes null in JSON) or empty string
            df = df.where(pd.notnull(df), "")
            print(json.dumps(df.to_dict(orient="records")))
        else:
            print(json.dumps([]))
            
    except Exception as e:
        print(json.dumps({"error": str(e)}))


