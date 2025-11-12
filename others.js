// Constants
const STORAGE_USERS = 'mini_users_box';
const STORAGE_REMEMBER_ME = 'mini_remember_me';
const SESSION_USER = 'session_user_box';

// Utility functions
function loadUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_USERS) || '[]');
}

function getCurrentUser() {
    // First check session storage
    const sessionUser = sessionStorage.getItem(SESSION_USER);
    if (sessionUser) {
        return JSON.parse(sessionUser);
    }
        
    // Then check remember me
    const rememberMe = localStorage.getItem(STORAGE_REMEMBER_ME);
    if (rememberMe) {
        const rememberedUser = JSON.parse(rememberMe);
        // Verify user still exists
        const users = loadUsers();
        const userExists = users.find(u => u.username === rememberedUser.username && u.password === rememberedUser.password);
        if (userExists) {
            setCurrentUser(userExists);
            return userExists;
        }
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

function setRememberMe(user) {
    localStorage.setItem(STORAGE_REMEMBER_ME, JSON.stringify({
        username: user.username,
        password: user.password
    }));
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
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in (auto-login if remembered)
    const user = getCurrentUser();
    if (user && user.username) {
        showUserInfo(user);
        showAlert('Auto login successful!', 'success');
    }
});

// AUTHENTICATION WITH REMEMBER ME
authForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const submitBtn = authForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
        
    // Show loading state
    submitBtn.innerHTML = '<span class="loading"></span> Logging in...';
    submitBtn.disabled = true;
        
    const username = document.getElementById('authUser').value.trim();
    const password = document.getElementById('authPass').value;
    const rememberMe = rememberMeCheckbox.checked;
        
    if (!username || !password) {
        showAlert('Username and password are required.', 'error');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        return;
    }
        
    // Simulate network delay
    setTimeout(() => {
        const users = loadUsers();
        const foundUser = users.find(u => u.username === username && u.password === password);
            
        if (foundUser) {
            setCurrentUser(foundUser);
                
            // Save to remember me if checked
            if (rememberMe) {
                setRememberMe(foundUser);
            }
                
            showUserInfo(foundUser);
            showAlert('Login successful!', 'success');
                
            // Redirect to admin.html after successful login
            setTimeout(() => {
                window.location.href = 'notice.html';
            }, 1500);
        } else {
            showAlert('Username or password does not match. Please try signing up.', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }, 1000);
});

signupBtn.addEventListener('click', function() {
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
        
    const users = loadUsers();
    if (users.some(u => u.username === username)) {
        alert('This username is already taken.');
        return;
    }
        
    const newUser = {
        id: Date.now(),
        username: username,
        password: password,
        role: 'user',
        createdAt: Date.now()
    };
        
    users.push(newUser);
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    alert('Account created successfully. Please login now.');
});

logoutBtn.addEventListener('click', function() {
    const logoutBtnElement = this;
    const originalText = logoutBtnElement.innerHTML;
        
    // Show loading state
    logoutBtnElement.innerHTML = '<span class="loading"></span> Logging out...';
    logoutBtnElement.disabled = true;
        
    setTimeout(() => {
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
    }, 800);
});

function showUserInfo(user) {
    if (loginSection) loginSection.classList.add('hidden');
    if (userInfoSection) userInfoSection.classList.remove('hidden');
    if (userGreeting) {
        userGreeting.textContent = user.username + (user.role === 'admin' ? ' (Admin)' : '');
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