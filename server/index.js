const express = require('express');
const cors = require('cors');
const productosRutas = require('./productos');
const ventasRutas = require('./ventas');
const clientesRutas = require('./clientes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/productos', productosRutas);
app.use('/api/ventas', ventasRutas);
app.use('/api/clientes', clientesRutas);

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});
