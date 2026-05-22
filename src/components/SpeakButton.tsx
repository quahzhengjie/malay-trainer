import { canSpeak, speak } from '../lib/speech';
import { SpeakerIcon } from './icons';

/** A small button that reads a Malay phrase aloud. Renders nothing if unsupported. */
export function SpeakButton({ text }: { text: string }) {
  if (!canSpeak()) return null;
  return (
    <button
      type="button"
      className="icon-btn speak-btn"
      onClick={() => speak(text)}
      aria-label={`Hear it pronounced: ${text}`}
      title="Hear it"
    >
      <SpeakerIcon size={16} />
    </button>
  );
}
