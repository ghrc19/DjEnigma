# DJ ENIGMA

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-16.9+-339933?style=flat-square&logo=nodedotjs" alt="Node.js">
  <img src="https://img.shields.io/badge/Discord.js-14.14.1-5865F2?style=flat-square&logo=discord" alt="Discord.js">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License">
</div>

Bot musical profesional para Discord con gestión inteligente de colas, recomendaciones automáticas y controles interactivos para streaming de audio fluido.

## Características

### Procesamiento de Audio
- Streaming de audio de YouTube de alta calidad con buffering optimizado
- Carga asíncrona de playlists con inicio inmediato de reproducción
- Mecanismos de respaldo inteligentes para servicio ininterrumpido
- Soporte para pistas individuales y playlists completas

### Gestión de Colas
- Sistema de colas híbridas con pistas de usuario y automáticas separadas
- Reproducción basada en prioridades (cola de usuario tiene precedencia)
- Navegación histórica soportando hasta 10 pistas anteriores
- Visualización dinámica de cola con información completa de pistas

### Recomendaciones Inteligentes
- Integración con YTMusic API para sugerencias contextuales
- Algoritmos de detección y filtrado de duplicados
- Reconocimiento de artistas y géneros con puntuación de relevancia (umbral: 70+)
- Población automática de cola basada en patrones de escucha

### Controles Interactivos
- Interfaz basada en botones con actualizaciones en tiempo real
- Controles de reproducción completos (reproducir, pausar, saltar, anterior, detener)
- Modo aleatorio y funcionalidad de reproducción automática configurables
- Paneles de control persistentes con estados dinámicos de botones

## Instalación

### Prerrequisitos
- Node.js v16.9.0 o superior
- Token de Bot de Discord

### Configuración

```bash
# Clonar repositorio
git clone https://github.com/ghrc19/DjEnigma.git
cd "DJ ENIGMA"

# Instalar dependencias
npm install

# Configurar entorno
echo "TOKEN=tu_token_discord_bot" > .env

# Iniciar aplicación
npm start
```

## Uso

### Comandos

| Comando | Función | Ejemplo |
|---------|---------|---------|
| `!play <consulta>` | Reproducir pista o buscar por texto | `!play bohemian rhapsody` |
| `!play <url>` | Reproducir desde URL de YouTube o playlist | `!play https://youtube.com/watch?v=...` |
| `!pause` | Pausar reproducción actual | `!pause` |
| `!resume` | Reanudar reproducción | `!resume` |
| `!skip` | Saltar a siguiente pista | `!skip` |
| `!stop` | Detener reproducción y desconectar | `!stop` |
| `!queue` | Mostrar estado actual de la cola | `!queue` |

### Controles Interactivos

Cada mensaje de pista incluye botones interactivos:
- **⏮️** Navegación a pista anterior
- **⏸️/▶️** Alternar reproducir/pausar
- **⏭️** Saltar a siguiente pista
- **⏹️** Detener y desconectar
- **📋** Vista general de cola
- **🔀** Alternar modo aleatorio
- **🔄** Alternar reproducción automática

## Stack Técnico

| Componente | Versión | Propósito |
|------------|---------|-----------|
| Discord.js | 14.14.1 | Interfaz API de Discord |
| @discordjs/voice | 0.16.1 | Gestión de canales de voz |
| @distube/ytdl-core | 4.13.5 | Extracción de audio de YouTube |
| youtube-sr | 4.3.4 | Funcionalidad de búsqueda en YouTube |
| ytmusic-api | 5.3.0 | Recomendaciones musicales |
| ffmpeg-static | 5.2.0 | Procesamiento de audio |
| opusscript | 0.0.8 | Codificación de audio Opus |

## Requisitos del Sistema

### Entorno de Ejecución
- Node.js v16.9.0+
- 512MB RAM mínimo (1GB+ recomendado)
- Conexión a internet estable

### Permisos de Discord
- Conectar a canales de voz
- Hablar en canales de voz
- Enviar mensajes y embeds
- Usar emojis externos
- Agregar reacciones

## Configuración

### Variables de Entorno
```env
TOKEN=tu_token_discord_bot
```

### Parámetros Configurables
- Tiempo de inactividad: 5 minutos
- Historial de pistas anteriores: máximo 10 pistas
- Umbral de recomendación: puntuación de relevancia 70+
- Límite de resultados de búsqueda: 10 pistas por consulta

### Resumen de Arquitectura
- **Sistema de Colas**: Implementación de cola híbrida con gestión de prioridades
- **Gestión de Estado**: Manejo centralizado de conexiones y estado del reproductor
- **Manejo de Errores**: Mecanismos de respaldo automático y limpieza de recursos
- **Optimización de Memoria**: Gestión eficiente de recursos con recolección automática de basura

## Estructura del Proyecto

```
DJ ENIGMA/
├── bot.js           # Archivo principal de la aplicación
├── package.json     # Dependencias y scripts
├── .env            # Configuración de entorno
└── README.md       # Documentación
```

### Componentes Principales
- **MusicQueue**: Sistema de gestión de colas híbridas
- **getSongInfo()**: Extracción de metadatos de YouTube
- **getNextRecommendation()**: Recomendaciones de pistas impulsadas por IA
- **playNext()**: Lógica de reproducción secuencial
- **createMusicControls()**: Generación de botones interactivos

## Contribuciones

Las contribuciones son bienvenidas. Por favor sigue el flujo de trabajo estándar de GitHub:
1. Fork del repositorio
2. Crear una rama de característica
3. Commit de tus cambios
4. Enviar un pull request


---

<div align="center">
  <strong>Contribución para la comunidad de discord.</strong>
</div>