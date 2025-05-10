import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { dataTableConfig, formatFecha, formatMoneda } from '../utils/common';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const MySwal = withReactContent(Swal);

function Inventario() {
    const [productos, setProductos] = useState([]);
    const [form, setForm] = useState({
        nombre: '', descripcion: '', categoria: '', precio: '', 
        stock: '', proveedor: '', vencimiento: ''
    });
    const [filtro, setFiltro] = useState('');
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = () => {
        setLoading(true);
        fetch('http://localhost:4000/api/productos')
            .then(res => res.json())
            .then(data => {
                setProductos(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error al cargar productos:', error);
                setLoading(false);
            });
    };

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const agregarProducto = (e) => {
        e.preventDefault();
        fetch('http://localhost:4000/api/productos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...form,
                precio: parseFloat(form.precio),
                stock: parseInt(form.stock)
            })
        })
            .then(res => res.json())
            .then(data => {
                setProductos([...productos, data]);
                setForm({ nombre: '', descripcion: '', categoria: '', precio: '', stock: '', proveedor: '', vencimiento: '' });
                setMostrarFormulario(false);
                MySwal.fire('¡Éxito!', 'Producto agregado correctamente', 'success');
            });
    };

    const columnas = [
        {
            name: 'Nombre',
            selector: row => row.nombre,
            sortable: true,
            cell: row => (
                <div>
                    <div className="fw-bold">{row.nombre}</div>
                    <small className="text-muted">{row.categoria}</small>
                </div>
            )
        },
        {
            name: 'Stock',
            selector: row => row.stock,
            sortable: true,
            cell: row => (
                <div className={`badge ${row.stock < 5 ? 'bg-danger' : 'bg-success'}`}>
                    {row.stock}
                </div>
            )
        },
        {
            name: 'Precio',
            selector: row => row.precio,
            sortable: true,
            right: true,
            cell: row => `S/ ${formatMoneda(row.precio)}`
        },
        {
            name: 'Proveedor',
            selector: row => row.proveedor,
            sortable: true
        },
        {
            name: 'Vencimiento',
            selector: row => row.vencimiento,
            sortable: true,
            cell: row => formatFecha(row.vencimiento)
        },
        {
            name: 'Acciones',
            cell: row => (
                <div className="btn-group">
                    <button 
                        className="btn btn-outline-warning btn-sm" 
                        onClick={() => editarProducto(row)}
                        title="Editar"
                    >
                        <i className="bi bi-pencil"></i>
                    </button>
                    <button 
                        className="btn btn-outline-danger btn-sm" 
                        onClick={() => eliminarProducto(row)}
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

    const editarProducto = (producto) => {
        MySwal.fire({
            title: 'Editar Producto',
            html: (
                <div className="container">
                    <div className="mb-3">
                        <label className="form-label">Nombre</label>
                        <input className="form-control" defaultValue={producto.nombre} id="nombre" />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Descripción</label>
                        <input className="form-control" defaultValue={producto.descripcion} id="descripcion" />
                    </div>
                    <div className="row mb-3">
                        <div className="col">
                            <label className="form-label">Precio</label>
                            <input className="form-control" type="number" defaultValue={producto.precio} id="precio" />
                        </div>
                        <div className="col">
                            <label className="form-label">Stock</label>
                            <input className="form-control" type="number" defaultValue={producto.stock} id="stock" />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Vencimiento</label>
                        <input className="form-control" type="date" defaultValue={producto.vencimiento} id="vencimiento" />
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
                    descripcion: document.getElementById('descripcion').value,
                    precio: parseFloat(document.getElementById('precio').value),
                    stock: parseInt(document.getElementById('stock').value),
                    vencimiento: document.getElementById('vencimiento').value
                };

                fetch(`http://localhost:4000/api/productos/${producto.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                })
                    .then(res => res.json())
                    .then(data => {
                        setProductos(productos.map(p => p.id === producto.id ? data : p));
                        MySwal.fire('¡Actualizado!', 'Producto actualizado correctamente', 'success');
                    });
            }
        });
    };

    const eliminarProducto = (producto) => {
        MySwal.fire({
            title: '¿Eliminar producto?',
            text: `¿Estás seguro de eliminar ${producto.nombre}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`http://localhost:4000/api/productos/${producto.id}`, { method: 'DELETE' })
                    .then(res => res.json())
                    .then(() => {
                        setProductos(productos.filter(p => p.id !== producto.id));
                        MySwal.fire('¡Eliminado!', 'Producto eliminado correctamente', 'success');
                    });
            }
        });
    };

    const productosFiltrados = productos.filter(p =>
        Object.values(p).join(' ').toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>
                    <i className="bi bi-box-seam me-2"></i>
                    Inventario
                </h2>
                <button 
                    className="btn btn-primary" 
                    onClick={() => setMostrarFormulario(!mostrarFormulario)}
                >
                    <i className="bi bi-plus-lg me-2"></i>
                    Nuevo Producto
                </button>
            </div>

            <div className="alert alert-info d-flex align-items-center mb-4" role="alert">
                <i className="bi bi-info-circle-fill me-3 fs-4"></i>
                <div>
                    En esta sección podrás gestionar el inventario de productos. Aquí puedes agregar nuevos productos, 
                    actualizar existentes, controlar el stock y monitorear las fechas de vencimiento. 
                    Utiliza el buscador para filtrar productos específicos.
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card bg-primary text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="card-title mb-0">Total Productos</h6>
                                    <h2 className="mt-2 mb-0">{productos.length}</h2>
                                </div>
                                <i className="bi bi-box-seam fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-warning text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="card-title mb-0">Stock Bajo</h6>
                                    <h2 className="mt-2 mb-0">{productos.filter(p => p.stock < 5).length}</h2>
                                </div>
                                <i className="bi bi-exclamation-triangle fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-success text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="card-title mb-0">Stock Total</h6>
                                    <h2 className="mt-2 mb-0">{productos.reduce((acc, p) => acc + p.stock, 0)}</h2>
                                </div>
                                <i className="bi bi-box-arrow-up fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {mostrarFormulario && (
                <div className="card mb-4 shadow-sm">
                    <div className="card-body">
                        <form onSubmit={agregarProducto}>
                            <div className="row g-3">
                                <div className="col-md-4">
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
                                <div className="col-md-4">
                                    <label className="form-label">Descripción</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="descripcion" 
                                        value={form.descripcion} 
                                        onChange={handleChange} 
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Categoría</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="categoria" 
                                        value={form.categoria} 
                                        onChange={handleChange} 
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Precio</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        name="precio" 
                                        value={form.precio} 
                                        onChange={handleChange} 
                                        min="0" 
                                        step="0.01" 
                                        required 
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Stock</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        name="stock" 
                                        value={form.stock} 
                                        onChange={handleChange} 
                                        min="0" 
                                        required 
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Proveedor</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="proveedor" 
                                        value={form.proveedor} 
                                        onChange={handleChange} 
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Vencimiento</label>
                                    <input 
                                        type="date" 
                                        className="form-control" 
                                        name="vencimiento" 
                                        value={form.vencimiento} 
                                        onChange={handleChange} 
                                    />
                                </div>
                            </div>
                            <div className="text-end mt-3">
                                <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setMostrarFormulario(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <i className="bi bi-save me-2"></i>
                                    Guardar Producto
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
                                    placeholder="Buscar productos..."
                                    value={filtro}
                                    onChange={e => setFiltro(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <DataTable
                        columns={columnas}
                        data={productosFiltrados}
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
                                <i className="bi bi-inbox display-4 text-muted"></i>
                                <p className="text-muted">No hay productos registrados</p>
                            </div>
                        }
                    />
                </div>
            </div>
        </div>
    );
}

export default Inventario;
