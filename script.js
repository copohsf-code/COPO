// ============================================
// Floating Particles Animation with Touch Sensitivity
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const circlesContainer = document.getElementById('circlesContainer');
    const circles = [];
    const numCircles = 50; // More particles

    // Smaller particle sizes
    const minSize = 8;
    const maxSize = 25;

    // Store particle data for movement
    const particleData = [];

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
                speedX: (Math.random() - 0.5) * 2, // Random horizontal speed
                speedY: (Math.random() - 0.5) * 2, // Random vertical speed
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

    // Animate particles - continuous movement
    function animateParticles() {
        particleData.forEach((particle, index) => {
            // Update angle for wobble effect
            particle.angle += particle.wobbleSpeed;

            // Move particle
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Add wobble
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

            // Apply position
            particle.element.style.left = `${particle.x + wobbleX}px`;
            particle.element.style.top = `${particle.y + wobbleY}px`;
        });

        requestAnimationFrame(animateParticles);
    }

    // Handle circle touch/click
    function handleCircleTouch(e, index) {
        e.preventDefault();
        e.stopPropagation();
        
        const circle = e.target;
        circle.classList.add('touched');

        // Remove the class after animation
        setTimeout(() => {
            circle.classList.remove('touched');
        }, 600);

        // Give the particle a burst of speed in random direction
        const particle = particleData[index];
        particle.speedX = (Math.random() - 0.5) * 8;
        particle.speedY = (Math.random() - 0.5) * 8;

        // Gradually slow down
        setTimeout(() => {
            particle.speedX = (Math.random() - 0.5) * 2;
            particle.speedY = (Math.random() - 0.5) * 2;
        }, 1000);
    }

    // Touch/Click ripple effect on background
    function createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.classList.add('touch-ripple');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        circlesContainer.appendChild(ripple);

        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 1000);
    }

    // Background touch handler
    document.addEventListener('click', (e) => {
        // Only create ripple if clicking on background, not on login box
        if (!e.target.closest('.login-box') && !e.target.classList.contains('circle')) {
            createRipple(e.clientX, e.clientY);
            
            // Push nearby circles away
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

            // Only affect circles within 150px radius
            if (distance < 150) {
                const force = (150 - distance) / 150;
                const angle = Math.atan2(dy, dx);
                
                // Add burst velocity away from click point
                particle.speedX += Math.cos(angle) * force * 5;
                particle.speedY += Math.sin(angle) * force * 5;

                // Gradually return to normal speed
                setTimeout(() => {
                    particle.speedX = (Math.random() - 0.5) * 2;
                    particle.speedY = (Math.random() - 0.5) * 2;
                }, 1500);
            }
        });
    }

    // Mouse move - particles slightly follow/react to mouse
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Subtle attraction/repulsion for nearby particles
        particleData.forEach((particle) => {
            const dx = particle.x - mouseX;
            const dy = particle.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                const force = (100 - distance) / 100 * 0.3;
                const angle = Math.atan2(dy, dx);
                
                // Gentle push away from mouse
                particle.speedX += Math.cos(angle) * force;
                particle.speedY += Math.sin(angle) * force;

                // Clamp speed
                particle.speedX = Math.max(-4, Math.min(4, particle.speedX));
                particle.speedY = Math.max(-4, Math.min(4, particle.speedY));
            }
        });
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        particleData.forEach(particle => {
            // Keep particles within bounds
            if (particle.x > window.innerWidth) {
                particle.x = window.innerWidth - particle.size;
            }
            if (particle.y > window.innerHeight) {
                particle.y = window.innerHeight - particle.size;
            }
        });
    });

    // Form submission handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // For now, just log - you can add actual authentication later
            console.log('Login attempt:', { username, password });
            alert('Login functionality will be implemented soon!');
        });
    }

    // Initialize
    createCircles();
    animateParticles();
});
