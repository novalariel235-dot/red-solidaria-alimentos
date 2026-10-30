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
  if (!isFirebaseConfigured) {
    throw new Error('Firebase no configurado');
  }

  const docRef = await addDoc(collection(db, 'publicaciones'), {
    ...data,
    usuarioId,
    comercioNombre,
    estado: 'disponible',
    createdAt: serverTimestamp()
  });

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
  if (!isFirebaseConfigured) return [];

  const q = query(
    collection(db, 'publicaciones'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Publicacion[];
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
