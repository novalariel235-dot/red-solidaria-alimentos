# Red Solidaria - Vinculación de Alimentos

Aplicación web para conectar comercios locales con comedores comunitarios en Villa Regina, permitiendo la donación de excedentes de alimentos.

## 🎯 Descripción

La Red Solidaria es una plataforma que facilita la donación de alimentos excedentes de comercios locales (panaderías, verdulerías, almacenes) a comedores comunitarios. Utiliza inteligencia artificial para procesar las publicaciones de forma natural y automática.

## ✨ Características

- **Autenticación**: Login con Google o email/password
- **Publicación inteligente**: Los comercios publican en texto libre y la IA estructura la información
- **Sistema de reservas**: Los comedores pueden reservar excedentes disponibles
- **Notificaciones automáticas**: Alertas en tiempo real para comercios y comedores
- **Dashboard personalizado**: Diferente según el tipo de usuario (comercio/comedor)
- **Modo oscuro**: Interfaz adaptable
- **Mapa interactivo**: Ubicación validada con OpenStreetMap
- **Responsive**: Funciona en desktop y mobile

## 🛠️ Tecnologías

- **Frontend**: React + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Backend**: Firebase (Authentication + Firestore)
- **Mapas**: Leaflet + OpenStreetMap
- **Iconos**: Lucide React

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]

# Instalar dependencias
npm install

# Configurar Firebase
# Editar src/firebase.ts con tus credenciales

# Iniciar servidor de desarrollo
npm run dev
```

## 🔥 Configuración de Firebase

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitar Authentication (Google + Email/Password)
3. Crear Firestore Database
4. Copiar credenciales en `src/firebase.ts`
5. Crear índices compuestos necesarios (ver FIRESTORE_RULES.md)

## 📁 Estructura del proyecto

```
src/
├── components/          # Componentes React
│   ├── Dashboard.tsx
│   ├── MisPublicaciones.tsx
│   ├── PublicacionesDisponibles.tsx
│   ├── MisReservas.tsx
│   └── ...
├── firebase.ts         # Configuración Firebase
├── services.ts         # Servicios y funciones de Firestore
├── App.tsx             # Componente principal
└── main.tsx            # Punto de entrada
```

## 👥 Tipos de usuario

### Comercios
- Publicar excedentes
- Gestionar publicaciones
- Aceptar/rechazar reservas
- Ver impacto de donaciones

### Comedores
- Ver excedentes disponibles
- Reservar alimentos
- Gestionar reservas
- Marcar entregas completadas

## 📄 Licencia

Este proyecto fue desarrollado como parte de una iniciativa social para reducir el desperdicio de alimentos y ayudar a comedores comunitarios.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abrí un issue primero para discutir los cambios propuestos.

---

**Desarrollado con ❤️ para Villa Regina**
