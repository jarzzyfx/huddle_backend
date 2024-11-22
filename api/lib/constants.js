import e from 'express';
export const app = e();

export const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  family: 4,
};

export const corsOptions = {
  origin: 'http://localhost:3000', // Allow only this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true, // Enable credentials if needed for cookies, etc.
  optionsSuccessStatus: 200, // Status code for preflight response
};
