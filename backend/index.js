import express from 'express';
import session from 'express-session';
import { config } from 'dotenv';
import client from './utils/postgres.js';

config();

const app = express();
app.use(session({
    secret: "bruh", //TODO: fix
    saveUninitialized: true,
    cookie: { secure: true }
}))

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
}
);