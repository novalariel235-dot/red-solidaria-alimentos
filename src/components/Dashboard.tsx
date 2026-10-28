import { Package, TrendingUp, Users, Heart, ArrowRight, Calendar, Clock } from 'lucide-react';

interface DashboardProps {
  comercioNombre: string;
  setActiveSection: (section: string) => void;
}

export default function Dashboard({ comercioNombre, setActiveSection }: DashboardProps) {
  // Datos simulados (en producción vendrían de Firebase)
  const stats = {
    publicacionesActivas: 3,
    kgDonados: 156,
    comedoresAyudados: 4,
    entregasCompletadas: 28
  };

  const publicacionesRecientes = [
    { id: '1', categoria: 'Panadería', cantidad: '30 facturas + 2 kg pan', estado: 'disponible', fecha: 'Hoy' },
    { id: '2', categoria: 'Verduras', cantidad: '5 kg tomate + 3 kg zanahoria', estado: 'reservado', fecha: 'Ayer' },
    { id: '3', categoria: 'Lácteos', cantidad: '10 litros de leche', estado: 'entregado', fecha: 'Hace 2 días' },
  ];

  const notificacionesRecientes = [
    { id: '1', tipo: 'reserva', mensaje: 'Comedor Esperanza reservó tus facturas', tiempo: 'Hace 2 horas' },
    { id: '2', tipo: 'entrega', mensaje: 'Entrega completada en Manos Solidarias', tiempo: 'Ayer' },
    { id: '3', tipo: 'mensaje', mensaje: 'Nuevo mensaje de Merendero Gotitas', tiempo: 'Hace 2 días' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">
          Hola, {comercioNombre} 👋
        </h1>
        <p className="text-stone-500">
          Este es tu panel de control. Desde acá podés gestionar tus donaciones y ver tu impacto.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setActiveSection('publicar')}
          className="bg-gradient-to-br from-[#5a7a54] to-[#6d8f66] text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all group text-left"
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
          className="bg-white border-2 border-stone-200 p-6 rounded-2xl hover:border-[#5a7a54] hover:shadow-lg transition-all group text-left"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-[#5a7a54]/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-[#5a7a54]" />
            </div>
            <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-xl font-semibold text-stone-800 mb-1">Ver comedores</h3>
          <p className="text-stone-500 text-sm">
            Conocé los comedores cercanos y contactalos
          </p>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-stone-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-800">{stats.publicacionesActivas}</div>
          <div className="text-sm text-stone-500">Publicaciones activas</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-800">{stats.kgDonados} kg</div>
          <div className="text-sm text-stone-500">Alimentos donados</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-800">{stats.comedoresAyudados}</div>
          <div className="text-sm text-stone-500">Comedores ayudados</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-800">{stats.entregasCompletadas}</div>
          <div className="text-sm text-stone-500">Entregas completadas</div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent publications */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-stone-800">Publicaciones recientes</h3>
            <button
              onClick={() => setActiveSection('mis-publicaciones')}
              className="text-sm text-[#5a7a54] hover:underline flex items-center gap-1"
            >
              Ver todas
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {publicacionesRecientes.map((pub) => (
              <div key={pub.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-stone-50 transition-colors">
                <div className="w-10 h-10 bg-[#5a7a54]/10 rounded-xl flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-[#5a7a54]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-stone-800 text-sm">{pub.categoria}</div>
                  <div className="text-xs text-stone-500 truncate">{pub.cantidad}</div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                    pub.estado === 'disponible' ? 'bg-green-100 text-green-700' :
                    pub.estado === 'reservado' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-stone-100 text-stone-600'
                  }`}>
                    {pub.estado === 'disponible' ? 'Disponible' :
                     pub.estado === 'reservado' ? 'Reservado' : 'Entregado'}
                  </div>
                  <div className="text-xs text-stone-400 mt-1 flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" />
                    {pub.fecha}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent notifications */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-stone-800">Notificaciones</h3>
            <button
              onClick={() => setActiveSection('notificaciones')}
              className="text-sm text-[#5a7a54] hover:underline flex items-center gap-1"
            >
              Ver todas
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {notificacionesRecientes.map((notif) => (
              <div key={notif.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                  notif.tipo === 'reserva' ? 'bg-yellow-500' :
                  notif.tipo === 'entrega' ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-stone-800">{notif.mensaje}</div>
                  <div className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {notif.tiempo}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
