const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');




dotenv.config();
const MONGO_URI = process.env.MONGO_URI

const app = express();

// MongoDB configuration
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Asset Model
const Asset = mongoose.model('Asset', new mongoose.Schema({
    name: String,
    description: String,
    value: Number,
    location: String
}));


// Routes

app.get('/api/assets/search', async (req, res) => {
    try {
        const query = req.query.q;
        const assets = await Asset.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        });
        res.json(assets);
    } catch (error) {
        res.status(500).json({ message: 'Error searching for assets' });
    }
});

app.get('/api/assets', async (req, res) => {
    const assets = await Asset.find();
    res.json(assets);
});

app.post('/api/assets', async (req, res) => {
    const asset = new Asset(req.body);
    await asset.save();
    res.json(asset);
});

app.get('/api/assets/:id', async (req, res) => {
    const asset = await Asset.findById(req.params.id);
    res.json(asset);
});

app.put('/api/assets/:id', async (req, res) => {
    const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(asset);
});

app.delete('/api/assets/:id', async (req, res) => {
    await Asset.findByIdAndDelete(req.params.id);
    res.send({ message: 'Asset deleted' });
});


// Static files
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
