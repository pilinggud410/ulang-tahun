// ===== Birthday Project - Main Script =====

// ===== Configuration =====
const FLOWER_IMAGES = [
    'images/pink_rose.png',
    'images/sunflower.png',
    'images/blue_hydrangea.png',
    'images/white_daisy.png'
];

const CORRECT_PIN = '0222';
const TOTAL_FLOWERS = 300;
const EXPLOSION_EMOJIS = ['✨', '💛', '🌟', '⭐', '💫', '🎉', '🎊', '💖', '🌸', '🌺'];
const CONFETTI_COLORS = ['#ff6b8a', '#ffd700', '#00d4ff', '#ff69b4', '#7b68ee', '#ff8c00', '#00ff88', '#ff1493'];

// ===== DOM Elements =====
const passwordStage = document.getElementById('password-stage');
const giftStage = document.getElementById('gift-stage');
const flowerStage = document.getElementById('flower-stage');
const messageStage = document.getElementById('message-stage');
const giftBox = document.getElementById('gift-box');
const giftContainer = document.getElementById('gift-container');
const flowerContainer = document.getElementById('flower-container');
const flowerSwipeHint = document.getElementById('flower-swipe-hint');
const particlesBg = document.getElementById('particles-bg');
const pinDots = document.querySelectorAll('.pin-dot');
const pinError = document.getElementById('pin-error');
const lockIcon = document.querySelector('.lock-icon');

// Background Music
const bgMusic = document.getElementById('bg-music');
const musicPlayer = document.getElementById('music-player');
const musicToggle = document.getElementById('music-toggle');
const musicVolume = document.getElementById('music-volume');
let bgMusicPlaying = false;

let isAnimating = false;
let flowersReady = false;
let giftCenterX = 0;
let giftCenterY = 0;
let currentPin = '';
let pinLocked = false;

// ===== Initialize =====
function init() {
    createBackgroundParticles();
    setupPassword();
    setupGiftClick();
    preloadImages();
    setupBgMusic();
}

// ===== Password / PIN System =====
function setupPassword() {
    const numpadBtns = document.querySelectorAll('.numpad-btn[data-num]');

    numpadBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (pinLocked) return;

            const num = btn.dataset.num;

            // Button press animation
            btn.classList.remove('pressed');
            void btn.offsetWidth;
            btn.classList.add('pressed');

            if (num === 'del') {
                // Delete last digit
                if (currentPin.length > 0) {
                    currentPin = currentPin.slice(0, -1);
                    updatePinDots();
                    pinError.textContent = '';
                }
            } else {
                // Add digit
                if (currentPin.length < 4) {
                    currentPin += num;
                    updatePinDots();
                    pinError.textContent = '';

                    // Check when 4 digits entered
                    if (currentPin.length === 4) {
                        pinLocked = true;
                        setTimeout(() => checkPin(), 300);
                    }
                }
            }
        });
    });

    // Also allow keyboard input
    document.addEventListener('keydown', (e) => {
        if (!passwordStage.classList.contains('active') || pinLocked) return;

        if (e.key >= '0' && e.key <= '9') {
            if (currentPin.length < 4) {
                currentPin += e.key;
                updatePinDots();
                pinError.textContent = '';
                if (currentPin.length === 4) {
                    pinLocked = true;
                    setTimeout(() => checkPin(), 300);
                }
            }
        } else if (e.key === 'Backspace') {
            if (currentPin.length > 0) {
                currentPin = currentPin.slice(0, -1);
                updatePinDots();
                pinError.textContent = '';
            }
        }
    });
}

function updatePinDots() {
    pinDots.forEach((dot, i) => {
        dot.classList.remove('filled', 'error', 'success');
        if (i < currentPin.length) {
            dot.classList.add('filled');
        }
    });
}

function checkPin() {
    if (currentPin === CORRECT_PIN) {
        // Success!
        pinDots.forEach(dot => dot.classList.add('success'));
        lockIcon.textContent = '🔓';
        lockIcon.classList.add('unlocked');

        setTimeout(() => {
            passwordStage.style.transition = 'opacity 0.8s ease, visibility 0.8s ease';
            passwordStage.classList.remove('active');
            giftStage.classList.add('active');
        }, 900);
    } else {
        // Wrong PIN
        pinDots.forEach(dot => dot.classList.add('error'));
        pinError.textContent = 'Kode salah, coba lagi!';

        setTimeout(() => {
            currentPin = '';
            pinLocked = false;
            updatePinDots();
        }, 800);
    }
}

// ===== Preload flower images =====
function preloadImages() {
    FLOWER_IMAGES.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// ===== Background Particles =====
function createBackgroundParticles() {
    const colors = ['rgba(255,180,100,0.3)', 'rgba(255,120,200,0.2)', 'rgba(100,180,255,0.2)', 'rgba(255,215,0,0.3)'];

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        const size = Math.random() * 6 + 2;
        const x = Math.random() * 100;
        const duration = Math.random() * 8 + 6;
        const delay = Math.random() * 10;
        const color = colors[Math.floor(Math.random() * colors.length)];

        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${x}%;
            background: ${color};
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
            box-shadow: 0 0 ${size * 2}px ${color};
        `;

        particlesBg.appendChild(particle);
    }
}

// ===== Gift Click Handler =====
function setupGiftClick() {
    giftStage.addEventListener('click', handleGiftClick);
}

function handleGiftClick() {
    if (isAnimating) return;
    isAnimating = true;

    // Store the gift box center position for flower origin
    const rect = giftBox.getBoundingClientRect();
    giftCenterX = rect.left + rect.width / 2;
    giftCenterY = rect.top + rect.height / 2;

    // Remove hint
    const hint = document.getElementById('gift-hint');
    hint.style.opacity = '0';
    hint.style.transition = 'opacity 0.3s ease';

    // Stop floating animation
    giftContainer.style.animation = 'none';

    // Shake first
    giftBox.classList.add('shake');

    setTimeout(() => {
        giftBox.classList.remove('shake');
        giftBox.classList.add('shake');

        setTimeout(() => {
            giftBox.classList.remove('shake');

            // Open the lid
            giftBox.classList.add('opening');

            // Create explosion particles from the gift
            setTimeout(() => {
                createExplosionParticles();
            }, 300);

            // Start flowers coming out of the box
            setTimeout(() => {
                flowerStage.classList.add('active');
                startFlowerBloom();

                // Fade out the gift stage
                setTimeout(() => {
                    giftStage.classList.add('fading');
                    setTimeout(() => {
                        giftStage.classList.remove('active');
                    }, 800);
                }, 600);
            }, 700);
        }, 500);
    }, 500);
}

// ===== Explosion Particles =====
function createExplosionParticles() {
    const rect = giftBox.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top;

    for (let i = 0; i < 25; i++) {
        const particle = document.createElement('div');
        particle.classList.add('explosion-particle');

        const emoji = EXPLOSION_EMOJIS[Math.floor(Math.random() * EXPLOSION_EMOJIS.length)];
        particle.textContent = emoji;

        const angle = (Math.PI * 2 / 25) * i;
        const distance = Math.random() * 300 + 150;
        const ex = Math.cos(angle) * distance;
        const ey = Math.sin(angle) * distance - 100;

        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.setProperty('--ex', ex + 'px');
        particle.style.setProperty('--ey', ey + 'px');
        particle.style.fontSize = (Math.random() * 1.5 + 1) + 'rem';

        document.body.appendChild(particle);

        setTimeout(() => particle.remove(), 1500);
    }
}

// ===== Flower Bloom - From Gift Box =====
function startFlowerBloom() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Origin point = gift box center
    const originX = giftCenterX;
    const originY = giftCenterY;

    // Create many flowers in smooth waves, all originating from the gift box
    const waves = 10;
    const flowersPerWave = Math.ceil(TOTAL_FLOWERS / waves);

    for (let wave = 0; wave < waves; wave++) {
        for (let i = 0; i < flowersPerWave; i++) {
            const flowerIndex = wave * flowersPerWave + i;
            if (flowerIndex >= TOTAL_FLOWERS) break;

            const flower = document.createElement('div');
            flower.classList.add('flower');

            // Select random flower image
            const imgSrc = FLOWER_IMAGES[Math.floor(Math.random() * FLOWER_IMAGES.length)];
            flower.style.backgroundImage = `url('${imgSrc}')`;

            // Target position: spread across the entire screen with good coverage
            // Use a grid-like distribution with randomness for full coverage
            const gridCols = Math.ceil(Math.sqrt(TOTAL_FLOWERS * (vw / vh)));
            const gridRows = Math.ceil(TOTAL_FLOWERS / gridCols);
            const cellW = vw / gridCols;
            const cellH = vh / gridRows;

            const gridCol = flowerIndex % gridCols;
            const gridRow = Math.floor(flowerIndex / gridCols);

            // Position with jitter so it looks organic, not grid-like
            const targetX = gridCol * cellW + cellW * 0.5 + (Math.random() - 0.5) * cellW * 0.8;
            const targetY = gridRow * cellH + cellH * 0.5 + (Math.random() - 0.5) * cellH * 0.8;

            // Calculate travel distance from origin
            const dx = targetX - originX;
            const dy = targetY - originY;

            // Size variation - big enough to overlap and cover gaps
            const size = Math.random() * 80 + 100;
            const scale = 0.9 + Math.random() * 0.5;
            const rotation = Math.random() * 360;

            // Timing - smooth staggered waves with gentle overlap
            const distFromOrigin = Math.sqrt(dx * dx + dy * dy);
            const maxDist = Math.sqrt(vw * vw + vh * vh);
            const distFactor = distFromOrigin / maxDist;

            // Flowers closer to origin appear first, farther ones later
            const delay = distFactor * 2.5 + Math.random() * 0.3;
            const duration = 1.4 + Math.random() * 0.6;

            // Idle spin config - random speed & direction per flower
            const spinDuration = 6 + Math.random() * 8;
            const spinDirection = Math.random() > 0.5 ? '360deg' : '-360deg';

            // Each flower starts at origin and travels to its target
            flower.style.cssText += `
                left: ${originX - size / 2}px;
                top: ${originY - size / 2}px;
                width: ${size}px;
                height: ${size}px;
                --travel-x: ${dx}px;
                --travel-y: ${dy}px;
                --final-scale: ${scale};
                --final-rotate: ${rotation}deg;
                --bloom-delay: ${delay}s;
                --bloom-duration: ${duration}s;
                --spin-duration: ${spinDuration}s;
                --spin-direction: ${spinDirection};
                z-index: ${Math.floor(distFactor * 10) + 2};
            `;

            flowerContainer.appendChild(flower);

            // After bloom finishes, switch to idle spin
            const bloomEndTime = (delay + duration) * 1000;
            setTimeout(() => {
                flower.classList.add('idle-spin');
            }, bloomEndTime);
        }
    }

    // Add sparkles during bloom
    setTimeout(() => createSparkles(15), 500);
    setTimeout(() => createSparkles(12), 1200);
    setTimeout(() => createSparkles(12), 2000);
    setTimeout(() => createSparkles(8), 2800);

    // After all flowers have bloomed, enable swipe/click to reveal message
    const totalBloomTime = 3500;
    setTimeout(() => {
        flowersReady = true;
        flowerSwipeHint.classList.add('visible');
        setupFlowerSwipe();
    }, totalBloomTime);
}

// ===== Swipe / Click flowers away =====
function setupFlowerSwipe() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const container = flowerContainer;

    // Touch events
    container.addEventListener('touchstart', (e) => {
        if (!flowersReady) return;
        startX = e.touches[0].clientX;
        isDragging = true;
        container.style.transition = 'none';
        flowerSwipeHint.classList.remove('visible');
    });

    container.addEventListener('touchmove', (e) => {
        if (!isDragging || !flowersReady) return;
        currentX = e.touches[0].clientX - startX;
        // Only allow swipe left (negative) or right (positive)
        container.style.transform = `translateX(${currentX}px)`;
    });

    container.addEventListener('touchend', () => {
        if (!isDragging || !flowersReady) return;
        isDragging = false;

        const vw = window.innerWidth;
        // If swiped enough, slide away completely
        if (Math.abs(currentX) > vw * 0.15) {
            const direction = currentX > 0 ? 1 : -1;
            slideFlowersAway(direction);
        } else {
            // Snap back
            container.style.transition = 'transform 0.4s ease';
            container.style.transform = 'translateX(0)';
        }
    });

    // Mouse events
    container.addEventListener('mousedown', (e) => {
        if (!flowersReady) return;
        startX = e.clientX;
        isDragging = true;
        container.style.transition = 'none';
        flowerSwipeHint.classList.remove('visible');
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDragging || !flowersReady) return;
        currentX = e.clientX - startX;
        container.style.transform = `translateX(${currentX}px)`;
    });

    container.addEventListener('mouseup', () => {
        if (!isDragging || !flowersReady) return;
        isDragging = false;

        const vw = window.innerWidth;
        if (Math.abs(currentX) > vw * 0.15) {
            const direction = currentX > 0 ? 1 : -1;
            slideFlowersAway(direction);
        } else {
            container.style.transition = 'transform 0.4s ease';
            container.style.transform = 'translateX(0)';
        }
    });

    // Also allow simple click/tap
    container.addEventListener('click', (e) => {
        if (!flowersReady) return;
        // Only trigger if it wasn't a drag
        if (Math.abs(currentX) < 5) {
            flowerSwipeHint.classList.remove('visible');
            slideFlowersAway(-1);
        }
        currentX = 0;
    });
}

function slideFlowersAway(direction) {
    flowersReady = false;
    const container = flowerContainer;
    const vw = window.innerWidth;

    container.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease';
    container.style.transform = `translateX(${direction * (vw + 100)}px)`;
    container.style.opacity = '0.7';

    // Show birthday message underneath
    messageStage.classList.add('active');

    setTimeout(() => {
        // Start confetti and text reveal
        showBirthdayMessage();
    }, 400);

    setTimeout(() => {
        flowerStage.classList.remove('active');
    }, 1200);
}

// ===== Sparkles =====
function createSparkles(count) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    for (let i = 0; i < count; i++) {
        const sparkle = document.createElement('div');
        sparkle.classList.add('sparkle');

        sparkle.style.cssText = `
            left: ${Math.random() * vw}px;
            top: ${Math.random() * vh}px;
            --sparkle-delay: ${Math.random() * 0.5}s;
            --sparkle-duration: ${0.6 + Math.random() * 0.8}s;
        `;

        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 2000);
    }
}

// ===== Birthday Message =====
function showBirthdayMessage() {
    startConfetti();

    // Auto-play background music
    playBgMusic();

    // Reveal text lines sequentially
    const lines = document.querySelectorAll('#birthday-text span');
    lines.forEach((line, index) => {
        setTimeout(() => {
            line.classList.add('show');
        }, index * 400 + 300);
    });

    // Reveal polaroid photos (each uses its own --delay set inline in the HTML)
    const polaroids = document.querySelectorAll('.polaroid');
    polaroids.forEach((polaroid) => {
        polaroid.classList.add('show');
    });

    // Continuous sparkle effect
    const sparkleInterval = setInterval(() => {
        createSparkles(5);
    }, 1500);
    setTimeout(() => clearInterval(sparkleInterval), 15000);
}

// ===== Confetti =====
function startConfetti() {
    const totalConfetti = 80;
    const vw = window.innerWidth;

    for (let i = 0; i < totalConfetti; i++) {
        setTimeout(() => {
            createConfettiPiece(vw);
        }, Math.random() * 3000);
    }

    setTimeout(() => {
        for (let i = 0; i < 40; i++) {
            setTimeout(() => {
                createConfettiPiece(vw);
            }, Math.random() * 2000);
        }
    }, 3000);
}

function createConfettiPiece(vw) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');

    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const x = Math.random() * vw;
    const size = Math.random() * 10 + 6;
    const isCircle = Math.random() > 0.5;
    const duration = 2 + Math.random() * 3;
    const rotation = Math.random() * 1440 - 720;

    confetti.style.cssText = `
        left: ${x}px;
        top: -20px;
        width: ${size}px;
        height: ${size * (isCircle ? 1 : 1.5)}px;
        background: ${color};
        border-radius: ${isCircle ? '50%' : '2px'};
        --fall-duration: ${duration}s;
        --fall-delay: 0s;
        --confetti-rotate: ${rotation}deg;
        box-shadow: 0 0 ${size}px ${color}40;
    `;

    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), (duration + 1) * 1000);
}

// ===== Letter Page (typewriter) =====
const letterStage = document.getElementById('letter-stage');
const readLetterBtn = document.getElementById('read-letter-btn');
const letterBackBtn = document.getElementById('letter-back-btn');
const letterTyped = document.getElementById('letter-typed');
const letterBox = document.getElementById('letter-box');

/* GANTI DI SINI: isi surat. Gunakan \n untuk baris baru, \n\n untuk paragraf baru */
const LETTER_TEXT =
`HAPPY BIRTHDAY SAYANGKUUU ❤

Selamat ulang tahun ya, cintaku. 🤍

Hari ini adalah hari yang spesial banget buat aku, karena hari ini adalah hari lahir orang yang sekarang jadi rumah paling nyaman buat aku, orang yang selalu berhasil bikin aku tersenyum, dan orang yang paling aku syukuri kehadirannya dalam hidupku.

Gak kerasa ya, sekarang kita udah jalan hampir 6 bulan. Rasanya masih kayak kemarin waktu pertama kali kita kenalan. Aku masih inget banget gimana semuanya dimulai. Kita dikenalin sama Ain, dan waktu itu kita sama-sama masih malu-malu. Masih canggung buat ngobrol, masih bingung harus mulai dari mana. Obrolan kita sederhana, kadang ada jeda karena sama-sama malu, bahkan mungkin gak pernah kepikiran kalau dari perkenalan kecil itu, kita bakal sampai di titik ini.

Siapa sangka, orang yang awalnya cuma dikenalin sama teman sekarang malah jadi orang yang paling berarti buat aku.

Sekarang kita udah bisa cerita apa aja tanpa rasa canggung. Dari hal-hal yang penting sampai hal-hal receh yang sebenarnya gak penting sama sekali, semuanya jadi menyenangkan kalau diceritain ke kamu. Kamu udah jadi tempat aku pulang setelah hari yang panjang, tempat aku mengeluh, ketawa, cerita tentang apa pun, bahkan cuma buat bilang "hari ini capek."

Walaupun kita dipisahin sama jarak, aku gak pernah ngerasa sendirian karena selalu ada kamu.

Aku gak akan bohong, LDR itu memang gak mudah. Ada saat-saat di mana aku pengen banget bisa ketemu kamu. Pengen nemenin kamu secara langsung, nemenin kamu makan, jalan bareng, ngobrol sampai malam tanpa harus lihat layar HP. Kadang juga sedih karena yang bisa kita lakuin cuma saling ngabarin, video call, atau nunggu waktu biar cepet berlalu supaya bisa ketemu.

Tapi di balik semua itu, aku bersyukur. Karena meskipun kita jauh, kita tetap milih buat bertahan. Kita sama-sama belajar buat percaya, buat saling ngerti, buat saling menguatkan. Jarak mungkin bikin kita gak bisa sering ketemu, tapi jarak gak pernah bikin rasa sayang aku ke kamu berkurang. Justru setiap hari aku makin yakin kalau kamu memang seseorang yang pengen terus aku perjuangin.

Terima kasih ya sayang, udah selalu sabar sama aku. Makasih udah nerima segala kurang lebihnya aku. Makasih udah selalu ada ketika aku lagi senang maupun lagi capek. Makasih udah jadi pendengar terbaik, tempat aku cerita, tempat aku mencari tenang, dan alasan kenapa hari-hariku terasa lebih indah.

Aku tahu mungkin aku belum bisa jadi pasangan yang sempurna. Kadang aku bikin kamu kesel, kadang aku keras kepala, kadang juga banyak kurangnya. Tapi satu hal yang selalu aku usahain adalah mencintai kamu dengan tulus, menghargai kamu, dan selalu berusaha jadi orang yang bisa bikin kamu bahagia.

Di umur kamu yang baru ini, aku cuma pengen doa yang terbaik buat kamu.

Semoga kamu selalu diberikan kesehatan, umur yang panjang, rezeki yang melimpah, dan segala urusanmu dipermudah sama Allah. Semoga semua impian yang lagi kamu perjuangin bisa satu per satu tercapai. Semoga setiap langkah yang kamu ambil selalu membawa kamu ke hal-hal baik. Dan semoga, di saat dunia lagi terasa berat, kamu selalu ingat kalau ada aku yang akan terus mendukung dan mendoakan kamu dari jauh.

Aku juga berharap semoga hubungan kita selalu dijaga. Semoga rasa sayang yang kita punya gak pernah berkurang, malah semakin besar seiring berjalannya waktu. Semoga kita selalu diberi kesabaran untuk menghadapi jarak ini, diberi kepercayaan untuk saling menjaga, dan diberi kesempatan supaya suatu hari nanti kita gak perlu lagi ngelewatin ulang tahun, hari spesial, atau momen-momen penting dengan terpisah oleh jarak.

Aku pengen nanti kita bisa mengenang semua ini sambil ketawa. Bilang kalau dulu kita pernah kuat menjalani hubungan yang dipisahkan ratusan kilometer, pernah saling menunggu, pernah saling menguatkan lewat layar HP, dan semua penantian itu akhirnya terbayar karena kita berhasil sampai di tujuan yang sama.

Terima kasih ya, karena sudah hadir di hidup aku. Terima kasih sudah memilih tetap bertahan sampai sejauh ini. Aku benar-benar bersyukur bisa dipertemukan sama kamu, walaupun semuanya berawal dari sebuah perkenalan sederhana yang dikenalin sama Ain. Kalau waktu itu kita memutuskan untuk gak saling mengenal lebih jauh, mungkin aku gak akan pernah menemukan seseorang sebaik kamu.

Jadi, sekali lagi...

Happy Birthday, sayangku. 🤍

Nikmati hari spesialmu, jangan lupa banyak senyum hari ini ya. Maaf karena aku belum bisa ada di samping kamu untuk merayakan langsung. Tapi percayalah, walaupun kita dipisahkan jarak, doa dan rasa sayangku selalu sampai ke kamu.

Aku sayang kamu, hari ini, besok, dan semoga sampai seterusnya.

Selamat ulang tahun, cintaku. Terima kasih sudah menjadi bagian terindah dari hampir enam bulan perjalanan kita. Semoga tahun depan, dan ulang tahun-ulang tahun berikutnya, kita sudah bisa merayakannya tanpa dipisahkan oleh jarak. ❤️`;

let letterTypingTimeout = null;

function typeLetter(text, speed = 10) {
    clearTimeout(letterTypingTimeout);
    letterTyped.textContent = '';
    let i = 0;
    function step() {
        if (i < text.length) {
            letterTyped.textContent += text[i];
            letterBox.scrollTop = letterBox.scrollHeight;
            i++;
            letterTypingTimeout = setTimeout(step, speed);
        }
    }
    step();

    // tap the box to instantly finish typing
    letterBox.onclick = () => {
        clearTimeout(letterTypingTimeout);
        letterTyped.textContent = text;
        letterBox.scrollTop = letterBox.scrollHeight;
    };
}

if (readLetterBtn && letterStage) {
    readLetterBtn.addEventListener('click', () => {
        letterStage.classList.add('active');
        typeLetter(LETTER_TEXT);
    });
}

if (letterBackBtn && letterStage) {
    letterBackBtn.addEventListener('click', () => {
        letterStage.classList.remove('active');
        clearTimeout(letterTypingTimeout);
    });
}

// ===== Stamps Page ("There's still more") =====
const stampsStage = document.getElementById('stamps-stage');
const goStampsBtn = document.getElementById('go-stamps-btn');
const stampsBackBtn = document.getElementById('stamps-back-btn');
const stampHeart = document.getElementById('stamp-heart');
const stampFlower = document.getElementById('stamp-flower');
const stampMusic = document.getElementById('stamp-music');

if (goStampsBtn && stampsStage) {
    goStampsBtn.addEventListener('click', () => {
        stampsStage.classList.add('active');
    });
}

if (stampsBackBtn && stampsStage) {
    stampsBackBtn.addEventListener('click', () => {
        stampsStage.classList.remove('active');
    });
}

// ===== Memories Page =====
const memoriesStage = document.getElementById('memories-stage');
const memoriesBackBtn = document.getElementById('memories-back-btn');

function openMemories() {
    memoriesStage.classList.add('active');
    // Animate polaroids in sequentially
    const polaroids = memoriesStage.querySelectorAll('.mem-polaroid');
    polaroids.forEach(p => p.classList.add('show'));
}

if (stampHeart && memoriesStage) {
    stampHeart.addEventListener('click', openMemories);
}

if (memoriesBackBtn && memoriesStage) {
    memoriesBackBtn.addEventListener('click', () => {
        memoriesStage.classList.remove('active');
    });
}

// ===== Bouquet Page (flower stamp) =====
const bouquetStage = document.getElementById('bouquet-stage');
const bouquetBackBtn = document.getElementById('bouquet-back-btn');

if (stampFlower && bouquetStage) {
    stampFlower.addEventListener('click', () => {
        bouquetStage.classList.add('active');
    });
}

if (bouquetBackBtn && bouquetStage) {
    bouquetBackBtn.addEventListener('click', () => {
        bouquetStage.classList.remove('active');
        // stop the voice note if it's still playing
        const voiceNote = document.getElementById('voice-note');
        if (voiceNote) {
            voiceNote.pause();
            voiceNote.currentTime = 0;
        }
    });
}

// ===== Song Page =====
const songStage = document.getElementById('song-stage');
const songBackBtn = document.getElementById('song-back-btn');
const songIframe = document.querySelector('#song-embed-wrap iframe');
const songIframeSrc = songIframe ? songIframe.getAttribute('src') : '';

function openSong() {
    songStage.classList.add('active');
    if (songIframe && !songIframe.getAttribute('src')) {
        songIframe.setAttribute('src', songIframeSrc);
    }
}

if (stampMusic && songStage) {
    stampMusic.addEventListener('click', openSong);
}

if (songBackBtn && songStage) {
    songBackBtn.addEventListener('click', () => {
        songStage.classList.remove('active');
        // stop playback by clearing the iframe src
        if (songIframe) songIframe.setAttribute('src', '');
    });
}

// ===== Background Music System =====
function setupBgMusic() {
    if (!bgMusic || !musicPlayer) return;

    // Set initial volume
    bgMusic.volume = 0.7;

    // Toggle play/pause
    if (musicToggle) {
        musicToggle.addEventListener('click', () => {
            if (bgMusicPlaying) {
                pauseBgMusic();
            } else {
                playBgMusic();
            }
        });
    }

    // Volume slider
    if (musicVolume) {
        musicVolume.addEventListener('input', (e) => {
            const vol = e.target.value / 100;
            bgMusic.volume = vol;
        });
    }
}

function playBgMusic() {
    if (!bgMusic || !musicPlayer) return;

    // Show the player widget
    musicPlayer.classList.remove('hidden', 'paused');
    musicPlayer.classList.add('visible', 'playing');

    // Try to play
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            bgMusicPlaying = true;
        }).catch(() => {
            // Autoplay blocked - show player as paused, user can tap to play
            musicPlayer.classList.remove('playing');
            musicPlayer.classList.add('paused');
            bgMusicPlaying = false;
        });
    }
}

function pauseBgMusic() {
    if (!bgMusic) return;
    bgMusic.pause();
    bgMusicPlaying = false;
    if (musicPlayer) {
        musicPlayer.classList.remove('playing');
        musicPlayer.classList.add('paused');
    }
}

// ===== Finale Page =====
const finaleStage = document.getElementById('finale-stage');
const goFinaleBtn = document.getElementById('go-finale-btn');
const finaleTyped = document.getElementById('finale-typed');
const finaleBottom = document.getElementById('finale-bottom');
const finaleReplayBtn = document.getElementById('finale-replay-btn');
let finaleTimeout = null;

if (goFinaleBtn && finaleStage) {
    goFinaleBtn.addEventListener('click', () => {
        finaleStage.classList.add('active');
        startFinaleSequence();
    });
}

if (finaleReplayBtn) {
    finaleReplayBtn.addEventListener('click', () => {
        location.reload();
    });
}

function startFinaleSequence() {
    if (!finaleTyped) return;
    finaleTyped.textContent = '';
    if (finaleBottom) {
        finaleBottom.classList.remove('finale-show');
        finaleBottom.classList.add('finale-hidden');
    }

    const phrases = ['Happy Birthday', 'With All My Love', 'Always & Forever'];
    let phraseIdx = 0;

    function runPhrase() {
        if (phraseIdx >= phrases.length) return;

        const text = phrases[phraseIdx];
        const isLast = phraseIdx === phrases.length - 1;

        typeText(text, () => {
            if (isLast) {
                // Last phrase — show bottom content
                finaleTimeout = setTimeout(() => {
                    if (finaleBottom) {
                        finaleBottom.classList.remove('finale-hidden');
                        finaleBottom.classList.add('finale-show');
                    }
                }, 600);
            } else {
                // Pause, then erase
                finaleTimeout = setTimeout(() => {
                    eraseText(() => {
                        phraseIdx++;
                        finaleTimeout = setTimeout(runPhrase, 400);
                    });
                }, 1200);
            }
        });
    }

    runPhrase();
}

function typeText(text, callback) {
    let i = 0;
    const speed = 80;

    function type() {
        if (i < text.length) {
            finaleTyped.textContent += text.charAt(i);
            i++;
            finaleTimeout = setTimeout(type, speed);
        } else {
            if (callback) finaleTimeout = setTimeout(callback, 200);
        }
    }

    type();
}

function eraseText(callback) {
    const speed = 45;

    function erase() {
        const current = finaleTyped.textContent;
        if (current.length > 0) {
            finaleTyped.textContent = current.slice(0, -1);
            finaleTimeout = setTimeout(erase, speed);
        } else {
            if (callback) finaleTimeout = setTimeout(callback, 200);
        }
    }

    erase();
}

// ===== Start Everything =====
document.addEventListener('DOMContentLoaded', init);