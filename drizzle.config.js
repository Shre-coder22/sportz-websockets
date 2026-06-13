import 'dotenv/config';

if(!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set in .env file');
}

export default {
  schema: './src/db/schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
