const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware រៀបចំឱ្យមានសុវត្ថិភាព និងការអានទិន្នន័យ JSON
app.use(cors({ origin: '*' }));
app.use(express.json());

const mongoURI = process.env.MONGOURL;

if (mongoURI) {
    mongoose.connect(mongoURI)
      .then(() => console.log("✅ MongoDB Connected Successfully"))
      .catch(err => console.error("❌ MongoDB Connection Error:", err));
}

// 1. Schema សម្រាប់ទាញយកចំនួន User
const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchema, 'users');

// 2. Schema ថ្មីសម្រាប់កត់ត្រា និងរាប់ចំនួនទំព័រដែលបានប្រើប្រាស់
const PageTrackSchema = new mongoose.Schema({
    pageName: { type: String, required: true, unique: true },
    views: { type: Number, default: 0 }
});
const PageTrack = mongoose.model('PageTrack', PageTrackSchema, 'pagetracks');

/**
 * 🛠️ សង់ផ្ទាំង UI ថ្មីកម្រិត Advanced Analytics Dashboard (UX/UI)
 */
const renderDashboard = (req, totalUsers, topPages, isEnvMissing) => {
    // បង្កើតជួរតារាងបង្ហាញទំព័រដែលប្រើច្រើនជាងគេ
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
                <h1 class="text-xl font-bold text-teal-400 tracking-wide">AMERTAK TOOLS <span class="text-xs bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-full font-normal">Analytics v2.0</span></h1>
                <span class="flex items-center gap-2 text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                    <span class="h-2 w-2 rounded-full ${isEnvMissing ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 animate-pulse'}"></span> 
                    ${isEnvMissing ? 'Database Disconnected' : 'Live Engine Connected'}
                </span>
            </div>
        </header>

        <main class="max-w-4xl w-full mx-auto p-6 flex-grow space-y-6">
            
            ${isEnvMissing ? `
            <div class="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-4 text-sm">
                <span class="font-bold">⚠️ Environment Variable Missing:</span> Please configure <code class="bg-rose-950 px-1.5 py-0.5 rounded text-rose-300 font-mono text-xs">MONGOURL</code> in Vercel.
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

            <div class="space-y-4 pt-4">
                <h3 class="text-lg font-bold text-slate-300">System API Endpoints</h3>
                
                <div class="bg-[#1e293b]/30 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div class="p-4 bg-slate-900/40 border-b border-slate-800 flex items-center justify-between gap-3">
                        <div class="flex items-center gap-3">
                            <span class="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-md border border-emerald-500/20">GET</span>
                            <code class="text-sm font-semibold text-slate-200">/api/usercount</code>
                        </div>
                        <span class="text-xs text-slate-400">ទាញយកចំនួន User (សម្រាប់ KWGT)</span>
                    </div>
                    <div class="p-4 space-y-2 text-xs font-mono">
                        <div class="bg-slate-950 rounded-lg p-3 text-amber-400 border border-slate-800">{\n  "count": ${totalUsers}\n}</div>
                    </div>
                </div>

                <div class="bg-[#1e293b]/30 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div class="p-4 bg-slate-900/40 border-b border-slate-800 flex items-center justify-between gap-3">
                        <div class="flex items-center gap-3">
                            <span class="bg-sky-500/10 text-sky-400 text-xs font-bold px-2.5 py-1 rounded-md border border-sky-500/20">POST</span>
                            <code class="text-sm font-semibold text-slate-200">/api/track-page</code>
                        </div>
                        <span class="text-xs text-slate-400">ផ្ញើមកកត់ត្រាពេល User បើកទំព័រណាមួយ</span>
                    </div>
                    <div class="p-4 space-y-3 text-xs">
                        <div>
                            <span class="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Headers Required</span>
                            <pre class="bg-slate-950 rounded-lg p-2.5 font-mono text-sky-300 border border-slate-800">"Content-Type": "application/json"</pre>
                        </div>
                        <div>
                            <span class="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Body Payload Sample</span>
                            <pre class="bg-slate-950 rounded-lg p-2.5 font-mono text-teal-300 border border-slate-800">{\n  "pageName": "/downloader"\n}</pre>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <footer class="border-t border-slate-800 text-center py-4 text-xs text-slate-500 bg-[#0b0f19]">
            <p>© 2026 Amertak Tools · Developed by Kin Thavrath</p>
        </footer>

    </body>
    </html>
    `;
};

/**
 * 📡 1. ROUTE: /api/track-page (POST)
 * សម្រាប់ឱ្យ Frontend ហៅមកកត់ត្រារាល់ពេល User ចូលមើលទំព័រផ្សេងៗ
 */
app.post('/api/track-page', async (req, res) => {
    const { pageName } = req.body;
    if (!pageName) return res.status(400).json({ error: "Missing pageName parameter" });

    try {
        if (mongoose.connection.readyState === 1) {
            // បើមានឈ្មោះទំព័រហ្នឹងហើយ ឱ្យបូកថែម ១ (views + 1) បើមិនទាន់មាន ឱ្យបង្កើតថ្មី
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
 * 📡 2. ROUTE: /api/usercount (GET)
 * គាំទ្រទាំង Browser UI និង KWGT Client JSON
 */
app.get('/api/usercount', async (req, res) => {
    const isEnvMissing = !process.env.MONGOURL;
    
    try {
        let totalUsers = 0;
        let topPages = [];

        if (!isEnvMissing && mongoose.connection.readyState === 1) {
            // ១. រាប់ចំនួន User សរុប
            totalUsers = await User.countDocuments({});
            // ២. ទាញយកបញ្ជីទំព័រដែលគេប្រើច្រើនជាងគេ តម្រៀបពីច្រើនទៅតិច (Limit យកតែ Top 5)
            topPages = await PageTrack.find({}).sort({ views: -1 }).limit(5);
        }

        // 🛠️ ពិនិត្យមើលថាជាការហៅពី Browser (HTML) ឬហៅពី Widget/Code (JSON)
        const acceptHeader = req.headers.accept || '';
        if (acceptHeader.includes('text/html') && !req.headers['user-agent']?.includes('Kustom')) {
            res.setHeader('Content-Type', 'text/html');
            return res.status(200).send(renderDashboard(req, totalUsers, topPages, isEnvMissing));
        } else {
            return res.status(200).json({ count: totalUsers });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.get('/api', (req, res) => { res.redirect('/api/usercount'); });

module.exports = app;
