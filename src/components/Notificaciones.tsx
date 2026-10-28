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
      case 'reserva': return 'bg-yellow-100 text-yellow-700';
      case 'entrega': return 'bg-green-100 text-green-700';
      case 'mensaje': return 'bg-blue-100 text-blue-700';
      case 'publicacion': return 'bg-purple-100 text-purple-700';
      case 'sistema': return 'bg-stone-100 text-stone-700';
      default: return 'bg-stone-100 text-stone-700';
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
          <div className="w-12 h-12 border-4 border-[#5a7a54] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500">Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-stone-800">Notificaciones</h1>
          {noLeidas > 0 && (
            <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-medium">
              {noLeidas} nuevas
            </span>
          )}
        </div>
        <p className="text-stone-500">
          Mantenete al día con las actividades de tu comercio
        </p>
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {notificaciones.map((notif) => {
          const Icon = getIcon(notif.tipo);
          const color = getColor(notif.tipo);
          
          return (
            <div
              key={notif.id}
              className={`bg-white rounded-2xl border p-5 hover:shadow-lg transition-all cursor-pointer ${
                notif.leida ? 'border-stone-200' : 'border-[#5a7a54] bg-[#f5f8f4]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-stone-800">{notif.titulo}</h3>
                    {!notif.leida && (
                      <div className="w-2 h-2 bg-[#5a7a54] rounded-full shrink-0 mt-2" />
                    )}
                  </div>
                  <p className="text-stone-600 text-sm mb-2">{notif.mensaje}</p>
                  <div className="flex items-center gap-1 text-xs text-stone-400">
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
          <Bell className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-stone-600 mb-2">No hay notificaciones</h3>
          <p className="text-stone-400">
            Cuando tengas actividad, las notificaciones aparecerán aquí
          </p>
        </div>
      )}
    </div>
  );
}
