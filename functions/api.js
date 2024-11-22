import express from 'express';
import ServerlessHttp from 'serverless-http';
import TaskRouter from '../routes/tasks.js';
import UserRouter from '../routes/user.js';
import WorkroomRouter from '../routes/workroom.js';

const app = express();

app.get('/.netlify/functions/api', (req, res) => {
  return res.json({
    message: 'hello world',
  });
});
app.use('/.netlify/functions/api/v1/tasks', TaskRouter);
app.use('/.netlify/functions/api/v1/user', UserRouter);
app.use('/.netlify/functions/api/v1/workroom', WorkroomRouter);
app.get('/.netlify/functions/test', (req, res) => {
  res.send('hello boy!');
});
const handler = ServerlessHttp(app);

module.exports.handler = async (event, context) => {
  const result = await handler(event, context);
  return result;
};
