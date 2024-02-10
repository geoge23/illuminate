import { config } from 'dotenv';
import pg from 'pg';

config()

const client = new pg.Client()
await client.connect()

export default client;

