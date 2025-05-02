export const dataTableConfig = {
    rowsPerPageText: 'Filas por página',
    rangeSeparatorText: 'de',
    noRowsPerPage: false,
    selectAllRowsItem: true,
    selectAllRowsItemText: 'Todos',
    searchPlaceholder: 'Buscar...'
};

export const formatFecha = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    if (isNaN(d)) return fecha;
    return d.toLocaleDateString('es-PE', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatMoneda = (valor) => {
    const num = Number(valor);
    return isNaN(num) ? '0.00' : num.toFixed(2);
};