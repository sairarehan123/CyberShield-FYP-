# Connecting the chatbot (Aegis) to the CyberShield app

For: Amna Zahood. From: Saira Rehan. The chatbot is a self-contained module. You add ONE folder, ONE route and ONE button. You do not need to build any chatbot UI.

## 1. What you get
- `src/chatbot/` - the whole chatbot UI (splash, home, chat, quiz, consent, inbox, theory picker). It imports nothing from the rest of the app and has its own theme, so it cannot clash with your screens.
- It talks to the backend (`/training/...`, see `docs/TRAINING_API.md`). The backend decides every stage; the UI only draws it.
- It needs no new npm packages beyond what Expo already has: `expo-linear-gradient`, `@expo/vector-icons`, `react-native-safe-area-context`, `@react-navigation/native`.

## 2. Add it in 3 steps
1. Copy the folder `chatbot_app/src/chatbot` into your app, so you have `frontend/src/chatbot/`.
2. Register it once in the navigator (where your other screens are):
   ```js
   import Chatbot from '../chatbot';
   <Stack.Screen name="Chatbot" component={Chatbot} options={{ headerShown: false }} />
   ```
3. Open it from the home-screen button:
   ```js
   navigation.navigate('Chatbot', {
     userId: currentUser.id,          // the SAME id you send to SeBIS / PMT / TPB / TTAT
     userName: currentUser.firstName, // only used for "Hey <name>"
     assessmentRoute: 'SeBIS',        // name of YOUR assessment screen (see section 3)
   });
   ```

## 3. The assessment flow (what every new user sees)
Every user can open the chatbot at any time. The chatbot reads the user's state from the backend:

| User state | What the chatbot does |
|---|---|
| No assessment / only some done | General chat is open (cybersecurity and app questions). Training, quiz and e-mails are locked. A card lists what is still missing and has a **Take my assessment** button. |
| SeBIS, PMT, TPB, TTAT all done | The user chooses which theory (PMT / TPB / TTAT) the training is based on. |
| Theory chosen | Personal training, quiz, consent, simulated messages, progress. |

The button needs to open your assessment screens. Two ways (use one):
- `assessmentRoute: 'YourScreenName'` in the navigate params (the module calls `navigation.navigate(assessmentRoute)`), or
- `<Chatbot onTakeAssessment={() => ...} />` if you render it yourself.

When the user comes back from the assessment screens the chatbot reloads by itself (it listens to the navigation `focus` event) and unlocks. Your SeBIS / PMT / TPB / TTAT screens must send their scores to the backend with the same `user_id` (`POST /assessment/<name>/score`) - that is what unlocks the chatbot.

Order the supervisor asked for: SeBIS, then PMT, TPB, TTAT, then the user picks the theory for the training. If you want to unlock after fewer assessments, change `TRAINING_REQUIRED_THEORIES` in `backend/.env` (e.g. `sebis,pmt`). No app change needed.

## 3b. Notification screen (new)
When a simulated email / message arrives, the user gets a notification. Put the chatbot's notifications on your existing notification screen with one component:
```js
import { ChatbotNotificationList } from '../chatbot';

<ChatbotNotificationList
  userId={user.id}
  userName={user.firstName}
  navigation={navigation}
  assessmentRoute="SeBIS"
/>
```
- It loads and refreshes itself every 20 seconds. Unread rows are highlighted.
- Tapping a row marks it read and opens the chatbot on the right screen (inbox for a message, chat for a result). It navigates to the route named `Chatbot`; use `chatbotRoute="..."` if yours has another name, or `onOpen={(note) => ...}` to do it yourself.
- Want a red badge number? `const { unread } = useChatbotNotifications(user.id);` (same import).
- Opening the chatbot straight on a screen: `navigation.navigate('Chatbot', { userId, initialView: 'inbox' })` (`'inbox'` or `'chat'`).
- Notification texts never say if a message is phishing, and never show when the next one comes.
- The same simulated email also reaches the user's real email inbox (backend sends it). Phone push needs a development build; Expo Go on Android cannot receive it.

## 4. Settings: `src/chatbot/config.js`
- `API_URL` - the backend address the PHONE can reach, e.g. `http://192.168.18.142:8000` (computer IP from `ipconfig`). Put the same address you use for the rest of the app. If your app already has a base URL, copy it here.
- `ASSISTANT_NAME` (now "Aegis") and `ASSISTANT_TAGLINE` - change the name in one place.
- `DEFAULT_USER_ID` - test only; the real user id comes from `navigate` params.

## 5. What the module needs from you
- A logged-in user id (from Gull e Zahra's login). Pass it as `userId`. If you later use Supabase Auth, pass `session.user.id`.
- Backend started with `python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000` and Windows Firewall open for port 8000.
- Optional, once after login: send the e-mail / push token so simulated messages reach the user when the app is closed:
  `POST /training/{id}/contact` `{ "email": "...", "push_token": "..." }` (the chatbot also asks for the e-mail on its consent card).

## 6. Rules that must not be broken
- Do not open links inside simulated messages. The module only displays them; tapping reports a click to the backend.
- Do not add a countdown or "a test is coming" text anywhere. Users must not know when tests arrive.
- Do not copy quiz answers or stage logic into the app. The backend owns them.
- Do not import anything from `src/chatbot` internals other than the default export.

## 7. Quick test checklist
1. New user id (never used): open the chatbot -> locked card + chat answers "what is phishing?" with a follow-up question and 3 suggestion chips.
2. Ask "best pizza?" -> polite refusal.
3. Tap a quiz / inbox tile -> shown as locked.
4. Finish all 4 assessments for that user -> back in the chatbot -> "Choose your focus" card.
5. Pick a theory -> plan appears, "based on <theory>". Tap "Change theory" -> plan is rewritten.
6. "I'm ready for the quiz" -> pass 4/5 -> consent -> inbox opens later.

## 8. If something goes wrong
| Message | Fix |
|---|---|
| "Could not reach the server at http://..." | backend not running / not on `--host 0.0.0.0` / firewall / wrong `API_URL` / phone on other WiFi. Open `http://<ip>:8000/docs` in the phone browser to test. |
| Locked even after the assessments | the assessments were saved with a different `user_id`, or not all four were sent. Check `GET /training/{id}/chat` -> `missing_assessments`. |
| Ionicons font error | run `npx expo install --check` and restart with `npx expo start -c`. |
| Chat says "coach could not answer" | AI key missing or Groq down (backend returns 503). Check `GROQ_API_KEY` in `backend/.env`. |

## 9. Supabase (later)
No change in the app. All storage is in the backend; see `docs/SUPABASE_PLAN.md`.
