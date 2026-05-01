-- database_schema.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom enum for network security status
CREATE TYPE security_status AS ENUM ('Safe', 'Elevated', 'Critical');

-- ─── network_analysis_reports ────────────────────────────────────────────────
-- Main table for network analysis and ML classification reports
-- Aligned with /api/reports POST payload (audit fix 2026-04-14)
CREATE TABLE network_analysis_reports (
    report_id        UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp        TIMESTAMPTZ     DEFAULT CURRENT_TIMESTAMP,
    source_type      TEXT            NOT NULL DEFAULT 'live'  -- 'live' | 'file'
                                    CHECK (source_type IN ('live', 'file')),
    filename         TEXT,           -- populated for source_type = 'file'
    model_used       TEXT,           -- e.g. 'Random Forest'
    total_flows      INTEGER,
    threat_intensity NUMERIC(10, 4)  NOT NULL,
    model_confidence NUMERIC(5, 2)   CHECK (model_confidence >= 0 AND model_confidence <= 100),
    network_security_status security_status NOT NULL,
    api_version      TEXT            DEFAULT '3.1.0',
    ml_tensor_data   JSONB           -- Stores hyperparams, matrices, SHAP explanations
);

-- Target table for archival stored procedure
CREATE TABLE security_audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL,
    original_timestamp TIMESTAMPTZ,
    threat_intensity NUMERIC(10, 4),
    model_confidence NUMERIC(5, 2),
    network_security_status security_status,
    ml_tensor_data JSONB,
    archived_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ─── Performance Optimization ────────────────────────────────────────────────
-- GIN Index for rapid granular searching within JSONB structures
-- (e.g., searching for specific attack vectors like 'DoS' or SHAP features)
CREATE INDEX idx_ml_tensor_data_gin    ON network_analysis_reports USING GIN (ml_tensor_data);

-- B-Tree for time series queries
CREATE INDEX idx_report_timestamp_btree ON network_analysis_reports USING BTREE (timestamp);

-- Rapid lookup for critical threats
CREATE INDEX idx_report_critical_status ON network_analysis_reports (network_security_status)
    WHERE network_security_status = 'Critical';

-- Fast model-specific queries (new in audit v3.1)
CREATE INDEX idx_report_model_used ON network_analysis_reports (model_used);
CREATE INDEX idx_report_source_type ON network_analysis_reports (source_type);

-- ─── Stored Procedure ────────────────────────────────────────────────────────
-- audit_critical_threats: soft-archives critical or low-confidence reports
-- FIX: Changed from hard DELETE to soft-archive (preserves audit trail)
CREATE OR REPLACE FUNCTION archive_critical_threats()
RETURNS void AS $$
BEGIN
    -- Copy Critical scans or low-confidence (<75%) into security_audit_logs
    INSERT INTO security_audit_logs (
        report_id, original_timestamp, threat_intensity,
        model_confidence, network_security_status, ml_tensor_data
    )
    SELECT
        report_id, timestamp, threat_intensity,
        model_confidence, network_security_status, ml_tensor_data
    FROM network_analysis_reports
    WHERE network_security_status = 'Critical' OR model_confidence < 75.0
      AND report_id NOT IN (SELECT report_id FROM security_audit_logs);

    -- Soft-archive: mark as processed (do NOT delete — preserves audit trail)
    -- In production: add an `archived BOOLEAN DEFAULT FALSE` column and
    -- UPDATE network_analysis_reports SET archived = TRUE WHERE ...
    RAISE NOTICE 'Critical threats and low-confidence anomalies archived (audit trail preserved).';
END;
$$ LANGUAGE plpgsql;

-- ─── pg_cron Schedule (uncomment when pg_cron extension is enabled) ────────────
-- SELECT cron.schedule('archive-threats', '*/15 * * * *', 'SELECT archive_critical_threats()');
