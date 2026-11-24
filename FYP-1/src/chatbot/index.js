// Everything the host app needs from the chatbot module:
//   import Chatbot from './src/chatbot';
//   <Stack.Screen name="Chatbot" component={Chatbot} />
//   navigation.navigate('Chatbot', { userId, userName })
export { default } from './ChatbotApp';
export { default as Chatbot } from './ChatbotApp';

// For the host app's notification screen (see notifications.js):
export { ChatbotNotificationList, useChatbotNotifications } from './notifications';
export { getNotifications as getChatbotNotifications, markNotificationsRead as markChatbotNotificationsRead } from './api';
