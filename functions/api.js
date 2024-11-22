import express from 'express';
import serverless from 'serverless-http'; // Use lowercase import
import TaskRouter from '../routes/tasks.js';
import UserRouter from '../routes/user.js';
import WorkroomRouter from '../routes/workroom.js';

const app = express();

// Base route for testing
app.get('/', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Route definitions (no '/.netlify/functions' prefix needed)
app.use('/v1/tasks', TaskRouter);
app.use('/v1/user', UserRouter);
app.use('/v1/workroom', WorkroomRouter);

// Export serverless handler
module.exports.handler = serverless(app);
