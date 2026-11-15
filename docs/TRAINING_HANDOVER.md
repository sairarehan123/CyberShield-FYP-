# Training chatbot - hand-over for the app (Amna)

Everything for the chatbot is self-contained: **8 new files, no existing file is replaced.**

```
src/screens/TrainingScreen.js
src/services/trainingApi.js
src/components/training/{ChatParts,QuizCard,ConsentCard,InboxView,Sheets}.js
```
No new packages (uses expo-linear-gradient, @expo/vector-icons, @react-navigation/native that are already installed).

## 3 things to connect
1. **Register the screen** in `AppNavigator.js`:
   `import TrainingScreen from '../screens/TrainingScreen';`
   `<Stack.Screen name="Training" component={TrainingScreen} options={{ gestureEnabled: false }} />`
2. **Button** on the Home screen: `navigation.navigate('Training', { userId: <logged-in user id> })`
   (the same id that was used for SeBIS/PMT/TPB/TTAT - the training is built from that user's results).
3. **Backend**: the training endpoints live in `backend/training*.py` + `main.py` (see `docs/TRAINING_API.md`).
   Needs `GROQ_API_KEY` and `GROQ_MODEL` in `backend/.env`. `EXPO_PUBLIC_API_URL` is the same as for the other screens.

## Test the chatbot alone (no assessment, no login)
In `frontend/.env` add:
```
EXPO_PUBLIC_TRAINING_USER=Saira
EXPO_PUBLIC_TRAINING_DEMO=true
```
then `npx expo start -c`. With DEMO=true the app opens straight on the Training screen. Remove both lines when done.

## Quick test timings (backend/.env)
```
DRILL_DELAY_MINUTES=0
DRILL_PERIOD_MINUTES=20
MESSAGE_WINDOW_MINUTES=8
```
Delete these three lines for the real timing (first message after 24 h, 4 messages over 7 days, each open 24 h).
