// Constants - Keep these for transition
const STORAGE_USERS = 'mini_users_box';
const STORAGE_REMEMBER_ME = 'mini_remember_me';
const SESSION_USER = 'session_user_box';

// Utility functions - Updated for Firebase
function getCurrentUser() {
    // First check session storage
    const sessionUser = sessionStorage.getItem(SESSION_USER);
    if (sessionUser) {
        return JSON.parse(sessionUser);
    }
    return null;
}

function setCurrentUser(user) {
    sessionStorage.setItem(SESSION_USER, JSON.stringify(user));
}

function clearCurrentUser() {
    sessionStorage.removeItem(SESSION_USER);
    localStorage.removeItem(STORAGE_REMEMBER_ME);
}

function showAlert(message, type, containerId = 'authAlert') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
            
        // Auto-hide after 5 seconds
        setTimeout(() => {
            container.innerHTML = '';
        }, 5000);
    }
}

// DOM Elements
const authForm = document.getElementById('authForm');
const signupBtn = document.getElementById('signupBtn');
const loginSection = document.getElementById('loginSection');
const userInfoSection = document.getElementById('userInfoSection');
const logoutBtn = document.getElementById('logoutBtn');
const authAlert = document.getElementById('authAlert');
const userGreeting = document.getElementById('userGreeting');
const rememberMeCheckbox = document.getElementById('rememberMe');

// Event Listeners
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is already logged in with Firebase
    try {
        const user = await authService.getCurrentUser();
        if (user) {
            const userData = {
                uid: user.uid,
                username: user.email.split('@')[0], // Extract username from email
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                role: user.email.includes('riyad') || user.email.includes('shaomi') ? 'admin' : 'user'
            };
            setCurrentUser(userData);
            showUserInfo(userData);
            showAlert('Auto login successful!', 'success');
        }
    } catch (error) {
        console.log('No user logged in');
    }
});

// FIREBASE AUTHENTICATION
authForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const submitBtn = authForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
        
    // Show loading state
    submitBtn.innerHTML = '<span class="loading"></span> Logging in...';
    submitBtn.disabled = true;
        
    const username = document.getElementById('authUser').value.trim();
    const password = document.getElementById('authPass').value;
        
    if (!username || !password) {
        showAlert('Username and password are required.', 'error');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        return;
    }
    
    try {
        // Convert username to email format for Firebase
        const email = `${username}@4cstb1.com`;
        
        console.log('Attempting Firebase login with:', email);
        
        // Firebase login
        const result = await authService.login(email, password);
            
        if (result.success) {
            const userData = {
                uid: result.user.uid,
                username: username,
                email: result.user.email,
                displayName: result.user.displayName || username,
                role: result.user.email.includes('riyad') || result.user.email.includes('shaomi') ? 'admin' : 'user'
            };
            
            setCurrentUser(userData);
            showUserInfo(userData);
            showAlert('Login successful!', 'success');
                
            // Redirect to notice page after successful login
            setTimeout(() => {
                window.location.href = 'notice.html';
            }, 1500);
        } else {
            showAlert(result.error, 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        showAlert('Login failed. Please try again.', 'error');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// FIREBASE SIGNUP
signupBtn.addEventListener('click', async function() {
    const username = prompt('Username:');
    if (!username || username.length < 3) {
        alert('Username must be at least 3 characters long.');
        return;
    }
        
    const password = prompt('Password:');
    if (!password || password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
    }
    
    const displayName = prompt('Display Name:') || username;
    
    try {
        const email = `${username}@4cstb1.com`;
        const result = await authService.signUp(email, password, displayName);
        
        if (result.success) {
            alert('Account created successfully! Please login now.');
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        alert('Signup failed: ' + error.message);
    }
});

// FIREBASE LOGOUT
logoutBtn.addEventListener('click', async function() {
    const logoutBtnElement = this;
    const originalText = logoutBtnElement.innerHTML;
        
    // Show loading state
    logoutBtnElement.innerHTML = '<span class="loading"></span> Logging out...';
    logoutBtnElement.disabled = true;
        
    try {
        const result = await authService.logout();
        
        if (result.success) {
            clearCurrentUser();
            showAlert('Logout successful!', 'success');
                
            // Show login section after logout
            setTimeout(() => {
                userInfoSection.classList.add('hidden');
                loginSection.classList.remove('hidden');
                authForm.reset();
                logoutBtnElement.innerHTML = originalText;
                logoutBtnElement.disabled = false;
            }, 1000);
        } else {
            showAlert('Logout failed: ' + result.error, 'error');
            logoutBtnElement.innerHTML = originalText;
            logoutBtnElement.disabled = false;
        }
    } catch (error) {
        showAlert('Logout failed. Please try again.', 'error');
        logoutBtnElement.innerHTML = originalText;
        logoutBtnElement.disabled = false;
    }
});

function showUserInfo(user) {
    if (loginSection) loginSection.classList.add('hidden');
    if (userInfoSection) userInfoSection.classList.remove('hidden');
    if (userGreeting) {
        userGreeting.textContent = (user.displayName || user.username) + (user.role === 'admin' ? ' (Admin)' : '');
    }
}

// Add input validation styling
document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('blur', function() {
        if (this.value.trim() === '') {
            this.style.borderColor = '#e2e8f0';
        } else if (this.checkValidity()) {
            this.style.borderColor = '#48bb78';
        } else {
            this.style.borderColor = '#f56565';
        }
    });
});
