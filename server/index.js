const express = require('express');
const cors = require('cors');
const productosRutas = require('./routes/productos');
const ventasRutas = require('./routes/ventas');
const clientesRutas = require('./routes/clientes');
const authRutas = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRutas);
app.use('/api/productos', productosRutas);
app.use('/api/ventas', ventasRutas);
app.use('/api/clientes', clientesRutas);

const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});
