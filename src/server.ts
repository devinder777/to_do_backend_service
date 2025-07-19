import express from 'express';
import {PORT} from './globals/env';
import path, {dirname} from "path";
import {fileURLToPath} from "url";

const app = express();

// Middleware
app.use(express.json());

// configure Express.js to send all the files and assets from public folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(path.join(__dirname, '../public')));


// send file on ./ path
app.get('/', (req, res) => {
    res.sendFile('index.html');
})



app.listen(PORT, () => console.log(`App listening on ${PORT}`));