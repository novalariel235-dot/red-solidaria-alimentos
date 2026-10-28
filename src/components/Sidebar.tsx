import { useState, useEffect } from 'react';
import {
  Home, Package, ClipboardList, UtensilsCrossed, BarChart3,
  Bell, Settings, LogOut, Menu, X, HeartHandshake, ChevronRight, User
} from 'lucide-react';
import { obtenerNotificacionesUsuario } from '../services';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  comercioNombre: string;
  usuarioId: string;
  onLogout: () => void;
}

export default function Sidebar({ activeSection, setActiveSection, comercioNombre, usuarioId, onLogout }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);

  useEffect(() => {
    cargarNotificaciones();
  }, [usuarioId]);

  const cargarNotificaciones = async () => {
    try {
      const notificaciones = await obtenerNotificacionesUsuario(usuarioId);
      const noLeidas = notificaciones.filter(n => !n.leida).length;
      setNotificacionesNoLeidas(noLeidas);
    } catch (error) {
      console.error('Error cargando notificaciones en sidebar:', error);
    }
  };

  const menuItems = [
    { id: 'inicio', label: 'Home', icon: Home },
    { id: 'publicar', label: 'Publicar', icon: Package },
    { id: 'mis-publicaciones', label: 'Mis Publicaciones', icon: ClipboardList },
    { id: 'comedores', label: 'Comedores', icon: UtensilsCrossed },
    { id: 'impacto', label: 'Mi Impacto', icon: BarChart3 },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell, badge: notificacionesNoLeidas },
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
  ];

  const handleNav = (id: string) => {
    setActiveSection(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5a7a54] to-[#8faa88] flex items-center justify-center">
            <HeartHandshake className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-stone-800 dark:text-stone-100 text-sm">{comercioNombre}</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5 dark:text-stone-300" /> : <Menu className="w-5 h-5 dark:text-stone-300" />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      <div 
        className={`lg:hidden fixed inset-0 z-30 transition-opacity duration-300 ${
          mobileOpen ? 'bg-black/20 backdrop-blur-sm opacity-100' : 'bg-black/0 backdrop-blur-0 opacity-0 pointer-events-none'
        }`} 
        onClick={() => setMobileOpen(false)}
      >
        <div 
          className={`absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-stone-800 shadow-xl transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`} 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-stone-100 dark:border-stone-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5a7a54] to-[#8faa88] flex items-center justify-center text-white font-bold">
                {comercioNombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-stone-800 dark:text-stone-100 text-sm">{comercioNombre}</div>
                <div className="text-xs text-stone-400 dark:text-stone-500">Comercio activo</div>
              </div>
            </div>
          </div>
          <nav className="p-3 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeSection === item.id
                    ? 'bg-[#5a7a54]/10 text-[#5a7a54]'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-stone-100 dark:border-stone-700">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-stone-800 border-r border-stone-200 dark:border-stone-700">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-stone-100 dark:border-stone-700">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5a7a54] to-[#8faa88] flex items-center justify-center shadow-sm">
            <HeartHandshake className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-stone-800 dark:text-stone-100 leading-tight">Red Solidaria</div>
            <div className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wider">Villa Regina</div>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-stone-100 dark:border-stone-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5a7a54] to-[#8faa88] flex items-center justify-center text-white font-bold">
              {comercioNombre.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-stone-800 dark:text-stone-100 truncate">{comercioNombre}</div>
              <div className="text-xs text-stone-400 dark:text-stone-500">Comercio activo</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                activeSection === item.id
                  ? 'bg-[#5a7a54]/10 text-[#5a7a54]'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 hover:text-stone-800 dark:hover:text-stone-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              {activeSection === item.id && (
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-stone-100 dark:border-stone-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
