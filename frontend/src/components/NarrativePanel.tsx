import React, { useState, useRef } from 'react';
import { speakText } from '../lib/ttsClient';
import { MusicClient } from '../lib/musicClient';
import { MusicGenerationService } from '../services/musicGenerationService';
import type { EnvironmentalData } from '../services/environmentalDataService';

interface NarrativePanelProps {
  narrative: string;
  environmentalData?: EnvironmentalData;
}

export function NarrativePanel({ narrative, environmentalData }: NarrativePanelProps) {
  const [speaking, setSpeaking] = useState(false);
  const [generatingMusic, setGeneratingMusic] = useState(false);
  const [playingMusic, setPlayingMusic] = useState(false);
  const [musicProgress, setMusicProgress] = useState<string>('');
  const [lastGeneratedMusicUrl, setLastGeneratedMusicUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const disabled = !narrative?.trim();
  const musicDisabled = !environmentalData;

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

  const handleMusicGeneration = async () => {
    if (musicDisabled || !environmentalData) return;

    // If music is playing, stop it
    if (playingMusic) {
      MusicClient.stopMusic();
      setPlayingMusic(false);
      return;
    }

    // If we have a previously generated track, play it
    if (lastGeneratedMusicUrl && !generatingMusic) {
      try {
        await MusicClient.playMusic(lastGeneratedMusicUrl);
        setPlayingMusic(true);

        // Listen for music end
        const audio = MusicClient.getCurrentAudio();
        if (audio) {
          audio.onended = () => setPlayingMusic(false);
          audio.onerror = () => setPlayingMusic(false);
        }
      } catch (e) {
        console.error('Music playback error:', e);
        alert('Failed to play music. Please try generating again.');
        setLastGeneratedMusicUrl(null);
      }
      return;
    }

    // Generate new music
    setGeneratingMusic(true);
    setMusicProgress('Preparing...');

    try {
      // Generate music parameters from environmental data
      const musicParams = MusicGenerationService.generateMusicParameters(environmentalData);

      console.log('🎵 Music Parameters:', musicParams);
      console.log('🎵 Prompt:', musicParams.prompt);

      // Generate music
      const response = await MusicClient.generateMusic(
        musicParams,
        (progress) => setMusicProgress(progress)
      );

      if (response.mock) {
        // Mock mode - show message
        alert(`🎵 AI Music Generation Demo\n\n${response.message}\n\nMusic would be generated with:\n- Genre: ${musicParams.genre}\n- Mood: ${musicParams.mood}\n- Tempo: ${musicParams.tempo}\n\nTo enable, add REPLICATE_API_TOKEN to your .env file.`);
        setGeneratingMusic(false);
        setMusicProgress('');
        return;
      }

      if (response.audioUrl) {
        setLastGeneratedMusicUrl(response.audioUrl);
        setMusicProgress('Playing music...');

        // Auto-play the generated music
        await MusicClient.playMusic(response.audioUrl);
        setPlayingMusic(true);

        // Listen for music end
        const audio = MusicClient.getCurrentAudio();
        if (audio) {
          audio.onended = () => {
            setPlayingMusic(false);
            setMusicProgress('');
          };
          audio.onerror = () => {
            setPlayingMusic(false);
            setMusicProgress('');
          };
        }
      } else {
        alert('🎵 Music generation completed but no audio URL was returned. Please try again.');
      }

    } catch (e) {
      console.error('Music Generation Error:', e);
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';

      if (errorMessage.includes('timeout')) {
        alert('⏱️ Music Generation Timeout:\n\nThe music generation is taking longer than expected.\nPlease try again with a shorter duration.');
      } else if (errorMessage.includes('already in progress')) {
        alert('🎵 Music Generation In Progress:\n\nPlease wait for the current generation to complete.');
      } else {
        alert(`❌ Music Generation Failed:\n\n${errorMessage}\n\nPlease try again or check the console for details.`);
      }
    } finally {
      setGeneratingMusic(false);
      if (!playingMusic) {
        setMusicProgress('');
      }
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
      <div className="flex flex-col gap-3">
        {/* Speak Button */}
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

        {/* Music Generation Button */}
        <button
          type="button"
          aria-label="Generate environmental music"
          onClick={handleMusicGeneration}
          disabled={musicDisabled || generatingMusic}
          title={
            musicDisabled
              ? 'No environmental data available'
              : generatingMusic
              ? musicProgress
              : playingMusic
              ? 'Stop music'
              : lastGeneratedMusicUrl
              ? 'Play generated music'
              : 'Generate AI music from environmental data'
          }
          className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 text-sm font-medium group relative z-10 ${
            musicDisabled || generatingMusic
              ? 'border-gray-500/30 bg-gray-500/10 text-gray-500 cursor-not-allowed'
              : playingMusic
              ? 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/50'
              : lastGeneratedMusicUrl
              ? 'border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:border-green-500/50 hover:scale-105'
              : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:scale-105'
          }`}
        >
          <div className="relative">
            <span className="text-xl">
              {generatingMusic ? '⏳' : playingMusic ? '⏹️' : lastGeneratedMusicUrl ? '▶️' : '🎵'}
            </span>
            {!generatingMusic && !musicDisabled && !playingMusic && (
              <div className="absolute inset-0 text-xl animate-pulse opacity-50">
                {lastGeneratedMusicUrl ? '▶️' : '🎵'}
              </div>
            )}
            {generatingMusic && (
              <div className="absolute inset-0 animate-spin">⚙️</div>
            )}
          </div>
          <div className="flex flex-col items-start">
            <span className="font-semibold">
              {generatingMusic ? 'Generating' : playingMusic ? 'Stop' : lastGeneratedMusicUrl ? 'Play' : 'Generate Music'}
            </span>
            {musicProgress && (
              <span className="text-xs opacity-75">{musicProgress}</span>
            )}
          </div>
          {!musicDisabled && !generatingMusic && (
            <div className="w-2 h-2 bg-current rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
          )}
        </button>
      </div>
    </div>
  );
}
