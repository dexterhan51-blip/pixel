let Haptics = null;

try {
  const cap = await import('@capacitor/haptics');
  Haptics = cap.Haptics;
} catch {
  // Web fallback - no-op
}

export function hapticsLight() {
  Haptics?.impact({ style: 'light' }).catch(() => {});
}

export function hapticsMedium() {
  Haptics?.impact({ style: 'medium' }).catch(() => {});
}

export function hapticsHeavy() {
  Haptics?.impact({ style: 'heavy' }).catch(() => {});
}

export function hapticsNotification(type = 'success') {
  Haptics?.notification({ type }).catch(() => {});
}
