import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import listingRoutes from './routes/listing.js';

dotenv.config();
const port = process.env.PORT || 5000
const corsOptions = {
    origin: true,
    credentials: true
}
const app = express();

mongoose.set('strictQuery', false)
const connectDb = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log('MongoDb database connected')
    }catch(err){
        console.log('MongoDb database connection failed')
    }
}

// middlewares
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/listing', listingRoutes);

app.listen(port, () => {
    connectDb();
    console.log(`app is listening on port ${port}`)
});

