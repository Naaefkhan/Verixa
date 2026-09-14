#!/usr/bin/env python3
"""
DocuScan Enterprise Pipeline - SQLite Database Engine
Relational persistence, audit trails, sync logging, role permissions, and SQL dump export.
"""

import sqlite3
import json
import os
import hashlib
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "docuscan.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def hash_log(entry_str):
    return hashlib.sha256(entry_str.encode('utf-8')).hexdigest()

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")

    # 1. Departments
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        description TEXT,
        lead_reviewer TEXT,
        sla_hours INTEGER DEFAULT 24
    );
    """)

    # 2. Documents
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        doc_number TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        department_id TEXT NOT NULL,
        original_language TEXT DEFAULT 'English',
        translated_to TEXT DEFAULT 'English',
        document_type TEXT NOT NULL,
        status TEXT NOT NULL, -- PENDING_REVIEW, COMMITTED, PIPELINE_ERROR, REJECTED
        confidence_score REAL DEFAULT 0.95,
        missing_count INTEGER DEFAULT 0,
        raw_text TEXT,
        image_preview TEXT,
        created_by TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (department_id) REFERENCES departments(id)
    );
    """)

    # 3. Document Fields
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS document_fields (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        field_key TEXT NOT NULL,
        original_value TEXT,
        cleaned_value TEXT,
        data_type TEXT NOT NULL,
        confidence REAL DEFAULT 0.95,
        is_empty INTEGER DEFAULT 0,
        review_status TEXT DEFAULT 'VALID', -- VALID, NEEDS_REVIEW, OVERRIDDEN, REJECTED
        suggested_action TEXT, -- JSON string
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    );
    """)

    # 4. Pipeline Alerts
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pipeline_alerts (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        field_key TEXT,
        severity TEXT NOT NULL, -- WARNING, ERROR, CRITICAL
        rule_name TEXT NOT NULL,
        message TEXT NOT NULL,
        is_resolved INTEGER DEFAULT 0,
        resolution_notes TEXT,
        created_at TEXT NOT NULL,
        resolved_at TEXT,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    );
    """)

    # 5. Audit Logs (SOC2 & GDPR compliance)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        user_email TEXT NOT NULL,
        role TEXT NOT NULL,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        details TEXT,
        ip_address TEXT DEFAULT '127.0.0.1',
        log_hash TEXT NOT NULL
    );
    """)

    # 6. Data Sync Logs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sync_logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        target_system TEXT NOT NULL,
        status TEXT NOT NULL, -- SUCCESS, FAILED, RETRYING
        records_count INTEGER NOT NULL,
        latency_ms INTEGER NOT NULL,
        details TEXT
    );
    """)

    conn.commit()

    # Seed initial departments if empty
    cursor.execute("SELECT COUNT(*) as cnt FROM departments;")
    if cursor.fetchone()["cnt"] == 0:
        seed_initial_data(conn)

    conn.close()

def seed_initial_data(conn):
    cursor = conn.cursor()
    departments = [
        ("dept-asset", "Asset Management", "AST", "Physical hardware, machinery, server racks, vehicle fleet", "s.miller@corp.internal", 12),
        ("dept-logistics", "Logistics & Supply", "LOG", "Bills of lading, shipping manifests, customs declarations", "m.chen@corp.internal", 6),
        ("dept-finance", "Finance & Invoicing", "FIN", "Commercial invoices, tax receipts, supplier expense claims", "a.vasquez@corp.internal", 24),
        ("dept-procurement", "Procurement & POs", "PRC", "Purchase orders, vendor quotes, receiving vouchers", "k.johansson@corp.internal", 18),
        ("dept-healthcare", "Healthcare & Medical", "MED", "Bio-medical equipment records, lab intake certifications", "dr.patel@corp.internal", 4),
        ("dept-hr", "Human Resources", "HRS", "Employee onboarding forms, safety compliance certificates", "e.dubois@corp.internal", 48)
    ]
    cursor.executemany("""
    INSERT INTO departments (id, name, code, description, lead_reviewer, sla_hours)
    VALUES (?, ?, ?, ?, ?, ?);
    """, departments)

    # Initial Seed Documents
    docs = [
        (
            "doc-1001", "AST-2026-089", "Siemens Industrial Motor Handover Protocol", "dept-asset",
            "German", "English", "Asset Handover Form", "COMMITTED", 0.98, 0,
            "Übergabeprotokoll Industrie-Elektromotor 75kW. Seriennummer: SM-8921-X. Zustand: Betriebsbereit.",
            "operator.karl@corp.internal", "2026-09-13T10:15:00Z", "2026-09-13T10:18:00Z"
        ),
        (
            "doc-1002", "LOG-2026-312", "CMA CGM Maritime Bill of Lading", "dept-logistics",
            "French", "English", "Bill of Lading", "COMMITTED", 0.96, 0,
            "Connaissement Maritime International. Port de départ: Le Havre. Port d'arrivée: Singapour. Poids brut: 14,250 kg.",
            "logistics.agent@corp.internal", "2026-09-13T14:40:00Z", "2026-09-13T14:42:00Z"
        ),
        (
            "doc-1003", "FIN-2026-741", "Tokyo Electronics Component Invoice", "dept-finance",
            "Japanese", "English", "Vendor Invoice", "NEEDS_REVIEW", 0.91, 1,
            "請求書 (Invoice). 発行日: 2026年9月10日. 金額: ¥1,450,000. 消費税額: 未記入 (Blank).",
            "fin.clerk@corp.internal", "2026-09-14T08:20:00Z", "2026-09-14T08:22:00Z"
        ),
        (
            "doc-1004", "AST-2026-094", "Cat 320 Hydraulic Excavator Telemetry Sheet", "dept-asset",
            "Spanish", "English", "Asset Inspection", "NEEDS_REVIEW", 0.89, 2,
            "Ficha Técnica de Excavadora Hidráulica. Número de serie: CAT-320-994. Horómetro: 1,840 hrs. Horas próximo servicio: [En blanco].",
            "field.tech@corp.internal", "2026-09-14T09:05:00Z", "2026-09-14T09:10:00Z"
        ),
        (
            "doc-1005", "PRC-2026-118", "Rotterdam Port Crane Spare Parts PO", "dept-procurement",
            "Dutch", "English", "Purchase Order", "PIPELINE_ERROR", 0.94, 0,
            "Inkooporder Kraanonderdelen. Totaalbedrag: €-4,250.00 (Foutieve credit/debet invoer).",
            "purchaser.dirk@corp.internal", "2026-09-14T09:30:00Z", "2026-09-14T09:35:00Z"
        ),
        (
            "doc-1006", "FIN-2026-892", "भारत इलेक्ट्रॉनिक्स GST कर चालान (GST Tax Invoice)", "dept-finance",
            "Hindi (हिन्दी)", "English", "Tax Invoice", "COMMITTED", 0.97, 0,
            "केन्द्रीय माल एवं सेवा कर चालान (GST Invoice). GSTIN: 07AAAAA0000A1Z5. कुल देय राशि: ₹ 2,89,100.00.",
            "operator.rajesh@corp.internal", "2026-09-14T10:10:00Z", "2026-09-14T10:12:00Z"
        ),
        (
            "doc-1007", "AST-2026-441", "महाराष्ट्र शासन सार्वजनिक बांधकाम मालमत्ता हस्तांतरण", "dept-asset",
            "Marathi (मराठी)", "English", "Asset Record", "NEEDS_REVIEW", 0.95, 1,
            "महाराष्ट्र शासन सार्वजनिक बांधकाम मंडळ पुणे. अवजड यंत्रसामग्री नोंदवही क्रमांक MH-PWD-2026-441. किंमत: ₹ 85,00,000.",
            "reviewer.sunil@corp.internal", "2026-09-14T10:30:00Z", "2026-09-14T10:34:00Z"
        )
    ]

    for d in docs:
        cursor.execute("""
        INSERT INTO documents (
            id, doc_number, title, department_id, original_language, translated_to,
            document_type, status, confidence_score, missing_count, raw_text,
            created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, d)

    # Fields for doc-1001
    fields_1001 = [
        ("fld-1", "doc-1001", "Asset Name", "Industrie-Elektromotor 75kW", "Industrial Electric Motor 75kW", "string", 0.99, 0, "VALID", None),
        ("fld-2", "doc-1001", "Serial Number", "SM-8921-X", "SM-8921-X", "string", 0.98, 0, "VALID", None),
        ("fld-3", "doc-1001", "Acquisition Cost", "14.850,00 €", "14850.00", "currency", 0.97, 0, "VALID", None),
        ("fld-4", "doc-1001", "Location / Bay", "Halle 4 - Regal B12", "Hall 4 - Shelf B12", "string", 0.96, 0, "VALID", None),
        ("fld-5", "doc-1001", "Commission Date", "12.09.2026", "2026-09-12", "date", 0.98, 0, "VALID", None)
    ]
    cursor.executemany("""
    INSERT INTO document_fields (id, document_id, field_key, original_value, cleaned_value, data_type, confidence, is_empty, review_status, suggested_action)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, fields_1001)

    # Fields for doc-1003 (Missing VAT)
    fields_1003 = [
        ("fld-6", "doc-1003", "Supplier Name", "東京エレクトロニクス株式会社", "Tokyo Electronics Co., Ltd.", "string", 0.98, 0, "VALID", None),
        ("fld-7", "doc-1003", "Invoice Total JPY", "¥1,450,000", "1450000.00", "currency", 0.97, 0, "VALID", None),
        ("fld-8", "doc-1003", "Invoice Date", "2026年9月10日", "2026-09-10", "date", 0.95, 0, "VALID", None),
        ("fld-9", "doc-1003", "Consumption Tax / VAT", "", "", "currency", 0.90, 1, "NEEDS_REVIEW", json.dumps({
            "type": "IMPUTE_DEFAULT",
            "value": "145000.00",
            "rationale": "Standard Japan Consumption Tax rate is 10% (¥145,000). Click to accept or enter custom override."
        }))
    ]
    cursor.executemany("""
    INSERT INTO document_fields (id, document_id, field_key, original_value, cleaned_value, data_type, confidence, is_empty, review_status, suggested_action)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, fields_1003)

    # Fields for doc-1005 (Negative total pipeline error)
    fields_1005 = [
        ("fld-10", "doc-1005", "Vendor Name", "Rotterdam Haven Reparatie B.V.", "Rotterdam Port Repair B.V.", "string", 0.98, 0, "VALID", None),
        ("fld-11", "doc-1005", "Order Total EUR", "€-4,250.00", "-4250.00", "currency", 0.96, 0, "ERROR", None),
        ("fld-12", "doc-1005", "Part Number", "CR-9022-BEARING", "CR-9022-BEARING", "string", 0.99, 0, "VALID", None)
    ]
    cursor.executemany("""
    INSERT INTO document_fields (id, document_id, field_key, original_value, cleaned_value, data_type, confidence, is_empty, review_status, suggested_action)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, fields_1005)

    # Fields for doc-1006 (Hindi GST Invoice)
    fields_1006 = [
        ("fld-13", "doc-1006", "Supplier Name", "भारत इलेक्ट्रॉनिक्स व सेवा प्रा. लि.", "Bharat Electronics & Services Pvt. Ltd.", "string", 0.99, 0, "VALID", None),
        ("fld-14", "doc-1006", "GSTIN Number", "07AAAAA0000A1Z5", "07AAAAA0000A1Z5", "id", 0.98, 0, "VALID", None),
        ("fld-15", "doc-1006", "Invoice Total INR", "₹ २,८९,१००.००", "289100.00", "currency", 0.97, 0, "VALID", None),
        ("fld-16", "doc-1006", "Asset Category", "उच्च क्षमता सौर इन्वर्टर प्रणाली (50 kVA)", "High Capacity Solar Inverter System (50 kVA)", "string", 0.96, 0, "VALID", None)
    ]
    cursor.executemany("""
    INSERT INTO document_fields (id, document_id, field_key, original_value, cleaned_value, data_type, confidence, is_empty, review_status, suggested_action)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, fields_1006)

    # Fields for doc-1007 (Marathi Asset Transfer)
    fields_1007 = [
        ("fld-17", "doc-1007", "Department Office", "सार्वजनिक बांधकाम विभाग, पुणे विभाग", "Public Works Department, Pune Division", "string", 0.99, 0, "VALID", None),
        ("fld-18", "doc-1007", "Asset Number", "MH-PWD-2026-441", "MH-PWD-2026-441", "id", 0.98, 0, "VALID", None),
        ("fld-19", "doc-1007", "Asset Valuation INR", "₹ ८५,००,०००.००", "8500000.00", "currency", 0.96, 0, "VALID", None),
        ("fld-20", "doc-1007", "Supervising Officer", "", "", "string", 0.88, 1, "NEEDS_REVIEW", json.dumps({
            "type": "IMPUTE_DEFAULT",
            "value": "Executive Engineer (Mechanical), Pune Division",
            "rationale": "Official sign-off officer left unassigned. Recommend defaulting to jurisdictional Executive Engineer."
        }))
    ]
    cursor.executemany("""
    INSERT INTO document_fields (id, document_id, field_key, original_value, cleaned_value, data_type, confidence, is_empty, review_status, suggested_action)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, fields_1007)

    # Pipeline Alert for doc-1005
    cursor.execute("""
    INSERT INTO pipeline_alerts (id, document_id, field_key, severity, rule_name, message, is_resolved, created_at)
    VALUES ('alt-101', 'doc-1005', 'Order Total EUR', 'ERROR', 'NEGATIVE_AMOUNT_ANOMALY',
            'Negative amount (-4250.00) detected on standard Purchase Order. Requires correction or credit memo flag.', 0, '2026-09-14T09:35:00Z');
    """)

    # Initial Audit Logs
    audit_data = [
        ("aud-1", "2026-09-13T10:18:00Z", "operator.karl@corp.internal", "OPERATOR", "DOCUMENT_COMMIT", "DOCUMENT", "doc-1001", "Cleaned and committed German asset handover protocol for motor SM-8921-X", "192.168.1.42"),
        ("aud-2", "2026-09-13T14:42:00Z", "logistics.agent@corp.internal", "OPERATOR", "DOCUMENT_COMMIT", "DOCUMENT", "doc-1002", "Processed French maritime bill of lading 14,250 kg into SQL table", "192.168.1.55"),
        ("aud-3", "2026-09-14T08:22:00Z", "fin.clerk@corp.internal", "REVIEWER", "FLAG_REVIEW", "DOCUMENT", "doc-1003", "Flagged Tokyo Electronics invoice due to missing VAT field", "192.168.2.19"),
        ("aud-4", "2026-09-14T09:35:00Z", "system.pipeline@corp.internal", "SYSTEM", "ALERT_TRIGGERED", "PIPELINE_ALERT", "alt-101", "Triggered automated alert NEGATIVE_AMOUNT_ANOMALY on doc-1005", "127.0.0.1")
    ]
    for a in audit_data:
        entry_str = f"{a[0]}|{a[1]}|{a[2]}|{a[4]}|{a[5]}|{a[6]}"
        lhash = hash_log(entry_str)
        cursor.execute("""
        INSERT INTO audit_logs (id, timestamp, user_email, role, action, entity_type, entity_id, details, ip_address, log_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (*a, lhash))

    # Sync Logs
    sync_data = [
        ("sync-1", "2026-09-14T02:00:00Z", "Power BI Data Gateway v2.4", "SUCCESS", 42, 185, "Full incremental refresh of document_fields and pipeline_metrics dataset"),
        ("sync-2", "2026-09-14T02:15:00Z", "SAP ERP Asset Master Connector", "SUCCESS", 12, 340, "Synchronized new asset records SM-8921-X and associated tags"),
        ("sync-3", "2026-09-14T02:20:00Z", "Snowflake Enterprise Warehouse", "SUCCESS", 42, 420, "Batch streamed cleaned OCR fields to staging_docuscan_prod")
    ]
    cursor.executemany("""
    INSERT INTO sync_logs (id, timestamp, target_system, status, records_count, latency_ms, details)
    VALUES (?, ?, ?, ?, ?, ?, ?);
    """, sync_data)

    conn.commit()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at", DB_PATH)
