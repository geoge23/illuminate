import bodyParser from 'body-parser';
import { parse } from 'csv-parse/sync';
import { config } from 'dotenv';
import express from 'express';
import session from 'express-session';
import pg from 'pg';
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
app.use(bodyParser.json());

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

app.post('/table/upload', async (req, res) => {
    // takes a plaintext csv
    // returns a table id

    if (req.headers['content-type'] !== 'text/csv') {
        return res.status(400).send('Invalid file type');
    }

    const data = parse(req.body, {
        columns: true,
        cast: true,
    });

    const cols = Object.keys(data[0]).filter(col => col !== "id");
    const schema = cols.map((col) => {
        const type = typeof data[0][col];
        return `${pg.escapeIdentifier(col)} ${jsToPgType[type]}`;
    })
    schema.push('id SERIAL PRIMARY KEY');
    const schemaText = schema.join(', ');

    const tableName = `table_${Math.random().toString(36).substring(7)}`; //TODO: make this better
    const escapedTableName = pg.escapeIdentifier(tableName);
    const q = await client.query(`CREATE TABLE ${escapedTableName} (${schemaText})`); //TODO: this can def inject sql

    for (const row of data) {
        try {
            const statement = `INSERT INTO ${escapedTableName} (${cols.map(e => pg.escapeIdentifier(e)).join(', ')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')})`;
            const q = await client.query(statement, cols.map((col) => row[col]));
        } catch (e) {
            console.error(e);
        }
    }

    res.send({
        table: tableName,
    });
})

app.get('/table/:id', async (req, res) => {
    const table = req.params.id;
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 100;

    const q = await client.query(`SELECT * FROM ${pg.escapeIdentifier(table)} OFFSET ${offset} LIMIT ${limit};`);

    const rows = q.rows;
    const fields = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = ${pg.escapeLiteral(table)};`);

    res.send({
        rows,
        fields: fields.rows,
        pagination: {
            offset,
            limit,
        },
    });
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
}
);