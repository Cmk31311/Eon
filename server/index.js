import 'dotenv/config';
import express from 'express';
import cors from 'cors';

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

// Export for Vercel
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}
