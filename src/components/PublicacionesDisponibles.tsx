import { useState, useEffect } from 'react';
import { Package, Clock, Calendar, MessageCircle, Search, Filter } from 'lucide-react';
import { obtenerTodasLasPublicaciones, crearReserva, type Publicacion } from '../services';

interface PublicacionesDisponiblesProps {
  comedorId: string;
  comedorNombre: string;
}

export default function PublicacionesDisponibles({ comedorId, comedorNombre }: PublicacionesDisponiblesProps) {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [publicacionSeleccionada, setPublicacionSeleccionada] = useState<Publicacion | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    cargarPublicaciones();
  }, []);

  const cargarPublicaciones = async () => {
    try {
      setCargando(true);
      const data = await obtenerTodasLasPublicaciones();
      // Solo mostrar publicaciones disponibles
      setPublicaciones(data.filter(p => p.estado === 'disponible'));
    } catch (error) {
      console.error('Error cargando publicaciones:', error);
    } finally {
      setCargando(false);
    }
  };

  const categorias = ['todas', ...Array.from(new Set(publicaciones.map(p => p.categoria)))];

  const publicacionesFiltradas = publicaciones.filter(p => {
    const coincideBusqueda = busqueda === '' || 
      p.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.comercioNombre.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideCategoria = categoriaFiltro === 'todas' || p.categoria === categoriaFiltro;
    
    return coincideBusqueda && coincideCategoria;
  });

  const handleReservar = async () => {
    if (!publicacionSeleccionada) return;
    
    try {
      setEnviando(true);
      await crearReserva(
        publicacionSeleccionada.id,
        comedorId,
        comedorNombre,
        publicacionSeleccionada.usuarioId,
        publicacionSeleccionada.comercioNombre,
        mensaje
      );
      
      alert('¡Reserva enviada! El comercio te notificará cuando la acepte.');
      setPublicacionSeleccionada(null);
      setMensaje('');
      cargarPublicaciones(); // Recargar para actualizar la lista
    } catch (error) {
      console.error('Error reservando:', error);
      alert('Error al enviar la reserva');
    } finally {
      setEnviando(false);
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
          <p className="text-stone-500 dark:text-stone-400">Cargando publicaciones disponibles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-2">Publicaciones Disponibles</h1>
        <p className="text-stone-500 dark:text-stone-400">
          Explorá los excedentes disponibles de comercios locales y reservá lo que necesites
        </p>
      </div>

      {/* Controles de búsqueda y filtro */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por comercio, categoría o descripción..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-[#5a7a54] dark:focus:border-[#8faa88] focus:ring-2 focus:ring-[#5a7a54]/10 dark:focus:ring-[#8faa88]/10 transition-all outline-none"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="pl-10 pr-8 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-100 focus:border-[#5a7a54] dark:focus:border-[#8faa88] focus:ring-2 focus:ring-[#5a7a54]/10 dark:focus:ring-[#8faa88]/10 transition-all outline-none appearance-none cursor-pointer"
          >
            {categorias.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'todas' ? 'Todas las categorías' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de publicaciones */}
      {publicacionesFiltradas.length === 0 ? (
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-12 text-center">
          <Package className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2">
            {busqueda || categoriaFiltro !== 'todas' 
              ? 'No se encontraron publicaciones' 
              : 'No hay publicaciones disponibles'}
          </h3>
          <p className="text-stone-500 dark:text-stone-400">
            {busqueda || categoriaFiltro !== 'todas'
              ? 'Intentá con otros términos de búsqueda'
              : 'Los comercios aún no han publicado excedentes'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {publicacionesFiltradas.map((pub) => (
            <div key={pub.id} className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 hover:shadow-lg transition-all">
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
                    <div className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                      <span className="font-medium">Comercio:</span> {pub.comercioNombre}
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900">
                  Disponible
                </span>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-stone-100 dark:border-stone-700">
                <button 
                  onClick={() => setPublicacionSeleccionada(pub)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#5a7a54] dark:bg-[#4a5d49] hover:bg-[#4d6a48] dark:hover:bg-[#3d4d3c] text-white transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  Reservar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de reserva */}
      {publicacionSeleccionada && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setPublicacionSeleccionada(null)}>
          <div className="bg-white dark:bg-stone-800 rounded-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-stone-200 dark:border-stone-700">
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Reservar publicación</h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
                Enviá una solicitud de reserva al comercio
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-stone-50 dark:bg-stone-700 rounded-xl p-4">
                <div className="font-semibold text-stone-800 dark:text-stone-100 mb-1">
                  {publicacionSeleccionada.categoria}
                </div>
                <div className="text-sm text-stone-600 dark:text-stone-300 mb-2">
                  {publicacionSeleccionada.descripcion}
                </div>
                <div className="text-sm text-stone-500 dark:text-stone-400">
                  <span className="font-medium">Cantidad:</span> {publicacionSeleccionada.cantidad}
                </div>
                <div className="text-sm text-stone-500 dark:text-stone-400">
                  <span className="font-medium">Comercio:</span> {publicacionSeleccionada.comercioNombre}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">
                  Mensaje para el comercio (opcional)
                </label>
                <textarea
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Ej: Hola, somos el Comedor Esperanza y nos interesa reservar estos alimentos..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-xl focus:border-[#5a7a54] dark:focus:border-[#8faa88] focus:ring-2 focus:ring-[#5a7a54]/10 dark:focus:ring-[#8faa88]/10 transition-all outline-none resize-none text-stone-800 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-stone-200 dark:border-stone-700 flex gap-3">
              <button
                onClick={handleReservar}
                disabled={enviando}
                className="flex-1 bg-[#5a7a54] dark:bg-[#4a5d49] hover:bg-[#4d6a48] dark:hover:bg-[#3d4d3c] disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all"
              >
                {enviando ? 'Enviando...' : 'Enviar reserva'}
              </button>
              <button
                onClick={() => {
                  setPublicacionSeleccionada(null);
                  setMensaje('');
                }}
                className="px-6 py-3 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 font-semibold rounded-xl transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
