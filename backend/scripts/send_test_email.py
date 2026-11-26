#!/usr/bin/env python3
"""Send a test email using Brevo / Resend / SMTP / log (see .env.example)."""

import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

from app.core.email import send_email  # noqa: E402


def main() -> None:
    to = (sys.argv[1] if len(sys.argv) > 1 else "").strip() or input("Send test to email: ").strip()
    if not to:
        raise SystemExit("Need a recipient email.")
    result = send_email(
        to=to,
        subject="SevenPros test email",
        text="If you see this, your free email provider is working.",
    )
    print(result)


if __name__ == "__main__":
    main()