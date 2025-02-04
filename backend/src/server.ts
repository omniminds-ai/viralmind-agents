import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose, { ConnectOptions } from 'mongoose';
import { catchErrors } from './hooks/errors.ts';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

dotenv.config();
const dbURI = process.env.DB_URI;
const clientOptions: ConnectOptions = {
  serverApi: { version: '1', strict: true, deprecationErrors: true }
};

const app = express();
const dev = app.get('env') !== 'production';
const port = 8001;

// Create HTTP server
const httpServer = createServer(app);

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.json({ limit: '5mb' }));

app.use(express.json({ limit: '5mb' }));
// Add headers
app.use(function (req, res, next) {
  // Origin to allow
  const allowedOrigins = [
    'http://localhost:1420',
    'http://localhost:3000',
    'http://localhost:8001',
    'http://18.157.122.205',
    'https://viralmind.ai'
  ];

  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  // Request methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT');
  // Request headers
  res.setHeader('Access-Control-Expose-Headers', 'auth-token, x-forwarded-for');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type,auth-token,cancelToken, responsetype, x-forwarded-for'
  );
  next();
});

// This is set before http headers b/c it breaks the stream
import { streamsRoute } from './routes/streams.ts';
app.use('/api/streams', streamsRoute);

var forceSSL = function (req: Request, res: Response, next: NextFunction) {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  }
  return next();
};

if (!dev) {
  app.use(forceSSL);
}

app.disable('x-powered-by');
app.set('trust proxy', true);

// Serve static files from public directory
app.use('/api/screenshots', express.static(path.join(__dirname, 'public', 'screenshots')));
app.use('/api/recordings', express.static(path.join(__dirname, 'public', 'recordings')));

// UI:
import { challengesRoute } from './routes/challenges.ts';
import { conversationRoute } from './routes/conversation.ts';
import { settingsRoute } from './routes/settings.ts';
import { minecraftRoute } from './routes/minecraft.ts';
import { racesRoute } from './routes/races.ts';
import { gymRoute } from './routes/gym.ts';

// TEST:
// import { testRoute } from "./test/conversation.ts";

// API:
import { tournamentsAPI } from './api/tournaments.ts';
import { conversationsAPI } from './api/conversation.ts';

app.use('/api/challenges', challengesRoute);
app.use('/api/conversation', conversationRoute);
app.use('/api/settings', settingsRoute);
app.use('/api/minecraft', minecraftRoute);
app.use('/api/races', racesRoute);
app.use('/api/gym', gymRoute);
app.use('/api/json/v1/tournaments', tournamentsAPI);
app.use('/api/json/v1/conversations', conversationsAPI);

// if (dev) {
//   app.use("/api/test", testRoute);
// }

catchErrors();

async function connectToDatabase() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    if (!dbURI) throw Error('No DB URI passed to connect.');
    await mongoose.connect(dbURI, clientOptions);
    await mongoose.connection.db?.admin().command({ ping: 1 });
    console.log('Database connected!');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

httpServer.listen(port, () => {
  console.log(`Jailbreak app listening on port ${port}`);
  connectToDatabase().catch(console.dir);
});
