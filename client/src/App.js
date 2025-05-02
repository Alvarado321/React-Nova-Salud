import React, { useState } from 'react';
import Inventario from './componentes/Inventario';
import Ventas from './componentes/Ventas';
import AtencionCliente from './componentes/AtencionCliente';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    const [vista, setVista] = useState('inventario');

    return (
        <div className="d-flex">
            <nav className="bg-primary text-white p-3 vh-100" style={{width: '220px', minWidth: '180px'}}>
                <h4 className="mb-4">Nova Salud</h4>
                <ul className="nav flex-column">
                    <li className="nav-item mb-2">
                        <button className={`nav-link btn btn-link text-white ${vista==='inventario'?'fw-bold':''}`} onClick={() => setVista('inventario')}>Inventario</button>
                    </li>
                    <li className="nav-item mb-2">
                        <button className={`nav-link btn btn-link text-white ${vista==='ventas'?'fw-bold':''}`} onClick={() => setVista('ventas')}>Ventas</button>
                    </li>
                    <li className="nav-item mb-2">
                        <button className={`nav-link btn btn-link text-white ${vista==='atencion'?'fw-bold':''}`} onClick={() => setVista('atencion')}>Clientes</button>
                    </li>
                </ul>
            </nav>
            <main className="flex-grow-1" style={{background: '#f8f9fa', minHeight: '100vh'}}>
                {vista === 'inventario' && <Inventario />}
                {vista === 'ventas' && <Ventas />}
                {vista === 'atencion' && <AtencionCliente />}
            </main>
        </div>
    );
}

export default App;
