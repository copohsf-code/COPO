// ============================================
// Profile Page Script - Admin Profile
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    const loggedIn = sessionStorage.getItem('loggedIn');
    const username = sessionStorage.getItem('username');
    
    if (!loggedIn || !username) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize data manager
    await dataManager.loadData();
    
    // Get user role
    const user = await dataManager.getUser(username);
    const userRole = user ? user.role : 'admin';
    sessionStorage.setItem('userRole', userRole);
    
    // Update welcome message based on role
    updateWelcomeMessage(userRole, username);
    
    // Load user's theme preference
    await loadUserTheme(username);
    
    // Setup theme selector (with role-based filtering)
    setupThemeSelector(username, userRole);
    
    // Setup sidebar navigation
    setupSidebarNavigation();
});

// Update welcome message based on user role
function updateWelcomeMessage(userRole, username) {
    const welcomeTitle = document.getElementById('welcomeTitle');
    const welcomeRole = document.getElementById('welcomeRole');
    
    if (welcomeTitle && welcomeRole) {
        const roleNames = {
            'superroot': 'Superroot',
            'admin': 'Administrator',
            'faculty': 'Faculty Member',
            'student': 'Student'
        };
        
        const roleName = roleNames[userRole] || 'User';
        welcomeTitle.textContent = `Welcome, ${roleName}`;
        welcomeRole.textContent = `You are now logged in as ${roleName}.`;
    }
}

// Load user's saved theme
async function loadUserTheme(username) {
    try {
        const user = await dataManager.getUser(username);
        if (user && user.theme) {
            await applyTheme(user.theme);
            
            // Set theme selector value
            const themeSelect = document.getElementById('themeSelect');
            if (themeSelect) {
                themeSelect.value = user.theme;
            }
        }
    } catch (error) {
        console.error('Error loading theme:', error);
    }
}

// Apply theme to the page
async function applyTheme(themeName) {
    try {
        const theme = await dataManager.getTheme(themeName);
        if (!theme) return;

        // Update CSS variables
        document.documentElement.style.setProperty('--primary-color', theme.primary);
        document.documentElement.style.setProperty('--secondary-color', theme.secondary);
        document.documentElement.style.setProperty('--navbar-gradient', theme.navbar);
        document.documentElement.style.setProperty('--sidebar-gradient', theme.sidebar);
        document.documentElement.style.setProperty('--accent-color', theme.accent);

        // Set data attribute for theme-specific styling
        document.body.setAttribute('data-theme', themeName);

        // Store current theme in session
        sessionStorage.setItem('currentTheme', themeName);
    } catch (error) {
        console.error('Error applying theme:', error);
    }
}

// Setup theme selector with role-based filtering
async function setupThemeSelector(username, userRole) {
    const themeSelect = document.getElementById('themeSelect');
    if (!themeSelect) return;

    // Get all available themes
    const allThemes = await dataManager.getAllThemes();
    
    // Clear existing options
    themeSelect.innerHTML = '';
    
    // Add themes based on user role
    for (const [key, theme] of Object.entries(allThemes)) {
        // Only show superroot theme to superroot users
        if (key === 'superroot' && userRole !== 'superroot') {
            continue;
        }
        
        const option = document.createElement('option');
        option.value = key;
        option.textContent = theme.name;
        themeSelect.appendChild(option);
    }
    
    // Set current user's theme
    const user = await dataManager.getUser(username);
    if (user && user.theme) {
        themeSelect.value = user.theme;
    }

    themeSelect.addEventListener('change', async (e) => {
        const selectedTheme = e.target.value;
        
        // Prevent non-superroot users from selecting superroot theme
        if (selectedTheme === 'superroot' && userRole !== 'superroot') {
            themeSelect.value = user.theme || 'default';
            showNotification('Access denied: This theme is exclusive to superroot users', 'error');
            return;
        }
        
        // Apply theme immediately
        await applyTheme(selectedTheme);
        
        // Save theme preference to user data
        try {
            await dataManager.updateUserTheme(username, selectedTheme);
            
            // Show success message
            showNotification('Theme updated successfully!', 'success');
        } catch (error) {
            console.error('Error saving theme:', error);
            showNotification('Error saving theme preference', 'error');
        }
    });
}

// Setup sidebar navigation
function setupSidebarNavigation() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    
    sidebarItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all items
            sidebarItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Get page name
            const page = item.getAttribute('data-page');
            
            // Load page content (placeholder for now)
            loadPageContent(page);
        });
    });
}

// Load page content based on selection
function loadPageContent(page) {
    const mainContent = document.getElementById('mainContent');
    
    // Placeholder content - will be replaced with actual pages later
    const pageTitles = {
        'students': 'Students Management',
        'faculty': 'Faculty Management',
        'subjects': 'Subjects Management',
        'co': 'Course Outcomes (CO)',
        'po': 'Program Outcomes (PO)',
        'copo': 'COPO Mapped Report',
        'naac': 'NAAC Management',
        'questionpaper': 'Question Paper Management',
        'answersheet': 'Answer Sheet Management'
    };

    const title = pageTitles[page] || 'Page';
    
    mainContent.innerHTML = `
        <div class="content-section">
            <div class="welcome-section">
                <h1>${title}</h1>
                <p>This section is under development.</p>
                <p class="under-construction">Content for ${title} will be available soon.</p>
            </div>
        </div>
    `;
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('loggedIn');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('currentTheme');
        window.location.href = 'index.html';
    }
}

