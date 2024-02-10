import bodyParser from 'body-parser';
import { parse } from 'csv-parse/sync';
import { config } from 'dotenv';
import express from 'express';
import session from 'express-session';
import pg from 'pg';
import openai from './utils/openai.js';
import client, { jsToPgType } from './utils/postgres.js';
import generateStructuredMessage from './utils/structuredMessage.js';

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
    const escapeCol = (col) => pg.escapeIdentifier(col.toLowerCase());
    const schema = cols.map((col) => {
        const type = typeof data[0][col]; //TODO: potential for the first row to not have all the columns defined
        return `${escapeCol(col)} ${jsToPgType[type]}`;
    })
    schema.push('id SERIAL PRIMARY KEY');
    const schemaText = schema.join(', ');

    const tableName = `table_${Math.random().toString(36).substring(7)}`; //TODO: make this better
    const escapedTableName = pg.escapeIdentifier(tableName);
    await client.query(`CREATE TABLE ${escapedTableName} (${schemaText})`); //TODO: this can def inject sql

    for (const row of data) {
        try {
            const statement = `INSERT INTO ${escapedTableName} (${cols.map(escapeCol).join(', ')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')})`;
            await client.query(statement, cols.map((col) => row[col]));
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
        test: {
            among: await generateStructuredMessage(table, "What is the average age of the users?")
        }
    });
})

app.post('/table/:id/query', async (req, res) => {
    const { query } = req.body;
    const table = req.params.id;

    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: await generateStructuredMessage(table, query),
    });

    res.send({
        completion,
    });
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
}
);