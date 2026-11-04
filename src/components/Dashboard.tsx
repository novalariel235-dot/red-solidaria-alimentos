import { useState, useEffect } from 'react';
import { Package, TrendingUp, Users, Heart, ArrowRight, Calendar, Clock, ShoppingBag, ClipboardList, X, MessageCircle, Store } from 'lucide-react';
import { obtenerPublicacionesUsuario, obtenerNotificacionesUsuario, obtenerEstadisticasUsuario, obtenerTodasLasPublicaciones, obtenerReservasComedor, crearReserva, crearOObtenerChat, enviarMensaje, type Publicacion, type Notificacion, type Reserva } from '../services';

interface DashboardProps {
  comercioNombre: string;
  usuarioId: string;
  tipoUsuario: 'comercio' | 'comedor';
  setActiveSection: (section: string) => void;
}

export default function Dashboard({ comercioNombre, usuarioId, tipoUsuario, setActiveSection }: DashboardProps) {
  const [stats, setStats] = useState({
    publicacionesActivas: 0,
    kgDonados: 0,
    entregasCompletadas: 0
  });
  const [publicacionesRecientes, setPublicacionesRecientes] = useState<Publicacion[]>([]);
  const [notificacionesRecientes, setNotificacionesRecientes] = useState<Notificacion[]>([]);
  const [reservasRecientes, setReservasRecientes] = useState<Reserva[]>([]);
  const [reservasStats, setReservasStats] = useState({
    pendientes: 0,
    aceptadas: 0,
    completadas: 0
  });
  const [cargando, setCargando] = useState(true);
  
  // Estados para el modal de detalles
  const [publicacionSeleccionada, setPublicacionSeleccionada] = useState<Publicacion | null>(null);
  const [modoAccion, setModoAccion] = useState<'detalles' | 'reservar' | 'contactar'>('detalles');
  const [mensajeReserva, setMensajeReserva] = useState('');
  const [mensajeChat, setMensajeChat] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [usuarioId]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      if (tipoUsuario === 'comercio') {
        // Cargar estadísticas del comercio
        const estadisticas = await obtenerEstadisticasUsuario(usuarioId);
        setStats(estadisticas);
        
        // Cargar publicaciones recientes (últimas 3)
        const publicaciones = await obtenerPublicacionesUsuario(usuarioId);
        setPublicacionesRecientes(publicaciones.slice(0, 3));
      } else {
        // Cargar estadísticas del comedor (reservas)
        const reservas = await obtenerReservasComedor(usuarioId);
        setReservasRecientes(reservas.slice(0, 3));
        
        const pendientes = reservas.filter(r => r.estado === 'pendiente').length;
        const aceptadas = reservas.filter(r => r.estado === 'aceptada').length;
        const completadas = reservas.filter(r => r.estado === 'completada').length;
        setReservasStats({ pendientes, aceptadas, completadas });
        
        // Cargar publicaciones disponibles recientes (últimas 3)
        const todasPublicaciones = await obtenerTodasLasPublicaciones();
        const disponibles = todasPublicaciones.filter(p => p.estado === 'disponible');
        setPublicacionesRecientes(disponibles.slice(0, 3));
      }
      
      // Cargar notificaciones recientes (últimas 3) - para ambos
      const notificaciones = await obtenerNotificacionesUsuario(usuarioId);
      setNotificacionesRecientes(notificaciones.slice(0, 3));
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (timestamp: any) => {
    if (!timestamp) return 'Fecha desconocida';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    return 'Hoy';
  };

  const formatearFechaCompleta = (timestamp: any) => {
    if (!timestamp) return 'Fecha desconocida';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-AR');
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

  const handleReservar = async () => {
    if (!publicacionSeleccionada) return;
    
    try {
      setEnviando(true);
      await crearReserva(
        publicacionSeleccionada.id,
        usuarioId,
        comercioNombre,
        publicacionSeleccionada.usuarioId,
        publicacionSeleccionada.comercioNombre,
        mensajeReserva
      );
      
      alert('¡Reserva enviada! El comercio te notificará cuando la acepte.');
      cerrarModal();
      cargarDatos(); // Recargar para actualizar
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
      
      const chatId = await crearOObtenerChat(
        usuarioId,
        comercioNombre,
        publicacionSeleccionada.usuarioId,
        publicacionSeleccionada.comercioNombre,
        publicacionSeleccionada.id
      );
      
      console.log('✅ Chat creado/obtenido:', chatId);
      
      // Si hay mensaje inicial, enviarlo
      if (mensajeChat.trim()) {
        await enviarMensaje(
          chatId,
          usuarioId,
          comercioNombre,
          publicacionSeleccionada.usuarioId,
          mensajeChat
        );
        console.log('✅ Mensaje inicial enviado');
      }
      
      cerrarModal();
      
      // Navegar al módulo de chat
      setActiveSection('chat');
    } catch (error) {
      console.error('❌ Error iniciando chat:', error);
      alert('Error al iniciar el chat: ' + (error as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="text-center py-16">
          <div className="w-12 h-12 border-4 border-[#5a7a54] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500">Cargando tu panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-2">
          Hola, {comercioNombre} 👋
        </h1>
        <p className="text-stone-500 dark:text-stone-400">
          {tipoUsuario === 'comercio' 
            ? 'Este es tu panel de control. Desde acá podés gestionar tus donaciones y ver tu impacto.'
            : 'Este es tu panel de control. Desde acá podés ver excedentes disponibles y gestionar tus reservas.'}
        </p>
      </div>

      {/* Quick actions - Diferente según tipo de usuario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {tipoUsuario === 'comercio' ? (
          <>
            {/* Acciones para COMERCIOS */}
            <button
              onClick={() => setActiveSection('publicar')}
              className="bg-gradient-to-br from-[#5a7a54] to-[#6d8f66] dark:from-[#4a5d49] dark:to-[#5a6d59] text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all group text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-xl font-semibold mb-1">Publicar excedentes</h3>
              <p className="text-white/80 text-sm">
                Contanos qué alimentos te sobraron hoy
              </p>
            </button>

            <button
              onClick={() => setActiveSection('mis-reservas')}
              className="bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 p-6 rounded-2xl hover:border-[#5a7a54] dark:hover:border-[#8faa88] hover:shadow-lg transition-all group text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-[#5a7a54]/10 dark:bg-[#4a5d49]/20 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-[#5a7a54] dark:text-[#8faa88]" />
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-xl font-semibold text-stone-800 dark:text-stone-100 mb-1">Ver solicitudes</h3>
              <p className="text-stone-500 dark:text-stone-400 text-sm">
                Revisá las reservas de los comedores
              </p>
            </button>
          </>
        ) : (
          <>
            {/* Acciones para COMEDORES */}
            <button
              onClick={() => setActiveSection('publicaciones-disponibles')}
              className="bg-gradient-to-br from-[#5a7a54] to-[#6d8f66] dark:from-[#4a5d49] dark:to-[#5a6d59] text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all group text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-xl font-semibold mb-1">Ver excedentes disponibles</h3>
              <p className="text-white/80 text-sm">
                Explorá los alimentos disponibles de comercios locales
              </p>
            </button>

            <button
              onClick={() => setActiveSection('mis-reservas')}
              className="bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 p-6 rounded-2xl hover:border-[#5a7a54] dark:hover:border-[#8faa88] hover:shadow-lg transition-all group text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-[#5a7a54]/10 dark:bg-[#4a5d49]/20 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-[#5a7a54] dark:text-[#8faa88]" />
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-xl font-semibold text-stone-800 dark:text-stone-100 mb-1">Mis reservas</h3>
              <p className="text-stone-500 dark:text-stone-400 text-sm">
                Gestioná tus solicitudes de reserva
              </p>
            </button>
          </>
        )}
      </div>

      {/* Stats - Diferente según tipo de usuario */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {tipoUsuario === 'comercio' ? (
          <>
            {/* Stats para COMERCIOS */}
            <div className="bg-white dark:bg-stone-800 p-5 rounded-2xl border border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-stone-800 dark:text-stone-100">{stats.publicacionesActivas}</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">Publicaciones activas</div>
            </div>

            <div className="bg-white dark:bg-stone-800 p-5 rounded-2xl border border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-stone-800 dark:text-stone-100">{stats.kgDonados} kg</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">Alimentos donados</div>
            </div>

            <div className="bg-white dark:bg-stone-800 p-5 rounded-2xl border border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-stone-800 dark:text-stone-100">0</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">Comedores ayudados</div>
            </div>

            <div className="bg-white dark:bg-stone-800 p-5 rounded-2xl border border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-stone-800 dark:text-stone-100">{stats.entregasCompletadas}</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">Entregas completadas</div>
            </div>
          </>
        ) : (
          <>
            {/* Stats para COMEDORES */}
            <div className="bg-white dark:bg-stone-800 p-5 rounded-2xl border border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-stone-800 dark:text-stone-100">{reservasStats.pendientes}</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">Reservas pendientes</div>
            </div>

            <div className="bg-white dark:bg-stone-800 p-5 rounded-2xl border border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-stone-800 dark:text-stone-100">{reservasStats.aceptadas}</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">Reservas aceptadas</div>
            </div>

            <div className="bg-white dark:bg-stone-800 p-5 rounded-2xl border border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-stone-800 dark:text-stone-100">{reservasStats.completadas}</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">Entregas completadas</div>
            </div>

            <div className="bg-white dark:bg-stone-800 p-5 rounded-2xl border border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-stone-800 dark:text-stone-100">{publicacionesRecientes.length}</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">Excedentes disponibles</div>
            </div>
          </>
        )}
      </div>

      {/* Recent activity - Diferente según tipo de usuario */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent publications / Excedentes disponibles */}
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
              {tipoUsuario === 'comercio' ? 'Publicaciones recientes' : 'Excedentes disponibles'}
            </h3>
            {publicacionesRecientes.length > 0 && (
              <button
                onClick={() => setActiveSection(tipoUsuario === 'comercio' ? 'mis-publicaciones' : 'publicaciones-disponibles')}
                className="text-sm text-[#5a7a54] dark:text-[#8faa88] hover:underline flex items-center gap-1"
              >
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {publicacionesRecientes.length > 0 ? (
            <div className="space-y-3">
              {publicacionesRecientes.map((pub) => (
                <div 
                  key={pub.id} 
                  onClick={() => abrirModal(pub)}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 bg-[#5a7a54]/10 dark:bg-[#4a5d49]/20 rounded-xl flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-[#5a7a54] dark:text-[#8faa88]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-stone-800 dark:text-stone-100 text-sm">{pub.categoria}</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400 truncate">
                      {tipoUsuario === 'comercio' ? pub.cantidad : `${pub.comercioNombre} · ${pub.cantidad}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                      pub.estado === 'disponible' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      pub.estado === 'reservado' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400'
                    }`}>
                      {pub.estado === 'disponible' ? 'Disponible' :
                       pub.estado === 'reservado' ? 'Reservado' : 'Entregado'}
                    </div>
                    <div className="text-xs text-stone-400 dark:text-stone-500 mt-1 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {formatearFecha(pub.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
              <p className="text-stone-500 dark:text-stone-400 text-sm mb-3">
                {tipoUsuario === 'comercio' ? 'Todavía no tenés publicaciones' : 'No hay excedentes disponibles'}
              </p>
              {tipoUsuario === 'comercio' && (
                <button
                  onClick={() => setActiveSection('publicar')}
                  className="text-sm text-[#5a7a54] dark:text-[#8faa88] hover:underline font-medium"
                >
                  Publicar tu primer excedente →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Recent notifications */}
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">Notificaciones</h3>
            {notificacionesRecientes.length > 0 && (
              <button
                onClick={() => setActiveSection('notificaciones')}
                className="text-sm text-[#5a7a54] dark:text-[#8faa88] hover:underline flex items-center gap-1"
              >
                Ver todas
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {notificacionesRecientes.length > 0 ? (
            <div className="space-y-3">
              {notificacionesRecientes.map((notif) => (
                <div key={notif.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                    notif.tipo === 'reserva' ? 'bg-yellow-500' :
                    notif.tipo === 'entrega' ? 'bg-green-500' :
                    notif.tipo === 'publicacion' ? 'bg-purple-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-stone-800 dark:text-stone-100">{notif.mensaje}</div>
                    <div className="text-xs text-stone-400 dark:text-stone-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatearFecha(notif.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
              <p className="text-stone-500 dark:text-stone-400 text-sm">No tenés notificaciones aún</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles de publicación */}
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
                        {formatearFechaCompleta(publicacionSeleccionada.createdAt)}
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

                  {/* Botones de acción - solo para comedores */}
                  {tipoUsuario === 'comedor' && (
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
                  )}
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
