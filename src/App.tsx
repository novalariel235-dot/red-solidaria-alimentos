import { useState, useEffect } from 'react';
import {
  HeartHandshake, Leaf, Package, UtensilsCrossed, Bot, Menu, X,
  ArrowRight, MapPin, Phone, Clock, Tag, CheckCircle2,
  Send, ChevronRight, Sparkles, Store, Users, Recycle,
  TrendingUp, MessageCircle, FileText, Brain, Database,
  Server, Wifi, CircleDot, Play
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────
interface Excedente {
  id: string;
  comercio: string;
  descripcionOriginal: string;
  categoria: string;
  cantidad: string;
  vencimientoEstimado: string;
  fechaPublicacion: string;
  estado: 'disponible' | 'reservado' | 'entregado';
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

// ─── Mock Data ───────────────────────────────────────────
const comedoresMock: Comedor[] = [
  { id: '1', nombre: 'Manos Solidarias', direccion: 'Av. San Martín 450', telefono: '+54 294 455-1234', capacidad: 80, personasAtendidas: 65 },
  { id: '2', nombre: 'Comedor Esperanza', direccion: 'Calle Mitre 1200', telefono: '+54 294 455-5678', capacidad: 50, personasAtendidas: 42 },
  { id: '3', nombre: 'Merendero Gotitas de Amor', direccion: 'Barrio Centro 320', telefono: '+54 294 455-9012', capacidad: 30, personasAtendidas: 28 },
  { id: '4', nombre: 'Comedor Nuevo Amanecer', direccion: 'Calle Belgrano 890', telefono: '+54 294 455-3456', capacidad: 100, personasAtendidas: 78 },
];

const excedentesIniciales: Excedente[] = [
  { id: '1', comercio: 'Panadería La Espiga Dorada', descripcionOriginal: 'me sobran 30 facturas y 2 kilos de pan del día', categoria: 'Panadería', cantidad: '30 facturas + 2 kg pan', vencimientoEstimado: '24 horas', fechaPublicacion: '2026-01-15', estado: 'disponible' },
  { id: '2', comercio: 'Verdulería Don José', descripcionOriginal: 'tengo como 5 kg de tomate y 3 kg de zanahoria que no vendí hoy', categoria: 'Verduras', cantidad: '5 kg tomate + 3 kg zanahoria', vencimientoEstimado: '2-3 días', fechaPublicacion: '2026-01-15', estado: 'disponible' },
  { id: '3', comercio: 'Almacén La Esquina', descripcionOriginal: 'quedan 10 litros de leche que vencen mañana', categoria: 'Lácteos', cantidad: '10 litros de leche', vencimientoEstimado: '1 día', fechaPublicacion: '2026-01-15', estado: 'reservado' },
];

// ─── AI Simulation ───────────────────────────────────────
function procesarConIA(texto: string) {
  const t = texto.toLowerCase();
  let categoria = 'Varios';
  if (t.includes('pan') || t.includes('factura') || t.includes('medialuna') || t.includes('galleta')) categoria = 'Panadería';
  else if (t.includes('verdura') || t.includes('tomate') || t.includes('zanahoria') || t.includes('lechuga') || t.includes('papa') || t.includes('cebolla')) categoria = 'Verduras';
  else if (t.includes('fruta') || t.includes('manzana') || t.includes('banana') || t.includes('naranja')) categoria = 'Frutas';
  else if (t.includes('leche') || t.includes('queso') || t.includes('yogur') || t.includes('manteca')) categoria = 'Lácteos';
  else if (t.includes('carne') || t.includes('pollo') || t.includes('hamburguesa')) categoria = 'Carnes';
  else if (t.includes('arroz') || t.includes('fideo') || t.includes('harina') || t.includes('pasta')) categoria = 'Almacén/Secos';

  const cantidadMatch = texto.match(/(\d+)\s*(kg|kilos|litros|l|unidades|docena|docenas|gr|gramos)?/gi);
  const cantidad = cantidadMatch ? cantidadMatch.join(' + ') : 'A definir';

  let vencimientoEstimado = 'A definir';
  if (t.includes('vence mañana') || t.includes('vencen mañana')) vencimientoEstimado = '1 día';
  else if (t.includes('hoy') || t.includes('del día')) vencimientoEstimado = '24 horas';
  else if (categoria === 'Panadería') vencimientoEstimado = '24 horas';
  else if (categoria === 'Lácteos') vencimientoEstimado = '2-3 días';
  else if (categoria === 'Verduras' || categoria === 'Frutas') vencimientoEstimado = '2-4 días';
  else vencimientoEstimado = '5-7 días';

  return { categoria, cantidad, vencimientoEstimado };
}

function generarMensajeWhatsApp(comercio: string, excedente: Excedente, comedor: Comedor): string {
  return `Hola, ${comedor.nombre}\n\nSoy ${comercio} y quiero contarles que hoy nos sobraron alimentos que nos gustaría compartir con ustedes:\n\n${excedente.cantidad}\nCategoría: ${excedente.categoria}\nVencimiento estimado: ${excedente.vencimientoEstimado}\n\nLos productos están en buen estado y nos encantaría que lleguen a quienes más lo necesitan. Si les interesa, pueden pasar a retirarlos.\n\nUn abrazo solidario.\n\n— Red Solidaria de Vinculación de Alimentos · Villa Regina`;
}

// ─── Category config ─────────────────────────────────────
const categoriaConfig: Record<string, { color: string; bg: string }> = {
  'Panadería': { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  'Verduras': { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  'Frutas': { color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  'Lácteos': { color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200' },
  'Carnes': { color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
  'Almacén/Secos': { color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
  'Varios': { color: 'text-stone-700', bg: 'bg-stone-50 border-stone-200' },
};

// ─── Header ──────────────────────────────────────────────
function Header({ activeSection, setActiveSection }: { activeSection: string; setActiveSection: (s: string) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'publicar', label: 'Publicar' },
    { id: 'disponibles', label: 'Disponibles' },
    { id: 'comedores', label: 'Comedores' },
    { id: 'ia', label: 'IA Qwen' },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-stone-200/60">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => setActiveSection('inicio')} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5a7a54] to-[#8faa88] flex items-center justify-center shadow-sm">
              <HeartHandshake className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-stone-800 leading-tight tracking-tight">Red Solidaria</div>
              <div className="text-[10px] text-stone-400 font-medium tracking-wide uppercase">Villa Regina</div>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-[#5a7a54]/10 text-[#5a7a54]'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* CTA + Mobile */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveSection('publicar')}
              className="hidden md:flex items-center gap-2 bg-[#5a7a54] hover:bg-[#4d6a48] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
            >
              <Package className="w-4 h-4" />
              Publicar
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-stone-100 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5 text-stone-600" /> : <Menu className="w-5 h-5 text-stone-600" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-stone-200/60 bg-white/95 backdrop-blur-xl">
          <div className="px-5 py-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setMobileOpen(false); }}
                className={`block w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeSection === item.id
                    ? 'bg-[#5a7a54]/10 text-[#5a7a54]'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Hero Section ────────────────────────────────────────
function HeroSection({ setActiveSection }: { setActiveSection: (s: string) => void }) {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#faf9f7] via-[#f5f3ef] to-[#eef2ec]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#c8d5c3]/30 to-transparent rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#e8d5c4]/20 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, #5a7a54 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-16 md:pt-24 pb-16 md:pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <div>
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-white/80 border border-[#c8d5c3] px-3.5 py-1.5 rounded-full text-xs font-medium text-[#5a7a54] mb-6 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5a7a54] animate-pulse" />
                Plataforma activa en Villa Regina
              </div>
            </div>

            <h2 className="animate-fade-in-up text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight text-stone-800 mb-6">
              Menos desperdicio,{' '}
              <span className="font-serif italic text-gradient font-medium">más comunidad</span>
            </h2>

            <p className="animate-fade-in-delay text-lg text-stone-500 leading-relaxed mb-8 max-w-lg">
              Conectamos los excedentes de comercios locales con comedores comunitarios. 
              La inteligencia artificial organiza, clasifica y notifica de forma automática.
            </p>

            <div className="animate-fade-in-delay-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setActiveSection('publicar')}
                className="group flex items-center justify-center gap-2.5 bg-[#5a7a54] hover:bg-[#4d6a48] text-white px-7 py-3.5 rounded-xl font-semibold text-base shadow-lg shadow-[#5a7a54]/20 hover:shadow-xl hover:shadow-[#5a7a54]/25 transition-all duration-300"
              >
                Publicar excedentes
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => setActiveSection('disponibles')}
                className="flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-700 px-7 py-3.5 rounded-xl font-semibold text-base border border-stone-200 shadow-sm hover:shadow transition-all duration-300"
              >
                <Play className="w-4 h-4" />
                Ver disponibles
              </button>
            </div>
          </div>

          {/* Right: Visual card */}
          <div className="animate-fade-in-delay-3 hidden lg:block">
            <div className="relative">
              {/* Main card */}
              <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-100 p-6 relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#5a7a54]/10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-[#5a7a54]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-stone-800">Qwen AI procesando</div>
                    <div className="text-xs text-stone-400">Análisis de texto libre</div>
                  </div>
                </div>

                <div className="bg-stone-50 rounded-xl p-4 mb-4 border border-stone-100">
                  <div className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-2">Entrada</div>
                  <p className="text-sm text-stone-600 italic">"Me sobran 30 facturas y 2 kilos de pan del día"</p>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#c8d5c3] to-transparent" />
                  <Sparkles className="w-4 h-4 text-[#8faa88]" />
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#c8d5c3] to-transparent" />
                </div>

                <div className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-3">Resultado estructurado</div>
                <div className="space-y-2.5">
                  {[
                    { icon: Tag, label: 'Categoría', value: 'Panadería' },
                    { icon: Package, label: 'Cantidad', value: '30 facturas + 2 kg pan' },
                    { icon: Clock, label: 'Vencimiento', value: '24 horas' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-[#f5f8f4] rounded-lg px-3.5 py-2.5 border border-[#e4ede2]">
                      <item.icon className="w-4 h-4 text-[#5a7a54] shrink-0" />
                      <span className="text-xs text-stone-400 w-20">{item.label}</span>
                      <span className="text-sm font-medium text-stone-700">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg border border-stone-100 p-3 animate-float z-20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Send className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-stone-700">WhatsApp</div>
                    <div className="text-[10px] text-stone-400">Mensaje enviado</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-3 -left-4 bg-white rounded-xl shadow-lg border border-stone-100 p-3 animate-float-delayed z-20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-stone-700">Comedor notificado</div>
                    <div className="text-[10px] text-stone-400">Manos Solidarias</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { icon: Store, value: '12', label: 'Comercios activos' },
            { icon: Users, value: '4', label: 'Comedores vinculados' },
            { icon: Recycle, value: '156 kg', label: 'Donados este mes' },
            { icon: TrendingUp, value: '89%', label: 'Alimentos rescatados' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-stone-100 hover:border-[#c8d5c3] transition-all duration-300 group">
              <stat.icon className="w-5 h-5 text-[#8faa88] mb-2 group-hover:text-[#5a7a54] transition-colors" />
              <div className="text-2xl md:text-3xl font-bold text-stone-800 tracking-tight">{stat.value}</div>
              <div className="text-xs md:text-sm text-stone-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Cómo funciona ───────────────────────────────────────
function ComoFunciona() {
  const pasos = [
    { icon: FileText, title: 'El comercio publica', desc: 'Escribís en texto libre qué alimentos te sobraron. Sin formularios complicados.' },
    { icon: Brain, title: 'La IA estructura', desc: 'Qwen analiza el texto, identifica categoría, cantidad y vencimiento estimado.' },
    { icon: MessageCircle, title: 'Se notifican comedores', desc: 'Se genera un mensaje empático y personalizado para enviar por WhatsApp.' },
    { icon: HeartHandshake, title: 'Se realiza la entrega', desc: 'El comedor retira los alimentos y los distribuye entre las familias.' },
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-[#5a7a54] text-sm font-medium mb-3">
            <Leaf className="w-4 h-4" />
            Proceso simple
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-stone-800 tracking-tight">¿Cómo funciona?</h3>
          <p className="text-stone-400 mt-3 max-w-lg mx-auto">Cuatro pasos para que los alimentos lleguen a quienes más lo necesitan.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pasos.map((paso, i) => (
            <div key={i} className="group relative">
              <div className="bg-[#faf9f7] rounded-2xl p-6 border border-stone-100 hover:border-[#c8d5c3] hover:shadow-lg hover:shadow-[#c8d5c3]/10 transition-all duration-300 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center group-hover:bg-[#5a7a54] group-hover:border-[#5a7a54] transition-all duration-300">
                    <paso.icon className="w-5 h-5 text-[#5a7a54] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">Paso {i + 1}</span>
                </div>
                <h4 className="font-semibold text-stone-800 mb-2">{paso.title}</h4>
                <p className="text-sm text-stone-400 leading-relaxed">{paso.desc}</p>
              </div>
              {i < 3 && (
                <ChevronRight className="hidden lg:block absolute top-1/2 -right-4 w-5 h-5 text-stone-200 -translate-y-1/2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Publicar Excedente ──────────────────────────────────
function PublicarExcedente({ onPublicar }: { onPublicar: (e: Excedente) => void }) {
  const [textoLibre, setTextoLibre] = useState('');
  const [comercio, setComercio] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [resultadoIA, setResultadoIA] = useState<{ categoria: string; cantidad: string; vencimientoEstimado: string } | null>(null);
  const [confirmado, setConfirmado] = useState(false);

  const procesar = () => {
    if (!textoLibre.trim() || !comercio.trim()) return;
    setProcesando(true);
    setResultadoIA(null);
    setTimeout(() => {
      setResultadoIA(procesarConIA(textoLibre));
      setProcesando(false);
    }, 1500);
  };

  const confirmarPublicacion = () => {
    if (!resultadoIA) return;
    onPublicar({
      id: Date.now().toString(),
      comercio,
      descripcionOriginal: textoLibre,
      categoria: resultadoIA.categoria,
      cantidad: resultadoIA.cantidad,
      vencimientoEstimado: resultadoIA.vencimientoEstimado,
      fechaPublicacion: new Date().toISOString().split('T')[0],
      estado: 'disponible',
    });
    setConfirmado(true);
    setTimeout(() => { setTextoLibre(''); setComercio(''); setResultadoIA(null); setConfirmado(false); }, 3000);
  };

  if (confirmado) {
    return (
      <section className="py-20 min-h-screen flex items-center justify-center bg-[#faf9f7]">
        <div className="text-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-[#5a7a54]/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-[#5a7a54]" />
          </div>
          <h3 className="text-2xl font-bold text-stone-800 mb-2">¡Publicación exitosa!</h3>
          <p className="text-stone-400">Los comedores cercanos serán notificados automáticamente.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20 min-h-screen bg-[#faf9f7]">
      <div className="max-w-2xl mx-auto px-5 md:px-8">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-[#5a7a54] text-sm font-medium mb-3">
            <Package className="w-4 h-4" />
            Publicar
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-stone-800 tracking-tight mb-2">¿Qué te sobró hoy?</h3>
          <p className="text-stone-400">Escribí naturalmente. La IA se encarga de estructurar la información.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 md:p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-600 mb-2">Nombre del comercio</label>
            <input
              type="text"
              value={comercio}
              onChange={(e) => setComercio(e.target.value)}
              placeholder="Ej: Panadería La Espiga Dorada"
              className="w-full px-4 py-3 bg-[#faf9f7] border border-stone-200 rounded-xl focus:border-[#5a7a54] focus:ring-2 focus:ring-[#5a7a54]/10 transition-all outline-none text-stone-800 placeholder:text-stone-300"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-600 mb-2">Descripción libre</label>
            <textarea
              value={textoLibre}
              onChange={(e) => setTextoLibre(e.target.value)}
              placeholder='Ej: "Me sobran 30 facturas y 2 kilos de pan del día"'
              rows={4}
              className="w-full px-4 py-3 bg-[#faf9f7] border border-stone-200 rounded-xl focus:border-[#5a7a54] focus:ring-2 focus:ring-[#5a7a54]/10 transition-all outline-none resize-none text-stone-800 placeholder:text-stone-300"
            />
            <p className="text-xs text-stone-400 mt-2">No importa el formato. Qwen lo estructura automáticamente.</p>
          </div>

          <button
            onClick={procesar}
            disabled={!textoLibre.trim() || !comercio.trim() || procesando}
            className="w-full bg-[#5a7a54] hover:bg-[#4d6a48] disabled:bg-stone-200 disabled:text-stone-400 text-white py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2.5 shadow-sm"
          >
            {procesando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Procesando con Qwen...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Procesar con IA
              </>
            )}
          </button>

          {resultadoIA && (
            <div className="mt-6 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-[#5a7a54]/10 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-[#5a7a54]" />
                </div>
                <span className="text-sm font-medium text-stone-600">Resultado de Qwen AI</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Categoría', value: resultadoIA.categoria, icon: Tag },
                  { label: 'Cantidad', value: resultadoIA.cantidad, icon: Package },
                  { label: 'Vencimiento', value: resultadoIA.vencimientoEstimado, icon: Clock },
                ].map((item, i) => (
                  <div key={i} className="bg-[#f5f8f4] rounded-xl p-3.5 border border-[#e4ede2]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <item.icon className="w-3.5 h-3.5 text-[#8faa88]" />
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">{item.label}</span>
                    </div>
                    <div className="text-sm font-semibold text-stone-800">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="bg-stone-50 rounded-xl p-3 mb-4 border border-stone-100">
                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">Texto original</span>
                <p className="text-sm text-stone-500 italic mt-0.5">"{textoLibre}"</p>
              </div>

              <button
                onClick={confirmarPublicacion}
                className="w-full bg-stone-800 hover:bg-stone-900 text-white py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirmar y publicar
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Excedentes Disponibles ──────────────────────────────
function ExcedentesDisponibles({ excedentes }: { excedentes: Excedente[] }) {
  const [filtro, setFiltro] = useState('todos');
  const [mensajePreview, setMensajePreview] = useState<MensajeGenerado | null>(null);

  const categorias = ['todos', ...Array.from(new Set(excedentes.map(e => e.categoria)))];
  const filtrados = filtro === 'todos' ? excedentes : excedentes.filter(e => e.categoria === filtro);

  const generarMensaje = (excedente: Excedente) => {
    const comedor = comedoresMock[Math.floor(Math.random() * comedoresMock.length)];
    setMensajePreview({ comedor, mensaje: generarMensajeWhatsApp(excedente.comercio, excedente, comedor), enviado: false });
  };

  return (
    <section className="py-16 md:py-20 min-h-screen bg-[#faf9f7]">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-[#5a7a54] text-sm font-medium mb-3">
            <Package className="w-4 h-4" />
            Disponibles
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-stone-800 tracking-tight mb-2">Alimentos disponibles</h3>
          <p className="text-stone-400">Excedentes publicados por comercios locales de Villa Regina</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setFiltro(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filtro === cat
                  ? 'bg-[#5a7a54] text-white shadow-sm'
                  : 'bg-white text-stone-500 hover:text-stone-700 border border-stone-200 hover:border-stone-300'
              }`}
            >
              {cat === 'todos' ? 'Todos' : cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtrados.map((exc) => {
            const catConf = categoriaConfig[exc.categoria] || categoriaConfig['Varios'];
            return (
              <div key={exc.id} className="bg-white rounded-2xl border border-stone-100 hover:border-stone-200 hover:shadow-lg hover:shadow-stone-100/50 transition-all duration-300 overflow-hidden group">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${catConf.bg} ${catConf.color}`}>
                      {exc.categoria}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                      exc.estado === 'disponible' ? 'bg-emerald-50 text-emerald-700' :
                      exc.estado === 'reservado' ? 'bg-amber-50 text-amber-700' :
                      'bg-stone-50 text-stone-500'
                    }`}>
                      {exc.estado === 'disponible' ? 'Disponible' : exc.estado === 'reservado' ? 'Reservado' : 'Entregado'}
                    </span>
                  </div>

                  <h4 className="font-semibold text-stone-800 mb-1">{exc.comercio}</h4>
                  <p className="text-sm text-stone-400 italic mb-4 line-clamp-2">"{exc.descripcionOriginal}"</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <Package className="w-3.5 h-3.5 text-stone-300" />
                      {exc.cantidad}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <Clock className="w-3.5 h-3.5 text-stone-300" />
                      Vence en {exc.vencimientoEstimado}
                    </div>
                  </div>

                  {exc.estado === 'disponible' && (
                    <button
                      onClick={() => generarMensaje(exc)}
                      className="w-full flex items-center justify-center gap-2 bg-[#faf9f7] hover:bg-[#f5f3ef] text-stone-600 border border-stone-200 py-2.5 rounded-xl text-sm font-medium transition-all group-hover:border-[#c8d5c3] group-hover:text-[#5a7a54]"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Generar mensaje WhatsApp
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filtrados.length === 0 && (
          <div className="text-center py-16 text-stone-400">
            <Package className="w-10 h-10 mx-auto mb-3 text-stone-200" />
            <p>No hay excedentes en esta categoría.</p>
          </div>
        )}

        {/* Modal */}
        {mensajePreview && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setMensajePreview(null)}>
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#5a7a54]/10 flex items-center justify-center">
                    <Send className="w-4 h-4 text-[#5a7a54]" />
                  </div>
                  <span className="font-semibold text-stone-800">Mensaje para WhatsApp</span>
                </div>
                <button onClick={() => setMensajePreview(null)} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
                  <X className="w-4 h-4 text-stone-400" />
                </button>
              </div>
              <div className="p-5">
                <div className="bg-stone-50 rounded-xl p-3.5 mb-4 border border-stone-100">
                  <div className="text-[10px] uppercase tracking-wider text-stone-400 font-medium mb-1">Dirigido a</div>
                  <div className="font-semibold text-stone-800 text-sm">{mensajePreview.comedor.nombre}</div>
                  <div className="text-xs text-stone-400">{mensajePreview.comedor.telefono}</div>
                </div>
                <div className="bg-[#f5f8f4] border border-[#e4ede2] rounded-xl p-4 whitespace-pre-wrap text-sm text-stone-700 leading-relaxed">
                  {mensajePreview.mensaje}
                </div>
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => setMensajePreview({ ...mensajePreview, enviado: true })}
                    className="flex-1 bg-[#5a7a54] hover:bg-[#4d6a48] text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    {mensajePreview.enviado ? <><CheckCircle2 className="w-4 h-4" /> Enviado</> : <><Send className="w-4 h-4" /> Simular envío</>}
                  </button>
                  <button onClick={() => setMensajePreview(null)} className="px-5 py-3 border border-stone-200 rounded-xl text-stone-500 hover:bg-stone-50 transition-all text-sm font-medium">
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Comedores ───────────────────────────────────────────
function ComedoresSection() {
  return (
    <section className="py-16 md:py-20 min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-[#5a7a54] text-sm font-medium mb-3">
            <UtensilsCrossed className="w-4 h-4" />
            Comedores
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-stone-800 tracking-tight mb-2">Comedores comunitarios</h3>
          <p className="text-stone-400">Organizaciones de Villa Regina que reciben las donaciones</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {comedoresMock.map((comedor) => {
            const pct = Math.round((comedor.personasAtendidas / comedor.capacidad) * 100);
            return (
              <div key={comedor.id} className="bg-[#faf9f7] rounded-2xl p-6 border border-stone-100 hover:border-stone-200 hover:shadow-lg hover:shadow-stone-100/50 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0">
                    <UtensilsCrossed className="w-5 h-5 text-[#c47d5a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-stone-800 text-lg">{comedor.nombre}</h4>
                    <div className="flex items-center gap-1.5 text-sm text-stone-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {comedor.direccion}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-stone-400 mt-0.5">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      {comedor.telefono}
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-stone-500">Ocupación</span>
                        <span className="font-semibold text-stone-700">{comedor.personasAtendidas} / {comedor.capacidad}</span>
                      </div>
                      <div className="w-full bg-stone-200/60 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#c47d5a] to-[#d4a574] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-stone-400 mt-1.5">{pct}% de capacidad utilizada</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── IA Section ──────────────────────────────────────────
function IASection() {
  const [texto, setTexto] = useState('');
  const [resultado, setResultado] = useState<{ categoria: string; cantidad: string; vencimientoEstimado: string } | null>(null);
  const [cargando, setCargando] = useState(false);

  const ejemplos = [
    'Me sobran 30 facturas y 2 kilos de pan del día',
    'Tengo 5 kg de tomate y 3 kg de zanahoria que no vendí',
    'Quedan 10 litros de leche que vencen mañana',
    'Me quedaron 4 docenas de medialunas y un kilo de galletas',
  ];

  const probar = (t: string) => {
    setTexto(t);
    setCargando(true);
    setResultado(null);
    setTimeout(() => { setResultado(procesarConIA(t)); setCargando(false); }, 1200);
  };

  return (
    <section className="py-16 md:py-20 min-h-screen bg-[#faf9f7]">
      <div className="max-w-5xl mx-auto px-5 md:px-8">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-[#5a7a54] text-sm font-medium mb-3">
            <Bot className="w-4 h-4" />
            Inteligencia Artificial
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-stone-800 tracking-tight mb-2">Probá Qwen en vivo</h3>
          <p className="text-stone-400">Mirá cómo la IA procesa texto libre y genera datos estructurados.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#5a7a54]/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#5a7a54]" />
              </div>
              <h4 className="font-semibold text-stone-800">Texto del comerciante</h4>
            </div>

            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribí o seleccioná un ejemplo..."
              rows={4}
              className="w-full px-4 py-3 bg-[#faf9f7] border border-stone-200 rounded-xl focus:border-[#5a7a54] focus:ring-2 focus:ring-[#5a7a54]/10 transition-all outline-none resize-none text-stone-800 placeholder:text-stone-300 mb-4"
            />

            <button
              onClick={() => probar(texto)}
              disabled={!texto.trim() || cargando}
              className="w-full bg-[#5a7a54] hover:bg-[#4d6a48] disabled:bg-stone-200 disabled:text-stone-400 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm"
            >
              {cargando ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Procesando...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Procesar con Qwen</>
              )}
            </button>

            <div className="mt-5">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2.5">Ejemplos</p>
              <div className="flex flex-wrap gap-2">
                {ejemplos.map((ej, i) => (
                  <button
                    key={i}
                    onClick={() => probar(ej)}
                    className="text-xs bg-white hover:bg-[#f5f8f4] text-stone-600 px-3 py-1.5 rounded-lg border border-stone-200 hover:border-[#c8d5c3] transition-all"
                  >
                    {ej.length > 40 ? ej.substring(0, 40) + '...' : ej}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#5a7a54]/10 flex items-center justify-center">
                <Database className="w-4 h-4 text-[#5a7a54]" />
              </div>
              <h4 className="font-semibold text-stone-800">Resultado estructurado</h4>
            </div>

            {resultado ? (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-[#f5f8f4] rounded-xl p-4 border border-[#e4ede2] space-y-3">
                  {[
                    { icon: Tag, label: 'Categoría', value: resultado.categoria },
                    { icon: Package, label: 'Cantidad', value: resultado.cantidad },
                    { icon: Clock, label: 'Vencimiento', value: resultado.vencimientoEstimado },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-[#8faa88] shrink-0" />
                      <span className="text-xs text-stone-400 w-24">{item.label}</span>
                      <span className="text-sm font-semibold text-stone-800">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                  <div className="text-[10px] uppercase tracking-wider text-stone-400 font-medium mb-2">JSON generado</div>
                  <pre className="text-xs text-stone-600 overflow-x-auto font-mono leading-relaxed">
{JSON.stringify({
  categoria: resultado.categoria,
  cantidad: resultado.cantidad,
  vencimiento_estimado: resultado.vencimientoEstimado,
  modelo: "qwen-nlp-v1",
  timestamp: new Date().toISOString()
}, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-52 text-stone-300">
                <Bot className="w-8 h-8 mb-2" />
                <p className="text-sm">Los resultados aparecerán aquí</p>
              </div>
            )}
          </div>
        </div>

        {/* Arquitectura */}
        <div className="mt-12 bg-white rounded-2xl border border-stone-100 p-6 md:p-8 shadow-sm">
          <h4 className="font-bold text-stone-800 text-xl mb-6">Arquitectura técnica</h4>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Server, title: 'Frontend', items: ['React + TypeScript', 'Tailwind CSS', 'Responsive design', 'Accesible'], color: 'bg-sky-50 border-sky-100 text-sky-700' },
              { icon: Brain, title: 'IA — Qwen NLP', items: ['Procesamiento de lenguaje', 'Extracción de entidades', 'Clasificación automática', 'Generación de mensajes'], color: 'bg-violet-50 border-violet-100 text-violet-700' },
              { icon: Database, title: 'Backend', items: ['Python / PHP', 'PostgreSQL', 'API REST', 'WhatsApp Business API'], color: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
            ].map((block, i) => (
              <div key={i} className={`rounded-xl p-5 border ${block.color}`}>
                <block.icon className="w-6 h-6 mb-3 opacity-70" />
                <h5 className="font-semibold mb-3">{block.title}</h5>
                <ul className="space-y-1.5">
                  {block.items.map((item, j) => (
                    <li key={j} className="text-sm flex items-center gap-2 opacity-80">
                      <CircleDot className="w-3 h-3 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-stone-900 text-white">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5a7a54] to-[#8faa88] flex items-center justify-center">
                <HeartHandshake className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">Red Solidaria</span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">Vinculación de Alimentos — Villa Regina, Río Negro, Argentina.</p>
          </div>
          <div>
            <h5 className="font-semibold text-sm mb-3 text-stone-300 uppercase tracking-wider">Tecnología</h5>
            <ul className="text-sm text-stone-400 space-y-2">
              <li className="flex items-center gap-2"><Bot className="w-3.5 h-3.5" /> IA Qwen para NLP</li>
              <li className="flex items-center gap-2"><Server className="w-3.5 h-3.5" /> Python / PHP Backend</li>
              <li className="flex items-center gap-2"><Database className="w-3.5 h-3.5" /> PostgreSQL</li>
              <li className="flex items-center gap-2"><Wifi className="w-3.5 h-3.5" /> WhatsApp Business API</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-sm mb-3 text-stone-300 uppercase tracking-wider">Contacto</h5>
            <ul className="text-sm text-stone-400 space-y-2">
              <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Villa Regina, Río Negro</li>
              <li className="flex items-center gap-2"><Send className="w-3.5 h-3.5" /> redsolidaria@ejemplo.org</li>
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> +54 294 455-0000</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-stone-800 text-center text-xs text-stone-500">
          © 2026 Red Solidaria de Vinculación de Alimentos
        </div>
      </div>
    </footer>
  );
}

// ─── App ─────────────────────────────────────────────────
export default function App() {
  const [activeSection, setActiveSection] = useState('inicio');
  const [excedentes, setExcedentes] = useState<Excedente[]>(excedentesIniciales);

  const handlePublicar = (nuevo: Excedente) => {
    setExcedentes([nuevo, ...excedentes]);
  };

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [activeSection]);

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />

      {activeSection === 'inicio' && (
        <>
          <HeroSection setActiveSection={setActiveSection} />
          <ComoFunciona />
          {/* Últimos excedentes */}
          <section className="py-16 md:py-20 bg-[#faf9f7]">
            <div className="max-w-6xl mx-auto px-5 md:px-8">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-stone-800 tracking-tight">Últimas publicaciones</h3>
                  <p className="text-stone-400 mt-1">Excedentes recién publicados por comercios locales</p>
                </div>
                <button
                  onClick={() => setActiveSection('disponibles')}
                  className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-[#5a7a54] hover:text-[#4d6a48] transition-colors"
                >
                  Ver todos
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                {excedentes.slice(0, 3).map((exc) => {
                  const catConf = categoriaConfig[exc.categoria] || categoriaConfig['Varios'];
                  return (
                    <div key={exc.id} className="bg-white rounded-2xl p-5 border border-stone-100 hover:border-stone-200 hover:shadow-lg hover:shadow-stone-100/50 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-center">
                          <Store className="w-4 h-4 text-stone-400" />
                        </div>
                        <span className="font-medium text-stone-700 text-sm">{exc.comercio}</span>
                      </div>
                      <p className="text-sm text-stone-400 italic mb-3 line-clamp-2">"{exc.descripcionOriginal}"</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${catConf.bg} ${catConf.color}`}>
                          {exc.categoria}
                        </span>
                        <span className="text-xs text-stone-400">{exc.cantidad}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-center mt-8 sm:hidden">
                <button onClick={() => setActiveSection('disponibles')} className="text-sm font-medium text-[#5a7a54]">
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
