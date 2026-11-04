import { useState, useEffect } from 'react';
import { Bell, Calendar, Check, MessageCircle, Package, Users } from 'lucide-react';
import { obtenerNotificacionesUsuario, type Notificacion } from '../services';

interface NotificacionesProps {
  usuarioId: string;
}

export default function Notificaciones({ usuarioId }: NotificacionesProps) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarNotificaciones();
  }, [usuarioId]);

  const cargarNotificaciones = async () => {
    try {
      setCargando(true);
      const data = await obtenerNotificacionesUsuario(usuarioId);
      setNotificaciones(data);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    } finally {
      setCargando(false);
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'reserva': return Package;
      case 'entrega': return Check;
      case 'mensaje': return MessageCircle;
      case 'publicacion': return Users;
      case 'sistema': return Bell;
      default: return Bell;
    }
  };

  const getColor = (tipo: string) => {
    switch (tipo) {
      case 'reserva': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'entrega': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'mensaje': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'publicacion': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      case 'sistema': return 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300';
      default: return 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300';
    }
  };

  const formatearTiempo = (timestamp: any) => {
    if (!timestamp) return 'Fecha desconocida';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    return 'Hace menos de una hora';
  };

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  if (cargando) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div className="w-12 h-12 border-4 border-[#5a7a54] dark:border-[#8faa88] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500 dark:text-stone-400">Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">Notificaciones</h1>
          {noLeidas > 0 && (
            <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-medium">
              {noLeidas} nuevas
            </span>
          )}
        </div>
        <p className="text-stone-500 dark:text-stone-400">
          Mantenete al día con las actividades de tu comercio
        </p>
      </div>

      <div className="space-y-3">
        {notificaciones.map((notif) => {
          const Icon = getIcon(notif.tipo);
          const color = getColor(notif.tipo);
          
          return (
            <div
              key={notif.id}
              className={`bg-white dark:bg-stone-800 rounded-2xl border p-5 hover:shadow-lg transition-all cursor-pointer ${
                notif.leida ? 'border-stone-200 dark:border-stone-700' : 'border-[#5a7a54] dark:border-[#8faa88] bg-[#f5f8f4] dark:bg-[#4a5d49]/10'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-stone-800 dark:text-stone-100">{notif.titulo}</h3>
                    {!notif.leida && (
                      <div className="w-2 h-2 bg-[#5a7a54] dark:bg-[#8faa88] rounded-full shrink-0 mt-2" />
                    )}
                  </div>
                  <p className="text-stone-600 dark:text-stone-300 text-sm mb-2">{notif.mensaje}</p>
                  <div className="flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500">
                    <Calendar className="w-3 h-3" />
                    {formatearTiempo(notif.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {notificaciones.length === 0 && (
        <div className="text-center py-16">
          <Bell className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-stone-600 dark:text-stone-300 mb-2">No hay notificaciones</h3>
          <p className="text-stone-400 dark:text-stone-500">
            Cuando tengas actividad, las notificaciones aparecerán aquí
          </p>
        </div>
      )}
    </div>
  );
}
