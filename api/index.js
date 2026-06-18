const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 🛠️ ដំណោះស្រាយបញ្ហា PayloadTooLargeError: បើកឱ្យទទួលទិន្នន័យ Base64 បានទំហំរហូតដល់ 10MB
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const mongoURI = process.env.MONGOURL;

/**
 * ⚡ មុខងារតភ្ជាប់ MongoDB តាមបែប Cached Connection (ល្បឿនលឿនបំផុតសម្រាប់ Vercel Serverless)
 * វាជួយកាត់បន្ថយពេលវេលាភ្ជាប់ដដែលៗ និងទប់ស្កាត់បញ្ហា Timeout ពេលផ្ញើរូបភាពធំ
 */
let cachedConnection = null;

async function connectToDatabase() {
    // បើមានការភ្ជាប់ចាស់ដែលកំពុងរត់រួចហើយ គឺយកមកប្រើភ្លាម មិនចាំបាច់ភ្ជាប់ថ្មីទេ
    if (cachedConnection && mongoose.connection.readyState === 1) {
        return cachedConnection;
    }

    if (!mongoURI) {
        throw new Error("process.env.MONGOURL is undefined! សូមពិនិត្យមើល Environment Variables ក្នុង Vercel ច្បាស់ៗបង។");
    }

    // កំណត់ Configuration ពិសេសសម្រាប់រត់លើ Cloud Serverless
    cachedConnection = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000, // ទុកពេល 5 វិនាទីក្នុងការស្វែងរក Server
        connectTimeoutMS: 10000,         // ទុកពេល 10 វិនាទីក្នុងការបង្កើតការតភ្ជាប់ដំបូង
    });
    
    return cachedConnection;
}

// ==========================================
// 🗂️ DATABASE SCHEMAS & MODELS (បែងចែកដាច់ពីគ្នា មិនឡូកឡំ)
// ==========================================
const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchema, 'users');

const PageTrackSchema = new mongoose.Schema({
    pageName: { type: String, required: true, unique: true },
    views: { type: Number, default: 0 }
});
const PageTrack = mongoose.model('PageTrack', PageTrackSchema, 'pagetracks');

const ImageSchema = new mongoose.Schema({
    base64Data: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const ImageModel = mongoose.model('Image', ImageSchema, 'images');

// ==========================================
// 📡 SYSTEM API ROUTERS & ENDPOINTS
// ==========================================

/**
 * 📡 ROUTE 1: POST /api/upload-image
 * សម្រាប់ផ្ទុករូបភាព Base64 ទៅកាន់ Cloud MongoDB (Collection: images)
 */
app.post('/api/upload-image', async (req, res) => {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "សូមបញ្ជូនទិន្នន័យរូបភាពមកផងបង!" });

    try {
        // ធានាថាបានភ្ជាប់ទៅ Database រួចរាល់មុននឹងចាប់ផ្តើមបញ្ជូនរូបភាពទៅ Save
        await connectToDatabase();

        const newImage = new ImageModel({ base64Data: image });
        const savedData = await newImage.save();
        
        // បោះតែ ID ទៅឱ្យ Frontend បានហើយ ដើម្បីកុំឱ្យលីងវែងពេក
        return res.status(200).json({ success: true, id: savedData._id });
    } catch (error) {
        console.error("❌ Post Image Error:", error);
        return res.status(500).json({ error: "MongoDB Error: " + error.message });
    }
});

/**
 * 📡 ROUTE 2: GET /api/get-image/:id
 * សម្រាប់ទាញយករូបភាពពី Database មកបង្ហាញនៅលើ Frontend វិញតាមរយៈ ID
 */
app.get('/api/get-image/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await connectToDatabase();
        
        const imageData = await ImageModel.findById(id);
        if (!imageData) return res.status(404).json({ error: "រកមិនឃើញរូបភាពនេះឡើយបង!" });
        
        return res.status(200).json({ image: imageData.base64Data });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * 📡 ROUTE 3: POST /api/track-page
 */
app.post('/api/track-page', async (req, res) => {
    const { pageName } = req.body;
    if (!pageName) return res.status(400).json({ error: "Missing pageName parameter" });

    try {
        await connectToDatabase();
        const updatedPage = await PageTrack.findOneAndUpdate(
            { pageName: pageName },
            { $inc: { views: 1 } },
            { uppercase: true, new: true, upsert: true }
        );
        return res.status(200).json({ success: true, data: updatedPage });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * 📡 ROUTE 4: GET /api/usercount
 */
app.get('/api/usercount', async (req, res) => {
    try {
        await connectToDatabase();
        
        const totalUsers = await User.countDocuments({});
        const topPages = await PageTrack.find({}).sort({ views: -1 }).limit(5);

        const acceptHeader = req.headers.accept || '';
        if (acceptHeader.includes('text/html') && !req.headers['user-agent']?.includes('Kustom')) {
            res.setHeader('Content-Type', 'text/html');
            return res.status(200).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8"><title>Amertak Tools - Dashboard</title>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-[#0f172a] text-slate-200 p-6 flex items-center justify-center min-h-screen">
                <div class="max-w-md w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl text-center space-y-4">
                    <h1 class="text-xl font-bold text-teal-400">AMERTAK TOOLS ANALYTICS</h1>
                    <div class="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <span class="text-xs text-slate-400 uppercase tracking-wider block mb-1">Total Users</span>
                        <span class="text-3xl font-bold text-white">${totalUsers}</span>
                    </div>
                    <p class="text-xs text-emerald-400 font-semibold">⚡ Active Connection: Cached & Connected Successfully</p>
                </div>
            </body>
            </html>`);
        } else {
            return res.status(200).json({ count: totalUsers, topPages: topPages });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.get('/api', (req, res) => { res.redirect('/api/usercount'); });

module.exports = app;
