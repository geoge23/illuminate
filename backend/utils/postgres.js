import { config } from 'dotenv';
import pg from 'pg';

config()

const client = new pg.Client()
await client.connect()

export default client;

/**
 * Returns the possible schema of text columns based on the first 100 rows of the table. It will identify 
 * common values and if >70% of the values are not unique, it will interpret as an enum and provide the
 * possible values.
 * 
 * @param {string} tableName - The name of the table to guess the schema for
 * @returns {Promise<object>} - An object with the column names as keys and their possible schema as values
 */
export async function guessEnums(tableName) {
    const columnNames = (await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = ${pg.escapeLiteral(tableName)};`)).rows.map(row => row.column_name);
    const q = await client.query(`SELECT ${columnNames.join(', ')} FROM ${pg.escapeIdentifier(tableName)} LIMIT 100;`);

    const columnSchemas = {};
    for (const row of q.rows) {
        for (const col of columnNames) {
            if (columnSchemas[col] === undefined) {
                columnSchemas[col] = {
                    type: typeof row[col],
                    values: {}
                }
            }
            if (!row[col]) {
                columnSchemas[col].values["BLANK"] = (columnSchemas[col].values["BLANK"] || 0) + 1;
            } else {
                columnSchemas[col].values[row[col]] = (columnSchemas[col].values[row[col]] || 0) + 1;
            }
        }
    }
    for (const col in columnSchemas) {
        const numBlank = columnSchemas[col].values["BLANK"] || 0;
        delete columnSchemas[col].values["BLANK"];

        if (Object.keys(columnSchemas[col].values).length < q.rowCount * 0.7 &&
            numBlank < q.rowCount * 0.4) {
            columnSchemas[col].type = 'enum';
            columnSchemas[col].values = Object.keys(columnSchemas[col].values);
        } else {
            columnSchemas[col].possibleValues = Object.keys(columnSchemas[col].values).slice(0, 5);
            delete columnSchemas[col].values;
        }
    }


    return columnSchemas;
}

export const jsToPgType = {
    string: 'text',
    number: 'int',
    boolean: 'bool',
    object: 'jsonb',
}