const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 MongoDB Atlas Connection (FINAL FIXED)
mongoose.connect("mongodb+srv://rvishl322_db_user:9cFTksRn0Wrl5Hrn@cluster0.6i0cwqc.mongodb.net/voice_recordings?retryWrites=true&w=majority")
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ Mongo Error:", err));

// 📦 Schema
const AudioSchema = new mongoose.Schema({
    filename: String,
    size: Number,
    audio_data: Buffer,
    device_id: String,
    timestamp: { type: Date, default: Date.now }
});

const Audio = mongoose.model('Audio', AudioSchema);

// 📦 Multer setup (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 🧪 TEST ROUTE
app.get('/', (req, res) => {
    res.send("🚀 Server is running");
});

// 🎯 Upload API
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const audio = new Audio({
            filename: req.file.originalname,
            size: req.file.size,
            audio_data: req.file.buffer,
            device_id: req.body.device_id || "unknown"
        });

        await audio.save();

        res.json({ success: true, message: "File uploaded" });

    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 📥 Get all audio
app.get('/api/audio', async (req, res) => {
    try {
        const data = await Audio.find().sort({ timestamp: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📥 Get single audio (download)
app.get('/api/audio/:id', async (req, res) => {
    try {
        const audio = await Audio.findById(req.params.id);

        if (!audio) {
            return res.status(404).json({ error: "File not found" });
        }

        res.set({
            'Content-Type': 'audio/3gp',
            'Content-Disposition': `attachment; filename="${audio.filename}"`
        });

        res.send(audio.audio_data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔥 PORT FIX (Render compatible)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
