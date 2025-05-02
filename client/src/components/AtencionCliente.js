import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { dataTableConfig } from '../utils/common';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const MySwal = withReactContent(Swal);

function AtencionCliente() {
    const [clientes, setClientes] = useState([]);
    const [form, setForm] = useState({
        nombre: '', apellido: '', dni: '', telefono: '', direccion: ''
    });
    const [filtro, setFiltro] = useState('');
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarClientes();
    }, []);

    const cargarClientes = () => {
        setLoading(true);
        fetch('/api/clientes')
            .then(res => res.json())
            .then(data => {
                setClientes(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error al cargar clientes:', error);
                setLoading(false);
            });
    };

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const agregarCliente = (e) => {
        e.preventDefault();
        fetch('/api/clientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        })
            .then(res => res.json())
            .then(data => {
                setClientes([...clientes, data]);
                setForm({ nombre: '', apellido: '', dni: '', telefono: '', direccion: '' });
                setMostrarFormulario(false);
                MySwal.fire('¡Éxito!', 'Cliente registrado correctamente', 'success');
            });
    };

    const columnas = [
        {
            name: 'Cliente',
            selector: row => `${row.nombre} ${row.apellido}`,
            sortable: true,
            cell: row => (
                <div>
                    <div className="fw-bold">{row.nombre} {row.apellido}</div>
                    <small className="text-muted">DNI: {row.dni}</small>
                </div>
            )
        },
        {
            name: 'Teléfono',
            selector: row => row.telefono,
            sortable: true,
            cell: row => (
                <div>
                    <i className="bi bi-telephone me-2"></i>
                    {row.telefono}
                </div>
            )
        },
        {
            name: 'Dirección',
            selector: row => row.direccion,
            sortable: true,
            cell: row => (
                <div>
                    <i className="bi bi-geo-alt me-2"></i>
                    {row.direccion}
                </div>
            )
        },
        {
            name: 'Acciones',
            cell: row => (
                <div className="btn-group">
                    <button 
                        className="btn btn-outline-warning btn-sm" 
                        onClick={() => editarCliente(row)}
                        title="Editar"
                    >
                        <i className="bi bi-pencil"></i>
                    </button>
                    <button 
                        className="btn btn-outline-danger btn-sm" 
                        onClick={() => eliminarCliente(row)}
                        title="Eliminar"
                    >
                        <i className="bi bi-trash"></i>
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true
        }
    ];

    const editarCliente = (cliente) => {
        MySwal.fire({
            title: 'Editar Cliente',
            html: (
                <div className="container">
                    <div className="row mb-3">
                        <div className="col">
                            <label className="form-label">Nombre</label>
                            <input className="form-control" defaultValue={cliente.nombre} id="nombre" />
                        </div>
                        <div className="col">
                            <label className="form-label">Apellido</label>
                            <input className="form-control" defaultValue={cliente.apellido} id="apellido" />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">DNI</label>
                        <input className="form-control" defaultValue={cliente.dni} id="dni" />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Teléfono</label>
                        <input className="form-control" defaultValue={cliente.telefono} id="telefono" />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Dirección</label>
                        <input className="form-control" defaultValue={cliente.direccion} id="direccion" />
                    </div>
                </div>
            ),
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const datos = {
                    nombre: document.getElementById('nombre').value,
                    apellido: document.getElementById('apellido').value,
                    dni: document.getElementById('dni').value,
                    telefono: document.getElementById('telefono').value,
                    direccion: document.getElementById('direccion').value
                };

                fetch(`/api/clientes/${cliente.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                })
                    .then(res => res.json())
                    .then(data => {
                        setClientes(clientes.map(c => c.id === cliente.id ? data : c));
                        MySwal.fire('¡Actualizado!', 'Cliente actualizado correctamente', 'success');
                    });
            }
        });
    };

    const eliminarCliente = (cliente) => {
        MySwal.fire({
            title: '¿Eliminar cliente?',
            text: `¿Estás seguro de eliminar a ${cliente.nombre} ${cliente.apellido}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`/api/clientes/${cliente.id}`, { method: 'DELETE' })
                    .then(res => res.json())
                    .then(() => {
                        setClientes(clientes.filter(c => c.id !== cliente.id));
                        MySwal.fire('¡Eliminado!', 'Cliente eliminado correctamente', 'success');
                    });
            }
        });
    };

    const clientesFiltrados = clientes.filter(c =>
        Object.values(c).join(' ').toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>
                    <i className="bi bi-people me-2"></i>
                    Atención al Cliente
                </h2>
                <button 
                    className="btn btn-primary" 
                    onClick={() => setMostrarFormulario(!mostrarFormulario)}
                >
                    <i className="bi bi-person-plus me-2"></i>
                    Nuevo Cliente
                </button>
            </div>

            {mostrarFormulario && (
                <div className="card mb-4 shadow-sm">
                    <div className="card-body">
                        <form onSubmit={agregarCliente}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Nombre</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="nombre" 
                                        value={form.nombre} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Apellido</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="apellido" 
                                        value={form.apellido} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">DNI</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="dni" 
                                        value={form.dni} 
                                        onChange={handleChange} 
                                        required 
                                        pattern="[0-9]{8}" 
                                        title="DNI debe tener 8 dígitos"
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Teléfono</label>
                                    <input 
                                        type="tel" 
                                        className="form-control" 
                                        name="telefono" 
                                        value={form.telefono} 
                                        onChange={handleChange} 
                                        required 
                                        pattern="[0-9]{9}" 
                                        title="Teléfono debe tener 9 dígitos"
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Dirección</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="direccion" 
                                        value={form.direccion} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="text-end mt-3">
                                <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setMostrarFormulario(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <i className="bi bi-save me-2"></i>
                                    Guardar Cliente
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="row mb-3">
                        <div className="col">
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bi bi-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar clientes..."
                                    value={filtro}
                                    onChange={e => setFiltro(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <DataTable
                        columns={columnas}
                        data={clientesFiltrados}
                        pagination
                        paginationComponentOptions={dataTableConfig}
                        highlightOnHover
                        pointerOnHover
                        striped
                        responsive
                        progressPending={loading}
                        progressComponent={
                            <div className="text-center p-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                                <p className="mt-2">Cargando datos...</p>
                            </div>
                        }
                        noDataComponent={
                            <div className="text-center p-4">
                                <i className="bi bi-people display-4 text-muted"></i>
                                <p className="text-muted">No hay clientes registrados</p>
                            </div>
                        }
                    />
                </div>
            </div>
        </div>
    );
}

export default AtencionCliente;
