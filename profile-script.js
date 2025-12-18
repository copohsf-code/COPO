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
    
    // Load user's theme preference
    await loadUserTheme(username);
    
    // Setup theme selector
    setupThemeSelector(username);
    
    // Setup sidebar navigation
    setupSidebarNavigation();
});

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

        // Store current theme in session
        sessionStorage.setItem('currentTheme', themeName);
    } catch (error) {
        console.error('Error applying theme:', error);
    }
}

// Setup theme selector
function setupThemeSelector(username) {
    const themeSelect = document.getElementById('themeSelect');
    if (!themeSelect) return;

    themeSelect.addEventListener('change', async (e) => {
        const selectedTheme = e.target.value;
        
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

