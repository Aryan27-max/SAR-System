# SAR-System

This repository includes a Gemini API integration to generate Suspicious Activity Reports (SARs).

## Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Configure your API key securely (recommended):

```bash
cp .env.example .env
# then edit .env and set GEMINI_API_KEY
```

Alternative:

```bash
export GEMINI_API_KEY="your_api_key_here"
```

## Generate a SAR report

Create a narrative text file (example: `incident_notes.txt`) and run:

```bash
python SAR-System/generate_sar_report.py \
  --subject "Unusual transfer behavior" \
  --narrative-file incident_notes.txt \
  --output outputs/sar_report.md
```

Optional:
- `--model gemini-1.5-pro` (default)

## Output

The script writes a structured SAR report with sections for summary, parties, timeline, suspicious indicators, compliance notes, and recommended next actions.

## Security note

Do not commit real API keys to source control. Keep them in `.env` or environment variables.
