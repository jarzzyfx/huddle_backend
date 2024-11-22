import { app, corsOptions } from '../lib/constants.js';
import { startServer } from '../lib/startServer.js';
import logger from '../middlewares/logger.js';
import TaskRouter from '../routes/tasks.js';
import UserRouter from '../routes/user.js';
import WorkroomRouter from '../routes/workroom.js';
import bodyParser from 'body-parser';
import cors from 'cors';

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true })); // For form submissions
app.use(bodyParser.json()); // Add this line to parse JSON request bodies

// cors middleware
app.use(cors(corsOptions));

// Routes
app.use('/api/v1/tasks', TaskRouter);
app.use('/api/v1/user', UserRouter);
app.use('/api/v1/workroom', WorkroomRouter);

startServer();
