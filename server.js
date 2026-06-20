const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRouter = require('./server/authRoutes');
const imageToUrlRouter = require('./api/tools/image-to-url');
const downloaderRouter = require('./api/tools/downloader');

const app = express();
const rootDir = path.join(__dirname);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use('/api/tools/image-to-url', imageToUrlRouter);
app.use('/api/tools/downloader', downloaderRouter);
app.use(express.static(rootDir));

app.get(['/login', '/register'], (req, res) => {
  const fileName = req.path === '/register' ? 'register.html' : 'login.html';
  res.sendFile(path.join(rootDir, fileName));
});

app.get('/share/:id', (req, res) => {
  res.sendFile(path.join(rootDir, 'share.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}`);
});
