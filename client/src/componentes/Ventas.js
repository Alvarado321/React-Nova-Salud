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
    { name: 'Cliente', selector: row => row.cliente, sortable: true },
    { name: 'Fecha', selector: row => formatFecha(row.fecha), sortable: true },
    { name: 'Total', selector: row => {
        const totalNum = Number(row.total);
        return isNaN(totalNum) ? '-' : `$${totalNum.toFixed(2)}`;
    }, sortable: true, right: true },
    { name: 'Detalle', cell: row => <button className="btn btn-info btn-sm">Ver</button>, ignoreRowClick: true, allowOverflow: true, button: true },
    { name: 'Acciones', cell: row => (
        <>
            <button className="btn btn-warning btn-sm me-2" onClick={() => editarVenta(row)}>Editar</button>
            <button className="btn btn-danger btn-sm" onClick={() => eliminarVenta(row)}>Eliminar</button>
        </>
    ), ignoreRowClick: true, allowOverflow: true, button: true }
];

let editarVenta, eliminarVenta;

function Ventas() {
    const [ventas, setVentas] = useState([]);
    const [form, setForm] = useState({ cliente: '', productos: '', total: '' });
    const [filtro, setFiltro] = useState('');

    useEffect(() => {
        fetch('/api/ventas')
            .then(res => res.json())
            .then(data => setVentas(data));
    }, []);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const agregarVenta = (e) => {
        e.preventDefault();
        fetch('/api/ventas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        })
            .then(res => res.json())
            .then(data => {
                setVentas([...ventas, data]);
                setForm({ cliente: '', productos: '', total: '' });
                MySwal.fire('¡Agregado!', 'Venta registrada correctamente', 'success');
            });
    };

    editarVenta = (row) => {
        MySwal.fire({
            title: 'Editar venta',
            html: (
                <div>
                    <input className="swal2-input" placeholder="Cliente" defaultValue={row.cliente} id="cliente" />
                    <input className="swal2-input" placeholder="Total" type="number" defaultValue={row.total} id="total" />
                </div>
            ),
            showCancelButton: true,
            preConfirm: () => {
                return {
                    cliente: document.getElementById('cliente').value,
                    total: parseFloat(document.getElementById('total').value)
                };
            }
        }).then(result => {
            if (result.isConfirmed) {
                fetch(`/api/ventas/${row.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(result.value)
                })
                    .then(res => res.json())
                    .then(data => {
                        setVentas(ventas.map(v => v.id === row.id ? { ...data } : v));
                        MySwal.fire('¡Actualizado!', 'Venta editada correctamente', 'success');
                    });
            }
        });
    };

    eliminarVenta = (row) => {
        MySwal.fire({
            title: '¿Eliminar venta?',
            text: `¿Seguro que deseas eliminar la venta de "${row.cliente}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(result => {
            if (result.isConfirmed) {
                fetch(`/api/ventas/${row.id}`, { method: 'DELETE' })
                    .then(res => res.json())
                    .then(() => {
                        setVentas(ventas.filter(v => v.id !== row.id));
                        MySwal.fire('¡Eliminado!', 'Venta eliminada correctamente', 'success');
                    });
            }
        });
    };

    const ventasFiltradas = ventas.filter(v =>
        Object.values(v).join(' ').toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className="container mt-4">
            <h2>Ventas</h2>
            <form className="mb-3" onSubmit={agregarVenta}>
                <div className="row g-2 align-items-center">
                    <div className="col-md-4">
                        <input type="text" className="form-control" name="cliente" placeholder="Cliente" value={form.cliente} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                        <input type="text" className="form-control" name="productos" placeholder="Productos (ej: Paracetamol x2)" value={form.productos} onChange={handleChange} required />
                    </div>
                    <div className="col-md-2">
                        <input type="number" className="form-control" name="total" placeholder="Total" value={form.total} onChange={handleChange} min="0" step="0.01" required />
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-primary" type="submit">Registrar</button>
                    </div>
                </div>
            </form>
            <div className="mb-2">
                <input className="form-control" placeholder="Buscar..." value={filtro} onChange={e => setFiltro(e.target.value)} />
            </div>
            <DataTable
                columns={columnas}
                data={ventasFiltradas}
                pagination
                highlightOnHover
                striped
                responsive
                noDataComponent="No hay ventas registradas"
                persistTableHead
            />
        </div>
    );
}

export default Ventas;
