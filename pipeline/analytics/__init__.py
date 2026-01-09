# EUC Analytics Module
# Calculates dashboard metrics from processed ETL data

from .metrics import (
    calculate_fpl,
    calculate_success_metrics,
    calculate_roi_metrics,
    calculate_wage_changes_from_assessments,
    load_processed_data,
)
from .roi import calculate_full_roi
from .generate import generate_all_dashboard_json
