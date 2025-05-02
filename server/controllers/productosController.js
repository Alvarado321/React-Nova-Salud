const db = require('../config/conexion');

exports.getAll = (req, res) => {
    db.query('SELECT * FROM productos', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const normalizados = results.map(p => ({
            id: p.id,
            nombre: p.nombre || '',
            descripcion: p.descripcion || '',
            categoria: p.categoria || '',
            precio: Number(p.precio) || 0,
            stock: Number(p.stock) || 0,
            proveedor: p.proveedor || '',
            vencimiento: p.vencimiento ? p.vencimiento.toISOString ? p.vencimiento.toISOString().split('T')[0] : p.vencimiento : ''
        }));
        res.json(normalizados);
    });
};

exports.create = (req, res) => {
    const { nombre, descripcion, categoria, precio, stock, proveedor, vencimiento } = req.body;
    db.query('INSERT INTO productos (nombre, descripcion, categoria, precio, stock, proveedor, vencimiento) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nombre, descripcion, categoria, precio, stock, proveedor, vencimiento],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: result.insertId, nombre, descripcion, categoria, precio, stock, proveedor, vencimiento });
        }
    );
};

exports.update = (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, categoria, precio, stock, proveedor, vencimiento } = req.body;
    db.query(
        'UPDATE productos SET nombre=?, descripcion=?, categoria=?, precio=?, stock=?, proveedor=?, vencimiento=? WHERE id=?',
        [nombre, descripcion, categoria, precio, stock, proveedor, vencimiento, id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: Number(id), nombre, descripcion, categoria, precio, stock, proveedor, vencimiento });
        }
    );
};

exports.delete = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM productos WHERE id=?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
};
