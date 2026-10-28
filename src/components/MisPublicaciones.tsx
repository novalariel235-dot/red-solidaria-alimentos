import { Package, Calendar, Clock, Edit2, Trash2, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { obtenerPublicacionesUsuario, type Publicacion } from '../services';

interface MisPublicacionesProps {
  usuarioId: string;
}

export default function MisPublicaciones({ usuarioId }: MisPublicacionesProps) {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [filtro, setFiltro] = useState<string>('todas');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPublicaciones();
  }, [usuarioId]);

  const cargarPublicaciones = async () => {
    try {
      setCargando(true);
      const data = await obtenerPublicacionesUsuario(usuarioId);
      setPublicaciones(data);
    } catch (error) {
      console.error('Error cargando publicaciones:', error);
    } finally {
      setCargando(false);
    }
  };

  const publicacionesFiltradas = filtro === 'todas' 
    ? publicaciones 
    : publicaciones.filter(p => p.estado === filtro);

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
          <p className="text-stone-500 dark:text-stone-400">Cargando publicaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-2">Mis Publicaciones</h1>
        <p className="text-stone-500 dark:text-stone-400">Gestioná tus publicaciones de excedentes</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['todas', 'disponible', 'reservado', 'entregado'].map((estado) => (
          <button
            key={estado}
            onClick={() => setFiltro(estado)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filtro === estado
                ? 'bg-[#5a7a54] dark:bg-[#4a5d49] text-white'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-[#5a7a54] dark:hover:border-[#8faa88]'
            }`}
          >
            {estado === 'todas' ? 'Todas' : estado.charAt(0).toUpperCase() + estado.slice(1)}
          </button>
        ))}
      </div>

      {publicacionesFiltradas.length === 0 ? (
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-12 text-center">
          <Package className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2">No hay publicaciones</h3>
          <p className="text-stone-500 dark:text-stone-400">Todavía no tenés publicaciones en esta categoría</p>
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
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  pub.estado === 'disponible' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900' :
                  pub.estado === 'reservado' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900' :
                  'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-600'
                }`}>
                  {pub.estado === 'disponible' ? 'Disponible' :
                   pub.estado === 'reservado' ? 'Reservado' : 'Entregado'}
                </span>
              </div>

              {pub.estado !== 'entregado' && (
                <div className="flex items-center gap-2 pt-4 border-t border-stone-100 dark:border-stone-700">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-all">
                    <Eye className="w-4 h-4" />
                    Ver detalles
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-[#5a7a54] dark:text-[#8faa88] hover:bg-[#5a7a54]/5 dark:hover:bg-[#4a5d49]/20 transition-all">
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
