import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import 'bootstrap/dist/css/bootstrap.min.css';

const MySwal = withReactContent(Swal);

function formatFecha(fecha) {
    if (!fecha) return '';
    const d = new Date(fecha);
    if (isNaN(d)) return fecha;
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
        ' ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const columnas = [
    { name: 'Nombre', selector: row => row.nombre, sortable: true },
    { name: 'Descripción', selector: row => row.descripcion, sortable: true },
    { name: 'Categoría', selector: row => row.categoria, sortable: true },
    { name: 'Precio', selector: row => {
        const precioNum = Number(row.precio);
        return isNaN(precioNum) ? '-' : `$${precioNum.toFixed(2)}`;
    }, sortable: true, right: true },
    { name: 'Stock', selector: row => row.stock, sortable: true, right: true },
    { name: 'Proveedor', selector: row => row.proveedor, sortable: true },
    { name: 'Vencimiento', selector: row => formatFecha(row.vencimiento), sortable: true },
    { name: 'Alerta', cell: row => row.stock < 5 ? <span className="text-danger">Bajo stock</span> : '', ignoreRowClick: true, allowOverflow: true, button: true },
    { name: 'Acciones', cell: row => (
        <>
            <button className="btn btn-warning btn-sm me-2" onClick={() => editarProducto(row)}>Editar</button>
            <button className="btn btn-danger btn-sm" onClick={() => eliminarProducto(row)}>Eliminar</button>
        </>
    ), ignoreRowClick: true, allowOverflow: true, button: true }
];

let editarProducto, eliminarProducto; // Se asignan después

function Inventario() {
    const [productos, setProductos] = useState([]);
    const [form, setForm] = useState({
        nombre: '', descripcion: '', categoria: '', precio: '', stock: '', proveedor: '', vencimiento: ''
    });
    const [filtro, setFiltro] = useState('');

    useEffect(() => {
        fetch('/api/productos')
            .then(res => res.json())
            .then(data => setProductos(data));
    }, []);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const agregarProducto = (e) => {
        e.preventDefault();
        fetch('/api/productos', {
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
                MySwal.fire('¡Agregado!', 'Producto registrado correctamente', 'success');
            });
    };

    editarProducto = (row) => {
        MySwal.fire({
            title: 'Editar producto',
            html: (
                <div>
                    <input className="swal2-input" placeholder="Nombre" defaultValue={row.nombre} id="nombre" />
                    <input className="swal2-input" placeholder="Descripción" defaultValue={row.descripcion} id="descripcion" />
                    <input className="swal2-input" placeholder="Categoría" defaultValue={row.categoria} id="categoria" />
                    <input className="swal2-input" placeholder="Precio" type="number" defaultValue={row.precio} id="precio" />
                    <input className="swal2-input" placeholder="Stock" type="number" defaultValue={row.stock} id="stock" />
                    <input className="swal2-input" placeholder="Proveedor" defaultValue={row.proveedor} id="proveedor" />
                    <input className="swal2-input" placeholder="Vencimiento" type="date" defaultValue={row.vencimiento} id="vencimiento" />
                </div>
            ),
            showCancelButton: true,
            preConfirm: () => {
                return {
                    nombre: document.getElementById('nombre').value,
                    descripcion: document.getElementById('descripcion').value,
                    categoria: document.getElementById('categoria').value,
                    precio: parseFloat(document.getElementById('precio').value),
                    stock: parseInt(document.getElementById('stock').value),
                    proveedor: document.getElementById('proveedor').value,
                    vencimiento: document.getElementById('vencimiento').value
                };
            }
        }).then(result => {
            if (result.isConfirmed) {
                fetch(`/api/productos/${row.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(result.value)
                })
                    .then(res => res.json())
                    .then(data => {
                        setProductos(productos.map(p => p.id === row.id ? { ...data } : p));
                        MySwal.fire('¡Actualizado!', 'Producto editado correctamente', 'success');
                    });
            }
        });
    };

    eliminarProducto = (row) => {
        MySwal.fire({
            title: '¿Eliminar producto?',
            text: `¿Seguro que deseas eliminar "${row.nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(result => {
            if (result.isConfirmed) {
                fetch(`/api/productos/${row.id}`, { method: 'DELETE' })
                    .then(res => res.json())
                    .then(() => {
                        setProductos(productos.filter(p => p.id !== row.id));
                        MySwal.fire('¡Eliminado!', 'Producto eliminado correctamente', 'success');
                    });
            }
        });
    };

    const productosFiltrados = productos.filter(p =>
        Object.values(p).join(' ').toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className="container mt-4">
            <h2>Inventario</h2>
            <form className="mb-3" onSubmit={agregarProducto}>
                <div className="row g-2 align-items-center">
                    <div className="col-md-2">
                        <input type="text" className="form-control" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
                    </div>
                    <div className="col-md-2">
                        <input type="text" className="form-control" name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} />
                    </div>
                    <div className="col-md-2">
                        <input type="text" className="form-control" name="categoria" placeholder="Categoría" value={form.categoria} onChange={handleChange} />
                    </div>
                    <div className="col-md-1">
                        <input type="number" className="form-control" name="precio" placeholder="Precio" value={form.precio} onChange={handleChange} min="0" step="0.01" required />
                    </div>
                    <div className="col-md-1">
                        <input type="number" className="form-control" name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} min="0" required />
                    </div>
                    <div className="col-md-2">
                        <input type="text" className="form-control" name="proveedor" placeholder="Proveedor" value={form.proveedor} onChange={handleChange} />
                    </div>
                    <div className="col-md-2">
                        <input type="date" className="form-control" name="vencimiento" placeholder="Vencimiento" value={form.vencimiento} onChange={handleChange} />
                    </div>
                    <div className="col-md-1">
                        <button className="btn btn-primary" type="submit">Agregar</button>
                    </div>
                </div>
            </form>
            <div className="mb-2">
                <input className="form-control" placeholder="Buscar..." value={filtro} onChange={e => setFiltro(e.target.value)} />
            </div>
            <DataTable
                columns={columnas}
                data={productosFiltrados}
                pagination
                highlightOnHover
                striped
                responsive
                noDataComponent="No hay productos registrados"
                persistTableHead
            />
        </div>
    );
}

export default Inventario;
