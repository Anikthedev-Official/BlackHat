import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import WebSocket from 'ws';

global.WebSocket = WebSocket;
const app = express();
const PORT = 7860; 

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Keep this for uploads

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 1. Health Check
app.get('/', (req, res) => res.json({ ok: true, message: "BlackHat Streamer Ready" }));

// 2. GET ALL (Metadata only - very fast)
app.get('/games', async (req, res) => {
    const { data, error } = await supabase.from('games').select('id, title, author, category, type, url, engine, downloads, created_at').order('created_at', { ascending: false });
    res.json({ ok: true, games: data || [] });
});

// 3. THE STREAMER (This fixes the black screen)
app.get('/games/file/:id', async (req, res) => {
    try {
        const { data, error } = await supabase.from('games').select('swf, type, url').eq('id', req.params.id).single();
        if (error || !data) return res.status(404).send("Not found");

        if (data.type === 'swf' && data.swf) {
            // Convert Base64 string to a real binary file
            const fileBuffer = Buffer.from(data.swf, 'base64');
            res.setHeader('Content-Type', 'application/x-shockwave-flash');
            res.setHeader('Content-Length', fileBuffer.length);
            res.setHeader('Access-Control-Allow-Origin', '*');
            return res.send(fileBuffer); // Send as a real file
        } else {
            return res.redirect(data.url);
        }
    } catch (e) {
        res.status(500).send("Stream Error");
    }
});

// 4. SUBMIT
app.post('/games/submit', async (req, res) => {
    const { title, author, category, type, swf_url, url, engine } = req.body;
    const { error } = await supabase.from('games').insert([{
        id: crypto.randomUUID(),
        title, author, category, type,
        swf: swf_url, 
        url: type === 'url' ? url : null,
        engine: engine || 'v2026'
    }]);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true });
});

// 5. GET DETAILS (For info panels)
app.get('/games/:id', async (req, res) => {
    const { data, error } = await supabase.from('games').select('id, title, author, category, engine, downloads').eq('id', req.params.id).single();
    if (data) await supabase.from('games').update({ downloads: (data.downloads || 0) + 1 }).eq('id', req.params.id);
    res.json({ ok: true, game: data });
});

app.listen(PORT, "0.0.0.0");