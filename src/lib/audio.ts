export function playBeep() {
  if (typeof window === 'undefined') return;

  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    
    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Volume envelope (fade in quickly, then fade out smoothly)
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    
    // Toca dois sons suaves em sequência (Dó e Sol, famoso Ding-Ding)
    playNote(523.25, now, 0.4);       // C5 (Dó)
    playNote(783.99, now + 0.15, 0.6); // G5 (Sol)
    
  } catch (error) {
    console.error("Audio playback failed", error);
  }
}
