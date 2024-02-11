import bodyParser from 'body-parser';
import { parse } from 'csv-parse/sync';
import { config } from 'dotenv';
import express from 'express';
import session from 'express-session';
import pg from 'pg';
import openai from './utils/openai.js';
import client, { getPgType } from './utils/postgres.js';
import prepareTable from './utils/prepareTable.js';
import generateStructuredMessage from './utils/structuredMessage.js';
import cors from 'cors';

config();

const app = express();

app.use(session({
    secret: "bruh", //TODO: fix the session logic
    saveUninitialized: true,
    resave: true,
    cookie: { secure: true }
}))
app.use(bodyParser.raw({ type: 'text/csv', limit: '5mb' }));
app.use(bodyParser.json());

app.use(cors())

app.use(express.static('public'));

app.post('/table/upload', async (req, res) => {
    // takes a plaintext csv
    // returns a table id

    if (req.headers['content-type'] !== 'text/csv') {
        return res.status(400).send('Invalid file type');
    }

    const data = parse(req.body, {
        columns: true,
        cast: true,
        castDate: true,
    });

    const cols = Object.keys(data[0]).filter(col => col !== "id");
    const escapeCol = (col) => pg.escapeIdentifier(col.toLowerCase());
    const schema = cols.map((col) => {
        return `${escapeCol(col)} ${getPgType(data.find(row => valueOrBlank(row[col]) !== null)?.[col])}`;
    })
    schema.push('id SERIAL PRIMARY KEY');
    const schemaText = schema.join(', ');

    const tableName = `table_${Math.random().toString(36).substring(7)}`; //TODO: make this better
    const escapedTableName = pg.escapeIdentifier(tableName);
    await client.query(`CREATE TABLE ${escapedTableName} (${schemaText})`); //TODO: this can def inject sql

    for (const row of data) {
        try {
            const statement = `INSERT INTO ${escapedTableName} (${cols.map(escapeCol).join(', ')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')})`;
            await client.query(statement, cols.map((col) => valueOrBlank(row[col])));
        } catch (e) {
            console.error(e);
        }
    }

    res.send({
        table: tableName,
    });
})

function valueOrBlank(val) {
    return val === null || val === undefined || val === "" ? null : val;
}

app.get('/table/:id', async (req, res) => {
    const table = req.params.id;
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 100;

    try {
        var q = await client.query(`SELECT * FROM ${pg.escapeIdentifier(table)} OFFSET ${offset} LIMIT ${limit};`);
    } catch (e) {
        console.error(e);
        return res.status(500).send({
            error: e.message,
        });
    }

    const rows = q.rows;
    const fields = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = ${pg.escapeLiteral(table)};`);

    res.send({
        rows,
        fields: fields.rows,
        pagination: {
            offset,
            limit,
        }
    });
})

app.post('/table/:id/query', async (req, res) => {
    const { query } = req.body;
    const table = req.params.id;

    let watchDog = true;
    const MAX_ITERATIONS = 3;
    let i = 0;
    let response, gptQuery;

    do {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: await generateStructuredMessage(table, query),
            temperature: 0.2,
            top_p: 0.1,
        });

        const sqlQuery = completion.choices[0].message.content;
        gptQuery = sqlQuery;

        //validate the query to ensure nothing malicious
        let validated = true;
        //is there more than one semi-colon?
        if (sqlQuery.split(';').length > 2) {
            validated = false;
        }
        //is there only one FROM statement with the correct table name?
        if (!sqlQuery.includes(table)) {
            validated = false;
        }

        //does this query add or remove data?
        if (sqlQuery.includes('INSERT') || sqlQuery.includes('UPDATE') || sqlQuery.includes('DELETE')) {
            validated = false;
        }

        if (validated) {
            try {
                response = await client.query(sqlQuery);
                watchDog = false;
            } catch (e) {
                console.error(e);
            }
        }
        i++;
    } while (watchDog && i < MAX_ITERATIONS)


    res.send({
        table: prepareTable(response?.rows || []),
        iterations: i,
        gptQuery
    });
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
}
);