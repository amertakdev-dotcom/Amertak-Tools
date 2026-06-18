const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 🛠️ អនុញ្ញាតឱ្យទទួលទិន្នន័យ Base64 បានទំហំរហូតដល់ 10MB
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const mongoURI = process.env.MONGOURL;

let cachedConnection = null;
async function connectToDatabase() {
    if (cachedConnection && mongoose.connection.readyState === 1) {
        return cachedConnection;
    }
    if (!mongoURI) throw new Error("process.env.MONGOURL is undefined!");
    cachedConnection = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
    });
    return cachedConnection;
}

// 🗂️ DATABASE SCHEMAS
const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
const PageTrack = mongoose.model('PageTrack', new mongoose.Schema({
    pageName: { type: String, required: true, unique: true },
    views: { type: Number, default: 0 }
}), 'pagetracks');
const ImageModel = mongoose.model('Image', new mongoose.Schema({
    base64Data: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}), 'images');


// 🎨 មុខងារបង្កើតផ្ទាំង UI DEFAULT WEB DASHBOARD (ដូចដើមវិញ ១០០%)
const renderDashboard = (totalUsers, topPages, isEnvMissing) => {
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
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght=400;600;700&display=swap" rel="stylesheet">
        <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
    </head>
    <body class="bg-[#0f172a] text-slate-200 min-h-screen flex flex-col justify-between">
        <header class="border-b border-slate-800 bg-[#1e293b]/50 backdrop-blur px-6 py-4">
            <div class="max-w-4xl mx-auto flex justify-between items-center">
                <h1 class="text-xl font-bold text-teal-400 tracking-wide">AMERTAK TOOLS <span class="text-xs bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-full font-normal">v4.1</span></h1>
                <span class="flex items-center gap-2 text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                    <span class="h-2 w-2 rounded-full ${isEnvMissing ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 animate-pulse'}"></span> 
                    ${isEnvMissing ? 'Database Disconnected' : 'Live Engine Connected'}
                </span>
            </div>
        </header>
        <main class="max-w-4xl w-full mx-auto p-6 flex-grow space-y-6">
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
                            <tbody>${tableRows || '<tr><td colspan="3" class="text-center py-6 text-sm text-slate-500">មិនទាន់មានទិន្នន័យទំព័រនៅឡើយទេ</td></tr>'}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
        <footer class="border-t border-slate-800 text-center py-4 text-xs text-slate-500 bg-[#0b0f19]"><p>© 2026 Amertak Tools · Developed by Kin Thavrath</p></footer>
    </body>
    </html>`;
};


// ==========================================
// 📡 SYSTEM API ROUTERS
// ==========================================

/**
 * 📡 ROUTE: POST /api/upload-image
 */
app.post('/api/upload-image', async (req, res) => {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "សូមបញ្ជូនទិន្នន័យរូបភាពមកផងបង!" });
    try {
        await connectToDatabase();
        const newImage = new ImageModel({ base64Data: image });
        const savedData = await newImage.save();
        return res.status(200).json({ success: true, id: savedData._id });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * 📡 ROUTE: GET /api/get-image/:id
 */
app.get('/api/get-image/:id', async (req, res) => {
    try {
        await connectToDatabase();
        const imageData = await ImageModel.findById(req.params.id);
        if (!imageData) return res.status(404).json({ error: "រកមិនឃើញរូបភាពទេ!" });
        return res.status(200).json({ image: imageData.base64Data });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * 📡 ROUTE: POST /api/track-page
 */
app.post('/api/track-page', async (req, res) => {
    try {
        await connectToDatabase();
        const updated = await PageTrack.findOneAndUpdate(
            { pageName: req.body.pageName },
            { $inc: { views: 1 } },
            { uppercase: true, new: true, upsert: true }
        );
        return res.status(200).json({ success: true, data: updated });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * 🔗 ROUTE: GET /view/:id (ផ្ទាំងបង្ហាញរូបភាពពេលគេចុចមើលលីង Share - Premium UX/UI)
 */
app.get('/view/:id', async (req, res) => {
    try {
        await connectToDatabase();
        const imageData = await ImageModel.findById(req.params.id);
        if (!imageData) return res.status(404).send("<h1 style='color:white;text-align:center;padding-top:50px;'>រកមិនឃើញរូបភាពឡើយបង!</h1>");

        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Shared Image - Amertak Tools</title>
            <meta property="og:title" content="រូបភាពចែករំលែកពី Amertak Tools">
            <meta property="og:description" content="ចុចទីនេះដើម្បីចូលមើលរូបភាពពេញទំហំច្បាស់ៗ">
            <meta property="og:image" content="${imageData.base64Data}">
            <meta property="og:type" content="website">
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:image" content="${imageData.base64Data}">
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
            <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
        </head>
        <body class="bg-[#0f172a] text-slate-200 min-h-screen flex flex-col justify-between">
            <header class="border-b border-slate-800 bg-[#1e293b]/50 backdrop-blur px-6 py-4">
                <div class="max-w-3xl mx-auto flex justify-between items-center">
                    <h1 class="text-xl font-bold text-teal-400 tracking-wide">AMERTAK TOOLS</h1>
                    <a href="/tools/image-to-url/" class="text-xs text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition">Upload ខ្លួនឯង</a>
                </div>
            </header>
            <main class="max-w-3xl w-full mx-auto p-6 flex-grow flex flex-col justify-center text-center space-y-6">
                <h2 class="text-lg font-semibold text-slate-300">🖼️ រូបភាពដែលបានទាញចេញពី Cloud Database</h2>
                <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl inline-block max-w-full mx-auto shadow-2xl">
                    <img src="${imageData.base64Data}" class="max-h-[65vh] rounded-xl mx-auto shadow-md">
                </div>
                <div>
                    <a href="/tools/image-to-url/" class="inline-block bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg transition text-sm">បំប្លែងរូបភាពថ្មីមួយទៀត</a>
                </div>
            </main>
            <footer class="border-t border-slate-800 text-center py-4 text-xs text-slate-500 bg-[#0b0f19]"><p>© 2026 Amertak Tools · Developed by Kin Thavrath</p></footer>
        </body>
        </html>`);
    } catch (error) {
        return res.status(500).send("Server Error: " + error.message);
    }
});

/**
 * 📡 ROUTE: GET /api/usercount (គាំទ្រទាំង Web UI Dashboard ដើម និង KWGT JSON)
 */
app.get('/api/usercount', async (req, res) => {
    const isEnvMissing = !process.env.MONGOURL;
    try {
        await connectToDatabase();
        const totalUsers = await User.countDocuments({});
        const topPages = await PageTrack.find({}).sort({ views: -1 }).limit(5);

        const acceptHeader = req.headers.accept || '';
        if (acceptHeader.includes('text/html') && !req.headers['user-agent']?.includes('Kustom')) {
            res.setHeader('Content-Type', 'text/html');
            return res.status(200).send(renderDashboard(totalUsers, topPages, isEnvMissing));
        } else {
            return res.status(200).json({ count: totalUsers, topPages: topPages });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.get('/api', (req, res) => { res.redirect('/api/usercount'); });
module.exports = app;
