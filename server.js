const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 MongoDB Atlas Connection
mongoose.connect('mongodb+srv://rvishl322_db_user:YOUR_PASSWORD@cluster0.6i0cwqc.mongodb.net/voice_recordings?retryWrites=true&w=majority');

const AudioSchema = new mongoose.Schema({
    filename: String,
    size: Number,
    audio_data: Buffer,
    device_id: String,
    timestamp: { type: Date, default: Date.now }
});

const Audio = mongoose.model('Audio', AudioSchema);

// 📦 Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 🎯 Upload API
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        const audio = new Audio({
            filename: req.file.originalname,
            size: req.file.size,
            audio_data: req.file.buffer,
            device_id: req.body.device_id
        });

        await audio.save();

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📥 Get all audio
app.get('/api/audio', async (req, res) => {
    const data = await Audio.find().sort({ timestamp: -1 });
    res.json(data);
});

app.listen(3000, () => console.log("Server running"));