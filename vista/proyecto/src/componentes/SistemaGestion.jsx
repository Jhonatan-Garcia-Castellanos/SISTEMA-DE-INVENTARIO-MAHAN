import { useState, useEffect, useRef } from "react";

// ─── DATOS INICIALES ──────────────────────────────────────────────────────────
const ROLES = ["Administrador", "Bodeguero", "Supervisor", "Usuario"];

const initialUsers = [
  { id: 1, nombre: "Carlos Pérez", email: "carlos@empresa.com", rol: "Administrador", activo: true },
  { id: 2, nombre: "Ana Gómez",   email: "ana@empresa.com",    rol: "Bodeguero",      activo: true },
];

const initialProducts = [
  { id: 1, codigo: "P001", nombre: "Resma Papel A4",   cantidad: 50,  minimo: 10, categoria: "Papelería" },
  { id: 2, codigo: "P002", nombre: "Tóner HP LaserJet", cantidad: 5,  minimo: 8,  categoria: "Tecnología" },
  { id: 3, codigo: "P003", nombre: "Silla Ergonómica",  cantidad: 12, minimo: 3,  categoria: "Mobiliario" },
  { id: 4, codigo: "P004", nombre: "Monitor 24\"",       cantidad: 2,  minimo: 5,  categoria: "Tecnología" },
];

const initialMovements = [
  { id: 1, tipo: "entrada", productoId: 1, cantidad: 20, fecha: "2026-05-20", responsable: "Ana Gómez",   motivo: "Compra proveedor" },
  { id: 2, tipo: "salida",  productoId: 2, cantidad: 3,  fecha: "2026-05-22", responsable: "Carlos Pérez", motivo: "Entrega a área TI" },
];

const initialPQR = [
  {
    id: 1, radicado: "PQR-2026-0001", tipo: "Queja", estado: "Abierto",
    asunto: "Retraso en entrega de materiales", descripcion: "Los materiales solicitados llevan 5 días de retraso.",
    usuario: "Ana Gómez", fecha: "2026-05-18", adjuntos: [], confirmado: true,
  },
];

// ─── UTILIDADES ───────────────────────────────────────────────────────────────
const genRadicado = () => `PQR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0")}`;
const today = () => new Date().toISOString().split("T")[0];
const cls = (...args) => args.filter(Boolean).join(" ");

// ─── COMPONENTES UI ───────────────────────────────────────────────────────────
const Badge = ({ children, color = "blue" }) => {
  const map = {
    blue:   "bg-blue-100 text-blue-800",
    green:  "bg-green-100 text-green-800",
    red:    "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800",
    purple: "bg-purple-100 text-purple-800",
    gray:   "bg-gray-100 text-gray-600",
  };
  return <span className={cls("px-2 py-0.5 rounded-full text-xs font-semibold", map[color] || map.blue)}>{children}</span>;
};

const Card = ({ children, className = "" }) => (
  <div className={cls("bg-white rounded-2xl shadow-sm border border-gray-100 p-5", className)}>{children}</div>
);

const Input = ({ label, error, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <input
      className={cls("border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition",
        error ? "border-red-400" : "border-gray-200")}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-white" {...props}>
      {children}
    </select>
  </div>
);

const Btn = ({ children, variant = "primary", size = "md", className = "", ...props }) => {
  const variants = {
    primary:   "bg-indigo-600 hover:bg-indigo-700 text-white",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700",
    danger:    "bg-red-500 hover:bg-red-600 text-white",
    success:   "bg-emerald-500 hover:bg-emerald-600 text-white",
    ghost:     "hover:bg-gray-100 text-gray-600",
  };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  return (
    <button className={cls("rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50", variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
};

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 text-base">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

const Alert = ({ type = "info", children }) => {
  const map = {
    info:    "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    error:   "bg-red-50 border-red-200 text-red-800",
    success: "bg-green-50 border-green-200 text-green-800",
  };
  const icons = { info: "ℹ️", warning: "⚠️", error: "🚨", success: "✅" };
  return (
    <div className={cls("flex items-start gap-2 border rounded-xl px-4 py-3 text-sm", map[type])}>
      <span>{icons[type]}</span><span>{children}</span>
    </div>
  );
};

// ─── SECCIONES ────────────────────────────────────────────────────────────────

/* ── 1. DASHBOARD ── */
function Dashboard({ products, movements, pqrs, users }) {
  const lowStock = products.filter(p => p.cantidad <= p.minimo);
  const openPQR  = pqrs.filter(p => p.estado === "Abierto");
  const entradas = movements.filter(m => m.tipo === "entrada").reduce((s, m) => s + m.cantidad, 0);
  const salidas  = movements.filter(m => m.tipo === "salida").reduce((s, m) => s + m.cantidad, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Panel Principal</h2>

      {lowStock.length > 0 && (
        <Alert type="warning">
          {lowStock.length} producto(s) con stock por debajo del mínimo:{" "}
          <strong>{lowStock.map(p => p.nombre).join(", ")}</strong>
        </Alert>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Productos",   value: products.length,   icon: "📦", color: "text-indigo-600" },
          { label: "Usuarios",    value: users.length,      icon: "👥", color: "text-purple-600" },
          { label: "PQR Abiertas", value: openPQR.length,   icon: "📋", color: "text-yellow-600" },
          { label: "Stock Bajo",  value: lowStock.length,   icon: "🚨", color: "text-red-600"    },
        ].map(s => (
          <Card key={s.label} className="flex flex-col gap-1">
            <span className="text-2xl">{s.icon}</span>
            <span className={cls("text-3xl font-bold", s.color)}>{s.value}</span>
            <span className="text-xs text-gray-500">{s.label}</span>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold text-gray-700 mb-3">Movimientos Recientes</h3>
          <div className="space-y-2">
            {movements.slice(-5).reverse().map(m => {
              const prod = products.find(p => p.id === m.productoId);
              return (
                <div key={m.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span>{m.tipo === "entrada" ? "🟢" : "🔴"}</span>
                    <span className="text-gray-700">{prod?.nombre}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={m.tipo === "entrada" ? "green" : "red"}>{m.tipo === "entrada" ? `+${m.cantidad}` : `-${m.cantidad}`}</Badge>
                    <span className="text-gray-400 text-xs">{m.fecha}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-700 mb-3">Stock Crítico</h3>
          {lowStock.length === 0
            ? <p className="text-sm text-gray-400">Todos los productos tienen stock suficiente ✅</p>
            : <div className="space-y-2">
                {lowStock.map(p => (
                  <div key={p.id} className="flex items-center justify-between text-sm bg-red-50 rounded-xl px-3 py-2">
                    <span className="font-medium text-gray-700">{p.nombre}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 font-bold">{p.cantidad}</span>
                      <span className="text-gray-400">/ mín {p.minimo}</span>
                    </div>
                  </div>
                ))}
              </div>
          }
        </Card>
      </div>
    </div>
  );
}

/* ── 2. INVENTARIO ── */
function Inventario({ products, setProducts, movements, setMovements }) {
  const [modal, setModal] = useState(null); // "entrada" | "salida" | "producto" | null
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const scanRef = useRef(null);

  const filtered = products.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (type, defaults = {}) => { setForm(defaults); setErrors({}); setModal(type); };

  const handleMovement = (tipo) => {
    const errs = {};
    if (!form.productoId) errs.productoId = "Selecciona un producto";
    if (!form.cantidad || form.cantidad <= 0) errs.cantidad = "Cantidad inválida";
    if (!form.motivo) errs.motivo = "Ingresa un motivo";
    if (Object.keys(errs).length) return setErrors(errs);

    const prod = products.find(p => p.id === Number(form.productoId));
    if (tipo === "salida" && prod.cantidad < Number(form.cantidad)) {
      return setErrors({ cantidad: "Stock insuficiente" });
    }

    setMovements(prev => [...prev, {
      id: Date.now(), tipo, productoId: Number(form.productoId),
      cantidad: Number(form.cantidad), fecha: today(),
      responsable: "Usuario Actual", motivo: form.motivo,
    }]);
    setProducts(prev => prev.map(p =>
      p.id === Number(form.productoId)
        ? { ...p, cantidad: tipo === "entrada" ? p.cantidad + Number(form.cantidad) : p.cantidad - Number(form.cantidad) }
        : p
    ));
    setModal(null);
  };

  const handleAddProduct = () => {
    const errs = {};
    if (!form.codigo) errs.codigo = "Requerido";
    if (!form.nombre)  errs.nombre  = "Requerido";
    if (products.find(p => p.codigo === form.codigo)) errs.codigo = "Código ya existe";
    if (Object.keys(errs).length) return setErrors(errs);

    setProducts(prev => [...prev, {
      id: Date.now(), codigo: form.codigo, nombre: form.nombre,
      cantidad: Number(form.cantidad) || 0, minimo: Number(form.minimo) || 5,
      categoria: form.categoria || "General",
    }]);
    setModal(null);
  };

  const handleScan = () => {
    const code = `P${String(Math.floor(Math.random() * 900) + 100)}`;
    setForm(f => ({ ...f, codigo: code }));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800">Inventario</h2>
        <div className="flex flex-wrap gap-2">
          <Btn variant="success" size="sm" onClick={() => openModal("entrada")}>⬆ Registrar Entrada</Btn>
          <Btn variant="danger"  size="sm" onClick={() => openModal("salida")}>⬇ Registrar Salida</Btn>
          <Btn variant="primary" size="sm" onClick={() => openModal("producto")}>＋ Nuevo Producto</Btn>
        </div>
      </div>

      <Input placeholder="Buscar por nombre o código…" value={search} onChange={e => setSearch(e.target.value)} />

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              {["Código","Nombre","Categoría","Stock","Mínimo","Estado"].map(h => (
                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-mono text-gray-500">{p.codigo}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{p.nombre}</td>
                <td className="px-4 py-3"><Badge color="blue">{p.categoria}</Badge></td>
                <td className="px-4 py-3 font-bold text-gray-700">{p.cantidad}</td>
                <td className="px-4 py-3 text-gray-500">{p.minimo}</td>
                <td className="px-4 py-3">
                  {p.cantidad <= p.minimo
                    ? <Badge color="red">⚠ Stock Bajo</Badge>
                    : <Badge color="green">✓ Normal</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Modal Entrada/Salida */}
      <Modal open={modal === "entrada" || modal === "salida"} onClose={() => setModal(null)}
        title={modal === "entrada" ? "Registrar Entrada de Inventario" : "Registrar Salida de Inventario"}>
        <div className="space-y-4">
          <Select label="Producto" value={form.productoId || ""} onChange={e => setForm(f => ({ ...f, productoId: e.target.value }))}>
            <option value="">Seleccionar…</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.cantidad})</option>)}
          </Select>
          {errors.productoId && <p className="text-xs text-red-500">{errors.productoId}</p>}
          <Input label="Cantidad" type="number" min="1" value={form.cantidad || ""} error={errors.cantidad}
            onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))} />
          <Input label="Motivo" value={form.motivo || ""} error={errors.motivo}
            onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))} />
          <div className="flex gap-2 pt-2">
            <Btn variant={modal === "entrada" ? "success" : "danger"} className="flex-1"
              onClick={() => handleMovement(modal)}>
              {modal === "entrada" ? "Registrar Entrada" : "Registrar Salida"}
            </Btn>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancelar</Btn>
          </div>
        </div>
      </Modal>

      {/* Modal Nuevo Producto */}
      <Modal open={modal === "producto"} onClose={() => setModal(null)} title="Registrar Nuevo Producto">
        <div className="space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1"><Input label="Código" ref={scanRef} value={form.codigo || ""} error={errors.codigo}
              onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} /></div>
            <Btn variant="secondary" size="sm" onClick={handleScan} title="Simular escáner">📷 Escanear</Btn>
          </div>
          <Input label="Nombre del Producto" value={form.nombre || ""} error={errors.nombre}
            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
          <Input label="Categoría" value={form.categoria || ""} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Stock Inicial" type="number" min="0" value={form.cantidad || ""}
              onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))} />
            <Input label="Stock Mínimo" type="number" min="0" value={form.minimo || ""}
              onChange={e => setForm(f => ({ ...f, minimo: e.target.value }))} />
          </div>
          <div className="flex gap-2 pt-2">
            <Btn variant="primary" className="flex-1" onClick={handleAddProduct}>Guardar Producto</Btn>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancelar</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ── 3. MOVIMIENTOS ── */
function Movimientos({ movements, products }) {
  const [filter, setFilter] = useState("todos");

  const filtered = movements.filter(m => filter === "todos" || m.tipo === filter).slice().reverse();

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-800">Historial de Movimientos</h2>
      <div className="flex gap-2">
        {["todos","entrada","salida"].map(f => (
          <Btn key={f} variant={filter === f ? "primary" : "secondary"} size="sm" onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Btn>
        ))}
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Tipo","Producto","Cantidad","Motivo","Responsable","Fecha"].map(h => (
                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => {
              const prod = products.find(p => p.id === m.productoId);
              return (
                <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <Badge color={m.tipo === "entrada" ? "green" : "red"}>
                      {m.tipo === "entrada" ? "⬆ Entrada" : "⬇ Salida"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{prod?.nombre}</td>
                  <td className="px-4 py-3 font-bold">{m.tipo === "entrada" ? `+${m.cantidad}` : `-${m.cantidad}`}</td>
                  <td className="px-4 py-3 text-gray-500">{m.motivo}</td>
                  <td className="px-4 py-3 text-gray-500">{m.responsable}</td>
                  <td className="px-4 py-3 text-gray-400">{m.fecha}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-gray-400 text-sm py-8">Sin movimientos registrados</p>}
      </Card>
    </div>
  );
}

/* ── 4. PQR ── */
function PQR({ pqrs, setPQRs }) {
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [fileNames, setFileNames] = useState([]);

  const tipos = ["Petición", "Queja", "Reclamo", "Sugerencia", "Felicitación"];
  const estados = ["Abierto", "En proceso", "Cerrado"];

  const openNew  = () => { setForm({ tipo: "Petición" }); setFileNames([]); setErrors({}); setModal("nuevo"); };
  const openView = (pqr) => { setSelected(pqr); setModal("ver"); };

  const handleFile = (e) => {
    const files = Array.from(e.target.files).map(f => f.name);
    setFileNames(files);
    setForm(f => ({ ...f, adjuntos: files }));
  };

  const handleSubmit = () => {
    const errs = {};
    if (!form.asunto)      errs.asunto      = "Requerido";
    if (!form.descripcion) errs.descripcion = "Requerido";
    if (!form.tipo)        errs.tipo        = "Requerido";
    if (Object.keys(errs).length) return setErrors(errs);

    const nueva = {
      id: Date.now(), radicado: genRadicado(), tipo: form.tipo,
      estado: "Abierto", asunto: form.asunto, descripcion: form.descripcion,
      usuario: "Usuario Actual", fecha: today(),
      adjuntos: form.adjuntos || [], confirmado: true,
    };
    setPQRs(prev => [...prev, nueva]);
    setModal("confirmacion");
    setSelected(nueva);
  };

  const handleUpdateEstado = (pqr, estado) => {
    setPQRs(prev => prev.map(p => p.id === pqr.id ? { ...p, estado } : p));
    setSelected(s => s && s.id === pqr.id ? { ...s, estado } : s);
  };

  const colorEstado = { "Abierto": "yellow", "En proceso": "blue", "Cerrado": "green" };
  const colorTipo   = { "Petición": "blue", "Queja": "red", "Reclamo": "yellow", "Sugerencia": "purple", "Felicitación": "green" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Gestión de PQR</h2>
        <Btn variant="primary" size="sm" onClick={openNew}>＋ Nueva PQR</Btn>
      </div>

      <div className="grid gap-3">
        {pqrs.slice().reverse().map(pqr => (
          <Card key={pqr.id} className="cursor-pointer hover:shadow-md transition" onClick={() => openView(pqr)}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-indigo-600 font-semibold">{pqr.radicado}</span>
                  <Badge color={colorTipo[pqr.tipo] || "gray"}>{pqr.tipo}</Badge>
                  <Badge color={colorEstado[pqr.estado] || "gray"}>{pqr.estado}</Badge>
                  {pqr.confirmado && <Badge color="green">✓ Recibido</Badge>}
                </div>
                <p className="font-medium text-gray-800 truncate">{pqr.asunto}</p>
                <p className="text-xs text-gray-400 mt-0.5">{pqr.usuario} · {pqr.fecha}</p>
              </div>
              {pqr.adjuntos?.length > 0 && <span className="text-gray-400 text-sm">📎 {pqr.adjuntos.length}</span>}
            </div>
          </Card>
        ))}
        {pqrs.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No hay PQR registradas</p>}
      </div>

      {/* Modal Nueva PQR */}
      <Modal open={modal === "nuevo"} onClose={() => setModal(null)} title="Crear Nueva PQR">
        <div className="space-y-4">
          <Select label="Tipo de PQR" value={form.tipo || ""} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Input label="Asunto" value={form.asunto || ""} error={errors.asunto}
            onChange={e => setForm(f => ({ ...f, asunto: e.target.value }))} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Descripción</label>
            <textarea className={cls("border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none", errors.descripcion ? "border-red-400" : "border-gray-200")}
              rows={4} value={form.descripcion || ""} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
            {errors.descripcion && <p className="text-xs text-red-500">{errors.descripcion}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Archivos Adjuntos</label>
            <input type="file" multiple className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              onChange={handleFile} />
            {fileNames.length > 0 && <p className="text-xs text-green-600">📎 {fileNames.join(", ")}</p>}
          </div>
          <div className="flex gap-2 pt-2">
            <Btn variant="primary" className="flex-1" onClick={handleSubmit}>Enviar PQR</Btn>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancelar</Btn>
          </div>
        </div>
      </Modal>

      {/* Modal Confirmación */}
      <Modal open={modal === "confirmacion"} onClose={() => setModal(null)} title="PQR Registrada Exitosamente">
        <div className="text-center space-y-4 py-2">
          <div className="text-5xl">✅</div>
          <p className="text-gray-600 text-sm">Tu PQR ha sido recibida y registrada con el número:</p>
          <p className="font-mono text-xl font-bold text-indigo-600">{selected?.radicado}</p>
          <p className="text-xs text-gray-400">Conserva este número para hacer seguimiento de tu solicitud.</p>
          <Btn variant="primary" className="w-full" onClick={() => setModal(null)}>Cerrar</Btn>
        </div>
      </Modal>

      {/* Modal Ver PQR */}
      <Modal open={modal === "ver"} onClose={() => setModal(null)} title={`Detalle PQR · ${selected?.radicado}`}>
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge color={colorTipo[selected.tipo] || "gray"}>{selected.tipo}</Badge>
              <Badge color={colorEstado[selected.estado] || "gray"}>{selected.estado}</Badge>
              {selected.confirmado && <Badge color="green">✓ Confirmado</Badge>}
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium text-gray-500">Asunto:</span><p className="text-gray-800 mt-0.5">{selected.asunto}</p></div>
              <div><span className="font-medium text-gray-500">Descripción:</span><p className="text-gray-700 mt-0.5 bg-gray-50 rounded-xl p-3">{selected.descripcion}</p></div>
              <div className="grid grid-cols-2 gap-3">
                <div><span className="font-medium text-gray-500">Usuario:</span><p className="text-gray-700">{selected.usuario}</p></div>
                <div><span className="font-medium text-gray-500">Fecha:</span><p className="text-gray-700">{selected.fecha}</p></div>
              </div>
              {selected.adjuntos?.length > 0 && (
                <div><span className="font-medium text-gray-500">Adjuntos:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selected.adjuntos.map(a => <Badge key={a} color="gray">📎 {a}</Badge>)}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 pt-2">
              <label className="text-sm font-medium text-gray-700">Actualizar Estado</label>
              <div className="flex gap-2 flex-wrap">
                {estados.map(e => (
                  <Btn key={e} size="sm" variant={selected.estado === e ? "primary" : "secondary"}
                    onClick={() => handleUpdateEstado(selected, e)}>{e}</Btn>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ── 5. USUARIOS ── */
function Usuarios({ users, setUsers }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.nombre) errs.nombre = "Requerido";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Email inválido";
    if (users.find(u => u.email === form.email)) errs.email = "Email ya registrado";
    if (!form.rol) errs.rol = "Selecciona un rol";
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setUsers(prev => [...prev, { id: Date.now(), nombre: form.nombre, email: form.email, rol: form.rol, activo: true }]);
    setModal(null);
  };

  const toggleActivo = (id) => setUsers(prev => prev.map(u => u.id === id ? { ...u, activo: !u.activo } : u));
  const updateRol    = (id, rol) => setUsers(prev => prev.map(u => u.id === id ? { ...u, rol } : u));

  const colorRol = { "Administrador": "purple", "Bodeguero": "blue", "Supervisor": "yellow", "Usuario": "gray" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Gestión de Usuarios</h2>
        <Btn variant="primary" size="sm" onClick={() => { setForm({}); setErrors({}); setModal("nuevo"); }}>＋ Nuevo Usuario</Btn>
      </div>

      <div className="grid gap-3">
        {users.map(u => (
          <Card key={u.id} className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                {u.nombre.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-800">{u.nombre}</p>
                <p className="text-xs text-gray-400">{u.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white"
                value={u.rol} onChange={e => updateRol(u.id, e.target.value)}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <Badge color={colorRol[u.rol] || "gray"}>{u.rol}</Badge>
              <button onClick={() => toggleActivo(u.id)}
                className={cls("text-xs px-2 py-1 rounded-lg font-medium transition", u.activo ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200")}>
                {u.activo ? "Activo" : "Inactivo"}
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={modal === "nuevo"} onClose={() => setModal(null)} title="Registrar Nuevo Usuario">
        <div className="space-y-4">
          <Input label="Nombre Completo" value={form.nombre || ""} error={errors.nombre}
            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
          <Input label="Correo Electrónico" type="email" value={form.email || ""} error={errors.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <Select label="Rol" value={form.rol || ""} onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}>
            <option value="">Seleccionar rol…</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
          {errors.rol && <p className="text-xs text-red-500">{errors.rol}</p>}
          <div className="flex gap-2 pt-2">
            <Btn variant="primary" className="flex-1" onClick={handleSubmit}>Registrar Usuario</Btn>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancelar</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── APP PRINCIPAL ─────────────────────────────────────────────────────────────
const NAV = [
  { key: "dashboard",    label: "Dashboard",    icon: "🏠" },
  { key: "inventario",   label: "Inventario",   icon: "📦" },
  { key: "movimientos",  label: "Movimientos",  icon: "🔄" },
  { key: "pqr",          label: "PQR",          icon: "📋" },
  { key: "usuarios",     label: "Usuarios",     icon: "👥" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [products,  setProducts]  = useState(initialProducts);
  const [movements, setMovements] = useState(initialMovements);
  const [pqrs,      setPQRs]      = useState(initialPQR);
  const [users,     setUsers]     = useState(initialUsers);
  const [menuOpen,  setMenuOpen]  = useState(false);

  const lowStockCount = products.filter(p => p.cantidad <= p.minimo).length;
  const openPQRCount  = pqrs.filter(p => p.estado === "Abierto").length;

  const badges = { inventario: lowStockCount || null, pqr: openPQRCount || null };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={() => setMenuOpen(o => !o)}>☰</button>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏢</span>
              <span className="font-bold text-gray-800 text-sm md:text-base">Sistema de Gestión</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {NAV.map(n => (
              <button key={n.key} onClick={() => setPage(n.key)}
                className={cls("relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition",
                  page === n.key ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100")}>
                <span>{n.icon}</span><span>{n.label}</span>
                {badges[n.key] && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {badges[n.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">AU</div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            {NAV.map(n => (
              <button key={n.key} onClick={() => { setPage(n.key); setMenuOpen(false); }}
                className={cls("w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition",
                  page === n.key ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50")}>
                <span>{n.icon}</span><span>{n.label}</span>
                {badges[n.key] && <Badge color="red">{badges[n.key]}</Badge>}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {page === "dashboard"   && <Dashboard products={products} movements={movements} pqrs={pqrs} users={users} />}
        {page === "inventario"  && <Inventario products={products} setProducts={setProducts} movements={movements} setMovements={setMovements} />}
        {page === "movimientos" && <Movimientos movements={movements} products={products} />}
        {page === "pqr"         && <PQR pqrs={pqrs} setPQRs={setPQRs} />}
        {page === "usuarios"    && <Usuarios users={users} setUsers={setUsers} />}
      </main>

      <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100">
        Sistema de Gestión Empresarial · v1.0
      </footer>
    </div>
  );
}
