import React, { useEffect, useState } from "react";
import '../styles/pages/ReportesAdmin.css';
import '../styles/Botones.css';

interface Reporte {
  id: number;
  tipo: string;
  usuario: string;
  descripcion: string;
  fecha: string;
  estado: "pendiente" | "en-proceso" | "atendido";
  detalles?: Record<string, any>;
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

const ReportesAdministrador: React.FC = () => {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [orden, setOrden] = useState<"nuevo" | "antiguo">("nuevo");
  const [tipoExpandido, setTipoExpandido] = useState<string | null>(null);
  const [selected, setSelected] = useState<Reporte | null>(null);
  const [estadoReporte, setEstadoReporte] = useState<Reporte["estado"]>("pendiente");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    enProceso: 0,
    atendidos: 0,
  });

  // 🔄 Cargar reportes desde la API
  const obtenerReportes = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        orden,
        usuario: filtroUsuario || "",
      }).toString();

      const res = await fetch(`/.netlify/functions/reportes?${query}`);
      if (!res.ok) throw new Error("Error al obtener reportes");
      const data: ApiResponse<Reporte[]> = await res.json();
      
      if (data.success) {
        setReportes(data.data);
        
        // Calcular estadísticas
        const total = data.data.length;
        const pendientes = data.data.filter(r => r.estado === "pendiente").length;
        const enProceso = data.data.filter(r => r.estado === "en-proceso").length;
        const atendidos = data.data.filter(r => r.estado === "atendido").length;
        
        setStats({ total, pendientes, enProceso, atendidos });
      }
    } catch (error) {
      console.error("Error cargando reportes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerReportes();
  }, [orden, filtroUsuario]);

  // 🔽 ACTUALIZAR ESTADO DEL REPORTE
  const actualizarEstadoReporte = async (id: number, nuevoEstado: Reporte["estado"]) => {
    try {
      const res = await fetch(`/.netlify/functions/reportes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!res.ok) throw new Error("Error al actualizar reporte");

      const data: ApiResponse<Reporte> = await res.json();
      
      if (data.success) {
        // 🔄 ACTUALIZAR LISTA INMEDIATAMENTE
        await obtenerReportes();
        
        if (nuevoEstado === "atendido") {
          setSelected(null);
        }
      }
    } catch (error) {
      console.error("Error actualizando reporte:", error);
    }
  };

  // 🔽 CATEGORÍAS DE REPORTES
  const tipos = [
    "Clientes", 
    "Vehiculos", 
    "Inventario", 
    "Citas", 
    "OrdenTrabajos", 
    "Cotizacion",
    "Usuarios",
    "Sistema"
  ];

  const reportesPorTipo = tipos.map((tipo) => ({
    tipo,
    lista: reportes.filter((r) => r.tipo === tipo && r.estado !== "atendido"),
  }));

  // 🔽 FUNCIÓN PARA FORMATEAR NOMBRES
  const formatearTipo = (tipo: string): string => {
    const formatos: Record<string, string> = {
      "Clientes": "Clientes",
      "Vehiculos": "Vehículos",
      "Inventario": "Inventario",
      "Citas": "Citas",
      "OrdenTrabajos": "Orden de Trabajos",
      "Cotizacion": "Cotizaciones",
      "Usuarios": "Usuarios",
      "Sistema": "Sistema"
    };
    return formatos[tipo] || tipo;
  };

  // 🔽 ICONOS POR TIPO
  const getIconoTipo = (tipo: string): string => {
    const iconos: Record<string, string> = {
      "Clientes": "👥",
      "Vehiculos": "🚗",
      "Inventario": "📦",
      "Citas": "📅",
      "OrdenTrabajos": "🔧",
      "Cotizacion": "💰",
      "Usuarios": "👤",
      "Sistema": "⚙️"
    };
    return iconos[tipo] || "📄";
  };

  return (
    <div className="reportes-admin">
      {/* ================== HEADER SECTION ================== */}
      <div className="header-section">
        <h1>📊 Gestión de Reportes</h1>
        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">Total</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-item estado-pendiente">
            <span className="stat-label">Pendientes</span>
            <span className="stat-value">{stats.pendientes}</span>
          </div>
          <div className="stat-item estado-en-proceso">
            <span className="stat-label">En Proceso</span>
            <span className="stat-value">{stats.enProceso}</span>
          </div>
          <div className="stat-item estado-atendido">
            <span className="stat-label">Atendidos</span>
            <span className="stat-value">{stats.atendidos}</span>
          </div>
        </div>
      </div>

      {/* ================== CONTENEDOR PRINCIPAL ================== */}
      <div className="contenedor-principal">
        {/* ================== CONTENEDOR IZQUIERDO (Lista) ================== */}
        <div className="contenedor-lista">
          {/* ================== BARRA DE BÚSQUEDA ================== */}
          <div className="busqueda-agregar">
            <input
              type="text"
              placeholder="🔍 Buscar por usuario..."
              value={filtroUsuario}
              onChange={(e) => setFiltroUsuario(e.target.value)}
              className="search-bar"
            />
            
            <div className="filtros-rapidos">
              <button
                onClick={() => setOrden("nuevo")}
                className={`btn-filtro-rapido ${orden === "nuevo" ? "active" : ""}`}
              >
                ⬇ Más nuevos
              </button>
              <button
                onClick={() => setOrden("antiguo")}
                className={`btn-filtro-rapido ${orden === "antiguo" ? "active" : ""}`}
              >
                ⬆ Más antiguos
              </button>
            </div>
          </div>

          {/* ================== TABLA CONTAINER ================== */}
          <div className="table-container">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Cargando reportes...</p>
              </div>
            ) : reportes.length === 0 ? (
              <div className="no-results">
                <div className="no-results-icon">📭</div>
                <p>No hay reportes pendientes</p>
                <p className="subtitulo">Todos los reportes han sido atendidos</p>
              </div>
            ) : (
              <div className="lista-reportes">
                {reportesPorTipo.map((grupo) => (
                  <div key={grupo.tipo} className="categoria-item">
                    <div
                      onClick={() =>
                        setTipoExpandido((prev) =>
                          prev === grupo.tipo ? null : grupo.tipo
                        )
                      }
                      className="categoria-header"
                    >
                      <div className="categoria-info">
                        <span className="categoria-icon">
                          {getIconoTipo(grupo.tipo)}
                        </span>
                        <span className="categoria-nombre">
                          {formatearTipo(grupo.tipo)}
                        </span>
                      </div>
                      <div className="categoria-stats">
                        <span className={`badge-cantidad ${grupo.lista.length === 0 ? 'empty' : 'active'}`}>
                          {grupo.lista.length}
                        </span>
                        <span className="categoria-toggle">
                          {tipoExpandido === grupo.tipo ? "▲" : "▼"}
                        </span>
                      </div>
                    </div>

                    {tipoExpandido === grupo.tipo && (
                      <div className="categoria-contenido">
                        {grupo.lista.length === 0 ? (
                          <div className="no-reportes-categoria">
                            <p>✅ No hay reportes pendientes en esta categoría</p>
                          </div>
                        ) : (
                          grupo.lista.map((r) => (
                            <div
                              key={r.id}
                              onClick={() => {
                                setSelected(r);
                                setEstadoReporte(r.estado);
                              }}
                              className={`reporte-item ${selected?.id === r.id ? "selected" : ""}`}
                            >
                              <div className="reporte-header">
                                <div className="reporte-usuario">
                                  <span className={`estado-indicador estado-${r.estado}`}>
                                    ●
                                  </span>
                                  <span className="usuario-nombre">{r.usuario}</span>
                                </div>
                                <div className="reporte-fecha">
                                  {new Date(r.fecha).toLocaleDateString("es-CR")}
                                </div>
                              </div>
                              <div className="reporte-descripcion">
                                {r.descripcion.length > 80
                                  ? `${r.descripcion.substring(0, 80)}...`
                                  : r.descripcion}
                              </div>
                              <div className="reporte-footer">
                                <span className={`badge-estado estado-${r.estado}`}>
                                  {r.estado === "pendiente" ? "⏳ Pendiente" : 
                                   r.estado === "en-proceso" ? "🔄 En Proceso" : 
                                   "✅ Atendido"}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ================== CONTENEDOR DERECHO (Detalles) ================== */}
        <div className="contenedor-detalles">
          {selected ? (
            <div className="sidebar-details">
              <div className="sidebar-header">
                <h4>📋 Detalles del Reporte</h4>
                <button className="btn-close" onClick={() => setSelected(null)}>
                  ×
                </button>
              </div>

              <div className="sidebar-body">
                <div className="detail-item">
                  <span className="detail-label">ID:</span>
                  <span className="detail-value codigo-value">#{selected.id}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Tipo:</span>
                  <span className="detail-value">
                    {getIconoTipo(selected.tipo)} {formatearTipo(selected.tipo)}
                  </span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Usuario:</span>
                  <span className="detail-value">{selected.usuario}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Fecha:</span>
                  <span className="detail-value">
                    {new Date(selected.fecha).toLocaleString("es-CR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Estado:</span>
                  <div className="estado-selector">
                    <select 
                      value={estadoReporte}
                      onChange={(e) => setEstadoReporte(e.target.value as Reporte["estado"])}
                      className={`select-estado estado-${estadoReporte}`}
                    >
                      <option value="pendiente">⏳ Pendiente</option>
                      <option value="en-proceso">🔄 En Proceso</option>
                      <option value="atendido">✅ Atendido</option>
                    </select>
                  </div>
                </div>

                <div className="detail-section">
                  <h5>📝 Descripción</h5>
                  <div className="reporte-descripcion-completa">
                    {selected.descripcion}
                  </div>
                </div>

                {selected.detalles && Object.keys(selected.detalles).length > 0 && (
                  <div className="detail-section">
                    <h5>📊 Información Adicional</h5>
                    <div className="detalles-extra">
                      {Object.entries(selected.detalles).map(([key, value]) => (
                        <div key={key} className="detalle-item">
                          <span className="detalle-label">{key}:</span>
                          <span className="detalle-value">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="sidebar-footer">
                <button 
                  className="boton-guardar"
                  onClick={() => actualizarEstadoReporte(selected.id, estadoReporte)}
                >
                  💾 Guardar Estado
                </button>
                <button 
                  className="boton-atendido"
                  onClick={() => actualizarEstadoReporte(selected.id, "atendido")}
                >
                  ✅ Marcar como Atendido
                </button>
              </div>
            </div>
          ) : (
            <div className="sidebar-placeholder">
              <div className="placeholder-icon">📄</div>
              <h4>Selecciona un reporte</h4>
              <p className="subtitulo">Haz clic en cualquier reporte de la lista para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportesAdministrador;