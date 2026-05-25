import React, { useState } from 'react';
import { 
  Package, ArrowUpRight, ArrowDownLeft, AlertTriangle, 
  MessageSquare, PlusCircle, Users, Shield, FileText, Upload, CheckCircle 
} from 'lucide-react';

export default function DashboardSistema() {
  // --- ESTADOS DE INVENTARIO (RF 3.3, 3.4, 3.5, 3.6, 5.5, 5.6) ---
  const [stock, setStock] = useState([
    { id: '7701234567890', nombre: 'Laptop Corp X', cantidad: 12, min: 5 },
    { id: '7709876543210', nombre: 'Teclado Mecánico', cantidad: 3, min: 8 }, // Alerta activa
    { id: '7705556667770', nombre: 'Monitor 24"', cantidad: 20, min: 10 }
  ]);
  const [nuevoMovimiento, setNuevoMovimiento] = useState({ idProducto: '', tipo: 'entrada', cantidad: '' });
  
  // --- ESTADOS DE PQR (RF 4.1 a 4.6) ---
  const [pqrs, setPqrs] = useState([
    { radicado: 'PQR-2026-001', tipo: 'Reclamo', mensaje: 'El producto llegó defectuoso.', adjunto: 'factura.pdf', estado: 'Pendiente' }
  ]);
  const [nuevaPqr, setNuevaPqr] = useState({ tipo: 'Petición', mensaje: '', adjunto: null });
  const [notificacionPqr, setNotificacionPqr] = useState('');

  // --- ESTADOS DE USUARIOS (RF 5.1 a 5.4) ---
  const [usuarios, setUsuarios] = useState([
    { email: 'admin@sistema.com', nombre: 'Carlos Gómez', rol: 'Administrador' },
    { email: 'soporte@sistema.com', nombre: 'Ana Martínez', rol: 'Soporte' }
  ]);
  const [nuevoUsuario, setNuevoUsuario] = useState({ email: '', nombre: '', rol: 'Usuario' });
  const [errorUsuario, setErrorUsuario] = useState('');

  // --- LOGICA DE INVENTARIO ---
  const handleMovimientoStock = (e) => {
    e.preventDefault();
    const { idProducto, tipo, cantidad } = nuevoMovimiento;
    const cantNum = parseInt(cantidad);

    if (!idProducto || isNaN(cantNum) || cantNum <= 0) return;

    setStock(prevStock => 
      prevStock.map(prod => {
        if (prod.id === idProducto) {
          const nuevaCantidad = tipo === 'entrada' ? prod.cantidad + cantNum : prod.cantidad - cantNum;
          return { ...prod, cantidad: Math.max(0, nuevaCantidad) };
        }
        return prod;
      })
    );
    setNuevoMovimiento({ idProducto: '', tipo: 'entrada', cantidad: '' });
  };

  // Simulación de Escáner de Código de Barras (RF 5.5)
  const simularEscaneoBarra = () => {
    // Simula que el escáner lee el ID del Teclado Mecánico
    setNuevoMovimiento({ idProducto: '7709876543210', tipo: 'entrada', cantidad: '1' });
  };

  // --- LOGICA DE PQR ---
  const handleCrearPQR = (e) => {
    e.preventDefault();
    if (!nuevaPqr.mensaje) return;

    // Generación de número de radicado único (RF 4.5)
    const numeroRadicado = `PQR-2026-\${String(pqrs.length + 1).padStart(3, '0')}`;
    
    const pqrFinal = {
      radicado: numeroRadicado,
      tipo: nuevaPqr.tipo,
      mensaje: nuevaPqr.mensaje,
      adjunto: nuevaPqr.adjunto ? nuevaPqr.adjunto.name : 'Ninguno',
      estado: 'Pendiente'
    };

    setPqrs([pqrFinal, ...pqrs]);
    setNotificacionPqr(`¡PQR Radicada con éxito! Su número es: \${numeroRadicado}`); // Confirmación (RF 4.6)
    setNuevaPqr({ tipo: 'Petición', mensaje: '', adjunto: null });
    
    setTimeout(() => setNotificacionPqr(''), 6000);
  };

  // --- LOGICA DE USUARIOS ---
  const handleRegistroUsuario = (e) => {
    e.preventDefault();
    setErrorUsuario('');

    // Validación de datos únicos (RF 5.3)
    const existe = usuarios.some(u => u.email.toLowerCase() === nuevoUsuario.email.toLowerCase());
    if (existe) {
      setErrorUsuario('Error: El correo electrónico ya está registrado.');
      return;
    }

    if (!nuevoUsuario.email || !nuevoUsuario.nombre) return;

    setUsuarios([...usuarios, nuevoUsuario]);
    setNuevoUsuario({ email: '', nombre: '', rol: 'Usuario' });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Sistema Integrado de Gestión</h1>
        <p className="text-gray-600 text-sm">Panel de Control Operativo - Cumplimiento de Requerimientos</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ================= MÓDULO INVENTARIO (RF 3) ================= */}
        <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-700 flex items-center gap-2">
              <Package className="text-blue-600" /> Inventario en Tiempo Real (RF 3.4)
            </h2>
            <button 
              type="button"
              onClick={simularEscaneoBarra}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition"
            >
              📷 Simular Escáner (RF 5.5)
            </button>
          </div>

          {/* Tabla de Stock con Alertas en tiempo real */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-3">ID / Código</th>
                  <th className="p-3">Producto</th>
                  <th className="p-3 text-center">Stock Actual</th>
                  <th className="p-3">Estado / Alerta (RF 5.6)</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {stock.map(prod => {
                  const esAlerta = prod.cantidad <= prod.min;
                  return (
                    <tr key={prod.id} className={esAlerta ? "bg-red-50" : ""}>
                      <td className="p-3 font-mono text-xs text-gray-600">{prod.id}</td>
                      <td className="p-3 font-medium text-gray-800">{prod.nombre}</td>
                      <td className="p-3 text-center font-bold">{prod.cantidad} u.</td>
                      <td className="p-3">
                        {esAlerta ? (
                          <span className="inline-flex items-center gap-1 text-red-700 font-semibold bg-red-100 px-2 py-1 rounded text-xs animate-pulse">
                            <AlertTriangle size={14} /> Stock Crítico (Mín: {prod.min})
                          </span>
                        ) : (
                          <span className="text-green-700 bg-green-100 px-2 py-1 rounded text-xs font-medium">
                            Óptimo
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Registro de Movimientos (RF 3.3, 3.5, 3.6) */}
          <form onSubmit={handleMovimientoStock} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Registrar Movimiento de Stock</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select 
                value={nuevoMovimiento.idProducto}
                onChange={(e) => setNuevoMovimiento({...nuevoMovimiento, idProducto: e.target.value})}
                className="p-2 border rounded bg-white text-sm"
                required
              >
                <option value="">Seleccione Producto...</option>
                {stock.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>

              <select 
                value={nuevoMovimiento.tipo}
                onChange={(e) => setNuevoMovimiento({...nuevoMovimiento, tipo: e.target.value})}
                className="p-2 border rounded bg-white text-sm"
              >
                <option value="entrada">Entrada (RF 3.5)</option>
                <option value="salida">Salida (RF 3.6)</option>
              </select>

              <input 
                type="number" 
                placeholder="Cantidad"
                value={nuevoMovimiento.cantidad}
                onChange={(e) => setNuevoMovimiento({...nuevoMovimiento, cantidad: e.target.value})}
                className="p-2 border rounded text-sm"
                min="1"
                required
              />

              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium p-2 rounded text-sm transition flex items-center justify-center gap-1">
                {nuevoMovimiento.tipo === 'entrada' ? <ArrowUpRight size={16}/> : <ArrowDownLeft size={16}/>}
                Aplicar
              </button>
            </div>
          </form>
        </div>

        {/* ================= MÓDULO DE USUARIOS Y ROLES (RF 5) ================= */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Users className="text-indigo-600" /> Control de Usuarios y Roles (RF 5.4)
          </h2>

          <form onSubmit={handleRegistroUsuario} className="space-y-3 mb-6">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Nombre Completo</label>
              <input 
                type="text" 
                value={nuevoUsuario.nombre}
                onChange={(e) => setNuevoUsuario({...nuevoUsuario, nombre: e.target.value})}
                className="w-full p-2 border rounded text-sm" 
                placeholder="Ej. Juan Pérez"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Correo Electrónico (Único - RF 5.3)</label>
              <input 
                type="email" 
                value={nuevoUsuario.email}
                onChange={(e) => setNuevoUsuario({...nuevoUsuario, email: e.target.value})}
                className="w-full p-2 border rounded text-sm" 
                placeholder="juan@sistema.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Asignar Rol (RF 5.4)</label>
              <select 
                value={nuevoUsuario.rol}
                onChange={(e) => setNuevoUsuario({...nuevoUsuario, rol: e.target.value})}
                className="w-full p-2 border rounded bg-white text-sm"
              >
                <option value="Usuario">Usuario (Autoregistered RF 5.2)</option>
                <option value="Soporte">Soporte</option>
                <option value="Administrador">Administrador (RF 5.1)</option>
              </select>
            </div>

            {errorUsuario && <p className="text-xs text-red-600 font-semibold">{errorUsuario}</p>}

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium p-2 rounded text-sm transition">
              Registrar Usuario
            </button>
          </form>

          <div className="space-y-2 border-t pt-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase">Usuarios en el Sistema</h3>
            {usuarios.map((u, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded border text-sm">
                <div>
                  <p className="font-medium text-gray-800">{u.nombre}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                  <Shield size={12} /> {u.rol}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ================= MÓDULO DE PQR (RF 4) ================= */}
        <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Formulario de Creación de PQR */}
          <div className="md:col-span-1 border-r pr-0 md:pr-6 border-gray-200">
            <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
              <PlusCircle className="text-green-600" /> Crear PQR (RF 4.1)
            </h2>
            
            <form onSubmit={handleCrearPQR} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Tipo de PQR (RF 4.2)</label>
                <select 
                  value={nuevaPqr.tipo} 
                  onChange={(e) => setNuevaPqr({...nuevaPqr, tipo: e.target.value})}
                  className="w-full p-2 border rounded bg-white text-sm"
                >
                  <option value="Petición">Petición</option>
                  <option value="Queja">Queja</option>
                  <option value="Reclamo">Reclamo</option>
                  <option value="Sugerencia">Sugerencia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Mensaje / Descripción</label>
                <textarea 
                  rows="3"
                  value={nuevaPqr.mensaje}
                  onChange={(e) => setNuevaPqr({...nuevaPqr, mensaje: e.target.value})}
                  className="w-full p-2 border rounded text-sm"
                  placeholder="Escriba detalladamente su solicitud..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1 flex items-center gap-1 cursor-pointer bg-gray-50 hover:bg-gray-100 p-2 border border-dashed rounded text-center justify-center text-gray-500">
                  <Upload size={16} /> {nuevaPqr.adjunto ? nuevaPqr.adjunto.name : 'Adjuntar Archivo (RF 4.4)'}
                </label>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => setNuevaPqr({...nuevaPqr, adjunto: e.target.files[0]})}
                />
              </div>

              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-medium p-2 rounded text-sm transition">
                Radicar PQR
              </button>
            </form>

            {/* Alerta de confirmación de recepción (RF 4.6) */}
            {notificacionPqr && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-xs flex items-start gap-2">
                <CheckCircle className="text-green-600 shrink-0" size={16} />
                <div>{notificacionPqr}</div>
              </div>
            )}
          </div>

          {/* Buzón de Gestión de Mensajes PQR */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
              <MessageSquare className="text-orange-600" /> Mensajes y Gestión de PQR (RF 4.3)
            </h2>

            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2">
              {pqrs.map((p) => (
                <div key={p.radicado} className="p-4 bg-gray-50 border rounded-lg hover:shadow-sm transition">
                  <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Radicado: {p.radicado} {/* RF 4.5 */}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                      {p.tipo}
                    </span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-medium ml-auto">
                      {p.estado}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{p.mensaje}</p>
                  
                  {p.adjunto !== 'Ninguno' && (
                    <div className="inline-flex items-center gap-1 text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                      <FileText size={12} /> {p.adjunto}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
