# DJ ENIGMA - Bot Musical para Discord

DJ ENIGMA es un bot musical avanzado para Discord, desarrollado en Node.js, que permite reproducir canciones y playlists de YouTube, buscar música, controlar la cola, activar reproducción automática, y mucho más.

---

## 🚀 Características

- Reproduce canciones y playlists de YouTube.
- Búsqueda inteligente por texto.
- Controles interactivos con botones (pausa, saltar, anterior, detener, cola, autoplay, shuffle).
- Reproducción automática de canciones similares.
- Soporte para cola de usuario y cola automática.
- Panel de control con botones y mensajes embebidos.
- Manejo de inactividad y desconexión automática.

---

## ⚠️ Importante

**Este bot solo funciona de manera local (en tu PC personal).**  
No funcionará correctamente en servidores, VPS o servicios en la nube, ya que YouTube rechaza peticiones realizadas por servidores/remotos.  
Esto es una restricción de YouTube y no del bot.

---

## 🖥️ Requisitos

- **Node.js 18.x LTS** (no funciona en Node 20/22 ni versiones superiores)
- **npm** (gestor de paquetes de Node.js)
- **Python 3.x** (para compilar dependencias nativas)
- **Visual Studio Build Tools** (para compilar dependencias nativas en Windows)
- **Token de bot de Discord** (crea tu bot en [Discord Developer Portal](https://discord.com/developers/applications))

---

## 🛠️ Instalación

1. **Clona este repositorio o descarga los archivos.**

2. **Instala las dependencias:**
  ```bash
  npm install
  ```

3. **Crea un archivo `.env` en la raíz del proyecto con tu token Discord:**
  ```
  TOKEN=tu_token_de_discord_aqui
  ```

4. **Ejecuta el bot:**
  ```bash
  npm start
  ```

---

## 📝 Comandos principales

- `!play <url o texto>` — Reproduce una canción o playlist de YouTube.
- `!pause` — Pausa la música.
- `!resume` — Reanuda la música.
- `!skip` — Salta a la siguiente canción.
- `!stop` — Detiene la música y desconecta el bot.
- `!queue` — Muestra la cola de reproducción.

También puedes controlar la música usando los botones debajo de los mensajes del bot.

---

## ❗ Notas importantes

- **Solo funciona en tu PC local.**  
  Si intentas ejecutarlo en un servidor, VPS o servicio en la nube, YouTube bloqueará las peticiones y el bot no podrá reproducir música.
- **No compartas tu token de Discord.**
- **No uses este bot para fines comerciales.**

