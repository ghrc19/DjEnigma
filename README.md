# 🎵 DJ ENIGMA - Discord Music Bot

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord.js">
  <img src="https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube">
</div>

<br>

**DJ ENIGMA** es un bot musical avanzado para Discord que ofrece reproducción de alta calidad con controles interactivos y recomendaciones automáticas inteligentes.

## 🚀 Características Principales

### 🎧 **Reproducción Avanzada**
- **Soporte completo de YouTube** - URLs individuales y playlists completas
- **Búsqueda inteligente** - Busca canciones por texto sin necesidad de URLs
- **Reproducción automática** - Continúa con música relacionada cuando termina la cola
- **Calidad de audio superior** - Streaming en alta calidad

### 🎛️ **Controles Interactivos**
- **Botones modernos** - Interfaz con botones clickeables (no más comandos de texto)
- **Controles completos** - Play/Pause, Skip, Previous, Stop, Queue
- **Modo Shuffle** - Mezcla aleatoria de canciones
- **Reproducción automática configurable** - Activa/desactiva según preferencias

### 🤖 **Inteligencia Artificial**
- **Recomendaciones inteligentes** - Usa YTMusic API para sugerencias precisas
- **Filtro de duplicados** - Evita repetir canciones automáticamente
- **Sistema de puntuación** - Solo reproduce música de alta relevancia (score ≥ 70)
- **Detección de artistas** - Reconoce automáticamente artistas y géneros

### 📱 **Gestión de Colas**
- **Colas híbridas** - Separa música del usuario y recomendaciones automáticas
- **Visualización completa** - Muestra toda la cola sin límites artificiales
- **Carga en segundo plano** - Las playlists se cargan mientras reproduce la primera canción
- **Historial inteligente** - Botón "Previous" para volver a canciones anteriores

## 📦 Instalación

### Prerrequisitos
- **Node.js** v16.9.0 o superior
- **npm** o **yarn**
- **Token de bot de Discord**

### Pasos de instalación

1. **Clona el repositorio**
   ```bash
   git clone <repository-url>
   cd DJ-ENIGMA
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura el token**
   
   Crea un archivo `.env` en la raíz del proyecto:
   ```env
   TOKEN=tu_token_del_bot_aqui
   ```

4. **Inicia el bot**
   ```bash
   npm start
   ```

## 🎮 Uso

### Comandos de Texto
| Comando | Descripción | Ejemplo |
|---------|-------------|----------|
| `!play <url/texto>` | Reproduce música de YouTube o busca por texto | `!play despacito` |
| `!pause` | Pausa la reproducción actual | `!pause` |
| `!resume` | Reanuda la reproducción | `!resume` |
| `!skip` | Salta a la siguiente canción | `!skip` |
| `!stop` | Detiene la música y desconecta el bot | `!stop` |
| `!queue` | Muestra la cola completa de reproducción | `!queue` |

### Controles Interactivos
Cada canción incluye botones para:
- **⏮️** Canción anterior
- **⏸️/▶️** Pausar/Reproducir
- **⏭️** Siguiente canción
- **⏹️** Detener
- **📋** Ver cola
- **🔀** Modo aleatorio ON/OFF
- **🔄** Reproducción automática ON/OFF

## 🛠️ Tecnologías

- **[Discord.js v14](https://discord.js.org/)** - Librería principal para Discord
- **[@discordjs/voice](https://github.com/discordjs/voice)** - Manejo de audio en canales de voz
- **[ytdl-core](https://github.com/fent/node-ytdl-core)** - Descarga de audio de YouTube
- **[youtube-sr](https://github.com/DevSnowflake/youtube-sr)** - Búsqueda en YouTube
- **[ytmusic-api](https://github.com/sigma67/ytmusic-api)** - Recomendaciones musicales inteligentes

## 📋 Requisitos del Sistema

- **RAM**: Mínimo 512MB, recomendado 1GB+
- **CPU**: Cualquier procesador moderno
- **Conexión**: Internet estable para streaming
- **Permisos de Discord**: 
  - Conectar a canales de voz
  - Hablar en canales de voz
  - Enviar mensajes
  - Usar comandos de barra

## 🔧 Configuración Avanzada

### Variables de Entorno
```env
TOKEN=tu_token_del_bot_aqui
```

### Personalización
- **Tiempo de inactividad**: 5 minutos (configurable en código)
- **Máximo de canciones anteriores**: 10 (configurable)
- **Score mínimo para recomendaciones**: 70 (configurable)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

<div align="center">
  <strong>Desarrollado con ❤️ para la comunidad de Discord</strong>
</div>