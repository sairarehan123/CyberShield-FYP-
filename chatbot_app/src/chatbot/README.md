# Chatbot module (self-contained) - v3 "Aegis"

Everything the training chatbot needs is in THIS folder. It imports nothing from the rest of the app.
Full guide: docs/CHATBOT_INTEGRATION.md

```js
import Chatbot from '../chatbot';
<Stack.Screen name="Chatbot" component={Chatbot} options={{ headerShown: false }} />
navigation.navigate('Chatbot', { userId, userName, assessmentRoute: 'SeBIS' });
```
Props (optional): `userId`, `userName`, `onExit`, `onTakeAssessment`. Settings: `config.js` (`ASSISTANT_NAME`, `API_URL`, `DEFAULT_USER_ID`).

Stages drawn: general (locked training, chat open) -> choose_theory -> learning -> quiz -> consent_required -> observing / coaching -> finished.
Files: ChatbotApp (container), useTrainingChat (state + calls), api.js, Splash/Home/Chat/Inbox views, TheoryCard, LockedCard, QuizCard, ConsentCard, Sheets, ChatParts, theme/ui/dates.
