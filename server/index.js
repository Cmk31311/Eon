import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceId, speed = 1.0, volume = 0, format = 'mp3' } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    if (!process.env.FISH_API_KEY) return res.status(500).json({ error: 'Missing FISH_API_KEY' });

    const endpoint = process.env.FISH_TTS_ENDPOINT || 'https://api.fish.audio/v1/tts';
    const payload = {
      text,
      voice_id: voiceId || process.env.FISH_VOICE_ID || undefined,
      speed,
      volume,
      format
    };

    const r = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FISH_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const errText = await r.text().catch(() => '');
      return res.status(r.status).json({ error: 'Fish TTS request failed', detail: errText });
    }

    const ct = r.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const data = await r.json();
      const maybeUrl = data?.data?.url || data?.url || data?.download_link;
      const maybeB64 = data?.data?.audio_base64 || data?.audio_base64;
      if (maybeUrl) return res.json({ url: maybeUrl });
      if (maybeB64) return res.json({ base64: maybeB64, contentType: `audio/${format}` });
      return res.status(500).json({ error: 'Unexpected Fish TTS JSON response', data });
    } else {
      const buf = Buffer.from(await r.arrayBuffer());
      const b64 = buf.toString('base64');
      return res.json({ base64: b64, contentType: ct || `audio/${format}` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'TTS proxy failed', detail: String(err) });
  }
});

// Music generation endpoint using Replicate API
app.post('/api/generate-music', async (req, res) => {
  try {
    const { prompt, duration = 8 } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    // Check for Replicate API key
    if (!process.env.REPLICATE_API_TOKEN) {
      // Fallback: Return a sample/mock response for development
      console.warn('REPLICATE_API_TOKEN not set, returning mock response');
      return res.json({
        audioUrl: null,
        mock: true,
        message: 'Music generation requires REPLICATE_API_TOKEN. Set it in your .env file.',
        prompt: prompt
      });
    }

    // Call Replicate API for MusicGen
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`
      },
      body: JSON.stringify({
        version: 'stereo-melody-large', // MusicGen model version
        input: {
          prompt: prompt,
          duration: Math.min(duration, 30), // Cap at 30 seconds for performance
          model_version: 'stereo-melody-large',
          output_format: 'mp3',
          normalization_strategy: 'peak'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('Replicate API error:', errorText);
      return res.status(response.status).json({
        error: 'Music generation failed',
        detail: errorText
      });
    }

    const prediction = await response.json();

    // Replicate uses async processing, poll for result
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 60; // 60 attempts with 2s interval = 2 minutes max

    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${result.id}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`
          }
        }
      );

      if (!statusResponse.ok) break;
      result = await statusResponse.json();
      attempts++;
    }

    if (result.status === 'succeeded' && result.output) {
      return res.json({
        audioUrl: result.output,
        prompt: prompt,
        duration: duration
      });
    } else if (result.status === 'failed') {
      return res.status(500).json({
        error: 'Music generation failed',
        detail: result.error
      });
    } else {
      return res.status(408).json({
        error: 'Music generation timeout',
        detail: 'Generation took too long, please try again'
      });
    }

  } catch (err) {
    console.error('Music generation error:', err);
    res.status(500).json({
      error: 'Music generation failed',
      detail: String(err)
    });
  }
});

// Export for Vercel
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}
