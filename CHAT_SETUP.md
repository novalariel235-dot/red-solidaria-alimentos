# 💬 Sistema de Chat - Guía de Configuración

## ✅ Implementación Completada

El sistema de chat ha sido implementado exitosamente con las siguientes características:

### Características:
- ✅ Chat en tiempo real entre comercios y comedores
- ✅ Lista de conversaciones con último mensaje
- ✅ Ventana de chat con mensajes en tiempo real
- ✅ Notificaciones automáticas de nuevos mensajes
- ✅ Búsqueda de conversaciones
- ✅ Diseño responsive (mobile y desktop)
- ✅ Interfaz moderna estilo WhatsApp

### Flujo de Uso:

#### Para Comedores:
1. Ir a "Excedentes"
2. Ver una publicación disponible
3. Click en "Contactar" (nuevo botón)
4. Se abre automáticamente un chat con el comercio
5. El chat aparece en el módulo "Chat"

#### Para Comercios:
1. Recibir notificación: "Nuevo mensaje de [Comedor]"
2. Ir al módulo "Chat"
3. Ver la conversación con badge de no leído
4. Responder al mensaje

## 🔧 Configuración en Firebase

### 1. Actualizar Reglas de Firestore

Andá a **Firebase Console → Firestore Database → Rules** y reemplazá el contenido con las reglas actualizadas que incluyen la colección `chats`.

### 2. Crear Índices Compuestos

Necesitás crear estos índices en **Firebase Console → Firestore Database → Indexes**:

#### Índice 1: Chats por participante
- **Collection**: `chats`
- **Field 1**: `participantes` → **Array**
- **Query scope**: `Collection`

#### Índice 2: Mensajes por timestamp
- **Collection**: `chats/{chatId}/mensajes`
- **Field 1**: `timestamp` → **Ascending**
- **Query scope**: `Collection`

### 3. Estructura de Datos

```
Firestore:
├── chats/
│   ├── {chatId}/
│   │   ├── participantes: [uid1, uid2]
│   │   ├── nombresParticipantes: ["Comercio X", "Comedor Y"]
│   │   ├── publicacionId: "abc123" (opcional)
│   │   ├── ultimoMensaje: "texto..."
│   │   ├── ultimoMensajeTimestamp: timestamp
│   │   ├── noLeidos: 0
│   │   └── mensajes/
│   │       ├── {mensajeId}/
│   │       │   ├── emisorId: "uid"
│   │       │   ├── emisorNombre: "Nombre"
│   │       │   ├── texto: "mensaje"
│   │       │   ├── timestamp: timestamp
│   │       │   └── leido: false
```

## 🧪 Cómo Probar

### Prueba 1: Iniciar Chat desde Comedor
1. Crear cuenta de **comedor**
2. Crear cuenta de **comercio** en otra ventana/pestaña
3. Desde el comercio, publicar un excedente
4. Desde el comedor, ir a "Excedentes"
5. Click en "Contactar" en la publicación
6. Verificar que se abre el chat
7. Enviar un mensaje
8. Verificar que el comercio recibe notificación

### Prueba 2: Responder desde Comercio
1. Desde el comercio, ir al módulo "Chat"
2. Ver la conversación con badge de no leído
3. Click en la conversación
4. Responder al mensaje
5. Verificar que el comedor recibe el mensaje

### Prueba 3: Tiempo Real
1. Abrir dos ventanas/navegadores
2. Iniciar sesión con cuentas diferentes
3. Enviar mensajes desde ambas
4. Verificar que los mensajes aparecen en tiempo real (cada 3 segundos)

## 🎨 Características de la Interfaz

### Lista de Chats:
- Avatar con inicial del nombre
- Nombre del otro usuario
- Último mensaje (truncado)
- Timestamp relativo ("Hace 2h", "Hace 1d")
- Indicador visual del chat activo

### Ventana de Chat:
- Header con nombre y avatar
- Mensajes en burbujas (verde = mío, blanco = otro)
- Timestamp en cada mensaje
- Input con botón de enviar
- Soporte para Enter para enviar
- Auto-scroll al último mensaje

### Responsive:
- **Desktop**: Lista de chats a la izquierda, conversación a la derecha
- **Mobile**: Vista de lista, al hacer click muestra la conversación con botón "volver"

## 🚀 Próximas Mejoras Sugeridas

1. **Indicador de "escribiendo..."**: Mostrar cuando el otro usuario está escribiendo
2. **Mensajes de voz**: Grabar y enviar notas de voz
3. **Enviar imágenes**: Adjuntar fotos de los alimentos
4. **Confirmación de lectura**: Doble check cuando el mensaje fue leído
5. **Búsqueda de mensajes**: Buscar dentro de una conversación
6. **Notificaciones push**: Notificaciones del navegador incluso con la app cerrada

## 🐛 Solución de Problemas

### Los mensajes no aparecen
- Verificar que los índices de Firestore estén creados
- Verificar las reglas de Firestore permitan acceso a `chats` y `mensajes`
- Revisar la consola del navegador (F12) para ver errores

### No puedo iniciar chat
- Verificar que el usuario tenga `tipoUsuario` definido
- Verificar que la publicación tenga `usuarioId` del comercio
- Revisar la consola para ver el error específico

### Las notificaciones no llegan
- Verificar que la colección `notificaciones` exista
- Verificar las reglas de Firestore para notificaciones
- Revisar que el `usuarioId` del receptor sea correcto

## 📊 Estado Actual

✅ Chat implementado y funcionando
✅ Reglas de Firestore actualizadas
✅ Índices documentados
✅ Interfaz responsive
✅ Notificaciones integradas
✅ Tiempo real (polling cada 3 segundos)

---

**¡El sistema de chat está listo para usar!** 🎉
