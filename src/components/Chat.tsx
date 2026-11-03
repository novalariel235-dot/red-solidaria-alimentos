import { useState } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { type Chat } from '../services';

interface ChatProps {
  usuarioId: string;
  chatInicial?: string | null;
}

export default function Chat({ usuarioId, chatInicial }: ChatProps) {
  const [chatActivo, setChatActivo] = useState<string | null>(chatInicial || null);
  const [chatSeleccionado, setChatSeleccionado] = useState<Chat | null>(null);

  const handleSeleccionarChat = (chatId: string) => {
    setChatActivo(chatId);
  };

  const handleVolver = () => {
    setChatActivo(null);
    setChatSeleccionado(null);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Lista de chats - Sidebar */}
      <div className={`w-full md:w-96 border-r border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 ${
        chatActivo ? 'hidden md:block' : 'block'
      }`}>
        <ChatList
          usuarioId={usuarioId}
          onSeleccionarChat={handleSeleccionarChat}
          chatActivo={chatActivo}
        />
      </div>

      {/* Ventana de chat */}
      <div className={`flex-1 ${!chatActivo ? 'hidden md:block' : 'block'}`}>
        {chatActivo ? (
          <ChatWindow
            chatId={chatActivo}
            usuarioId={usuarioId}
            chat={chatSeleccionado || {
              id: chatActivo,
              participantes: [],
              nombresParticipantes: [],
              ultimoMensaje: '',
              ultimoMensajeTimestamp: null as any,
              noLeidos: 0
            }}
            onVolver={handleVolver}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-stone-50 dark:bg-stone-900">
            <div className="text-center">
              <div className="w-20 h-20 bg-stone-200 dark:bg-stone-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-stone-400 dark:text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-stone-700 dark:text-stone-200 mb-2">
                Seleccioná una conversación
              </h3>
              <p className="text-stone-500 dark:text-stone-400 text-sm">
                Elegí un chat de la lista para empezar a conversar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
