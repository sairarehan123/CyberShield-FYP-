"""
Sends ONE test email with the settings in backend/.env, to check that the simulated emails will arrive.

    cd D:\\FYP\\backend
    python test_email.py yourpersonal@gmail.com
"""
import sys

import training
import training_notify

training.load_env()


def main():
    if len(sys.argv) < 2 or not training_notify.valid_email(sys.argv[1]):
        print("Usage: python test_email.py someone@gmail.com")
        return 1
    missing = [k for k in ("SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "PUBLIC_BASE_URL")
               if not __import__("os").environ.get(k, "").strip()]
    if missing:
        print("Missing in backend/.env:", ", ".join(missing))
        return 1
    msg = {"id": "test", "sender": "SecureAlert", "subject": "CyberShield test email",
           "text": "This is a test. If you can read this, CyberShield can send your simulated emails.",
           "link_text": "Open the test link", "click_url": training.os.environ["PUBLIC_BASE_URL"].rstrip("/") + "/docs"}
    try:
        training_notify.send_email(sys.argv[1], msg)
    except Exception as e:  # show the real reason (wrong app password, 2-step verification off, ...)
        print("FAILED:", e)
        return 1
    print("Sent! Check the inbox (and Spam) of", sys.argv[1])
    return 0


if __name__ == "__main__":
    sys.exit(main())
