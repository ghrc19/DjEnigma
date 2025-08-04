# 🎵 DJ ENIGMA - Discord Music Bot

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord.js">
  <img src="https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube">
</div>

<br>

**DJ ENIGMA** es un bot musical avanzado para Discord que ofrece reproducción de alta calidad con controles interactivos, recomendaciones automáticas inteligentes y gestión de colas híbridas.

## 🚀 Características Principales

### 🎧 **Reproducción Avanzada**
- **Soporte completo de YouTube** - URLs individuales y playlists completas
- **Búsqueda inteligente** - Busca canciones por texto sin necesidad de URLs
- **Reproducción automática** - Continúa con música relacionada cuando termina la cola
- **Calidad de audio superior** - Streaming en alta calidad con ytdl-core
- **Carga asíncrona de playlists** - Primera canción reproduce inmediatamente, resto carga en segundo plano

### 🎛️ **Controles Interactivos**
- **Botones modernos** - Interfaz con botones clickeables y comandos de texto
- **Controles completos** - Play/Pause, Skip, Previous, Stop, Queue
- **Modo Shuffle** - Mezcla aleatoria de la cola de usuario
- **Reproducción automática configurable** - Activa/desactiva según preferencias
- **Estados dinámicos** - Botones se actualizan según el estado actual

### 🤖 **Inteligencia Artificial**
- **Recomendaciones inteligentes** - Usa YTMusic API para sugerencias precisas
- **Filtro de duplicados** - Evita repetir canciones automáticamente
- **Sistema de puntuación** - Solo reproduce música de alta relevancia (score ≥ 70)
- **Detección de artistas** - Reconoce automáticamente artistas y géneros
- **Fallback inteligente** - Si YTMusic falla, usa búsqueda de YouTube

### 📱 **Gestión de Colas Híbridas**
- **Colas separadas** - Cola de usuario y cola automática independientes
- **Prioridad inteligente** - Cola de usuario siempre tiene prioridad
- **Visualización completa** - Muestra ambas colas sin límites artificiales
- **Historial inteligente** - Botón "Previous" para volver hasta 10 canciones anteriores
- **Limpieza automática** - Cola automática se limpia al agregar música manual

## 📦 Instalación

### Prerrequisitos
- **Node.js** v16.9.0 o superior
- **npm** o **yarn**
- **Token de bot de Discord**

### Pasos de instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/ghrc19/DjEnigma.git
   cd "DJ ENIGMA"
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura el token**
   
   Crea un archivo `.env` en la raíz del proyecto:
   ```env
   TOKEN=tu_token_del_bot_discord
   ```

4. **Inicia el bot**
   ```bash
   npm start
   ```
   
   O directamente:
   ```bash
   node bot.js
   ```

## 🎮 Uso

### Comandos de Texto
| Comando | Descripción | Ejemplo |
|---------|-------------|----------|
| `!play <url/texto>` | Reproduce música de YouTube o busca por texto | `!play despacito` |
| `!play <playlist_url>` | Carga playlist completa (primera canción inmediata) | `!play https://youtube.com/playlist?list=...` |
| `!pause` | Pausa la reproducción actual | `!pause` |
| `!resume` | Reanuda la reproducción | `!resume` |
| `!skip` | Salta a la siguiente canción | `!skip` |
| `!stop` | Detiene la música y desconecta el bot | `!stop` |
| `!queue` | Muestra ambas colas (usuario y automática) | `!queue` |

### Funcionalidades Especiales
- **Reproducción automática**: Activada por defecto, continúa con música relacionada
- **Carga asíncrona**: Las playlists cargan la primera canción inmediatamente
- **Detección inteligente**: Reconoce URLs de YouTube y playlists automáticamente
- **Filtro de duplicados**: Evita repetir canciones en recomendaciones automáticas

### Controles Interactivos
Cada canción incluye botones para:
- **⏮️** Canción anterior (hasta 10 canciones)
- **⏸️/▶️** Pausar/Reproducir (alterna dinámicamente)
- **⏭️** Siguiente canción (con shuffle si está activado)
- **⏹️** Detener y desconectar
- **📋** Ver cola completa (ambas colas)
- **🔀** Modo aleatorio ON/OFF (solo cola de usuario)
- **🔄** Reproducción automática ON/OFF (recomendaciones)

## 🛠️ Tecnologías

- **[Discord.js v14.14.1](https://discord.js.org/)** - Librería principal para Discord
- **[@discordjs/voice v0.16.1](https://github.com/discordjs/voice)** - Manejo de audio en canales de voz
- **[@distube/ytdl-core v4.13.5](https://github.com/distube/ytdl-core)** - Descarga de audio de YouTube (fork optimizado)
- **[youtube-sr v4.3.4](https://github.com/DevSnowflake/youtube-sr)** - Búsqueda en YouTube
- **[ytmusic-api v5.3.0](https://github.com/sigma67/ytmusic-api)** - Recomendaciones musicales inteligentes
- **[ffmpeg-static v5.2.0](https://github.com/eugeneware/ffmpeg-static)** - Procesamiento de audio
- **[opusscript v0.0.8](https://github.com/abalabahaha/opusscript)** - Codificación de audio Opus

## 📋 Requisitos del Sistema

- **Node.js**: v16.9.0 o superior
- **RAM**: Mínimo 512MB, recomendado 1GB+
- **CPU**: Cualquier procesador moderno
- **Conexión**: Internet estable para streaming
- **FFmpeg**: Incluido automáticamente (ffmpeg-static)
- **Permisos de Discord**: 
  - Conectar a canales de voz
  - Hablar en canales de voz
  - Enviar mensajes
  - Usar botones interactivos
  - Enviar mensajes embebidos

## 🔧 Configuración Avanzada

### Personalización
- **Tiempo de inactividad**: 5 minutos (configurable en código)
- **Máximo de canciones anteriores**: 10 (configurable)
- **Score mínimo para recomendaciones**: 70 (configurable)
- **Límite de caracteres en cola**: 1024 por campo (Discord)
- **Límite de resultados de búsqueda**: 10 canciones por consulta

### Arquitectura Técnica
- **Sistema de colas híbridas**: `MusicQueue` class con colas separadas
- **Gestión de estado**: Maps para conexiones, reproductores y configuraciones
- **Manejo de errores**: Fallbacks automáticos y recuperación de errores
- **Optimización de memoria**: Limpieza automática de recursos inactivos
- **Streaming eficiente**: Buffer optimizado con `highWaterMark`

## 🔧 Estructura del Proyecto

```
DJ ENIGMA/
├── bot.js              # Archivo principal del bot
├── package.json        # Dependencias y scripts
├── .env               # Variables de entorno (crear)
└── README.md          # Documentación
```

### Clases y Funciones Principales
- **`MusicQueue`**: Manejo de colas híbridas
- **`getSongInfo()`**: Extracción de metadatos de YouTube
- **`getNextRecommendation()`**: IA para recomendaciones
- **`playNext()`**: Lógica de reproducción secuencial
- **`createMusicControls()`**: Generación de botones interactivos

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request
---
<div align="center">
  <strong>Desarrollado con ❤️ para la comunidad de Discord</strong>
</div>