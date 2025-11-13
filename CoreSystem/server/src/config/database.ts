import knex, { Knex } from 'knex';
import config from '../../knexFile';


const environment = process.env.NODE_ENV || 'development';
const db: Knex = knex(config[environment]);

// Test database connection
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ PostgreSQL connected successfully');
  })
  .catch((err: Error) => {
    console.error('❌ PostgreSQL connection failed:', err);
    process.exit(1);
  });

export default db;