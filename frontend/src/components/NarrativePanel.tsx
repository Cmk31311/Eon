import React, { useState, useRef } from 'react';
import { speakText } from '../lib/ttsClient';

interface NarrativePanelProps {
  narrative: string;
}

export function NarrativePanel({ narrative }: NarrativePanelProps) {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const disabled = !narrative?.trim();

  const handleSpeak = async () => {
    if (disabled) return;
    
    if (speaking) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      // Stop browser speech synthesis
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
      setSpeaking(false);
      return;
    }

    setSpeaking(true);
    try {
      await speakText(narrative, { 
        voiceId: '062e70ee3ef24b0280b605cfcdf03be7',
        onAudioCreated: (audio: HTMLAudioElement) => {
          audioRef.current = audio;
          audio.onended = () => {
            audioRef.current = null;
            setSpeaking(false);
          };
          audio.onerror = () => {
            audioRef.current = null;
            setSpeaking(false);
          };
        }
      });
    } catch (e) {
      console.error('TTS Error:', e);
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      
      if (errorMessage.includes('API key invalid') || errorMessage.includes('no credit')) {
        alert('🔑 Fish Audio API Issue:\n\n• Your Fish Audio API key has no credits\n• Please add credits to your Fish Audio account\n• Your custom "Cmk" voice is ready to use!\n\nVisit: https://fish.audio to add credits');
      } else if (errorMessage.includes('Browser speech synthesis not supported')) {
        alert('🔊 Speech Not Supported:\n\n• Your browser doesn\'t support speech synthesis\n• Try using Chrome, Firefox, or Safari\n• Or copy the text to use another TTS service');
      } else if (errorMessage.includes('Speech synthesis failed')) {
        alert('🔊 Speech Synthesis Error:\n\n• Browser speech synthesis failed\n• Try refreshing the page\n• Or copy the text to use another TTS service');
      } else {
        alert(`❌ Narration Failed:\n\n${errorMessage}\n\nPlease try again or check the console for details.`);
      }
      setSpeaking(false);
    }
  };

  return (
    <div className="flex items-start gap-3">
      <div className="flex-1">
        <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
          {narrative}
        </p>
      </div>
      <button
        type="button"
        aria-label="Speak narrative"
        onClick={handleSpeak}
        disabled={disabled}
        title={disabled ? 'No text available' : (speaking ? 'Stop speaking' : 'Speak narrative')}
        className={`
          inline-flex items-center gap-2 px-3 py-2 rounded-lg border
          transition-all duration-200
          ${disabled 
            ? 'bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed' 
            : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 cursor-pointer'
          }
        `}
      >
        <span className="text-lg">
          {speaking ? '⏹️' : '🔈'}
        </span>
        <span className="text-sm font-medium">
          {speaking ? 'Stop' : 'Speak'}
        </span>
      </button>
    </div>
  );
}
