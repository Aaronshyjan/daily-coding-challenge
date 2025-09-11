// Application state
let currentUser = null;
let currentPage = 'loginPage';
let challenges = [];
let userProgress = {};

// API base URL (change if backend deployed)
const API_URL = "http://localhost:5000";

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Daily Coding Challenge App initializing...');
    initializeApp();
    setupEventListeners();
    setupGlobalFunctions();
});

// Make all functions available globally for onclick handlers
function setupGlobalFunctions() {
    window.showLogin = showLogin;
    window.showSignup = showSignup;
    window.showDashboard = showDashboard;
    window.showChallenges = showChallenges;
    window.showOverallScore = showOverallScore;
    window.showAdmin = showAdmin;
    window.logout = logout;
    window.openCompiler = openCompiler;
    window.runCode = runCode;
    window.submitCode = submitCode;
    window.submitMCQ = submitMCQ;
    window.showAdminTab = showAdminTab;
    window.loadAllUsers = loadAllUsers;
    window.exportUserData = exportUserData;
    window.generateReports = generateReports;
    window.changeUserRole = changeUserRole;
}

// Initialize the application
function initializeApp() {
    console.log('Checking authentication state...');

    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            console.log('Found saved user:', currentUser.name, 'Role:', currentUser.role);
            showDashboard();
            return;
        } catch (e) {
            console.log('Invalid saved user data, clearing...');
            localStorage.removeItem('currentUser');
        }
    }

    showLogin();

    // Set today's date
    const today = new Date().toDateString();
    const dateElements = document.querySelectorAll('#todayDate');
    dateElements.forEach(el => {
        if (el) el.textContent = today;
    });
}

// Role-based access control
function isAdmin() {
    return currentUser && currentUser.role === 'admin';
}
function requireAdmin() {
    if (!isAdmin()) {
        console.log('Access denied: Admin privileges required');
        showAccessDenied();
        return false;
    }
    return true;
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSignup();
        });
    }

    const addChallengeForm = document.getElementById('addChallengeForm');
    if (addChallengeForm) {
        addChallengeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAddChallenge();
        });
    }
}

// Authentication
async function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!email || !password) {
        alert("Please fill in all fields");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showDashboard();
        } else {
            alert(data.message || "Invalid login");
        }
    } catch (err) {
        console.error("Login error:", err);
        alert("Login failed, try again.");
    }
}

async function handleSignup() {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const role = document.getElementById('userRole').value;

    if (!name || !email || !password) {
        alert("Fill all fields");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, role })
        });
        const data = await res.json();
        if (data.success) {
            alert("Account created, please login.");
            showLogin();
        } else {
            alert(data.message || "Signup failed");
        }
    } catch (err) {
        console.error("Signup error:", err);
        alert("Signup failed, try again.");
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLogin();
}

// Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.remove('hidden');
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (pageId === 'loginPage' || pageId === 'signupPage') {
            navbar.classList.add('hidden');
        } else {
            if (currentUser) navbar.classList.remove('hidden');
            else showLogin();
        }
    }
    currentPage = pageId;
}
function showLogin() { return showPage('loginPage'); }
function showSignup() { return showPage('signupPage'); }
function showDashboard() {
    if (!currentUser) return showLogin();
    if (showPage('dashboardPage')) updateDashboardStats();
}
async function showChallenges() {
    if (!currentUser) return showLogin();
    if (showPage('challengePage')) {
        await loadTodayChallenges();
    }
}

// Challenges
async function loadTodayChallenges() {
    try {
        const res = await fetch(`${API_URL}/challenges`);
        challenges = await res.json();
        console.log("Loaded challenges:", challenges);
    } catch (err) {
        console.error("Failed to load challenges:", err);
    }
}

function submitMCQ() {
    alert("MCQ submission will be saved to DB (connect backend /progress).");
}
function submitCode() {
    alert("Code submission will be saved to DB (connect backend /progress).");
}

// Dashboard
function updateDashboardStats() {
    if (!currentUser) return;
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('currentStreak').textContent = userProgress.currentStreak || 0;
    document.getElementById('totalScore').textContent = userProgress.totalScore || 0;
    document.getElementById('completedChallenges').textContent = userProgress.completedChallenges || 0;
}

// Admin
function showAdmin() {
    if (!currentUser || !isAdmin()) return showAccessDenied();
    showPage("adminPage");
}
function showAccessDenied() { showPage("accessDeniedPage"); }

// Compiler
function openCompiler() { showPage('compilerPage'); }
function runCode() { alert("Simulated code execution"); }
