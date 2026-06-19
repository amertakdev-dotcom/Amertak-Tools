const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

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
        serverSelectionTimeoutMS: 4000,
        connectTimeoutMS: 8000,
    });

    return cachedConnection;
}

// ================= SCHEMAS =================
const User = mongoose.model(
    'User',
    new mongoose.Schema({}, { strict: false }),
    'users'
);

const PageTrack = mongoose.model(
    'PageTrack',
    new mongoose.Schema({
        pageName: { type: String, required: true, unique: true },
        views: { type: Number, default: 0 }
    }),
    'pagetracks'
);

const ImageModel = mongoose.model(
    'Image',
    new mongoose.Schema({
        base64Data: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }),
    'images'
);

// ================= DASHBOARD =================
const renderDashboard = (totalUsers, topPages, isEnvMissing) => {
    const tableRows = topPages.map((p, index) => {
        let medal =
            index === 0 ? '🥇' :
            index === 1 ? '🥈' :
            index === 2 ? '🥉' : '📄';

        return `
        <tr>
            <td>${medal} ${index + 1}</td>
            <td>${p.pageName}</td>
            <td>${p.views}</td>
        </tr>`;
    }).join('');

    return `
    <html>
    <head>
        <title>Amertak Dashboard</title>
    </head>
    <body style="background:#111;color:#fff;font-family:sans-serif">
        <h1>AMERTAK TOOLS</h1>
        <p>Status: ${isEnvMissing ? 'DB OFF' : 'LIVE'}</p>

        <h2>Total Users: ${totalUsers}</h2>

        <table border="1" cellpadding="10">
            <tr>
                <th>Rank</th>
                <th>Page</th>
                <th>Views</th>
            </tr>
            ${tableRows}
        </table>
    </body>
    </html>`;
};

// ================= CONNECT DB =================
async function db() {
    await connectToDatabase();
}

// ================= ROUTES =================

// UPLOAD IMAGE
app.post('/upload-image', async (req, res) => {
    try {
        await db();

        const { image } = req.body;
        if (!image) return res.status(400).json({ error: "Missing Image Data" });

        const newImage = await ImageModel.create({ base64Data: image });

        return res.json({ success: true, id: newImage._id });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// TRACK PAGE
app.post('/track-page', async (req, res) => {
    try {
        await db();

        const { pageName } = req.body;

        const updated = await PageTrack.findOneAndUpdate(
            { pageName },
            { $inc: { views: 1 } },
            { new: true, upsert: true }
        );

        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// RAW IMAGE
app.get('/raw-image/:id', async (req, res) => {
    try {
        await db();

        const image = await ImageModel.findById(req.params.id);
        if (!image) return res.status(404).send("Not found");

        const match = image.base64Data.match(/^data:image\/(\w+);base64,(.+)$/);

        if (!match) return res.status(400).send("Invalid");

        const buffer = Buffer.from(match[2], 'base64');

        res.setHeader('Content-Type', `image/${match[1]}`);
        res.send(buffer);

    } catch (err) {
        res.status(500).send(err.message);
    }
});

// VIEW PAGE
app.get('/view/:id', async (req, res) => {
    try {
        await db();

        const image = await ImageModel.findById(req.params.id);
        if (!image) return res.status(404).send("Not found");

        const url = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/raw-image/${req.params.id}`;

        res.send(`
            <html>
            <body style="background:#000;color:#fff;text-align:center">
                <h2>Shared Image</h2>
                <img src="${image.base64Data}" style="max-width:90%" />
                <p>${url}</p>
            </body>
            </html>
        `);

    } catch (err) {
        res.status(500).send(err.message);
    }
});

// USER COUNT
app.get('/usercount', async (req, res) => {
    try {
        await db();

        const totalUsers = await User.countDocuments({});
        const topPages = await PageTrack.find({}).sort({ views: -1 }).limit(5);

        const isEnvMissing = !process.env.MONGOURI;

        res.json({
            count: totalUsers,
            topPages
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ROOT
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: "Amertak Tools API Running"
    });
});

module.exports = app;
