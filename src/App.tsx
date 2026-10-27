import { useState, useEffect } from 'react';
import {
  HeartHandshake, Leaf, Package, UtensilsCrossed, Bot, Menu, X,
  ArrowRight, MapPin, Phone, Clock, Tag, CheckCircle2,
  Send, ChevronRight, Sparkles, Store, Users, Recycle,
  TrendingUp, MessageCircle, FileText, Brain, Database,
  Server, Wifi, CircleDot, Play, Mail, Lock, User,
  Eye, EyeOff, ArrowLeft, Building2, Truck, Globe
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

interface Usuario {
  nombre: string;
  email: string;
  avatar?: string;
  proveedor: 'google' | 'email';
}

interface Comercio {
  nombre: string;
  tipo: string;
  direccion: string;
  telefono: string;
  descripcion: string;
  horarioRetiro: string;
}

type AuthScreen = 'login' | 'register' | 'onboarding';

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

const tiposComercio = [
  'Panadería', 'Verdulería', 'Frutería', 'Almacén', 'Carnicería',
  'Lácteos', 'Restaurante', 'Comedor comunitario', 'Otro'
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

// ─── Google Icon ─────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ─── Auth Screen (Login / Register) ─────────────────────
function AuthScreenComponent({ onLogin }: { onLogin: (user: Usuario) => void }) {
  const [screen, setScreen] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Completá todos los campos');
      return;
    }
    if (screen === 'register' && !form.nombre) {
      setError('Ingresá tu nombre');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      onLogin({
        nombre: form.nombre || form.email.split('@')[0],
        email: form.email,
        proveedor: 'email'
      });
    }, 1200);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      onLogin({
        nombre: 'Usuario Google',
        email: 'usuario@gmail.com',
        proveedor: 'google'
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] flex">
      {/* Left: Decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#5a7a54] to-[#3d5438]">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <HeartHandshake className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-semibold text-lg">Red Solidaria</span>
            </div>
            <p className="text-white/60 text-sm">Vinculación de Alimentos · Villa Regina</p>
          </div>

          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Conectamos comercios con{' '}
              <span className="font-serif italic text-white/90">quienes más lo necesitan</span>
            </h2>
            <p className="text-white/70 text-lg leading-relaxed max-w-md">
              Publicá tus excedentes de forma simple. La inteligencia artificial se encarga de clasificarlos y notificar a los comedores cercanos.
            </p>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-9 h-9 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-white/80" />
                  </div>
                ))}
              </div>
              <div>
                <div className="text-white font-semibold text-sm">+12 comercios activos</div>
                <div className="text-white/60 text-xs">en Villa Regina</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-white/50 text-xs">
            <span>Impulsado por IA Qwen</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>Impacto social positivo</span>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5a7a54] to-[#8faa88] flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-stone-800">Red Solidaria</div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">Villa Regina</div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-stone-800 tracking-tight">
              {screen === 'login' ? 'Iniciá sesión' : 'Creá tu cuenta'}
            </h3>
            <p className="text-stone-400 mt-2">
              {screen === 'login' 
                ? 'Ingresá para acceder a la plataforma' 
                : 'Unite a la red solidaria de Villa Regina'}
            </p>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-300 text-stone-700 py-3.5 rounded-xl font-medium transition-all shadow-sm disabled:opacity-60"
          >
            <GoogleIcon />
            Continuar con Google
          </button>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-xs text-stone-400 font-medium uppercase tracking-wider">o con email</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {screen === 'register' && (
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">Nombre completo</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => setForm({...form, nombre: e.target.value})}
                    placeholder="Tu nombre"
                    className="w-full pl-10 pr-4 py-3 bg-[#faf9f7] border border-stone-200 rounded-xl focus:border-[#5a7a54] focus:ring-2 focus:ring-[#5a7a54]/10 transition-all outline-none text-stone-800 placeholder:text-stone-300 text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#faf9f7] border border-stone-200 rounded-xl focus:border-[#5a7a54] focus:ring-2 focus:ring-[#5a7a54]/10 transition-all outline-none text-stone-800 placeholder:text-stone-300 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-[#faf9f7] border border-stone-200 rounded-xl focus:border-[#5a7a54] focus:ring-2 focus:ring-[#5a7a54]/10 transition-all outline-none text-stone-800 placeholder:text-stone-300 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5a7a54] hover:bg-[#4d6a48] disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-sm mt-6"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Procesando...</>
              ) : (
                <>{screen === 'login' ? 'Iniciar sesión' : 'Crear cuenta'} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-stone-400 mt-6">
            {screen === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
            <button
              onClick={() => { setScreen(screen === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-[#5a7a54] font-medium hover:underline"
            >
              {screen === 'login' ? 'Registrate' : 'Iniciá sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Onboarding Screen ───────────────────────────────────
function OnboardingScreen({ usuario, onComplete }: { usuario: Usuario; onComplete: (comercio: Comercio) => void }) {
  const [step, setStep] = useState(1);
  const [comercio, setComercio] = useState<Comercio>({
    nombre: '',
    tipo: '',
    direccion: '',
    telefono: '',
    descripcion: '',
    horarioRetiro: ''
  });
  const [loading, setLoading] = useState(false);

  const totalSteps = 3;
  const canNext = () => {
    if (step === 1) return comercio.nombre && comercio.tipo;
    if (step === 2) return comercio.direccion && comercio.telefono;
    return true;
  };

  const handleFinish = () => {
    setLoading(true);
    setTimeout(() => onComplete(comercio), 1000);
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-stone-500">Paso {step} de {totalSteps}</span>
            <span className="text-sm text-stone-400">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#5a7a54] to-[#8faa88] rounded-full transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 md:p-8 animate-fade-in">
          {step === 1 && (
            <div className="animate-fade-in-up">
              <div className="w-12 h-12 rounded-xl bg-[#5a7a54]/10 flex items-center justify-center mb-5">
                <Building2 className="w-6 h-6 text-[#5a7a54]" />
              </div>
              <h3 className="text-2xl font-bold text-stone-800 tracking-tight mb-2">Contanos sobre tu comercio</h3>
              <p className="text-stone-400 text-sm mb-6">Esto nos ayuda a conectar con la organización correcta.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">Nombre del comercio u organización</label>
                  <input
                    type="text"
                    value={comercio.nombre}
                    onChange={(e) => setComercio({...comercio, nombre: e.target.value})}
                    placeholder="Ej: Panadería La Espiga Dorada"
                    className="w-full px-4 py-3 bg-[#faf9f7] border border-stone-200 rounded-xl focus:border-[#5a7a54] focus:ring-2 focus:ring-[#5a7a54]/10 transition-all outline-none text-stone-800 placeholder:text-stone-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">Tipo de organización</label>
                  <div className="grid grid-cols-3 gap-2">
                    {tiposComercio.map((tipo) => (
                      <button
                        key={tipo}
                        onClick={() => setComercio({...comercio, tipo})}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                          comercio.tipo === tipo
                            ? 'bg-[#5a7a54] text-white border-[#5a7a54] shadow-sm'
                            : 'bg-[#faf9f7] text-stone-600 border-stone-200 hover:border-[#c8d5c3]'
                        }`}
                      >
                        {tipo}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in-up">
              <div className="w-12 h-12 rounded-xl bg-[#5a7a54]/10 flex items-center justify-center mb-5">
                <MapPin className="w-6 h-6 text-[#5a7a54]" />
              </div>
              <h3 className="text-2xl font-bold text-stone-800 tracking-tight mb-2">Ubicación y contacto</h3>
              <p className="text-stone-400 text-sm mb-6">Para que los comedores puedan retirarlo fácilmente.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">Dirección</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                    <input
                      type="text"
                      value={comercio.direccion}
                      onChange={(e) => setComercio({...comercio, direccion: e.target.value})}
                      placeholder="Av. San Martín 123, Villa Regina"
                      className="w-full pl-10 pr-4 py-3 bg-[#faf9f7] border border-stone-200 rounded-xl focus:border-[#5a7a54] focus:ring-2 focus:ring-[#5a7a54]/10 transition-all outline-none text-stone-800 placeholder:text-stone-300 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">Teléfono de contacto</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                    <input
                      type="tel"
                      value={comercio.telefono}
                      onChange={(e) => setComercio({...comercio, telefono: e.target.value})}
                      placeholder="+54 294 455-0000"
                      className="w-full pl-10 pr-4 py-3 bg-[#faf9f7] border border-stone-200 rounded-xl focus:border-[#5a7a54] focus:ring-2 focus:ring-[#5a7a54]/10 transition-all outline-none text-stone-800 placeholder:text-stone-300 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">Horario de retiro</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                    <input
                      type="text"
                      value={comercio.horarioRetiro}
                      onChange={(e) => setComercio({...comercio, horarioRetiro: e.target.value})}
                      placeholder="Ej: Lunes a viernes, 18 a 20hs"
                      className="w-full pl-10 pr-4 py-3 bg-[#faf9f7] border border-stone-200 rounded-xl focus:border-[#5a7a54] focus:ring-2 focus:ring-[#5a7a54]/10 transition-all outline-none text-stone-800 placeholder:text-stone-300 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in-up">
              <div className="w-12 h-12 rounded-xl bg-[#5a7a54]/10 flex items-center justify-center mb-5">
                <FileText className="w-6 h-6 text-[#5a7a54]" />
              </div>
              <h3 className="text-2xl font-bold text-stone-800 tracking-tight mb-2">Último paso</h3>
              <p className="text-stone-400 text-sm mb-6">Contanos brevemente sobre tu actividad.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">Descripción (opcional)</label>
                  <textarea
                    value={comercio.descripcion}
                    onChange={(e) => setComercio({...comercio, descripcion: e.target.value})}
                    placeholder="Ej: Somos una panadería familiar que trabaja hace 20 años en el barrio..."
                    rows={4}
                    className="w-full px-4 py-3 bg-[#faf9f7] border border-stone-200 rounded-xl focus:border-[#5a7a54] focus:ring-2 focus:ring-[#5a7a54]/10 transition-all outline-none resize-none text-stone-800 placeholder:text-stone-300 text-sm"
                  />
                </div>

                {/* Summary */}
                <div className="bg-[#f5f8f4] rounded-xl p-4 border border-[#e4ede2]">
                  <div className="text-xs font-medium text-[#5a7a54] uppercase tracking-wider mb-3">Resumen</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-stone-600">
                      <Building2 className="w-3.5 h-3.5 text-stone-400" />
                      <span className="font-medium">{comercio.nombre || '—'}</span>
                      <span className="text-stone-400">· {comercio.tipo || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-600">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      {comercio.direccion || '—'}
                    </div>
                    <div className="flex items-center gap-2 text-stone-600">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      {comercio.telefono || '—'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-100">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Atrás
              </button>
            ) : <div />}

            {step < totalSteps ? (
              <button
                onClick={() => canNext() && setStep(step + 1)}
                disabled={!canNext()}
                className="flex items-center gap-2 bg-[#5a7a54] hover:bg-[#4d6a48] disabled:bg-stone-200 disabled:text-stone-400 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm"
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={loading}
                className="flex items-center gap-2 bg-[#5a7a54] hover:bg-[#4d6a48] disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creando perfil...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Finalizar</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* User info */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-stone-400">
          <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center">
            <User className="w-3 h-3 text-stone-400" />
          </div>
          <span>{usuario.email}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Header (authenticated) ──────────────────────────────
function Header({ activeSection, setActiveSection, usuario, comercio, onLogout }: {
  activeSection: string;
  setActiveSection: (s: string) => void;
  usuario: Usuario;
  comercio: Comercio;
  onLogout: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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

          {/* User menu */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl hover:bg-stone-100 transition-colors"
              >
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-semibold text-stone-700 leading-tight">{comercio.nombre}</div>
                  <div className="text-[10px] text-stone-400">{comercio.tipo}</div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5a7a54] to-[#8faa88] flex items-center justify-center text-white text-xs font-bold">
                  {comercio.nombre.charAt(0).toUpperCase()}
                </div>
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-100 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-stone-100">
                      <div className="font-semibold text-stone-800 text-sm">{usuario.nombre}</div>
                      <div className="text-xs text-stone-400">{usuario.email}</div>
                      <div className="mt-2 inline-flex items-center gap-1.5 bg-[#f5f8f4] px-2 py-0.5 rounded-md text-[10px] font-medium text-[#5a7a54] border border-[#e4ede2]">
                        {usuario.proveedor === 'google' ? <Globe className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                        {usuario.proveedor === 'google' ? 'Google' : 'Email'}
                      </div>
                    </div>
                    <div className="px-4 py-3 border-b border-stone-100">
                      <div className="text-[10px] uppercase tracking-wider text-stone-400 font-medium mb-1.5">Mi comercio</div>
                      <div className="flex items-center gap-2 text-sm text-stone-700">
                        <Store className="w-3.5 h-3.5 text-stone-400" />
                        {comercio.nombre}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-400 mt-1">
                        <MapPin className="w-3 h-3" />
                        {comercio.direccion}
                      </div>
                    </div>
                    <button
                      onClick={() => { onLogout(); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>

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
function HeroSection({ setActiveSection, comercio }: { setActiveSection: (s: string) => void; comercio: Comercio }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#faf9f7] via-[#f5f3ef] to-[#eef2ec]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#c8d5c3]/30 to-transparent rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#e8d5c4]/20 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, #5a7a54 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-16 md:pt-24 pb-16 md:pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-white/80 border border-[#c8d5c3] px-3.5 py-1.5 rounded-full text-xs font-medium text-[#5a7a54] mb-6 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5a7a54] animate-pulse" />
                Hola, {comercio.nombre}
              </div>
            </div>

            <h2 className="animate-fade-in-up text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight text-stone-800 mb-6">
              Menos desperdicio,{' '}
              <span className="font-serif italic text-gradient font-medium">más comunidad</span>
            </h2>

            <p className="animate-fade-in-delay text-lg text-stone-500 leading-relaxed mb-8 max-w-lg">
              Desde tu comercio podés publicar excedentes y conectar con comedores comunitarios de Villa Regina. La IA organiza todo por vos.
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

          <div className="animate-fade-in-delay-3 hidden lg:block">
            <div className="relative">
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

        {/* Stats */}
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
    { icon: FileText, title: 'Publicás en texto libre', desc: 'Escribís qué alimentos te sobraron, sin formularios complicados.' },
    { icon: Brain, title: 'La IA estructura', desc: 'Qwen analiza el texto, identifica categoría, cantidad y vencimiento.' },
    { icon: MessageCircle, title: 'Se notifican comedores', desc: 'Se genera un mensaje empático y personalizado por WhatsApp.' },
    { icon: HeartHandshake, title: 'Se realiza la entrega', desc: 'El comedor retira los alimentos y los distribuye.' },
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
function PublicarExcedente({ onPublicar, comercioNombre }: { onPublicar: (e: Excedente) => void; comercioNombre: string }) {
  const [textoLibre, setTextoLibre] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [resultadoIA, setResultadoIA] = useState<{ categoria: string; cantidad: string; vencimientoEstimado: string } | null>(null);
  const [confirmado, setConfirmado] = useState(false);

  const procesar = () => {
    if (!textoLibre.trim()) return;
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
      comercio: comercioNombre,
      descripcionOriginal: textoLibre,
      categoria: resultadoIA.categoria,
      cantidad: resultadoIA.cantidad,
      vencimientoEstimado: resultadoIA.vencimientoEstimado,
      fechaPublicacion: new Date().toISOString().split('T')[0],
      estado: 'disponible',
    });
    setConfirmado(true);
    setTimeout(() => { setTextoLibre(''); setResultadoIA(null); setConfirmado(false); }, 3000);
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
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-stone-100">
            <div className="w-10 h-10 rounded-xl bg-[#5a7a54]/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-[#5a7a54]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-stone-800">{comercioNombre}</div>
              <div className="text-xs text-stone-400">Publicando como tu comercio</div>
            </div>
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
            disabled={!textoLibre.trim() || procesando}
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
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [comercio, setComercio] = useState<Comercio | null>(null);
  const [activeSection, setActiveSection] = useState('inicio');
  const [excedentes, setExcedentes] = useState<Excedente[]>(excedentesIniciales);

  const handleLogin = (user: Usuario) => {
    setUsuario(user);
  };

  const handleOnboardingComplete = (comercioData: Comercio) => {
    setComercio(comercioData);
  };

  const handleLogout = () => {
    setUsuario(null);
    setComercio(null);
    setActiveSection('inicio');
  };

  const handlePublicar = (nuevo: Excedente) => {
    setExcedentes([nuevo, ...excedentes]);
  };

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [activeSection]);

  // No autenticado → pantalla de login
  if (!usuario) {
    return <AuthScreenComponent onLogin={handleLogin} />;
  }

  // Autenticado pero sin comercio → onboarding
  if (!comercio) {
    return <OnboardingScreen usuario={usuario} onComplete={handleOnboardingComplete} />;
  }

  // Todo completo → app
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Header
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        usuario={usuario}
        comercio={comercio}
        onLogout={handleLogout}
      />

      {activeSection === 'inicio' && (
        <>
          <HeroSection setActiveSection={setActiveSection} comercio={comercio} />
          <ComoFunciona />
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
            </div>
          </section>
        </>
      )}

      {activeSection === 'publicar' && <PublicarExcedente onPublicar={handlePublicar} comercioNombre={comercio.nombre} />}
      {activeSection === 'disponibles' && <ExcedentesDisponibles excedentes={excedentes} />}
      {activeSection === 'comedores' && <ComedoresSection />}
      {activeSection === 'ia' && <IASection />}

      <Footer />
    </div>
  );
}
