#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${APP_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}"
python3 -m streamlit run business_os_mvp/app.py
