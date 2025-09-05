import express from 'express';
import cors from 'cors'
import  "dotenv/config"
import authRouter from './routes/auth/index.js';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import passwordManagerRouter from './routes/password-manager/index.js';

const PORT = process.env.PORT || 5004;
const app = express()
app.use(cors({
    origin: ['https://password-manager-ui-chi.vercel.app', 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json())
app.use(cookieParser())

mongoose.connect(process.env.DATABASE_URI)

mongoose.connection.on('connected',()=> console.log("mongodb is connected"))
mongoose.connection.on('error',(error)=> console.log("mongodb is not connected", error)) 

app.get('/', (req ,res) => {
    res.send("hello world");
})
app.use('/api/auth', authRouter)
app.use('/api/password-manager', passwordManagerRouter)

app.listen(PORT,()=>{
    console.log(`PORT is running ${PORT}`);
})