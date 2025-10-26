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
    <div className="flex items-start gap-4">
      <div className="flex-1">
        <div className="relative">
          <p className="text-gray-200 leading-relaxed text-lg whitespace-pre-wrap font-medium">
            {narrative}
          </p>
          {/* Decorative quote marks - positioned to not interfere with button */}
          <div className="absolute -top-2 -left-2 text-4xl text-purple-400/30 font-serif pointer-events-none">"</div>
          <div className="absolute -bottom-4 -right-2 text-4xl text-purple-400/30 font-serif pointer-events-none">"</div>
        </div>
      </div>
      <button
        type="button"
        aria-label="Speak narrative"
        onClick={handleSpeak}
        disabled={disabled}
        title={disabled ? 'No text available' : (speaking ? 'Stop speaking' : 'Speak narrative')}
        className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 text-sm font-medium group relative z-10 ${
          disabled 
            ? 'border-gray-500/30 bg-gray-500/10 text-gray-500 cursor-not-allowed' 
            : speaking
            ? 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/50'
            : 'border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/50 hover:scale-105'
        }`}
      >
        <div className="relative">
          <span className="text-xl">
            {speaking ? '⏹️' : '🔈'}
          </span>
          {!speaking && !disabled && (
            <div className="absolute inset-0 text-xl animate-pulse opacity-50">🔈</div>
          )}
        </div>
        <span className="font-semibold">
          {speaking ? 'Stop' : 'Speak'}
        </span>
        {!disabled && (
          <div className="w-2 h-2 bg-current rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
        )}
      </button>
    </div>
  );
}
