import { useState, useEffect } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import { obtenerChatsUsuario, type Chat } from '../services';

interface ChatListProps {
  usuarioId: string;
  onSeleccionarChat: (chatId: string) => void;
  chatActivo: string | null;
}

export default function ChatList({ usuarioId, onSeleccionarChat, chatActivo }: ChatListProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarChats();
    
    // Recargar chats cada 5 segundos para actualizar en tiempo real
    const interval = setInterval(cargarChats, 5000);
    return () => clearInterval(interval);
  }, [usuarioId]);

  const cargarChats = async () => {
    try {
      const data = await obtenerChatsUsuario(usuarioId);
      setChats(data);
    } catch (error) {
      console.error('Error cargando chats:', error);
    } finally {
      setCargando(false);
    }
  };

  const chatsFiltrados = chats.filter(chat => {
    const otroUsuario = chat.nombresParticipantes.find(nombre => 
      !nombre.includes(usuarioId)
    ) || chat.nombresParticipantes[0];
    
    return otroUsuario.toLowerCase().includes(busqueda.toLowerCase());
  });

  const formatearTiempo = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `Hace ${days}d`;
    if (hours > 0) return `Hace ${hours}h`;
    return 'Hace menos de 1h';
  };

  const obtenerNombreOtroUsuario = (chat: Chat) => {
    return chat.nombresParticipantes.find(nombre => 
      !chat.participantes[chat.nombresParticipantes.indexOf(nombre)].includes(usuarioId)
    ) || chat.nombresParticipantes[0];
  };

  if (cargando) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <div className="w-12 h-12 border-4 border-[#5a7a54] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500">Cargando chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-stone-200">
        <h2 className="text-xl font-bold text-stone-800 mb-3">Mis Conversaciones</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar conversación..."
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5a7a54]"
          />
        </div>
      </div>

      {/* Lista de chats */}
      <div className="flex-1 overflow-y-auto">
        {chatsFiltrados.length === 0 ? (
          <div className="p-6 text-center">
            <MessageCircle className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500 text-sm">
              {busqueda ? 'No se encontraron chats' : 'No tenés conversaciones aún'}
            </p>
            {!busqueda && (
              <p className="text-stone-400 text-xs mt-2">
                Contactá un comercio desde la sección de excedentes
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {chatsFiltrados.map((chat) => {
              const nombreOtroUsuario = obtenerNombreOtroUsuario(chat);
              const isActive = chatActivo === chat.id;
              
              return (
                <button
                  key={chat.id}
                  onClick={() => onSeleccionarChat(chat.id)}
                  className={`w-full p-4 text-left hover:bg-stone-50 transition-colors ${
                    isActive ? 'bg-[#5a7a54]/5 border-l-4 border-[#5a7a54]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5a7a54] to-[#8faa88] flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {nombreOtroUsuario.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-stone-800 truncate">
                          {nombreOtroUsuario}
                        </h3>
                        <span className="text-xs text-stone-400 flex-shrink-0 ml-2">
                          {formatearTiempo(chat.ultimoMensajeTimestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-stone-600 truncate">
                        {chat.ultimoMensaje || 'Iniciá la conversación'}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
