# Reglas de Firestore para Red Solidaria

Copiá estas reglas en Firebase Console → Firestore Database → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Perfiles de usuarios - solo el dueño puede leer/escribir
    match /usuarios/{userId}/perfil/{document=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Publicaciones - cualquiera autenticado puede leer, solo el dueño escribir
    match /publicaciones/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.usuarioId;
    }
    
    // Comedores - cualquiera puede leer, solo admin puede escribir
    match /comedores/{comedorId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Notificaciones - solo el dueño puede leer/escribir
    match /notificaciones/{notifId} {
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.usuarioId;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.usuarioId;
    }

    // Reservas - comercio y comedor involucrados pueden leer/escribir
    match /reservas/{reservaId} {
      allow read: if request.auth != null && (
        request.auth.uid == resource.data.comercioId ||
        request.auth.uid == resource.data.comedorId
      );
      allow create: if request.auth != null;
      allow update: if request.auth != null && (
        request.auth.uid == resource.data.comercioId ||
        request.auth.uid == resource.data.comedorId
      );
    }

    // Chats - solo participantes pueden leer/escribir
    match /chats/{chatId} {
      allow read: if request.auth != null && 
        request.auth.uid in resource.data.participantes;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        request.auth.uid in resource.data.participantes;
      
      // Mensajes dentro del chat
      match /mensajes/{mensajeId} {
        allow read: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/chats/{chatId}).data.participantes;
        allow create: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/chats/{chatId}).data.participantes;
        allow update: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/chats/{chatId}).data.participantes;
      }
    }
  }
}
```

## Índices necesarios

Después de actualizar las reglas, creá estos índices compuestos en Firebase Console → Firestore Database → Indexes:

1. **Colección: `reservas`**
   - Campos: `comedorId` (Ascendente) + `createdAt` (Descendente)
   
2. **Colección: `reservas`**
   - Campos: `comercioId` (Ascendente) + `createdAt` (Descendente)

3. **Colección: `publicaciones`**
   - Campos: `usuarioId` (Ascendente) + `createdAt` (Descendente)

4. **Colección: `notificaciones`**
   - Campos: `usuarioId` (Ascendente) + `createdAt` (Descendente)

## Estructura de datos

### Colección `reservas`
```
{
  publicacionId: string,
  comedorId: string,
  comedorNombre: string,
  comercioId: string,
  comercioNombre: string,
  mensaje: string,
  estado: 'pendiente' | 'aceptada' | 'rechazada' | 'completada',
  createdAt: timestamp
}
```

### Colección `usuarios/{userId}/perfil/comercio`
```
{
  nombre: string,
  tipo: string,
  tipoUsuario: 'comercio' | 'comedor',
  direccion: string,
  lat: number,
  lng: number,
  telefono: string,
  descripcion: string,
  diasRetiro: string[],
  horarioDesde: string,
  horarioHasta: string,
  capacidad: number (solo comedores)
}
```
