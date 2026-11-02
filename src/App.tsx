import { useState, useEffect } from 'react';
import {
  HeartHandshake, Leaf, Package, UtensilsCrossed, Bot, Menu, X,
  ArrowRight, MapPin, Phone, Clock, Tag, CheckCircle2,
  Send, ChevronRight, Sparkles, Store, Users, Recycle,
  TrendingUp, MessageCircle, FileText, Brain, Database,
  Server, Wifi, CircleDot, Play, Mail, Lock, User,
  Eye, EyeOff, ArrowLeft, Building2, Truck, Globe, Navigation, AlertCircle,
  Save, Image, Calendar
} from 'lucide-react';
import {
  isFirebaseConfigured,
  loginConGoogle,
  loginConEmail,
  registrarConEmail,
  logout as firebaseLogout,
  observarAuth,
  guardarComercio,
  obtenerComercio,
  type Usuario,
  type Comercio
} from './firebase';
import {
  crearPublicacion,
  crearNotificacion,
  obtenerPublicacionesUsuario,
  obtenerNotificacionesUsuario,
  obtenerComedores,
  obtenerEstadisticasUsuario,
  type Publicacion,
  type Comedor as ComedorDB,
  type Notificacion
} from './services';
import AddressPicker from './components/AddressPicker';
import SchedulePicker from './components/SchedulePicker';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MisPublicaciones from './components/MisPublicaciones';
import ComedoresModule from './components/Comedores';
import MiImpacto from './components/MiImpacto';
import Notificaciones from './components/Notificaciones';
import Perfil from './components/Perfil';
import Configuracion from './components/Configuracion';
import PublicacionesDisponibles from './components/PublicacionesDisponibles';
import MisReservas from './components/MisReservas';
import Chat from './components/Chat';
import { ThemeProvider } from './ThemeContext';

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
  'Lácteos', 'Restaurante', 'Otro'
];

const tiposComedor = [
  'Comedor comunitario', 'Merendero', 'Iglesia', 'ONG', 'Fundación', 'Otro'
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

// ─── Landing / Splash Screen ─────────────────────────────
function LandingScreen({ onNavigate, usuarioLogueado }: { 
  onNavigate: (screen: 'login' | 'register') => void;
  usuarioLogueado?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#faf9f7] flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#c8d5c3]/25 to-transparent rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#e8d5c4]/20 to-transparent rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-gradient-to-br from-[#8faa88]/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: 'radial-gradient(circle, #5a7a54 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        {/* Logo grande flotante */}
        <div className="animate-fade-in-up mb-10">
          <div className="relative group cursor-pointer">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#5a7a54]/30 to-[#8faa88]/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 scale-110" />
            
            {/* Logo container */}
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-[#5a7a54] via-[#6d8f66] to-[#8faa88] flex items-center justify-center shadow-2xl shadow-[#5a7a54]/20 group-hover:shadow-[#5a7a54]/40 transition-all duration-500 animate-float group-hover:scale-105 group-hover:-rotate-2">
              {/* Inner shine */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent opacity-60" />
              
              {/* Icon */}
              <HeartHandshake className="w-16 h-16 md:w-20 md:h-20 text-white relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
            </div>

            {/* Floating particles */}
            <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-[#c8d5c3] opacity-60 animate-float" style={{ animationDelay: '0.5s' }} />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-[#e8d5c4] opacity-60 animate-float" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 -right-5 w-3 h-3 rounded-full bg-[#8faa88] opacity-40 animate-float" style={{ animationDelay: '1.5s' }} />
          </div>
        </div>

        {/* Text content */}
        <div className="text-center max-w-lg animate-fade-in-delay">
          <h1 className="text-4xl md:text-5xl font-bold text-stone-800 tracking-tight mb-4 leading-tight">
            Red Solidaria
          </h1>
          <p className="text-lg md:text-xl text-stone-500 mb-2 font-medium">
            Vinculación de Alimentos
          </p>
          <p className="text-sm text-stone-400 uppercase tracking-widest mb-8">
            Villa Regina · Río Negro
          </p>
          <p className="text-base md:text-lg text-stone-500 leading-relaxed max-w-md mx-auto">
            Conectamos los excedentes de comercios locales con comedores comunitarios. 
            La inteligencia artificial organiza, clasifica y notifica de forma automática.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-10 mb-12 animate-fade-in-delay-2">
          {[
            { icon: Bot, text: 'IA Qwen integrada' },
            { icon: MessageCircle, text: 'Notificaciones WhatsApp' },
            { icon: HeartHandshake, text: 'Impacto social' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-stone-200 px-4 py-2 rounded-full text-sm text-stone-600 shadow-sm">
              <item.icon className="w-4 h-4 text-[#5a7a54]" />
              {item.text}
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm animate-fade-in-delay-3">
          {usuarioLogueado ? (
            // Si ya está logueado pero falta el comercio, mostrar botón para continuar
            <button
              onClick={() => onNavigate('login')}
              className="flex-1 flex items-center justify-center gap-2 bg-[#5a7a54] hover:bg-[#4d6a48] text-white px-7 py-4 rounded-xl font-semibold text-base shadow-lg shadow-[#5a7a54]/20 hover:shadow-xl hover:shadow-[#5a7a54]/30 transition-all duration-300 group"
            >
              Completar perfil
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            // Si no está logueado, mostrar botones de login/registro
            <>
              <button
                onClick={() => onNavigate('login')}
                className="flex-1 flex items-center justify-center gap-2 bg-[#5a7a54] hover:bg-[#4d6a48] text-white px-7 py-4 rounded-xl font-semibold text-base shadow-lg shadow-[#5a7a54]/20 hover:shadow-xl hover:shadow-[#5a7a54]/30 transition-all duration-300 group"
              >
                Iniciar sesión
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-700 px-7 py-4 rounded-xl font-semibold text-base border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300"
              >
                Crear cuenta
              </button>
            </>
          )}
        </div>

        {/* Footer note */}
        <p className="mt-12 text-xs text-stone-400 text-center animate-fade-in-delay-3">
          Proyecto con impacto social positivo · Impulsado por IA
        </p>
      </div>
    </div>
  );
}

// ─── Auth Screen (Login / Register) ─────────────────────
function AuthScreenComponent({ onLogin, initialScreen = 'login', onBack }: { 
  onLogin: (user: Usuario) => void; 
  initialScreen?: 'login' | 'register';
  onBack?: () => void;
}) {
  const [screen, setScreen] = useState<'login' | 'register'>(initialScreen);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
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
    if (screen === 'register' && form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      let user: Usuario;
      if (screen === 'login') {
        user = await loginConEmail(form.email, form.password);
      } else {
        user = await registrarConEmail(form.nombre, form.email, form.password);
      }
      onLogin(user);
    } catch (err: any) {
      console.error(err);
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Email o contraseña incorrectos');
      } else if (code === 'auth/email-already-in-use') {
        setError('Este email ya está registrado');
      } else if (code === 'auth/weak-password') {
        setError('La contraseña es muy débil (mínimo 6 caracteres)');
      } else if (code === 'auth/invalid-email') {
        setError('Email inválido');
      } else if (!isFirebaseConfigured) {
        setError('Modo demo: completá todos los campos correctamente');
      } else {
        setError('Ocurrió un error. Intentá de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await loginConGoogle();
      onLogin(user);
    } catch (err: any) {
      console.error('Error completo de Google login:', err);
      const code = err?.code || '';
      const message = err?.message || '';
      
      if (code === 'auth/popup-closed-by-user') {
        setError('Cerraste la ventana de Google');
      } else if (code === 'auth/popup-blocked') {
        setError('El navegador bloqueó la ventana. Permití popups para este sitio.');
      } else if (code === 'auth/unauthorized-domain') {
        setError(`Dominio no autorizado. Agregá este dominio en Firebase Console → Authentication → Settings → Authorized domains. Dominio actual: ${window.location.hostname}`);
      } else if (code === 'auth/api-key-not-valid') {
        setError('API key inválida. Verificá la configuración de Firebase.');
      } else if (code === 'auth/network-request-failed') {
        setError('Error de red. Verificá tu conexión a internet.');
      } else if (code === 'auth/operation-not-allowed') {
        setError('Google no está habilitado. Andá a Firebase Console → Authentication → Sign-in method y habilitá Google.');
      } else {
        setError(`Error: ${code || message || 'Desconocido'}`);
      }
    } finally {
      setLoading(false);
    }
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
          {/* Back button */}
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm font-medium text-stone-400 hover:text-stone-600 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </button>
          )}

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

          {/* Modo demo indicator */}
          {!isFirebaseConfigured && (
            <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              <div className="flex items-start gap-2">
                <span className="text-amber-600 shrink-0">⚠️</span>
                <div>
                  <strong>Modo demo activo.</strong> La autenticación está simulada. Para activar login real con Google y base de datos, configurá Firebase en <code className="bg-amber-100 px-1 rounded">src/firebase.ts</code>.
                </div>
              </div>
            </div>
          )}
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
    tipoUsuario: 'comercio',
    direccion: '',
    lat: undefined,
    lng: undefined,
    telefono: '',
    descripcion: '',
    diasRetiro: [],
    horarioDesde: '',
    horarioHasta: '',
    capacidad: undefined,
    personasAtendidas: undefined
  });
  const [loading, setLoading] = useState(false);

  const totalSteps = 3;
  const canNext = () => {
    if (step === 1) return comercio.nombre && comercio.tipo && comercio.tipoUsuario;
    if (step === 2) {
      // Validación común para ambos
      const basicoValido = comercio.direccion && comercio.lat && comercio.lng && comercio.telefono;
      
      // Validación específica según tipo
      if (comercio.tipoUsuario === 'comercio') {
        return basicoValido && comercio.diasRetiro.length > 0 && comercio.horarioDesde && comercio.horarioHasta;
      } else {
        return basicoValido && comercio.capacidad && comercio.capacidad > 0;
      }
    }
    return true;
  };

  const handleFinish = () => {
    setLoading(true);
    setTimeout(() => onComplete(comercio), 1000);
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
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
              <h3 className="text-2xl font-bold text-stone-800 tracking-tight mb-2">Contanos sobre tu organización</h3>
              <p className="text-stone-400 text-sm mb-6">Esto nos ayuda a conectar con la organización correcta.</p>

              <div className="space-y-4">
                {/* Tipo de usuario */}
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-2">¿Qué tipo de organización sos?</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setComercio({...comercio, tipoUsuario: 'comercio'})}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        comercio.tipoUsuario === 'comercio'
                          ? 'border-[#5a7a54] bg-[#5a7a54]/5 dark:bg-[#4a5d49]/20'
                          : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
                      }`}
                    >
                      <div className="text-2xl mb-2">🏪</div>
                      <div className="font-semibold text-stone-800 dark:text-stone-100">Comercio</div>
                      <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        Panadería, verdulería, almacén, etc.
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setComercio({...comercio, tipoUsuario: 'comedor'})}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        comercio.tipoUsuario === 'comedor'
                          ? 'border-[#5a7a54] bg-[#5a7a54]/5 dark:bg-[#4a5d49]/20'
                          : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
                      }`}
                    >
                      <div className="text-2xl mb-2">🍽️</div>
                      <div className="font-semibold text-stone-800 dark:text-stone-100">Comedor</div>
                      <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        Comedor comunitario, merendero, etc.
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">Nombre de la organización</label>
                  <input
                    type="text"
                    value={comercio.nombre}
                    onChange={(e) => setComercio({...comercio, nombre: e.target.value})}
                    placeholder={comercio.tipoUsuario === 'comercio' ? "Ej: Panadería La Espiga Dorada" : "Ej: Comedor Manos Solidarias"}
                    className="w-full px-4 py-3 bg-[#faf9f7] border border-stone-200 rounded-xl focus:border-[#5a7a54] focus:ring-2 focus:ring-[#5a7a54]/10 transition-all outline-none text-stone-800 placeholder:text-stone-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">
                    {comercio.tipoUsuario === 'comercio' ? 'Tipo de comercio' : 'Tipo de organización'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(comercio.tipoUsuario === 'comercio' ? tiposComercio : tiposComedor).map((tipo) => (
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
              <h3 className="text-2xl font-bold text-stone-800 tracking-tight mb-2">
                {comercio.tipoUsuario === 'comercio' ? 'Ubicación y horarios de retiro' : 'Ubicación y capacidad'}
              </h3>
              <p className="text-stone-400 text-sm mb-6">
                {comercio.tipoUsuario === 'comercio' 
                  ? 'Para que los comedores sepan cuándo pueden pasar a retirar.'
                  : 'Para que sepamos cuántas personas pueden asistir.'}
              </p>

              <div className="space-y-6">
                {/* Dirección con mapa */}
                <AddressPicker
                  value={{ direccion: comercio.direccion, lat: comercio.lat, lng: comercio.lng }}
                  onChange={(addr) => setComercio({...comercio, direccion: addr.direccion, lat: addr.lat, lng: addr.lng})}
                />

                {/* Teléfono */}
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

                {/* Campos específicos según tipo de usuario */}
                {comercio.tipoUsuario === 'comercio' ? (
                  /* Horarios de retiro para comercios */
                  <SchedulePicker
                    value={{ 
                      dias: comercio.diasRetiro, 
                      horario: { desde: comercio.horarioDesde, hasta: comercio.horarioHasta }
                    }}
                    onChange={(sched) => setComercio({
                      ...comercio, 
                      diasRetiro: sched.dias,
                      horarioDesde: sched.horario.desde,
                      horarioHasta: sched.horario.hasta
                    })}
                  />
                ) : (
                  /* Capacidad para comedores */
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-1.5">
                        Capacidad máxima de personas
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                        <input
                          type="number"
                          value={comercio.capacidad || ''}
                          onChange={(e) => setComercio({...comercio, capacidad: parseInt(e.target.value) || undefined})}
                          placeholder="Ej: 100"
                          min="1"
                          className="w-full pl-10 pr-4 py-3 bg-[#faf9f7] border border-stone-200 rounded-xl focus:border-[#5a7a54] focus:ring-2 focus:ring-[#5a7a54]/10 transition-all outline-none text-stone-800 placeholder:text-stone-300 text-sm"
                        />
                      </div>
                      <p className="text-xs text-stone-400 mt-1">Cantidad máxima de personas que pueden asistir por día</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-1.5">
                        Personas atendidas por día (promedio)
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                        <input
                          type="number"
                          value={comercio.personasAtendidas || ''}
                          onChange={(e) => setComercio({...comercio, personasAtendidas: parseInt(e.target.value) || undefined})}
                          placeholder="Ej: 65"
                          min="0"
                          className="w-full pl-10 pr-4 py-3 bg-[#faf9f7] border border-stone-200 rounded-xl focus:border-[#5a7a54] focus:ring-2 focus:ring-[#5a7a54]/10 transition-all outline-none text-stone-800 placeholder:text-stone-300 text-sm"
                        />
                      </div>
                      <p className="text-xs text-stone-400 mt-1">Promedio diario de personas que asisten al comedor</p>
                    </div>
                  </div>
                )}
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
                    <div className="flex items-start gap-2 text-stone-600">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                      <div>
                        <div>{comercio.direccion || '—'}</div>
                        {comercio.lat && comercio.lng && (
                          <div className="text-xs text-stone-400 mt-0.5">
                            📍 Coordenadas validadas: {comercio.lat.toFixed(5)}, {comercio.lng.toFixed(5)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-stone-600">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      {comercio.telefono || '—'}
                    </div>
                    
                    {/* Información específica según tipo */}
                    {comercio.tipoUsuario === 'comercio' && comercio.diasRetiro.length > 0 && (
                      <div className="flex items-start gap-2 text-stone-600">
                        <Clock className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                        <span>
                          {comercio.diasRetiro.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')} · {comercio.horarioDesde} a {comercio.horarioHasta}
                        </span>
                      </div>
                    )}
                    
                    {comercio.tipoUsuario === 'comedor' && (
                      <>
                        {comercio.capacidad && (
                          <div className="flex items-center gap-2 text-stone-600">
                            <Users className="w-3.5 h-3.5 text-stone-400" />
                            <span>Capacidad: {comercio.capacidad} personas</span>
                          </div>
                        )}
                        {comercio.personasAtendidas && (
                          <div className="flex items-center gap-2 text-stone-600">
                            <Users className="w-3.5 h-3.5 text-stone-400" />
                            <span>Atienden: {comercio.personasAtendidas} personas/día</span>
                          </div>
                        )}
                      </>
                    )}
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
                      <div className="flex items-start gap-2 text-xs text-stone-400 mt-1">
                        <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                        <div>
                          <div>{comercio.direccion}</div>
                          {comercio.lat && comercio.lng && (
                            <a
                              href={`https://www.google.com/maps?q=${comercio.lat},${comercio.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#5a7a54] hover:underline inline-flex items-center gap-1 mt-0.5"
                            >
                              Ver en Google Maps
                              <Navigation className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
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
  const [resultadoEditado, setResultadoEditado] = useState<{ categoria: string; cantidad: string; vencimientoEstimado: string } | null>(null);
  const [confirmado, setConfirmado] = useState(false);
  const [error, setError] = useState('');
  const [programarPublicacion, setProgramarPublicacion] = useState(false);
  const [fechaProgramada, setFechaProgramada] = useState('');
  const [templates, setTemplates] = useState<Array<{ nombre: string; texto: string }>>([]);
  const [mostrarTemplates, setMostrarTemplates] = useState(false);
  const [fotos, setFotos] = useState<string[]>([]);
  const [guardarBorrador, setGuardarBorrador] = useState(false);

  const procesar = () => {
    setError('');
    if (!textoLibre.trim()) {
      setError('Por favor, describí qué alimentos te sobraron');
      return;
    }
    if (textoLibre.trim().length < 10) {
      setError('La descripción es muy corta. Intentá ser más específico/a');
      return;
    }
    
    setProcesando(true);
    setResultadoIA(null);
    setResultadoEditado(null);
    
    setTimeout(() => {
      const resultado = procesarConIA(textoLibre);
      setResultadoIA(resultado);
      setResultadoEditado(resultado);
      setProcesando(false);
    }, 1500);
  };

  const confirmarPublicacion = () => {
    if (!resultadoEditado) return;
    onPublicar({
      id: Date.now().toString(),
      comercio: comercioNombre,
      descripcionOriginal: textoLibre,
      categoria: resultadoEditado.categoria,
      cantidad: resultadoEditado.cantidad,
      vencimientoEstimado: resultadoEditado.vencimientoEstimado,
      fechaPublicacion: new Date().toISOString().split('T')[0],
      estado: 'disponible',
    });
    setConfirmado(true);
    setTimeout(() => { 
      setTextoLibre(''); 
      setResultadoIA(null); 
      setResultadoEditado(null);
      setConfirmado(false); 
      setError('');
    }, 3000);
  };

  const limpiar = () => {
    setTextoLibre('');
    setResultadoIA(null);
    setResultadoEditado(null);
    setError('');
    setProgramarPublicacion(false);
    setFechaProgramada('');
    setFotos([]);
    setGuardarBorrador(false);
  };

  // Guardar como template
  const guardarComoTemplate = () => {
    if (!textoLibre.trim()) return;
    const nombre = prompt('Nombre del template:');
    if (nombre) {
      setTemplates([...templates, { nombre, texto: textoLibre }]);
      alert('Template guardado');
    }
  };

  // Cargar template
  const cargarTemplate = (template: { nombre: string; texto: string }) => {
    setTextoLibre(template.texto);
    setMostrarTemplates(false);
  };

  // Eliminar template
  const eliminarTemplate = (index: number) => {
    setTemplates(templates.filter((_, i) => i !== index));
  };

  // Manejar subida de fotos
  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFotos(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Eliminar foto
  const eliminarFoto = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index));
  };

  // Guardar como borrador
  const guardarComoBorrador = () => {
    if (!textoLibre.trim()) {
      setError('No hay texto para guardar como borrador');
      return;
    }
    // En una implementación real, esto se guardaría en Firebase
    setGuardarBorrador(true);
    alert('Borrador guardado');
    setTimeout(() => setGuardarBorrador(false), 2000);
  };

  if (confirmado) {
    return (
      <section className="py-20 min-h-screen flex items-center justify-center bg-[#faf9f7] dark:bg-stone-900">
        <div className="text-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-[#5a7a54]/10 dark:bg-[#4a5d49]/20 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-[#5a7a54] dark:text-[#8faa88]" />
          </div>
          <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">¡Publicación exitosa!</h3>
          <p className="text-stone-400 dark:text-stone-500">Los comedores cercanos serán notificados automáticamente.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20 min-h-screen bg-[#faf9f7] dark:bg-stone-900">
      <div className="max-w-2xl mx-auto px-5 md:px-8">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-[#5a7a54] dark:text-[#8faa88] text-sm font-medium mb-3">
            <Package className="w-4 h-4" />
            Publicar
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-stone-800 dark:text-stone-100 tracking-tight mb-2">¿Qué te sobró hoy?</h3>
          <p className="text-stone-400 dark:text-stone-500">Escribí naturalmente. La IA se encarga de estructurar la información.</p>
        </div>

        <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-stone-100 dark:border-stone-700">
            <div className="w-10 h-10 rounded-xl bg-[#5a7a54]/10 dark:bg-[#4a5d49]/20 flex items-center justify-center">
              <Store className="w-5 h-5 text-[#5a7a54] dark:text-[#8faa88]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-stone-800 dark:text-stone-100">{comercioNombre}</div>
              <div className="text-xs text-stone-400 dark:text-stone-500">Publicando como tu comercio</div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Descripción libre</label>
            <textarea
              value={textoLibre}
              onChange={(e) => {
                setTextoLibre(e.target.value);
                setError('');
              }}
              placeholder='Ej: "Me sobran 30 facturas y 2 kilos de pan del día"'
              rows={4}
              className={`w-full px-4 py-3 bg-[#faf9f7] dark:bg-stone-700 border rounded-xl focus:ring-2 transition-all outline-none resize-none text-stone-800 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-500 ${
                error 
                  ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500/10' 
                  : 'border-stone-200 dark:border-stone-600 focus:border-[#5a7a54] dark:focus:border-[#8faa88] focus:ring-[#5a7a54]/10 dark:focus:ring-[#8faa88]/10'
              }`}
            />
            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
            {!error && (
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-2">No importa el formato. Qwen lo estructura automáticamente.</p>
            )}
          </div>

          {/* Acciones adicionales */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setMostrarTemplates(!mostrarTemplates)}
              className="flex items-center gap-2 px-3 py-2 bg-stone-50 dark:bg-stone-700 hover:bg-stone-100 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 text-sm font-medium rounded-lg transition-all"
            >
              <FileText className="w-4 h-4" />
              Templates
            </button>
            <button
              onClick={guardarComoTemplate}
              disabled={!textoLibre.trim()}
              className="flex items-center gap-2 px-3 py-2 bg-stone-50 dark:bg-stone-700 hover:bg-stone-100 dark:hover:bg-stone-600 disabled:opacity-50 text-stone-700 dark:text-stone-200 text-sm font-medium rounded-lg transition-all"
            >
              <Save className="w-4 h-4" />
              Guardar template
            </button>
            <label className="flex items-center gap-2 px-3 py-2 bg-stone-50 dark:bg-stone-700 hover:bg-stone-100 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 text-sm font-medium rounded-lg transition-all cursor-pointer">
              <Image className="w-4 h-4" />
              Agregar fotos
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFotoUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setProgramarPublicacion(!programarPublicacion)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                programarPublicacion
                  ? 'bg-[#5a7a54] dark:bg-[#4a5d49] text-white'
                  : 'bg-stone-50 dark:bg-stone-700 hover:bg-stone-100 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Programar
            </button>
            <button
              onClick={guardarComoBorrador}
              disabled={!textoLibre.trim()}
              className="flex items-center gap-2 px-3 py-2 bg-stone-50 dark:bg-stone-700 hover:bg-stone-100 dark:hover:bg-stone-600 disabled:opacity-50 text-stone-700 dark:text-stone-200 text-sm font-medium rounded-lg transition-all"
            >
              <Save className="w-4 h-4" />
              Borrador
            </button>
          </div>

          {/* Modal de templates */}
          {mostrarTemplates && (
            <div className="mb-6 p-4 bg-stone-50 dark:bg-stone-700 rounded-xl border border-stone-200 dark:border-stone-600">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-stone-800 dark:text-stone-100">Templates guardados</h4>
                <button
                  onClick={() => setMostrarTemplates(false)}
                  className="p-1 hover:bg-stone-200 dark:hover:bg-stone-600 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-stone-500" />
                </button>
              </div>
              {templates.length === 0 ? (
                <p className="text-sm text-stone-500 dark:text-stone-400">No tenés templates guardados</p>
              ) : (
                <div className="space-y-2">
                  {templates.map((template, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-600">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-stone-800 dark:text-stone-100 text-sm">{template.nombre}</div>
                        <div className="text-xs text-stone-500 dark:text-stone-400 truncate">{template.texto}</div>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => cargarTemplate(template)}
                          className="px-3 py-1 bg-[#5a7a54] dark:bg-[#4a5d49] hover:bg-[#4d6a48] dark:hover:bg-[#3d4d3c] text-white text-xs font-medium rounded-lg transition-all"
                        >
                          Usar
                        </button>
                        <button
                          onClick={() => eliminarTemplate(index)}
                          className="px-3 py-1 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-lg transition-all"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sección de fotos */}
          {fotos.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Fotos agregadas</label>
              <div className="grid grid-cols-3 gap-2">
                {fotos.map((foto, index) => (
                  <div key={index} className="relative group">
                    <img src={foto} alt={`Foto ${index + 1}`} className="w-full h-24 object-cover rounded-lg border border-stone-200 dark:border-stone-600" />
                    <button
                      onClick={() => eliminarFoto(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Programación */}
          {programarPublicacion && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Fecha y hora de publicación
              </label>
              <input
                type="datetime-local"
                value={fechaProgramada}
                onChange={(e) => setFechaProgramada(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-stone-800 dark:text-stone-100 focus:border-[#5a7a54] dark:focus:border-[#8faa88] focus:ring-1 focus:ring-[#5a7a54]/10 dark:focus:ring-[#8faa88]/10 transition-all outline-none"
              />
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                La publicación se realizará automáticamente en la fecha y hora seleccionada
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={procesar}
              disabled={!textoLibre.trim() || procesando}
              className="flex-1 bg-[#5a7a54] dark:bg-[#4a5d49] hover:bg-[#4d6a48] dark:hover:bg-[#3d4d3c] disabled:bg-stone-200 dark:disabled:bg-stone-700 disabled:text-stone-400 dark:disabled:text-stone-500 text-white py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2.5 shadow-sm"
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
            {textoLibre && (
              <button
                onClick={limpiar}
                disabled={procesando}
                className="px-6 py-3.5 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 disabled:opacity-50 text-stone-700 dark:text-stone-200 font-semibold rounded-xl transition-all"
              >
                Limpiar
              </button>
            )}
          </div>

          {resultadoEditado && (
            <div className="mt-6 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#5a7a54]/10 dark:bg-[#4a5d49]/20 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-[#5a7a54] dark:text-[#8faa88]" />
                  </div>
                  <span className="text-sm font-medium text-stone-600 dark:text-stone-300">Resultado de Qwen AI</span>
                </div>
                <span className="text-xs text-stone-400 dark:text-stone-500">Podés editar los campos</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-medium mb-1">
                    <Tag className="w-3 h-3 inline mr-1" />
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={resultadoEditado.categoria}
                    onChange={(e) => setResultadoEditado({ ...resultadoEditado, categoria: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f5f8f4] dark:bg-stone-700 border border-[#e4ede2] dark:border-stone-600 rounded-lg text-sm font-semibold text-stone-800 dark:text-stone-100 focus:border-[#5a7a54] dark:focus:border-[#8faa88] focus:ring-1 focus:ring-[#5a7a54]/10 dark:focus:ring-[#8faa88]/10 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-medium mb-1">
                    <Package className="w-3 h-3 inline mr-1" />
                    Cantidad
                  </label>
                  <input
                    type="text"
                    value={resultadoEditado.cantidad}
                    onChange={(e) => setResultadoEditado({ ...resultadoEditado, cantidad: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f5f8f4] dark:bg-stone-700 border border-[#e4ede2] dark:border-stone-600 rounded-lg text-sm font-semibold text-stone-800 dark:text-stone-100 focus:border-[#5a7a54] dark:focus:border-[#8faa88] focus:ring-1 focus:ring-[#5a7a54]/10 dark:focus:ring-[#8faa88]/10 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-medium mb-1">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Vencimiento
                  </label>
                  <input
                    type="text"
                    value={resultadoEditado.vencimientoEstimado}
                    onChange={(e) => setResultadoEditado({ ...resultadoEditado, vencimientoEstimado: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f5f8f4] dark:bg-stone-700 border border-[#e4ede2] dark:border-stone-600 rounded-lg text-sm font-semibold text-stone-800 dark:text-stone-100 focus:border-[#5a7a54] dark:focus:border-[#8faa88] focus:ring-1 focus:ring-[#5a7a54]/10 dark:focus:ring-[#8faa88]/10 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="bg-stone-50 dark:bg-stone-700 rounded-xl p-3 mb-4 border border-stone-100 dark:border-stone-600">
                <span className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-medium">Texto original</span>
                <p className="text-sm text-stone-500 dark:text-stone-400 italic mt-0.5">"{textoLibre}"</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={confirmarPublicacion}
                  className="flex-1 bg-stone-800 dark:bg-stone-700 hover:bg-stone-900 dark:hover:bg-stone-600 text-white py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmar y publicar
                </button>
                <button
                  onClick={() => {
                    setResultadoIA(null);
                    setResultadoEditado(null);
                  }}
                  className="px-6 py-3.5 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 font-semibold rounded-xl transition-all"
                >
                  Cancelar
                </button>
              </div>
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
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [comercio, setComercio] = useState<Comercio | null>(null);
  const [activeSection, setActiveSection] = useState('inicio');
  const [excedentes, setExcedentes] = useState<Excedente[]>(excedentesIniciales);
  const [showLanding, setShowLanding] = useState(true);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [loadingSession, setLoadingSession] = useState(true);

  // Observer de Firebase Auth para persistencia de sesión
  useEffect(() => {
    const unsubscribe = observarAuth(async (user) => {
      console.log('🔐 Auth state changed:', user ? user.email : 'null');
      setUsuario(user);
      if (user) {
        // Intentar cargar comercio guardado
        try {
          console.log('📖 Intentando cargar comercio para UID:', user.uid);
          const comercioGuardado = await obtenerComercio(user.uid);
          console.log('📖 Comercio cargado:', comercioGuardado);
          if (comercioGuardado) {
            setComercio(comercioGuardado);
            console.log('✅ Comercio establecido en estado');
          } else {
            console.log('⚠️ No se encontró comercio guardado');
            setComercio(null);
          }
        } catch (err) {
          console.error('❌ Error cargando comercio:', err);
          setComercio(null);
        }
      } else {
        setComercio(null);
      }
      setLoadingSession(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = (user: Usuario) => {
    setUsuario(user);
  };

  const handleOnboardingComplete = async (comercioData: Comercio) => {
    console.log('✅ handleOnboardingComplete llamado con:', comercioData);
    console.log('✅ Usuario actual:', usuario);
    
    setComercio(comercioData);
    
    if (usuario) {
      try {
        console.log('💾 Guardando comercio en Firebase...');
        await guardarComercio(usuario.uid, comercioData);
        console.log('✅ Comercio guardado en Firebase');
      } catch (err) {
        console.error('❌ Error guardando comercio:', err);
      }
    } else {
      console.error('❌ No hay usuario para guardar el comercio');
    }
  };

  const handleLogout = async () => {
    try {
      await firebaseLogout();
    } catch (err) {
      console.error('Error en logout:', err);
    }
    setUsuario(null);
    setComercio(null);
    setActiveSection('inicio');
    setShowLanding(true);
  };

  const handlePublicar = async (nuevo: Excedente) => {
    if (!usuario || !comercio) return;
    
    try {
      // Guardar en Firebase
      await crearPublicacion(
        usuario.uid,
        comercio.nombre,
        {
          categoria: nuevo.categoria,
          cantidad: nuevo.cantidad,
          descripcion: nuevo.descripcionOriginal,
          vencimientoEstimado: nuevo.vencimientoEstimado
        }
      );
      
      // Crear notificación para el usuario
      await crearNotificacion(
        usuario.uid,
        'publicacion',
        'Publicación creada',
        `Tu publicación de ${nuevo.categoria} fue creada exitosamente`
      );
      
      // Actualizar estado local
      setExcedentes([nuevo, ...excedentes]);
    } catch (error) {
      console.error('Error publicando:', error);
      // En caso de error, igual actualizar localmente para que el usuario vea el cambio
      setExcedentes([nuevo, ...excedentes]);
    }
  };

  const handleLandingNavigate = (screen: 'login' | 'register') => {
    // Si ya hay sesión activa pero falta el comercio, ir directo al onboarding
    if (usuario && !comercio) {
      setShowLanding(false);
      return;
    }
    setAuthScreen(screen);
    setShowLanding(false);
  };

  const handleBackToLanding = () => {
    setShowLanding(true);
  };

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [activeSection]);

  // Loading session (Firebase verificando)
  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5a7a54] to-[#8faa88] flex items-center justify-center mx-auto mb-4 animate-pulse">
            <HeartHandshake className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm text-stone-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Landing → pantalla de presentación
  // Mostrar landing si: showLanding es true Y (no hay usuario O no hay comercio)
  if (showLanding && (!usuario || !comercio)) {
    return <LandingScreen onNavigate={handleLandingNavigate} usuarioLogueado={!!usuario} />;
  }

  // No autenticado → pantalla de login/registro
  if (!usuario) {
    return <AuthScreenComponent onLogin={handleLogin} initialScreen={authScreen} onBack={handleBackToLanding} />;
  }

  // Autenticado pero sin comercio → onboarding
  if (!comercio) {
    return <OnboardingScreen usuario={usuario} onComplete={handleOnboardingComplete} />;
  }

  // Todo completo → app
  return (
    <div className="min-h-screen bg-[#faf9f7] dark:bg-stone-900">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        comercioNombre={comercio.nombre}
        usuarioId={usuario.uid}
        tipoUsuario={comercio.tipoUsuario}
        onLogout={handleLogout}
      />

      {/* Main content with sidebar */}
      <div className="lg:pl-64">
        <div key={activeSection} className="animate-fade-in">
          {activeSection === 'inicio' && (
            <Dashboard comercioNombre={comercio.nombre} usuarioId={usuario.uid} tipoUsuario={comercio.tipoUsuario} setActiveSection={setActiveSection} />
          )}

          {activeSection === 'publicar' && (
            <div className="p-6 lg:p-8">
              <PublicarExcedente onPublicar={handlePublicar} comercioNombre={comercio.nombre} />
            </div>
          )}

          {activeSection === 'mis-publicaciones' && <MisPublicaciones usuarioId={usuario.uid} comercioNombre={comercio.nombre} />}
          
          {activeSection === 'comedores' && <ComedoresModule />}
          
          {activeSection === 'impacto' && <MiImpacto usuarioId={usuario.uid} />}
          
          {activeSection === 'notificaciones' && <Notificaciones usuarioId={usuario.uid} />}
          
          {activeSection === 'perfil' && <Perfil comercio={comercio} />}
          
          {activeSection === 'configuracion' && <Configuracion />}

          {activeSection === 'publicaciones-disponibles' && (
            <PublicacionesDisponibles 
              comedorId={usuario.uid} 
              comedorNombre={comercio.nombre} 
            />
          )}

          {activeSection === 'mis-reservas' && (
            <MisReservas 
              usuarioId={usuario.uid} 
              tipoUsuario={comercio.tipoUsuario} 
            />
          )}

          {activeSection === 'chat' && (
            <Chat usuarioId={usuario.uid} />
          )}
        </div>
      </div>
    </div>
  );
}
