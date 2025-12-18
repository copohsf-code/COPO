// ============================================
// Data Manager - Handles JSON file operations
// ============================================

class DataManager {
    constructor() {
        this.dataFile = 'data.json';
        this.data = null;
    }

    // Load data from JSON file
    async loadData() {
        // If already loaded once, reuse in-memory data
        if (this.data) {
            return this.data;
        }

        // Try JSON file
        try {
            const response = await fetch(this.dataFile);
            if (response.ok) {
                this.data = await response.json();
                return this.data;
            }
        } catch (error) {
            console.log('JSON file not accessible, using defaults');
        }
        
        // Return default structure if nothing found
        const defaultData = this.getDefaultData();
        this.data = defaultData;
        return defaultData;
    }

    // Save data (in-memory only on frontend; actual JSON write will be done by backend later)
    async saveData(data) {
        try {
            this.data = data;
            // NOTE: Frontend JavaScript in the browser cannot write directly to data.json.
            // When backend is added, replace this with an API that persists to JSON/DB.
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    // Get default data structure
    getDefaultData() {
        return {
            users: [
                {
                    username: "admin",
                    password: "admin123",
                    role: "admin",
                    theme: "default",
                    createdAt: new Date().toISOString(),
                    lastLogin: ""
                },
                {
                    username: "superroot",
                    password: "superroot123",
                    role: "superroot",
                    theme: "superroot",
                    createdAt: new Date().toISOString(),
                    lastLogin: ""
                }
            ],
            students: [],
            faculty: [],
            subjects: [],
            co: [],
            po: [],
            copoMapped: [],
            naac: [],
            questionPapers: [],
            answerSheets: [],
            themes: {
                default: {
                    name: "Default Blue",
                    primary: "#1976d2",
                    secondary: "#64b5f6",
                    navbar: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)",
                    sidebar: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)",
                    accent: "#1565c0"
                },
                green: {
                    name: "Green Theme",
                    primary: "#2e7d32",
                    secondary: "#66bb6a",
                    navbar: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)",
                    sidebar: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)",
                    accent: "#1b5e20"
                },
                purple: {
                    name: "Purple Theme",
                    primary: "#7b1fa2",
                    secondary: "#ba68c8",
                    navbar: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 50%, #ce93d8 100%)",
                    sidebar: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 50%, #ce93d8 100%)",
                    accent: "#4a148c"
                },
                orange: {
                    name: "Orange Theme",
                    primary: "#e65100",
                    secondary: "#ff9800",
                    navbar: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 50%, #ffcc80 100%)",
                    sidebar: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 50%, #ffcc80 100%)",
                    accent: "#bf360c"
                },
                teal: {
                    name: "Teal Theme",
                    primary: "#00695c",
                    secondary: "#26a69a",
                    navbar: "linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 50%, #80cbc4 100%)",
                    sidebar: "linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 50%, #80cbc4 100%)",
                    accent: "#004d40"
                },
                superroot: {
                    name: "Superroot Exclusive",
                    primary: "#00203F",
                    secondary: "#ADEFD1",
                    navbar: "linear-gradient(135deg, #00203F 0%, #003d5c 50%, #004d6b 100%)",
                    sidebar: "linear-gradient(135deg, #00203F 0%, #003d5c 50%, #004d6b 100%)",
                    accent: "#ADEFD1"
                }
            }
        };
    }

    // Get user by username
    async getUser(username) {
        const data = await this.loadData();
        return data.users.find(user => user.username === username);
    }

    // Update user data
    async updateUser(username, updates) {
        const data = await this.loadData();
        const userIndex = data.users.findIndex(user => user.username === username);
        
        if (userIndex !== -1) {
            data.users[userIndex] = { ...data.users[userIndex], ...updates };
            await this.saveData(data);
            return true;
        }
        return false;
    }

    // Update user's theme preference
    async updateUserTheme(username, themeName) {
        return await this.updateUser(username, { theme: themeName });
    }

    // Get theme data
    async getTheme(themeName) {
        const data = await this.loadData();
        return data.themes[themeName] || data.themes.default;
    }

    // Get all themes
    async getAllThemes() {
        const data = await this.loadData();
        return data.themes;
    }

    // ===============================
    // Students
    // ===============================

    // Add a new student
    async addStudent(student) {
        const data = await this.loadData();
        if (!Array.isArray(data.students)) {
            data.students = [];
        }

        const studentWithMeta = {
            id: `STU-${Date.now()}`,
            createdAt: new Date().toISOString(),
            ...student
        };

        data.students.push(studentWithMeta);
        await this.saveData(data);
        return studentWithMeta;
    }

    // ===============================
    // Faculty
    // ===============================

    async addFaculty(faculty) {
        const data = await this.loadData();
        if (!Array.isArray(data.faculty)) {
            data.faculty = [];
        }

        const facultyWithMeta = {
            id: `FAC-${Date.now()}`,
            createdAt: new Date().toISOString(),
            ...faculty
        };

        data.faculty.push(facultyWithMeta);
        await this.saveData(data);
        return facultyWithMeta;
    }

}

// Create global instance
const dataManager = new DataManager();

