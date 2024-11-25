import e from 'express';
export const app = e();

export const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  family: 4,
};

const allowedOrigins = ['https://*'];

export const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('not allowed by cors'));
    }
  }, // Allow only this origin
  credentials: true, // Enable credentials if needed for cookies, etc.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  optionsSuccessStatus: 200, // Status code for preflight response
};

// run bun install, the laptop shutdown
