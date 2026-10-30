import { useState, useEffect } from 'react';
import { Package, Calendar, CheckCircle2, XCircle, Clock, MessageCircle } from 'lucide-react';
import { obtenerReservasComedor, obtenerReservasComercio, actualizarEstadoReserva, type Reserva } from '../services';

interface MisReservasProps {
  usuarioId: string;
  tipoUsuario: 'comercio' | 'comedor';
}

export default function MisReservas({ usuarioId, tipoUsuario }: MisReservasProps) {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState<string>('todas');
  const [procesando, setProcesando] = useState<string | null>(null);

  useEffect(() => {
    cargarReservas();
  }, [usuarioId]);

  const cargarReservas = async () => {
    try {
      setCargando(true);
      const data = tipoUsuario === 'comedor' 
        ? await obtenerReservasComedor(usuarioId)
        : await obtenerReservasComercio(usuarioId);
      setReservas(data);
    } catch (error) {
      console.error('Error cargando reservas:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleActualizarEstado = async (reservaId: string, estado: 'aceptada' | 'rechazada' | 'completada') => {
    try {
      setProcesando(reservaId);
      await actualizarEstadoReserva(reservaId, estado);
      await cargarReservas(); // Recargar para ver los cambios
    } catch (error) {
      console.error('Error actualizando reserva:', error);
      alert('Error al actualizar la reserva');
    } finally {
      setProcesando(null);
    }
  };

  const reservasFiltradas = filtro === 'todas' 
    ? reservas 
    : reservas.filter(r => r.estado === filtro);

  const formatearFecha = (timestamp: any) => {
    if (!timestamp) return 'Fecha desconocida';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-AR');
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900';
      case 'aceptada': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900';
      case 'rechazada': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900';
      case 'completada': return 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-600';
      default: return 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-600';
    }
  };

  const obtenerTextoEstado = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'aceptada': return 'Aceptada';
      case 'rechazada': return 'Rechazada';
      case 'completada': return 'Completada';
      default: return estado;
    }
  };

  if (cargando) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="text-center py-16">
          <div className="w-12 h-12 border-4 border-[#5a7a54] dark:border-[#8faa88] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500 dark:text-stone-400">Cargando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-2">
          {tipoUsuario === 'comedor' ? 'Mis Reservas' : 'Solicitudes Recibidas'}
        </h1>
        <p className="text-stone-500 dark:text-stone-400">
          {tipoUsuario === 'comedor' 
            ? 'Gestioná tus solicitudes de reserva'
            : 'Revisá y gestioná las solicitudes de los comedores'}
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['todas', 'pendiente', 'aceptada', 'rechazada', 'completada'].map((estado) => (
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

      {reservasFiltradas.length === 0 ? (
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-12 text-center">
          <Package className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2">
            {filtro === 'todas' 
              ? tipoUsuario === 'comedor' ? 'No tenés reservas' : 'No tenés solicitudes'
              : `No hay reservas ${filtro === 'pendiente' ? 'pendientes' : obtenerTextoEstado(filtro).toLowerCase()}`}
          </h3>
          <p className="text-stone-500 dark:text-stone-400">
            {tipoUsuario === 'comedor'
              ? 'Explorá las publicaciones disponibles y hacé tu primera reserva'
              : 'Cuando un comedor reserve tus publicaciones, aparecerán aquí'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reservasFiltradas.map((reserva) => (
            <div key={reserva.id} className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#5a7a54]/10 dark:bg-[#4a5d49]/20 rounded-xl flex items-center justify-center shrink-0">
                    {tipoUsuario === 'comedor' ? (
                      <Package className="w-6 h-6 text-[#5a7a54] dark:text-[#8faa88]" />
                    ) : (
                      <MessageCircle className="w-6 h-6 text-[#5a7a54] dark:text-[#8faa88]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-800 dark:text-stone-100 text-lg mb-1">
                      {tipoUsuario === 'comedor' ? reserva.comercioNombre : reserva.comedorNombre}
                    </h3>
                    <p className="text-stone-600 dark:text-stone-300 text-sm mb-2">
                      {reserva.mensaje || 'Sin mensaje'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-stone-500 dark:text-stone-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatearFecha(reserva.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${obtenerColorEstado(reserva.estado)}`}>
                  {obtenerTextoEstado(reserva.estado)}
                </span>
              </div>

              {/* Acciones para comercios */}
              {tipoUsuario === 'comercio' && reserva.estado === 'pendiente' && (
                <div className="flex items-center gap-2 pt-4 border-t border-stone-100 dark:border-stone-700">
                  <button
                    onClick={() => handleActualizarEstado(reserva.id, 'aceptada')}
                    disabled={procesando === reserva.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Aceptar
                  </button>
                  <button
                    onClick={() => handleActualizarEstado(reserva.id, 'rechazada')}
                    disabled={procesando === reserva.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar
                  </button>
                </div>
              )}

              {/* Acciones para comedores */}
              {tipoUsuario === 'comedor' && reserva.estado === 'aceptada' && (
                <div className="flex items-center gap-2 pt-4 border-t border-stone-100 dark:border-stone-700">
                  <button
                    onClick={() => handleActualizarEstado(reserva.id, 'completada')}
                    disabled={procesando === reserva.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#5a7a54] dark:bg-[#4a5d49] hover:bg-[#4d6a48] dark:hover:bg-[#3d4d3c] disabled:opacity-50 text-white transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Marcar como completada
                  </button>
                </div>
              )}

              {/* Estado de espera */}
              {reserva.estado === 'pendiente' && tipoUsuario === 'comedor' && (
                <div className="flex items-center gap-2 pt-4 border-t border-stone-100 dark:border-stone-700 text-sm text-stone-500 dark:text-stone-400">
                  <Clock className="w-4 h-4" />
                  Esperando respuesta del comercio
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
