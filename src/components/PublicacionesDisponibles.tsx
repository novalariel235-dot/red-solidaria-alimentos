import { useState, useEffect } from 'react';
import { Package, Clock, Calendar, MessageCircle, Search, Filter, X, Store } from 'lucide-react';
import { obtenerTodasLasPublicaciones, crearReserva, crearOObtenerChat, enviarMensaje, type Publicacion } from '../services';

interface PublicacionesDisponiblesProps {
  comedorId: string;
  comedorNombre: string;
  onIniciarChat?: (chatId: string) => void;
}

export default function PublicacionesDisponibles({ comedorId, comedorNombre, onIniciarChat }: PublicacionesDisponiblesProps) {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [publicacionSeleccionada, setPublicacionSeleccionada] = useState<Publicacion | null>(null);
  const [mensajeReserva, setMensajeReserva] = useState('');
  const [mensajeChat, setMensajeChat] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [modoAccion, setModoAccion] = useState<'detalles' | 'reservar' | 'contactar'>('detalles');

  useEffect(() => {
    cargarPublicaciones();
  }, []);

  const cargarPublicaciones = async () => {
    try {
      setCargando(true);
      console.log('🔄 Cargando publicaciones disponibles...');
      const data = await obtenerTodasLasPublicaciones();
      console.log('📦 Total de publicaciones recibidas:', data.length);
      
      // Solo mostrar publicaciones disponibles
      const disponibles = data.filter(p => p.estado === 'disponible');
      console.log('✅ Publicaciones disponibles:', disponibles.length);
      
      setPublicaciones(disponibles);
    } catch (error) {
      console.error('❌ Error cargando publicaciones:', error);
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
        mensajeReserva
      );
      
      alert('¡Reserva enviada! El comercio te notificará cuando la acepte.');
      cerrarModal();
      cargarPublicaciones();
    } catch (error) {
      console.error('Error reservando:', error);
      alert('Error al enviar la reserva');
    } finally {
      setEnviando(false);
    }
  };

  const handleContactar = async () => {
    if (!publicacionSeleccionada) return;
    
    try {
      setEnviando(true);
      console.log('💬 Iniciando chat con comercio:', publicacionSeleccionada.comercioNombre);
      console.log('💬 Comedor ID:', comedorId);
      console.log('💬 Comercio ID:', publicacionSeleccionada.usuarioId);
      
      const chatId = await crearOObtenerChat(
        comedorId,
        comedorNombre,
        publicacionSeleccionada.usuarioId,
        publicacionSeleccionada.comercioNombre,
        publicacionSeleccionada.id
      );
      
      console.log('✅ Chat creado/obtenido:', chatId);
      
      // Si hay mensaje inicial, enviarlo
      if (mensajeChat.trim()) {
        await enviarMensaje(
          chatId,
          comedorId,
          comedorNombre,
          publicacionSeleccionada.usuarioId,
          mensajeChat
        );
        console.log('✅ Mensaje inicial enviado');
      }
      
      cerrarModal();
      
      if (onIniciarChat) {
        onIniciarChat(chatId);
      } else {
        alert('Chat iniciado. Andá al módulo "Chat" para ver la conversación.');
      }
    } catch (error) {
      console.error('❌ Error iniciando chat:', error);
      alert('Error al iniciar el chat: ' + (error as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  const abrirModal = (pub: Publicacion) => {
    setPublicacionSeleccionada(pub);
    setModoAccion('detalles');
    setMensajeReserva('');
    setMensajeChat('');
  };

  const cerrarModal = () => {
    setPublicacionSeleccionada(null);
    setModoAccion('detalles');
    setMensajeReserva('');
    setMensajeChat('');
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
          Hacé click en una publicación para ver detalles, contactar al comercio o reservar
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
            <div 
              key={pub.id} 
              onClick={() => abrirModal(pub)}
              className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 hover:shadow-lg hover:border-[#5a7a54] dark:hover:border-[#8faa88] transition-all cursor-pointer"
            >
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

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100 dark:border-stone-700">
                <span className="text-xs text-stone-400 dark:text-stone-500">
                  Click para ver detalles →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles/acción */}
      {publicacionSeleccionada && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" onClick={cerrarModal}>
          <div className="bg-white dark:bg-stone-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
                  {publicacionSeleccionada.categoria}
                </h2>
                <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
                  Publicado por {publicacionSeleccionada.comercioNombre}
                </p>
              </div>
              <button
                onClick={cerrarModal}
                className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-stone-500 dark:text-stone-400" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-6">
              {modoAccion === 'detalles' && (
                <>
                  {/* Detalles de la publicación */}
                  <div className="space-y-4">
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

                    <div>
                      <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Comercio</label>
                      <div className="px-4 py-3 bg-stone-50 dark:bg-stone-700 rounded-xl flex items-center gap-3">
                        <Store className="w-5 h-5 text-[#5a7a54] dark:text-[#8faa88]" />
                        <span className="text-stone-800 dark:text-stone-100">{publicacionSeleccionada.comercioNombre}</span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-3 pt-4 border-t border-stone-200 dark:border-stone-700">
                    <button
                      onClick={() => setModoAccion('contactar')}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-stone-700 hover:bg-stone-50 dark:hover:bg-stone-600 text-[#5a7a54] dark:text-[#8faa88] border-2 border-[#5a7a54] dark:border-[#8faa88] rounded-xl font-semibold transition-all"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Contactar Comercio
                    </button>
                    <button
                      onClick={() => setModoAccion('reservar')}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#5a7a54] dark:bg-[#4a5d49] hover:bg-[#4d6a48] dark:hover:bg-[#3d4d3c] text-white rounded-xl font-semibold transition-all"
                    >
                      <Package className="w-5 h-5" />
                      Reservar
                    </button>
                  </div>
                </>
              )}

              {modoAccion === 'contactar' && (
                <>
                  <div className="bg-[#5a7a54]/10 dark:bg-[#4a5d49]/20 rounded-xl p-4 border border-[#5a7a54]/20 dark:border-[#4a5d49]/30">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="w-5 h-5 text-[#5a7a54] dark:text-[#8faa88] shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-stone-800 dark:text-stone-100 mb-1">Iniciar conversación</h3>
                        <p className="text-sm text-stone-600 dark:text-stone-300">
                          Se abrirá un chat con {publicacionSeleccionada.comercioNombre}. Podés enviar un mensaje inicial opcional.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">
                      Mensaje inicial (opcional)
                    </label>
                    <textarea
                      value={mensajeChat}
                      onChange={(e) => setMensajeChat(e.target.value)}
                      placeholder="Ej: Hola, vi tu publicación de facturas. ¿Todavía están disponibles?"
                      rows={4}
                      className="w-full px-4 py-3 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-xl focus:border-[#5a7a54] dark:focus:border-[#8faa88] focus:ring-2 focus:ring-[#5a7a54]/10 dark:focus:ring-[#8faa88]/10 transition-all outline-none resize-none text-stone-800 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-stone-200 dark:border-stone-700">
                    <button
                      onClick={() => setModoAccion('detalles')}
                      className="px-6 py-3 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 font-semibold rounded-xl transition-all"
                    >
                      Volver
                    </button>
                    <button
                      onClick={handleContactar}
                      disabled={enviando}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#5a7a54] dark:bg-[#4a5d49] hover:bg-[#4d6a48] dark:hover:bg-[#3d4d3c] disabled:opacity-50 text-white rounded-xl font-semibold transition-all"
                    >
                      <MessageCircle className="w-5 h-5" />
                      {enviando ? 'Iniciando chat...' : 'Iniciar Chat'}
                    </button>
                  </div>
                </>
              )}

              {modoAccion === 'reservar' && (
                <>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-900">
                    <div className="flex items-start gap-3">
                      <Package className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-stone-800 dark:text-stone-100 mb-1">Solicitar reserva</h3>
                        <p className="text-sm text-stone-600 dark:text-stone-300">
                          Enviá una solicitud de reserva a {publicacionSeleccionada.comercioNombre}. El comercio te notificará cuando la acepte.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">
                      Mensaje para el comercio (opcional)
                    </label>
                    <textarea
                      value={mensajeReserva}
                      onChange={(e) => setMensajeReserva(e.target.value)}
                      placeholder="Ej: Hola, somos el Comedor Esperanza y nos interesa reservar estos alimentos..."
                      rows={4}
                      className="w-full px-4 py-3 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-xl focus:border-[#5a7a54] dark:focus:border-[#8faa88] focus:ring-2 focus:ring-[#5a7a54]/10 dark:focus:ring-[#8faa88]/10 transition-all outline-none resize-none text-stone-800 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-stone-200 dark:border-stone-700">
                    <button
                      onClick={() => setModoAccion('detalles')}
                      className="px-6 py-3 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 font-semibold rounded-xl transition-all"
                    >
                      Volver
                    </button>
                    <button
                      onClick={handleReservar}
                      disabled={enviando}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#5a7a54] dark:bg-[#4a5d49] hover:bg-[#4d6a48] dark:hover:bg-[#3d4d3c] disabled:opacity-50 text-white rounded-xl font-semibold transition-all"
                    >
                      <Package className="w-5 h-5" />
                      {enviando ? 'Enviando...' : 'Enviar Reserva'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
