const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// អនុញ្ញាតឱ្យទទួលទិន្នន័យរូបភាពរហូតដល់ 10MB
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

// ==========================================
// 📡 SYSTEM API ROUTERS
// ==========================================

app.post('/api/upload-image', async (req, res) => {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "Missing Image Data" });
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
 * 📡 ROUTE សម្រាប់បំប្លែងទិន្នន័យ Base64 ទៅជារូបភាពចំៗ (Direct Image Response)
 * មុខងារនេះសំខាន់បំផុត ដើម្បីឱ្យ Bot របស់ Telegram/Messenger អាចទាញយករូបភាពទៅធ្វើជា Banner បាន
 */
app.get('/api/raw-image/:id', async (req, res) => {
    try {
        await connectToDatabase();
        const imageData = await ImageModel.findById(req.params.id);
        if (!imageData) return res.status(404).send("Image Not Found");

        // ញែកយកប្រភេទរូបភាព (png, jpeg, gif) និងទិន្នន័យ Base64 ដើម
        const matches = imageData.base64Data.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).send("Invalid Image Data");
        }

        const imageType = matches[1];
        const imageBuffer = Buffer.from(matches[2], 'base64');

        res.setHeader('Content-Type', `image/${imageType}`);
        res.setHeader('Cache-Control', 'public, max-age=86400'); // ជួយឱ្យលោត Preview លឿន
        return res.status(200).send(imageBuffer);
    } catch (error) {
        return res.status(500).send("Server Error");
    }
});

/**
 * 🔗 ROUTE សម្រាប់បង្ហាញផ្ទាំងមើលរូបភាពពេលចែករំលែកលីង (លោត Banner ធំច្បាស់ ១០០%)
 */
app.get('/view/:id', async (req, res) => {
    try {
        await connectToDatabase();
        const imageData = await ImageModel.findById(req.params.id);
        if (!imageData) return res.status(404).send("<h1 style='color:white;text-align:center;padding-top:50px;'>រកមិនឃើញរូបភាពឡើយបង!</h1>");

        // បង្កើតលីងរូបភាពចំៗ (Direct URL) សម្រាប់ដាក់ក្នុង OG Tags
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;
        const directImageUrl = `${protocol}://${host}/api/raw-image/${req.params.id}`;

        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Shared Image - Amertak Tools</title>
            
            <meta property="og:title" content="🖼️ រូបភាពចែករំលែកពី Amertak Tools">
            <meta property="og:description" content="ចុចទីនេះដើម្បីចូលមើលរូបភាពពេញទំហំច្បាស់ៗ">
            <meta property="og:image" content="${directImageUrl}">
            <meta property="og:image:secure_url" content="${directImageUrl}">
            <meta property="og:image:type" content="image/png">
            <meta property="og:image:width" content="1200">
            <meta property="og:image:height" content="630">
            <meta property="og:type" content="website">
            
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="🖼️ រូបភាពចែករំលែកពី Amertak Tools">
            <meta name="twitter:description" content="ចុចទីនេះដើម្បីចូលមើលរូបភាពពេញទំហំច្បាស់ៗ">
            <meta name="twitter:image" content="${directImageUrl}">
            
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-[#0f172a] text-slate-200 min-h-screen flex flex-col justify-between">
            <header class="border-b border-slate-800 bg-[#1e293b]/50 backdrop-blur px-6 py-4">
                <div class="max-w-3xl mx-auto flex justify-between items-center">
                    <h1 class="text-xl font-bold text-teal-400 tracking-wide">AMERTAK TOOLS</h1>
                    <a href="/tools/image-to-url/" class="text-xs text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition">Upload ខ្លួនឯង</a>
                </div>
            </header>
            <main class="max-w-3xl w-full mx-auto p-6 flex-grow flex flex-col justify-center text-center space-y-6">
                <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl inline-block max-w-full mx-auto shadow-2xl">
                    <img src="${imageData.base64Data}" class="max-h-[65vh] rounded-xl mx-auto shadow-md">
                </div>
            </main>
            <footer class="border-t border-slate-800 text-center py-4 text-xs text-slate-500 bg-[#0b0f19]"><p>© 2026 Amertak Tools</p></footer>
        </body>
        </html>`);
    } catch (error) {
        return res.status(500).send("Server Error: " + error.message);
    }
});

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
