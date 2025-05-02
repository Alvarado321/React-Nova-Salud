import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import Auth from './components/Auth';
import Ventas from './components/Ventas';
import Inventario from './components/Inventario';
import AtencionCliente from './components/AtencionCliente';

// Componente de protección de rutas
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/" replace />;
    }
    return children;
};

// Componente de navegación
const Navigation = () => {
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [vista, setVista] = React.useState('inventario');

    return (
        <div className="d-flex">
            <nav className="bg-dark text-white p-3 vh-100 position-fixed"
                style={{
                    width: '250px',
                    zIndex: 1000
                }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="m-0">Nova Salud</h4>
                </div>

                <div className="text-center mb-4">
                    <img
                        src="/logo192.png"
                        alt="Logo"
                        className="img-fluid"
                        style={{
                            width: '100px'
                        }}
                    />
                </div>

                <ul className="nav flex-column">
                    <li className="nav-item mb-2">
                        <button
                            className={`nav-link btn btn-link text-white w-100 text-start ${vista === 'inventario' ? 'active bg-primary rounded' : ''}`}
                            onClick={() => setVista('inventario')}
                        >
                            <i className="bi bi-box-seam me-2"></i>
                            Inventario
                        </button>
                    </li>
                    <li className="nav-item mb-2">
                        <button
                            className={`nav-link btn btn-link text-white w-100 text-start ${vista === 'ventas' ? 'active bg-primary rounded' : ''}`}
                            onClick={() => setVista('ventas')}
                        >
                            <i className="bi bi-cart-check me-2"></i>
                            Ventas
                        </button>
                    </li>
                    <li className="nav-item mb-2">
                        <button
                            className={`nav-link btn btn-link text-white w-100 text-start ${vista === 'atencion' ? 'active bg-primary rounded' : ''}`}
                            onClick={() => setVista('atencion')}
                        >
                            <i className="bi bi-people me-2"></i>
                            Clientes
                        </button>
                    </li>
                </ul>

                <div className="position-absolute bottom-0 start-0 p-3 w-100">
                    <div className="d-flex align-items-center mb-3">
                        <i className="bi bi-person-circle fs-4 me-2"></i>
                        <div>
                            <small className="d-block">Bienvenido</small>
                            <strong>{user.nombres} {user.apellido_paterno}</strong>
                        </div>
                    </div>
                    <div className="text-center">
                        <button
                            className="btn btn-outline-light"
                            onClick={handleLogout}>Cerrar Sesión
                        </button>
                    </div>
                </div>
            </nav>

            <main className="flex-grow-1 bg-light" style={{
                marginLeft: '250px',
                minHeight: '100vh'
            }}>
                <div className="container-fluid p-4">
                    {vista === 'inventario' && <Inventario />}
                    {vista === 'ventas' && <Ventas />}
                    {vista === 'atencion' && <AtencionCliente />}
                </div>
            </main>
        </div>
    );
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Auth />} />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <>
                            <Navigation />
                            <div className="container mt-4">
                                <h1>Dashboard</h1>
                                {/* Aquí va el contenido del dashboard */}
                            </div>
                        </>
                    </ProtectedRoute>
                } />
                <Route path="/ventas" element={
                    <ProtectedRoute>
                        <>
                            <Navigation />
                            <Ventas />
                        </>
                    </ProtectedRoute>
                } />
                <Route path="/inventario" element={
                    <ProtectedRoute>
                        <>
                            <Navigation />
                            <Inventario />
                        </>
                    </ProtectedRoute>
                } />
                <Route path="/atencion-cliente" element={
                    <ProtectedRoute>
                        <>
                            <Navigation />
                            <AtencionCliente />
                        </>
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}

export default App;

