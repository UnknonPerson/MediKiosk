import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DataBase Connection Sucessfully Done");
    }catch(error){
        console.log("Mongodb connection Failed",error);
        process.exit(1);
    }
}

export default connectDB;