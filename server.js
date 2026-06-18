const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRouter = require('./server/authRoutes');

const app = express();
const rootDir = path.join(__dirname);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use(express.static(rootDir));

app.get(['/login', '/register'], (req, res) => {
  const fileName = req.path === '/register' ? 'register.html' : 'login.html';
  res.sendFile(path.join(rootDir, fileName));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}`);
});
