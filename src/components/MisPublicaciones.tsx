import { Package, Calendar, Clock, Edit2, Trash2, Eye, X, Save, AlertCircle, Search, Download, LayoutGrid, LayoutList, ArrowUpDown } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { 
  obtenerPublicacionesUsuario, 
  actualizarEstadoPublicacion, 
  eliminarPublicacion,
  type Publicacion 
} from '../services';

interface MisPublicacionesProps {
  usuarioId: string;
  comercioNombre: string;
}

export default function MisPublicaciones({ usuarioId, comercioNombre }: MisPublicacionesProps) {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [filtro, setFiltro] = useState<string>('todas');
  const [busqueda, setBusqueda] = useState<string>('');
  const [orden, setOrden] = useState<'reciente' | 'antiguo'>('reciente');
  const [vista, setVista] = useState<'lista' | 'grid'>('lista');
  const [cargando, setCargando] = useState(true);
  const [publicacionSeleccionada, setPublicacionSeleccionada] = useState<Publicacion | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [publicacionEditada, setPublicacionEditada] = useState<Partial<Publicacion>>({});
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargarPublicaciones();
  }, [usuarioId]);

  const cargarPublicaciones = async () => {
    try {
      setCargando(true);
      const data = await obtenerPublicacionesUsuario(usuarioId);
      setPublicaciones(data);
    } catch (error) {
      console.error('Error cargando publicaciones:', error);
    } finally {
      setCargando(false);
    }
  };

  // Estadísticas rápidas
  const estadisticas = useMemo(() => {
    const total = publicaciones.length;
    const disponibles = publicaciones.filter(p => p.estado === 'disponible').length;
    const reservadas = publicaciones.filter(p => p.estado === 'reservado').length;
    const entregadas = publicaciones.filter(p => p.estado === 'entregado').length;
    return { total, disponibles, reservadas, entregadas };
  }, [publicaciones]);

  // Filtrar y ordenar publicaciones
  const publicacionesFiltradas = useMemo(() => {
    let resultado = publicaciones;
    
    // Filtrar por estado
    if (filtro !== 'todas') {
      resultado = resultado.filter(p => p.estado === filtro);
    }
    
    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(p => 
        p.categoria.toLowerCase().includes(termino) ||
        p.descripcion.toLowerCase().includes(termino) ||
        p.cantidad.toLowerCase().includes(termino)
      );
    }
    
    // Ordenar por fecha
    resultado = [...resultado].sort((a, b) => {
      const fechaA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const fechaB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return orden === 'reciente' ? fechaB - fechaA : fechaA - fechaB;
    });
    
    return resultado;
  }, [publicaciones, filtro, busqueda, orden]);

  // Exportar datos
  const exportarDatos = () => {
    const datosExportar = publicacionesFiltradas.map(p => ({
      Categoria: p.categoria,
      Descripcion: p.descripcion,
      Cantidad: p.cantidad,
      Vencimiento: p.vencimientoEstimado,
      Estado: p.estado,
      Fecha: formatearFecha(p.createdAt)
    }));
    
    const csv = [
      Object.keys(datosExportar[0] || {}).join(','),
      ...datosExportar.map(row => 
        Object.values(row).map(val => `"${val}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mis-publicaciones-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleEliminar = async (id: string) => {
    try {
      setProcesando(true);
      await eliminarPublicacion(id);
      setPublicaciones(publicaciones.filter(p => p.id !== id));
      setMostrarConfirmacionEliminar(null);
    } catch (error) {
      console.error('Error eliminando publicación:', error);
      alert('Error al eliminar la publicación');
    } finally {
      setProcesando(false);
    }
  };

  const handleGuardarEdicion = async () => {
    if (!publicacionSeleccionada) return;
    
    try {
      setProcesando(true);
      await actualizarEstadoPublicacion(
        publicacionSeleccionada.id,
        publicacionEditada.estado || publicacionSeleccionada.estado
      );
      
      // Actualizar estado local
      setPublicaciones(publicaciones.map(p => 
        p.id === publicacionSeleccionada.id 
          ? { ...p, ...publicacionEditada }
          : p
      ));
      
      setModoEdicion(false);
      setPublicacionSeleccionada(null);
    } catch (error) {
      console.error('Error actualizando publicación:', error);
      alert('Error al actualizar la publicación');
    } finally {
      setProcesando(false);
    }
  };

  const formatearFecha = (timestamp: any) => {
    if (!timestamp) return 'Fecha desconocida';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-AR');
  };

  if (cargando) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="text-center py-16">
          <div className="w-12 h-12 border-4 border-[#5a7a54] dark:border-[#8faa88] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500 dark:text-stone-400">Cargando publicaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-2">Mis Publicaciones</h1>
        <p className="text-stone-500 dark:text-stone-400">Gestioná tus publicaciones de excedentes</p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
          <div className="text-2xl font-bold text-stone-800 dark:text-stone-100">{estadisticas.total}</div>
          <div className="text-sm text-stone-500 dark:text-stone-400">Total</div>
        </div>
        <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{estadisticas.disponibles}</div>
          <div className="text-sm text-stone-500 dark:text-stone-400">Disponibles</div>
        </div>
        <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{estadisticas.reservadas}</div>
          <div className="text-sm text-stone-500 dark:text-stone-400">Reservadas</div>
        </div>
        <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
          <div className="text-2xl font-bold text-stone-600 dark:text-stone-400">{estadisticas.entregadas}</div>
          <div className="text-sm text-stone-500 dark:text-stone-400">Entregadas</div>
        </div>
      </div>

      {/* Controles de búsqueda y vista */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por categoría, descripción..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-[#5a7a54] dark:focus:border-[#8faa88] focus:ring-2 focus:ring-[#5a7a54]/10 dark:focus:ring-[#8faa88]/10 transition-all outline-none"
          />
        </div>

        {/* Ordenamiento */}
        <button
          onClick={() => setOrden(orden === 'reciente' ? 'antiguo' : 'reciente')}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:border-[#5a7a54] dark:hover:border-[#8faa88] transition-all"
        >
          <ArrowUpDown className="w-4 h-4" />
          {orden === 'reciente' ? 'Más recientes' : 'Más antiguos'}
        </button>

        {/* Vista */}
        <div className="flex gap-2">
          <button
            onClick={() => setVista('lista')}
            className={`p-2 rounded-xl border transition-all ${
              vista === 'lista'
                ? 'bg-[#5a7a54] dark:bg-[#4a5d49] text-white border-[#5a7a54] dark:border-[#4a5d49]'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-[#5a7a54] dark:hover:border-[#8faa88]'
            }`}
          >
            <LayoutList className="w-5 h-5" />
          </button>
          <button
            onClick={() => setVista('grid')}
            className={`p-2 rounded-xl border transition-all ${
              vista === 'grid'
                ? 'bg-[#5a7a54] dark:bg-[#4a5d49] text-white border-[#5a7a54] dark:border-[#4a5d49]'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-[#5a7a54] dark:hover:border-[#8faa88]'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>

        {/* Exportar */}
        {publicacionesFiltradas.length > 0 && (
          <button
            onClick={exportarDatos}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:border-[#5a7a54] dark:hover:border-[#8faa88] transition-all"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        )}
      </div>

      {/* Filtros por estado */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['todas', 'disponible', 'reservado', 'entregado'].map((estado) => (
          <button
            key={estado}
            onClick={() => setFiltro(estado)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filtro === estado
                ? 'bg-[#5a7a54] dark:bg-[#4a5d49] text-white'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-[#5a7a54] dark:hover:border-[#8faa88]'
            }`}
          >
            {estado === 'todas' ? 'Todas' : estado.charAt(0).toUpperCase() + estado.slice(1)}
          </button>
        ))}
      </div>

      {publicacionesFiltradas.length === 0 ? (
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-12 text-center">
          <Package className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2">No hay publicaciones</h3>
          <p className="text-stone-500 dark:text-stone-400">
            {busqueda ? 'No se encontraron resultados para tu búsqueda' : 'Todavía no tenés publicaciones en esta categoría'}
          </p>
        </div>
      ) : (
        <div className={vista === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'grid gap-4'}>
          {publicacionesFiltradas.map((pub) => (
            <div key={pub.id} className={`bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 hover:shadow-lg transition-all ${vista === 'grid' ? '' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#5a7a54]/10 dark:bg-[#4a5d49]/20 rounded-xl flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-[#5a7a54] dark:text-[#8faa88]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-800 dark:text-stone-100 text-lg mb-1">{pub.categoria}</h3>
                    <p className="text-stone-600 dark:text-stone-300 text-sm mb-2">{pub.descripcion}</p>
                    <div className="flex items-center gap-4 text-sm text-stone-500 dark:text-stone-400">
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {pub.cantidad}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Vence en {pub.vencimientoEstimado}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatearFecha(pub.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  pub.estado === 'disponible' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900' :
                  pub.estado === 'reservado' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900' :
                  'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-600'
                }`}>
                  {pub.estado === 'disponible' ? 'Disponible' :
                   pub.estado === 'reservado' ? 'Reservado' : 'Entregado'}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-stone-100 dark:border-stone-700">
                <button 
                  onClick={() => {
                    setPublicacionSeleccionada(pub);
                    setPublicacionEditada(pub);
                    setModoEdicion(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  Ver detalles
                </button>
                {pub.estado !== 'entregado' && (
                  <>
                    <button 
                      onClick={() => {
                        setPublicacionSeleccionada(pub);
                        setPublicacionEditada(pub);
                        setModoEdicion(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-[#5a7a54] dark:text-[#8faa88] hover:bg-[#5a7a54]/5 dark:hover:bg-[#4a5d49]/20 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar
                    </button>
                    <button 
                      onClick={() => setMostrarConfirmacionEliminar(pub.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </>
                )}
              </div>

              {/* Confirmación de eliminación */}
              {mostrarConfirmacionEliminar === pub.id && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-3">
                        ¿Estás seguro de que querés eliminar esta publicación? Esta acción no se puede deshacer.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEliminar(pub.id)}
                          disabled={procesando}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all"
                        >
                          {procesando ? 'Eliminando...' : 'Sí, eliminar'}
                        </button>
                        <button
                          onClick={() => setMostrarConfirmacionEliminar(null)}
                          disabled={procesando}
                          className="px-4 py-2 bg-white dark:bg-stone-700 hover:bg-stone-50 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 text-sm font-medium rounded-lg border border-stone-200 dark:border-stone-600 transition-all"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles/edición */}
      {publicacionSeleccionada && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => {
          setPublicacionSeleccionada(null);
          setModoEdicion(false);
        }}>
          <div className="bg-white dark:bg-stone-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
                {modoEdicion ? 'Editar publicación' : 'Detalles de la publicación'}
              </h2>
              <button
                onClick={() => {
                  setPublicacionSeleccionada(null);
                  setModoEdicion(false);
                }}
                className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-stone-500 dark:text-stone-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Información básica */}
              <div>
                <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Comercio</label>
                <div className="px-4 py-3 bg-stone-50 dark:bg-stone-700 rounded-xl text-stone-800 dark:text-stone-100">
                  {publicacionSeleccionada.comercioNombre}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Categoría</label>
                <div className="px-4 py-3 bg-stone-50 dark:bg-stone-700 rounded-xl text-stone-800 dark:text-stone-100">
                  {publicacionSeleccionada.categoria}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Descripción</label>
                <div className="px-4 py-3 bg-stone-50 dark:bg-stone-700 rounded-xl text-stone-800 dark:text-stone-100">
                  {publicacionSeleccionada.descripcion}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Cantidad</label>
                  <div className="px-4 py-3 bg-stone-50 dark:bg-stone-700 rounded-xl text-stone-800 dark:text-stone-100">
                    {publicacionSeleccionada.cantidad}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Vencimiento</label>
                  <div className="px-4 py-3 bg-stone-50 dark:bg-stone-700 rounded-xl text-stone-800 dark:text-stone-100">
                    {publicacionSeleccionada.vencimientoEstimado}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Fecha de publicación</label>
                <div className="px-4 py-3 bg-stone-50 dark:bg-stone-700 rounded-xl text-stone-800 dark:text-stone-100">
                  {formatearFecha(publicacionSeleccionada.createdAt)}
                </div>
              </div>

              {/* Estado - editable */}
              {modoEdicion ? (
                <div>
                  <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Estado</label>
                  <select
                    value={publicacionEditada.estado}
                    onChange={(e) => setPublicacionEditada({ ...publicacionEditada, estado: e.target.value as any })}
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-xl text-stone-800 dark:text-stone-100 focus:border-[#5a7a54] dark:focus:border-[#8faa88] focus:ring-2 focus:ring-[#5a7a54]/10 dark:focus:ring-[#8faa88]/10 transition-all outline-none"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="reservado">Reservado</option>
                    <option value="entregado">Entregado</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Estado</label>
                  <div className={`px-4 py-3 rounded-xl border ${
                    publicacionSeleccionada.estado === 'disponible' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900 text-green-700 dark:text-green-400' :
                    publicacionSeleccionada.estado === 'reservado' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900 text-yellow-700 dark:text-yellow-400' :
                    'bg-stone-50 dark:bg-stone-700 border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-300'
                  }`}>
                    {publicacionSeleccionada.estado === 'disponible' ? 'Disponible' :
                     publicacionSeleccionada.estado === 'reservado' ? 'Reservado' : 'Entregado'}
                  </div>
                </div>
              )}

              {/* Información del comedor si está reservado/entregado */}
              {publicacionSeleccionada.comedorNombre && (
                <div>
                  <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Comedor</label>
                  <div className="px-4 py-3 bg-stone-50 dark:bg-stone-700 rounded-xl text-stone-800 dark:text-stone-100">
                    {publicacionSeleccionada.comedorNombre}
                  </div>
                </div>
              )}
            </div>

            {/* Footer con acciones */}
            <div className="sticky bottom-0 bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 p-6 flex gap-3">
              {modoEdicion ? (
                <>
                  <button
                    onClick={handleGuardarEdicion}
                    disabled={procesando}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#5a7a54] dark:bg-[#4a5d49] hover:bg-[#4d6a48] dark:hover:bg-[#3d4d3c] disabled:opacity-50 text-white font-semibold rounded-xl transition-all"
                  >
                    <Save className="w-5 h-5" />
                    {procesando ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                  <button
                    onClick={() => {
                      setModoEdicion(false);
                      setPublicacionEditada(publicacionSeleccionada);
                    }}
                    disabled={procesando}
                    className="px-6 py-3 bg-white dark:bg-stone-700 hover:bg-stone-50 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 font-semibold rounded-xl border border-stone-200 dark:border-stone-600 transition-all"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setPublicacionSeleccionada(null);
                    setModoEdicion(false);
                  }}
                  className="flex-1 px-6 py-3 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 font-semibold rounded-xl transition-all"
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
