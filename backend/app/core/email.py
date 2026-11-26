"""Transactional email — free-friendly providers (Brevo / Resend / SMTP), else console log."""

from __future__ import annotations

import json
import os
import smtplib
import urllib.error
import urllib.request
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


def _from_address() -> str:
    return os.environ.get("EMAIL_FROM", "SevenPros <onboarding@resend.dev>")


def _parse_from(raw: str) -> tuple[str, str]:
    raw = (raw or "").strip()
    if "<" in raw and ">" in raw:
        name, rest = raw.split("<", 1)
        email = rest.split(">", 1)[0].strip()
        return name.strip() or "SevenPros", email
    return "SevenPros", raw or "onboarding@resend.dev"


def _brevo_credential() -> str:
    return (os.environ.get("BREVO_API_KEY") or os.environ.get("BREVO_SMTP_KEY") or "").strip()


def _send_brevo_smtp(*, to: str, subject: str, text: str, html: str, smtp_key: str) -> dict:
    login = os.environ.get("BREVO_SMTP_LOGIN", "").strip()
    if not login:
        _, login = _parse_from(_from_address())
    if not login or "@" not in login:
        return {"sent": False, "reason": "no_brevo_smtp_login"}
    name, from_email = _parse_from(_from_address())
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{name} <{from_email or login}>"
    msg["To"] = to
    msg.attach(MIMEText(text, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))
    with smtplib.SMTP("smtp-relay.brevo.com", 587, timeout=25) as smtp:
        smtp.starttls()
        smtp.login(login, smtp_key)
        smtp.sendmail(from_email or login, [to], msg.as_string())
    return {"sent": True, "mode": "brevo_smtp", "to": to}


def _send_brevo(*, to: str, subject: str, text: str, html: str) -> dict:
    api_key = _brevo_credential()
    if not api_key:
        return {"sent": False, "reason": "no_brevo_key"}
    if api_key.startswith("xsmtpsib-"):
        return _send_brevo_smtp(to=to, subject=subject, text=text, html=html, smtp_key=api_key)
    name, email = _parse_from(_from_address())
    payload = json.dumps(
        {
            "sender": {"name": name, "email": email},
            "to": [{"email": to}],
            "subject": subject,
            "htmlContent": html,
            "textContent": text,
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        "https://api.brevo.com/v3/smtp/email",
        data=payload,
        headers={"api-key": api_key, "Content-Type": "application/json", "accept": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        data = json.loads(resp.read().decode())
    return {"sent": True, "mode": "brevo", "id": data.get("messageId"), "to": to}


def _send_resend(*, to: str, subject: str, text: str, html: str) -> dict:
    api_key = os.environ.get("RESEND_API_KEY", "").strip()
    if not api_key:
        return {"sent": False, "reason": "no_resend_key"}
    payload = json.dumps(
        {
            "from": _from_address(),
            "to": [to],
            "subject": subject,
            "html": html,
            "text": text,
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=payload,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode())
    return {"sent": True, "mode": "resend", "id": data.get("id"), "to": to}


def _send_smtp(*, to: str, subject: str, text: str, html: str) -> dict:
    host = os.environ.get("SMTP_HOST", "").strip()
    user = os.environ.get("SMTP_USER", "").strip()
    password = os.environ.get("SMTP_PASSWORD", "").strip()
    port = int(os.environ.get("SMTP_PORT", "587"))
    if not host or not user or not password:
        return {"sent": False, "reason": "no_smtp_config"}
    name, from_email = _parse_from(_from_address())
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{name} <{from_email or user}>"
    msg["To"] = to
    msg.attach(MIMEText(text, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))
    with smtplib.SMTP(host, port, timeout=20) as smtp:
        if os.environ.get("SMTP_TLS", "1") != "0":
            smtp.starttls()
        smtp.login(user, password)
        smtp.sendmail(from_email or user, [to], msg.as_string())
    return {"sent": True, "mode": "smtp", "to": to}


def _log_email(*, to: str, subject: str, text: str) -> dict:
    print(f"[SevenPros email]\nTo: {to}\nSubject: {subject}\n\n{text}\n")
    return {"sent": True, "mode": "log", "to": to, "subject": subject}


def send_email(*, to: str, subject: str, text: str, html: str | None = None) -> dict:
    to = (to or "").strip()
    if not to or "@" not in to:
        return {"sent": False, "reason": "no_recipient"}

    html = html or f"<pre style='font-family:system-ui'>{text}</pre>"
    forced = os.environ.get("EMAIL_PROVIDER", "auto").strip().lower()
    order = (
        ["brevo", "resend", "smtp", "log"]
        if forced == "auto"
        else [forced] if forced in ("brevo", "resend", "smtp", "log") else ["brevo", "resend", "smtp", "log"]
    )

    last_error = None
    for provider in order:
        if provider == "log":
            return _log_email(to=to, subject=subject, text=text)
        try:
            if provider == "brevo":
                result = _send_brevo(to=to, subject=subject, text=text, html=html)
            elif provider == "resend":
                result = _send_resend(to=to, subject=subject, text=text, html=html)
            else:
                result = _send_smtp(to=to, subject=subject, text=text, html=html)
            if result.get("sent"):
                return result
        except urllib.error.HTTPError as exc:
            last_error = exc.read().decode()[:500]
            print(f"[email {provider} error] {exc.code} {last_error}")
        except Exception as exc:
            last_error = str(exc)
            print(f"[email {provider} error] {last_error}")

    print(f"[SevenPros email fallback]\nTo: {to}\nSubject: {subject}\n\n{text}\n")
    return {"sent": True, "mode": "log_fallback", "to": to, "error": last_error}