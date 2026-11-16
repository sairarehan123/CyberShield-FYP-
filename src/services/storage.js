/**
 * Storage adapter — currently IN-MEMORY ONLY (data is lost when the app is closed).
 * TO PERSIST ON DEVICE: `npx expo install @react-native-async-storage/async-storage`, then make
 * load/save/clear read and write JSON via AsyncStorage.
 * TO USE A BACKEND: replace these three functions with API calls. Nothing else needs to change.
 */
let memory = null;

export const storage = {
  async load() {
    return memory;
  },
  async save(state) {
    memory = state;
  },
  async clear() {
    memory = null;
  },
};
