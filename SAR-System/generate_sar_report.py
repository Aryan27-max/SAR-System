#!/usr/bin/env python3
"""Generate SAR reports using the Gemini API.

Usage:
  export GEMINI_API_KEY=...
  python SAR-System/generate_sar_report.py \
    --subject "Unusual wire activity" \
    --narrative-file incident_notes.txt \
    --output report.md
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

def _build_prompt(subject: str, narrative: str) -> str:
    return f"""
You are a compliance analyst drafting a Suspicious Activity Report (SAR).

Create a professional SAR with the following sections:
1. Executive Summary
2. Parties Involved
3. Timeline of Activity
4. Suspicious Indicators
5. Regulatory/Compliance Notes
6. Recommended Next Actions

Requirements:
- Use factual, neutral language.
- Do not invent account numbers or identities.
- If details are missing, explicitly note assumptions and unknowns.
- Keep the report concise but actionable.

Subject: {subject}

Source Narrative:
{narrative}
""".strip()


def generate_sar_report(subject: str, narrative: str, model: str = "gemini-1.5-pro") -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set.")

    try:
        from google import genai
    except ImportError as exc:  # pragma: no cover
        raise RuntimeError(
            "Missing dependency: google-genai. Install with `pip install -r requirements.txt`."
        ) from exc

    client = genai.Client(api_key=api_key)
    prompt = _build_prompt(subject, narrative)
    response = client.models.generate_content(model=model, contents=prompt)

    text = getattr(response, "text", None)
    if not text:
        raise RuntimeError("Gemini API returned an empty response.")
    return text.strip() + "\n"


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate a SAR report with Gemini API.")
    parser.add_argument("--subject", required=True, help="Short SAR subject/title")
    parser.add_argument(
        "--narrative-file",
        required=True,
        type=Path,
        help="Path to plain-text notes describing suspicious activity",
    )
    parser.add_argument(
        "--output",
        required=True,
        type=Path,
        help="Path to write generated SAR report (markdown/text)",
    )
    parser.add_argument(
        "--model",
        default="gemini-1.5-pro",
        help="Gemini model name (default: gemini-1.5-pro)",
    )
    return parser.parse_args(argv)


def main(argv: list[str]) -> int:
    args = parse_args(argv)

    if not args.narrative_file.exists():
        print(f"Narrative file not found: {args.narrative_file}", file=sys.stderr)
        return 2

    narrative = args.narrative_file.read_text(encoding="utf-8").strip()
    if not narrative:
        print("Narrative file is empty.", file=sys.stderr)
        return 2

    try:
        report = generate_sar_report(args.subject, narrative, model=args.model)
    except Exception as exc:
        print(f"Error generating SAR report: {exc}", file=sys.stderr)
        return 1

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(report, encoding="utf-8")
    print(f"SAR report written to: {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
