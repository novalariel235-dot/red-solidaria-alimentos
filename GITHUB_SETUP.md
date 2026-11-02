# 📤 Guía para subir el proyecto a GitHub

## Paso 1: Crear cuenta en GitHub (si no tenés)

1. Andá a [github.com](https://github.com)
2. Creá una cuenta gratuita si no tenés una

## Paso 2: Crear un nuevo repositorio

1. En GitHub, hacé click en el botón **"+"** arriba a la derecha → **"New repository"**
2. Completá los datos:
   - **Repository name**: `red-solidaria-alimentos` (o el nombre que prefieras)
   - **Description**: "Plataforma para conectar comercios con comedores comunitarios"
   - **Public** o **Private** (según prefieras)
   - ❌ **NO marques** "Add a README file" (ya lo creamos)
   - ❌ **NO marques** "Add .gitignore" (ya lo creamos)
   - ❌ **NO marques** "Choose a license" (podés agregarlo después)
3. Hacé click en **"Create repository"**

## Paso 3: Conectar tu proyecto local con GitHub

Abrí la terminal en la carpeta de tu proyecto y ejecutá estos comandos **uno por uno**:

```bash
# Inicializar git (si no lo hiciste antes)
git init

# Agregar todos los archivos
git add .

# Hacer el primer commit
git commit -m "Initial commit: Red Solidaria - Vinculación de Alimentos"

# Cambiar el nombre de la rama principal a 'main'
git branch -M main

# Conectar con tu repositorio de GitHub
# ⚠️ REEMPLAZA 'TU_USUARIO' con tu nombre de usuario de GitHub
git remote add origin https://github.com/TU_USUARIO/red-solidaria-alimentos.git

# Subir el código a GitHub
git push -u origin main
```

## Paso 4: Verificar en GitHub

1. Volvé a tu repositorio en GitHub
2. Recargá la página (F5)
3. Deberías ver todos los archivos del proyecto

## ✅ ¡Listo!

Tu proyecto ya está en GitHub.

---

## 🔄 Para actualizar el código en el futuro

Cuando hagas cambios y quieras subirlos:

```bash
# Ver qué archivos cambiaste
git status

# Agregar los cambios
git add .

# Hacer commit con un mensaje descriptivo
git commit -m "Descripción de los cambios"

# Subir a GitHub
git push
```

---

## 🐛 Problemas comunes

### Error: "git: command not found"
**Solución**: Necesitás instalar Git
- **Windows**: Descargá desde [git-scm.com](https://git-scm.com/download/win)
- **Mac**: Ejecutá `xcode-select --install` en la terminal
- **Linux**: `sudo apt-get install git` (Ubuntu/Debian)

### Error: "Authentication failed"
**Solución**: GitHub ya no acepta contraseñas. Necesitás un token:
1. Andá a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generá un nuevo token con permisos de "repo"
3. Usá ese token cuando te pida la contraseña

### Error: "Updates were rejected because the remote contains work"
**Solución**: Primero traé los cambios de GitHub:
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

---

## 📝 Comandos útiles

```bash
# Ver el estado de los archivos
git status

# Ver el historial de commits
git log

# Deshacer cambios en un archivo
git checkout -- nombre_archivo

# Crear una nueva rama
git checkout -b nombre-rama

# Volver a la rama principal
git checkout main
```

---

## 🔐 Seguridad

⚠️ **IMPORTANTE**: Nunca subas archivos con información sensible:
- ❌ Credenciales de Firebase (apiKey, etc.)
- ❌ Contraseñas
- ❌ Tokens de acceso
- ❌ Archivos .env

El archivo `.gitignore` ya está configurado para evitar esto, pero siempre verificá antes de hacer push.

---

¿Necesitás ayuda con algún paso específico?
