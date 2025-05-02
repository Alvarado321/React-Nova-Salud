import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import 'bootstrap/dist/css/bootstrap.min.css';

const MySwal = withReactContent(Swal);

const columnas = [
    { name: 'Nombre', selector: row => row.nombre, sortable: true },
    { name: 'Apellido', selector: row => row.apellido, sortable: true },
    { name: 'DNI', selector: row => row.dni, sortable: true },
    { name: 'Teléfono', selector: row => row.telefono, sortable: true },
    { name: 'Dirección', selector: row => row.direccion, sortable: true },
    { name: 'Acciones', cell: row => (
        <>
            <button className="btn btn-warning btn-sm me-2" onClick={() => editarCliente(row)}>Editar</button>
            <button className="btn btn-danger btn-sm" onClick={() => eliminarCliente(row)}>Eliminar</button>
        </>
    ), ignoreRowClick: true, allowOverflow: true, button: true }
];

let editarCliente, eliminarCliente;

function AtencionCliente() {
    const [clientes, setClientes] = useState([]);
    const [form, setForm] = useState({ nombre: '', apellido: '', dni: '', telefono: '', direccion: '' });
    const [filtro, setFiltro] = useState('');

    useEffect(() => {
        fetch('/api/clientes')
            .then(res => res.json())
            .then(data => setClientes(data));
    }, []);

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
                MySwal.fire('¡Agregado!', 'Cliente registrado correctamente', 'success');
            });
    };

    editarCliente = (row) => {
        MySwal.fire({
            title: 'Editar cliente',
            html: (
                <div>
                    <input className="swal2-input" placeholder="Nombre" defaultValue={row.nombre} id="nombre" />
                    <input className="swal2-input" placeholder="Apellido" defaultValue={row.apellido} id="apellido" />
                    <input className="swal2-input" placeholder="DNI" defaultValue={row.dni} id="dni" />
                    <input className="swal2-input" placeholder="Teléfono" defaultValue={row.telefono} id="telefono" />
                    <input className="swal2-input" placeholder="Dirección" defaultValue={row.direccion} id="direccion" />
                </div>
            ),
            showCancelButton: true,
            preConfirm: () => {
                return {
                    nombre: document.getElementById('nombre').value,
                    apellido: document.getElementById('apellido').value,
                    dni: document.getElementById('dni').value,
                    telefono: document.getElementById('telefono').value,
                    direccion: document.getElementById('direccion').value
                };
            }
        }).then(result => {
            if (result.isConfirmed) {
                fetch(`/api/clientes/${row.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(result.value)
                })
                    .then(res => res.json())
                    .then(data => {
                        setClientes(clientes.map(c => c.id === row.id ? { ...data } : c));
                        MySwal.fire('¡Actualizado!', 'Cliente editado correctamente', 'success');
                    });
            }
        });
    };

    eliminarCliente = (row) => {
        MySwal.fire({
            title: '¿Eliminar cliente?',
            text: `¿Seguro que deseas eliminar a "${row.nombre} ${row.apellido}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(result => {
            if (result.isConfirmed) {
                fetch(`/api/clientes/${row.id}`, { method: 'DELETE' })
                    .then(res => res.json())
                    .then(() => {
                        setClientes(clientes.filter(c => c.id !== row.id));
                        MySwal.fire('¡Eliminado!', 'Cliente eliminado correctamente', 'success');
                    });
            }
        });
    };

    const clientesFiltrados = clientes.filter(c =>
        Object.values(c).join(' ').toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className="container mt-4">
            <h2>Atención al Cliente</h2>
            <form className="mb-3" onSubmit={agregarCliente}>
                <div className="row g-2 align-items-center">
                    <div className="col-md-2">
                        <input type="text" className="form-control" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
                    </div>
                    <div className="col-md-2">
                        <input type="text" className="form-control" name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} />
                    </div>
                    <div className="col-md-2">
                        <input type="text" className="form-control" name="dni" placeholder="DNI" value={form.dni} onChange={handleChange} />
                    </div>
                    <div className="col-md-2">
                        <input type="text" className="form-control" name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} />
                    </div>
                    <div className="col-md-3">
                        <input type="text" className="form-control" name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} />
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
                data={clientesFiltrados}
                pagination
                highlightOnHover
                striped
                responsive
                noDataComponent="No hay clientes registrados"
                persistTableHead
            />
        </div>
    );
}
export default AtencionCliente;
