import axios from 'axios';
import type { MusicParameters } from '../services/musicGenerationService';

export interface MusicGenerationResponse {
  audioUrl: string | null;
  prompt: string;
  duration: number;
  mock?: boolean;
  message?: string;
}

export interface MusicGenerationError {
  error: string;
  detail?: string;
}

/**
 * Client for AI music generation API
 */
export class MusicClient {
  private static readonly API_ENDPOINT = '/api/generate-music';
  private static currentAudio: HTMLAudioElement | null = null;
  private static isGenerating: boolean = false;

  /**
   * Generate music based on environmental parameters
   */
  static async generateMusic(
    params: MusicParameters,
    onProgress?: (message: string) => void
  ): Promise<MusicGenerationResponse> {
    if (this.isGenerating) {
      throw new Error('Music generation already in progress');
    }

    this.isGenerating = true;

    try {
      onProgress?.('Analyzing environmental data...');

      // Use the detailed prompt from music parameters
      const payload = {
        prompt: params.prompt,
        duration: params.duration
      };

      onProgress?.('Generating music with AI...');

      const response = await axios.post<MusicGenerationResponse>(
        this.API_ENDPOINT,
        payload,
        {
          timeout: 180000 // 3 minutes timeout
        }
      );

      if (response.data.mock) {
        onProgress?.('Mock mode: API key not configured');
        // For development/demo, you could return a placeholder or use local audio
        console.warn(response.data.message);
      } else {
        onProgress?.('Music generated successfully!');
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as MusicGenerationError;
        throw new Error(errorData?.error || 'Music generation failed');
      }
      throw error;
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Play generated music
   */
  static async playMusic(audioUrl: string): Promise<void> {
    // Stop any currently playing music
    this.stopMusic();

    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);

      audio.addEventListener('canplaythrough', () => {
        audio.play()
          .then(() => {
            this.currentAudio = audio;
            resolve();
          })
          .catch(reject);
      });

      audio.addEventListener('error', () => {
        reject(new Error('Failed to load audio'));
      });

      audio.addEventListener('ended', () => {
        this.currentAudio = null;
      });

      // Preload the audio
      audio.load();
    });
  }

  /**
   * Stop currently playing music
   */
  static stopMusic(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  /**
   * Check if music is currently playing
   */
  static isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  /**
   * Check if generation is in progress
   */
  static isGeneratingMusic(): boolean {
    return this.isGenerating;
  }

  /**
   * Get current audio element for advanced controls
   */
  static getCurrentAudio(): HTMLAudioElement | null {
    return this.currentAudio;
  }
}
