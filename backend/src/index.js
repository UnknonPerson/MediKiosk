import app from './app.js';
import dotenv from 'dotenv';
import connectDB from './db/index.js';

dotenv.config({
    path:"./.env",
});

const port = process.env.PORT || 7200;

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server Is Live and Listining on port http://localhost:${port}`);
        })
    })
    .catch((error) => {
        console.log("Mongodb Connection Error", error);
        process.exit(1);
    })