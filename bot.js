require('dotenv').config();
const libsodium = require('libsodium-wrappers');
const ffmpeg = require('ffmpeg-static');
const opus = require('@discordjs/opus');

const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus, 
    VoiceConnectionStatus, 
    entersState,
    NoSubscriberBehavior,
    StreamType,
    generateDependencyReport
} = require('@discordjs/voice');

const ytdl = require('@distube/ytdl-core');
const YTMusic = require('ytmusic-api');
const YouTube = require('youtube-sr').default;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const queues = new Map();
const connections = new Map();
const players = new Map();
const inactivityTimers = new Map();
const playedSongs = new Map();
const playedTitles = new Map();
const autoPlayEnabled = new Map();
const shuffleEnabled = new Map();
const previousSongs = new Map();
const controlMessages = new Map();
const playlistLoading = new Map();

class MusicQueue {
    constructor() {
        this.userQueue = []; 
        this.autoQueue = []; 
        this.current = null;
        this.isPlaying = false;
        this.isPaused = false;
    }

    addUser(song) {
        this.userQueue.push(song);
    }

    addAuto(song) {
        this.autoQueue.push(song);
    }

    next() {
        if (this.userQueue.length > 0) {
            return this.userQueue.shift();
        }
        return this.autoQueue.shift();
    }

    clear() {
        this.userQueue = [];
        this.autoQueue = [];
        this.current = null;
    }

    isEmpty() {
        return this.userQueue.length === 0 && this.autoQueue.length === 0;
    }

    getTotalLength() {
        return this.userQueue.length + this.autoQueue.length;
    }

    getUserQueueLength() {
        return this.userQueue.length;
    }

    getAutoQueueLength() {
        return this.autoQueue.length;
    }

    clearAutoQueue() {
        this.autoQueue = [];
    }
    
    shuffleUserQueue() {
        for (let i = this.userQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.userQueue[i], this.userQueue[j]] = [this.userQueue[j], this.userQueue[i]];
        }
    }
}

function isYouTubeURL(url) {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(url);
}

function isPlaylist(url) {
    return url.includes('list=') || url.includes('/playlist');
}

async function getPlaylistSongs(playlistUrl) {
    try {
        const playlist = await YouTube.getPlaylist(playlistUrl);
        return playlist.videos || [];
    } catch (error) {
        return [];
    }
}

async function searchYouTube(query) {
    try {
        const results = await YouTube.search(query, { limit: 1, type: 'video' });
        return results[0] || null;
    } catch (error) {
        return null;
    }
}

async function getSongInfo(url) {
    try {
        const info = await ytdl.getInfo(url, {
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        });
        return {
            title: info.videoDetails.title,
            url: url,
            duration: info.videoDetails.lengthSeconds,
            thumbnail: info.videoDetails.thumbnails[0]?.url,
            author: info.videoDetails.author?.name || '',
            category: info.videoDetails.category || '',
            views: parseInt(info.videoDetails.viewCount) || 0
        };
    } catch (error) {
        console.error('Error ytdl:', error.message);
        throw new Error(`Error: ${error.message}`);
    }
}

let ytmusic = null;

async function initializeYTMusic() {
    try {
        ytmusic = new YTMusic();
        await ytmusic.initialize();
        return true;
    } catch (error) {
        console.error('Error inicializando YTMusic:', error.message);
        ytmusic = null;
        return false;
    }
}

function extractArtistAndSong(title) {
    const patterns = [
        /^(.+?)\s*-\s*(.+)$/,     
        /^(.+?)\s*\|\s*(.+)$/,    
        /^(.+?)\s*by\s*(.+)$/i, 
        /^(.+?)\s*\((.+?)\)$/   
    ];
    
    for (const pattern of patterns) {
        const match = title.match(pattern);
        if (match) {
            return {
                song: match[1].trim(),
                artist: match[2].trim()
            };
        }
    }
    
    return { song: title, artist: null };
}

function isSimilarSong(song1, song2) {
    const normalize = (str) => str
        .toLowerCase()
        .replace(/[\[\](){}]/g, '')
        .replace(/official|video|music|mv|hd|4k|lyrics|audio|remix|cover/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    
    const title1 = normalize(song1);
    const title2 = normalize(song2);

    if (title1.includes(title2) || title2.includes(title1)) {
        const lengthDiff = Math.abs(title1.length - title2.length);
        return lengthDiff < 20;
    }
    
    return false;
}

async function getNextRecommendation(currentSong, guildId) {
    const played = playedSongs.get(guildId) || new Set();
    const playedTitlesList = playedTitles.get(guildId) || new Set();
    
    if (!ytmusic) return null;
    
    try {
        const { song, artist } = extractArtistAndSong(currentSong.title);

        if (artist && artist.length > 2) {
            const results = await ytmusic.searchSongs(artist, { limit: 10 });
            const candidate = findBestCandidate(results, currentSong, played, playedTitlesList, 'artist');
            if (candidate && candidate.score >= 70) return candidate;
        }

        if (currentSong.author) {
            const results = await ytmusic.searchSongs(currentSong.author, { limit: 8 });
            const candidate = findBestCandidate(results, currentSong, played, playedTitlesList, 'channel');
            if (candidate && candidate.score >= 70) return candidate;
        }
        
        return null;
        
    } catch (error) {
        return null;
    }
}

function findBestCandidate(results, currentSong, played, playedTitlesList, source) {
    for (const s of results) {
        const song = {
            url: `https://www.youtube.com/watch?v=${s.videoId}`,
            title: `${s.name} - ${s.artist?.name || 'Unknown'}`,
            duration: { seconds: s.duration?.seconds || 0 },
            channel: { name: s.artist?.name || 'Unknown' },
            thumbnail: s.thumbnails?.[0]?.url || ''
        };
        
        if (played.has(song.url) || song.url === currentSong.url) continue;
        if (isSimilarSong(song.title, currentSong.title)) continue;
        
        let isPlayed = false;
        for (const playedTitle of playedTitlesList) {
            if (isSimilarSong(song.title, playedTitle)) {
                isPlayed = true;
                break;
            }
        }
        if (isPlayed) continue;
        
        let score = source === 'artist' ? 100 : 80;
        const duration = song.duration?.seconds || 0;
        if (duration > 60 && duration < 400) score += 20;
        
        return { ...song, score };
    }
    return null;
}

async function getYouTubeFallback(currentSong, guildId) {
    const played = playedSongs.get(guildId) || new Set();
    
    try {
        const { artist } = extractArtistAndSong(currentSong.title);
        const searchTerm = artist || currentSong.author;
        
        if (!searchTerm) return null;
        
        const results = await YouTube.search(searchTerm, { limit: 10, type: 'video' });
        
        for (const video of results) {
            if (!video?.url || !video?.title) continue;
            if (played.has(video.url) || video.url === currentSong.url) continue;
            
            const title = video.title.toLowerCase();
            if (title.includes('playlist') || title.includes('mix')) continue;
            if (isSimilarSong(video.title, currentSong.title)) continue;
            
            return video;
        }
        
        return null;
        
    } catch (error) {
        return null;
    }
}

async function getNextAutoSong(currentSong, guildId) {
    if (!playedSongs.has(guildId)) playedSongs.set(guildId, new Set());
    if (!playedTitles.has(guildId)) playedTitles.set(guildId, new Set());
    
    const played = playedSongs.get(guildId);
    const playedTitlesList = playedTitles.get(guildId);
    
    let nextVideo = await getNextRecommendation(currentSong, guildId);
    
    if (!nextVideo) {
        nextVideo = await getYouTubeFallback(currentSong, guildId);
    }
    
    if (!nextVideo) return null;
    
    try {
        const songInfo = await getSongInfo(nextVideo.url);
        
        played.add(nextVideo.url);
        const normalizedTitle = nextVideo.title
            .replace(/[\[\](){}]/g, '')
            .replace(/official|video|music|mv|hd|4k|lyrics/gi, '')
            .toLowerCase()
            .trim();
        playedTitlesList.add(normalizedTitle);
        
        return songInfo;
        
    } catch (error) {
        return null;
    }
}

function clearInactivityTimer(guildId) {
    if (inactivityTimers.has(guildId)) {
        clearTimeout(inactivityTimers.get(guildId));
        inactivityTimers.delete(guildId);
    }
}

function setInactivityTimer(guildId, channel) {
    clearInactivityTimer(guildId);
    const timer = setTimeout(() => {
        const connection = connections.get(guildId);
        if (connection) {
            connection.destroy();
            connections.delete(guildId);
            players.delete(guildId);
            queues.delete(guildId);
            playedSongs.delete(guildId);
            playedTitles.delete(guildId);
            channel.send('🚪 Saliendo del canal por inactividad (5 minutos)');
        }
    }, 5 * 60 * 1000);
    inactivityTimers.set(guildId, timer);
}

function createMusicControls(guildId) {
    const isShuffled = shuffleEnabled.get(guildId) || false;
    const isAutoPlay = autoPlayEnabled.get(guildId) || false;
    const hasPrevious = previousSongs.has(guildId) && previousSongs.get(guildId).length > 0;
    const queue = queues.get(guildId);
    const isPaused = queue?.isPaused || false;
    const isLoading = playlistLoading.get(guildId) || false;
    
    const row1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('previous')
                .setLabel('⏮️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(!hasPrevious || isLoading),
            new ButtonBuilder()
                .setCustomId('pause')
                .setLabel(isPaused ? '▶️' : '⏸️')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('skip')
                .setLabel('⏭️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(isLoading),
            new ButtonBuilder()
                .setCustomId('stop')
                .setLabel('⏹️')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('queue')
                .setLabel('📋')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(isLoading)
        );
    
    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('shuffle')
                .setLabel(isShuffled ? '🔀 ON' : '🔀 OFF')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(isLoading),
            new ButtonBuilder()
                .setCustomId('autoplay')
                .setLabel(isAutoPlay ? '🔄 ON' : '🔄 OFF')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(isLoading)
        );
    
    return [row1, row2];
}

async function playNext(guildId, textChannel) {
    await libsodium.ready;  
    const queue = queues.get(guildId);
    let player = players.get(guildId);
    const connection = connections.get(guildId);
    if (!queue || !connection) return;
    clearInactivityTimer(guildId);
    if (!player) {
        player = createAudioPlayer();
        
        player.on(AudioPlayerStatus.Idle, () => {
            playNext(guildId, textChannel);
        });

        player.on('error', error => {
            console.error('Error en el reproductor:', error);
            textChannel.send('❌ Error en la reproducción');
            playNext(guildId, textChannel);
        });

        connection.subscribe(player);
        players.set(guildId, player);
    }

    let nextSong = queue.next();
    
    if (!nextSong && queue.current && queue.isEmpty() && autoPlayEnabled.get(guildId)) {
        const baseSong = queue.current;
        const autoSong = await getNextAutoSong(baseSong, guildId);
        if (autoSong) {
            queue.addAuto(autoSong);
            nextSong = queue.next();
        }
    }

    if (!nextSong) {
        queue.current = null;
        queue.isPlaying = false;
        setInactivityTimer(guildId, textChannel);
        textChannel.send('✅ Cola de reproducción terminada');
        return;
    }

    try {
        if (queue.current) {
            if (!previousSongs.has(guildId)) {
                previousSongs.set(guildId, []);
            }
            const prevList = previousSongs.get(guildId);
            prevList.push(queue.current);
            if (prevList.length > 10) prevList.shift();
        }
        
        queue.current = nextSong;
        queue.isPlaying = true;
        queue.isPaused = false;
        if (player.state.status !== AudioPlayerStatus.Idle) {
            player.stop(true);
        }

        const stream = ytdl(nextSong.url, { 
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 25,
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        });
        stream.on('error', (error) => {
            console.error('Error en el stream:', error);
            textChannel.send(`❌ Error en el stream de audio: ${error.message}`);
            setTimeout(() => {
                playNext(guildId, textChannel);
            }, 1000);
        });
        
        const resource = createAudioResource(stream, { 
            inlineVolume: true,
            inputType: StreamType.Arbitrary
        });
        if (resource.volume) {
            resource.volume.setVolume(1.0);
        }
        
        player.play(resource);
        
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🎵 Reproduciendo ahora')
            .setDescription(`**${nextSong.title}**`)
            .setThumbnail(nextSong.thumbnail)
            .addFields({ 
                name: 'Playlist', 
                value: `${queue.getUserQueueLength() + queue.getAutoQueueLength()}`,
                inline: false 
            });

        const controls = createMusicControls(guildId);
        const controlMessage = await textChannel.send({ embeds: [embed], components: controls });
        controlMessages.set(guildId, controlMessage);

    } catch (error) {
        console.error('Error en playNext:', error);
        textChannel.send(`❌ Error reproduciendo: ${error.message}`);
        setTimeout(() => {
            playNext(guildId, textChannel);
        }, 1000);
    }
}

client.on('ready', async () => {
    await libsodium.ready;
    
    console.log(`Bot conectado como ${client.user.tag}`);
    await initializeYTMusic();
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    
    const guildId = interaction.guild.id;
    
    try {
        switch (interaction.customId) {
            case 'pause':
                const pausePlayer = players.get(guildId);
                const pauseQueue = queues.get(guildId);
                if (pausePlayer && pauseQueue?.isPlaying && !pauseQueue.isPaused) {
                    pausePlayer.pause();
                    pauseQueue.isPaused = true;
                    setInactivityTimer(guildId, interaction.channel);
                    const controls = createMusicControls(guildId);
                    await interaction.update({ components: controls });
                } else if (pausePlayer && pauseQueue?.isPaused) {
                    pausePlayer.unpause();
                    pauseQueue.isPaused = false;
                    clearInactivityTimer(guildId);
                    const controls = createMusicControls(guildId);
                    await interaction.update({ components: controls });
                } else {
                    await interaction.reply({ content: '❌ No hay música reproduciéndose', ephemeral: true });
                }
                break;
                
            case 'skip':
                const skipPlayer = players.get(guildId);
                const skipQueue = queues.get(guildId);
                if (skipPlayer && skipQueue?.isPlaying) {
                    if (shuffleEnabled.get(guildId) && skipQueue.getUserQueueLength() > 0) {
                        skipQueue.shuffleUserQueue();
                    }
                    skipPlayer.stop(true);
                    await interaction.reply({ content: '⏭️ Canción saltada', ephemeral: true });
                } else {
                    await interaction.reply({ content: '❌ No hay música reproduciéndose', ephemeral: true });
                }
                break;
                
            case 'previous':
                const prevList = previousSongs.get(guildId);
                if (prevList && prevList.length > 0) {
                    const prevSong = prevList.pop();
                    const currentQueue = queues.get(guildId);
                    if (currentQueue.current) {
                        currentQueue.userQueue.unshift(currentQueue.current);
                    }
                    currentQueue.userQueue.unshift(prevSong);
                    const prevPlayer = players.get(guildId);
                    if (prevPlayer) {
                        prevPlayer.stop(true);
                    }
                    await interaction.reply({ content: '⏮️ Canción anterior', ephemeral: true });
                } else {
                    await interaction.reply({ content: '❌ No hay canción anterior', ephemeral: true });
                }
                break;
                
            case 'stop':
                const stopConnection = connections.get(guildId);
                const stopQueue = queues.get(guildId);
                if (stopConnection) {
                    const stopPlayer = players.get(guildId);
                    if (stopPlayer) {
                        stopPlayer.stop(true);
                        stopPlayer.removeAllListeners();
                    }
                    if (stopQueue) stopQueue.clear();
                    clearInactivityTimer(guildId);

                    stopConnection.destroy();

                    connections.delete(guildId);
                    players.delete(guildId);
                    queues.delete(guildId);
                    playedSongs.delete(guildId);
                    playedTitles.delete(guildId);
                    autoPlayEnabled.delete(guildId);
                    shuffleEnabled.delete(guildId);
                    previousSongs.delete(guildId);
                    controlMessages.delete(guildId);
                    playlistLoading.delete(guildId);
                    
                    await interaction.reply({ content: '⏹️ Música detenida y bot desconectado', ephemeral: true });
                } else {
                    await interaction.reply({ content: '❌ El bot no está conectado', ephemeral: true });
                }
                break;
                
            case 'queue':
                const queueInfo = queues.get(guildId);
                if (!queueInfo || (!queueInfo.current && queueInfo.isEmpty())) {
                    return await interaction.reply({ content: '❌ La cola está vacía', ephemeral: true });
                }

                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('🎵 Cola de Reproducción');

                if (queueInfo.current) {
                    embed.addFields({ 
                        name: '▶️ Reproduciendo ahora', 
                        value: queueInfo.current.title,
                        inline: false 
                    });
                }

                let allQueueText = '';
                let totalCount = 0;
                
                if (queueInfo.getUserQueueLength() > 0) {
                    const userQueue = queueInfo.userQueue;
                    
                    for (let i = 0; i < userQueue.length; i++) {
                        const line = `▫️ **${totalCount + 1}.** ${userQueue[i].title}\n`;
                        if (allQueueText.length + line.length > 1000) {
                            allQueueText += `\n… **y ${queueInfo.getUserQueueLength() + queueInfo.getAutoQueueLength() - totalCount} más**`;
                            break;
                        }
                        allQueueText += line;
                        totalCount++;
                    }
                }
                
                if (queueInfo.getAutoQueueLength() > 0 && allQueueText.length < 1000) {
                    const autoQueue = queueInfo.autoQueue;
                    
                    for (let i = 0; i < autoQueue.length; i++) {
                        const line = `▫️ **${totalCount + 1}.** ${autoQueue[i].title}\n`;
                        if (allQueueText.length + line.length > 1000) {
                            allQueueText += `\n… **y ${queueInfo.getUserQueueLength() + queueInfo.getAutoQueueLength() - totalCount} más**`;
                            break;
                        }
                        allQueueText += line;
                        totalCount++;
                    }
                }
                
                if (allQueueText) {
                    embed.addFields({ 
                        name: `🎵 Colas (${queueInfo.getUserQueueLength() + queueInfo.getAutoQueueLength()} canciones)`, 
                        value: allQueueText,
                        inline: false 
                    });
                }

                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
                
            case 'autoplay':
                const currentState = autoPlayEnabled.get(guildId) || false;
                autoPlayEnabled.set(guildId, !currentState);
                const newState = !currentState;
                const autoControls = createMusicControls(guildId);
                await interaction.update({ components: autoControls });
                break;
                
            case 'shuffle':
                const currentShuffle = shuffleEnabled.get(guildId) || false;
                shuffleEnabled.set(guildId, !currentShuffle);
                const shuffleControls = createMusicControls(guildId);
                await interaction.update({ components: shuffleControls });
                break;
                

        }
    } catch (error) {
        console.error('Error en interacción:', error);
        if (!interaction.replied) {
            await interaction.reply({ content: '❌ Error procesando acción', ephemeral: true });
        }
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const guildId = message.guild.id;

    try {
        switch (command) {
            case 'play':
                if (!args[0]) {
                    return message.reply('❌ Proporciona una URL de YouTube o texto para buscar');
                }

                const voiceChannel = message.member.voice.channel;
                if (!voiceChannel) {
                    return message.reply('❌ Debes estar en un canal de voz');
                }

                let songUrl;
                const input = args.join(' ');
                
                if (!queues.has(guildId)) {
                    queues.set(guildId, new MusicQueue());
                }
                if (!autoPlayEnabled.has(guildId)) {
                    autoPlayEnabled.set(guildId, true);
                }

                if (!shuffleEnabled.has(guildId)) {
                    shuffleEnabled.set(guildId, false);
                }

                const queue = queues.get(guildId);
                
                if (!connections.has(guildId)) {
                    await libsodium.ready;
                    
                    const connection = joinVoiceChannel({
                        channelId: voiceChannel.id,
                        guildId: guildId,
                        adapterCreator: message.guild.voiceAdapterCreator,
                        selfDeaf: true,
                        selfMute: false
                    });

                    connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
                        try {
                            await Promise.race([
                                entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                                entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                            ]);
                        } catch (error) {
                            if (connection.state.status === VoiceConnectionStatus.Disconnected) {
                                connection.destroy();
                                connections.delete(guildId);
                                players.delete(guildId);
                                message.channel.send('❌ Desconectado del canal de voz');
                            }
                        }
                    });

                    const player = createAudioPlayer({
                        behaviors: {
                            noSubscriber: NoSubscriberBehavior.Pause,
                        },
                    });
                    
                    player.on(AudioPlayerStatus.Idle, () => {
                        playNext(guildId, message.channel);
                    });

                    player.on('error', error => {
                        console.error('Error en el reproductor:', error);
                        message.channel.send('❌ Error en la reproducción');
                        player.stop(true);
                        setTimeout(() => {
                            playNext(guildId, message.channel);
                        }, 1000);
                    });

                    connection.subscribe(player);
                    connections.set(guildId, connection);
                    players.set(guildId, player);
                } else {
                    const existingConnection = connections.get(guildId);
                    if (existingConnection && existingConnection.joinConfig.channelId !== voiceChannel.id) {
                        existingConnection.destroy();
                        
                        const newConnection = joinVoiceChannel({
                            channelId: voiceChannel.id,
                            guildId: guildId,
                            adapterCreator: message.guild.voiceAdapterCreator,
                            selfDeaf: true,
                            selfMute: false
                        });
                        const newPlayer = createAudioPlayer();
                        
                        newPlayer.on(AudioPlayerStatus.Idle, () => {
                            playNext(guildId, message.channel);
                        });
                        
                        newPlayer.on('error', error => {
                            console.error('Error en el reproductor:', error);
                            message.channel.send('❌ Error en la reproducción');
                            newPlayer.stop(true);
                            playNext(guildId, message.channel);
                        });
                        
                        newConnection.subscribe(newPlayer);
                        connections.set(guildId, newConnection);
                        players.set(guildId, newPlayer);
                    }
                }
                
                if (isYouTubeURL(input)) {
                    if (isPlaylist(input)) {
                        const playlistSongs = await getPlaylistSongs(input);
                        if (playlistSongs.length === 0) {
                            return message.reply('❌ No se pudo cargar la playlist');
                        }
                        
                        message.reply(`🎧 Cargando playlist con ${playlistSongs.length} canciones, espere por favor.`);
                        
                        playlistLoading.set(guildId, true);
                        
                        try {
                            const firstSong = await getSongInfo(playlistSongs[0].url);
                            queue.addUser(firstSong);
                            
                            if (!queue.isPlaying) {
                                playNext(guildId, message.channel);
                            }
                        } catch (error) {
                            playlistLoading.set(guildId, false);
                            return message.reply('❌ Error cargando primera canción');
                        }
                        
                        (async () => {
                            for (let i = 1; i < playlistSongs.length; i++) {
                                try {
                                    const songInfo = await getSongInfo(playlistSongs[i].url);
                                    queue.addUser(songInfo);
                                } catch (error) {
                                    continue;
                                }
                            }
                            playlistLoading.set(guildId, false);
                            message.channel.send(`✅ Playlist completada: ${playlistSongs.length} canciones cargadas`);
                            
                            const controlMsg = controlMessages.get(guildId);
                            if (controlMsg && queue.current) {
                                const updatedEmbed = new EmbedBuilder()
                                    .setColor('#00ff00')
                                    .setTitle('🎵 Reproduciendo ahora')
                                    .setDescription(`**${queue.current.title}**`)
                                    .setThumbnail(queue.current.thumbnail)
                                    .addFields({ 
                                        name: 'Playlist', 
                                        value: `${queue.getUserQueueLength() + queue.getAutoQueueLength()}`,
                                        inline: false 
                                    });
                                
                                const updatedControls = createMusicControls(guildId);
                                try {
                                    await controlMsg.edit({ embeds: [updatedEmbed], components: updatedControls });
                                } catch (error) {
                                    console.error('Error actualizando panel de control:', error.message);
                                }
                            }
                        })();
                        
                        break;
                    } else {
                        songUrl = input;
                    }
                } else {
                    const searchResult = await searchYouTube(input);
                    if (!searchResult) {
                        return message.reply('❌ No se encontraron resultados para tu búsqueda');
                    }
                    songUrl = searchResult.url;
                    message.reply(`🔍 Encontrado: **${searchResult.title}**`);
                }

                const songInfo = await getSongInfo(songUrl);

                if (queue.getAutoQueueLength() > 0) {
                    queue.clearAutoQueue();
                }
                
                if (!queue.isPlaying) {
                    queue.addUser(songInfo);
                    playNext(guildId, message.channel);
                } else {
                    queue.addUser(songInfo);
                    message.reply(`✅ **${songInfo.title}** añadida a la cola de usuario (posición ${queue.getUserQueueLength()})`);
                }
                break;

            case 'pause':
                const pausePlayer = players.get(guildId);
                const pauseQueue = queues.get(guildId);
                if (pausePlayer && pauseQueue?.isPlaying) {
                    pausePlayer.pause();
                    pauseQueue.isPaused = true;
                    setInactivityTimer(guildId, message.channel);
                    message.reply('⏸️ Música pausada');
                } else {
                    message.reply('❌ No hay música reproduciéndose');
                }
                break;

            case 'resume':
                const resumePlayer = players.get(guildId);
                const resumeQueue = queues.get(guildId);
                if (resumePlayer && resumeQueue?.isPaused) {
                    resumePlayer.unpause();
                    resumeQueue.isPaused = false;
                    clearInactivityTimer(guildId);
                    message.reply('▶️ Música reanudada');
                } else {
                    message.reply('❌ La música no está pausada');
                }
                break;

            case 'skip':
                const skipQueue = queues.get(guildId);
                const skipPlayer = players.get(guildId);
                if (skipPlayer && skipQueue?.isPlaying) {
                    skipPlayer.stop(true);
                    message.reply('⏭️ Canción saltada');
                } else {
                    message.reply('❌ No hay música reproduciéndose');
                }
                break;

            case 'stop':
                const stopConnection = connections.get(guildId);
                const stopQueue = queues.get(guildId);
                if (stopConnection) {
                    const stopPlayer = players.get(guildId);
                    if (stopPlayer) {
                        stopPlayer.stop(true);
                        stopPlayer.removeAllListeners();
                    }

                    if (stopQueue) stopQueue.clear();
                    clearInactivityTimer(guildId);

                    stopConnection.destroy();

                    connections.delete(guildId);
                    players.delete(guildId);
                    queues.delete(guildId);
                    playedSongs.delete(guildId);
                    playedTitles.delete(guildId);
                    autoPlayEnabled.delete(guildId);
                    shuffleEnabled.delete(guildId);
                    previousSongs.delete(guildId);
                    controlMessages.delete(guildId);
                    playlistLoading.delete(guildId);
                    
                    message.reply('⏹️ Música detenida y bot desconectado');
                } else {
                    message.reply('❌ El bot no está conectado');
                }
                break;

            case 'queue':
                const queueInfo = queues.get(guildId);
                if (!queueInfo || (!queueInfo.current && queueInfo.isEmpty())) {
                    return message.reply('❌ La cola está vacía');
                }

                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('🎵 Cola de Reproducción');

                if (queueInfo.current) {
                    embed.addFields({ 
                        name: '▶️ Reproduciendo ahora', 
                        value: queueInfo.current.title,
                        inline: false 
                    });
                }

                if (queueInfo.getUserQueueLength() > 0) {
                    const userQueueList = queueInfo.userQueue
                        .map((song, index) => `${index + 1}. ${song.title}`)
                        .join('\n');
                    
                    if (userQueueList.length > 1024) {
                        const chunks = [];
                        let currentChunk = '';
                        const songs = queueInfo.userQueue;
                        
                        for (let i = 0; i < songs.length; i++) {
                            const line = `${i + 1}. ${songs[i].title}\n`;
                            if (currentChunk.length + line.length > 1024) {
                                chunks.push(currentChunk);
                                currentChunk = line;
                            } else {
                                currentChunk += line;
                            }
                        }
                        if (currentChunk) chunks.push(currentChunk);
                        
                        chunks.forEach((chunk, index) => {
                            embed.addFields({
                                name: index === 0 ? `👥 Cola de Usuario (${queueInfo.getUserQueueLength()})` : '\u200b',
                                value: chunk,
                                inline: false
                            });
                        });
                    } else {
                        embed.addFields({ 
                            name: `👥 Cola de Usuario (${queueInfo.getUserQueueLength()})`, 
                            value: userQueueList,
                            inline: false 
                        });
                    }
                }
                
                if (queueInfo.getAutoQueueLength() > 0) {
                    const autoQueueList = queueInfo.autoQueue
                        .map((song, index) => `${index + 1}. ${song.title}`)
                        .join('\n');
                    
                    embed.addFields({ 
                        name: `🤖 Cola Automática (${queueInfo.getAutoQueueLength()})`, 
                        value: autoQueueList.length > 1024 ? autoQueueList.substring(0, 1021) + '...' : autoQueueList,
                        inline: false 
                    });
                }

                message.reply({ embeds: [embed] });
                break;

            default:
                if (['play', 'pause', 'resume', 'skip', 'stop', 'queue'].includes(command)) {
                    message.reply('❌ Comando no reconocido. Usa: !play, !pause, !resume, !skip, !stop, !queue');
                }
        }
    } catch (error) {
        console.error('Error:', error);
        message.reply('❌ Ocurrió un error al procesar el comando');
    }
});

if (!process.env.TOKEN || process.env.TOKEN === '') {
    console.error('❌ Error: Debes configurar un token válido en el archivo .env');
    console.error('Visita https://discord.com/developers/applications para obtener tu token');
    process.exit(1);
}

client.login(process.env.TOKEN);