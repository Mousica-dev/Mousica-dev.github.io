// Constants and configurations
const SONGS = [
    {
        file: 'assets/audio/Maddy-Soma-OKE.mp4',
        title: 'Oke',
        artist: 'Maddy Soma',
        cover: 'assets/images/album-cover-oke.png'
    },
    {
        file: 'assets/audio/Falling-In-Reverse-Prequel.mp4',
        title: 'Prequel',
        artist: 'Falling In Reverse',
        cover: 'assets/images/album-cover-prequel.png'
    },
    {
        file: 'assets/audio/Godsmack-Bulletproof.mp4',
        title: 'Bulletproof',
        artist: 'Godsmack',
        cover: 'assets/images/album-cover-bulletproof.png'
    }
];

const SPOTIFY_API_URL = 'https://spring-tooth-3a41.golonchy-aitta.workers.dev';
const INITIAL_CHECK_INTERVAL = 5000;
const NORMAL_CHECK_INTERVAL = 30000;
const AUDIO_PATHS = {
    SPOTIFY_DETECT: 'assets/audio/play-when-spotify-is-detected.mp4'
};

// Player state
const playerState = {
    currentSongIndex: Math.floor(Math.random() * SONGS.length),
    isAudioInitialized: false,
    isMusicPlaying: false,
    isSpotifyPlaying: false,
    isLoading: false
};

// Create and configure audio player
const audioPlayer = new Audio();
audioPlayer.volume = 1.0;

// Create UI elements
const ui = createPlayerUI();

// Add these variables at the top with other constants
let lastX = 0;
let lastY = 0;
let lastTimestamp = 0;

function createPlayerUI() {
    const container = document.createElement('div');
    container.className = 'music-player loading';

    const albumCover = document.createElement('img');
    albumCover.className = 'album-cover';
    albumCover.alt = 'Album Cover';
    albumCover.src = 'assets/images/trollge.gif';

    const songInfo = document.createElement('div');
    songInfo.className = 'song-info';
    songInfo.innerHTML = `
        <div class="song-title">Checking Spotify...</div>
        <div class="artist-name">via Last.fm</div>
    `;

    const controls = document.createElement('div');
    controls.className = 'player-controls';
    controls.innerHTML = `
        <button class="play-pause">
            <span class="play-icon">▶️</span>
            <span class="pause-icon" style="display: none;">⏸️</span>
        </button>
    `;

    container.append(albumCover, songInfo, controls);
    document.body.insertBefore(container, document.querySelector('.content-wrapper'));
    controls.querySelector('.play-pause').addEventListener('click', toggleMusic);

    return { container, albumCover, songInfo, controls };
}

// Player functions
function updatePlaybackUI() {
    const playIcon = ui.controls.querySelector('.play-icon');
    const pauseIcon = ui.controls.querySelector('.pause-icon');
    playIcon.style.display = playerState.isMusicPlaying ? 'none' : 'inline';
    pauseIcon.style.display = playerState.isMusicPlaying ? 'inline' : 'none';
}

function toggleMusic() {
    if (playerState.isSpotifyPlaying) return;
    
    if (playerState.isMusicPlaying) {
        audioPlayer.pause();
        playerState.isMusicPlaying = false;
    } else {
        audioPlayer.play().catch(console.error);
        playerState.isMusicPlaying = true;
    }
    updatePlaybackUI();
}

async function playCurrentSong() {
    if (playerState.isLoading) return;
    playerState.isLoading = true;

    const currentSong = SONGS[playerState.currentSongIndex];
    
    try {
        ui.songInfo.querySelector('.song-title').textContent = 'Loading audio...';
        ui.songInfo.querySelector('.artist-name').textContent = 'Please wait';
        
        audioPlayer.src = currentSong.file;
        await audioPlayer.play();
        
        ui.songInfo.querySelector('.song-title').textContent = currentSong.title;
        ui.songInfo.querySelector('.artist-name').textContent = currentSong.artist;
        ui.albumCover.src = currentSong.cover;
        
        playerState.isMusicPlaying = true;
        updatePlaybackUI();
    } catch (error) {
        console.error('Error playing song:', error);
        playerState.currentSongIndex = (playerState.currentSongIndex + 1) % SONGS.length;
        setTimeout(() => playCurrentSong(), 2000);
    } finally {
        playerState.isLoading = false;
    }
}

// Initialize and start
function initializeAudio() {
    if (playerState.isAudioInitialized) return;

    const unmuteBanner = document.createElement('div');
    unmuteBanner.className = 'unmute-banner';
    unmuteBanner.textContent = 'Click anywhere for sound';
    document.body.appendChild(unmuteBanner);

    document.addEventListener('click', () => {
        unmuteBanner.remove();
        playerState.isAudioInitialized = true;
        playCurrentSong();
    }, { once: true });
}

// Spotify integration
async function checkSpotifyStatus() {
    try {
        const response = await fetch(SPOTIFY_API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        const track = data.recenttracks?.track?.[0];
        
        if (track?.['@attr']?.nowplaying === 'true') {
            const imageUrl = track.image?.find(img => img.size === 'large')?.[`#text`];
            if (imageUrl) {
                ui.albumCover.src = imageUrl;
            }
            
            ui.songInfo.querySelector('.song-title').textContent = track.name;
            ui.songInfo.querySelector('.artist-name').textContent = track.artist['#text'];
            
            if (!playerState.isSpotifyPlaying) {
                audioPlayer.src = AUDIO_PATHS.SPOTIFY_DETECT;
                audioPlayer.loop = true;
                await audioPlayer.play();
                playerState.isSpotifyPlaying = true;
                playerState.isMusicPlaying = true;
            }
        } else {
            playerState.isSpotifyPlaying = false;
            if (!playerState.isAudioInitialized) {
                initializeAudio();
            }
        }
    } catch (error) {
        console.error('Error checking Spotify status:', error);
        if (!playerState.isAudioInitialized) {
            initializeAudio();
        }
    }
}

// Rename and update the function to check proximity to any interactive element
function isNearInteractiveElement(x, y, threshold = 100) {
    // Check media player with larger threshold
    const mediaPlayer = document.querySelector('.music-player');
    if (mediaPlayer) {
        const rect = mediaPlayer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const distance = Math.hypot(x - centerX, y - centerY);
        if (distance < (rect.width / 2 + threshold)) return true;
    }

    // Check planets with smaller threshold
    const planets = document.querySelectorAll('.space-object');
    for (const planet of planets) {
        const rect = planet.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Use a much smaller threshold for planets (just slightly larger than the planet itself)
        const planetThreshold = 10;
        const distance = Math.hypot(x - centerX, y - centerY);
        if (distance < (rect.width / 2 + planetThreshold)) return true;
    }

    return false;
}

// Mouse interaction code
document.addEventListener('mousemove', function(e) {
    const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
    
    if (elementUnderCursor && (
        elementUnderCursor.classList.contains('main-icon') ||
        elementUnderCursor.tagName.toLowerCase() === 'h1' ||
        elementUnderCursor.closest('.social-links') ||
        isNearInteractiveElement(e.clientX, e.clientY)
    )) return;

    const now = Date.now();
    if (now - lastTimestamp < 20) return;
    lastTimestamp = now;

    // Smoother position interpolation
    lastX = lastX + (e.pageX - lastX) * 0.3;
    lastY = lastY + (e.pageY - lastY) * 0.3;

    for (let i = 0; i < 6; i++) { // Increased number of stars
        setTimeout(() => {
            const star = document.createElement('div');
            star.className = 'star';
            
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 10; // Reduced spread
            
            star.style.left = (lastX + Math.cos(angle) * distance) + 'px';
            star.style.top = (lastY + Math.sin(angle) * distance) + 'px';
            
            const size = Math.random() * 6 + 6; // Slightly smaller stars
            star.style.width = size + 'px';
            star.style.height = size + 'px';
            star.style.opacity = '0.8'; // More consistent opacity
            
            document.body.appendChild(star);
            
            // Fade out animation
            requestAnimationFrame(() => {
                star.style.transition = 'opacity 1.5s ease-out';
                star.style.opacity = '0';
            });
            
            setTimeout(() => {
                star.remove();
            }, 1500);
        }, i * 30); // Reduced delay between stars
    }
});

// Update the window load event
window.addEventListener('load', () => {
    checkSpotifyStatus();
    const initialChecks = setInterval(checkSpotifyStatus, INITIAL_CHECK_INTERVAL);
    setTimeout(() => {
        clearInterval(initialChecks);
        setInterval(checkSpotifyStatus, NORMAL_CHECK_INTERVAL);
    }, 30000);
});

// Keep this event listener to handle song ending
audioPlayer.addEventListener('ended', () => {
    if (!playerState.isSpotifyPlaying) {
        playerState.currentSongIndex = (playerState.currentSongIndex + 1) % SONGS.length;
        playCurrentSong();
    }
});
