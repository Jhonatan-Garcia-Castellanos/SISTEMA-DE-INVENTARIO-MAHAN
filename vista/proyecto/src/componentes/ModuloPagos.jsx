import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Circle,
  FileText,
  Send,
  Printer,
  Search,
  AlertCircle,
  Landmark,
  Wallet,
  CreditCard,
  X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Módulo de Pagos a Proveedores
// RF 7.1  Selección de Pagos Pendientes
// RF 7.2  Generación de Comprobante
// RF 7.3  Notificación de Pago Realizado
// ---------------------------------------------------------------------------

const PAGOS_INICIALES = [
  {
    id: "OC-1042",
    proveedor: "Distribuidora Andina S.A.S.",
    concepto: "Compra de insumos de empaque - Lote 230",
    monto: 1850000,
    vence: "2026-06-25",
    estado: "pendiente",
  },
  {
    id: "OC-1043",
    proveedor: "Maderas del Sur Ltda.",
    concepto: "Suministro de estanterías - Bodega Norte",
    monto: 4200000,
    vence: "2026-06-22",
    estado: "pendiente",
  },
  {
    id: "OC-1044",
    proveedor: "Tecno Refrigeración SAS",
    concepto: "Mantenimiento preventivo - Equipos de frío",
    monto: 980000,
    vence: "2026-07-02",
    estado: "pendiente",
  },
  {
    id: "OC-1045",
    proveedor: "AgroInsumos del Valle",
    concepto: "Pedido de fertilizantes - Junio",
    monto: 3120000,
    vence: "2026-06-20",
    estado: "pendiente",
  },
  {
    id: "OC-1039",
    proveedor: "Distribuidora Andina S.A.S.",
    concepto: "Compra de cajas plegables - Lote 198",
    monto: 760000,
    vence: "2026-06-10",
    estado: "pagado",
  },
];

const METODOS_PAGO = [
  { id: "transferencia", label: "Transferencia bancaria", icon: Landmark },
  { id: "efectivo", label: "Efectivo", icon: Wallet },
  { id: "cheque", label: "Cheque", icon: CreditCard },
];

const formatoCOP = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);

const formatoFecha = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function generarNumeroComprobante() {
  const ahora = new Date();
  const yyyy = ahora.getFullYear();
  const mm = String(ahora.getMonth() + 1).padStart(2, "0");
  const dd = String(ahora.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `COMP-${yyyy}${mm}${dd}-${random}`;
}

export default function ModuloPagos() {
  const [pagos, setPagos] = useState(PAGOS_INICIALES);
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [busqueda, setBusqueda] = useState("");
  const [metodoPago, setMetodoPago] = useState("transferencia");
  const [comprobante, setComprobante] = useState(null);
  const [notificacion, setNotificacion] = useState(null);
  const [errorSeleccion, setErrorSeleccion] = useState("");

  const pendientes = useMemo(
    () =>
      pagos.filter(
        (p) =>
          p.estado === "pendiente" &&
          (p.proveedor.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.concepto.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.id.toLowerCase().includes(busqueda.toLowerCase()))
      ),
    [pagos, busqueda]
  );

  const historial = useMemo(
    () => pagos.filter((p) => p.estado === "pagado"),
    [pagos]
  );

  const totalSeleccionado = useMemo(
    () =>
      pagos
        .filter((p) => seleccionados.has(p.id))
        .reduce((acc, p) => acc + p.monto, 0),
    [pagos, seleccionados]
  );

  function alternarSeleccion(id) {
    setErrorSeleccion("");
    setSeleccionados((prev) => {
      const copia = new Set(prev);
      if (copia.has(id)) {
        copia.delete(id);
      } else {
        copia.add(id);
      }
      return copia;
    });
  }

  // RF 7.2 — Generación de Comprobante
  function generarComprobante() {
    if (seleccionados.size === 0) {
      setErrorSeleccion("Selecciona al menos un pago pendiente para continuar.");
      return;
    }

    const items = pagos.filter((p) => seleccionados.has(p.id));
    const numero = generarNumeroComprobante();
    const fecha = new Date().toISOString();

    setComprobante({
      numero,
      fecha,
      metodo: METODOS_PAGO.find((m) => m.id === metodoPago)?.label,
      items,
      total: items.reduce((acc, p) => acc + p.monto, 0),
    });

    // Marca los pagos seleccionados como pagados
    setPagos((prev) =>
      prev.map((p) =>
        seleccionados.has(p.id) ? { ...p, estado: "pagado" } : p
      )
    );

    // RF 7.3 — Notificación de Pago Realizado
    const proveedoresUnicos = [...new Set(items.map((i) => i.proveedor))];
    setNotificacion(
      `Notificación enviada a ${proveedoresUnicos.length === 1 ? proveedoresUnicos[0] : `${proveedoresUnicos.length} proveedores`} confirmando el pago realizado.`
    );

    setSeleccionados(new Set());
  }

  function cerrarComprobante() {
    setComprobante(null);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="bg-slate-900 text-white px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">
            Gestión de proveedores
          </p>
          <h1 className="text-2xl font-semibold">Pagos a proveedores</h1>
          <p className="text-slate-300 text-sm mt-1">
            Selecciona pagos pendientes, genera el comprobante y notifica al proveedor.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {notificacion && (
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg px-4 py-3">
            <Send className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="flex-1 text-sm">{notificacion}</div>
            <button
              onClick={() => setNotificacion(null)}
              className="text-emerald-600 hover:text-emerald-900"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* RF 7.1 — Selección de Pagos Pendientes */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">Pagos pendientes</h2>
              <p className="text-sm text-slate-500">
                {pendientes.length} pago{pendientes.length !== 1 ? "s" : ""} por procesar
              </p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar proveedor, orden o concepto"
                className="pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <ul className="divide-y divide-slate-100">
            {pendientes.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-slate-500">
                No hay pagos pendientes que coincidan con la búsqueda.
              </li>
            )}
            {pendientes.map((pago) => {
              const marcado = seleccionados.has(pago.id);
              return (
                <li
                  key={pago.id}
                  className={`px-5 py-4 flex items-start gap-4 cursor-pointer transition-colors ${
                    marcado ? "bg-slate-50" : "hover:bg-slate-50"
                  }`}
                  onClick={() => alternarSeleccion(pago.id)}
                >
                  <button
                    type="button"
                    aria-pressed={marcado}
                    aria-label={`Seleccionar pago ${pago.id}`}
                    className="mt-0.5 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      alternarSeleccion(pago.id);
                    }}
                  >
                    {marcado ? (
                      <CheckCircle2 className="w-5 h-5 text-slate-900" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-medium text-slate-900">{pago.proveedor}</span>
                      <span className="text-xs text-slate-400">· {pago.id}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{pago.concepto}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Vence {formatoFecha(pago.vence)}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-semibold text-slate-900">{formatoCOP(pago.monto)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Método de pago + generación de comprobante */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
          <div>
            <h2 className="font-semibold text-slate-900 mb-3">Método de pago</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {METODOS_PAGO.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMetodoPago(id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                    metodoPago === id
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {errorSeleccion && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              {errorSeleccion}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-slate-100">
            <div>
              <p className="text-sm text-slate-500">Total seleccionado</p>
              <p className="text-xl font-semibold text-slate-900">
                {formatoCOP(totalSeleccionado)}
              </p>
              <p className="text-xs text-slate-400">
                {seleccionados.size} pago{seleccionados.size !== 1 ? "s" : ""} seleccionado
                {seleccionados.size !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={generarComprobante}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Generar comprobante
            </button>
          </div>
        </section>

        {/* Historial de pagos realizados */}
        {historial.length > 0 && (
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">Pagos realizados</h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {historial.map((pago) => (
                <li key={pago.id} className="px-5 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {pago.proveedor}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{pago.concepto}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                      Pagado
                    </span>
                    <span className="text-sm text-slate-600">{formatoCOP(pago.monto)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      {/* Comprobante generado (RF 7.2) */}
      {comprobante && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Comprobante de pago</h3>
              <button
                onClick={cerrarComprobante}
                className="text-slate-400 hover:text-slate-700"
                aria-label="Cerrar comprobante"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">N.º de comprobante</span>
                <span className="font-mono font-medium text-slate-900">{comprobante.numero}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fecha</span>
                <span className="text-slate-900">
                  {new Date(comprobante.fecha).toLocaleString("es-CO")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Método de pago</span>
                <span className="text-slate-900">{comprobante.metodo}</span>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2">
                {comprobante.items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-3">
                    <span className="text-slate-600 truncate">
                      {item.proveedor} · {item.id}
                    </span>
                    <span className="text-slate-900 shrink-0">{formatoCOP(item.monto)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-3">
                <span className="font-semibold text-slate-900">Total pagado</span>
                <span className="font-semibold text-slate-900">
                  {formatoCOP(comprobante.total)}
                </span>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 inline-flex items-center justify-center gap-2 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
              <button
                onClick={cerrarComprobante}
                className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
