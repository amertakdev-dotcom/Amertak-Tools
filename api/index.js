const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware រៀបចំឱ្យមានសុវត្ថិភាព និងការអានទិន្នន័យ JSON
app.use(cors({ origin: '*' }));
app.use(express.json());

// ⚠️ ទាញយកលីងភ្ជាប់ទៅកាន់ MongoDB ពី .env តាមរយៈ variable ឈ្មោះ MONGOURL
const mongoURI = process.env.MONGOURL;

if (mongoURI) {
    mongoose.connect(mongoURI)
      .then(() => console.log("✅ MongoDB Connected Successfully"))
      .catch(err => console.error("❌ MongoDB Connection Error:", err));
} else {
    console.error("❌ Critical: process.env.MONGOURL is undefined!");
}

// កំណត់ Schema សម្រាប់ទាញយកចំនួន User (ផ្អែកលើ Collection ឈ្មោះ 'users' របស់បង)
const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchema, 'users');

/**
 * 🛠️ សង់ផ្ទាំង UI សម្រាប់បង្ហាញព័ត៌មាន និងការណែនាំពី API (UX/UI Dashboard)
 */
const renderDashboard = (req, totalUsers, isEnvMissing) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Amertak Tools - API Documentation</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
        <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
    </head>
    <body class="bg-[#0f172a] text-slate-200 min-h-screen flex flex-col justify-between">
        
        <header class="border-b border-slate-800 bg-[#1e293b]/50 backdrop-blur px-6 py-4">
            <div class="max-w-4xl mx-auto flex justify-between items-center">
                <h1 class="text-xl font-bold text-teal-400 tracking-wide">AMERTAK TOOLS <span class="text-xs bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-full font-normal">API v1.0</span></h1>
                <span class="flex items-center gap-2 text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                    <span class="h-2 w-2 rounded-full ${isEnvMissing ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 animate-pulse'}"></span> 
                    ${isEnvMissing ? 'Database Disconnected' : 'Database Connected'}
                </span>
            </div>
        </header>

        <main class="max-w-4xl w-full mx-auto p-6 flex-grow space-y-6">
            
            ${isEnvMissing ? `
            <div class="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-4 text-sm flex flex-col gap-1">
                <span class="font-bold">⚠️ កំហុសបច្ចេកទេស (Environment Variable Missing):</span>
                <p>បងមិនទាន់បានកំណត់ <code class="bg-rose-950 px-1.5 py-0.5 rounded text-rose-300 font-mono text-xs">MONGOURL</code> នៅក្នុង Vercel Environment Variables ឡើយ។ សូមចូលទៅកាន់ Vercel Dashboard រួចបន្ថែមវាដើម្បីឱ្យវាទាញទិន្នន័យពី MongoDB បាន។</p>
            </div>
            ` : ''}

            <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 class="text-lg font-semibold text-slate-300">Live User Statistics</h2>
                    <p class="text-sm text-slate-400">ចំនួនគណនីអ្នកប្រើប្រាស់សរុបដែលបានចុះឈ្មោះក្នុងប្រព័ន្ធ។</p>
                </div>
                <div class="bg-slate-950/50 border border-slate-800 rounded-xl px-6 py-3 min-w-[140px] text-center">
                    <span class="block text-xs uppercase tracking-wider text-teal-400 font-semibold mb-1">Total Users</span>
                    <span class="text-3xl font-bold text-white tracking-tight">${totalUsers}</span>
                </div>
            </div>

            <div class="space-y-4">
                <h3 class="text-lg font-bold text-slate-300">Available Endpoints</h3>
                
                <div class="bg-[#1e293b]/30 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div class="p-4 bg-slate-900/40 border-b border-slate-800 flex items-center justify-between gap-3">
                        <div class="flex items-center gap-3">
                            <span class="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-md border border-emerald-500/20">GET</span>
                            <code class="text-sm font-semibold text-slate-200">/api/usercount</code>
                        </div>
                        <span class="text-xs text-slate-400">សម្រាប់ទាញយកចំនួន User</span>
                    </div>
                    <div class="p-4 space-y-3 text-sm">
                        <div>
                            <span class="block text-xs font-semibold text-slate-400 mb-1">HEADERS REQUIRED</span>
                            <div class="bg-slate-950 rounded-lg p-2.5 font-mono text-xs text-teal-300 border border-slate-800">
                                "Accept": "application/json"
                            </div>
                        </div>
                        <div>
                            <span class="block text-xs font-semibold text-slate-400 mb-1">RESPONSE SAMPLE (JSON)</span>
                            <pre class="bg-slate-950 rounded-lg p-3 font-mono text-xs text-amber-400 border border-slate-800 overflow-x-auto">{\n  "count": ${totalUsers}\n}</pre>
                        </div>
                    </div>
                </div>

                <div class="bg-indigo-950/20 border border-indigo-900/30 rounded-xl p-5 space-y-3">
                    <h4 class="text-sm font-bold text-indigo-400 flex items-center gap-2">
                        🚀 របៀបយកទៅប្រើប្រាស់ជាមួយ KWGT Widget
                    </h4>
                    <p class="text-xs text-slate-300 leading-relaxed">
                        សូមបើកកម្មវិធី KWGT រួចបង្កើត Text Item មួយ បន្ទាប់មកចម្លងកូដ Formula ខាងក្រោមនេះទៅដាក់ក្នុងប្រអប់កូដខាងលើគេ៖
                    </p>
                    <div class="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between font-mono text-xs text-indigo-300 overflow-x-auto">
                        <code>$wg("https://${req.get('host')}/api/usercount", json, .count)$</code>
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
 * 📡 ROUTE: /api/usercount
 * គាំទ្រទាំងការមើលតាម Browser (បង្ហាញ UI) និងការហៅពី KWGT (បោះ JSON)
 */
app.get('/api/usercount', async (req, res) => {
    const isEnvMissing = !process.env.MONGOURL;
    
    try {
        let totalUsers = 0;
        // ប្រសិនបើមាន MONGOURL និងបានភ្ជាប់ជោគជ័យ ទើបទៅរាប់ចំនួន User
        if (!isEnvMissing && mongoose.connection.readyState === 1) {
            totalUsers = await User.countDocuments({});
        }

        // 🛠️ ពិនិត្យមើលថាជាការហៅពី Browser (HTML) ឬហៅពី Widget/Code (JSON)
        const acceptHeader = req.headers.accept || '';
        if (acceptHeader.includes('text/html') && !req.headers['user-agent']?.includes('Kustom')) {
            res.setHeader('Content-Type', 'text/html');
            return res.status(200).send(renderDashboard(req, totalUsers, isEnvMissing));
        } else {
            return res.status(200).json({ count: totalUsers });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Route ទូទៅសម្រាប់ /api ឱ្យរុញទៅកាន់ /api/usercount ស្វ័យប្រវត្តិ
app.get('/api', (req, res) => {
    res.redirect('/api/usercount');
});

module.exports = app;
