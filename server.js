const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8003;

app.use(cors());
app.use(bodyParser.json());

// Serve static static game files
app.use(express.static(__dirname));

// DB setup
const DB_FILE = path.join(__dirname, 'leaderboard.json');

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// Get Top 10
app.get('/api/leaderboard', (req, res) => {
    try {
        const raw = fs.readFileSync(DB_FILE);
        let data = JSON.parse(raw);
        // Sort descending by revenue and send top 10
        data.sort((a, b) => b.revenue - a.revenue);
        res.json(data.slice(0, 10));
    } catch (e) {
        res.status(500).json({ error: 'Failed to read leaderboard' });
    }
});

// Submit Score
app.post('/api/leaderboard', (req, res) => {
    try {
        const { name, revenue, day } = req.body;
        if (!name || revenue === undefined) {
            return res.status(400).json({ error: 'Invalid payload' });
        }
        
        const raw = fs.readFileSync(DB_FILE);
        let data = JSON.parse(raw);
        
        // Find existing player
        let existing = data.find(d => d.name === name);
        if (existing) {
            // Only update if revenue is higher
            if (revenue > existing.revenue) {
                 existing.revenue = revenue;
                 existing.day = Math.max(existing.day, day);
            }
        } else {
            data.push({ name, revenue, day: day || 1, date: new Date().toISOString() });
        }
        
        // Save
        fs.writeFileSync(DB_FILE, JSON.stringify(data));
        res.json({ success: true });
        
    } catch(e) {
        res.status(500).json({ error: 'Failed to save score' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Leaderboard API active at /api/leaderboard`);
});
