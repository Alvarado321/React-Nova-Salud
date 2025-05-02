const express = require('express');
const router = express.Router();
const db = require('./db');

router.get('/', (req, res) => {
    const sql = `SELECT v.id, CONCAT(c.nombre, ' ', c.apellido) AS cliente, v.fecha, v.total
                 FROM ventas v
                 LEFT JOIN clientes c ON v.id_cliente = c.id`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        // Normalizar datos para evitar null/undefined
        const normalizados = results.map(v => ({
            id: v.id,
            cliente: v.cliente || '',
            fecha: v.fecha ? (typeof v.fecha === 'string' ? v.fecha.split('T')[0] : v.fecha) : '',
            total: Number(v.total) || 0
        }));
        res.json(normalizados);
    });
});

router.post('/', (req, res) => {
    const { cliente, productos, total } = req.body;
    // Buscar el id del cliente por nombre (simple, para demo)
    db.query('SELECT id FROM clientes WHERE nombre = ?', [cliente], (err, clientesRes) => {
        if (err || clientesRes.length === 0) return res.status(400).json({ error: 'Cliente no encontrado' });
        const id_cliente = clientesRes[0].id;
        db.query('INSERT INTO ventas (id_cliente, total) VALUES (?, ?)', [id_cliente, total], (err, ventaRes) => {
            if (err) return res.status(500).json({ error: err.message });
            // Aquí podrías agregar el detalle de productos vendidos
            res.json({ id: ventaRes.insertId, cliente, total, fecha: new Date().toISOString().slice(0, 19).replace('T', ' ') });
        });
    });
});

// PUT (editar venta)
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { cliente, total } = req.body;
    // Buscar el id del cliente por nombre (simple, para demo)
    db.query('SELECT id FROM clientes WHERE nombre = ?', [cliente], (err, clientesRes) => {
        if (err || clientesRes.length === 0) return res.status(400).json({ error: 'Cliente no encontrado' });
        const id_cliente = clientesRes[0].id;
        db.query('UPDATE ventas SET id_cliente=?, total=? WHERE id=?', [id_cliente, total, id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: Number(id), cliente, total });
        });
    });
});

// DELETE (eliminar venta)
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM ventas WHERE id=?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

module.exports = router;
