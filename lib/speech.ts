/**
 * Text-to-Speech wrapper using browser Web Speech API (speechSynthesis)
 */

class SpeechHelper {
  private isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  public stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  }

  public speak(text: string, onEnd?: () => void): void {
    if (!this.isSupported() || !text) {
      if (onEnd) onEnd();
      return;
    }

    try {
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // slightly slower, calm pace for Alzheimer's clarity
      utterance.pitch = 1.0;

      // Select gentle voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Natural") ||
            v.name.includes("Samantha") ||
            v.name.includes("Google") ||
            v.name.includes("Daniel"))
      );
      if (preferred) {
        utterance.voice = preferred;
      }

      if (onEnd) {
        utterance.onend = () => onEnd();
        utterance.onerror = () => onEnd();
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
      if (onEnd) onEnd();
    }
  }
}

export const speech = new SpeechHelper();

