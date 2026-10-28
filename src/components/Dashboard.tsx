import { useState, useEffect } from 'react';
import { Package, TrendingUp, Users, Heart, ArrowRight, Calendar, Clock } from 'lucide-react';
import { obtenerPublicacionesUsuario, obtenerNotificacionesUsuario, obtenerEstadisticasUsuario, type Publicacion, type Notificacion } from '../services';

interface DashboardProps {
  comercioNombre: string;
  usuarioId: string;
  setActiveSection: (section: string) => void;
}

export default function Dashboard({ comercioNombre, usuarioId, setActiveSection }: DashboardProps) {
  const [stats, setStats] = useState({
    publicacionesActivas: 0,
    kgDonados: 0,
    entregasCompletadas: 0
  });
  const [publicacionesRecientes, setPublicacionesRecientes] = useState<Publicacion[]>([]);
  const [notificacionesRecientes, setNotificacionesRecientes] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, [usuarioId]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      // Cargar estadísticas
      const estadisticas = await obtenerEstadisticasUsuario(usuarioId);
      setStats(estadisticas);
      
      // Cargar publicaciones recientes (últimas 3)
      const publicaciones = await obtenerPublicacionesUsuario(usuarioId);
      setPublicacionesRecientes(publicaciones.slice(0, 3));
      
      // Cargar notificaciones recientes (últimas 3)
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
          Este es tu panel de control. Desde acá podés gestionar tus donaciones y ver tu impacto.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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
          onClick={() => setActiveSection('comedores')}
          className="bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 p-6 rounded-2xl hover:border-[#5a7a54] dark:hover:border-[#8faa88] hover:shadow-lg transition-all group text-left"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-[#5a7a54]/10 dark:bg-[#4a5d49]/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-[#5a7a54] dark:text-[#8faa88]" />
            </div>
            <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-xl font-semibold text-stone-800 dark:text-stone-100 mb-1">Ver comedores</h3>
          <p className="text-stone-500 dark:text-stone-400 text-sm">
            Conocé los comedores cercanos y contactalos
          </p>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
      </div>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent publications */}
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">Publicaciones recientes</h3>
            {publicacionesRecientes.length > 0 && (
              <button
                onClick={() => setActiveSection('mis-publicaciones')}
                className="text-sm text-[#5a7a54] dark:text-[#8faa88] hover:underline flex items-center gap-1"
              >
                Ver todas
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {publicacionesRecientes.length > 0 ? (
            <div className="space-y-3">
              {publicacionesRecientes.map((pub) => (
                <div key={pub.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">
                  <div className="w-10 h-10 bg-[#5a7a54]/10 dark:bg-[#4a5d49]/20 rounded-xl flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-[#5a7a54] dark:text-[#8faa88]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-stone-800 dark:text-stone-100 text-sm">{pub.categoria}</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400 truncate">{pub.cantidad}</div>
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
              <p className="text-stone-500 dark:text-stone-400 text-sm mb-3">Todavía no tenés publicaciones</p>
              <button
                onClick={() => setActiveSection('publicar')}
                className="text-sm text-[#5a7a54] dark:text-[#8faa88] hover:underline font-medium"
              >
                Publicar tu primer excedente →
              </button>
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
    </div>
  );
}
