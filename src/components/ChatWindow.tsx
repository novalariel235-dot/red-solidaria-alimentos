import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { obtenerMensajesChat, enviarMensaje, type Mensaje, type Chat } from '../services';

interface ChatWindowProps {
  chatId: string;
  usuarioId: string;
  chat: Chat;
  onVolver: () => void;
}

export default function ChatWindow({ chatId, usuarioId, chat, onVolver }: ChatWindowProps) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const mensajesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cargarMensajes();
    
    // Recargar mensajes cada 3 segundos para tiempo real
    const interval = setInterval(cargarMensajes, 3000);
    return () => clearInterval(interval);
  }, [chatId]);

  useEffect(() => {
    // Scroll al final cuando hay nuevos mensajes
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const cargarMensajes = async () => {
    try {
      const data = await obtenerMensajesChat(chatId);
      setMensajes(data);
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  };

  const handleEnviar = async () => {
    if (!nuevoMensaje.trim() || enviando) return;

    try {
      setEnviando(true);
      
      // Encontrar el ID del otro usuario
      const otroUsuarioIndex = chat.participantes.findIndex(p => p !== usuarioId);
      const receptorId = chat.participantes[otroUsuarioIndex];
      const emisorNombre = chat.nombresParticipantes[chat.participantes.indexOf(usuarioId)] || 'Usuario';

      await enviarMensaje(chatId, usuarioId, emisorNombre, receptorId, nuevoMensaje);
      
      setNuevoMensaje('');
      await cargarMensajes(); // Recargar inmediatamente
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      alert('Error al enviar el mensaje');
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  const formatearHora = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  const obtenerNombreOtroUsuario = () => {
    const index = chat.participantes.findIndex(p => p !== usuarioId);
    return chat.nombresParticipantes[index] || chat.nombresParticipantes[0];
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onVolver}
            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-600 dark:text-stone-300" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5a7a54] to-[#8faa88] dark:from-[#4a5d49] dark:to-[#6b7d6a] flex items-center justify-center text-white font-semibold">
            {obtenerNombreOtroUsuario().charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-stone-800 dark:text-stone-100">{obtenerNombreOtroUsuario()}</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">En línea</p>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50 dark:bg-stone-900">
        {mensajes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-500 dark:text-stone-400 text-sm">Iniciá la conversación</p>
            <p className="text-stone-400 dark:text-stone-500 text-xs mt-2">
              Enviá el primer mensaje
            </p>
          </div>
        ) : (
          mensajes.map((mensaje) => {
            const esMio = mensaje.emisorId === usuarioId;
            
            return (
              <div
                key={mensaje.id}
                className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    esMio
                      ? 'bg-[#5a7a54] dark:bg-[#4a5d49] text-white'
                      : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{mensaje.texto}</p>
                  <p
                    className={`text-xs mt-1 ${
                      esMio ? 'text-white/70' : 'text-stone-400 dark:text-stone-500'
                    }`}
                  >
                    {formatearHora(mensaje.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={mensajesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
        <div className="flex gap-2">
          <textarea
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribí un mensaje..."
            rows={1}
            className="flex-1 px-4 py-2 bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg text-sm text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 resize-none focus:outline-none focus:ring-2 focus:ring-[#5a7a54] dark:focus:ring-[#8faa88]"
          />
          <button
            onClick={handleEnviar}
            disabled={!nuevoMensaje.trim() || enviando}
            className="px-4 py-2 bg-[#5a7a54] dark:bg-[#4a5d49] hover:bg-[#4d6a48] dark:hover:bg-[#3d4d3c] disabled:bg-stone-300 dark:disabled:bg-stone-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
