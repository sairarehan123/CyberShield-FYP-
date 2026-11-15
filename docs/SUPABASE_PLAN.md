# Where Supabase attaches (backend only)

Today everything is saved as JSON files. Only FIVE backend files touch storage; every other file calls their functions. So Supabase replaces the insides of these five, keeping the same function names and return values:

| File | Now saves to | Functions to change | Supabase table |
|---|---|---|---|
| `sebis_assessment.py` | `results/<user>_<time>.json` | `save_result`, `get_latest_result`, `get_result_by_id` | `assessments` (kind = `sebis`) |
| `pmt_assessment.py` | `results_pmt/` | same three | `assessments` (kind = `pmt`) |
| `tpb_assessment.py` | `results_tpb/` | same three | `assessments` (kind = `tpb`) |
| `ttat_assessment.py` | `results_ttat/` | same three | `assessments` (kind = `ttat`) |
| `training.py` | `results_training/<user>_progress.json` | `load_progress`, `save_progress` | `training_progress` |

Also `training_drill.py` -> `process_all()` (about line 553) lists all progress files for the timer: change it to `select data from training_progress`.

## Tables (simplest that works)
- `assessments(id text primary key, user_id uuid, kind text, answers jsonb, profile jsonb, created_at timestamptz default now())`
- `training_progress(user_id uuid primary key, data jsonb, updated_at timestamptz default now())` - `data` is the same JSON the file holds today (plans, quiz attempts, chat log, consent, contact, simulated messages, evaluations, background, focus theory). One row per user; no other file changes.
- Optional later (analytics for the panel): split `data` into `chat_messages`, `simulated_messages`, `evaluations`.

## Login
Supabase Auth belongs to the login screen (Gull e Zahra). The user id from `session.user.id` is the `user_id` used everywhere (assessments, chatbot, progress). The app sends it as `userId`.

## Keys
- Backend `.env`: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (service role). Never in the app, never on GitHub.
- App: only the public anon key, only for login.
- Turn on Row Level Security on both tables; the backend uses the service key and bypasses it.

## Order of work
1. Create the two tables. 2. Change `training.py` load/save (one place, the chatbot data). 3. Change the four assessment files. 4. Change `process_all()`. 5. Run the same tests: create user, three assessments, chat, quiz, consent.
