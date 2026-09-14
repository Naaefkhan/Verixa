#!/usr/bin/env python3
"""
DocuScan Enterprise Pipeline - Python Data Cleaning & Validation Engine
Processes raw OCR extracted fields, standardizes types, detects anomalies,
applies business validation rules, and generates smart recommendations for missing data.
"""

import sys
import os
import json
import re
from datetime import datetime

# Ensure sibling imports work whether run from root or server dir
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from language_engine import ensure_100_percent_english, translate_to_english, detect_language

def convert_devanagari_digits(val):
    """Converts Hindi/Marathi Devanagari digits (०-९) to Western Arabic digits (0-9)."""
    if val is None:
        return ""
    text = str(val)
    devanagari_to_ascii = str.maketrans("०१२३४५६७८९", "0123456789")
    return text.translate(devanagari_to_ascii)

def clean_text(val):
    if val is None:
        return ""
    text = convert_devanagari_digits(val).strip()
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    return text

def parse_currency(val):
    if not val:
        return None, "Empty currency value"
    # Convert Devanagari digits first
    raw_val = convert_devanagari_digits(str(val))
    # Strip currency signs including Rupee symbol (₹), Rs, INR, Euro, Yen, Dollar
    cleaned = re.sub(r'[^\d.,\-]', '', raw_val).strip()
    if not cleaned:
        return None, "No numerical data in currency"
    
    # Handle Indian numbering format e.g. 1,50,000.00 or 15,00,000
    # Also Check European notation like 1.250,50 vs US 1,250.50
    if ',' in cleaned and '.' in cleaned:
        if cleaned.rfind(',') > cleaned.rfind('.'):
            # European: 1.250,50 -> 1250.50
            cleaned = cleaned.replace('.', '').replace(',', '.')
        else:
            # US / Indian: 1,50,000.50 or 1,250.50 -> 150000.50
            cleaned = cleaned.replace(',', '')
    elif ',' in cleaned:
        # Check if comma is decimal separator (e.g., 25,50)
        parts = cleaned.split(',')
        if len(parts) == 2 and len(parts[1]) in (1, 2):
            cleaned = cleaned.replace(',', '.')
        else:
            cleaned = cleaned.replace(',', '')

    try:
        num = float(cleaned)
        return round(num, 2), None
    except ValueError:
        return None, f"Could not parse '{val}' as currency/number"

def parse_date(val):
    if not val:
        return None, "Empty date"
    cleaned = re.sub(r'[^\d\-/\.]', '', str(val)).strip()
    formats = [
        "%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y",
        "%Y/%m/%d", "%d.%m.%Y", "%Y.%m.%d", "%d %b %Y", "%Y-%m"
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(cleaned, fmt)
            return dt.strftime("%Y-%m-%d"), None
        except ValueError:
            pass
    # Try regex fallback
    m = re.match(r'^(\d{1,2})[./\-](\d{1,2})[./\-](\d{2,4})$', cleaned)
    if m:
        p1, p2, p3 = m.groups()
        year = int(p3) if len(p3) == 4 else 2000 + int(p3)
        day, month = int(p1), int(p2)
        if month > 12 >= day:
            day, month = month, day
        try:
            dt = datetime(year, month, day)
            return dt.strftime("%Y-%m-%d"), None
        except Exception:
            pass
    return cleaned, f"Could not parse '{val}' into standard ISO 8601 date"

def clean_record(raw_payload):
    """
    Cleans raw document fields and applies enterprise business rules.
    """
    doc_type = raw_payload.get("document_type", "General Asset Record")
    department = raw_payload.get("department", "Asset Management")
    fields = raw_payload.get("fields", [])
    
    cleaned_fields = []
    pipeline_alerts = []
    missing_fields = []
    cleaning_log = []
    
    # Maps for cross-field mathematical validation
    field_map = {}
    
    for f in fields:
        raw_key = f.get("key", "").strip()
        # Enforce English field key
        key = translate_to_english(raw_key) if raw_key else "Field"
        if key != raw_key:
            cleaning_log.append(f"Auto-translated field label: '{raw_key}' -> '{key}'")
            
        raw_val = f.get("value")
        data_type = f.get("data_type", "string").lower()
        confidence = float(f.get("confidence", 0.95))
        is_empty = raw_val is None or str(raw_val).strip() == "" or str(raw_val).lower() in ["n/a", "null", "none", "unknown", "-"]
        
        original_val = "" if raw_val is None else str(raw_val)
        cleaned_val = original_val
        suggested_action = None
        review_status = "VALID"
        
        if is_empty:
            is_empty = True
            cleaned_val = ""
            review_status = "NEEDS_REVIEW"
            missing_fields.append(key)
            
            # Intelligent suggestion based on field key
            key_lower = key.lower()
            if "tax" in key_lower or "vat" in key_lower:
                suggested_action = {
                    "type": "IMPUTE_DEFAULT",
                    "value": "EXEMPT / 0%",
                    "rationale": "Tax/VAT not specified. Standard enterprise default is 0% or Exempt."
                }
            elif "status" in key_lower or "condition" in key_lower:
                suggested_action = {
                    "type": "IMPUTE_DEFAULT",
                    "value": "In Service / Operational",
                    "rationale": "Asset state left blank on handover. Defaulting to standard operational status."
                }
            elif "date" in key_lower:
                suggested_action = {
                    "type": "FILL_CURRENT_DATE",
                    "value": datetime.utcnow().strftime("%Y-%m-%d"),
                    "rationale": "Scan date can be used as fallback transaction timestamp."
                }
            elif "department" in key_lower:
                suggested_action = {
                    "type": "INFER_DEPARTMENT",
                    "value": department,
                    "rationale": f"Inferred from scan context: '{department}'"
                }
            elif "total" in key_lower or "amount" in key_lower or "price" in key_lower:
                suggested_action = {
                    "type": "CALCULATE",
                    "value": None,
                    "rationale": "Can be computed if unit price and quantity are present in line items."
                }
            else:
                suggested_action = {
                    "type": "MANUAL_INPUT",
                    "value": None,
                    "rationale": "High-priority field missing; human reviewer confirmation recommended."
                }
        else:
            # Data cleaning per data type
            if data_type in ["currency", "number", "amount", "price", "cost"]:
                num_val, err = parse_currency(original_val)
                if err:
                    pipeline_alerts.append({
                        "severity": "WARNING",
                        "field": key,
                        "rule": "NUMERIC_PARSE_ERROR",
                        "message": f"Field '{key}' has non-standard numeric format: {err}"
                    })
                    cleaned_val = clean_text(original_val)
                else:
                    cleaned_val = str(num_val)
                    field_map[key.lower()] = num_val
                    cleaning_log.append(f"Standardized numeric '{key}': {original_val} -> {cleaned_val}")
                    
                    # Anomaly detection: negative amount
                    if num_val < 0:
                        pipeline_alerts.append({
                            "severity": "ERROR",
                            "field": key,
                            "rule": "NEGATIVE_AMOUNT_ANOMALY",
                            "message": f"Negative amount detected ({num_val}) for field '{key}' without credit note designation."
                        })
                        review_status = "ERROR"
            elif data_type in ["date", "timestamp"]:
                dt_val, err = parse_date(original_val)
                if err:
                    pipeline_alerts.append({
                        "severity": "WARNING",
                        "field": key,
                        "rule": "DATE_FORMAT_WARNING",
                        "message": f"Field '{key}' date format normalization note: {err}"
                    })
                    cleaned_val = clean_text(original_val)
                else:
                    cleaned_val = dt_val
                    cleaning_log.append(f"Normalized date '{key}': {original_val} -> {cleaned_val}")
            elif "id" in key.lower() or "serial" in key.lower() or "code" in key.lower() or "tag" in key.lower():
                # Standardize uppercase and remove irregular spaces
                cleaned_val = re.sub(r'\s+', '', clean_text(original_val).upper())
                cleaning_log.append(f"Standardized identifier '{key}': {original_val} -> {cleaned_val}")
            else:
                raw_cleaned = clean_text(original_val)
                # Enforce 100% English translation & transliteration
                english_val, was_trans, note = ensure_100_percent_english(raw_cleaned, key)
                cleaned_val = english_val
                if was_trans and note:
                    cleaning_log.append(note)
                
            # Confidence check
            if confidence < 0.70:
                pipeline_alerts.append({
                    "severity": "WARNING",
                    "field": key,
                    "rule": "LOW_OCR_CONFIDENCE",
                    "message": f"Low OCR recognition confidence ({int(confidence*100)}%) for '{key}'. Review recommended."
                })
                review_status = "NEEDS_REVIEW"
                
        cleaned_fields.append({
            "key": key,
            "original_value": original_val,
            "cleaned_value": cleaned_val,
            "data_type": data_type,
            "confidence": confidence,
            "is_empty": is_empty,
            "review_status": review_status,
            "suggested_action": suggested_action
        })
        
    # Cross-field mathematical anomaly check (e.g. subtotal + tax == total or quantity * unit_price == total)
    if "quantity" in field_map and "unit_price" in field_map and "total" in field_map:
        expected = round(field_map["quantity"] * field_map["unit_price"], 2)
        actual = round(field_map["total"], 2)
        if abs(expected - actual) > 0.05:
            pipeline_alerts.append({
                "severity": "ERROR",
                "field": "total",
                "rule": "CROSS_FIELD_SUM_MISMATCH",
                "message": f"Quantity ({field_map['quantity']}) × Unit Price ({field_map['unit_price']}) = {expected}, but Total is {actual}."
            })

    status = "CLEANED"
    if any(a["severity"] == "ERROR" for a in pipeline_alerts):
        status = "PIPELINE_ERROR"
    elif missing_fields or any(a["severity"] == "WARNING" for a in pipeline_alerts):
        status = "NEEDS_REVIEW"
        
    return {
        "status": status,
        "cleaned_fields": cleaned_fields,
        "pipeline_alerts": pipeline_alerts,
        "missing_count": len(missing_fields),
        "total_fields": len(cleaned_fields),
        "cleaning_log": cleaning_log,
        "processed_at": datetime.utcnow().isoformat() + "Z"
    }

def main():
    try:
        input_data = sys.stdin.read()
        if not input_data.strip():
            print(json.dumps({"error": "No input provided"}))
            sys.exit(1)
        payload = json.loads(input_data)
        result = clean_record(payload)
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
