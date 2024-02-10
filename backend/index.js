import bodyParser from 'body-parser';
import { parse } from 'csv-parse/sync';
import { config } from 'dotenv';
import express from 'express';
import session from 'express-session';
import client from './utils/postgres.js';

config();

const app = express();

app.use(session({
    secret: "bruh", //TODO: fix the session logic
    saveUninitialized: true,
    resave: true,
    cookie: { secure: true }
}))
app.use(bodyParser.raw({ type: 'text/csv' }));

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.post('/login', (res, req) => {
    //TODO: implement login logic

    req.session.user = {
        username: "example-user"
    }
})

const jsToPgType = {
    string: 'text',
    number: 'int',
    boolean: 'bool',
    object: 'jsonb',
}

app.post('/uploadTable', async (req, res) => {
    // takes a plaintext csv
    // returns a table id

    if (req.headers['content-type'] !== 'text/csv') {
        return res.status(400).send('Invalid file type');
    }

    const data = parse(req.body, {
        columns: true,
        cast: true,
    });

    const cols = Object.keys(data[0]);
    const schema = cols.map((col) => {
        const type = typeof data[0][col];
        return `${col} ${jsToPgType[type]}`;
    }).join(', ');

    const tableName = `table_${Math.random().toString(36).substring(7)}`; //TODO: make this better
    const q = await client.query(`CREATE TABLE ${tableName} (${schema})`);

    for (const row of data) {
        const statement = `INSERT INTO ${tableName} (${cols.join(', ')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')})`;
        const q = await client.query(statement, cols.map((col) => row[col]));
        console.log(q);
    }

    res.send(tableName);
})

app.post('/chooseTable', (req, res) => {

})

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
}
);