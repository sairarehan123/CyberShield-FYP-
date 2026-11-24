"""
CyberShield - Delivery of the simulated phishing messages

The SERVER sends each message when it is due, so it reaches the user even if the app
has not been opened for days. Two channels (both optional, use whichever is configured):

  1. EMAIL  - needs these lines in backend/.env (a Gmail "app password" is enough):
        SMTP_HOST=smtp.gmail.com
        SMTP_PORT=587
        SMTP_USER=yourcybershieldsender@gmail.com
        SMTP_PASSWORD=your_app_password
        PUBLIC_BASE_URL=https://your-public-address      (so the link in the email works)
  2. PUSH   - Expo push notification. The app sends us its push token with
        POST /training/{user_id}/contact. (Needs a development build of the app:
        Expo Go on Android does not support remote push.)

The in-app inbox always works: the app can read the message with GET /training/{user_id}/drill.

The email's display name is the fake sender (e.g. "SecureAlert"); the real address is ours.
Every simulated email carries the header  X-CyberShield-Simulation: true  so it can be
whitelisted and recognised as a drill.
"""

import json
import os
import re
import smtplib
import urllib.request
from email.message import EmailMessage
from email.utils import formataddr
import html as html_lib

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def email_configured():
    return all(os.environ.get(k, "").strip() for k in ("SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD"))


def valid_email(text):
    return bool(EMAIL_RE.match(text or ""))


def valid_push_token(text):
    return bool(re.match(r"^Expo(nent)?PushToken\[.+\]$", text or ""))


def send_email(to, msg):
    """msg: the delivered message view (sender, subject, text, link_text, click_url)."""
    host = os.environ["SMTP_HOST"].strip()
    port = int(os.environ.get("SMTP_PORT", "587") or 587)
    user = os.environ["SMTP_USER"].strip()
    password = os.environ["SMTP_PASSWORD"].strip()

    mail = EmailMessage()
    mail["From"] = formataddr((msg["sender"], user))
    mail["To"] = to
    mail["Subject"] = msg["subject"] or msg["text"][:50]
    mail["X-CyberShield-Simulation"] = "true"
    mail.set_content(f"{msg['text']}\n\n{msg['link_text']}\n")
    mail.add_alternative(
        "<html><body><p>" + html_lib.escape(msg["text"]) + "</p>"
        f'<p><a href="{html_lib.escape(msg["click_url"])}">{html_lib.escape(msg["link_text"])}</a></p>'
        "</body></html>", subtype="html")
    with smtplib.SMTP(host, port, timeout=30) as server:
        server.starttls()
        server.login(user, password)
        server.send_message(mail)


def send_push(token, msg):
    body = {"to": token, "title": msg["sender"], "body": msg["text"][:140],
            "data": {"type": "inbox", "message_id": msg["id"]}}
    req = urllib.request.Request(
        "https://exp.host/--/api/v2/push/send", data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json", "Accept": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=20):
        pass


def notify(contact, msg):
    """Sends the message on every configured channel. Returns the list of channels used."""
    used = []
    email = (contact or {}).get("email")
    if email and email_configured() and os.environ.get("PUBLIC_BASE_URL", "").strip():
        try:
            send_email(email, msg)
            used.append("email")
        except Exception as e:  # never crash the server because of a mail problem
            print(f"[notify] email failed: {e}")
    token = (contact or {}).get("push_token")
    if token:
        try:
            send_push(token, msg)
            used.append("push")
        except Exception as e:
            print(f"[notify] push failed: {e}")
    return used
