/**
 * @file db.js
 * @description Database connection configuration using Mongoose.
 * @author Emerson Sousa
 */

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1); // Encerra o processo se a conexão falhar
    }
};

module.exports = connectDB;