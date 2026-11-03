// Display names/icons for the 4 SeBIS areas, and which question belongs to which area.
// Labels only - ALL scoring is done by the backend.
export const SUBSCALES = {
  device_securement: { label: 'Device Securement', icon: 'phone-portrait-outline' },
  password_generation: { label: 'Password Generation', icon: 'key-outline' },
  proactive_awareness: { label: 'Proactive Awareness', icon: 'eye-outline' },
  updating: { label: 'Staying Up-to-Date', icon: 'refresh-outline' },
};

export const ITEM_SUBSCALE = {
  F3: 'device_securement', F4: 'device_securement', F5: 'device_securement', F6: 'device_securement',
  F12: 'password_generation', F13: 'password_generation', F14: 'password_generation', F15: 'password_generation',
  F7: 'proactive_awareness', F8: 'proactive_awareness', F10: 'proactive_awareness', F11: 'proactive_awareness', F16: 'proactive_awareness',
  F1: 'updating', F2: 'updating', F9: 'updating',
};
