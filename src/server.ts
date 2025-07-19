import express, {Request, Response} from 'express';
import {PORT} from './globals/env';
import path, {dirname} from 'path';
import {fileURLToPath} from 'url';
import { auth, todos } from './routes';
import authMiddleware from './middleware/authMiddleware';

const app = express();

// Middleware
app.use(express.json());

// configure Express.js to send all the files and assets from public folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(path.join(__dirname, '../public'), {index: false}));


// send file on ./ path
app.get('/', (req: Request, res: Response) => {
    res.sendFile('index.html', {root: path.join(__dirname, '../public')});
})

// routes
app.use('/auth', auth);
app.use('/todos', authMiddleware ,todos);


app.listen(PORT, () => {
    console.log(`App listening on ${PORT}`);
}).on('error', (err) => {
    console.error('Server failed to start:', err);
});