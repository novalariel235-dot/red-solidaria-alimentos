# 🔥 Configuración de Firebase (Autenticación + Base de Datos)

## Estado actual

La app funciona en **MODO DEMO**:
- ✅ El botón de Google simula un login (no es real)
- ✅ Email/password simula registro/login (no valida contra nada)
- ❌ No hay persistencia (si recargás la página, perdés la sesión)
- ❌ No hay base de datos real

Para activar autenticación REAL y base de datos, seguí estos pasos (5 minutos, gratis).

---

## 📋 Paso a paso para configurar Firebase

### 1. Crear proyecto en Firebase

1. Andá a [Firebase Console](https://console.firebase.google.com/)
2. Hacé click en **"Agregar proyecto"** (o "Add project")
3. Nombre del proyecto: `red-solidaria-alimentos` (o el que quieras)
4. Podés desactivar Google Analytics (no lo necesitamos)
5. Click en **"Crear proyecto"**

### 2. Agregar una app web

1. Dentro del proyecto, en la página principal vas a ver **"Comenzar agregando Firebase a tu app"**
2. Hacé click en el icono **`</>`** (Web)
3. Nombre del app: `Red Solidaria Web`
4. **NO** marques "Firebase Hosting" (no lo necesitamos)
5. Click en **"Registrar app"**
6. Vas a ver un objeto `firebaseConfig` como este:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "red-solidaria-alimentos.firebaseapp.com",
  projectId: "red-solidaria-alimentos",
  storageBucket: "red-solidaria-alimentos.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

7. **Copiá esos valores** (los vas a pegar en el paso 4)

### 3. Habilitar métodos de autenticación

1. En el menú izquierdo, andá a **"Authentication"** → **"Get started"**
2. En la pestaña **"Sign-in method"**, habilitá:
   - ✅ **Google** (click → habilitar → seleccionar email de soporte → guardar)
   - ✅ **Correo electrónico/contraseña** (Email/Password) → habilitar → guardar
3. En la pestaña **"Settings"** → **"Authorized domains"**, verificá que esté el dominio donde vas a hostear la app (por defecto ya incluye `localhost`)

### 4. Crear base de datos Firestore

1. En el menú izquierdo, andá a **"Firestore Database"** → **"Create database"**
2. Seleccioná **"Start in test mode"** (para probar)
3. Ubicación: `southamerica-east1` (la más cercana a Argentina)
4. Click en **"Enable"**

> ⚠️ **Importante**: El modo "test" expira en 30 días. Después tendrás que configurar reglas de seguridad. Para producción, usá estas reglas:
>
> ```
> rules_version = '2';
> service cloud.firestore {
>   match /databases/{database}/documents {
>     match /usuarios/{userId}/perfil/{document=**} {
>       allow read, write: if request.auth != null && request.auth.uid == userId;
>     }
>     match /excedentes/{document=**} {
>       allow read: if true;
>       allow write: if request.auth != null;
>     }
>   }
> }
> ```

### 5. Pegar credenciales en el código

Abrí el archivo `src/firebase.ts` y reemplazá los placeholders con tus credenciales:

```ts
const firebaseConfig = {
  apiKey: "AIzaSy...TU_API_KEY_REAL",
  authDomain: "red-solidaria-alimentos.firebaseapp.com",
  projectId: "red-solidaria-alimentos",
  storageBucket: "red-solidaria-alimentos.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

### 6. ¡Listo!

Corré la app de nuevo:
```bash
npm run dev
```

Ahora:
- ✅ El botón de Google abre una ventana real de Google para autenticarse
- ✅ Email/password crea usuarios reales en Firebase
- ✅ La sesión persiste (si recargás, seguís logueado)
- ✅ Los datos del comercio se guardan en Firestore
- ✅ El mensaje "Modo demo activo" desaparece

---

## 🧪 Probar que funciona

1. Abrí la app
2. Click en **"Iniciar sesión"** o **"Crear cuenta"**
3. Probá **"Continuar con Google"** → debería abrirse la ventana de Google
4. O creá una cuenta con email/password
5. Completá el onboarding (datos del comercio)
6. Recargá la página → deberías seguir logueado con tus datos

---

## 📊 Ver usuarios en Firebase Console

- **Authentication** → pestaña **"Users"**: vas a ver todos los usuarios registrados
- **Firestore Database**: vas a ver las colecciones `usuarios` y `excedentes` con los datos reales

---

## 💰 Costos

Firebase tiene un **plan gratuito (Spark)** muy generoso:
- 50.000 lecturas/día en Firestore
- 20.000 escrituras/día en Firestore
- Autenticación ilimitada (Google, email/password)
- 1 GB de almacenamiento

Para una app comunitaria como esta, el plan gratuito alcanza y sobra.

---

## 🐛 Problemas comunes

**"auth/unauthorized-domain"**
→ Agregá tu dominio en Authentication → Settings → Authorized domains

**"Missing or insufficient permissions"**
→ Revisá las reglas de Firestore (ver paso 4)

**El botón de Google no abre la ventana**
→ Verificá que el popup blocker del navegador no esté bloqueando el sitio
→ Verificá que habilitaste Google en Authentication → Sign-in method

---

## 🔐 Seguridad (para producción)

Antes de lanzar a producción:

1. **Reglas de Firestore**: Cambiá de "test mode" a reglas personalizadas (ver paso 4)
2. **API keys**: Las API keys de Firebase son públicas por diseño, pero podés restringir dominios en Google Cloud Console
3. **Variables de entorno**: Para mayor seguridad, mové las credenciales a variables de entorno (`.env`)
