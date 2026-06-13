import 'dotenv/config';
import pg from 'pg';

const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
});

try {
    await client.connect();
    console.log("Connected successfully!");
    await client.end();
} catch (err) {
    console.error(err);
}