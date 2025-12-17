// ============================================
// Floating Circles Animation with Touch Sensitivity
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const circlesContainer = document.getElementById('circlesContainer');
    const circles = [];
    const numCircles = 15;

    // Circle properties
    const minSize = 30;
    const maxSize = 120;

    // Create floating circles
    function createCircles() {
        for (let i = 0; i < numCircles; i++) {
            const circle = document.createElement('div');
            circle.classList.add('circle');

            // Random size
            const size = Math.random() * (maxSize - minSize) + minSize;
            circle.style.width = `${size}px`;
            circle.style.height = `${size}px`;

            // Random position
            const posX = Math.random() * (window.innerWidth - size);
            const posY = Math.random() * (window.innerHeight - size);
            circle.style.left = `${posX}px`;
            circle.style.top = `${posY}px`;

            // Random animation delay for variety
            circle.style.animationDelay = `${Math.random() * 5}s`;

            // Random opacity for depth effect
            circle.style.opacity = Math.random() * 0.5 + 0.3;

            // Store velocity for movement
            circle.dataset.vx = (Math.random() - 0.5) * 2;
            circle.dataset.vy = (Math.random() - 0.5) * 2;
            circle.dataset.baseX = posX;
            circle.dataset.baseY = posY;

            // Add touch/click interaction
            circle.addEventListener('click', handleCircleTouch);
            circle.addEventListener('touchstart', handleCircleTouch);

            circlesContainer.appendChild(circle);
            circles.push(circle);
        }
    }

    // Handle circle touch/click
    function handleCircleTouch(e) {
        e.preventDefault();
        const circle = e.target;
        circle.classList.add('touched');

        // Remove the class after animation
        setTimeout(() => {
            circle.classList.remove('touched');
        }, 600);

        // Move circle to random position
        const newX = Math.random() * (window.innerWidth - parseFloat(circle.style.width));
        const newY = Math.random() * (window.innerHeight - parseFloat(circle.style.height));
        
        circle.style.transition = 'left 0.8s ease-out, top 0.8s ease-out';
        circle.style.left = `${newX}px`;
        circle.style.top = `${newY}px`;

        // Reset transition after movement
        setTimeout(() => {
            circle.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        }, 800);
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
        circles.forEach(circle => {
            const rect = circle.getBoundingClientRect();
            const circleX = rect.left + rect.width / 2;
            const circleY = rect.top + rect.height / 2;

            const dx = circleX - x;
            const dy = circleY - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Only affect circles within 200px radius
            if (distance < 200) {
                const force = (200 - distance) / 200;
                const angle = Math.atan2(dy, dx);
                const pushX = Math.cos(angle) * force * 100;
                const pushY = Math.sin(angle) * force * 100;

                const newX = Math.max(0, Math.min(window.innerWidth - rect.width, rect.left + pushX));
                const newY = Math.max(0, Math.min(window.innerHeight - rect.height, rect.top + pushY));

                circle.style.transition = 'left 0.5s ease-out, top 0.5s ease-out';
                circle.style.left = `${newX}px`;
                circle.style.top = `${newY}px`;

                setTimeout(() => {
                    circle.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
                }, 500);
            }
        });
    }

    // Mouse move parallax effect
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Subtle parallax animation
    function animateParallax() {
        circles.forEach((circle, index) => {
            const depth = (index % 3 + 1) * 0.01;
            const moveX = (mouseX - window.innerWidth / 2) * depth;
            const moveY = (mouseY - window.innerHeight / 2) * depth;

            const currentLeft = parseFloat(circle.style.left);
            const currentTop = parseFloat(circle.style.top);

            if (!circle.style.transition.includes('left')) {
                circle.style.transform = `translate(${moveX}px, ${moveY}px)`;
            }
        });

        requestAnimationFrame(animateParallax);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        circles.forEach(circle => {
            const currentLeft = parseFloat(circle.style.left);
            const currentTop = parseFloat(circle.style.top);
            const size = parseFloat(circle.style.width);

            // Keep circles within bounds
            if (currentLeft + size > window.innerWidth) {
                circle.style.left = `${window.innerWidth - size}px`;
            }
            if (currentTop + size > window.innerHeight) {
                circle.style.top = `${window.innerHeight - size}px`;
            }
        });
    });

    // Initialize
    createCircles();
    animateParallax();
});

