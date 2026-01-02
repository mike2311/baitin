-- Data Quality Audit Table
-- Created: 2024-12-28
-- Purpose: Track orphaned records and their resolution status

CREATE TABLE IF NOT EXISTS data_quality_audit (
  id SERIAL PRIMARY KEY,
  source_table VARCHAR(100) NOT NULL,
  target_table VARCHAR(100) NOT NULL,
  fk_field VARCHAR(100) NOT NULL,
  fk_value VARCHAR(200) NOT NULL,
  orphaned_count INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  resolution_notes TEXT,
  resolved_by VARCHAR(50),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_status CHECK (status IN ('pending', 'in_review', 'resolved', 'approved_as_is'))
);

CREATE INDEX IF NOT EXISTS idx_dqa_status ON data_quality_audit(status);
CREATE INDEX IF NOT EXISTS idx_dqa_source_table ON data_quality_audit(source_table);
CREATE INDEX IF NOT EXISTS idx_dqa_target_table ON data_quality_audit(target_table);
CREATE INDEX IF NOT EXISTS idx_dqa_fk_field ON data_quality_audit(fk_field);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_data_quality_audit_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trg_data_quality_audit_updated_at ON data_quality_audit;
CREATE TRIGGER trg_data_quality_audit_updated_at
  BEFORE UPDATE ON data_quality_audit
  FOR EACH ROW
  EXECUTE FUNCTION update_data_quality_audit_updated_at();

