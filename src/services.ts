import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

// ─── Tipos ───────────────────────────────────────────────
export interface Publicacion {
  id: string;
  usuarioId: string;
  comercioNombre: string;
  categoria: string;
  cantidad: string;
  descripcion: string;
  vencimientoEstimado: string;
  estado: 'disponible' | 'reservado' | 'entregado';
  createdAt: Timestamp;
  comedorId?: string;
  comedorNombre?: string;
}

export interface Comedor {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  lat: number;
  lng: number;
  capacidad: number;
  personasAtendidas: number;
}

export interface Notificacion {
  id: string;
  usuarioId: string;
  tipo: 'reserva' | 'entrega' | 'mensaje' | 'publicacion' | 'sistema';
  titulo: string;
  mensaje: string;
  leida: boolean;
  createdAt: Timestamp;
}

// ─── Publicaciones ───────────────────────────────────────
export async function crearPublicacion(
  usuarioId: string,
  comercioNombre: string,
  data: Omit<Publicacion, 'id' | 'usuarioId' | 'comercioNombre' | 'createdAt' | 'estado'>
): Promise<string> {
  console.log('📝 crearPublicacion llamada');
  console.log('📝 usuarioId:', usuarioId);
  console.log('📝 comercioNombre:', comercioNombre);
  console.log('📝 data:', data);
  
  if (!isFirebaseConfigured) {
    throw new Error('Firebase no configurado');
  }

  const docData = {
    ...data,
    usuarioId,
    comercioNombre,
    estado: 'disponible',
    createdAt: serverTimestamp()
  };
  
  console.log('📝 Guardando en Firestore:', docData);
  
  const docRef = await addDoc(collection(db, 'publicaciones'), docData);

  console.log('✅ Publicación creada con ID:', docRef.id);
  return docRef.id;
}

export async function obtenerPublicacionesUsuario(usuarioId: string): Promise<Publicacion[]> {
  if (!isFirebaseConfigured) return [];

  const q = query(
    collection(db, 'publicaciones'),
    where('usuarioId', '==', usuarioId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Publicacion[];
}

export async function obtenerTodasLasPublicaciones(): Promise<Publicacion[]> {
  console.log('📚 obtenerTodasLasPublicaciones llamada');
  console.log('📚 Firebase configurado:', isFirebaseConfigured);
  
  if (!isFirebaseConfigured) {
    console.log('⚠️ Firebase no configurado');
    return [];
  }

  try {
    // Intentar con ordenamiento por fecha (requiere índice)
    console.log('📚 Intentando obtener publicaciones ordenadas por fecha...');
    const q = query(
      collection(db, 'publicaciones'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const snapshot = await getDocs(q);
    const publicaciones = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Publicacion[];
    
    console.log('✅ Publicaciones obtenidas (ordenadas):', publicaciones.length);
    console.log('📋 Primera publicación:', publicaciones[0]);
    return publicaciones;
  } catch (error) {
    console.warn('⚠️ Error con índice, usando fallback:', error);
    // Fallback: obtener sin ordenar y ordenar en el cliente
    const q = query(
      collection(db, 'publicaciones'),
      limit(50)
    );

    const snapshot = await getDocs(q);
    const publicaciones = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Publicacion[];

    console.log('✅ Publicaciones obtenidas (sin ordenar):', publicaciones.length);

    // Ordenar por fecha en el cliente
    const ordenadas = publicaciones.sort((a, b) => {
      const fechaA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const fechaB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return fechaB - fechaA; // Descendente (más reciente primero)
    });
    
    console.log('📋 Primera publicación (ordenada):', ordenadas[0]);
    return ordenadas;
  }
}

export async function actualizarEstadoPublicacion(
  publicacionId: string,
  estado: 'disponible' | 'reservado' | 'entregado',
  comedorId?: string,
  comedorNombre?: string
): Promise<void> {
  if (!isFirebaseConfigured) return;

  const publicacionRef = doc(db, 'publicaciones', publicacionId);
  await updateDoc(publicacionRef, {
    estado,
    comedorId: comedorId || null,
    comedorNombre: comedorNombre || null
  });
}

export async function eliminarPublicacion(publicacionId: string): Promise<void> {
  if (!isFirebaseConfigured) return;

  await deleteDoc(doc(db, 'publicaciones', publicacionId));
}

// ─── Comedores ───────────────────────────────────────────
export async function obtenerComedores(): Promise<Comedor[]> {
  if (!isFirebaseConfigured) return [];

  const q = query(collection(db, 'comedores'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Comedor[];
}

export async function crearComedor(data: Omit<Comedor, 'id'>): Promise<string> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase no configurado');
  }

  const docRef = await addDoc(collection(db, 'comedores'), data);
  return docRef.id;
}

// ─── Notificaciones ──────────────────────────────────────
export async function crearNotificacion(
  usuarioId: string,
  tipo: Notificacion['tipo'],
  titulo: string,
  mensaje: string
): Promise<string> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase no configurado');
  }

  const docRef = await addDoc(collection(db, 'notificaciones'), {
    usuarioId,
    tipo,
    titulo,
    mensaje,
    leida: false,
    createdAt: serverTimestamp()
  });

  return docRef.id;
}

export async function obtenerNotificacionesUsuario(usuarioId: string): Promise<Notificacion[]> {
  if (!isFirebaseConfigured) return [];

  const q = query(
    collection(db, 'notificaciones'),
    where('usuarioId', '==', usuarioId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Notificacion[];
}

export async function marcarNotificacionComoLeida(notificacionId: string): Promise<void> {
  if (!isFirebaseConfigured) return;

  const notifRef = doc(db, 'notificaciones', notificacionId);
  await updateDoc(notifRef, { leida: true });
}

// ─── Estadísticas ────────────────────────────────────────
export async function obtenerEstadisticasUsuario(usuarioId: string) {
  if (!isFirebaseConfigured) {
    return {
      publicacionesActivas: 0,
      kgDonados: 0,
      entregasCompletadas: 0
    };
  }

  const publicaciones = await obtenerPublicacionesUsuario(usuarioId);
  
  const publicacionesActivas = publicaciones.filter(p => p.estado === 'disponible').length;
  const entregasCompletadas = publicaciones.filter(p => p.estado === 'entregado').length;
  
  // Calcular kg donados (simplificado, en producción parsear la cantidad)
  const kgDonados = publicaciones
    .filter(p => p.estado === 'entregado')
    .reduce((acc, p) => {
      const match = p.cantidad.match(/(\d+)\s*kg/i);
      return acc + (match ? parseInt(match[1]) : 0);
    }, 0);

  return {
    publicacionesActivas,
    kgDonados,
    entregasCompletadas
  };
}

// ─── Chat/Mensajería ─────────────────────────────────────
export interface Mensaje {
  id: string;
  emisorId: string;
  emisorNombre: string;
  texto: string;
  timestamp: Timestamp;
  leido: boolean;
}

export interface Chat {
  id: string;
  participantes: string[];
  nombresParticipantes: string[];
  publicacionId?: string;
  ultimoMensaje: string;
  ultimoMensajeTimestamp: Timestamp;
  noLeidos: number;
}

// Crear o obtener chat existente entre dos usuarios
export async function crearOObtenerChat(
  usuarioId1: string,
  nombreUsuario1: string,
  usuarioId2: string,
  nombreUsuario2: string,
  publicacionId?: string
): Promise<string> {
  console.log('💬 Crear/obtener chat entre:', usuarioId1, 'y', usuarioId2);
  
  if (!isFirebaseConfigured) {
    throw new Error('Firebase no configurado');
  }

  // Buscar si ya existe un chat entre estos dos usuarios
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('participantes', 'array-contains', usuarioId1)
  );

  const snapshot = await getDocs(q);
  let chatExistente: string | null = null;

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.participantes.includes(usuarioId2)) {
      // Si hay publicacionId, verificar que sea el mismo chat
      if (!publicacionId || data.publicacionId === publicacionId) {
        chatExistente = doc.id;
      }
    }
  });

  if (chatExistente) {
    console.log('✅ Chat existente encontrado:', chatExistente);
    return chatExistente;
  }

  // Crear nuevo chat
  console.log('🆕 Creando nuevo chat...');
  const nuevoChat = {
    participantes: [usuarioId1, usuarioId2],
    nombresParticipantes: [nombreUsuario1, nombreUsuario2],
    publicacionId: publicacionId || null,
    ultimoMensaje: '',
    ultimoMensajeTimestamp: serverTimestamp(),
    noLeidos: 0
  };

  const docRef = await addDoc(chatsRef, nuevoChat);
  console.log('✅ Nuevo chat creado:', docRef.id);
  return docRef.id;
}

// Enviar mensaje
export async function enviarMensaje(
  chatId: string,
  emisorId: string,
  emisorNombre: string,
  receptorId: string,
  texto: string
): Promise<void> {
  console.log('📤 Enviando mensaje en chat:', chatId);
  
  if (!isFirebaseConfigured) {
    throw new Error('Firebase no configurado');
  }

  // Agregar mensaje a la subcolección
  const mensajesRef = collection(db, 'chats', chatId, 'mensajes');
  await addDoc(mensajesRef, {
    emisorId,
    emisorNombre,
    texto,
    timestamp: serverTimestamp(),
    leido: false
  });

  // Actualizar metadata del chat
  const chatRef = doc(db, 'chats', chatId);
  await updateDoc(chatRef, {
    ultimoMensaje: texto,
    ultimoMensajeTimestamp: serverTimestamp()
  });

  // Crear notificación para el receptor
  await crearNotificacion(
    receptorId,
    'mensaje',
    'Nuevo mensaje',
    `${emisorNombre}: ${texto.substring(0, 50)}${texto.length > 50 ? '...' : ''}`
  );

  console.log('✅ Mensaje enviado');
}

// Obtener chats de un usuario
export async function obtenerChatsUsuario(usuarioId: string): Promise<Chat[]> {
  console.log('📥 Obteniendo chats para usuario:', usuarioId);
  
  if (!isFirebaseConfigured) return [];

  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('participantes', 'array-contains', usuarioId)
  );

  const snapshot = await getDocs(q);
  const chats = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Chat[];

  console.log('✅ Chats obtenidos:', chats.length);
  return chats.sort((a, b) => {
    const timeA = a.ultimoMensajeTimestamp?.toMillis() || 0;
    const timeB = b.ultimoMensajeTimestamp?.toMillis() || 0;
    return timeB - timeA; // Más reciente primero
  });
}

// Obtener mensajes de un chat
export async function obtenerMensajesChat(chatId: string): Promise<Mensaje[]> {
  console.log('📥 Obteniendo mensajes del chat:', chatId);
  
  if (!isFirebaseConfigured) return [];

  const mensajesRef = collection(db, 'chats', chatId, 'mensajes');
  const q = query(mensajesRef, orderBy('timestamp', 'asc'));

  const snapshot = await getDocs(q);
  const mensajes = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Mensaje[];

  console.log('✅ Mensajes obtenidos:', mensajes.length);
  return mensajes;
}

// Marcar mensajes como leídos
export async function marcarMensajesComoLeidos(chatId: string, usuarioId: string): Promise<void> {
  if (!isFirebaseConfigured) return;

  const mensajesRef = collection(db, 'chats', chatId, 'mensajes');
  const q = query(
    mensajesRef,
    where('emisorId', '!=', usuarioId),
    where('leido', '==', false)
  );

  const snapshot = await getDocs(q);
  const batch = snapshot.docs.map(doc => 
    updateDoc(doc.ref, { leido: true })
  );

  await Promise.all(batch);
  console.log('✅ Mensajes marcados como leídos');
}

// ─── Reservas ────────────────────────────────────────────
export interface Reserva {
  id: string;
  publicacionId: string;
  comedorId: string;
  comedorNombre: string;
  comercioId: string;
  comercioNombre: string;
  mensaje: string;
  estado: 'pendiente' | 'aceptada' | 'rechazada' | 'completada';
  createdAt: Timestamp;
}

export async function crearReserva(
  publicacionId: string,
  comedorId: string,
  comedorNombre: string,
  comercioId: string,
  comercioNombre: string,
  mensaje: string
): Promise<string> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase no configurado');
  }

  const docRef = await addDoc(collection(db, 'reservas'), {
    publicacionId,
    comedorId,
    comedorNombre,
    comercioId,
    comercioNombre,
    mensaje,
    estado: 'pendiente',
    createdAt: serverTimestamp()
  });

  // Actualizar estado de la publicación
  await actualizarEstadoPublicacion(publicacionId, 'reservado');

  // Crear notificación para el comercio
  await crearNotificacion(
    comercioId,
    'reserva',
    'Nueva reserva',
    `${comedorNombre} quiere reservar tu publicación`
  );

  return docRef.id;
}

export async function obtenerReservasComedor(comedorId: string): Promise<Reserva[]> {
  if (!isFirebaseConfigured) return [];

  const q = query(
    collection(db, 'reservas'),
    where('comedorId', '==', comedorId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Reserva[];
}

export async function obtenerReservasComercio(comercioId: string): Promise<Reserva[]> {
  if (!isFirebaseConfigured) return [];

  const q = query(
    collection(db, 'reservas'),
    where('comercioId', '==', comercioId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Reserva[];
}

export async function actualizarEstadoReserva(
  reservaId: string,
  estado: 'pendiente' | 'aceptada' | 'rechazada' | 'completada'
): Promise<void> {
  if (!isFirebaseConfigured) return;

  const reservaRef = doc(db, 'reservas', reservaId);
  await updateDoc(reservaRef, { estado });

  // Si se acepta o rechaza, actualizar estado de la publicación
  if (estado === 'aceptada' || estado === 'rechazada') {
    const reservaDoc = await getDoc(reservaRef);
    const reserva = reservaDoc.data() as Reserva;
    
    if (estado === 'aceptada') {
      await actualizarEstadoPublicacion(reserva.publicacionId, 'entregado');
    } else {
      await actualizarEstadoPublicacion(reserva.publicacionId, 'disponible');
    }

    // Notificar al comedor
    await crearNotificacion(
      reserva.comedorId,
      estado === 'aceptada' ? 'entrega' : 'sistema',
      estado === 'aceptada' ? 'Reserva aceptada' : 'Reserva rechazada',
      estado === 'aceptada' 
        ? `${reserva.comercioNombre} aceptó tu reserva`
        : `${reserva.comercioNombre} rechazó tu reserva`
    );
  }
}
