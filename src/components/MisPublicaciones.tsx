import { useState, useEffect } from 'react';
import { Package, Calendar, Clock, Edit2, Trash2, Eye } from 'lucide-react';
import { obtenerPublicacionesUsuario, type Publicacion } from '../services';

interface MisPublicacionesProps {
  usuarioId: string;
}

export default function MisPublicaciones({ usuarioId }: MisPublicacionesProps) {
  const [filtro, setFiltro] = useState<'todas' | 'disponible' | 'reservado' | 'entregado'>('todas');
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
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

  const estadoColors = {
    disponible: 'bg-green-100 text-green-700 border-green-200',
    reservado: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    entregado: 'bg-stone-100 text-stone-600 border-stone-200'
  };

  if (cargando) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="text-center py-16">
          <div className="w-12 h-12 border-4 border-[#5a7a54] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500">Cargando publicaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">Mis Publicaciones</h1>
        <p className="text-stone-500">
          Gestioná tus publicaciones de excedentes
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'todas', label: 'Todas', count: publicaciones.length },
          { id: 'disponible', label: 'Disponibles', count: publicaciones.filter(p => p.estado === 'disponible').length },
          { id: 'reservado', label: 'Reservadas', count: publicaciones.filter(p => p.estado === 'reservado').length },
          { id: 'entregado', label: 'Entregadas', count: publicaciones.filter(p => p.estado === 'entregado').length },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filtro === f.id
                ? 'bg-[#5a7a54] text-white shadow-sm'
                : 'bg-white text-stone-600 border border-stone-200 hover:border-[#5a7a54]'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Publications list */}
      <div className="space-y-4">
        {publicacionesFiltradas.map((pub) => (
          <div key={pub.id} className="bg-white rounded-2xl border border-stone-200 p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#5a7a54]/10 rounded-xl flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6 text-[#5a7a54]" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 text-lg mb-1">{pub.categoria}</h3>
                  <p className="text-stone-600 text-sm mb-2">{pub.descripcion}</p>
                  <div className="flex items-center gap-4 text-sm text-stone-500">
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
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${estadoColors[pub.estado]}`}>
                {pub.estado === 'disponible' ? 'Disponible' :
                 pub.estado === 'reservado' ? 'Reservado' : 'Entregado'}
              </span>
            </div>

            {/* Actions */}
            {pub.estado !== 'entregado' && (
              <div className="flex items-center gap-2 pt-4 border-t border-stone-100">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-all">
                  <Eye className="w-4 h-4" />
                  Ver detalles
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-[#5a7a54] hover:bg-[#5a7a54]/5 transition-all">
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all">
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {publicacionesFiltradas.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-stone-600 mb-2">No hay publicaciones</h3>
          <p className="text-stone-400">
            {filtro === 'todas' 
              ? 'Todavía no publicaste ningún excedente'
              : `No tenés publicaciones ${filtro === 'disponible' ? 'disponibles' : filtro === 'reservado' ? 'reservadas' : 'entregadas'}`
            }
          </p>
        </div>
      )}
    </div>
  );
}
