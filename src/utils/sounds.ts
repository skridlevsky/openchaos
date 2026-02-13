// Windows 98-style sound effects using Web Audio API + Real audio files

class SoundPlayer {
  private audioContext: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Play audio file helper - returns the Audio element so callers can listen for 'ended'
  private playAudioFile(url: string, volume: number = 0.5): HTMLAudioElement | null {
    try {
      const audio = new Audio(url);
      audio.volume = volume;
      audio.play().catch(e => console.log('Audio playback failed:', e));
      return audio;
    } catch (e) {
      console.log('Audio playback failed:', e);
      return null;
    }
  }

  // Success sound - Windows 98 "ding" style
  playSuccess() {
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.log('Sound playback failed:', e);
    }
  }

  // Error sound - Windows 98 error beep
  playError() {
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.log('Sound playback failed:', e);
    }
  }

  // Upvote sound - ascending chirp
  playUpvote() {
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.15);

      gainNode.gain.setValueAtTime(0.45, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.log('Sound playback failed:', e);
    }
  }

  // Downvote sound - descending chirp
  playDownvote() {
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(900, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);

      gainNode.gain.setValueAtTime(0.45, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.log('Sound playback failed:', e);
    }
  }

  // Milestone celebration sound - triumphant chord
  playMilestone() {
    try {
      const ctx = this.getContext();
      const frequencies = [523.25, 659.25, 783.99]; // C, E, G chord

      frequencies.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.35, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

        oscillator.start(ctx.currentTime + i * 0.05);
        oscillator.stop(ctx.currentTime + 0.8);
      });
    } catch (e) {
      console.log('Sound playback failed:', e);
    }
  }

  // Windows XP shutdown sound - local file
  playShutdown() {
    this.playAudioFile('/sounds/xp-shutdown.mp3', 0.7);
  }

  // Dialup modem sound - THE REAL 56K MODEM! (Public Domain)
  playDialup() {
    try {
      const audio = new Audio('/sounds/dialup.ogg');
      audio.volume = 0.6;
      audio.loop = false;
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(e => console.log('Dialup playback failed:', e));
      }
      return audio;
    } catch (e) {
      console.log('Dialup playback failed:', e);
      return null;
    }
  }

  // Windows XP startup sound - local file. Returns Audio element for 'ended' event.
  playStartup(): HTMLAudioElement | null {
    return this.playAudioFile('/sounds/xp-startup.mp3', 0.7);
  }
}

export const soundPlayer = new SoundPlayer();
