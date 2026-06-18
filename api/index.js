const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 🛠️ ដំណោះស្រាយបញ្ហា PayloadTooLargeError: បើកឱ្យទទួលទិន្នន័យ Base64 បានទំហំរហូតដល់ 10MB
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ទាញយកលីងភ្ជាប់ទៅកាន់ MongoDB ពី .env តាមរយៈ variable ឈ្មោះ MONGOURL
const mongoURI = process.env.MONGOURL;

if (mongoURI) {
    mongoose.connect(mongoURI)
      .then(() => console.log("✅ MongoDB Connected Successfully"))
      .catch(err => console.error("❌ MongoDB Connection Error:", err));
} else {
    console.error("❌ Critical: process.env.MONGOURL is undefined!");
}

// ==========================================
// 🗂️ DATABASE SCHEMAS & MODELS (បែងចែកដាច់ពីគ្នា មិនឡូកឡំ)
// ==========================================

// ១. សម្រាប់ទាញយកចំនួន User
const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchema, 'users');

// ២. សម្រាប់កត់ត្រា និងរាប់ចំនួនទំព័រដែលបានប្រើប្រាស់ (Analytics)
const PageTrackSchema = new mongoose.Schema({
    pageName: { type: String, required: true, unique: true },
    views: { type: Number, default: 0 }
});
const PageTrack = mongoose.model('PageTrack', PageTrackSchema, 'pagetracks');

// ៣. សម្រាប់ផ្ទុករូបភាព Base64 ទៅក្នុង Cloud MongoDB
const ImageSchema = new mongoose.Schema({
    base64Data: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const ImageModel = mongoose.model('Image', ImageSchema, 'images');


// ==========================================
// 🎨 UX/UI ANALYTICS DASHBOARD HTML TEMPLATE
// ==========================================
const renderDashboard = (req, totalUsers, topPages, isEnvMissing) => {
    const tableRows = topPages.map((p, index) => {
        let medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📄';
        return `
        <tr class="border-b border-slate-800 hover:bg-slate-800/30 transition">
            <td class="px-4 py-3 text-sm font-semibold text-slate-400">${medal} ${index + 1}</td>
            <td class="px-4 py-3 text-sm font-mono text-teal-300">${p.pageName}</td>
            <td class="px-4 py-3 text-sm font-bold text-right text-white">${p.views.toLocaleString()} ម្ដង</td>
        </tr>`;
    }).join('');

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Amertak Tools - Advanced Analytics Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
        <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
    </head>
    <body class="bg-[#0f172a] text-slate-200 min-h-screen flex flex-col justify-between">
        
        <header class="border-b border-slate-800 bg-[#1e293b]/50 backdrop-blur px-6 py-4">
            <div class="max-w-4xl mx-auto flex justify-between items-center">
                <h1 class="text-xl font-bold text-teal-400 tracking-wide">AMERTAK TOOLS <span class="text-xs bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-full font-normal">Ultimate v3.0</span></h1>
                <span class="flex items-center gap-2 text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                    <span class="h-2 w-2 rounded-full ${isEnvMissing ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 animate-pulse'}"></span> 
                    ${isEnvMissing ? 'Database Disconnected' : 'Live Engine Connected'}
                </span>
            </div>
        </header>

        <main class="max-w-4xl w-full mx-auto p-6 flex-grow space-y-6">
            
            ${isEnvMissing ? `
            <div class="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-4 text-sm">
                <span class="font-bold">⚠️ Environment Variable Missing:</span> Please configure <code class="bg-rose-950 px-1.5 py-0.5 rounded text-rose-300 font-mono text-xs">MONGOURL</code> in Vercel settings.
            </div>` : ''}

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 shadow-xl flex flex-col justify-between min-h-[140px]">
                    <div>
                        <h2 class="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Users</h2>
                        <p class="text-xs text-slate-500">គណនីចុះឈ្មោះសរុប</p>
                    </div>
                    <span class="text-4xl font-bold text-white tracking-tight mt-4">${totalUsers}</span>
                </div>

                <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-xl md:col-span-2 overflow-hidden">
                    <div class="px-5 py-3.5 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                        <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider">🔥 Top Pages Used</h3>
                        <span class="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-semibold">Real-time</span>
                    </div>
                    <div class="overflow-x-auto max-h-[180px]">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-950/40 text-slate-400 text-xs uppercase border-b border-slate-800">
                                    <th class="px-4 py-2 font-semibold">Rank</th>
                                    <th class="px-4 py-2 font-semibold">Page Route</th>
                                    <th class="px-4 py-2 font-semibold text-right">Total Hits</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows || '<tr><td colspan="3" class="text-center py-6 text-sm text-slate-500">មិនទាន់មានទិន្នន័យទំព័រនៅឡើយទេ</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="bg-indigo-950/10 border border-indigo-900/30 rounded-xl p-5 space-y-2">
                <h4 class="text-sm font-bold text-indigo-400 flex items-center gap-2">📂 Cloud Image Cloud Storage Status</h4>
                <p class="text-xs text-slate-400 leading-relaxed">
                    ប្រព័ន្ធ <code class="bg-slate-950 px-1 py-0.5 rounded text-teal-300">/api/upload-image</code> និង <code class="bg-slate-950 px-1 py-0.5 rounded text-teal-300">/api/get-image/:id</code> ត្រូវបានដំឡើងនិងបើកឱ្យដំណើរការរួចរាល់ ជាមួយទំហំផ្ទុកទិន្នន័យអតិបរមា 10MB ក្នុងមួយរូបភាព។
                </p>
            </div>
        </main>

        <footer class="border-t border-slate-800 text-center py-4 text-xs text-slate-500 bg-[#0b0f19]">
            <p>© 2026 Amertak Tools · Developed by Kin Thavrath</p>
        </footer>

    </body>
    </html>
    `;
};


// ==========================================
// 📡 SYSTEM API ROUTERS & ENDPOINTS
// ==========================================

/**
 * 📡 ROUTE 1: POST /api/upload-image (ថ្មី)
 * សម្រាប់ផ្ទុករូបភាព Base64 ទៅកាន់ Cloud MongoDB
 */
app.post('/api/upload-image', async (req, res) => {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "សូមបញ្ជូនទិន្នន័យរូបភាពមកផងបង!" });

    if (mongoose.connection.readyState !== 1) {
        return res.status(500).json({ error: "Database មិនទាន់ភ្ជាប់ជោគជ័យទេបង! សូមពិនិត្យ IP Whitelist ក្នុង MongoDB Atlas" });
    }

    try {
        const newImage = new ImageModel({ base64Data: image });
        const savedData = await newImage.save();
        return res.status(200).json({ success: true, id: savedData._id });
    } catch (error) {
        return res.status(500).json({ error: "MongoDB Error: " + error.message });
    }
});

/**
 * 📡 ROUTE 2: GET /api/get-image/:id (ថ្មី)
 * សម្រាប់ទាញយករូបភាពពិតប្រាកដត្រឡប់ទៅបង្ហាញនៅលើ Frontend វិញតាមរយៈ ID
 */
app.get('/api/get-image/:id', async (req, res) => {
    const { id } = req.params;
    if (mongoose.connection.readyState !== 1) {
        return res.status(500).json({ error: "Database មិនទាន់បានតភ្ជាប់ឡើយ!" });
    }

    try {
        const imageData = await ImageModel.findById(id);
        if (!imageData) return res.status(404).json({ error: "រកមិនឃើញរូបភាពនេះឡើយបង!" });
        return res.status(200).json({ image: imageData.base64Data });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * 📡 ROUTE 3: POST /api/track-page
 * សម្រាប់កត់ត្រាចំនួនទំព័រដែលត្រូវបានបើកមើលច្រើនជាងគេ
 */
app.post('/api/track-page', async (req, res) => {
    const { pageName } = req.body;
    if (!pageName) return res.status(400).json({ error: "Missing pageName parameter" });

    try {
        if (mongoose.connection.readyState === 1) {
            const updatedPage = await PageTrack.findOneAndUpdate(
                { pageName: pageName },
                { $inc: { views: 1 } },
                { uppercase: true, new: true, upsert: true }
            );
            return res.status(200).json({ success: true, data: updatedPage });
        }
        res.status(500).json({ error: "Database not ready" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 📡 ROUTE 4: GET /api/usercount
 * គាំទ្រទាំង Browser UI Dashboard និង KWGT JSON Output
 */
app.get('/api/usercount', async (req, res) => {
    const isEnvMissing = !process.env.MONGOURL;
    
    try {
        let totalUsers = 0;
        let topPages = [];

        if (!isEnvMissing && mongoose.connection.readyState === 1) {
            totalUsers = await User.countDocuments({});
            topPages = await PageTrack.find({}).sort({ views: -1 }).limit(5);
        }

        const acceptHeader = req.headers.accept || '';
        if (acceptHeader.includes('text/html') && !req.headers['user-agent']?.includes('Kustom')) {
            res.setHeader('Content-Type', 'text/html');
            return res.status(200).send(renderDashboard(req, totalUsers, topPages, isEnvMissing));
        } else {
            return res.status(200).json({ count: totalUsers, topPages: topPages });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.get('/api', (req, res) => { res.redirect('/api/usercount'); });

module.exports = app;
