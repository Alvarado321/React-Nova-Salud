import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const endpoint = isLogin ? 'http://localhost:4000/api/auth/login' : 'http://localhost:4000/api/auth/register';
        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    MySwal.fire('Error', data.error, 'error');
                } else {
                    MySwal.fire('¡Éxito!', isLogin ? 'Inicio de sesión exitoso' : 'Usuario registrado correctamente', 'success');
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
            })
            .catch((error) => {
                MySwal.fire('Error', 'Ha ocurrido un error al procesar la solicitud', 'error');
            });
    };

    if (isAuthenticated) {
        return null;
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h2 className="text-center mb-4">
                                {isLogin ? 'Iniciar Sesión' : 'Registrar Usuario'}
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        className={`form-control ${errors.correo ? 'is-invalid' : ''}`}
                                        name="correo"
                                        value={form.correo}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.correo && <div className="invalid-feedback">{errors.correo}</div>}
                                </div>
                                {!isLogin && (
                                    <>
                                        <div className="mb-3">
                                            <label className="form-label">Apellido Paterno</label>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.apellido_paterno ? 'is-invalid' : ''}`}
                                                name="apellido_paterno"
                                                value={form.apellido_paterno}
                                                onChange={handleChange}
                                                required
                                            />
                                            {errors.apellido_paterno && <div className="invalid-feedback">{errors.apellido_paterno}</div>}
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Apellido Materno</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="apellido_materno"
                                                value={form.apellido_materno}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Nombres</label>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.nombres ? 'is-invalid' : ''}`}
                                                name="nombres"
                                                value={form.nombres}
                                                onChange={handleChange}
                                                required
                                            />
                                            {errors.nombres && <div className="invalid-feedback">{errors.nombres}</div>}
                                        </div>
                                    </>
                                )}
                                <div className="mb-3">
                                    <label className="form-label">Contraseña</label>
                                    <input
                                        type="password"
                                        className={`form-control ${errors.contrasena ? 'is-invalid' : ''}`}
                                        name="contrasena"
                                        value={form.contrasena}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.contrasena && <div className="invalid-feedback">{errors.contrasena}</div>}
                                </div>
                                {!isLogin && (
                                    <div className="mb-3">
                                        <label className="form-label">Confirmar Contraseña</label>
                                        <input
                                            type="password"
                                            className={`form-control ${errors.confirmar_contrasena ? 'is-invalid' : ''}`}
                                            name="confirmar_contrasena"
                                            value={form.confirmar_contrasena}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.confirmar_contrasena && <div className="invalid-feedback">{errors.confirmar_contrasena}</div>}
                                    </div>
                                )}
                                <div className="text-center">
                                    <button type="submit" className="btn btn-primary">
                                        {isLogin ? 'Iniciar Sesión' : 'Registrar'}
                                    </button>
                                </div>
                            </form>
                            <div className="text-center mt-3">
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Auth;
