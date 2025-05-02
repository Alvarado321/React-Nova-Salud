import React, { useState } from 'react';
import Inventario from './components/Inventario';
import Ventas from './components/Ventas';
import AtencionCliente from './components/AtencionCliente';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
    const [vista, setVista] = useState('inventario');

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
                    <div className="d-flex align-items-center">
                        <i className="bi bi-person-circle fs-4 me-2"></i>
                        <div>
                            <small className="d-block">Bienvenido</small>
                            <strong>Usuario</strong>
                        </div>
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
}

export default App;

