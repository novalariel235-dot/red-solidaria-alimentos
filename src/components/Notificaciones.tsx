import { Bell, Calendar, Check, MessageCircle, Package, Users } from 'lucide-react';

export default function Notificaciones() {
  // Datos simulados de notificaciones
  const notificaciones = [
    {
      id: '1',
      tipo: 'reserva',
      titulo: 'Nueva reserva',
      mensaje: 'Comedor Esperanza reservó tus facturas',
      tiempo: 'Hace 2 horas',
      leida: false
    },
    {
      id: '2',
      tipo: 'entrega',
      titulo: 'Entrega completada',
      mensaje: 'Entrega completada en Manos Solidarias',
      tiempo: 'Ayer',
      leida: false
    },
    {
      id: '3',
      tipo: 'mensaje',
      titulo: 'Nuevo mensaje',
      mensaje: 'Merendero Gotitas de Amor te envió un mensaje',
      tiempo: 'Hace 2 días',
      leida: false
    },
    {
      id: '4',
      tipo: 'publicacion',
      titulo: 'Publicación vista',
      mensaje: 'Tu publicación de verduras fue vista 15 veces',
      tiempo: 'Hace 3 días',
      leida: true
    },
    {
      id: '5',
      tipo: 'sistema',
      titulo: 'Bienvenido',
      mensaje: '¡Gracias por unirte a la Red Solidaria!',
      tiempo: 'Hace 1 semana',
      leida: true
    }
  ];

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

  const noLeidas = notificaciones.filter(n => !n.leida).length;

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
                    {notif.tiempo}
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
