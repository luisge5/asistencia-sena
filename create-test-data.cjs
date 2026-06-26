const XLSX = require('xlsx');

const data = [
  { nombre: 'Juan', apellido: 'Pérez', documento: '1001234567', tipo_documento: 'cc', ficha: 2857520, centro: 'Centro Regional Bogotá', estado: 'activo' },
  { nombre: 'María', apellido: 'García', documento: '1002345678', tipo_documento: 'cc', ficha: 2857520, centro: 'Centro Regional Bogotá', estado: 'activo' },
  { nombre: 'Carlos', apellido: 'López', documento: '1003456789', tipo_documento: 'cc', ficha: 2857520, centro: 'Centro Regional Bogotá', estado: 'activo' },
  { nombre: 'Ana', apellido: 'Martínez', documento: '1004567890', tipo_documento: 'cc', ficha: 2857520, centro: 'Centro Regional Bogotá', estado: 'activo' },
  { nombre: 'Luis', apellido: 'Rodríguez', documento: '1005678901', tipo_documento: 'cc', ficha: 2857520, centro: 'Centro Regional Bogotá', estado: 'activo' },
  { nombre: 'Laura', apellido: 'Hernández', documento: '1006789012', tipo_documento: 'cc', ficha: 2857520, centro: 'Centro Regional Bogotá', estado: 'activo' },
  { nombre: 'Pedro', apellido: 'González', documento: '1007890123', tipo_documento: 'cc', ficha: 2857520, centro: 'Centro Regional Bogotá', estado: 'activo' },
  { nombre: 'Sofía', apellido: 'Ramírez', documento: '1008901234', tipo_documento: 'cc', ficha: 2857520, centro: 'Centro Regional Bogotá', estado: 'activo' },
  { nombre: 'Diego', apellido: 'Torres', documento: '1009012345', tipo_documento: 'cc', ficha: 2857520, centro: 'Centro Regional Bogotá', estado: 'activo' },
  { nombre: 'Valentina', apellido: 'Díaz', documento: '1010123456', tipo_documento: 'cc', ficha: 2857520, centro: 'Centro Regional Bogotá', estado: 'activo' },
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Aprendices');
XLSX.writeFile(wb, 'test-aprendices.xlsx');

console.log('Archivo creado: test-aprendices.xlsx');
console.log(`${data.length} aprendices de prueba`);