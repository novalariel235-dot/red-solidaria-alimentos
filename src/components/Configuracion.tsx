import { Moon, Sun, Bell, Shield, Globe, HelpCircle, Trash2 } from 'lucide-react';
import { useTheme } from '../ThemeContext';

export default function Configuracion() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-2">Configuración</h1>
        <p className="text-stone-500 dark:text-stone-400">
          Personalizá tu experiencia en la plataforma
        </p>
      </div>

      {/* Secciones */}
      <div className="space-y-6">
        {/* Apariencia */}
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6">
          <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" />
            Apariencia
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="w-5 h-5 text-indigo-500" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
                <div>
                  <div className="font-medium text-stone-800 dark:text-stone-100">Modo oscuro</div>
                  <div className="text-sm text-stone-500 dark:text-stone-400">
                    {darkMode ? 'Activado' : 'Desactivado'}
                  </div>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-indigo-600' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6">
          <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            Notificaciones
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-stone-800 dark:text-stone-100">Notificaciones push</div>
                <div className="text-sm text-stone-500 dark:text-stone-400">
                  Recibir alertas en tiempo real
                </div>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-stone-300 dark:bg-stone-600 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-stone-800 dark:text-stone-100">Email de resumen</div>
                <div className="text-sm text-stone-500 dark:text-stone-400">
                  Resumen semanal de actividad
                </div>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-stone-300 dark:bg-stone-600 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Privacidad y seguridad */}
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6">
          <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            Privacidad y seguridad
          </h2>
          
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-stone-500 dark:text-stone-400" />
                <div className="text-left">
                  <div className="font-medium text-stone-800 dark:text-stone-100">Visibilidad del perfil</div>
                  <div className="text-sm text-stone-500 dark:text-stone-400">Quién puede ver tu información</div>
                </div>
              </div>
            </button>

            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-stone-500 dark:text-stone-400" />
                <div className="text-left">
                  <div className="font-medium text-stone-800 dark:text-stone-100">Cambiar contraseña</div>
                  <div className="text-sm text-stone-500 dark:text-stone-400">Actualizar tu contraseña</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Ayuda */}
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6">
          <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-purple-500" />
            Ayuda y soporte
          </h2>
          
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-stone-500 dark:text-stone-400" />
                <div className="text-left">
                  <div className="font-medium text-stone-800 dark:text-stone-100">Centro de ayuda</div>
                  <div className="text-sm text-stone-500 dark:text-stone-400">Preguntas frecuentes y guías</div>
                </div>
              </div>
            </button>

            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-stone-500 dark:text-stone-400" />
                <div className="text-left">
                  <div className="font-medium text-stone-800 dark:text-stone-100">Contactar soporte</div>
                  <div className="text-sm text-stone-500 dark:text-stone-400">Enviar un mensaje al equipo</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Zona de peligro */}
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-red-200 dark:border-red-900 p-6">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Zona de peligro
          </h2>
          
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <div className="text-left">
                <div className="font-medium text-red-600 dark:text-red-400">Desactivar comercio</div>
                <div className="text-sm text-stone-500 dark:text-stone-400">Pausar tu participación temporalmente</div>
              </div>
            </button>

            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <div className="text-left">
                <div className="font-medium text-red-600 dark:text-red-400">Eliminar cuenta</div>
                <div className="text-sm text-stone-500 dark:text-stone-400">Eliminar permanentemente tu cuenta y datos</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
