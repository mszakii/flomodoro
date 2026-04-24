export const playSound = (type: 'chime' | 'ding') => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (type === 'chime') {
      // A gentle, pleasant chime for session complete
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc1.type = 'sine';
      osc2.type = 'triangle';
      
      // E5 and Ab5 for a dreamy major third
      osc1.frequency.setValueAtTime(659.25, audioCtx.currentTime); 
      osc2.frequency.setValueAtTime(830.61, audioCtx.currentTime);
      
      // Soft attack & long dreamy decay
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3.0);
      
      osc1.start(audioCtx.currentTime);
      osc2.start(audioCtx.currentTime);
      osc1.stop(audioCtx.currentTime + 3.0);
      osc2.stop(audioCtx.currentTime + 3.0);
      
    } else if (type === 'ding') {
      // A crisp, satisfying ding for task complete
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.type = 'sine';
      
      // A slightly higher, sharp pitch (C6)
      osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime);
      
      // Fast attack & quick decay
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.5);
    }
  } catch (e) {
    console.warn("Audio context failed or blocked", e);
  }
};
