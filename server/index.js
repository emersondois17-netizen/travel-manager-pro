require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

const app = express();

// Conectar ao Banco de Dados
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// --- ROTAS DO SISTEMA ---
app.use('/api/clientes', require('./src/routes/clienteRoutes'));
app.use('/api/hoteis', require('./src/routes/hotelRoutes'));
// Em breve adicionaremos: app.use('/api/hoteis', require('./src/routes/hotelRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));