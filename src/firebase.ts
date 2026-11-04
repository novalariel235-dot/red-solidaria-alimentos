import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

// ─────────────────────────────────────────────────────────
// ⚠️ CONFIGURACIÓN DE FIREBASE
// ─────────────────────────────────────────────────────────
// Para activar la autenticación REAL y la base de datos:
//
// 1. Andá a https://console.firebase.google.com/
// 2. Creá un proyecto nuevo (gratis)
// 3. En "Authentication" → "Sign-in method" → habilitá:
//    - Google
//    - Email/Password
// 4. En "Project settings" → "Your apps" → agregá una "Web app"
// 5. Copiá las credenciales y pegalas abajo
// 6. En "Firestore Database" → creá una base de datos
//
// Mientras NO configures esto, la app funciona en MODO DEMO
// (simulación local, sin persistencia real).
// ─────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: "AIzaSyA1dY8F2IFFzS6VoC0gEI9Y5ixFZP8JGzM",
  authDomain: "ariel-8f6c2.firebaseapp.com",
  projectId: "ariel-8f6c2",
  storageBucket: "ariel-8f6c2.firebasestorage.app",
  messagingSenderId: "779116102386",
  appId: "1:779116102386:web:8d52269b3c7177dd1e466b",
  measurementId: "G-38F2XSCXCV"
};

// Detectar si Firebase está configurado
export const isFirebaseConfigured = firebaseConfig.apiKey !== "TU_API_KEY_AQUI";

// Inicializar Firebase (solo si está configurado)
let app: any = null;
let auth: any = null;
let db: any = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase inicializado correctamente');
  } catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
  }
} else {
  console.log('⚠️ Firebase no configurado. Usando MODO DEMO.');
}

// ─── Tipos ───────────────────────────────────────────────
export interface Usuario {
  uid: string;
  nombre: string;
  email: string;
  proveedor: 'google' | 'email';
}

export interface Comercio {
  nombre: string;
  tipo: string;
  tipoUsuario: 'comercio' | 'comedor';
  direccion: string;
  lat?: number;
  lng?: number;
  telefono: string;
  descripcion: string;
  diasRetiro: string[];
  horarioDesde: string;
  horarioHasta: string;
  capacidad?: number;
  personasAtendidas?: number;
}

// ─── Auth Functions ──────────────────────────────────────

// Login con Google
export async function loginConGoogle(): Promise<Usuario> {
  if (!isFirebaseConfigured) {
    // Modo demo
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      uid: 'demo-' + Date.now(),
      nombre: 'Usuario Demo',
      email: 'demo@ejemplo.com',
      proveedor: 'google'
    };
  }

  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return {
    uid: result.user.uid,
    nombre: result.user.displayName || 'Usuario',
    email: result.user.email || '',
    proveedor: 'google'
  };
}

// Login con email/password
export async function loginConEmail(email: string, password: string): Promise<Usuario> {
  if (!isFirebaseConfigured) {
    // Modo demo: aceptar cualquier email/password no vacío
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (!email || !password) throw new Error('Completá todos los campos');
    return {
      uid: 'demo-email-' + email,
      nombre: email.split('@')[0],
      email,
      proveedor: 'email'
    };
  }

  const result = await signInWithEmailAndPassword(auth, email, password);
  return {
    uid: result.user.uid,
    nombre: result.user.displayName || email.split('@')[0],
    email: result.user.email || '',
    proveedor: 'email'
  };
}

// Registro con email/password
export async function registrarConEmail(nombre: string, email: string, password: string): Promise<Usuario> {
  if (!isFirebaseConfigured) {
    // Modo demo
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (!email || !password || !nombre) throw new Error('Completá todos los campos');
    return {
      uid: 'demo-reg-' + email,
      nombre,
      email,
      proveedor: 'email'
    };
  }

  const result = await createUserWithEmailAndPassword(auth, email, password);
  // Actualizar displayName
  if (result.user) {
    await updateProfile(result.user, { displayName: nombre });
  }
  return {
    uid: result.user.uid,
    nombre,
    email: result.user.email || '',
    proveedor: 'email'
  };
}

// Logout
export async function logout(): Promise<void> {
  if (!isFirebaseConfigured) return;
  await signOut(auth);
}

// Observer de cambios de auth (para persistencia de sesión)
export function observarAuth(callback: (user: Usuario | null) => void): () => void {
  if (!isFirebaseConfigured) {
    // En modo demo no hay persistencia
    return () => {};
  }

  const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
    if (firebaseUser) {
      callback({
        uid: firebaseUser.uid,
        nombre: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
        email: firebaseUser.email || '',
        proveedor: firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email'
      });
    } else {
      callback(null);
    }
  });

  return unsubscribe;
}

// ─── Firestore Functions ─────────────────────────────────

// Guardar comercio del usuario
export async function guardarComercio(uid: string, comercio: Comercio): Promise<void> {
  console.log('💾 guardarComercio llamado para UID:', uid);
  console.log('💾 Datos a guardar:', comercio);
  
  if (!isFirebaseConfigured) {
    console.log('⚠️ Firebase no configurado, no se guardó');
    return;
  }
  
  try {
    const docRef = doc(db, 'usuarios', uid, 'perfil', 'comercio');
    console.log('📄 Guardando en:', docRef.path);
    
    await setDoc(docRef, {
      ...comercio,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Comercio guardado exitosamente');
  } catch (error) {
    console.error('❌ Error guardando comercio:', error);
    throw error;
  }
}

// Obtener comercio del usuario
export async function obtenerComercio(uid: string): Promise<Comercio | null> {
  console.log('🔍 obtenerComercio llamado para UID:', uid);
  console.log('🔍 Firebase configurado:', isFirebaseConfigured);
  
  if (!isFirebaseConfigured) {
    console.log('⚠️ Firebase no configurado, retornando null');
    return null;
  }
  
  try {
    const docRef = doc(db, 'usuarios', uid, 'perfil', 'comercio');
    console.log('📄 Referencia del documento:', docRef.path);
    
    const docSnap = await getDoc(docRef);
    console.log('📄 Documento existe:', docSnap.exists());
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('📄 Datos del documento:', data);
      
      const comercio = {
        nombre: data.nombre || '',
        tipo: data.tipo || '',
        tipoUsuario: data.tipoUsuario || 'comercio',
        direccion: data.direccion || '',
        lat: data.lat || undefined,
        lng: data.lng || undefined,
        telefono: data.telefono || '',
        descripcion: data.descripcion || '',
        diasRetiro: data.diasRetiro || [],
        horarioDesde: data.horarioDesde || '',
        horarioHasta: data.horarioHasta || '',
        capacidad: data.capacidad || undefined,
        personasAtendidas: data.personasAtendidas || undefined
      };
      
      console.log('✅ Comercio retornado:', comercio);
      return comercio;
    }
    
    console.log('⚠️ Documento no existe en Firestore');
    return null;
  } catch (error) {
    console.error('❌ Error en obtenerComercio:', error);
    return null;
  }
}

// Publicar excedente
export async function publicarExcedente(uid: string, comercioNombre: string, excedente: any): Promise<string> {
  if (!isFirebaseConfigured) {
    return 'demo-' + Date.now();
  }
  const docRef = await addDoc(collection(db, 'excedentes'), {
    ...excedente,
    usuarioId: uid,
    comercio: comercioNombre,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

// Obtener excedentes
export async function obtenerExcedentes(): Promise<any[]> {
  if (!isFirebaseConfigured) return [];
  const q = query(collection(db, 'excedentes'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export { auth, db };
