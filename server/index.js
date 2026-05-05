require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const vooRoutes = require('./src/routes/vooRoutes');

const app = express();

// Conectar ao Banco de Dados
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());


// --- ROTAS DO SISTEMA ---
app.use('/api/dashboard', require('./src/routes/DashboardRoutes'));
app.use('/api/clientes', require('./src/routes/clienteRoutes'));
app.use('/api/hoteis', require('./src/routes/hotelRoutes'));
app.use('/api/voos', vooRoutes);
// Em breve adicionaremos: app.use('/api/hoteis', require('./src/routes/hotelRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));