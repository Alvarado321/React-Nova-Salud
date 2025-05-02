const db = require('../config/conexion');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'nova_salud_secret_key_2024';

exports.login = (req, res) => {
    const { correo, contrasena } = req.body;

    db.query('SELECT * FROM usuarios WHERE correo = ?', [correo], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(contrasena, user.contrasena);
        if (!isPasswordValid) return res.status(401).json({ error: 'Credenciales inválidas' });

        const { contrasena: _, ...userWithoutPassword } = user;
        
        const token = jwt.sign(
            { 
                id: user.id, 
                correo: user.correo,
                nombres: user.nombres,
                apellido_paterno: user.apellido_paterno,
                apellido_materno: user.apellido_materno
            }, 
            SECRET_KEY,
            { expiresIn: '1h' }
        );
        
        res.json({ 
            token,
            user: userWithoutPassword
        });
    });
};

exports.register = async (req, res) => {
    const { correo, contrasena, nombres, apellido_paterno, apellido_materno } = req.body;

    try {
        db.query('SELECT * FROM usuarios WHERE correo = ?', [correo], async (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length > 0) return res.status(400).json({ error: 'El correo ya está registrado' });

            const hashedPassword = await bcrypt.hash(contrasena, 10);

            db.query(
                'INSERT INTO usuarios (correo, contrasena, nombres, apellido_paterno, apellido_materno) VALUES (?, ?, ?, ?, ?)',
                [correo, hashedPassword, nombres, apellido_paterno, apellido_materno],
                (err, result) => {
                    if (err) return res.status(500).json({ error: err.message });
                    
                    const newUser = {
                        id: result.insertId,
                        correo,
                        nombres,
                        apellido_paterno,
                        apellido_materno
                    };

                    const token = jwt.sign(
                        { 
                            id: newUser.id,
                            correo: newUser.correo,
                            nombres: newUser.nombres,
                            apellido_paterno: newUser.apellido_paterno,
                            apellido_materno: newUser.apellido_materno
                        },
                        SECRET_KEY,
                        { expiresIn: '1h' }
                    );

                    res.status(201).json({
                        token,
                        user: newUser
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.verifyToken = (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token inválido' });
        res.json({ message: 'Token válido', user: decoded });
    });
};