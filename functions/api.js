import express from 'express';
import serverless from 'serverless-http';
import connectToDatabase from '../lib/connectDb.js'; // Import MongoDB connection logic
import TaskRouter from '../routes/tasks.js';
import UserRouter from '../routes/user.js';
import WorkroomRouter from '../routes/workroom.js';
import cors from 'cors';
import { corsOptions } from '../lib/constants.js';

const app = express();
const router = express.Router();

// Middleware to connect to MongoDB
router.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Base route for testing
router.get('/', (req, res) => {
  res.json({ message: 'API is working!' });
});

router.get('/test', (req, res) => {
  res.send('hello world');
});

app.use(express.json());
// cors middleware
app.use(cors(corsOptions));

console.log('TaskRouter:', TaskRouter.default);
console.log('UserRouter:', UserRouter.default);
console.log('WorkroomRouter:', WorkroomRouter.default);

// Route definitions
router.use('/v1/tasks', TaskRouter.default);
router.use('/v1/user', UserRouter.default);
router.use('/v1/workroom', WorkroomRouter.default);

app.use('/.netlify/functions/api', router);

module.exports.handler = serverless(app);
