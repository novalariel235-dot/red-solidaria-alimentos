import { useState, useEffect } from 'react';
import { TrendingUp, Package, Users, Heart, Calendar, Award } from 'lucide-react';
import { obtenerPublicacionesUsuario, obtenerEstadisticasUsuario, type Publicacion } from '../services';

interface MiImpactoProps {
  usuarioId: string;
}

export default function MiImpacto({ usuarioId }: MiImpactoProps) {
  const [stats, setStats] = useState({
    totalKgDonados: 0,
    totalEntregas: 0,
    publicacionesActivas: 0
  });
  const [historialEntregas, setHistorialEntregas] = useState<Publicacion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, [usuarioId]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      const estadisticas = await obtenerEstadisticasUsuario(usuarioId);
      setStats({
        totalKgDonados: estadisticas.kgDonados,
        totalEntregas: estadisticas.entregasCompletadas,
        publicacionesActivas: estadisticas.publicacionesActivas
      });
      
      const publicaciones = await obtenerPublicacionesUsuario(usuarioId);
      const entregas = publicaciones.filter(p => p.estado === 'entregado');
      setHistorialEntregas(entregas);
    } catch (error) {
      console.error('Error cargando datos de impacto:', error);
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (timestamp: any) => {
    if (!timestamp) return 'Fecha desconocida';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-AR');
  };

  const diasActivo = 1;

  const logros = [
    { id: '1', titulo: 'Primera donación', descripcion: 'Realizaste tu primera donación', desbloqueado: stats.totalEntregas >= 1 },
    { id: '2', titulo: '10 kg donados', descripcion: 'Alcanzaste los 10 kg donados', desbloqueado: stats.totalKgDonados >= 10 },
    { id: '3', titulo: '100 kg donados', descripcion: 'Alcanzaste los 100 kg donados', desbloqueado: stats.totalKgDonados >= 100 },
    { id: '4', titulo: '500 kg donados', descripcion: 'Alcanzaste los 500 kg donados', desbloqueado: stats.totalKgDonados >= 500 },
    { id: '5', titulo: 'Comercio destacado', descripcion: 'Fuiste reconocido por la comunidad', desbloqueado: false },
  ];

  if (cargando) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="text-center py-16">
          <div className="w-12 h-12 border-4 border-[#5a7a54] dark:border-[#8faa88] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500 dark:text-stone-400">Cargando tu impacto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-2">Mi Impacto</h1>
        <p className="text-stone-500 dark:text-stone-400">Mirá el impacto positivo que estás generando en tu comunidad</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-900">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white dark:bg-stone-800 rounded-xl flex items-center justify-center shadow-sm">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-1">{stats.totalKgDonados} kg</div>
          <div className="text-sm text-stone-600 dark:text-stone-400">Alimentos donados</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-900">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white dark:bg-stone-800 rounded-xl flex items-center justify-center shadow-sm">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-1">{stats.totalEntregas}</div>
          <div className="text-sm text-stone-600 dark:text-stone-400">Entregas completadas</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-900">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white dark:bg-stone-800 rounded-xl flex items-center justify-center shadow-sm">
              <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-1">{stats.publicacionesActivas}</div>
          <div className="text-sm text-stone-600 dark:text-stone-400">Publicaciones activas</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-6 rounded-2xl border border-orange-200 dark:border-orange-900">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white dark:bg-stone-800 rounded-xl flex items-center justify-center shadow-sm">
              <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-1">{diasActivo}</div>
          <div className="text-sm text-stone-600 dark:text-stone-400">Días activo</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6">
          <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-5 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#5a7a54] dark:text-[#8faa88]" />
            Historial de entregas
          </h3>
          
          {historialEntregas.length > 0 ? (
            <div className="space-y-3">
              {historialEntregas.map((entrega) => (
                <div key={entrega.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">
                  <div className="w-10 h-10 bg-[#5a7a54]/10 dark:bg-[#4a5d49]/20 rounded-xl flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5 text-[#5a7a54] dark:text-[#8faa88]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-stone-800 dark:text-stone-100 text-sm">{entrega.comedorNombre || 'Comedor'}</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">{entrega.categoria} · {entrega.cantidad}</div>
                  </div>
                  <div className="text-xs text-stone-400 dark:text-stone-500">{formatearFecha(entrega.createdAt)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
              <p className="text-stone-500 dark:text-stone-400 text-sm">Todavía no completaste entregas</p>
              <p className="text-stone-400 dark:text-stone-500 text-xs mt-1">Cuando un comedor retire tus alimentos, aparecerá aquí</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6">
          <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-5 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#5a7a54] dark:text-[#8faa88]" />
            Logros desbloqueados
          </h3>
          <div className="space-y-3">
            {logros.map((logro) => (
              <div
                key={logro.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  logro.desbloqueado
                    ? 'bg-gradient-to-r from-[#f5f8f4] to-white dark:from-[#4a5d49]/20 dark:to-stone-800 border-[#c8d5c3] dark:border-[#4a5d49]'
                    : 'bg-stone-50 dark:bg-stone-700 border-stone-200 dark:border-stone-600 opacity-60'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  logro.desbloqueado
                    ? 'bg-gradient-to-br from-[#5a7a54] to-[#8faa88] dark:from-[#4a5d49] dark:to-[#6b7d6a] text-white'
                    : 'bg-stone-200 dark:bg-stone-600 text-stone-400 dark:text-stone-500'
                }`}>
                  <Award className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-stone-800 dark:text-stone-100 text-sm">{logro.titulo}</div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">{logro.descripcion}</div>
                </div>
                {logro.desbloqueado && (
                  <div className="text-xs font-medium text-[#5a7a54] dark:text-[#8faa88] bg-[#5a7a54]/10 dark:bg-[#4a5d49]/20 px-2 py-1 rounded-full">
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
