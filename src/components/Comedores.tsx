import { useState, useEffect } from 'react';
import { MapPin, Phone, Users, Navigation } from 'lucide-react';
import { obtenerComedores, type Comedor } from '../services';

export default function Comedores() {
  const [comedores, setComedores] = useState<Comedor[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarComedores();
  }, []);

  const cargarComedores = async () => {
    try {
      setCargando(true);
      const data = await obtenerComedores();
      setComedores(data);
    } catch (error) {
      console.error('Error cargando comedores:', error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="text-center py-16">
          <div className="w-12 h-12 border-4 border-[#5a7a54] dark:border-[#8faa88] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500 dark:text-stone-400">Cargando comedores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-2">Comedores Cercanos</h1>
        <p className="text-stone-500 dark:text-stone-400">Conocé los comedores comunitarios de Villa Regina y contactalos directamente</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {comedores.map((comedor) => {
          const capacidad = Number(comedor.capacidad) || 0;
          const personasAtendidas = Number(comedor.personasAtendidas) || 0;
          const ocupacion = capacidad > 0 ? Math.round((personasAtendidas / capacidad) * 100) : 0;
          
          return (
            <div key={comedor.id} className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-stone-800 dark:text-stone-100 text-lg mb-1">{comedor.nombre}</h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#5a7a54] dark:text-[#8faa88]">{ocupacion}%</div>
                  <div className="text-xs text-stone-400 dark:text-stone-500">ocupación</div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
                  <MapPin className="w-4 h-4 text-stone-400 dark:text-stone-500 shrink-0" />
                  <span>{comedor.direccion}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
                  <Phone className="w-4 h-4 text-stone-400 dark:text-stone-500 shrink-0" />
                  <a href={`tel:${comedor.telefono}`} className="hover:text-[#5a7a54] dark:hover:text-[#8faa88] transition-colors">
                    {comedor.telefono}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
                  <Users className="w-4 h-4 text-stone-400 dark:text-stone-500 shrink-0" />
                  <span>{personasAtendidas} / {capacidad} personas</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="w-full bg-stone-100 dark:bg-stone-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#5a7a54] to-[#8faa88] dark:from-[#4a5d49] dark:to-[#6b7d6a] h-2 rounded-full transition-all"
                    style={{ width: `${ocupacion}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps?q=${comedor.lat},${comedor.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#5a7a54]/10 dark:bg-[#4a5d49]/20 text-[#5a7a54] dark:text-[#8faa88] hover:bg-[#5a7a54]/20 dark:hover:bg-[#4a5d49]/30 transition-all"
                >
                  <Navigation className="w-4 h-4" />
                  Ver en mapa
                </a>
                <a
                  href={`tel:${comedor.telefono}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-200 hover:border-[#5a7a54] dark:hover:border-[#8faa88] transition-all"
                >
                  <Phone className="w-4 h-4" />
                  Llamar
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {comedores.length === 0 && (
        <div className="text-center py-16">
          <MapPin className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-stone-600 dark:text-stone-300 mb-2">No hay comedores registrados</h3>
          <p className="text-stone-400 dark:text-stone-500">Pronto se agregarán comedores comunitarios de Villa Regina</p>
        </div>
      )}
    </div>
  );
}
