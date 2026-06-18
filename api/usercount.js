const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ភ្ជាប់ទៅកាន់ MongoDB
const mongoURI = process.env.MONGOURI;
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// បង្កើត Schema សម្រាប់កត់ត្រាចំនួន User
const CounterSchema = new mongoose.Schema({
    id: { type: String, default: "user_counter" },
    count: { type: Number, default: 0 }
});
const Counter = mongoose.model('Counter', CounterSchema);

// 1. API សម្រាប់ហៅពេល User ធ្វើការ Login (បង្កើនចំនួន +1)
app.post('/api/login', async (req, res) => {
    try {
        let counter = await Counter.findOne({ id: "user_counter" });
        if (!counter) {
            counter = new Counter({ id: "user_counter", count: 1 });
        } else {
            counter.count += 1;
        }
        await counter.save();
        res.json({ success: true, message: "Login counted", currentCount: counter.count });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. API សម្រាប់ឱ្យ KWGT ទាញយកចំនួនទៅបង្ហាញ (GET Method)
app.get('/api/usercount', async (req, res) => {
    try {
        const counter = await Counter.findOne({ id: "user_counter" });
        const total = counter ? counter.count : 0;
        
        // សម្រាប់ KWGT ងាយស្រួលអាន បងអាចឱ្យវា Return ជា JSON 
        res.json({ count: total });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ដំណើរការ Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
