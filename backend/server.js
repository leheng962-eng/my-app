const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, default: 'General' },
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);
const Task = mongoose.model('Task', taskSchema);

app.get('/api/health', (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  if (dbReady) {
    return res.status(200).json({ status: 'ok', database: 'connected' });
  }
  return res.status(503).json({ status: 'error', database: 'disconnected' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Node.js + MongoDB API is running' });
});

app.get('/api/tasks', async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json(tasks);
});

app.post('/api/tasks', async (req, res) => {
  if (!req.body.title) return res.status(400).json({ error: 'Title is required' });
  const task = await Task.create({
    title: req.body.title,
    category: req.body.category || 'General'
  });
  res.status(201).json(task);
});

app.patch('/api/tasks/:id', async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { completed: req.body.completed },
    { new: true }
  );
  res.json(task);
});

app.delete('/api/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ deleted: true });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  });
