import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const port = process.env.PORT || 5000
const app = express();

app.listen(port, () => {
    console.log(`app is listening on port ${port}`)
});

