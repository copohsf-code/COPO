// ============================================
// Glittery Floating Particles Animation with Touch Sensitivity
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const circlesContainer = document.getElementById('circlesContainer');
    const circles = [];
    const numCircles = 50;
    const numSparkles = 80; // Extra sparkle particles

    // Smaller particle sizes
    const minSize = 8;
    const maxSize = 25;

    // Store particle data for movement
    const particleData = [];
    const sparkleData = [];

    // Create floating circles
    function createCircles() {
        for (let i = 0; i < numCircles; i++) {
            const circle = document.createElement('div');
            circle.classList.add('circle');

            // Random smaller size
            const size = Math.random() * (maxSize - minSize) + minSize;
            circle.style.width = `${size}px`;
            circle.style.height = `${size}px`;

            // Random position
            const posX = Math.random() * window.innerWidth;
            const posY = Math.random() * window.innerHeight;
            circle.style.left = `${posX}px`;
            circle.style.top = `${posY}px`;

            // Random opacity for depth effect
            circle.style.opacity = Math.random() * 0.6 + 0.3;

            // Store particle movement data
            particleData.push({
                element: circle,
                x: posX,
                y: posY,
                size: size,
                speedX: (Math.random() - 0.5) * 2,
                speedY: (Math.random() - 0.5) * 2,
                wobbleSpeed: Math.random() * 0.02 + 0.01,
                wobbleAmount: Math.random() * 30 + 10,
                angle: Math.random() * Math.PI * 2
            });

            // Add touch/click interaction
            circle.addEventListener('click', (e) => handleCircleTouch(e, i));
            circle.addEventListener('touchstart', (e) => handleCircleTouch(e, i));

            circlesContainer.appendChild(circle);
            circles.push(circle);
        }
    }

    // Create glitter/sparkle particles
    function createSparkles() {
        for (let i = 0; i < numSparkles; i++) {
            const sparkle = document.createElement('div');
            sparkle.classList.add('sparkle');

            // Random position
            const posX = Math.random() * window.innerWidth;
            const posY = Math.random() * window.innerHeight;
            sparkle.style.left = `${posX}px`;
            sparkle.style.top = `${posY}px`;

            // Random animation delay for staggered twinkling
            sparkle.style.animationDelay = `${Math.random() * 1.5}s`;
            sparkle.style.animationDuration = `${Math.random() * 1 + 1}s`;

            // Random size for variety
            const size = Math.random() * 3 + 2;
            sparkle.style.width = `${size}px`;
            sparkle.style.height = `${size}px`;

            // Store sparkle data
            sparkleData.push({
                element: sparkle,
                x: posX,
                y: posY,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                twinkleTimer: Math.random() * 100
            });

            circlesContainer.appendChild(sparkle);
        }
    }

    // Animate particles - continuous movement
    function animateParticles() {
        // Animate circles
        particleData.forEach((particle) => {
            particle.angle += particle.wobbleSpeed;

            particle.x += particle.speedX;
            particle.y += particle.speedY;

            const wobbleX = Math.sin(particle.angle) * particle.wobbleAmount * 0.1;
            const wobbleY = Math.cos(particle.angle * 0.7) * particle.wobbleAmount * 0.1;

            // Wrap around screen edges
            if (particle.x < -particle.size) {
                particle.x = window.innerWidth + particle.size;
            } else if (particle.x > window.innerWidth + particle.size) {
                particle.x = -particle.size;
            }

            if (particle.y < -particle.size) {
                particle.y = window.innerHeight + particle.size;
            } else if (particle.y > window.innerHeight + particle.size) {
                particle.y = -particle.size;
            }

            particle.element.style.left = `${particle.x + wobbleX}px`;
            particle.element.style.top = `${particle.y + wobbleY}px`;
        });

        // Animate sparkles with slow drift
        sparkleData.forEach((sparkle) => {
            sparkle.x += sparkle.speedX;
            sparkle.y += sparkle.speedY;

            // Wrap around
            if (sparkle.x < 0) sparkle.x = window.innerWidth;
            if (sparkle.x > window.innerWidth) sparkle.x = 0;
            if (sparkle.y < 0) sparkle.y = window.innerHeight;
            if (sparkle.y > window.innerHeight) sparkle.y = 0;

            sparkle.element.style.left = `${sparkle.x}px`;
            sparkle.element.style.top = `${sparkle.y}px`;
        });

        requestAnimationFrame(animateParticles);
    }

    // Randomly reposition sparkles for twinkling effect
    function randomizeSparkles() {
        setInterval(() => {
            const randomIndex = Math.floor(Math.random() * sparkleData.length);
            const sparkle = sparkleData[randomIndex];
            
            // Randomly move some sparkles to new positions
            if (Math.random() > 0.5) {
                sparkle.x = Math.random() * window.innerWidth;
                sparkle.y = Math.random() * window.innerHeight;
            }
        }, 200);
    }

    // Handle circle touch/click
    function handleCircleTouch(e, index) {
        e.preventDefault();
        e.stopPropagation();
        
        const circle = e.target;
        circle.classList.add('touched');

        setTimeout(() => {
            circle.classList.remove('touched');
        }, 600);

        const particle = particleData[index];
        particle.speedX = (Math.random() - 0.5) * 8;
        particle.speedY = (Math.random() - 0.5) * 8;

        // Create burst of sparkles at touch point
        createSparkleBurst(particle.x, particle.y);

        setTimeout(() => {
            particle.speedX = (Math.random() - 0.5) * 2;
            particle.speedY = (Math.random() - 0.5) * 2;
        }, 1000);
    }

    // Create sparkle burst effect
    function createSparkleBurst(x, y) {
        for (let i = 0; i < 8; i++) {
            const sparkle = document.createElement('div');
            sparkle.classList.add('sparkle');
            sparkle.style.left = `${x}px`;
            sparkle.style.top = `${y}px`;
            sparkle.style.animationDuration = '0.8s';
            
            const angle = (Math.PI * 2 / 8) * i;
            const distance = 50;
            const endX = x + Math.cos(angle) * distance;
            const endY = y + Math.sin(angle) * distance;
            
            sparkle.style.transition = 'all 0.5s ease-out';
            circlesContainer.appendChild(sparkle);
            
            setTimeout(() => {
                sparkle.style.left = `${endX}px`;
                sparkle.style.top = `${endY}px`;
                sparkle.style.opacity = '0';
            }, 10);
            
            setTimeout(() => sparkle.remove(), 600);
        }
    }

    // Touch/Click ripple effect on background
    function createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.classList.add('touch-ripple');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        circlesContainer.appendChild(ripple);

        // Create sparkle burst too
        createSparkleBurst(x, y);

        setTimeout(() => {
            ripple.remove();
        }, 1000);
    }

    // Background touch handler
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.login-box') && !e.target.classList.contains('circle')) {
            createRipple(e.clientX, e.clientY);
            pushCirclesAway(e.clientX, e.clientY);
        }
    });

    // Touch event for mobile
    document.addEventListener('touchstart', (e) => {
        if (!e.target.closest('.login-box') && !e.target.classList.contains('circle')) {
            const touch = e.touches[0];
            createRipple(touch.clientX, touch.clientY);
            pushCirclesAway(touch.clientX, touch.clientY);
        }
    });

    // Push circles away from touch point
    function pushCirclesAway(x, y) {
        particleData.forEach((particle) => {
            const dx = particle.x - x;
            const dy = particle.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                const force = (150 - distance) / 150;
                const angle = Math.atan2(dy, dx);
                
                particle.speedX += Math.cos(angle) * force * 5;
                particle.speedY += Math.sin(angle) * force * 5;

                setTimeout(() => {
                    particle.speedX = (Math.random() - 0.5) * 2;
                    particle.speedY = (Math.random() - 0.5) * 2;
                }, 1500);
            }
        });
    }

    // Mouse move - particles react to mouse
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        particleData.forEach((particle) => {
            const dx = particle.x - mouseX;
            const dy = particle.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                const force = (100 - distance) / 100 * 0.3;
                const angle = Math.atan2(dy, dx);
                
                particle.speedX += Math.cos(angle) * force;
                particle.speedY += Math.sin(angle) * force;

                particle.speedX = Math.max(-4, Math.min(4, particle.speedX));
                particle.speedY = Math.max(-4, Math.min(4, particle.speedY));
            }
        });
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        particleData.forEach(particle => {
            if (particle.x > window.innerWidth) {
                particle.x = window.innerWidth - particle.size;
            }
            if (particle.y > window.innerHeight) {
                particle.y = window.innerHeight - particle.size;
            }
        });

        sparkleData.forEach(sparkle => {
            if (sparkle.x > window.innerWidth) sparkle.x = window.innerWidth;
            if (sparkle.y > window.innerHeight) sparkle.y = window.innerHeight;
        });
    });

    // Form submission handler with hardcoded credentials (for testing)
    // TODO: Replace with database authentication later
    const VALID_USERNAME = 'admin';
    const VALID_PASSWORD = 'admin123';

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            // Validate credentials
            if (username === VALID_USERNAME && password === VALID_PASSWORD) {
                // Store login state in session
                sessionStorage.setItem('loggedIn', 'true');
                sessionStorage.setItem('username', username);
                
                // Redirect to profile page
                window.location.href = 'profile.html';
            } else {
                // Show error message
                showLoginError('Invalid username or password!');
            }
        });
    }

    // Function to show login error
    function showLoginError(message) {
        // Remove existing error if any
        const existingError = document.querySelector('.login-error');
        if (existingError) {
            existingError.remove();
        }

        // Create error element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'login-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            background: #ffebee;
            color: #c62828;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 15px;
            font-size: 0.9rem;
            border: 1px solid #ffcdd2;
            animation: shake 0.5s ease;
        `;

        // Add shake animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                20%, 60% { transform: translateX(-5px); }
                40%, 80% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);

        // Insert error before form
        const form = document.getElementById('loginForm');
        form.parentNode.insertBefore(errorDiv, form);

        // Remove error after 3 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    // Initialize
    createCircles();
    createSparkles();
    animateParticles();
    randomizeSparkles();
});
