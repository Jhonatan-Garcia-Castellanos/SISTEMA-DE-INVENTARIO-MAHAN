import { useState, useEffect, useRef } from "react";

/* ─── ESTILOS GLOBALES ──────────────────────────────────────────────────────── */
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  * { box-sizing: border-box; }

  body {
    font-family: 'Inter', system-ui, sans-serif;
    background: #F8F9FC;
    color: #1B2A4A;
    margin: 0;
  }

  :root {
    --bg-base:      #F8F9FC;
    --bg-surface:   #FFFFFF;
    --bg-elevated:  #EBF0FD;
    --bg-hover:     #E5ECFD;
    --border:       #0a192b30;
    --border-light: #0a192b15;
    --accent:       #055c8f;
    --accent-dim:   #0a3a5e;
    --accent-glow:  rgba(5,92,143,0.1);
    --text-primary: #1B2A4A;
    --text-muted:   #6B7A99;
    --text-faint:   #8B92A8;
    --red:          #D94F4F;
    --red-bg:       #FDF0F0;
    --green:        #2ECC71;
    --green-bg:     #EDFBF3;
    --blue:         #055c8f;
    --blue-bg:      #EBF0FD;
    --yellow:       #F39C12;
    --yellow-bg:    #FEF5E7;
    --purple:       #8E44AD;
    --purple-bg:    #F4ECF7;
    --radius:       10px;
    --radius-lg:    16px;
    --shadow:       0 2px 8px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06);
    --shadow-lg:    0 8px 24px rgba(0,0,0,0.12);
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg-base); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--text-faint); }

  /* Animaciones */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-ring {
    0%, 100% { box-shadow: 0 0 0 0 var(--accent-glow); }
    50%       { box-shadow: 0 0 0 6px transparent; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }

  .fade-in  { animation: fadeIn  0.25s ease both; }
  .slide-dn { animation: slideDown 0.2s ease both; }

  /* Focus ring global */
  *:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
`;

// ─── DATOS INICIALES ──────────────────────────────────────────────────────────
const ROLES = ["Administrador", "Usuario", "Vendedor", "Bodeguero"];

const initialUsers = [
  { id: 1, nombre: "Carlos Admin", email: "admin@empresa.com", rol: "Administrador", activo: true },
  { id: 2, nombre: "Juan Usuario", email: "usuario@empresa.com", rol: "Usuario", activo: true },
  { id: 3, nombre: "Maria Vendedor", email: "vendedor@empresa.com", rol: "Vendedor", activo: true },
];

const initialProducts = [
  { id: 1, codigo: "P001", nombre: "TV Box Ultra", cantidad: 50, minimo: 10, categoria: "TV Box", precioCompra: 350000, precioVenta: 490000, descripcion: "Reproductor multimedia 4K HDR con Android TV.", imagen: "https://via.placeholder.com/280x180?text=TV+Box+Ultra" },
  { id: 2, codigo: "P002", nombre: "Mini PC Android", cantidad: 5, minimo: 8, categoria: "Smart TV", precioCompra: 250000, precioVenta: 350000, descripcion: "Compacta, con Wi-Fi y salida HDMI para tu televisor.", imagen: "https://via.placeholder.com/280x180?text=Mini+PC+Android" },
  { id: 3, codigo: "P003", nombre: "Control Remoto Inteligente", cantidad: 12, minimo: 3, categoria: "Accesorios", precioCompra: 40000, precioVenta: 85000, descripcion: "Control por voz y accesos directos para apps de streaming.", imagen: "https://via.placeholder.com/280x180?text=Control+Inteligente" },
  { id: 4, codigo: "P004", nombre: "Soporte TV de Pared", cantidad: 2, minimo: 5, categoria: "Mobiliario", precioCompra: 80000, precioVenta: 140000, descripcion: "Incluye kit de instalación para pantallas de hasta 55\".", imagen: "https://via.placeholder.com/280x180?text=Soporte+TV" },
];


const initialMovements = [
  { id: 1, tipo: "entrada", productoId: 1, cantidad: 20, fecha: "2026-05-20", responsable: "Ana Gómez",    motivo: "Compra proveedor" },
  { id: 2, tipo: "salida",  productoId: 2, cantidad: 3,  fecha: "2026-05-22", responsable: "Carlos Pérez", motivo: "Entrega a área TI" },
];

const initialPQR = [
  {
    id: 1, radicado: "PQR-2026-0001", tipo: "Queja", estado: "Abierto",
    asunto: "Retraso en entrega de materiales",
    descripcion: "Los materiales solicitados llevan 5 días de retraso.",
    usuario: "Ana Gómez", fecha: "2026-05-18", adjuntos: [], confirmado: true,
  },
];

// ─── UTILIDADES ───────────────────────────────────────────────────────────────
const genRadicado = () => `PQR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0")}`;
const today = () => new Date().toISOString().split("T")[0];
const cls = (...args) => args.filter(Boolean).join(" ");

// ─── COMPONENTES BASE ─────────────────────────────────────────────────────────

const StyleInjector = () => {
  useEffect(() => {
    const tag = document.createElement("style");
    tag.textContent = GLOBAL_STYLES;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);
  return null;
};

/* Badge */
const BADGE_COLORS = {
  blue:   { bg: "var(--blue-bg)",   color: "var(--blue)",   border: "rgba(88,166,255,0.25)"   },
  green:  { bg: "var(--green-bg)",  color: "var(--green)",  border: "rgba(63,185,80,0.25)"    },
  red:    { bg: "var(--red-bg)",    color: "var(--red)",    border: "rgba(248,81,73,0.25)"    },
  yellow: { bg: "var(--yellow-bg)", color: "var(--yellow)", border: "rgba(210,153,34,0.25)"   },
  purple: { bg: "var(--purple-bg)", color: "var(--purple)", border: "rgba(188,140,255,0.25)"  },
  gray:   { bg: "rgba(72,79,88,0.3)", color: "var(--text-muted)", border: "var(--border)" },
  accent: { bg: "var(--accent-glow)", color: "var(--accent)", border: "rgba(163,230,53,0.3)" },
};

const Badge = ({ children, color = "blue" }) => {
  const c = BADGE_COLORS[color] || BADGE_COLORS.blue;
  return (
    <span style={{
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
      letterSpacing: "0.02em", whiteSpace: "nowrap", fontFamily: "'IBM Plex Sans', sans-serif",
      display: "inline-flex", alignItems: "center", gap: "3px",
    }}>
      {children}
    </span>
  );
};

/* Card */
const Card = ({ children, className, style, onClick, hoverable }) => (
  <div
    onClick={onClick}
    style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: "20px",
      boxShadow: "var(--shadow)",
      transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
      cursor: onClick ? "pointer" : "default",
      ...style,
    }}
    onMouseEnter={e => {
      if (hoverable || onClick) {
        e.currentTarget.style.borderColor = "var(--accent-dim)";
        e.currentTarget.style.boxShadow = "var(--shadow), 0 0 0 1px var(--accent-dim)";
        e.currentTarget.style.background = "var(--bg-elevated)";
      }
    }}
    onMouseLeave={e => {
      if (hoverable || onClick) {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "var(--shadow)";
        e.currentTarget.style.background = "var(--bg-surface)";
      }
    }}
    className={className}
  >
    {children}
  </div>
);

/* StatCard */
const StatCard = ({ label, value, icon, accentColor, sublabel }) => (
  <div style={{
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "20px",
    display: "flex", flexDirection: "column", gap: "10px",
    position: "relative", overflow: "hidden",
    boxShadow: "var(--shadow)",
    transition: "transform 0.15s, box-shadow 0.15s",
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow)"; }}
  >
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: "3px",
      background: accentColor || "var(--accent)",
      borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
    }} />
    <span style={{ fontSize: "22px" }}>{icon}</span>
    <span style={{ fontSize: "32px", fontWeight: 700, color: accentColor || "var(--accent)", lineHeight: 1 }}>{value}</span>
    <div>
      <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
      {sublabel && <div style={{ fontSize: "11px", color: "var(--text-faint)", marginTop: "2px" }}>{sublabel}</div>}
    </div>
  </div>
);

/* Input */
const Input = ({ label, error, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    {label && <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>}
    <input
      style={{
        background: "var(--bg-elevated)", border: `1px solid ${error ? "var(--red)" : "var(--border)"}`,
        borderRadius: "var(--radius)", padding: "9px 12px", color: "var(--text-primary)",
        fontSize: "14px", outline: "none", fontFamily: "'IBM Plex Sans', sans-serif",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
      onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
      onBlur={e => { e.target.style.borderColor = error ? "var(--red)" : "var(--border)"; e.target.style.boxShadow = "none"; }}
      {...props}
    />
    {error && <span style={{ fontSize: "12px", color: "var(--red)" }}>⚠ {error}</span>}
  </div>
);

/* Select */
const Select = ({ label, children, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    {label && <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>}
    <select
      style={{
        background: "var(--bg-elevated)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)", padding: "9px 12px", color: "var(--text-primary)",
        fontSize: "14px", outline: "none", fontFamily: "'IBM Plex Sans', sans-serif",
        cursor: "pointer", appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%238b949e' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
        paddingRight: "32px", transition: "border-color 0.15s, box-shadow 0.15s",
      }}
      onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
      onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
      {...props}
    >
      {children}
    </select>
  </div>
);

/* Btn */
const BTN_VARIANTS = {
  primary:   { bg: "var(--accent)",      color: "#0d1117", border: "transparent",      hover: "#bef264" },
  secondary: { bg: "var(--bg-elevated)", color: "var(--text-primary)", border: "var(--border)", hover: "var(--bg-hover)" },
  danger:    { bg: "var(--red-bg)",      color: "var(--red)",   border: "rgba(248,81,73,0.3)",  hover: "rgba(248,81,73,0.2)" },
  success:   { bg: "var(--green-bg)",    color: "var(--green)", border: "rgba(63,185,80,0.3)", hover: "rgba(63,185,80,0.2)" },
  ghost:     { bg: "transparent",        color: "var(--text-muted)", border: "transparent", hover: "var(--bg-hover)" },
};
const BTN_SIZES = {
  sm: { padding: "6px 12px", fontSize: "12px" },
  md: { padding: "9px 16px", fontSize: "13px" },
  lg: { padding: "12px 24px", fontSize: "15px" },
};

const Btn = ({ children, variant = "primary", size = "md", style: extraStyle, disabled, ...props }) => {
  const v = BTN_VARIANTS[variant] || BTN_VARIANTS.primary;
  const s = BTN_SIZES[size] || BTN_SIZES.md;
  return (
    <button
      disabled={disabled}
      style={{
        background: v.bg, color: v.color, border: `1px solid ${v.border}`,
        borderRadius: "var(--radius)", ...s, fontWeight: 600,
        fontFamily: "'IBM Plex Sans', sans-serif", cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1, transition: "all 0.15s", whiteSpace: "nowrap",
        display: "inline-flex", alignItems: "center", gap: "6px", letterSpacing: "0.01em",
        ...extraStyle,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = v.hover; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = v.bg; }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = "scale(0.97)"; }}
      onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
      {...props}
    >
      {children}
    </button>
  );
};

/* Modal */
const Modal = ({ open, onClose, title, children, width = "520px" }) => {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 999,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
        animation: "fadeIn 0.15s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg), 0 0 0 1px rgba(163,230,53,0.08)",
          width: "100%", maxWidth: width, maxHeight: "90vh", overflow: "auto",
          animation: "fadeIn 0.2s ease",
        }}
      >
        {/* Modal header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1px solid var(--border)",
          background: "var(--bg-elevated)", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
        }}>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer",
              fontSize: "20px", lineHeight: 1, padding: "2px 6px", borderRadius: "6px",
              transition: "color 0.15s, background 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-hover)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "none"; }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: "20px" }}>{children}</div>
      </div>
    </div>
  );
};

/* Alert */
const ALERT_STYLES = {
  info:    { bg: "var(--blue-bg)",   border: "rgba(88,166,255,0.25)",   color: "var(--blue)",   icon: "ℹ" },
  warning: { bg: "var(--yellow-bg)", border: "rgba(210,153,34,0.25)",   color: "var(--yellow)", icon: "⚠" },
  error:   { bg: "var(--red-bg)",    border: "rgba(248,81,73,0.25)",    color: "var(--red)",    icon: "✕" },
  success: { bg: "var(--green-bg)",  border: "rgba(63,185,80,0.25)",    color: "var(--green)",  icon: "✓" },
};

const Alert = ({ type = "info", children }) => {
  const s = ALERT_STYLES[type] || ALERT_STYLES.info;
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "10px",
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: "var(--radius)", padding: "12px 14px", fontSize: "13px",
    }}>
      <span style={{ color: s.color, fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>{s.icon}</span>
      <span style={{ color: "var(--text-primary)", lineHeight: "1.5" }}>{children}</span>
    </div>
  );
};

/* SectionHeader */
const SectionHeader = ({ title, action }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
    <div>
      <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "var(--text-primary)" }}>{title}</h2>
      <div style={{ width: "36px", height: "3px", background: "var(--accent)", borderRadius: "2px", marginTop: "6px" }} />
    </div>
    {action}
  </div>
);

/* Tabla base */
const Table = ({ headers, children, emptyText }) => (
  <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
            {headers.map(h => (
              <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "var(--text-faint)", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
    {emptyText && (
      <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--text-faint)", fontSize: "13px" }}>{emptyText}</div>
    )}
  </div>
);

const TR = ({ children }) => {
  const [hover, setHover] = useState(false);
  return (
    <tr
      style={{ borderBottom: "1px solid var(--border-light)", background: hover ? "var(--bg-elevated)" : "transparent", transition: "background 0.12s" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </tr>
  );
};

const TD = ({ children, mono, muted, bold }) => (
  <td style={{
    padding: "12px 16px",
    color: muted ? "var(--text-muted)" : bold ? "var(--text-primary)" : "var(--text-primary)",
    fontFamily: mono ? "'IBM Plex Mono', monospace" : "'IBM Plex Sans', sans-serif",
    fontWeight: bold ? 600 : 400,
    fontSize: mono ? "12px" : "13px",
  }}>
    {children}
  </td>
);

// ─── FORMULARIO COMÚN ─────────────────────────────────────────────────────────
const FormGrid = ({ children, cols = 1 }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "14px" }}>
    {children}
  </div>
);

const FormActions = ({ onCancel, onSubmit, submitLabel = "Guardar", submitVariant = "primary" }) => (
  <div style={{ display: "flex", gap: "10px", paddingTop: "6px" }}>
    <Btn variant={submitVariant} style={{ flex: 1 }} onClick={onSubmit}>{submitLabel}</Btn>
    <Btn variant="secondary" onClick={onCancel}>Cancelar</Btn>
  </div>
);

// ─── 1. DASHBOARD ─────────────────────────────────────────────────────────────
function Dashboard({ products, movements, pqrs, users }) {
  const lowStock = products.filter(p => p.cantidad <= p.minimo);
  const openPQR  = pqrs.filter(p => p.estado === "Abierto");
  const entradas = movements.filter(m => m.tipo === "entrada").reduce((s, m) => s + m.cantidad, 0);
  const salidas  = movements.filter(m => m.tipo === "salida").reduce((s, m) => s + m.cantidad, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="fade-in">
      <SectionHeader title="Panel Principal" />

      {lowStock.length > 0 && (
        <Alert type="warning">
          <strong>{lowStock.length} producto(s)</strong> con stock por debajo del mínimo:{" "}
          {lowStock.map(p => p.nombre).join(", ")}
        </Alert>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px" }}>
        <StatCard label="Productos" value={products.length} icon="📦" accentColor="var(--blue)" sublabel="en inventario" />
        <StatCard label="Usuarios" value={users.length} icon="👥" accentColor="var(--purple)" sublabel="registrados" />
        <StatCard label="PQR Abiertas" value={openPQR.length} icon="📋" accentColor="var(--yellow)" sublabel="pendientes" />
        <StatCard label="Stock Crítico" value={lowStock.length} icon="⚠" accentColor="var(--red)" sublabel="productos" />
      </div>

      {/* Movimientos + Stock crítico */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        <Card>
          <div style={{ marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Movimientos Recientes</span>
            <div style={{ display: "flex", gap: "12px", fontSize: "12px" }}>
              <span style={{ color: "var(--green)" }}>↑ {entradas} entrada</span>
              <span style={{ color: "var(--red)" }}>↓ {salidas} salida</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {movements.slice(-5).reverse().map(m => {
              const prod = products.find(p => p.id === m.productoId);
              return (
                <div key={m.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 10px", borderRadius: "8px", background: "var(--bg-elevated)",
                  marginBottom: "4px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "14px" }}>{m.tipo === "entrada" ? "🟢" : "🔴"}</span>
                    <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{prod?.nombre}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Badge color={m.tipo === "entrada" ? "green" : "red"}>
                      {m.tipo === "entrada" ? `+${m.cantidad}` : `-${m.cantidad}`}
                    </Badge>
                    <span style={{ fontSize: "11px", color: "var(--text-faint)", fontFamily: "'IBM Plex Mono'" }}>{m.fecha}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "14px" }}>Stock Crítico</span>
          {lowStock.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-faint)", fontSize: "13px" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>✅</div>
              Todos los productos tienen stock suficiente
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {lowStock.map(p => (
                <div key={p.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 12px", background: "var(--red-bg)", border: "1px solid rgba(248,81,73,0.2)",
                  borderRadius: "8px",
                }}>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>{p.nombre}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--red)" }}>{p.cantidad}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-faint)" }}>/ mín {p.minimo}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── 2. INVENTARIO ────────────────────────────────────────────────────────────
function Inventario({ products, setProducts, movements, setMovements }) {
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

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
    if (tipo === "salida" && prod.cantidad < Number(form.cantidad))
      return setErrors({ cantidad: "Stock insuficiente" });

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

    const newProduct = {
      id: Date.now(), codigo: form.codigo, nombre: form.nombre,
      cantidad: Number(form.cantidad) || 0, minimo: Number(form.minimo) || 5,
      categoria: form.categoria || "General",
      precioCompra: Number(form.precioCompra) || 0,
      precioVenta: Number(form.precioVenta) || 0,
      descripcion: `Producto: ${form.nombre}`,
      imagen: "https://via.placeholder.com/280x180?text=" + encodeURIComponent(form.nombre),
    };

    setProducts(prev => [...prev, newProduct]);
    setModal(null);
  };

  const handleScan = () => {
    const code = `P${String(Math.floor(Math.random() * 900) + 100)}`;
    setForm(f => ({ ...f, codigo: code }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }} className="fade-in">
      <SectionHeader
        title="Inventario"
        action={
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <Btn variant="success" size="sm" onClick={() => openModal("entrada")}>↑ Entrada</Btn>
            <Btn variant="danger"  size="sm" onClick={() => openModal("salida")}>↓ Salida</Btn>
            <Btn variant="primary" size="sm" onClick={() => openModal("producto")}>＋ Producto</Btn>
          </div>
        }
      />

      {/* Buscador */}
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)", fontSize: "14px", pointerEvents: "none" }}>🔍</span>
        <input
          placeholder="Buscar por nombre o código…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%", paddingLeft: "36px", paddingRight: "12px", padding: "10px 12px 10px 36px",
            background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
            color: "var(--text-primary)", fontSize: "14px", outline: "none",
            fontFamily: "'IBM Plex Sans', sans-serif", transition: "border-color 0.15s, box-shadow 0.15s",
          }}
          onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
          onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
        />
      </div>

      <Table headers={["Código","Nombre","Categoría","Stock","Mínimo","Estado"]} emptyText={filtered.length === 0 ? "Sin resultados" : undefined}>
        {filtered.map(p => (
          <TR key={p.id}>
            <TD mono>{p.codigo}</TD>
            <TD bold>{p.nombre}</TD>
            <TD><Badge color="blue">{p.categoria}</Badge></TD>
            <TD bold>{p.cantidad}</TD>
            <TD muted>{p.minimo}</TD>
            <TD>{p.cantidad <= p.minimo ? <Badge color="red">⚠ Stock Bajo</Badge> : <Badge color="green">✓ Normal</Badge>}</TD>
          </TR>
        ))}
      </Table>

      {/* Modal Entrada/Salida */}
      <Modal
        open={modal === "entrada" || modal === "salida"}
        onClose={() => setModal(null)}
        title={modal === "entrada" ? "↑ Registrar Entrada" : "↓ Registrar Salida"}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Select label="Producto" value={form.productoId || ""} onChange={e => setForm(f => ({ ...f, productoId: e.target.value }))}>
            <option value="">Seleccionar producto…</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.nombre} · Stock: {p.cantidad}</option>)}
          </Select>
          {errors.productoId && <span style={{ fontSize: "12px", color: "var(--red)" }}>⚠ {errors.productoId}</span>}
          <Input label="Cantidad" type="number" min="1" value={form.cantidad || ""} error={errors.cantidad}
            onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))} />
          <Input label="Motivo" value={form.motivo || ""} error={errors.motivo}
            onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))} />
          <FormActions
            onCancel={() => setModal(null)}
            onSubmit={() => handleMovement(modal)}
            submitLabel={modal === "entrada" ? "Registrar Entrada" : "Registrar Salida"}
            submitVariant={modal === "entrada" ? "success" : "danger"}
          />
        </div>
      </Modal>

      {/* Modal Nuevo Producto */}
      <Modal open={modal === "producto"} onClose={() => setModal(null)} title="＋ Registrar Producto">
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <Input label="Código" value={form.codigo || ""} error={errors.codigo}
                onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} />
            </div>
            <Btn variant="secondary" size="sm" onClick={handleScan}>📷 Escanear</Btn>
          </div>
          <Input label="Nombre del Producto" value={form.nombre || ""} error={errors.nombre}
            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
          <Input label="Categoría" value={form.categoria || ""}
            onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} />
          <FormGrid cols={2}>
            <Input label="Stock Inicial" type="number" min="0" value={form.cantidad || ""}
              onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))} />
            <Input label="Stock Mínimo" type="number" min="0" value={form.minimo || ""}
              onChange={e => setForm(f => ({ ...f, minimo: e.target.value }))} />
          </FormGrid>
          <FormGrid cols={2}>
            <Input label="Precio de Compra (COP)" type="number" min="0" value={form.precioCompra || ""}
              onChange={e => setForm(f => ({ ...f, precioCompra: e.target.value }))} />
            <Input label="Precio de Venta (COP)" type="number" min="0" value={form.precioVenta || ""}
              onChange={e => setForm(f => ({ ...f, precioVenta: e.target.value }))} />
          </FormGrid>
          <FormActions onCancel={() => setModal(null)} onSubmit={handleAddProduct} submitLabel="Guardar Producto" />
        </div>
      </Modal>
    </div>
  );
}

// ─── 3. MOVIMIENTOS ───────────────────────────────────────────────────────────
function Movimientos({ movements, products }) {
  const [filter, setFilter] = useState("todos");
  const filtered = movements.filter(m => filter === "todos" || m.tipo === filter).slice().reverse();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }} className="fade-in">
      <SectionHeader title="Historial de Movimientos" />

      <div style={{ display: "flex", gap: "8px" }}>
        {[
          { key: "todos",   label: "Todos" },
          { key: "entrada", label: "↑ Entradas" },
          { key: "salida",  label: "↓ Salidas" },
        ].map(f => (
          <Btn key={f.key} variant={filter === f.key ? "primary" : "secondary"} size="sm" onClick={() => setFilter(f.key)}>
            {f.label}
          </Btn>
        ))}
      </div>

      <Table
        headers={["Tipo","Producto","Cantidad","Motivo","Responsable","Fecha"]}
        emptyText={filtered.length === 0 ? "Sin movimientos registrados" : undefined}
      >
        {filtered.map(m => {
          const prod = products.find(p => p.id === m.productoId);
          return (
            <TR key={m.id}>
              <TD><Badge color={m.tipo === "entrada" ? "green" : "red"}>{m.tipo === "entrada" ? "↑ Entrada" : "↓ Salida"}</Badge></TD>
              <TD bold>{prod?.nombre}</TD>
              <TD>
                <span style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 700, color: m.tipo === "entrada" ? "var(--green)" : "var(--red)", fontSize: "13px" }}>
                  {m.tipo === "entrada" ? `+${m.cantidad}` : `-${m.cantidad}`}
                </span>
              </TD>
              <TD muted>{m.motivo}</TD>
              <TD muted>{m.responsable}</TD>
              <TD mono muted>{m.fecha}</TD>
            </TR>
          );
        })}
      </Table>
    </div>
  );
}

// ─── 4. PQR ───────────────────────────────────────────────────────────────────
function PQR({ pqrs, setPQRs }) {
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [fileNames, setFileNames] = useState([]);

  const tipos   = ["Petición","Queja","Reclamo","Sugerencia","Felicitación"];
  const estados = ["Abierto","En proceso","Cerrado"];

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
    setSelected(nueva);
    setModal("confirmacion");
  };

  const handleUpdateEstado = (pqr, estado) => {
    setPQRs(prev => prev.map(p => p.id === pqr.id ? { ...p, estado } : p));
    setSelected(s => s && s.id === pqr.id ? { ...s, estado } : s);
  };

  const colorEstado = { "Abierto": "yellow", "En proceso": "blue", "Cerrado": "green" };
  const colorTipo   = { "Petición": "blue", "Queja": "red", "Reclamo": "yellow", "Sugerencia": "purple", "Felicitación": "green" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }} className="fade-in">
      <SectionHeader title="Gestión de PQR" action={<Btn variant="primary" size="sm" onClick={openNew}>＋ Nueva PQR</Btn>} />

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {pqrs.slice().reverse().map(pqr => (
          <Card key={pqr.id} onClick={() => openView(pqr)} hoverable>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: "12px", color: "var(--accent)", fontWeight: 500 }}>{pqr.radicado}</span>
                  <Badge color={colorTipo[pqr.tipo] || "gray"}>{pqr.tipo}</Badge>
                  <Badge color={colorEstado[pqr.estado] || "gray"}>{pqr.estado}</Badge>
                  {pqr.confirmado && <Badge color="green">✓ Recibido</Badge>}
                </div>
                <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pqr.asunto}</p>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--text-faint)" }}>{pqr.usuario} · {pqr.fecha}</p>
              </div>
              {pqr.adjuntos?.length > 0 && <span style={{ fontSize: "13px", color: "var(--text-faint)" }}>📎 {pqr.adjuntos.length}</span>}
            </div>
          </Card>
        ))}
        {pqrs.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 16px", color: "var(--text-faint)", fontSize: "14px" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>📋</div>
            No hay PQR registradas
          </div>
        )}
      </div>

      {/* Modal Nueva PQR */}
      <Modal open={modal === "nuevo"} onClose={() => setModal(null)} title="＋ Crear Nueva PQR">
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Select label="Tipo de PQR" value={form.tipo || ""} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Input label="Asunto" value={form.asunto || ""} error={errors.asunto}
            onChange={e => setForm(f => ({ ...f, asunto: e.target.value }))} />
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Descripción</label>
            <textarea
              rows={4}
              value={form.descripcion || ""}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              style={{
                background: "var(--bg-elevated)", border: `1px solid ${errors.descripcion ? "var(--red)" : "var(--border)"}`,
                borderRadius: "var(--radius)", padding: "9px 12px", color: "var(--text-primary)",
                fontSize: "14px", outline: "none", fontFamily: "'IBM Plex Sans', sans-serif",
                resize: "vertical", transition: "border-color 0.15s",
              }}
              onFocus={e => { e.target.style.borderColor = "var(--accent)"; }}
              onBlur={e => { e.target.style.borderColor = errors.descripcion ? "var(--red)" : "var(--border)"; }}
            />
            {errors.descripcion && <span style={{ fontSize: "12px", color: "var(--red)" }}>⚠ {errors.descripcion}</span>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Archivos Adjuntos</label>
            <input type="file" multiple onChange={handleFile}
              style={{ fontSize: "13px", color: "var(--text-muted)" }} />
            {fileNames.length > 0 && <span style={{ fontSize: "12px", color: "var(--green)" }}>📎 {fileNames.join(", ")}</span>}
          </div>
          <FormActions onCancel={() => setModal(null)} onSubmit={handleSubmit} submitLabel="Enviar PQR" />
        </div>
      </Modal>

      {/* Modal Confirmación */}
      <Modal open={modal === "confirmacion"} onClose={() => setModal(null)} title="PQR Registrada">
        <div style={{ textAlign: "center", padding: "12px 0", display: "flex", flexDirection: "column", gap: "14px", alignItems: "center" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--green-bg)", border: "2px solid var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>✅</div>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px" }}>Tu PQR fue recibida y registrada con el número:</p>
          <code style={{ fontSize: "20px", fontWeight: 700, color: "var(--accent)", fontFamily: "'IBM Plex Mono'" }}>{selected?.radicado}</code>
          <p style={{ margin: 0, fontSize: "12px", color: "var(--text-faint)" }}>Conserva este número para hacer seguimiento.</p>
          <Btn variant="primary" style={{ width: "100%" }} onClick={() => setModal(null)}>Cerrar</Btn>
        </div>
      </Modal>

      {/* Modal Ver PQR */}
      <Modal open={modal === "ver"} onClose={() => setModal(null)} title={`Detalle · ${selected?.radicado}`}>
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              <Badge color={colorTipo[selected.tipo] || "gray"}>{selected.tipo}</Badge>
              <Badge color={colorEstado[selected.estado] || "gray"}>{selected.estado}</Badge>
              {selected.confirmado && <Badge color="green">✓ Confirmado</Badge>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "4px" }}>Asunto</label>
                <p style={{ margin: 0, fontSize: "14px", color: "var(--text-primary)", fontWeight: 500 }}>{selected.asunto}</p>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "4px" }}>Descripción</label>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", background: "var(--bg-elevated)", borderRadius: "var(--radius)", padding: "12px", lineHeight: 1.6 }}>{selected.descripcion}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {[["Usuario", selected.usuario], ["Fecha", selected.fecha]].map(([k, v]) => (
                  <div key={k}>
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "4px" }}>{k}</label>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-primary)", fontFamily: k === "Fecha" ? "'IBM Plex Mono'" : "inherit" }}>{v}</p>
                  </div>
                ))}
              </div>
              {selected.adjuntos?.length > 0 && (
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>Adjuntos</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {selected.adjuntos.map(a => <Badge key={a} color="gray">📎 {a}</Badge>)}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>Actualizar Estado</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {estados.map(e => (
                  <Btn key={e} size="sm" variant={selected.estado === e ? "primary" : "secondary"} onClick={() => handleUpdateEstado(selected, e)}>{e}</Btn>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── 5. USUARIOS ──────────────────────────────────────────────────────────────
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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }} className="fade-in">
      <SectionHeader
        title="Gestión de Usuarios"
        action={<Btn variant="primary" size="sm" onClick={() => { setForm({}); setErrors({}); setModal("nuevo"); }}>＋ Nuevo Usuario</Btn>}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {users.map(u => (
          <Card key={u.id} style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* Avatar */}
                <div style={{
                  width: "42px", height: "42px", borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, var(--accent-dim), var(--accent))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", fontWeight: 700, color: "#0d1117",
                }}>
                  {u.nombre.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)", fontSize: "14px" }}>{u.nombre}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-faint)", fontFamily: "'IBM Plex Mono'" }}>{u.email}</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                <select
                  value={u.rol}
                  onChange={e => updateRol(u.id, e.target.value)}
                  style={{
                    background: "var(--bg-elevated)", border: "1px solid var(--border)",
                    borderRadius: "8px", padding: "5px 10px", color: "var(--text-primary)",
                    fontSize: "12px", outline: "none", cursor: "pointer",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <Badge color={colorRol[u.rol] || "gray"}>{u.rol}</Badge>
                <button
                  onClick={() => toggleActivo(u.id)}
                  style={{
                    padding: "5px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
                    border: "none", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif",
                    transition: "all 0.15s",
                    background: u.activo ? "var(--green-bg)" : "var(--bg-hover)",
                    color: u.activo ? "var(--green)" : "var(--text-faint)",
                    border: `1px solid ${u.activo ? "rgba(63,185,80,0.3)" : "var(--border)"}`,
                  }}
                >
                  {u.activo ? "● Activo" : "○ Inactivo"}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={modal === "nuevo"} onClose={() => setModal(null)} title="＋ Registrar Usuario">
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Input label="Nombre Completo" value={form.nombre || ""} error={errors.nombre}
            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
          <Input label="Correo Electrónico" type="email" value={form.email || ""} error={errors.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <Select label="Rol" value={form.rol || ""} onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}>
            <option value="">Seleccionar rol…</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
          {errors.rol && <span style={{ fontSize: "12px", color: "var(--red)" }}>⚠ {errors.rol}</span>}
          <FormActions onCancel={() => setModal(null)} onSubmit={handleSubmit} submitLabel="Registrar Usuario" />
        </div>
      </Modal>
    </div>
  );
}

// ─── NAVEGACIÓN ───────────────────────────────────────────────────────────────
const ADMIN_NAV = [
  { key: "dashboard",   label: "Dashboard",   icon: "⊞" },
  { key: "inventario",  label: "Inventario",  icon: "⬡" },
  { key: "movimientos", label: "Movimientos", icon: "⇄" },
  { key: "pqr",         label: "PQR",         icon: "◷" },
  { key: "usuarios",    label: "Usuarios",    icon: "⊙" },
  { key: "catalogo",    label: "Catálogo",    icon: "🛍" },
  { key: "pagos",       label: "Pagos",       icon: "💳" },
];

const USER_NAV = [
  { key: "catalogo", label: "Catálogo", icon: "🛍" },
  { key: "carrito", label: "Carrito", icon: "🧺" },
  { key: "perfil",   label: "Perfil",   icon: "👤" },
];

const formatCurrency = (value) => `COP$ ${value.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;

function Catalog({ items, user, onAdd, onEdit, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const isAdmin = user?.rol === "Administrador";
  const isVendedor = user?.rol === "Vendedor";
  const canEdit = isAdmin || isVendedor;

  const handleEditStart = (item) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleEditSave = () => {
    onEdit(editingId, editForm);
    setEditingId(null);
    setEditForm({});
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  return (
    <div style={{ display: "grid", gap: "18px", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
      {items.map((item) => (
        <Card key={item.id} hoverable style={{ display: "flex", flexDirection: "column", gap: "14px", position: "relative" }}>
          {editingId === item.id ? (
            <>
              <input 
                type="text" 
                value={editForm.nombre || ""} 
                onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} 
                placeholder="Nombre del producto"
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontFamily: "'IBM Plex Sans', sans-serif" }}
              />
              {isAdmin && (
                <input 
                  type="number" 
                  step="0.01"
                  value={editForm.precioVenta || ""} 
                  onChange={(e) => setEditForm({ ...editForm, precioVenta: parseFloat(e.target.value) })} 
                  placeholder="Precio de Venta"
                  style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontFamily: "'IBM Plex Sans', sans-serif" }}
                />
              )}
              {isVendedor && (
                <div style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-muted)", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "14px" }}>
                  Precio (fijo): {formatCurrency(editForm.precioVenta)}
                </div>
              )}
              <input 
                type="text" 
                value={editForm.descripcion || ""} 
                onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })} 
                placeholder="Descripción"
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontFamily: "'IBM Plex Sans', sans-serif" }}
              />
              <input 
                type="text" 
                value={editForm.imagen || ""} 
                onChange={(e) => setEditForm({ ...editForm, imagen: e.target.value })} 
                placeholder="URL de imagen"
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontFamily: "'IBM Plex Sans', sans-serif" }}
              />
              <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                <button 
                  onClick={handleEditSave}
                  style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", background: "var(--green)", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif" }}
                >Guardar</button>
                <button 
                  onClick={handleEditCancel}
                  style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", background: "var(--border)", color: "var(--text-primary)", border: "none", fontWeight: 600, cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif" }}
                >Cancelar</button>
              </div>
            </>
          ) : (
            <>
              <img src={item.imagen} alt={item.nombre} style={{ width: "100%", borderRadius: "14px", objectFit: "cover", minHeight: "160px" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "18px", lineHeight: 1.2 }}>{item.nombre}</h2>
                    <p style={{ margin: "8px 0 0", color: "var(--text-faint)", fontSize: "13px" }}>{item.categoria}</p>
                  </div>
                  <Badge color="green">{formatCurrency(item.precioVenta)}</Badge>
                </div>
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.6 }}>{item.descripcion}</p>
              </div>
              {isAdmin && (
                <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                  <button
                    onClick={() => handleEditStart(item)}
                    style={{
                      flex: 1, padding: "10px 12px", borderRadius: "8px",
                      background: "var(--blue)", color: "#fff", border: "none", fontWeight: 600,
                      cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "14px"
                    }}
                  >✎ Editar</button>
                  <button
                    onClick={() => onDelete(item.id)}
                    style={{
                      flex: 1, padding: "10px 12px", borderRadius: "8px",
                      background: "var(--red)", color: "#fff", border: "none", fontWeight: 600,
                      cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "14px"
                    }}
                  >🗑 Eliminar</button>
                </div>
              )}
              {isVendedor && (
                <button
                  onClick={() => handleEditStart(item)}
                  style={{
                    marginTop: "auto", padding: "10px 12px", borderRadius: "8px",
                    background: "var(--blue)", color: "#fff", border: "none", fontWeight: 600,
                    cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "14px", width: "100%"
                  }}
                >✎ Editar</button>
              )}
              {!canEdit && (
                <button
                  onClick={() => onAdd(item)}
                  style={{
                    marginTop: "auto", padding: "12px 16px", borderRadius: "12px",
                    background: "var(--accent)", color: "#0d1117", border: "none", fontWeight: 700,
                    cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                >Añadir al carrito</button>
              )}
            </>
          )}
        </Card>
      ))}
    </div>
  );
}

function CartPage({ cart, onRemove, onClear }) {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("tarjeta");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const total = cart.reduce((sum, item) => sum + item.precioVenta * item.qty, 0);

  const handlePayNow = () => {
    setShowPayment(true);
  };

  const handleCompletePayment = async () => {
    setProcessingPayment(true);
    await new Promise(r => setTimeout(r, 1500));
    setProcessingPayment(false);
    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setShowPayment(false);
      onClear();
    }, 2000);
  };

  if (paymentSuccess) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <Card style={{ textAlign: "center", padding: "40px", background: "var(--green-bg)" }}>
          <p style={{ margin: 0, fontSize: "40px" }}>✓</p>
          <p style={{ margin: "12px 0 0", fontSize: "20px", fontWeight: 700, color: "var(--text-primary)" }}>¡Pago realizado con éxito!</p>
          <p style={{ margin: "8px 0 0", color: "var(--text-muted)", fontSize: "14px" }}>Tu pedido ha sido confirmado</p>
        </Card>
      </div>
    );
  }

  if (showPayment) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <Card style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px" }}>
          <div>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>Total a pagar</p>
            <p style={{ margin: "6px 0 0", fontSize: "24px", fontWeight: 700 }}>{formatCurrency(total)}</p>
          </div>
          <button onClick={() => setShowPayment(false)} style={{ background: "var(--border)", color: "var(--text-primary)", border: "none", borderRadius: "8px", padding: "10px 14px", cursor: "pointer" }}>← Atrás</button>
        </Card>

        <Card style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>Método de pago</p>
          {["tarjeta", "transferencia", "efectivo"].map((method) => (
            <label key={method} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", border: "1px solid " + (paymentMethod === method ? "var(--accent)" : "var(--border)"), borderRadius: "8px", cursor: "pointer", background: paymentMethod === method ? "var(--accent-glow)" : "transparent" }}>
              <input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={(e) => setPaymentMethod(e.target.value)} style={{ cursor: "pointer" }} />
              <span style={{ fontSize: "14px", fontWeight: 500, textTransform: "capitalize" }}>{method === "tarjeta" ? "Tarjeta de crédito/débito" : method === "transferencia" ? "Transferencia bancaria" : "Efectivo contra entrega"}</span>
            </label>
          ))}
        </Card>

        {paymentMethod === "tarjeta" && (
          <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input type="text" placeholder="Número de tarjeta" maxLength="16" style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontFamily: "monospace" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <input type="text" placeholder="MM/AA" maxLength="5" style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "8px" }} />
              <input type="text" placeholder="CVV" maxLength="3" style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontFamily: "monospace" }} />
            </div>
          </Card>
        )}

        {paymentMethod === "transferencia" && (
          <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ background: "var(--bg-elevated)", padding: "12px", borderRadius: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
              <p style={{ margin: 0, fontWeight: 700 }}>Datos de transferencia:</p>
              <p style={{ margin: "6px 0 0" }}>Banco: Banco de Colombia</p>
              <p style={{ margin: "4px 0 0" }}>Cuenta: 4520123456789</p>
              <p style={{ margin: "4px 0 0" }}>Referencia: {Math.random().toString(36).substring(7).toUpperCase()}</p>
            </div>
          </Card>
        )}

        <button 
          onClick={handleCompletePayment}
          disabled={processingPayment}
          style={{ 
            background: "var(--accent)", 
            color: "#0d1117", 
            border: "none", 
            borderRadius: "12px", 
            padding: "14px 18px", 
            fontWeight: 700, 
            cursor: processingPayment ? "not-allowed" : "pointer",
            opacity: processingPayment ? 0.6 : 1
          }}
        >
          {processingPayment ? "Procesando..." : "Confirmar pago"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <SectionHeader title="Carrito de compra" action={cart.length ? <button onClick={onClear} style={{ background: "transparent", border: "1px solid var(--border)", padding: "10px 16px", borderRadius: "12px", color: "var(--text-muted)", cursor: "pointer" }}>Vaciar carrito</button> : null} />
      {cart.length === 0 ? (
        <Card><p style={{ margin: 0, color: "var(--text-muted)" }}>Tu carrito está vacío. Agrega productos desde el catálogo.</p></Card>
      ) : (
        <div style={{ display: "grid", gap: "14px" }}>
          {cart.map((item) => (
            <Card key={item.id} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <img src={item.imagen} alt={item.nombre} style={{ width: "120px", height: "80px", borderRadius: "12px", objectFit: "cover" }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700 }}>{item.nombre}</p>
                <p style={{ margin: "6px 0 0", color: "var(--text-faint)", fontSize: "13px" }}>Cantidad: {item.qty}</p>
                <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: "13px" }}>Subtotal: {formatCurrency(item.precioVenta * item.qty)}</p>
              </div>
              <button onClick={() => onRemove(item.id)} style={{ background: "var(--red-bg)", color: "var(--red)", border: "none", borderRadius: "10px", padding: "10px 14px", cursor: "pointer" }}>Eliminar</button>
            </Card>
          ))}
          <Card style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>Total</p>
              <p style={{ margin: "6px 0 0", fontSize: "22px", fontWeight: 700 }}>{formatCurrency(total)}</p>
            </div>
            <button onClick={handlePayNow} style={{ background: "var(--accent)", color: "#0d1117", border: "none", borderRadius: "12px", padding: "14px 18px", fontWeight: 700, cursor: "pointer" }}>Pagar ahora</button>
          </Card>
        </div>
      )}
    </div>
  );
}

function Profile({ userProfile, onUpdate }) {
  const [form, setForm] = useState({ ...userProfile });
  const [message, setMessage] = useState("");

  const handleSave = () => {
    onUpdate(form);
    setMessage("Perfil actualizado correctamente.");
  };

  return (
    <div style={{ display: "grid", gap: "22px" }}>
      <SectionHeader title="Perfil de usuario" />
      <Card style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        <div style={{ minWidth: "120px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "120px", height: "120px", borderRadius: "24px", overflow: "hidden", background: "var(--bg-hover)" }}>
            <img src={form.photo || "https://via.placeholder.com/120x120?text=Foto"} alt="Foto perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <Input label="Foto URL" value={form.photo || ""} onChange={(e) => setForm(f => ({ ...f, photo: e.target.value }))} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
          <Input label="Nombre" value={form.nombre || ""} onChange={(e) => setForm(f => ({ ...f, nombre: e.target.value }))} />
          <Input label="Correo" value={form.email || ""} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
          <Input label="Rol" value={form.rol || ""} disabled />
          <button onClick={handleSave} style={{ width: "fit-content", background: "var(--accent)", border: "none", color: "#0d1117", padding: "12px 18px", borderRadius: "12px", fontWeight: 700, cursor: "pointer" }}>Guardar cambios</button>
          {message && <div style={{ color: "var(--green)", fontSize: "13px" }}>{message}</div>}
        </div>
      </Card>
    </div>
  );
}

// ─── APP PRINCIPAL ─────────────────────────────────────────────────────────────
export default function App({ user, onLogout }) {
  const [page, setPage] = useState(user?.rol === "Usuario" ? "catalogo" : "dashboard");
  const [products,  setProducts]  = useState(initialProducts);
  const [movements, setMovements] = useState(initialMovements);
  const [pqrs,      setPQRs]      = useState(initialPQR);
  const [users,     setUsers]     = useState(initialUsers);
  const [cart,      setCart]      = useState([]);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [userProfile, setUserProfile] = useState({
    nombre: user?.nombre || "Usuario",
    email: user?.email || "",
    rol: user?.rol || "Usuario",
    photo: user?.photo || "",
  });

  useEffect(() => {
    const isAdmin = user?.rol === "Administrador";
    setPage(isAdmin ? "dashboard" : "catalogo");
    setUserProfile({
      nombre: user?.nombre || "Usuario",
      email: user?.email || "",
      rol: user?.rol || "Usuario",
      photo: user?.photo || "",
    });
  }, [user]);

  const isAdmin = user?.rol === "Administrador";
  const navItems = isAdmin ? ADMIN_NAV : USER_NAV;
  const lowStockCount = products.filter(p => p.cantidad <= p.minimo).length;
  const openPQRCount  = pqrs.filter(p => p.estado === "Abierto").length;
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const badges = {
    inventario: lowStockCount || null,
    pqr: openPQRCount || null,
    carrito: cartCount || null,
  };

  return (
    <>
      <StyleInjector />
      <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", flexDirection: "column" }}>

        {/* ── Header ── */}
        <header style={{
          background: "var(--bg-surface)", borderBottom: "1px solid var(--border)",
          position: "sticky", top: 0, zIndex: 100,
          boxShadow: "0 1px 0 var(--border), 0 4px 16px rgba(0,0,0,0.3)",
        }}>
          <div style={{
            maxWidth: "1100px", margin: "0 auto", padding: "0 20px",
            height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "18px", padding: "4px", display: "none" }}
                className="mobile-menu-btn"
              >☰</button>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "28px", height: "28px", background: "var(--accent)", borderRadius: "8px",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px",
                }}>🏢</div>
                <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                  Sistema de Gestión
                </span>
              </div>
            </div>

            {/* Nav desktop */}
            <nav style={{ display: "flex", alignItems: "center", gap: "2px" }}>
              {navItems.map(n => {
                const active = page === n.key;
                return (
                  <button
                    key={n.key}
                    onClick={() => setPage(n.key)}
                    style={{
                      position: "relative", display: "flex", alignItems: "center", gap: "6px",
                      padding: "7px 12px", borderRadius: "8px", border: "none", cursor: "pointer",
                      background: active ? "var(--accent)" : "transparent",
                      color: active ? "#0d1117" : "var(--text-muted)",
                      fontSize: "13px", fontWeight: active ? 700 : 500,
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text-primary)"; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; } }}
                  >
                    <span style={{ fontSize: "14px" }}>{n.icon}</span>
                    <span>{n.label}</span>
                    {badges[n.key] && (
                      <span style={{
                        position: "absolute", top: "2px", right: "2px",
                        background: "var(--red)", color: "#fff",
                        fontSize: "9px", fontWeight: 700, borderRadius: "50%",
                        width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center",
                        lineHeight: 1,
                      }}>
                        {badges[n.key]}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Avatar */}
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
            }}>
              <button
                onClick={onLogout}
                style={{
                  background: "transparent",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border)",
                  borderRadius: "999px",
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                Cerrar sesión
              </button>
              <div style={{
                width: "34px", height: "34px", borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent-dim), var(--accent))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 700, color: "#0d1117", cursor: "pointer",
                border: "2px solid var(--bg-elevated)",
              }}>
                AU
              </div>
            </div>
          </div>

          {/* Mobile nav drawer */}
          {menuOpen && (
            <div style={{ borderTop: "1px solid var(--border)", background: "var(--bg-elevated)" }} className="slide-dn">
              {navItems.map(n => (
                <button
                  key={n.key}
                  onClick={() => { setPage(n.key); setMenuOpen(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "10px",
                    padding: "12px 20px", background: page === n.key ? "var(--accent-glow)" : "none",
                    border: "none", borderLeft: `3px solid ${page === n.key ? "var(--accent)" : "transparent"}`,
                    color: page === n.key ? "var(--accent)" : "var(--text-muted)",
                    fontSize: "14px", fontWeight: 500, cursor: "pointer",
                    fontFamily: "'IBM Plex Sans', sans-serif", textAlign: "left", transition: "all 0.15s",
                  }}
                >
                  <span>{n.icon}</span><span>{n.label}</span>
                  {badges[n.key] && <Badge color="red">{badges[n.key]}</Badge>}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* ── Contenido ── */}
        <main style={{ flex: 1, maxWidth: "1100px", width: "100%", margin: "0 auto", padding: "28px 20px" }}>
          {page === "dashboard"   && <Dashboard products={products} movements={movements} pqrs={pqrs} users={users} />}
          {page === "inventario"  && <Inventario products={products} setProducts={setProducts} movements={movements} setMovements={setMovements} />}
          {page === "movimientos" && <Movimientos movements={movements} products={products} />}
          {page === "pqr"         && <PQR pqrs={pqrs} setPQRs={setPQRs} />}
          {page === "usuarios"    && <Usuarios users={users} setUsers={setUsers} />}
          {page === "catalogo"    && <Catalog 
            items={products} 
            user={user}
            cart={cart} 
            onAdd={(item) => setCart(prev => {
              const existing = prev.find(i => i.id === item.id);
              if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
              return [...prev, { ...item, qty: 1 }];
            })} 
            onEdit={(id, updatedItem) => setProducts(prev => prev.map(item => item.id === id ? { ...item, ...updatedItem } : item))}
            onDelete={(id) => setProducts(prev => prev.filter(item => item.id !== id))}
          />}
          {page === "carrito"     && <CartPage cart={cart} onRemove={(id) => setCart(prev => prev.filter(item => item.id !== id))} onClear={() => setCart([])} />}
          {page === "perfil"      && <Profile userProfile={userProfile} onUpdate={setUserProfile} />}
        </main>

        {/* ── Footer ── */}
        <footer style={{
          borderTop: "1px solid var(--border)", padding: "14px 20px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)" }} />
          <span style={{ fontSize: "11px", color: "var(--text-faint)", letterSpacing: "0.04em" }}>
            Stockly V1
          </span>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)" }} />
        </footer>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          nav { display: none !important; }
        }
      `}</style>
    </>
  );
}
