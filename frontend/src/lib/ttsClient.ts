export async function speakText(text: string, opts: { voiceId?: string, speed?: number, volume?: number, format?: 'mp3'|'wav', useFallback?: boolean, onAudioCreated?: (audio: HTMLAudioElement) => void } = {}) {
  if (!text?.trim()) return;

  try {
    const r = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, ...opts })
    });
    if (!r.ok) {
      const e = await r.json().catch(()=>({}));
      throw new Error(e?.error || 'TTS request failed');
    }
    const data = await r.json();

    let blob: Blob;
    if (data.url) {
      const fr = await fetch(data.url);
      blob = await fr.blob();
    } else if (data.base64) {
      const b = Uint8Array.from(atob(data.base64), c => c.charCodeAt(0));
      blob = new Blob([b], { type: data.contentType || 'audio/mpeg' });
    } else {
      throw new Error('No audio returned');
    }

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    
    // Call the callback if provided
    if (opts.onAudioCreated) {
      opts.onAudioCreated(audio);
    }
    
    await audio.play();
    return true;
  } catch (error) {
    console.warn('Fish Audio TTS failed:', error);
    if (opts.useFallback !== false) {
      console.log('Falling back to browser speech synthesis...');
      return speakWithBrowserTTS(text);
    } else {
      throw error;
    }
  }
}

function speakWithBrowserTTS(text: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Browser speech synthesis not supported'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    const selectVoice = () => {
      const voices = speechSynthesis.getVoices();
      console.log('All available voices:', voices.map(v => `${v.name} (${v.lang})`));
      
      const customVoice = voices.find(voice => 
        voice.name.toLowerCase() === 'cmk'
      ) || voices.find(voice => 
        voice.name.toLowerCase().includes('cmk')
      ) || voices.find(voice => 
        voice.name.toLowerCase() === 'cmk voice'
      ) || voices.find(voice => 
        voice.name.toLowerCase().includes('cmk voice')
      );

      if (customVoice) {
        utterance.voice = customVoice;
        console.log('✅ Using custom voice:', customVoice.name, `(${customVoice.lang})`);
      } else {
        console.log('❌ Custom "Cmk" voice not found. Looking for similar names...');
        const similarVoices = voices.filter(voice => 
          voice.name.toLowerCase().includes('c') || 
          voice.name.toLowerCase().includes('m') || 
          voice.name.toLowerCase().includes('k')
        );
        if (similarVoices.length > 0) {
          console.log('Similar voice names found:', similarVoices.map(v => v.name));
        }
        
        const americanFemaleVoice = voices.find(voice => 
          voice.lang.startsWith('en-US') && 
          voice.name.toLowerCase().includes('female')
        ) || voices.find(voice => 
          voice.lang.startsWith('en-US') && 
          (voice.name.toLowerCase().includes('samantha') || 
           voice.name.toLowerCase().includes('karen') ||
           voice.name.toLowerCase().includes('susan') ||
           voice.name.toLowerCase().includes('zira'))
        ) || voices.find(voice => 
          voice.lang.startsWith('en-US')
        );

        if (americanFemaleVoice) {
          utterance.voice = americanFemaleVoice;
          console.log('Using fallback voice:', americanFemaleVoice.name);
        }
      }
    };

    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.addEventListener('voiceschanged', selectVoice, { once: true });
    } else {
      selectVoice();
    }

    utterance.onend = () => resolve(true);
    utterance.onerror = (event) => reject(new Error(`Speech synthesis failed: ${event.error}`));
    
    speechSynthesis.speak(utterance);
  });
}
