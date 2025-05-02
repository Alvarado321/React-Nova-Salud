const express = require('express');
const router = express.Router();
const db = require('./db');

router.get('/', (req, res) => {
    db.query('SELECT * FROM clientes', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        // Normalizar datos para evitar null/undefined
        const normalizados = results.map(c => ({
            id: c.id,
            nombre: c.nombre || '',
            apellido: c.apellido || '',
            dni: c.dni || '',
            telefono: c.telefono || '',
            direccion: c.direccion || ''
        }));
        res.json(normalizados);
    });
});

router.post('/', (req, res) => {
    const { nombre, apellido, dni, telefono, direccion } = req.body;
    db.query('INSERT INTO clientes (nombre, apellido, dni, telefono, direccion) VALUES (?, ?, ?, ?, ?)',
        [nombre, apellido, dni, telefono, direccion],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: result.insertId, nombre, apellido, dni, telefono, direccion });
        }
    );
});

// PUT (editar cliente)
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, dni, telefono, direccion } = req.body;
    db.query(
        'UPDATE clientes SET nombre=?, apellido=?, dni=?, telefono=?, direccion=? WHERE id=?',
        [nombre, apellido, dni, telefono, direccion, id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: Number(id), nombre, apellido, dni, telefono, direccion });
        }
    );
});

// DELETE (eliminar cliente)
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM clientes WHERE id=?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

module.exports = router;
