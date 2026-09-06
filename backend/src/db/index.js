// Compatibility export while the database connection moves to src/config/db.js.
export { connectDatabase as default, connectDatabase, disconnectDatabase } from '../config/db.js';
