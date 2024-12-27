// Local songs configuration
const SONGS = [
    {
        file: 'Maddy-Soma-OKE.mp4',
        title: 'Oke',
        artist: 'Maddy Soma',
        cover: 'album-cover-oke.png'
    },
    {
        file: 'Falling-In-Reverse-Prequel.mp4',
        title: 'Prequel',
        artist: 'Falling In Reverse',
        cover: 'album-cover-prequel.png'
    },
    {
        file: 'Godsmack-Bulletproof.mp4',
        title: 'Bulletproof',
        artist: 'Godsmack',
        cover: 'album-cover-bulletproof.png'
    }
];

// Player state
let currentSongIndex = Math.floor(Math.random() * SONGS.length);
let isAudioInitialized = false;
let isMusicPlaying = false;

// Star trail effect
let lastX = 0;
let lastY = 0;

function isNearMediaPlayer(x, y, threshold = 100) {
    const mediaPlayer = document.querySelector('.music-player');
    if (!mediaPlayer) return false;
    
    const rect = mediaPlayer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distance = Math.hypot(x - centerX, y - centerY);
    return distance < (rect.width / 2 + threshold);
}

document.addEventListener('mousemove', function(e) {
    const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
    
    if (elementUnderCursor && (
        elementUnderCursor.classList.contains('main-icon') ||
        elementUnderCursor.tagName.toLowerCase() === 'h1' ||
        elementUnderCursor.closest('.social-links') ||
        isNearMediaPlayer(e.clientX, e.clientY)
    )) return;

    lastX = lastX + (e.pageX - lastX) * 0.2;
    lastY = lastY + (e.pageY - lastY) * 0.2;

    for (let i = 0; i < 4; i++) {
        setTimeout(() => {
            const star = document.createElement('div');
            star.className = 'star';
            
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 15;
            
            star.style.left = (lastX + Math.cos(angle) * distance) + 'px';
            star.style.top = (lastY + Math.sin(angle) * distance) + 'px';
            
            const size = Math.random() * 8 + 8;
            star.style.width = size + 'px';
            star.style.height = size + 'px';
            
            document.body.appendChild(star);
            setTimeout(() => star.remove(), 2000);
        }, i * 40);
    }
});

function createStarryBackground() {
    const starsContainer = document.createElement('div');
    starsContainer.className = 'stars';
    document.body.appendChild(starsContainer);

    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star-background';
        
        const sizeClass = Math.random() < 0.6 ? 'small' : 
                         Math.random() < 0.9 ? 'medium' : 'large';
        star.classList.add(sizeClass);
        
        const margin = 5;
        star.style.left = `${margin + Math.random() * (100 - 2 * margin)}%`;
        star.style.top = `${margin + Math.random() * (100 - 2 * margin)}%`;
        
        // Fast(er) star animation
        star.style.setProperty('--duration', `${2 + Math.random() * 4}s`);
        star.style.setProperty('--delay', `${Math.random() * 3}s`);
        star.style.setProperty('--brightness', `${0.5 + Math.random() * 0.5}`);
        
        starsContainer.appendChild(star);
    }
}

function createSpaceBackground() {
    [
        { class: 'sun', delay: 0, duration: 8, top: '15%', left: '10%' },
        { class: 'earth', delay: 4, duration: 60, top: '25%', left: '75%' },
        { class: 'mars', delay: 8, duration: 80, top: '65%', left: '20%' },
        { class: 'jupiter', delay: 2, duration: 70, top: '40%', left: '85%' },
        { class: 'saturn', delay: 6, duration: 90, top: '80%', left: '60%' },
        { class: 'pluto', delay: 10, duration: 100, top: '10%', left: '40%' }
    ].forEach(planet => {
        const element = document.createElement('div');
        element.className = `space-object ${planet.class}`;
        element.style.setProperty('--orbit-duration', `${planet.duration}s`);
        element.style.animationDelay = `${planet.delay}s`;
        element.style.top = planet.top;
        element.style.left = planet.left;
        document.body.appendChild(element);
    });
}

function handlePlanetHover() {
    const planets = document.querySelectorAll('.space-object');
    const mouseThreshold = 100;

    document.addEventListener('mousemove', (e) => {
        planets.forEach(planet => {
            const rect = planet.getBoundingClientRect();
            const distance = Math.hypot(
                e.clientX - (rect.left + rect.width / 2),
                e.clientY - (rect.top + rect.height / 2)
            );
            planet.classList.toggle('fade-out', distance < mouseThreshold);
        });
    })
}

// Cache for Last.fm data
let lastTrackData = null;
let lastCheckTime = 0;
const CACHE_DURATION = 5000; // 5 seconds cache

// Create audio element
const audioPlayer = new Audio();
audioPlayer.volume = 1.0;

// Player elements
const playerContainer = document.createElement('div');
playerContainer.className = 'music-player loading';
document.body.insertBefore(playerContainer, document.querySelector('.content-wrapper'));

const albumCover = document.createElement('img');
albumCover.className = 'album-cover';
albumCover.alt = 'Album Cover';

const songInfo = document.createElement('div');
songInfo.className = 'song-info';
songInfo.innerHTML = `
    <div class="song-title">Checking Spotify...</div>
    <div class="artist-name">via Last.fm</div>
`;
albumCover.src = 'happy-trollge-trollge.gif';  // Show GIF while checking

const controls = document.createElement('div');
controls.className = 'player-controls';
controls.innerHTML = `
    <button class="play-pause" onclick="toggleMusic()">
        <span class="play-icon">▶️</span>
        <span class="pause-icon" style="display: none;">⏸️</span>
    </button>
`;

playerContainer.appendChild(albumCover);
playerContainer.appendChild(songInfo);
playerContainer.appendChild(controls);

// Player functions
function playCurrentSong() {
    const currentSong = SONGS[currentSongIndex];
    console.log('Attempting to play:', currentSong.title);
    
    // Update UI first
    songInfo.querySelector('.song-title').textContent = currentSong.title;
    songInfo.querySelector('.artist-name').textContent = currentSong.artist;
    albumCover.src = currentSong.cover;
    
    // Test if file exists before playing
    fetch(currentSong.file)
        .then(response => {
            if (!response.ok) throw new Error('Audio file not found');
            audioPlayer.src = currentSong.file;
            return audioPlayer.play();
        })
        .then(() => {
            isMusicPlaying = true;
            isPlayingSequence = true;
            updatePlaybackUI();
        })
        .catch(error => {
            console.error('Play failed:', error);
            songInfo.querySelector('.song-title').textContent = 'Error playing audio';
            songInfo.querySelector('.artist-name').textContent = 'Please check file paths';
            setTimeout(() => playNextSong(), 2000); // Try next song after 2 seconds
        });
}

function pauseMusic() {
    audioPlayer.pause();
    isMusicPlaying = false;
    isPlayingSequence = false;
    updatePlaybackUI();
}

// track Spotify state
let isSpotifyPlaying = false;
let isPlayingSequence = true;

// Update the toggleMusic function
function toggleMusic() {
    // Don't allow toggling if Spotify is playing
    if (isSpotifyPlaying) return;

    if (isMusicPlaying) {
        pauseMusic();
    } else {
        audioPlayer.play().then(() => {
            isMusicPlaying = true;
            updatePlaybackUI();
        }).catch(console.error);
    }
}

function updatePlaybackUI() {
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');
    if (playIcon && pauseIcon) {
        playIcon.style.display = isMusicPlaying ? 'none' : 'inline';
        pauseIcon.style.display = isMusicPlaying ? 'inline' : 'none';
    }
}

function playNextSong() {
    currentSongIndex = (currentSongIndex + 1) % SONGS.length;
    playCurrentSong();
}

// Initialize with click-for-sound
function initializeAudio() {
    if (isAudioInitialized) return;
    
    const unmuteBanner = document.createElement('div');
    unmuteBanner.className = 'unmute-banner';
    unmuteBanner.textContent = 'Click anywhere for sound';
    document.body.appendChild(unmuteBanner);

    const handleFirstClick = () => {
        unmuteBanner.remove();
        document.removeEventListener('click', handleFirstClick);
        isAudioInitialized = true;
        playCurrentSong();
    };

    document.addEventListener('click', handleFirstClick);
}

// Update the checkSpotifyPlaying function
async function checkSpotifyPlaying() {
    try {
        const now = Date.now();
        
        if (lastTrackData && (now - lastCheckTime) < CACHE_DURATION) {
            updatePlayerWithTrackData(lastTrackData);
            return lastTrackData.isPlaying;
        }

        playerContainer.classList.add('loading');
        
        // Use Cloudflare Worker
        const response = await fetch('https://spring-tooth-3a41.golonchy-aitta.workers.dev');
        if (!response.ok) {
            // If error, show looping GIF
            albumCover.src = 'happy-trollge-trollge.gif';
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const track = data.recenttracks?.track?.[0];
        const isPlaying = track?.['@attr']?.nowplaying === 'true';

        lastTrackData = {
            isPlaying,
            name: track?.name || 'Unknown Track',
            artist: track?.artist['#text'] || 'Unknown Artist',
            imageUrl: track?.image?.find(img => img.size === 'large')?.[`#text`] || 'album-cover-oke.png'
        };
        lastCheckTime = Date.now();

        updatePlayerWithTrackData(lastTrackData);
        return isPlaying;
    } catch (error) {
        console.error('Error checking status:', error);
        // Show looping GIF on error
        albumCover.src = 'happy-trollge-trollge.gif';
    }
}

// Update player UI with track data
function updatePlayerWithTrackData(trackData) {
    if (trackData.isPlaying) {
        // Display Spotify track info
        songInfo.querySelector('.song-title').textContent = trackData.name;
        songInfo.querySelector('.artist-name').textContent = trackData.artist;
        albumCover.src = trackData.imageUrl;

        // Play background music without changing display info
        if (!isMusicPlaying) {
            audioPlayer.src = 'play-when-spotify-detected.mp4';
            audioPlayer.loop = true;
            audioPlayer.play().then(() => {
                isMusicPlaying = true;
            }).catch(console.error);
        }

        const unmuteBanner = document.querySelector('.unmute-banner');
        if (unmuteBanner) {
            unmuteBanner.remove();
        }

        isAudioInitialized = true;
        isSpotifyPlaying = true;
        
        // Disable play button when Spotify is playing
        const playPauseBtn = document.querySelector('.play-pause');
        if (playPauseBtn) {
            playPauseBtn.style.opacity = '0.5';
            playPauseBtn.style.cursor = 'not-allowed';
        }
    } else {
        audioPlayer.loop = false;
        isSpotifyPlaying = false;
        
        // Re-enable play button when Spotify is not playing
        const playPauseBtn = document.querySelector('.play-pause');
        if (playPauseBtn) {
            playPauseBtn.style.opacity = '1';
            playPauseBtn.style.cursor = 'pointer';
        }

        if (!isMusicPlaying && !isAudioInitialized) {
            initializeAudio();
        }
    }
}

// Audio event listeners
audioPlayer.addEventListener('ended', () => {
    if (isSpotifyPlaying) {
        audioPlayer.currentTime = 0;
        audioPlayer.play().catch(console.error);
    } else if (isPlayingSequence) {
        playNextSong();
    }
});

audioPlayer.addEventListener('error', () => {
    console.error('Audio error, trying next song');
    if (isPlayingSequence) {
        currentSongIndex = (currentSongIndex + 1) % SONGS.length;
        playCurrentSong();
    }
});

// Add audio format check
audioPlayer.addEventListener('loadstart', () => {
    if (!audioPlayer.canPlayType('audio/mpeg')) {
        console.error('MP3 format not supported by browser');
        songInfo.querySelector('.song-title').textContent = 'Audio format not supported';
        songInfo.querySelector('.artist-name').textContent = 'Try a different browser';
    }
});

// Update the checkSpotifyStatus function
async function checkSpotifyStatus() {
    playerContainer.classList.add('loading');
    try {
        const isPlaying = await checkSpotifyPlaying();
        if (!isPlaying && !isAudioInitialized) {
            initializeLocalPlayback();
        }
    } catch (error) {
        console.error(error);
        if (!isAudioInitialized) {
            initializeLocalPlayback();
        }
    } finally {
        playerContainer.classList.remove('loading');
    }
}

// Add this helper function for repeated code
function initializeLocalPlayback() {
    songInfo.querySelector('.song-title').textContent = 'No Spotify status';
    songInfo.querySelector('.artist-name').textContent = 'Click somewhere on page';
    albumCover.src = 'happy-trollge-trollge.gif';
    initializeAudio();
}

// Update the window load event listener
window.addEventListener('load', () => {
    checkSpotifyStatus();
    
    setTimeout(() => {
        if (songInfo.querySelector('.song-title').textContent === 'Checking Spotify...') {
            songInfo.querySelector('.song-title').textContent = 'No Spotify status';
            songInfo.querySelector('.artist-name').textContent = 'Click somewhere on page';
            albumCover.src = 'happy-trollge-trollge.gif';
            initializeAudio();
        }
    }, 5000);

    setInterval(checkSpotifyStatus, 30000);
});

// Initialize backgrounds
createStarryBackground();
createSpaceBackground();
handlePlanetHover(); 