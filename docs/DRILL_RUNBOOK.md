# Phishing drill: setup and walkthrough recording (step by step)

Do the steps in order. Each step has one check at the end.

## Step 1: Gmail sender (one time)
1. Make a Gmail account only for CyberShield (not your personal one).
2. Google Account -> Security -> turn on 2-Step Verification.
3. Google Account -> search "App passwords" -> create one named CyberShield -> copy the 16 letters (no spaces).
4. Open `D:\FYP\backend\.env` in Notepad and add (your own values):
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourcybershieldsender@gmail.com
SMTP_PASSWORD=the16letterapppassword
PUBLIC_BASE_URL=http://192.168.18.142:8000
```
`PUBLIC_BASE_URL` = your computer's address that the phone can reach (`ipconfig`, IPv4). Save.

## Step 2: Test that email works
```powershell
cd D:\FYP\backend
python test_email.py yourpersonal@gmail.com
```
Check: it prints "Sent!" and the email is in that inbox (look in Spam too). If it prints FAILED, the app password or 2-Step Verification is wrong.

## Step 3: Short timing for the video
In `D:\FYP\backend\.env`:
1. DELETE any old lines that start with `DRILL_DELAY_MINUTES`, `DRILL_PERIOD_MINUTES`, `MESSAGE_WINDOW_MINUTES` (they override the mode).
2. Add `DRILL_MODE=demo`.

What demo means: after the user agrees (consent), message 1 arrives in about 1 minute, then about every minute (about 2, 3 and 4 minutes). Each stays open 10 minutes. The whole check takes about 5 minutes.
When the video is done, change it to `DRILL_MODE=real` (1 day, spread over 7 days, each open 1 day).

## Step 4: Start the backend
```powershell
cd D:\FYP\backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Check: `http://<your-ip>:8000/docs` opens in the phone browser. Keep this window open and the computer awake.

## Step 5: Reset the demo user (to record again)
Assessments stay. Only the training and drill start over.
```powershell
Remove-Item D:\FYP\backend\results_training\<userid>_progress.json
```
Or simply use a new user id.

## Step 6: What to record (clips, in this order)
1. New user opens the chatbot: general chat works, training is locked ("Take my assessment").
2. All four assessments done, back in the chatbot: "Choose your focus", pick a theory.
3. The plan, ask two questions (show the follow-up question and suggestions), ask one off-topic question.
4. "I'm ready for the quiz", pass it.
5. Consent card: type the Gmail address you will show on screen, agree.
6. WAIT about 1 minute (stop recording or cut it). Show: the email arriving in Gmail, then the app's notification screen ("New email from ..."), then tap it: the inbox.
7. Report the phishing messages, show the debrief for each. Report or open the genuine one to show the difference. For one message, tap the link in the email on the phone (same WiFi) to show the "this was a drill" page (that counts as a click).
8. After the last message: the result in the chat (mastered or needs coaching) and the notification "Your progress check is complete".
Tip: to show both outcomes, click one phishing message in round 1 (not mastered, new round starts in about 1 minute), then report everything in round 2 (mastered, next area unlocks).

## If something does not work
| Problem | Fix |
|---|---|
| No email arrives | Run `python test_email.py` again. The email is only sent if the user typed an email on the consent card AND `PUBLIC_BASE_URL` is set. Check Spam. |
| Messages come very late or at once | An old `DRILL_*` line is still in `.env`. Remove it. |
| Email link does not open | Phone not on the same WiFi as the computer, or `PUBLIC_BASE_URL` is wrong. |
| Backend stops sending | Computer went to sleep or the window was closed. Sending only happens while the backend runs. |
| "There is no message waiting" | The 10-minute window ended or all messages are done. Reset the user (Step 5). |
