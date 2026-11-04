import { Clock } from 'lucide-react';

interface Horario {
  desde: string;
  hasta: string;
}

interface SchedulePickerProps {
  value: {
    dias: string[];
    horario: Horario;
  };
  onChange: (value: { dias: string[]; horario: Horario }) => void;
}

const diasSemana = [
  { id: 'lun', label: 'Lun', full: 'Lunes' },
  { id: 'mar', label: 'Mar', full: 'Martes' },
  { id: 'mie', label: 'Mié', full: 'Miércoles' },
  { id: 'jue', label: 'Jue', full: 'Jueves' },
  { id: 'vie', label: 'Vie', full: 'Viernes' },
  { id: 'sab', label: 'Sáb', full: 'Sábado' },
  { id: 'dom', label: 'Dom', full: 'Domingo' },
];

// Generar opciones de hora (de 6:00 a 23:00, cada 30 min)
const generarHoras = () => {
  const horas: string[] = [];
  for (let h = 6; h <= 23; h++) {
    horas.push(`${h.toString().padStart(2, '0')}:00`);
    horas.push(`${h.toString().padStart(2, '0')}:30`);
  }
  return horas;
};

const horas = generarHoras();

export default function SchedulePicker({ value, onChange }: SchedulePickerProps) {
  const toggleDia = (diaId: string) => {
    const nuevosDias = value.dias.includes(diaId)
      ? value.dias.filter(d => d !== diaId)
      : [...value.dias, diaId];
    onChange({ ...value, dias: nuevosDias });
  };

  const actualizarHorario = (campo: 'desde' | 'hasta', valor: string) => {
    onChange({ 
      ...value, 
      horario: { ...value.horario, [campo]: valor }
    });
  };

  const diasSeleccionados = diasSemana.filter(d => value.dias.includes(d.id));
  const horarioTexto = value.horario.desde && value.horario.hasta 
    ? `${value.horario.desde} a ${value.horario.hasta}`
    : '';

  return (
    <div className="space-y-5">
      {/* Selector de días */}
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-2">Días de retiro</label>
        <div className="grid grid-cols-7 gap-1.5">
          {diasSemana.map((dia) => {
            const activo = value.dias.includes(dia.id);
            return (
              <button
                key={dia.id}
                onClick={() => toggleDia(dia.id)}
                className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  activo
                    ? 'bg-[#5a7a54] text-white border-[#5a7a54] shadow-sm'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-[#c8d5c3] hover:bg-[#f5f8f4]'
                }`}
                title={dia.full}
              >
                {dia.label}
              </button>
            );
          })}
        </div>
        {diasSeleccionados.length > 0 && (
          <p className="text-xs text-stone-400 mt-2">
            Seleccionado: {diasSeleccionados.map(d => d.full).join(', ')}
          </p>
        )}
      </div>

      {/* Selector de horarios */}
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-2">
          <Clock className="w-3.5 h-3.5 inline mr-1" />
          Horario de retiro
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-stone-400 mb-1">Desde</label>
            <select
              value={value.horario.desde}
              onChange={(e) => actualizarHorario('desde', e.target.value)}
              className="w-full px-3 py-2.5 bg-[#faf9f7] border border-stone-200 rounded-xl focus:border-[#5a7a54] focus:ring-2 focus:ring-[#5a7a54]/10 transition-all outline-none text-stone-800 text-sm appearance-none cursor-pointer"
            >
              <option value="">Seleccionar</option>
              {horas.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-stone-400 mb-1">Hasta</label>
            <select
              value={value.horario.hasta}
              onChange={(e) => actualizarHorario('hasta', e.target.value)}
              className="w-full px-3 py-2.5 bg-[#faf9f7] border border-stone-200 rounded-xl focus:border-[#5a7a54] focus:ring-2 focus:ring-[#5a7a54]/10 transition-all outline-none text-stone-800 text-sm appearance-none cursor-pointer"
            >
              <option value="">Seleccionar</option>
              {horas.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>
        {horarioTexto && (
          <p className="text-xs text-stone-400 mt-2">
            Horario: {horarioTexto}
          </p>
        )}
      </div>

      {/* Resumen visual */}
      {value.dias.length > 0 && horarioTexto && (
        <div className="bg-[#f5f8f4] border border-[#e4ede2] rounded-xl p-4">
          <div className="text-xs text-[#5a7a54] font-medium uppercase tracking-wider mb-2">Resumen de horario</div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#5a7a54]" />
            <span className="text-sm text-stone-700 font-medium">
              {diasSeleccionados.map(d => d.label).join(', ')} · {horarioTexto}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
