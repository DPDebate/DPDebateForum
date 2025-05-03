// Server-side implementation using Express.js and MongoDB
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/deerparkdebate', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Define Schemas
const ReplySchema = new mongoose.Schema({
    author: { type: String, default: 'Anonymous' },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now },
    userId: { type: String }
});

const TopicSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, default: 'Anonymous' },
    category: { 
        type: String, 
        enum: ['ethics', 'politics', 'science', 'education', 'society', 'other'],
        required: true 
    },
    date: { type: Date, default: Date.now },
    userId: { type: String },
    replies: [ReplySchema]
});

// Create models
const Topic = mongoose.model('Topic', TopicSchema);

// API Routes

// Get all topics
app.get('/api/topics', async (req, res) => {
    try {
        const topics = await Topic.find().sort({ date: -1 });
        res.json(topics);
    } catch (err) {
        console.error('Error fetching topics:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get topics by category
app.get('/api/topics/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const topics = await Topic.find({ category }).sort({ date: -1 });
        res.json(topics);
    } catch (err) {
        console.error('Error fetching topics by category:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a new topic
app.post('/api/topics', async (req, res) => {
    try {
        const { title, content, author, category, userId } = req.body;
        
        const newTopic = new Topic({
            title,
            content,
            author: author || 'Anonymous',
            category,
            userId
        });
        
        const savedTopic = await newTopic.save();
        res.status(201).json(savedTopic);
    } catch (err) {
        console.error('Error creating topic:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add a reply to a topic
app.post('/api/topics/:topicId/replies', async (req, res) => {
    try {
        const { topicId } = req.params;
        const { author, content, userId } = req.body;
        
        const topic = await Topic.findById(topicId);
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }
        
        const newReply = {
            author: author || 'Anonymous',
            content,
            userId,
            date: new Date()
        };
        
        topic.replies.push(newReply);
        await topic.save();
        
        res.status(201).json(newReply);
    } catch (err) {
        console.error('Error adding reply:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Fallback route - serve index.html for any unmatched routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
