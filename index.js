const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ភ្ជាប់ទៅកាន់ MongoURL ដែលបានកំណត់ក្នុង Vercel Environment Variable
mongoose.connect(process.env.MONGOURL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// ហៅទៅកាន់ Collection របស់ User ដែលបងមានស្រាប់ (ឧបមាថាឈ្មោះ 'users')
const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchema, 'users'); 

// Route សម្រាប់បោះទិន្នន័យទៅឱ្យ KWGT
app.get('/api/usercount', async (req, res) => {
    try {
        // រាប់ចំនួន Account ទាំងអស់ដែលមាននៅក្នុង Database
        const totalUsers = await User.countDocuments({});
        
        // បោះជា JSON Format ទៅឱ្យ KWGT អាន
        res.status(200).json({ count: totalUsers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
