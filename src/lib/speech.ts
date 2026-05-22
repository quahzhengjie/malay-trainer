// Pronunciation via the browser's built-in speech synthesis — free, no audio assets.
// Malay (ms) is phonetically regular; where no Malay voice exists, Indonesian (id)
// is a very close fallback.

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speak(text: string): void {
  if (!canSpeak() || !text) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ms-MY';
    utterance.rate = 0.9;
    const voice = window.speechSynthesis
      .getVoices()
      .find((v) => /^(ms|id)\b/i.test(v.lang));
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  } catch {
    // speech synthesis unavailable — silently no-op
  }
}
