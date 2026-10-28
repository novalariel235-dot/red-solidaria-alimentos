import { TrendingUp, Package, Users, Heart, Calendar, Award } from 'lucide-react';

export default function MiImpacto() {
  // Datos simulados de impacto
  const stats = {
    totalKgDonados: 156,
    totalEntregas: 28,
    comedoresAyudados: 4,
    diasActivo: 45
  };

  const historialEntregas = [
    { id: '1', fecha: '2026-01-15', comedor: 'Comedor Manos Solidarias', categoria: 'Panadería', kg: 5 },
    { id: '2', fecha: '2026-01-14', comedor: 'Merendero Gotitas de Amor', categoria: 'Verduras', kg: 8 },
    { id: '3', fecha: '2026-01-13', comedor: 'Comedor Esperanza', categoria: 'Lácteos', kg: 10 },
    { id: '4', fecha: '2026-01-12', comedor: 'Comedor Nuevo Amanecer', categoria: 'Frutas', kg: 3 },
    { id: '5', fecha: '2026-01-11', comedor: 'Comedor Manos Solidarias', categoria: 'Panadería', kg: 4 },
  ];

  const logros = [
    { id: '1', titulo: 'Primera donación', descripcion: 'Realizaste tu primera donación', desbloqueado: true },
    { id: '2', titulo: '10 kg donados', descripcion: 'Alcanzaste los 10 kg donados', desbloqueado: true },
    { id: '3', titulo: '100 kg donados', descripcion: 'Alcanzaste los 100 kg donados', desbloqueado: true },
    { id: '4', titulo: '500 kg donados', descripcion: 'Alcanzaste los 500 kg donados', desbloqueado: false },
    { id: '5', titulo: 'Comercio destacado', descripcion: 'Fuiste reconocido por la comunidad', desbloqueado: false },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">Mi Impacto</h1>
        <p className="text-stone-500">
          Mirá el impacto positivo que estás generando en tu comunidad
        </p>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-800 mb-1">{stats.totalKgDonados} kg</div>
          <div className="text-sm text-stone-600">Alimentos donados</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-2xl border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-800 mb-1">{stats.totalEntregas}</div>
          <div className="text-sm text-stone-600">Entregas completadas</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-800 mb-1">{stats.comedoresAyudados}</div>
          <div className="text-sm text-stone-600">Comedores ayudados</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-800 mb-1">{stats.diasActivo}</div>
          <div className="text-sm text-stone-600">Días activo</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Historial de entregas */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h3 className="text-lg font-semibold text-stone-800 mb-5 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#5a7a54]" />
            Historial de entregas
          </h3>
          <div className="space-y-3">
            {historialEntregas.map((entrega) => (
              <div key={entrega.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-stone-50 transition-colors">
                <div className="w-10 h-10 bg-[#5a7a54]/10 rounded-xl flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-[#5a7a54]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-stone-800 text-sm">{entrega.comedor}</div>
                  <div className="text-xs text-stone-500">{entrega.categoria} · {entrega.kg} kg</div>
                </div>
                <div className="text-xs text-stone-400">{entrega.fecha}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Logros */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h3 className="text-lg font-semibold text-stone-800 mb-5 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#5a7a54]" />
            Logros desbloqueados
          </h3>
          <div className="space-y-3">
            {logros.map((logro) => (
              <div
                key={logro.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  logro.desbloqueado
                    ? 'bg-gradient-to-r from-[#f5f8f4] to-white border-[#c8d5c3]'
                    : 'bg-stone-50 border-stone-200 opacity-60'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  logro.desbloqueado
                    ? 'bg-gradient-to-br from-[#5a7a54] to-[#8faa88] text-white'
                    : 'bg-stone-200 text-stone-400'
                }`}>
                  <Award className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-stone-800 text-sm">{logro.titulo}</div>
                  <div className="text-xs text-stone-500">{logro.descripcion}</div>
                </div>
                {logro.desbloqueado && (
                  <div className="text-xs font-medium text-[#5a7a54] bg-[#5a7a54]/10 px-2 py-1 rounded-full">
                    ✓ Desbloqueado
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
