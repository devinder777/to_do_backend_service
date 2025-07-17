import express from 'express';
import {PORT} from './globals/env';

const app = express();

app.get('/', (req, res) => {
    res.send('Welcome to the server');
})

app.listen(PORT, () => console.log(`App listening on ${PORT}`));