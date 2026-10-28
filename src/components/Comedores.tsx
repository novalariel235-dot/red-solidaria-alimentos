import { MapPin, Phone, Users, Navigation } from 'lucide-react';

export default function Comedores() {
  // Datos simulados de comedores
  const comedores = [
    {
      id: '1',
      nombre: 'Comedor Manos Solidarias',
      direccion: 'Av. San Martín 450',
      telefono: '+54 294 455-1234',
      lat: -39.0035,
      lng: -67.0549,
      capacidad: 80,
      personasAtendidas: 65,
      distancia: '1.2 km'
    },
    {
      id: '2',
      nombre: 'Comedor Esperanza',
      direccion: 'Calle Mitre 1200',
      telefono: '+54 294 455-5678',
      lat: -39.0100,
      lng: -67.0600,
      capacidad: 50,
      personasAtendidas: 42,
      distancia: '2.5 km'
    },
    {
      id: '3',
      nombre: 'Merendero Gotitas de Amor',
      direccion: 'Barrio Centro 320',
      telefono: '+54 294 455-9012',
      lat: -38.9950,
      lng: -67.0500,
      capacidad: 30,
      personasAtendidas: 28,
      distancia: '0.8 km'
    },
    {
      id: '4',
      nombre: 'Comedor Nuevo Amanecer',
      direccion: 'Calle Belgrano 890',
      telefono: '+54 294 455-3456',
      lat: -39.0150,
      lng: -67.0700,
      capacidad: 100,
      personasAtendidas: 78,
      distancia: '3.1 km'
    }
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">Comedores Cercanos</h1>
        <p className="text-stone-500">
          Conocé los comedores comunitarios de Villa Regina y contactalos directamente
        </p>
      </div>

      {/* Mapa */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#5a7a54]" />
          Mapa de comedores
        </h3>
        <div className="bg-gradient-to-br from-[#f5f8f4] to-[#eef2ec] rounded-xl h-64 flex items-center justify-center border border-stone-200">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-[#5a7a54] mx-auto mb-2" />
            <p className="text-stone-600 font-medium">Mapa interactivo</p>
            <p className="text-sm text-stone-400">Los comedores aparecen marcados en el mapa</p>
          </div>
        </div>
      </div>

      {/* Lista de comedores */}
      <div className="grid md:grid-cols-2 gap-4">
        {comedores.map((comedor) => {
          const ocupacion = Math.round((comedor.personasAtendidas / comedor.capacidad) * 100);
          
          return (
            <div key={comedor.id} className="bg-white rounded-2xl border border-stone-200 p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-stone-800 text-lg mb-1">{comedor.nombre}</h3>
                  <div className="flex items-center gap-1 text-sm text-stone-500 mb-1">
                    <Navigation className="w-3.5 h-3.5" />
                    {comedor.distancia} de distancia
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#5a7a54]">{ocupacion}%</div>
                  <div className="text-xs text-stone-400">ocupación</div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>{comedor.direccion}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                  <a href={`tel:${comedor.telefono}`} className="hover:text-[#5a7a54] transition-colors">
                    {comedor.telefono}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <Users className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>{comedor.personasAtendidas} / {comedor.capacidad} personas</span>
                </div>
              </div>

              {/* Barra de ocupación */}
              <div className="mb-4">
                <div className="w-full bg-stone-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#5a7a54] to-[#8faa88] h-2 rounded-full transition-all"
                    style={{ width: `${ocupacion}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps?q=${comedor.lat},${comedor.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#5a7a54]/10 text-[#5a7a54] hover:bg-[#5a7a54]/20 transition-all"
                >
                  <MapPin className="w-4 h-4" />
                  Ver en mapa
                </a>
                <a
                  href={`tel:${comedor.telefono}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-stone-200 text-stone-700 hover:border-[#5a7a54] transition-all"
                >
                  <Phone className="w-4 h-4" />
                  Llamar
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
