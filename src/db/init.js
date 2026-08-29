import fs from 'fs';
import path from 'path';
import db from './connection.js';

const schemaPath = path.join(import.meta.dirname, 'schema.sql');

const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

console.log('[db:init] schema applicato.');
