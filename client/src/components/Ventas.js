import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Select from 'react-select';
import { dataTableConfig, formatFecha, formatMoneda } from '../utils/common';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const MySwal = withReactContent(Swal);

function Ventas() {
    const [ventas, setVentas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [productos, setProductos] = useState([]);
    const [venta, setVenta] = useState({ cliente: '', productos: [], total: 0 });
    const [productoSeleccionado, setProductoSeleccionado] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [filtro, setFiltro] = useState('');
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = () => {
        setLoading(true);
        Promise.all([
            fetch('/api/ventas').then(res => res.json()),
            fetch('/api/clientes').then(res => res.json()),
            fetch('/api/productos').then(res => res.json())
        ]).then(([ventasData, clientesData, productosData]) => {
            setVentas(ventasData);
            setClientes(clientesData);
            setProductos(productosData);
            setLoading(false);
        }).catch(error => {
            console.error('Error al cargar datos:', error);
            setLoading(false);
        });
    };

    const handleCliente = e => setVenta({ ...venta, cliente: e.target.value });

    const agregarProductoAVenta = () => {
        if (!productoSeleccionado || cantidad < 1) {
            MySwal.fire('Error', 'Seleccione un producto y una cantidad válida', 'error');
            return;
        }

        const prod = productos.find(p => p.id === parseInt(productoSeleccionado));
        if (!prod) return;

        if (prod.stock < cantidad) {
            MySwal.fire('Error', 'No hay suficiente stock disponible', 'error');
            return;
        }

        const yaAgregado = venta.productos.find(p => p.id === prod.id);
        if (yaAgregado) {
            MySwal.fire('Error', 'Este producto ya está en la venta. Edite la cantidad si desea modificarla.', 'error');
            return;
        }

        const nuevoProducto = { ...prod, cantidad: parseInt(cantidad) };
        const nuevosProductos = [...venta.productos, nuevoProducto];
        const nuevoTotal = nuevosProductos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
        
        setVenta({ ...venta, productos: nuevosProductos, total: nuevoTotal });
        setProductoSeleccionado('');
        setCantidad(1);
    };

    const quitarProducto = (id) => {
        const nuevosProductos = venta.productos.filter(p => p.id !== id);
        const nuevoTotal = nuevosProductos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
        setVenta({ ...venta, productos: nuevosProductos, total: nuevoTotal });
    };

    const registrarVenta = (e) => {
        e.preventDefault();
        if (!venta.cliente || venta.productos.length === 0) {
            MySwal.fire('Error', 'Seleccione un cliente y al menos un producto', 'error');
            return;
        }

        fetch('/api/ventas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cliente: clientes.find(c => c.id === parseInt(venta.cliente)).nombre,
                productos: venta.productos,
                total: venta.total
            })
        })
            .then(res => res.json())
            .then(data => {
                setVentas([...ventas, data]);
                setVenta({ cliente: '', productos: [], total: 0 });
                setMostrarFormulario(false);
                MySwal.fire('¡Éxito!', 'Venta registrada correctamente', 'success');
            });
    };

    const columnas = [
        {
            name: 'Cliente',
            selector: row => row.cliente,
            sortable: true,
            cell: row => (
                <div>
                    <i className="bi bi-person me-2"></i>
                    {row.cliente}
                </div>
            )
        },
        {
            name: 'Fecha',
            selector: row => row.fecha,
            sortable: true,
            cell: row => (
                <div>
                    <i className="bi bi-calendar me-2"></i>
                    {formatFecha(row.fecha)}
                </div>
            )
        },
        {
            name: 'Total',
            selector: row => row.total,
            sortable: true,
            right: true,
            cell: row => (
                <div className="fw-bold text-success">
                    S/ {formatMoneda(row.total)}
                </div>
            )
        },
        {
            name: 'Acciones',
            cell: row => (
                <div className="btn-group">
                    <button 
                        className="btn btn-outline-info btn-sm" 
                        onClick={() => verDetalle(row)}
                        title="Ver detalle"
                    >
                        <i className="bi bi-eye"></i>
                    </button>
                    <button 
                        className="btn btn-outline-danger btn-sm" 
                        onClick={() => eliminarVenta(row)}
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

    const verDetalle = (venta) => {
        MySwal.fire({
            title: 'Detalle de Venta',
            html: (
                <div className="container">
                    <div className="row mb-3">
                        <div className="col">
                            <strong>Cliente:</strong> {venta.cliente}
                        </div>
                        <div className="col">
                            <strong>Fecha:</strong> {formatFecha(venta.fecha)}
                        </div>
                    </div>
                    <div className="text-end mb-3">
                        <h4 className="text-success">Total: S/ {formatMoneda(venta.total)}</h4>
                    </div>
                </div>
            ),
            confirmButtonText: 'Cerrar'
        });
    };

    const eliminarVenta = (venta) => {
        MySwal.fire({
            title: '¿Eliminar venta?',
            text: `¿Está seguro de eliminar la venta de ${venta.cliente}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`/api/ventas/${venta.id}`, { method: 'DELETE' })
                    .then(res => res.json())
                    .then(() => {
                        setVentas(ventas.filter(v => v.id !== venta.id));
                        MySwal.fire('¡Eliminado!', 'Venta eliminada correctamente', 'success');
                    });
            }
        });
    };

    const ventasFiltradas = ventas.filter(v =>
        Object.values(v).join(' ').toLowerCase().includes(filtro.toLowerCase())
    );

    const opcionesProductos = productos.map(p => ({
        value: p.id,
        label: `${p.nombre} - Stock: ${p.stock} - S/ ${formatMoneda(p.precio)}`,
        isDisabled: p.stock < 1
    }));

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>
                    <i className="bi bi-cart-check me-2"></i>
                    Ventas
                </h2>
                <button 
                    className="btn btn-primary" 
                    onClick={() => setMostrarFormulario(!mostrarFormulario)}
                >
                    <i className="bi bi-plus-lg me-2"></i>
                    Nueva Venta
                </button>
            </div>

            <div className="alert alert-info d-flex align-items-center mb-4" role="alert">
                <i className="bi bi-info-circle-fill me-3 fs-4"></i>
                <div>
                    En esta sección podrás gestionar las ventas de productos. Registra nuevas ventas, 
                    visualiza el historial de transacciones y realiza un seguimiento de los ingresos. 
                    Utiliza el buscador para encontrar ventas específicas.
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card bg-primary text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="card-title mb-0">Total Ventas</h6>
                                    <h2 className="mt-2 mb-0">{ventas.length}</h2>
                                </div>
                                <i className="bi bi-cart-check fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-success text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="card-title mb-0">Ingresos Totales</h6>
                                    <h2 className="mt-2 mb-0">S/ {formatMoneda(ventas.reduce((acc, v) => acc + v.total, 0))}</h2>
                                </div>
                                <i className="bi bi-currency-dollar fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-info text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="card-title mb-0">Ventas Hoy</h6>
                                    <h2 className="mt-2 mb-0">{ventas.filter(v => new Date(v.fecha).toDateString() === new Date().toDateString()).length}</h2>
                                </div>
                                <i className="bi bi-calendar-check fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {mostrarFormulario && (
                <div className="card mb-4 shadow-sm">
                    <div className="card-body">
                        <form onSubmit={registrarVenta}>
                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Cliente</label>
                                    <select 
                                        className="form-select" 
                                        value={venta.cliente} 
                                        onChange={handleCliente}
                                        required
                                    >
                                        <option value="">Seleccione un cliente</option>
                                        {clientes.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.nombre} {c.apellido} - DNI: {c.dni}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="card mb-4">
                                <div className="card-header bg-light">
                                    <h5 className="card-title mb-0">Agregar Productos</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                    <div className="col-md-6">
                                        <Select
                                            options={opcionesProductos}
                                            value={opcionesProductos.find(option => option.value === productoSeleccionado)}
                                            onChange={option => setProductoSeleccionado(option ? option.value : '')}
                                            isSearchable
                                            placeholder="Seleccione un producto"
                                            isOptionDisabled={option => option.isDisabled} 
                                        />
                                    </div>
                                        <div className="col-md-3">
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                placeholder="Cantidad" 
                                                value={cantidad} 
                                                onChange={e => setCantidad(e.target.value)}
                                                min="1"
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <button 
                                                type="button" 
                                                className="btn btn-success w-100"
                                                onClick={agregarProductoAVenta}
                                            >
                                                <i className="bi bi-plus-lg me-2"></i>
                                                Agregar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card mb-4">
                                <div className="card-header bg-light">
                                    <h5 className="card-title mb-0">Productos en la venta</h5>
                                </div>
                                <div className="card-body">
                                    {venta.productos.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Producto</th>
                                                        <th className="text-center">Cantidad</th>
                                                        <th className="text-end">Precio Unit.</th>
                                                        <th className="text-end">Subtotal</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {venta.productos.map(p => (
                                                        <tr key={p.id}>
                                                            <td>{p.nombre}</td>
                                                            <td className="text-center">{p.cantidad}</td>
                                                            <td className="text-end">S/ {formatMoneda(p.precio)}</td>
                                                            <td className="text-end">S/ {formatMoneda(p.precio * p.cantidad)}</td>
                                                            <td className="text-end">
                                                                <button 
                                                                    type="button" 
                                                                    className="btn btn-outline-danger btn-sm"
                                                                    onClick={() => quitarProducto(p.id)}
                                                                >
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr>
                                                        <td colSpan="3" className="text-end fw-bold">Total:</td>
                                                        <td className="text-end fw-bold text-success">S/ {formatMoneda(venta.total)}</td>
                                                        <td></td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted p-4">
                                            <i className="bi bi-cart-x display-4"></i>
                                            <p>No hay productos agregados</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-end">
                                <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setMostrarFormulario(false)}>
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={!venta.cliente || venta.productos.length === 0}
                                >
                                    <i className="bi bi-check-lg me-2"></i>
                                    Registrar Venta
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
                                    placeholder="Buscar ventas..."
                                    value={filtro}
                                    onChange={e => setFiltro(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <DataTable
                        columns={columnas}
                        data={ventasFiltradas}
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
                                <i className="bi bi-cart-x display-4 text-muted"></i>
                                <p className="text-muted">No hay ventas registradas</p>
                            </div>
                        }
                    />
                </div>
            </div>
        </div>
    );
}

export default Ventas;
