import { Building2, MapPin, Phone, Clock, Save, Edit2 } from 'lucide-react';
import { useState } from 'react';

interface PerfilProps {
  comercio: {
    nombre: string;
    tipo: string;
    direccion: string;
    telefono: string;
    diasRetiro: string[];
    horarioDesde: string;
    horarioHasta: string;
  };
}

export default function Perfil({ comercio }: PerfilProps) {
  const [editando, setEditando] = useState(false);

  const diasSemana: Record<string, string> = {
    'lun': 'Lunes',
    'mar': 'Martes',
    'mie': 'Miércoles',
    'jue': 'Jueves',
    'vie': 'Viernes',
    'sab': 'Sábado',
    'dom': 'Domingo'
  };

  const diasTexto = comercio.diasRetiro.map(d => diasSemana[d] || d).join(', ');
  const horarioTexto = `${comercio.horarioDesde} a ${comercio.horarioHasta}`;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">Mi Perfil</h1>
          <button
            onClick={() => setEditando(!editando)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#5a7a54] dark:bg-[#4a5d49] text-white hover:bg-[#4d6a48] dark:hover:bg-[#3d4d3c] transition-all"
          >
            {editando ? (
              <>
                <Save className="w-4 h-4" />
                Guardar cambios
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4" />
                Editar perfil
              </>
            )}
          </button>
        </div>
        <p className="text-stone-500 dark:text-stone-400">
          Gestioná la información de tu comercio
        </p>
      </div>

      {/* Profile card */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-8">
        {/* Avatar y nombre */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-stone-100 dark:border-stone-700">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#5a7a54] to-[#8faa88] dark:from-[#4a5d49] dark:to-[#6b7d6a] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {comercio.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-1">{comercio.nombre}</h2>
            <div className="inline-flex items-center gap-2 bg-[#5a7a54]/10 dark:bg-[#4a5d49]/20 text-[#5a7a54] dark:text-[#8faa88] px-3 py-1 rounded-full text-sm font-medium">
              <Building2 className="w-4 h-4" />
              {comercio.tipo}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-stone-400 dark:text-stone-500" />
              Dirección
            </label>
            {editando ? (
              <input
                type="text"
                defaultValue={comercio.direccion}
                className="w-full px-4 py-3 bg-[#faf9f7] dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-xl focus:border-[#5a7a54] dark:focus:border-[#8faa88] focus:ring-2 focus:ring-[#5a7a54]/10 dark:focus:ring-[#8faa88]/10 transition-all outline-none text-stone-800 dark:text-stone-100"
              />
            ) : (
              <div className="px-4 py-3 bg-stone-50 dark:bg-stone-700 rounded-xl text-stone-800 dark:text-stone-100">
                {comercio.direccion}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-stone-400 dark:text-stone-500" />
              Teléfono
            </label>
            {editando ? (
              <input
                type="tel"
                defaultValue={comercio.telefono}
                className="w-full px-4 py-3 bg-[#faf9f7] dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-xl focus:border-[#5a7a54] dark:focus:border-[#8faa88] focus:ring-2 focus:ring-[#5a7a54]/10 dark:focus:ring-[#8faa88]/10 transition-all outline-none text-stone-800 dark:text-stone-100"
              />
            ) : (
              <div className="px-4 py-3 bg-stone-50 dark:bg-stone-700 rounded-xl text-stone-800 dark:text-stone-100">
                {comercio.telefono}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-400 dark:text-stone-500" />
              Horario de retiro
            </label>
            <div className="px-4 py-3 bg-stone-50 dark:bg-stone-700 rounded-xl">
              <div className="text-stone-800 dark:text-stone-100 mb-1">{diasTexto}</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">{horarioTexto}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="mt-8 bg-white dark:bg-stone-800 rounded-2xl border border-red-200 dark:border-red-900 p-6">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Zona de peligro</h3>
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
          Estas acciones son irreversibles. Tené cuidado.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 rounded-xl text-sm font-medium border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            Desactivar comercio
          </button>
          <button className="px-4 py-2 rounded-xl text-sm font-medium border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            Eliminar cuenta
          </button>
        </div>
      </div>
    </div>
  );
}
