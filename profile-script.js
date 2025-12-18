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

    // Special handling for Students page
    if (page === 'students') {
        mainContent.innerHTML = `
        <div class="content-section">
            <div class="page-header">
                <h1 class="page-title">Students Management</h1>
            </div>

            <div class="btn-group">
                <button class="btn btn-primary" id="btnAddStudent">Add Student</button>
                <button class="btn btn-outline" id="btnSearchStudent">Search Student</button>
                <button class="btn btn-outline" id="btnViewStudents">View Students</button>
            </div>

            <div id="studentsContent">
                <div class="card">
                    <p class="text-muted">Select an action above to manage students.</p>
                </div>
            </div>
        </div>
        `;

        setupStudentsPage();
        return;
    }

    // Special handling for Faculty page
    if (page === 'faculty') {
        mainContent.innerHTML = `
        <div class="content-section">
            <div class="page-header">
                <h1 class="page-title">Faculty Management</h1>
            </div>

            <div class="btn-group">
                <button class="btn btn-primary" id="btnAddFaculty">Add Faculty</button>
                <button class="btn btn-outline" id="btnSearchFaculty">Search Faculty</button>
                <button class="btn btn-outline" id="btnViewFaculty">View Faculties</button>
            </div>

            <div id="facultyContent">
                <div class="card">
                    <p class="text-muted">Select an action above to manage faculties.</p>
                </div>
            </div>
        </div>
        `;

        setupFacultyPage();
        return;
    }

    // Default placeholder content for other pages
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

// ===============================
// Students Page Logic
// ===============================

function setupStudentsPage() {
    const btnAdd = document.getElementById('btnAddStudent');
    const btnSearch = document.getElementById('btnSearchStudent');
    const btnView = document.getElementById('btnViewStudents');

    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            renderAddStudentForm();
        });
    }

    if (btnSearch) {
        btnSearch.addEventListener('click', () => {
            const container = document.getElementById('studentsContent');
            if (!container) return;
            container.innerHTML = `
                <div class="card">
                    <h2 class="card-title">Search Student</h2>
                    <p class="text-muted">Search functionality will be implemented later.</p>
                </div>
            `;
        });
    }

    if (btnView) {
        btnView.addEventListener('click', async () => {
            const container = document.getElementById('studentsContent');
            if (!container) return;

            const data = await dataManager.loadData();
            const students = data.students || [];

            if (!students.length) {
                container.innerHTML = `
                    <div class="card">
                        <h2 class="card-title">View Students</h2>
                        <p class="text-muted">No students found. Please add a student first.</p>
                    </div>
                `;
                return;
            }

            const rows = students.map((s, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${s.applicationFormNo || ''}</td>
                    <td>${s.name || ''}</td>
                    <td>${s.enrUom || ''}</td>
                    <td>${s.rollNo || ''}</td>
                    <td>${s.department || ''}</td>
                    <td>${s.className || ''}</td>
                    <td>${s.division || ''}</td>
                </tr>
            `).join('');

            container.innerHTML = `
                <div class="card">
                    <h2 class="card-title">View Students</h2>
                    <div class="table-wrapper">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Application Form No.</th>
                                    <th>Name</th>
                                    <th>ENR of UoM</th>
                                    <th>Roll No.</th>
                                    <th>Department</th>
                                    <th>Class</th>
                                    <th>Division</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rows}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        });
    }
}

function renderAddStudentForm() {
    const container = document.getElementById('studentsContent');
    if (!container) return;

    container.innerHTML = `
        <div class="card">
            <h2 class="card-title">Add Student</h2>
            <form id="addStudentForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="applicationFormNo">Application Form No.</label>
                        <input type="text" id="applicationFormNo" name="applicationFormNo" placeholder="MU5365401587" required />
                    </div>

                    <div class="form-group">
                        <label for="studentName">Name of the Student</label>
                        <input type="text" id="studentName" name="studentName" placeholder="XYZ" required />
                    </div>

                    <div class="form-group">
                        <label for="enrUom">ENR of UoM (e-samarth)</label>
                        <input type="text" id="enrUom" name="enrUom" placeholder="MU034112054511210" required />
                    </div>

                    <div class="form-group">
                        <label>Gender</label>
                        <div class="gender-group">
                            <label class="gender-option">
                                <input type="radio" name="gender" value="Male" required /> Male
                            </label>
                            <label class="gender-option">
                                <input type="radio" name="gender" value="Female" required /> Female
                            </label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="rollNo">Roll No.</label>
                        <input type="text" id="rollNo" name="rollNo" placeholder="01" required />
                    </div>

                    <div class="form-group">
                        <label for="academicYear">Academic Year</label>
                        <input type="text" id="academicYear" name="academicYear" placeholder="2025-26" required />
                    </div>

                    <div class="form-group">
                        <label for="department">Department</label>
                        <select id="department" name="department" required>
                            <option value="">Select Department</option>
                            <option value="BSC IT">BSC IT</option>
                            <option value="BSC CS">BSC CS</option>
                            <option value="B.COM">B.COM</option>
                            <option value="BA">BA</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="className">Class</label>
                        <select id="className" name="className" required>
                            <option value="">Select Class</option>
                            <option value="FY">FY</option>
                            <option value="SY">SY</option>
                            <option value="TY">TY</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="division">Division</label>
                        <select id="division" name="division" required>
                            <option value="">Select Division</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="phoneNo">Phone No.</label>
                        <input type="tel" id="phoneNo" name="phoneNo" placeholder="+91" required />
                    </div>

                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" placeholder="xyz@gmail.com" required />
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-outline" id="cancelAddStudent">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Student</button>
                </div>
            </form>
        </div>
    `;

    const form = document.getElementById('addStudentForm');
    const cancelBtn = document.getElementById('cancelAddStudent');

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            const defaultCard = `
                <div class="card">
                    <p class="text-muted">Select an action above to manage students.</p>
                </div>
            `;
            container.innerHTML = defaultCard;
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const genderEl = form.querySelector('input[name="gender"]:checked');

            const student = {
                applicationFormNo: form.applicationFormNo.value.trim(),
                name: form.studentName.value.trim(),
                enrUom: form.enrUom.value.trim(),
                gender: genderEl ? genderEl.value : '',
                rollNo: form.rollNo.value.trim(),
                academicYear: form.academicYear.value.trim(),
                department: form.department.value,
                className: form.className.value,
                division: form.division.value,
                phoneNo: form.phoneNo.value.trim(),
                email: form.email.value.trim()
            };

            // Basic validation: ensure required fields are filled
            if (!student.applicationFormNo || !student.name || !student.enrUom) {
                showNotification('Please fill all required fields.', 'error');
                return;
            }

            try {
                await dataManager.addStudent(student);
                showNotification('Student added successfully!', 'success');
                form.reset();
            } catch (error) {
                console.error('Error adding student:', error);
                showNotification('Error adding student. Please try again.', 'error');
            }
        });
    }
}

// ===============================
// Faculty Page Logic
// ===============================

function setupFacultyPage() {
    const btnAdd = document.getElementById('btnAddFaculty');
    const btnSearch = document.getElementById('btnSearchFaculty');
    const btnView = document.getElementById('btnViewFaculty');

    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            renderAddFacultyForm();
        });
    }

    if (btnSearch) {
        btnSearch.addEventListener('click', () => {
            const container = document.getElementById('facultyContent');
            if (!container) return;
            container.innerHTML = `
                <div class="card">
                    <h2 class="card-title">Search Faculty</h2>
                    <p class="text-muted">Search functionality will be implemented later.</p>
                </div>
            `;
        });
    }

    if (btnView) {
        btnView.addEventListener('click', async () => {
            const container = document.getElementById('facultyContent');
            if (!container) return;

            const data = await dataManager.loadData();
            const facultyList = data.faculty || [];

            if (!facultyList.length) {
                container.innerHTML = `
                    <div class="card">
                        <h2 class="card-title">View Faculties</h2>
                        <p class="text-muted">No faculties found. Please add a faculty first.</p>
                    </div>
                `;
                return;
            }

            const rows = facultyList.map((f, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${f.facultyId || ''}</td>
                    <td>${f.facultyName || ''}</td>
                    <td>${f.designation || ''}</td>
                    <td>${f.email || ''}</td>
                    <td>${f.phoneNo || ''}</td>
                </tr>
            `).join('');

            container.innerHTML = `
                <div class="card">
                    <h2 class="card-title">View Faculties</h2>
                    <div class="table-wrapper">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Faculty Id</th>
                                    <th>Faculty Name</th>
                                    <th>Designation</th>
                                    <th>Email</th>
                                    <th>Phone No.</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rows}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        });
    }
}

function renderAddFacultyForm() {
    const container = document.getElementById('facultyContent');
    if (!container) return;

    container.innerHTML = `
        <div class="card">
            <h2 class="card-title">Add Faculty</h2>
            <form id="addFacultyForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="facultyId">Faculty Id</label>
                        <input type="text" id="facultyId" name="facultyId" placeholder="FAC001" required />
                    </div>

                    <div class="form-group">
                        <label for="facultyName">Faculty Name</label>
                        <input type="text" id="facultyName" name="facultyName" placeholder="John Doe" required />
                    </div>

                    <div class="form-group">
                        <label for="facultyDesignation">Faculty Designation</label>
                        <input type="text" id="facultyDesignation" name="facultyDesignation" placeholder="Assistant Professor" required />
                    </div>

                    <div class="form-group">
                        <label for="facultyEmail">Faculty Email</label>
                        <input type="email" id="facultyEmail" name="facultyEmail" placeholder="faculty@example.com" required />
                    </div>

                    <div class="form-group">
                        <label for="facultyPhone">Faculty Phone number</label>
                        <input type="tel" id="facultyPhone" name="facultyPhone" placeholder="+91" required />
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-outline" id="cancelAddFaculty">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Faculty</button>
                </div>
            </form>
        </div>
    `;

    const form = document.getElementById('addFacultyForm');
    const cancelBtn = document.getElementById('cancelAddFaculty');

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            container.innerHTML = `
                <div class="card">
                    <p class="text-muted">Select an action above to manage faculties.</p>
                </div>
            `;
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const faculty = {
                facultyId: form.facultyId.value.trim(),
                facultyName: form.facultyName.value.trim(),
                designation: form.facultyDesignation.value.trim(),
                email: form.facultyEmail.value.trim(),
                phoneNo: form.facultyPhone.value.trim()
            };

            if (!faculty.facultyId || !faculty.facultyName || !faculty.email) {
                showNotification('Please fill all required fields.', 'error');
                return;
            }

            try {
                await dataManager.addFaculty(faculty);
                showNotification('Faculty added successfully!', 'success');
                form.reset();
            } catch (error) {
                console.error('Error adding faculty:', error);
                showNotification('Error adding faculty. Please try again.', 'error');
            }
        });
    }
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

