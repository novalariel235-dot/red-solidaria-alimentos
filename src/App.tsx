import { useState, useEffect } from 'react';

// Types
interface Excedente {
  id: string;
  comercio: string;
  descripcionOriginal: string;
  categoria: string;
  cantidad: string;
  vencimientoEstimado: string;
  fechaPublicacion: string;
  estado: 'disponible' | 'reservado' | 'entregado';
  coordenadas: { lat: number; lng: number };
}

interface Comedor {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  capacidad: number;
  personasAtendidas: number;
}

interface MensajeGenerado {
  comedor: Comedor;
  mensaje: string;
  enviado: boolean;
}

// Mock data
const comedoresMock: Comedor[] = [
  { id: '1', nombre: 'Comedor "Manos Solidarias"', direccion: 'Av. San Martín 450', telefono: '+54 294 455-1234', capacidad: 80, personasAtendidas: 65 },
  { id: '2', nombre: 'Comedor "Esperanza"', direccion: 'Calle Mitre 1200', telefono: '+54 294 455-5678', capacidad: 50, personasAtendidas: 42 },
  { id: '3', nombre: 'Merendero "Gotitas de Amor"', direccion: 'Barrio Centro 320', telefono: '+54 294 455-9012', capacidad: 30, personasAtendidas: 28 },
  { id: '4', nombre: 'Comedor "Nuevo Amanecer"', direccion: 'Calle Belgrano 890', telefono: '+54 294 455-3456', capacidad: 100, personasAtendidas: 78 },
];

const excedentesIniciales: Excedente[] = [
  { id: '1', comercio: 'Panadería La Espiga Dorada', descripcionOriginal: 'me sobran 30 facturas y 2 kilos de pan del día', categoria: 'Panadería', cantidad: '30 facturas + 2 kg pan', vencimientoEstimado: '24 horas', fechaPublicacion: '2026-01-15', estado: 'disponible', coordenadas: { lat: -39.0, lng: -67.0 } },
  { id: '2', comercio: 'Verdulería Don José', descripcionOriginal: 'tengo como 5 kg de tomate y 3 kg de zanahoria que no vendí hoy', categoria: 'Verduras', cantidad: '5 kg tomate + 3 kg zanahoria', vencimientoEstimado: '2-3 días', fechaPublicacion: '2026-01-15', estado: 'disponible', coordenadas: { lat: -39.01, lng: -67.01 } },
  { id: '3', comercio: 'Almacén La Esquina', descripcionOriginal: 'quedan 10 litros de leche que vencen mañana', categoria: 'Lácteos', cantidad: '10 litros de leche', vencimientoEstimado: '1 día', fechaPublicacion: '2026-01-15', estado: 'reservado', coordenadas: { lat: -38.99, lng: -66.99 } },
];

// Simulación de IA - Procesamiento de texto libre
function procesarConIA(texto: string): { categoria: string; cantidad: string; vencimientoEstimado: string } {
  const textoLower = texto.toLowerCase();
  
  let categoria = 'Varios';
  if (textoLower.includes('pan') || textoLower.includes('factura') || textoLower.includes('medialuna') || textoLower.includes('galleta')) {
    categoria = 'Panadería';
  } else if (textoLower.includes('verdura') || textoLower.includes('tomate') || textoLower.includes('zanahoria') || textoLower.includes('lechuga') || textoLower.includes('papa') || textoLower.includes('cebolla')) {
    categoria = 'Verduras';
  } else if (textoLower.includes('fruta') || textoLower.includes('manzana') || textoLower.includes('banana') || textoLower.includes('naranja')) {
    categoria = 'Frutas';
  } else if (textoLower.includes('leche') || textoLower.includes('queso') || textoLower.includes('yogur') || textoLower.includes('manteca')) {
    categoria = 'Lácteos';
  } else if (textoLower.includes('carne') || textoLower.includes('pollo') || textoLower.includes('hamburguesa')) {
    categoria = 'Carnes';
  } else if (textoLower.includes('arroz') || textoLower.includes('fideo') || textoLower.includes('harina') || textoLower.includes('pasta')) {
    categoria = 'Almacén/Secos';
  }

  // Extraer cantidades
  const cantidadMatch = texto.match(/(\d+)\s*(kg|kilos|litros|l|unidades|docena|docenas|gr|gramos)?/gi);
  const cantidad = cantidadMatch ? cantidadMatch.join(' + ') : 'A definir';

  // Estimar vencimiento
  let vencimientoEstimado = 'A definir';
  if (textoLower.includes('vence mañana') || textoLower.includes('vencen mañana')) {
    vencimientoEstimado = '1 día';
  } else if (textoLower.includes('hoy') || textoLower.includes('del día')) {
    vencimientoEstimado = '24 horas';
  } else if (textoLower.includes('semana') || textoLower.includes('vencen')) {
    vencimientoEstimado = '3-5 días';
  } else if (categoria === 'Panadería') {
    vencimientoEstimado = '24 horas';
  } else if (categoria === 'Lácteos') {
    vencimientoEstimado = '2-3 días';
  } else if (categoria === 'Verduras' || categoria === 'Frutas') {
    vencimientoEstimado = '2-4 días';
  } else {
    vencimientoEstimado = '5-7 días';
  }

  return { categoria, cantidad, vencimientoEstimado };
}

// Simulación de generación de mensaje empático
function generarMensajeWhatsApp(comercio: string, excedente: Excedente, comedor: Comedor): string {
  return `🙏 *Hola, ${comedor.nombre}*

Soy *${comercio}* y quiero contarles que hoy nos sobraron alimentos que nos gustaría compartir con ustedes:

📦 *${excedente.cantidad}*
🏷️ Categoría: ${excedente.categoria}
⏰ Vencimiento estimado: ${excedente.vencimientoEstimado}

Los productos están en buen estado y nos encantaría que lleguen a quienes más lo necesitan. Si les interesa, pueden pasar a retirarlos por nuestra dirección.

¡Un abrazo solidario! 🤝

---
_Mensaje generado por Red Solidaria de Vinculación de Alimentos - Villa Regina_`;
}

// Components
function Header({ activeSection, setActiveSection }: { activeSection: string; setActiveSection: (s: string) => void }) {
  return (
    <header className="bg-gradient-to-r from-green-700 to-green-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🤝</div>
            <div>
              <h1 className="text-lg md:text-xl font-bold leading-tight">Red Solidaria</h1>
              <p className="text-green-200 text-xs md:text-sm">Vinculación de Alimentos • Villa Regina</p>
            </div>
          </div>
          <nav className="hidden md:flex gap-1">
            {[
              { id: 'inicio', label: 'Inicio', icon: '🏠' },
              { id: 'publicar', label: 'Publicar', icon: '📝' },
              { id: 'disponibles', label: 'Disponibles', icon: '📦' },
              { id: 'comedores', label: 'Comedores', icon: '🍽️' },
              { id: 'ia', label: 'IA Qwen', icon: '🤖' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeSection === item.id
                    ? 'bg-white text-green-700 shadow-md'
                    : 'text-green-100 hover:bg-green-600'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <select
            className="md:hidden bg-green-600 text-white border border-green-400 rounded-lg px-2 py-1 text-sm"
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value)}
          >
            <option value="inicio">🏠 Inicio</option>
            <option value="publicar">📝 Publicar</option>
            <option value="disponibles">📦 Disponibles</option>
            <option value="comedores">🍽️ Comedores</option>
            <option value="ia">🤖 IA Qwen</option>
          </select>
        </div>
      </div>
    </header>
  );
}

function HeroSection({ setActiveSection }: { setActiveSection: (s: string) => void }) {
  return (
    <section className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-8xl">🍞</div>
        <div className="absolute top-20 right-20 text-7xl">🥕</div>
        <div className="absolute bottom-10 left-1/4 text-6xl">🥛</div>
        <div className="absolute bottom-20 right-1/3 text-8xl">🍎</div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="animate-pulse">🟢</span> Plataforma activa en Villa Regina
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
            Conectamos comercios con <span className="text-green-600">comedores comunitarios</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            Los excedentes de alimentos de panaderías, verdulerías y almacenes locales llegan a quienes más lo necesitan. 
            La inteligencia artificial nos ayuda a organizar y vincular de forma eficiente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setActiveSection('publicar')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              📝 Publicar excedentes
            </button>
            <button
              onClick={() => setActiveSection('disponibles')}
              className="bg-white hover:bg-gray-50 text-green-700 border-2 border-green-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all"
            >
              📦 Ver disponibles
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
          {[
            { value: '12', label: 'Comercios activos', icon: '🏪' },
            { value: '4', label: 'Comedores vinculados', icon: '🍽️' },
            { value: '156', label: 'Kg donados este mes', icon: '📦' },
            { value: '89%', label: 'Alimentos rescatados', icon: '♻️' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm border border-green-100">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl md:text-3xl font-bold text-green-700">{stat.value}</div>
              <div className="text-xs md:text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComoFunciona() {
  const pasos = [
    { icon: '📝', title: 'El comercio publica', desc: 'El comerciante escribe en texto libre qué alimentos le sobraron. No necesita llenar formularios complicados.' },
    { icon: '🤖', title: 'La IA estructura', desc: 'Qwen analiza el texto, identifica categoría, cantidad y vencimiento estimado. Genera datos estandarizados.' },
    { icon: '📲', title: 'Se notifican comedores', desc: 'Se genera un mensaje empático y personalizado para enviar por WhatsApp a los comedores más cercanos.' },
    { icon: '🤝', title: 'Se realiza la entrega', desc: 'El comedor retira los alimentos y los distribuye entre las familias que asisten.' },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-4">¿Cómo funciona?</h3>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Un proceso simple impulsado por inteligencia artificial para reducir el desperdicio y alimentar a nuestra comunidad.</p>
        <div className="grid md:grid-cols-4 gap-6">
          {pasos.map((paso, i) => (
            <div key={i} className="relative">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 text-center border border-green-100 hover:shadow-lg transition-shadow h-full">
                <div className="text-4xl mb-3">{paso.icon}</div>
                <div className="absolute -top-3 -left-3 bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
                <h4 className="font-bold text-gray-800 mb-2">{paso.title}</h4>
                <p className="text-sm text-gray-600">{paso.desc}</p>
              </div>
              {i < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-3 text-green-400 text-xl">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PublicarExcedente({ onPublicar }: { onPublicar: (excedente: Excedente) => void }) {
  const [textoLibre, setTextoLibre] = useState('');
  const [comercio, setComercio] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [resultadoIA, setResultadoIA] = useState<{ categoria: string; cantidad: string; vencimientoEstimado: string } | null>(null);
  const [confirmado, setConfirmado] = useState(false);

  const procesar = () => {
    if (!textoLibre.trim() || !comercio.trim()) return;
    setProcesando(true);
    setResultadoIA(null);
    
    // Simular procesamiento de IA con delay
    setTimeout(() => {
      const resultado = procesarConIA(textoLibre);
      setResultadoIA(resultado);
      setProcesando(false);
    }, 1500);
  };

  const confirmarPublicacion = () => {
    if (!resultadoIA) return;
    const nuevo: Excedente = {
      id: Date.now().toString(),
      comercio,
      descripcionOriginal: textoLibre,
      categoria: resultadoIA.categoria,
      cantidad: resultadoIA.cantidad,
      vencimientoEstimado: resultadoIA.vencimientoEstimado,
      fechaPublicacion: new Date().toISOString().split('T')[0],
      estado: 'disponible',
      coordenadas: { lat: -39.0 + Math.random() * 0.02, lng: -67.0 + Math.random() * 0.02 },
    };
    onPublicar(nuevo);
    setConfirmado(true);
    setTimeout(() => {
      setTextoLibre('');
      setComercio('');
      setResultadoIA(null);
      setConfirmado(false);
    }, 3000);
  };

  return (
    <section className="py-12 bg-gradient-to-br from-gray-50 to-green-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">📝 Publicar Excedentes</h3>
          <p className="text-gray-600">Escribí en texto libre qué alimentos te sobraron. La IA se encarga del resto.</p>
        </div>

        {confirmado ? (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h4 className="text-xl font-bold text-green-800 mb-2">¡Publicación exitosa!</h4>
            <p className="text-green-700">Los comedores cercanos serán notificados automáticamente.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
            {/* Nombre del comercio */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">🏪 Nombre del comercio</label>
              <input
                type="text"
                value={comercio}
                onChange={(e) => setComercio(e.target.value)}
                placeholder="Ej: Panadería La Espiga Dorada"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
              />
            </div>

            {/* Texto libre */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">📋 ¿Qué alimentos te sobraron?</label>
              <textarea
                value={textoLibre}
                onChange={(e) => setTextoLibre(e.target.value)}
                placeholder='Escribí naturalmente, como si hablaras con un amigo. Ej: "Me sobran 30 facturas y 2 kilos de pan del día"'
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">💡 No te preocupes por el formato. La IA lo estructura automáticamente.</p>
            </div>

            {/* Botón procesar */}
            <button
              onClick={procesar}
              disabled={!textoLibre.trim() || !comercio.trim() || procesando}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {procesando ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Procesando con IA...
                </>
              ) : (
                <>🤖 Procesar con Qwen AI</>
              )}
            </button>

            {/* Resultado IA */}
            {resultadoIA && (
              <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🤖</span>
                  <h4 className="font-bold text-blue-800">Resultado del procesamiento IA (Qwen)</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <div className="text-xs text-gray-500 uppercase font-semibold">Categoría</div>
                    <div className="text-lg font-bold text-blue-700">{resultadoIA.categoria}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <div className="text-xs text-gray-500 uppercase font-semibold">Cantidad</div>
                    <div className="text-lg font-bold text-blue-700">{resultadoIA.cantidad}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <div className="text-xs text-gray-500 uppercase font-semibold">Vencimiento est.</div>
                    <div className="text-lg font-bold text-blue-700">{resultadoIA.vencimientoEstimado}</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white/50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Texto original:</div>
                  <div className="text-sm text-gray-700 italic">"{textoLibre}"</div>
                </div>
                <button
                  onClick={confirmarPublicacion}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  ✅ Confirmar y publicar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Info técnica */}
        <div className="mt-8 bg-white/80 rounded-xl p-6 border border-gray-200">
          <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
            <span>🤖</span> ¿Cómo usa Qwen esta funcionalidad?
          </h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2"><span className="text-green-500">•</span> Analiza el texto libre del comerciante usando procesamiento de lenguaje natural (NLP)</li>
            <li className="flex items-start gap-2"><span className="text-green-500">•</span> Identifica entidades: tipo de alimento, cantidades numéricas, unidades de medida</li>
            <li className="flex items-start gap-2"><span className="text-green-500">•</span> Clasifica en categorías estandarizadas (Panadería, Verduras, Lácteos, etc.)</li>
            <li className="flex items-start gap-2"><span className="text-green-500">•</span> Estima fecha de vencimiento según el tipo de producto</li>
            <li className="flex items-start gap-2"><span className="text-green-500">•</span> Genera mensajes empáticos personalizados para cada comedor</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function ExcedentesDisponibles({ excedentes }: { excedentes: Excedente[] }) {
  const [filtro, setFiltro] = useState('todos');
  const [mensajePreview, setMensajePreview] = useState<MensajeGenerado | null>(null);

  const categorias = ['todos', ...Array.from(new Set(excedentes.map(e => e.categoria)))];
  const filtrados = filtro === 'todos' ? excedentes : excedentes.filter(e => e.categoria === filtro);

  const generarMensaje = (excedente: Excedente) => {
    const comedor = comedoresMock[Math.floor(Math.random() * comedoresMock.length)];
    const mensaje = generarMensajeWhatsApp(excedente.comercio, excedente, comedor);
    setMensajePreview({ comedor, mensaje, enviado: false });
  };

  const categoriaColors: Record<string, string> = {
    'Panadería': 'bg-amber-100 text-amber-800',
    'Verduras': 'bg-green-100 text-green-800',
    'Frutas': 'bg-orange-100 text-orange-800',
    'Lácteos': 'bg-blue-100 text-blue-800',
    'Carnes': 'bg-red-100 text-red-800',
    'Almacén/Secos': 'bg-yellow-100 text-yellow-800',
    'Varios': 'bg-gray-100 text-gray-800',
  };

  const estadoColors: Record<string, string> = {
    'disponible': 'bg-green-100 text-green-800 border-green-200',
    'reservado': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'entregado': 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <section className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">📦 Alimentos Disponibles</h3>
          <p className="text-gray-600">Excedentes publicados por comercios locales de Villa Regina</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setFiltro(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filtro === cat
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-green-50 border border-gray-200'
              }`}
            >
              {cat === 'todos' ? '🏷️ Todos' : cat}
            </button>
          ))}
        </div>

        {/* Grid de excedentes */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrados.map((excedente) => (
            <div key={excedente.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${categoriaColors[excedente.categoria] || 'bg-gray-100 text-gray-800'}`}>
                    {excedente.categoria}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${estadoColors[excedente.estado]}`}>
                    {excedente.estado === 'disponible' ? '✅ Disponible' : excedente.estado === 'reservado' ? '⏳ Reservado' : '📤 Entregado'}
                  </span>
                </div>
                <h4 className="font-bold text-gray-800 text-lg mb-1">{excedente.comercio}</h4>
                <p className="text-sm text-gray-500 italic mb-3">"{excedente.descripcionOriginal}"</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">📦</span>
                    <span className="text-gray-700 font-medium">{excedente.cantidad}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">⏰</span>
                    <span className="text-gray-700">Vence en: {excedente.vencimientoEstimado}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">📅</span>
                    <span className="text-gray-700">Publicado: {excedente.fechaPublicacion}</span>
                  </div>
                </div>
                {excedente.estado === 'disponible' && (
                  <button
                    onClick={() => generarMensaje(excedente)}
                    className="mt-4 w-full bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    📲 Generar mensaje WhatsApp
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filtrados.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">📭</div>
            <p>No hay excedentes disponibles en esta categoría.</p>
          </div>
        )}

        {/* Modal de mensaje */}
        {mensajePreview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setMensajePreview(null)}>
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="bg-green-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>📲</span>
                  <span className="font-semibold">Mensaje para WhatsApp</span>
                </div>
                <button onClick={() => setMensajePreview(null)} className="text-white/80 hover:text-white text-xl">✕</button>
              </div>
              <div className="p-5">
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="text-xs text-gray-500 mb-1">Dirigido a:</div>
                  <div className="font-semibold text-gray-800">{mensajePreview.comedor.nombre}</div>
                  <div className="text-sm text-gray-600">{mensajePreview.comedor.telefono}</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {mensajePreview.mensaje}
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setMensajePreview({ ...mensajePreview, enviado: true })}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-all"
                  >
                    {mensajePreview.enviado ? '✅ Enviado' : '📤 Simular envío'}
                  </button>
                  <button
                    onClick={() => setMensajePreview(null)}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    Cerrar
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">
                  * En producción, este mensaje se enviaría automáticamente vía WhatsApp Business API
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ComedoresSection() {
  return (
    <section className="py-12 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">🍽️ Comedores Comunitarios</h3>
          <p className="text-gray-600">Organizaciones de Villa Regina que reciben las donaciones</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {comedoresMock.map((comedor) => (
            <div key={comedor.id} className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🏠</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-lg">{comedor.nombre}</h4>
                  <p className="text-sm text-gray-600 mt-1">📍 {comedor.direccion}</p>
                  <p className="text-sm text-gray-600">📞 {comedor.telefono}</p>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Personas atendidas</span>
                      <span className="font-semibold text-orange-700">{comedor.personasAtendidas} / {comedor.capacidad}</span>
                    </div>
                    <div className="w-full bg-orange-100 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all"
                        style={{ width: `${(comedor.personasAtendidas / comedor.capacidad) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Capacidad: {comedor.capacidad} personas</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mapa simulado */}
        <div className="mt-12 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 border border-green-100">
          <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <span>🗺️</span> Mapa de la Red - Villa Regina
          </h4>
          <div className="bg-white rounded-xl p-6 border border-gray-200 relative overflow-hidden" style={{ minHeight: '300px' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 opacity-50"></div>
            <div className="relative">
              {/* Simulated map points */}
              <div className="grid grid-cols-4 grid-rows-3 gap-4 p-4">
                {comedoresMock.map((comedor, i) => (
                  <div key={comedor.id} className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-lg shadow-lg animate-pulse">
                      🍽️
                    </div>
                    <span className="text-xs text-gray-600 mt-1 text-center leading-tight">{comedor.nombre.split('"')[1] || comedor.nombre}</span>
                  </div>
                ))}
                {excedentesIniciales.map((exc, i) => (
                  <div key={exc.id} className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-lg shadow-lg">
                      🏪
                    </div>
                    <span className="text-xs text-gray-600 mt-1 text-center leading-tight">{exc.comercio.split(' ').slice(0, 2).join(' ')}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-6 justify-center mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Comercios</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-600">Comedores</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function IASection() {
  const [ejemploTexto, setEjemploTexto] = useState('');
  const [resultado, setResultado] = useState<{ categoria: string; cantidad: string; vencimientoEstimado: string } | null>(null);
  const [cargando, setCargando] = useState(false);

  const ejemplos = [
    'Me sobran 30 facturas y 2 kilos de pan del día',
    'Tengo 5 kg de tomate y 3 kg de zanahoria que no vendí',
    'Quedan 10 litros de leche que vencen mañana',
    'Me quedaron 4 docenas de medialunas y un kilo de galletas',
    'Tengo 8 manzanas y 6 bananas que no se vendieron hoy',
  ];

  const probarEjemplo = (texto: string) => {
    setEjemploTexto(texto);
    setCargando(true);
    setResultado(null);
    setTimeout(() => {
      setResultado(procesarConIA(texto));
      setCargando(false);
    }, 1200);
  };

  return (
    <section className="py-12 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">🤖 Inteligencia Artificial con Qwen</h3>
          <p className="text-gray-600">Probá cómo Qwen procesa el texto libre de los comerciantes</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Panel de entrada */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>💬</span> Texto del comerciante
            </h4>
            <textarea
              value={ejemploTexto}
              onChange={(e) => setEjemploTexto(e.target.value)}
              placeholder="Escribí o seleccioná un ejemplo..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none resize-none mb-4"
            />
            <button
              onClick={() => probarEjemplo(ejemploTexto)}
              disabled={!ejemploTexto.trim() || cargando}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              {cargando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Procesando...
                </>
              ) : (
                '🤖 Procesar con Qwen'
              )}
            </button>

            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">Ejemplos para probar:</p>
              <div className="flex flex-wrap gap-2">
                {ejemplos.map((ej, i) => (
                  <button
                    key={i}
                    onClick={() => probarEjemplo(ej)}
                    className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-200 transition-all"
                  >
                    "{ej.substring(0, 35)}..."
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Panel de resultado */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📊</span> Resultado estructurado
            </h4>
            {resultado ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏷️</span>
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Categoría detectada</div>
                        <div className="text-lg font-bold text-indigo-700">{resultado.categoria}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📦</span>
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Cantidad extraída</div>
                        <div className="text-lg font-bold text-indigo-700">{resultado.cantidad}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⏰</span>
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Vencimiento estimado</div>
                        <div className="text-lg font-bold text-indigo-700">{resultado.vencimientoEstimado}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="text-xs text-gray-500 font-semibold mb-1">JSON generado:</div>
                  <pre className="text-xs text-gray-700 overflow-x-auto">
{JSON.stringify({
  categoria: resultado.categoria,
  cantidad: resultado.cantidad,
  vencimiento_estimado: resultado.vencimientoEstimado,
  timestamp: new Date().toISOString(),
  modelo: "qwen-nlp-v1"
}, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <div className="text-4xl mb-2">🤖</div>
                <p className="text-sm">Los resultados aparecerán aquí</p>
              </div>
            )}
          </div>
        </div>

        {/* Arquitectura técnica */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
          <h4 className="font-bold text-gray-800 text-xl mb-6 flex items-center gap-2">
            <span>🏗️</span> Arquitectura Técnica
          </h4>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <div className="text-2xl mb-2">🖥️</div>
              <h5 className="font-bold text-blue-800 mb-2">Frontend</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• React + TypeScript</li>
                <li>• Tailwind CSS</li>
                <li>• Responsive design</li>
                <li>• Formularios accesibles</li>
              </ul>
            </div>
            <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
              <div className="text-2xl mb-2">🤖</div>
              <h5 className="font-bold text-purple-800 mb-2">IA - Qwen NLP</h5>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Procesamiento de lenguaje natural</li>
                <li>• Extracción de entidades</li>
                <li>• Clasificación de categorías</li>
                <li>• Generación de mensajes</li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-xl p-5 border border-green-100">
              <div className="text-2xl mb-2">⚙️</div>
              <h5 className="font-bold text-green-800 mb-2">Backend</h5>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Python / PHP</li>
                <li>• PostgreSQL / MySQL</li>
                <li>• API REST</li>
                <li>• WhatsApp Business API</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🤝</span>
              <span className="font-bold text-lg">Red Solidaria</span>
            </div>
            <p className="text-gray-400 text-sm">Vinculación de Alimentos - Villa Regina, Río Negro, Argentina</p>
          </div>
          <div>
            <h5 className="font-semibold mb-3">Tecnología</h5>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>🤖 IA Qwen para NLP</li>
              <li>🐍 Python / PHP Backend</li>
              <li>🗄️ PostgreSQL Database</li>
              <li>📲 WhatsApp Business API</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-3">Contacto</h5>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>📍 Villa Regina, Río Negro</li>
              <li>📧 redsolidaria@ejemplo.org</li>
              <li>📞 +54 294 455-0000</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-500">
          <p>© 2026 Red Solidaria de Vinculación de Alimentos. Proyecto con impacto social positivo.</p>
        </div>
      </div>
    </footer>
  );
}

// Main App
export default function App() {
  const [activeSection, setActiveSection] = useState('inicio');
  const [excedentes, setExcedentes] = useState<Excedente[]>(excedentesIniciales);

  const handlePublicar = (nuevo: Excedente) => {
    setExcedentes([nuevo, ...excedentes]);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeSection]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />
      
      {activeSection === 'inicio' && (
        <>
          <HeroSection setActiveSection={setActiveSection} />
          <ComoFunciona />
          <section className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
              <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">Últimos excedentes publicados</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {excedentes.slice(0, 3).map((exc) => (
                  <div key={exc.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🏪</span>
                      <span className="font-semibold text-gray-800 text-sm">{exc.comercio}</span>
                    </div>
                    <p className="text-sm text-gray-600 italic mb-2">"{exc.descripcionOriginal}"</p>
                    <div className="flex items-center gap-2">
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">{exc.categoria}</span>
                      <span className="text-xs text-gray-500">{exc.cantidad}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-8">
                <button
                  onClick={() => setActiveSection('disponibles')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Ver todos los excedentes →
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {activeSection === 'publicar' && <PublicarExcedente onPublicar={handlePublicar} />}
      {activeSection === 'disponibles' && <ExcedentesDisponibles excedentes={excedentes} />}
      {activeSection === 'comedores' && <ComedoresSection />}
      {activeSection === 'ia' && <IASection />}

      <Footer />
    </div>
  );
}
