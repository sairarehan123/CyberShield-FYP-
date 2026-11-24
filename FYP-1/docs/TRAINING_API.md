# Training chatbot API (for the app)

Base URL = backend address. `user_id` = the same id used for SeBIS / PMT / TPB / TTAT.
The chatbot is ONE chat screen driven by `stage`. Call `GET /training/{id}/chat` when the screen opens and after every action, and draw the screen from its answer.

## Stages
| stage | when | what to show |
|---|---|---|
| `general` | the user has NOT finished all assessments | chat works (cybersecurity + app questions only). Show a "locked" card with `missing_assessments` and a "Take assessment" button. No plan, quiz or inbox. |
| `choose_theory` | all assessments done, theory not chosen yet | card with `theory_options` (pmt / tpb / ttat). Choose -> `POST /theory`. Chat still works. |
| `learning` | plan ready | chat + the steps (`steps`). Button "I'm ready for the quiz" -> `POST /chat/quiz`. Theory can still be changed here. |
| `quiz` | quiz open | 5 questions -> `POST /chat/quiz/submit` |
| `consent_required` | quiz passed, no consent yet | consent card -> `POST /consent` |
| `observing` | progress check running | "Keep practising". Show the inbox |
| `coaching` | last evaluation said "needs coaching" | normal chat, same as learning |
| `finished` | every weak area mastered | congratulations |

Unlock rule: training, quiz, consent and e-mails unlock when every assessment in `TRAINING_REQUIRED_THEORIES` (backend `.env`, default `sebis,pmt,tpb,ttat`) is done. Questions about cybersecurity and the app are allowed from the first minute.

Every `GET /chat` answer has: `stage, area, area_name, actions, messages[], suggestions[], completed_areas[], consent, assessment_done`.
Extra by stage: `missing_assessments[]` (general), `theory_options[]` + `focus_theory` (choose_theory / learning), `steps[]` (learning...), `quiz` (quiz), `inbox[]` + `check_state` (observing / coaching).
`messages[].kind` = `text | plan | quiz | quiz_result | consent_request | consent | theory_choice | evaluation_result`; `role` = `assistant | user`.
`area` of a message is `_general` for the chat before the training started.

## Endpoints
- `GET  /training/{id}/chat` - current screen state. Creates the plan the first time (only after the theory is chosen).
- `POST /training/{id}/chat` body `{"message":"..."}` (max 500 chars) -> `{reply, follow_up, suggestions[], on_topic, ready_for_quiz, stage}`.
  `reply` already ends with the follow-up question ("Would you like...?"). `suggestions` = 3 short questions to show as chips. Off-topic questions are refused politely (`on_topic:false`).
- `POST /training/{id}/theory` body `{"theory":"pmt"|"tpb"|"ttat"}` -> the new chat state (same shape as GET /chat). Writes the plan from that theory. Can be changed while `stage=learning` (plan is rewritten); after the quiz starts it returns 400.
- `POST /training/{id}/background` body `{"background":"technical"|"non_technical"}` - ask once.
- `POST /training/{id}/chat/quiz` -> `{quiz:[{id,question,options:[{id,text}]}], attempt, pass_mark}`. No answers inside.
- `POST /training/{id}/chat/quiz/submit` body `{"quiz_answers":{"q1":"b",...}}` -> `{passed, quiz:{correct,total,score}, review.quiz[], feedback, stage}`. Pass = 4 of 5.
- `POST /training/{id}/consent` body `{"accepted":true}`.
- `POST /training/{id}/contact` body `{"email":"...","push_token":"ExponentPushToken[...]"}`.
- `GET  /training/{id}/notifications` -> `{unread, notifications[{id, kind: message|result, title, body, at, read, channel, target:{screen: inbox|chat, message_id}}]}`. One entry per delivered simulated message ("New email from SecureAlert") and one when a progress check ends. For the app's notification screen. Never says whether a message is phishing.
- `POST /training/{id}/notifications/read` body `{"ids":["..."]}` (leave `ids` out to mark all read) -> same shape as the GET. A notification is also marked read by itself when the user reports / clicks that message.
- `GET  /training/{id}/drill` - `state`: `none | consent_required | preparing | scheduled | in_progress | resolved`; `inbox[]` = only delivered messages.
- `POST /training/{id}/drill/{message_id}/click` and `/report` - both return `{debrief, evaluation_finished, result}`. **Never open the link; only display it.**
- `GET  /sim/click/{token}` - the "this was a drill" page for links tapped inside an e-mail.

Locked actions (quiz / consent before the assessments or before choosing a theory) return **404** with a plain message.
Errors: 400 bad input, 404 locked / no data, 503 the AI is unavailable (the chat shows "try again").

## Timing (backend `.env`)
`DRILL_MODE=demo` -> first message 1 min after consent, the rest at about 2, 3 and 4 min, each open 10 min (whole check about 5 min). `DRILL_MODE=real` -> 1 day, spread over 7 days, each open 1 day. Single `DRILL_DELAY_MINUTES` / `DRILL_PERIOD_MINUTES` / `MESSAGE_WINDOW_MINUTES` lines override the mode.

## UI notes
- Message cards look like a normal SMS / e-mail inbox with a "Report phishing" button.
- No countdown, no "message coming" - the user must not know when.
- Poll `GET /drill` (or `GET /chat`) every 20-60 s while the inbox screen is open.
