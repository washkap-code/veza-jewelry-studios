const KEY = "veza:pw-updated-banner";

export function markPasswordUpdated() {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    // ignore
  }
}

export function consumePasswordUpdated(): boolean {
  try {
    const v = localStorage.getItem(KEY);
    if (v) localStorage.removeItem(KEY);
    return !!v;
  } catch {
    return false;
  }
}
