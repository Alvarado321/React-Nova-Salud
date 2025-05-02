import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { motion, AnimatePresence } from 'framer-motion';
import './Auth.css';

const MySwal = withReactContent(Swal);

function Auth() {
    const [form, setForm] = useState({
        correo: '',
        apellido_paterno: '',
        apellido_materno: '',
        nombres: '',
        contrasena: '',
        confirmar_contrasena: ''
    });
    const [isLogin, setIsLogin] = useState(true);
    const [errors, setErrors] = useState({});
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Verificar si hay un token almacenado
        const token = localStorage.getItem('token');
        if (token) {
            // Verificar si el token es válido
            fetch('http://localhost:4000/api/auth/verify-token', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.user) {
                        setIsAuthenticated(true);
                        window.location.href = '/dashboard';
                    } else {
                        // Si el token no es válido, limpiar el localStorage
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                });
        }
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!isLogin) {
            if (!form.correo) newErrors.correo = 'El correo es requerido';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) newErrors.correo = 'Ingrese un correo válido';
            if (!form.apellido_paterno) newErrors.apellido_paterno = 'El apellido paterno es requerido';
            if (!form.nombres) newErrors.nombres = 'Los nombres son requeridos';
            if (form.contrasena.length < 6) newErrors.contrasena = 'La contraseña debe tener al menos 6 caracteres';
            if (form.contrasena !== form.confirmar_contrasena) newErrors.confirmar_contrasena = 'Las contraseñas no coinciden';
        } else {
            if (!form.correo) newErrors.correo = 'El correo es requerido';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) newErrors.correo = 'Ingrese un correo válido';
            if (!form.contrasena) newErrors.contrasena = 'La contraseña es requerida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        const endpoint = isLogin ? 'http://localhost:4000/api/auth/login' : 'http://localhost:4000/api/auth/register';
        
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await response.json();

            if (data.error) {
                MySwal.fire('Error', data.error, 'error');
            } else {
                MySwal.fire({
                    title: '¡Éxito!',
                    text: isLogin ? 'Inicio de sesión exitoso' : 'Usuario registrado correctamente',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500
                });
                
                if (isLogin) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = '/';
                } else {
                    setIsLogin(true);
                    setForm({
                        correo: form.correo,
                        contrasena: '',
                        confirmar_contrasena: ''
                    });
                }
            }
        } catch (error) {
            MySwal.fire('Error', 'Ha ocurrido un error al procesar la solicitud', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (isAuthenticated) {
        return null;
    }

    return (
        <div className="auth-container">
            <motion.div 
                className="auth-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="auth-header">
                    <img src="/logo192.png" alt="Logo" className="auth-logo" />
                    <h2 className="auth-title">
                        {isLogin ? 'Iniciar Sesión' : 'Registrar Usuario'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="form-group">
                            <label className="form-label">Correo Electrónico</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bi bi-envelope"></i>
                                </span>
                                <input
                                    type="email"
                                    className={`form-control ${errors.correo ? 'is-invalid' : ''}`}
                                    name="correo"
                                    value={form.correo}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            {errors.correo && <div className="invalid-feedback">{errors.correo}</div>}
                        </div>

                        <AnimatePresence>
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="form-group">
                                        <label className="form-label">Apellido Paterno</label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="bi bi-person"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.apellido_paterno ? 'is-invalid' : ''}`}
                                                name="apellido_paterno"
                                                value={form.apellido_paterno}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        {errors.apellido_paterno && <div className="invalid-feedback">{errors.apellido_paterno}</div>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Apellido Materno</label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="bi bi-person"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="apellido_materno"
                                                value={form.apellido_materno}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Nombres</label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="bi bi-person"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.nombres ? 'is-invalid' : ''}`}
                                                name="nombres"
                                                value={form.nombres}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        {errors.nombres && <div className="invalid-feedback">{errors.nombres}</div>}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="form-group">
                            <label className="form-label">Contraseña</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bi bi-lock"></i>
                                </span>
                                <input
                                    type="password"
                                    className={`form-control ${errors.contrasena ? 'is-invalid' : ''}`}
                                    name="contrasena"
                                    value={form.contrasena}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            {errors.contrasena && <div className="invalid-feedback">{errors.contrasena}</div>}
                        </div>

                        <AnimatePresence>
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="form-group">
                                        <label className="form-label">Confirmar Contraseña</label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="bi bi-lock"></i>
                                            </span>
                                            <input
                                                type="password"
                                                className={`form-control ${errors.confirmar_contrasena ? 'is-invalid' : ''}`}
                                                name="confirmar_contrasena"
                                                value={form.confirmar_contrasena}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        {errors.confirmar_contrasena && <div className="invalid-feedback">{errors.confirmar_contrasena}</div>}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button
                            type="submit"
                            className="btn btn-primary auth-submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                            ) : (
                                isLogin ? 'Iniciar Sesión' : 'Registrar'
                            )}
                        </motion.button>
                    </motion.div>
                </form>

                <motion.div
                    className="auth-switch"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <button
                        className="btn btn-link"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setErrors({});
                        }}
                    >
                        {isLogin
                            ? '¿No tienes una cuenta? Regístrate'
                            : '¿Ya tienes una cuenta? Inicia sesión'}
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default Auth;
