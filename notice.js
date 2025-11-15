const STORAGE_USERS = 'mini_users_box';
const STORAGE_NOTICES = 'mini_notices_box';
const STORAGE_REQUESTS = 'mini_requests_box';
const STORAGE_REMEMBER_ME = 'mini_remember_me';
const SESSION_USER = 'session_user_box';
const NOTICES_PER_PAGE = 5;

// Firebase Functions - NEW
async function saveUsers(users) {
  // For Firebase, users are managed in Firebase Authentication
  // We'll keep this for backward compatibility
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}

async function loadUsers() {
  // For Firebase, we'll get users from Firebase Auth
  return JSON.parse(localStorage.getItem(STORAGE_USERS) || '[]');
}

async function saveNotices(notices) {
  // For Firebase, we save to Firestore
  try {
    // Clear existing notices and save new ones
    localStorage.setItem(STORAGE_NOTICES, JSON.stringify(notices));
  } catch (error) {
    console.error('Error saving notices to localStorage:', error);
  }
}

async function loadNotices() {
  try {
    // Try Firebase first
    const firebaseNotices = await dbService.getNotices();
    if (firebaseNotices && firebaseNotices.length > 0) {
      return firebaseNotices;
    }
    // Fallback to localStorage
    return JSON.parse(localStorage.getItem(STORAGE_NOTICES) || '[]');
  } catch (error) {
    console.error('Error loading notices:', error);
    return JSON.parse(localStorage.getItem(STORAGE_NOTICES) || '[]');
  }
}

async function saveRequests(requests) {
  try {
    localStorage.setItem(STORAGE_REQUESTS, JSON.stringify(requests));
  } catch (error) {
    console.error('Error saving requests to localStorage:', error);
  }
}

async function loadRequests() {
  try {
    // Try Firebase first
    const firebaseRequests = await dbService.getRequests();
    if (firebaseRequests && firebaseRequests.length > 0) {
      return firebaseRequests;
    }
    // Fallback to localStorage
    return JSON.parse(localStorage.getItem(STORAGE_REQUESTS) || '[]');
  } catch (error) {
    console.error('Error loading requests:', error);
    return JSON.parse(localStorage.getItem(STORAGE_REQUESTS) || '[]');
  }
}

function getCurrentUser() {
  // First check session storage
  const sessionUser = sessionStorage.getItem(SESSION_USER);
  if (sessionUser) {
    return JSON.parse(sessionUser);
  }
  
  // Remember me option check
  const rememberMe = localStorage.getItem(STORAGE_REMEMBER_ME);
  if (rememberMe) {
    const rememberedUser = JSON.parse(rememberMe);
    return rememberedUser;
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

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Check login status for all pages..
function checkLoginStatus() {
    const user = getCurrentUser();
    return user;
}

// Initialize with admin users if not exists
(async function() {
  const users = await loadUsers();
  
  // Check if R exists
  if (!users.some(u => u.username === 'Riyad' && u.role === 'admin')) {
    const adminUser1 = {
      id: Date.now(),
      username: 'Riyad',
      password: '840806@',
      role: 'admin',
      createdAt: Date.now(),
      displayName: 'Faizul Islam Riyad'
    };
    
    users.push(adminUser1);
    console.log('Admin user 1 created: Riyad (Faizul Islam Riyad)');
  }
  
  // Check if S exists
  if (!users.some(u => u.username === 'Shaomi' && u.role === 'admin')) {
    const adminUser2 = {
      id: Date.now() + 1,
      username: 'Shaomi',
      password: '840808@',
      role: 'admin',
      createdAt: Date.now(),
      displayName: 'Shareqa Shaomi'
    };
    
    users.push(adminUser2);
    console.log('Admin user 2 created: Shaomi (Shareqa Shaomi)');
  }
  
  await saveUsers(users);
  
  // No Default Note
  const notices = await loadNotices();
  if (notices.length === 0) {
    // No sample notices will be added
    await saveNotices([]);
  }
})();

// DOM Elements
const authForm = document.getElementById('authForm');
const signupBtn = document.getElementById('signupBtn');
const adminBox = document.getElementById('adminBox');
const authSection = document.getElementById('authSection');
const headerSection = document.getElementById('headerSection');
const userRequestSection = document.getElementById('userRequestSection');
const publicNotices = document.getElementById('publicNotices');
const noticesList = document.getElementById('noticesList');
const requestsList = document.getElementById('requestsList');
const myRequestsList = document.getElementById('myRequestsList');
const publicNoticesList = document.getElementById('publicNoticesList');
const usersList = document.getElementById('usersList');
const logoutBtn = document.getElementById('logoutBtn');
const authAlert = document.getElementById('authAlert');
const searchNotices = document.getElementById('searchNotices');
const titleCounter = document.getElementById('titleCounter');
const bodyCounter = document.getElementById('bodyCounter');
const requestTitleCounter = document.getElementById('requestTitleCounter');
const requestBodyCounter = document.getElementById('requestBodyCounter');
const rememberMeCheckbox = document.getElementById('rememberMe');

// State variables
let currentPage = 1;
let currentPublicPage = 1;
let searchQuery = '';

// Show/hide sections based on user role and page
async function showSectionsBasedOnRole(user, page) {
  // Always show menu bar and public notices
  if (headerSection) headerSection.classList.add('hidden'); // Initially hide header
  if (publicNotices) publicNotices.classList.remove('hidden');
  
  // Hide role-specific sections first
  if (authSection) authSection.classList.add('hidden');
  if (adminBox) adminBox.classList.add('hidden');
  if (userRequestSection) userRequestSection.classList.add('hidden');
  
  if (!user) {
    // Not logged in - show only login section
    if (authSection) authSection.classList.remove('hidden');
    
    // Update greeting for guest
    if (document.getElementById('userGreeting')) {
      document.getElementById('userGreeting').textContent = 'Guest User';
    }
    return;
  }
  
  // Logged in - update greeting with display name
  if (document.getElementById('userGreeting')) {
    const displayName = user.displayName || user.username;
    document.getElementById('userGreeting').textContent = `Hello, ${displayName}${user.role === 'admin' ? ' (Admin)' : ''}`;
  }
  
  // Show role-specific sections based on current page
  if (page === 'notice.html') {
    if (user.role === 'admin') {
      // Only show admin board and admin box for admin users
      if (headerSection) headerSection.classList.remove('hidden');
      if (adminBox) adminBox.classList.remove('hidden');
      if (publicNotices) publicNotices.classList.add('hidden'); // Notice Hide hobe 4 admin
      await updateStats();
      await renderNotices();
    } else {
      // Regular user on admin page - show request section only (no admin board)
      if (userRequestSection) userRequestSection.classList.remove('hidden');
      await renderMyRequests();
    }
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async function() {
  // Check login status
  const user = checkLoginStatus();
  
  // Get current page name
  const currentPageName = window.location.pathname.split('/').pop() || 'others.html';
  
  // Show appropriate sections
  await showSectionsBasedOnRole(user, currentPageName);
  
  // Load public notices for all pages
  await showPublicNotices();
  
  // Character counters for admin form
  if (document.getElementById('noticeTitle')) {
    document.getElementById('noticeTitle').addEventListener('input', function() {
      if (titleCounter) {
        titleCounter.textContent = `${this.value.length}/100 characters`;
      }
    });
  }
  
  if (document.getElementById('noticeBody')) {
    document.getElementById('noticeBody').addEventListener('input', function() {
      if (bodyCounter) {
        bodyCounter.textContent = `${this.value.length}/500 characters`;
      }
    });
  }
  
  // Character counters for user request form
  if (document.getElementById('requestTitle')) {
    document.getElementById('requestTitle').addEventListener('input', function() {
      if (requestTitleCounter) {
        requestTitleCounter.textContent = `${this.value.length}/100 characters`;
      }
    });
  }
  
  if (document.getElementById('requestBody')) {
    document.getElementById('requestBody').addEventListener('input', function() {
      if (requestBodyCounter) {
        requestBodyCounter.textContent = `${this.value.length}/500 characters`;
      }
    });
  }
  
  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', async function() {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      this.classList.add('active');
      document.getElementById(`${this.dataset.tab}-tab`).classList.add('active');
      
      if (this.dataset.tab === 'manage') {
        await renderNotices(currentPage, searchQuery);
      } else if (this.dataset.tab === 'requests') {
        await renderRequests();
      } else if (this.dataset.tab === 'users') {
        await renderUsers();
      }
    });
  });
  
  // Search functionality
  if (searchNotices) {
    searchNotices.addEventListener('input', function() {
      searchQuery = this.value;
      currentPage = 1;
      renderNotices(currentPage, searchQuery);
    });
  }
});

// AUTHENTICATION WITH REMEMBER ME
if (authForm) {
  authForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('authUser').value.trim();
    const password = document.getElementById('authPass').value;
    const rememberMe = rememberMeCheckbox ? rememberMeCheckbox.checked : false;
    
    if (!username || !password) {
      showAlert('Username and password are required.', 'error');
      return;
    }
    
    const users = await loadUsers();
    const foundUser = users.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      setCurrentUser(foundUser);
      
      // Save to remember me if checked
      if (rememberMe) {
        setRememberMe(foundUser);
      }
      
      // Get current page and show appropriate sections
      const currentPageName = window.location.pathname.split('/').pop() || 'others.html';
      await showSectionsBasedOnRole(foundUser, currentPageName);
      
      showAlert('Login successful!', 'success');
    } else {
      showAlert('Username or password does not match. Please try signing up.', 'error');
    }
  });
}

if (signupBtn) {
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
    saveUsers(users);
    alert('Account created successfully. Please login now.');
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', function() {
    clearCurrentUser();
    // Show auth section after logout
    const currentPageName = window.location.pathname.split('/').pop() || 'others.html';
    showSectionsBasedOnRole(null, currentPageName);
    showAlert('Logout successful!', 'success');
  });
}

// NOTICE_MANAGEMENT_4_ADMIN
if (document.getElementById('noticeForm')) {
  document.getElementById('noticeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    saveNotice();
  });
}

if (document.getElementById('clearNotice')) {
  document.getElementById('clearNotice').addEventListener('click', function() {
    document.getElementById('noticeForm').reset();
    document.getElementById('noticeId').value = '';
    if (titleCounter) titleCounter.textContent = '0/100 characters';
    if (bodyCounter) bodyCounter.textContent = '0/500 characters';
  });
}

// NOTICE_REQUEST_4_USERS
if (document.getElementById('noticeRequestForm')) {
  document.getElementById('noticeRequestForm').addEventListener('submit', function(e) {
    e.preventDefault();
    submitRequest();
  });
}

if (document.getElementById('clearRequest')) {
  document.getElementById('clearRequest').addEventListener('click', function() {
    document.getElementById('noticeRequestForm').reset();
    if (requestTitleCounter) requestTitleCounter.textContent = '0/100 characters';
    if (requestBodyCounter) requestBodyCounter.textContent = '0/500 characters';
  });
}

// FIREBASE NOTICE MANAGEMENT
async function saveNotice() {
  const id = document.getElementById('noticeId').value;
  const title = document.getElementById('noticeTitle').value.trim();
  const body = document.getElementById('noticeBody').value.trim();
  const pinned = document.getElementById('noticePinned').checked;
  const showOnHomepage = document.getElementById('showOnHomepage').checked;
  
  if (!title || !body) {
    showAlert('Title and message are required.', 'error', 'authAlert');
    return;
  }
  
  const user = getCurrentUser();
  if (!user) {
    showAlert('Login required.', 'error', 'authAlert');
    return;
  }

  const noticeData = {
    title,
    body,
    author: user.displayName || user.username,
    authorId: user.uid || user.id,
    pinned,
    showOnHomepage,
    published: true
  };

  try {
    let result;
    
    if (id) {
      // Editing existing notice - Firebase
      result = await dbService.updateNotice(id, noticeData);
    } else {
      // Creating new notice - Firebase
      result = await dbService.createNotice(noticeData);
    }

    if (result.success) {
      document.getElementById('noticeForm').reset();
      document.getElementById('noticeId').value = '';
      if (titleCounter) titleCounter.textContent = '0/100 characters';
      if (bodyCounter) bodyCounter.textContent = '0/500 characters';
      
      showAlert('Notice published successfully!', 'success', 'authAlert');
      
      await renderNotices(currentPage, searchQuery);
      await showPublicNotices();
      await updateStats();
    } else {
      showAlert('Error: ' + result.error, 'error', 'authAlert');
    }
  } catch (error) {
    showAlert('Error saving notice: ' + error.message, 'error', 'authAlert');
  }
}

async function submitRequest() {
  const title = document.getElementById('requestTitle').value.trim();
  const body = document.getElementById('requestBody').value.trim();
  
  if (!title || !body) {
    showAlert('Title and message are required.', 'error');
    return;
  }
  
  const user = getCurrentUser();
  if (!user) {
    showAlert('Login required.', 'error');
    return;
  }

  const requestData = {
    title,
    body,
    author: user.displayName || user.username,
    authorId: user.uid || user.id
  };

  try {
    const result = await dbService.createRequest(requestData);
    
    if (result.success) {
      document.getElementById('noticeRequestForm').reset();
      if (requestTitleCounter) requestTitleCounter.textContent = '0/100 characters';
      if (requestBodyCounter) requestBodyCounter.textContent = '0/500 characters';
      
      showAlert('Notice request submitted successfully!', 'success');
      await renderMyRequests();
      await updateStats();
    } else {
      showAlert('Error: ' + result.error, 'error');
    }
  } catch (error) {
    showAlert('Error submitting request: ' + error.message, 'error');
  }
}

async function editNotice(id) {
  const notices = await loadNotices();
  const notice = notices.find(n => n.id === id);
  
  if (notice) {
    document.getElementById('noticeId').value = notice.id;
    document.getElementById('noticeTitle').value = notice.title;
    document.getElementById('noticeBody').value = notice.body;
    document.getElementById('noticePinned').checked = notice.pinned;
    document.getElementById('showOnHomepage').checked = notice.showOnHomepage;
    
    if (titleCounter) titleCounter.textContent = `${notice.title.length}/100 characters`;
    if (bodyCounter) bodyCounter.textContent = `${notice.body.length}/500 characters`;
    
    // Switch to create tab
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    document.querySelector('.tab[data-tab="create"]').classList.add('active');
    document.getElementById('create-tab').classList.add('active');
  }
}

async function deleteNotice(id) {
  if (confirm('Are you sure you want to delete this notice?')) {
    try {
      const result = await dbService.deleteNotice(id);
      
      if (result.success) {
        await renderNotices(currentPage, searchQuery);
        await showPublicNotices();
        await updateStats();
        showAlert('Notice deleted successfully.', 'success', 'authAlert');
      } else {
        showAlert('Error: ' + result.error, 'error', 'authAlert');
      }
    } catch (error) {
      // Fallback to localStorage
      const notices = await loadNotices();
      const updatedNotices = notices.filter(n => n.id !== id);
      await saveNotices(updatedNotices);
      
      await renderNotices(currentPage, searchQuery);
      await showPublicNotices();
      await updateStats();
      showAlert('Notice deleted successfully.', 'success', 'authAlert');
    }
  }
}

async function togglePublishStatus(id) {
  const notices = await loadNotices();
  const notice = notices.find(n => n.id === id);
  
  if (notice) {
    const updatedNotice = {
      ...notice,
      published: !notice.published,
      updatedAt: Date.now()
    };
    
    try {
      const result = await dbService.updateNotice(id, updatedNotice);
      if (result.success) {
        await renderNotices(currentPage, searchQuery);
        await showPublicNotices();
        await updateStats();
      }
    } catch (error) {
      // Fallback to localStorage
      const updatedNotices = notices.map(n => 
        n.id === id ? updatedNotice : n
      );
      await saveNotices(updatedNotices);
      await renderNotices(currentPage, searchQuery);
      await showPublicNotices();
      await updateStats();
    }
  }
}

async function togglePinStatus(id) {
  const notices = await loadNotices();
  const notice = notices.find(n => n.id === id);
  
  if (notice) {
    const updatedNotice = {
      ...notice,
      pinned: !notice.pinned,
      updatedAt: Date.now()
    };
    
    try {
      const result = await dbService.updateNotice(id, updatedNotice);
      if (result.success) {
        await renderNotices(currentPage, searchQuery);
        await showPublicNotices();
        await updateStats();
      }
    } catch (error) {
      // Fallback to localStorage
      const updatedNotices = notices.map(n => 
        n.id === id ? updatedNotice : n
      );
      await saveNotices(updatedNotices);
      await renderNotices(currentPage, searchQuery);
      await showPublicNotices();
      await updateStats();
    }
  }
}

async function approveRequest(requestId) {
  const requests = await loadRequests();
  const request = requests.find(r => r.id === requestId);
  
  if (request) {
    // Add to notices
    const noticeData = {
      title: request.title,
      body: request.body,
      author: request.author,
      authorId: request.authorId,
      published: true,
      pinned: false,
      showOnHomepage: true
    };

    try {
      // Create notice in Firebase
      const noticeResult = await dbService.createNotice(noticeData);
      
      if (noticeResult.success) {
        // Update request status in Firebase
        await dbService.updateRequestStatus(requestId, 'approved');
        
        await renderRequests();
        await renderMyRequests();
        await updateStats();
        showAlert('Notice request approved successfully!', 'success', 'authAlert');
      }
    } catch (error) {
      showAlert('Error approving request: ' + error.message, 'error', 'authAlert');
    }
  }
}

async function rejectRequest(requestId) {
  if (confirm('Are you sure you want to reject this request?')) {
    try {
      await dbService.updateRequestStatus(requestId, 'rejected');
      
      await renderRequests();
      await renderMyRequests();
      await updateStats();
      showAlert('Notice request rejected successfully!', 'success', 'authAlert');
    } catch (error) {
      showAlert('Error rejecting request: ' + error.message, 'error', 'authAlert');
    }
  }
}

// Rendering functions
async function renderNotices(page = 1, query = '') {
  if (!noticesList) return;
  
  let notices = await loadNotices();
  
  // Filter by search query
  if (query) {
    const lowercaseQuery = query.toLowerCase();
    notices = notices.filter(n => 
      n.title.toLowerCase().includes(lowercaseQuery) || 
      n.body.toLowerCase().includes(lowercaseQuery)
    );
  }
  
  // Sort by pinned first, then by creation date (newest first)
  notices.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.createdAt - a.createdAt;
  });
  
  const totalPages = Math.ceil(notices.length / NOTICES_PER_PAGE);
  const startIndex = (page - 1) * NOTICES_PER_PAGE;
  const paginatedNotices = notices.slice(startIndex, startIndex + NOTICES_PER_PAGE);
  
  noticesList.innerHTML = '';
  
  if (paginatedNotices.length === 0) {
    noticesList.innerHTML = '<div class="alert alert-info">No notices found.</div>';
    if (document.getElementById('pagination')) {
      document.getElementById('pagination').innerHTML = '';
    }
    return;
  }
  
  paginatedNotices.forEach(notice => {
    const div = document.createElement('div');
    div.className = `notice ${notice.pinned ? 'pinned' : ''}`;
    
    let statusBadge = '';
    if (!notice.published) {
      statusBadge = '<span class="status-badge status-draft">Draft</span>';
    }
    
    div.innerHTML = `
      <h3>${notice.title} ${statusBadge}</h3>
      <div class="notice-meta">
        ${formatDate(notice.createdAt)} | ${notice.author} 
        ${notice.updatedAt !== notice.createdAt ? `| Edited: ${formatDate(notice.updatedAt)}` : ''}
      </div>
      <p>${notice.body}</p>
      <div class="notice-actions">
        <button class="btn-small" onclick="editNotice('${notice.id}')">Edit</button>
        <button class="btn-small ${notice.published ? 'btn-warning' : 'btn-success'}" 
                onclick="togglePublishStatus('${notice.id}')">
          ${notice.published ? 'Unpublish' : 'Publish'}
        </button>
        <button class="btn-small ${notice.pinned ? 'btn-soft' : 'btn-warning'}" 
                onclick="togglePinStatus('${notice.id}')">
          ${notice.pinned ? 'Unpin' : 'Pin'}
        </button>
        <button class="btn-small btn-danger" onclick="deleteNotice('${notice.id}')">Delete</button>
      </div>
    `;
    
    noticesList.appendChild(div);
  });
  
  if (document.getElementById('pagination')) {
    renderPagination('pagination', page, totalPages, (newPage) => {
      currentPage = newPage;
      renderNotices(currentPage, searchQuery);
    });
  }
}

async function renderRequests() {
  if (!requestsList) return;
  
  const requests = await loadRequests();
  const pendingRequests = requests.filter(r => r.status === 'pending');
  
  requestsList.innerHTML = '';
  
  if (pendingRequests.length === 0) {
    requestsList.innerHTML = '<div class="alert alert-info">No pending requests.</div>';
    return;
  }
  
  pendingRequests.forEach(request => {
    const div = document.createElement('div');
    div.className = 'notice request';
    
    div.innerHTML = `
      <h3>${request.title} <span class="status-badge status-pending">Pending</span></h3>
      <div class="notice-meta">
        ${formatDate(request.createdAt)} | ${request.author}
      </div>
      <p>${request.body}</p>
      <div class="notice-actions">
        <button class="btn-small btn-success" onclick="approveRequest('${request.id}')">Approve</button>
        <button class="btn-small btn-danger" onclick="rejectRequest('${request.id}')">Reject</button>
      </div>
    `;
    
    requestsList.appendChild(div);
  });
}

async function renderMyRequests() {
  if (!myRequestsList) return;
  
  const user = getCurrentUser();
  if (!user) return;
  
  const requests = await loadRequests();
  const userRequests = requests.filter(r => r.author === user.username);
  
  myRequestsList.innerHTML = '';
  
  if (userRequests.length === 0) {
    myRequestsList.innerHTML = '<div class="alert alert-info">You have no requests.</div>';
    return;
  }
  
  userRequests.forEach(request => {
    const div = document.createElement('div');
    div.className = 'notice request';
    
    let statusBadge = '';
    if (request.status === 'approved') {
      statusBadge = '<span class="status-badge status-published">Approved</span>';
    } else if (request.status === 'rejected') {
      statusBadge = '<span class="status-badge status-draft">Rejected</span>';
    } else {
      statusBadge = '<span class="status-badge status-pending">Pending</span>';
    }
    
    div.innerHTML = `
      <h3>${request.title} ${statusBadge}</h3>
      <div class="notice-meta">
        ${formatDate(request.createdAt)}
      </div>
      <p>${request.body}</p>
    `;
    
    myRequestsList.appendChild(div);
  });
}

async function showPublicNotices(page = 1) {
  if (!publicNoticesList) return;
  
  let notices = await loadNotices();
  const publishedNotices = notices.filter(n => n.published);
  
  // Sort by pinned first, then by creation date (newest first)
  publishedNotices.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.createdAt - a.createdAt;
  });
  
  const totalPages = Math.ceil(publishedNotices.length / NOTICES_PER_PAGE);
  const startIndex = (page - 1) * NOTICES_PER_PAGE;
  const paginatedNotices = publishedNotices.slice(startIndex, startIndex + NOTICES_PER_PAGE);
  
  publicNoticesList.innerHTML = '';
  
  if (paginatedNotices.length === 0) {
    publicNoticesList.innerHTML = '<div class="alert alert-info">No notices found.</div>';
    if (document.getElementById('publicPagination')) {
      document.getElementById('publicPagination').innerHTML = '';
    }
    return;
  }
  
  paginatedNotices.forEach(notice => {
    const div = document.createElement('div');
    div.className = `notice ${notice.pinned ? 'pinned' : ''}`;
    
    div.innerHTML = `
      <h3>${notice.title}</h3>
      <div class="notice-meta">
        ${formatDate(notice.createdAt)} | ${notice.author}
      </div>
      <p style="white-space: pre-line;">${notice.body}</p> 
    `;
    
    publicNoticesList.appendChild(div);
  });
  
  if (document.getElementById('publicPagination')) {
    renderPagination('publicPagination', page, totalPages, (newPage) => {
      currentPublicPage = newPage;
      showPublicNotices(currentPublicPage);
    });
  }
}

async function renderUsers() {
  if (!usersList) return;
  
  const users = await loadUsers();
  const currentUser = getCurrentUser();
  
  usersList.innerHTML = '';
  
  if (users.length === 0) {
    usersList.innerHTML = '<div class="alert alert-info">No users found.</div>';
    return;
  }
  
  users.forEach(user => {
    const div = document.createElement('div');
    div.className = 'user-info';
    
    div.innerHTML = `
      <div class="flex-between">
        <div>
          <strong>${user.username}</strong>
          <span class="status-badge ${user.role === 'admin' ? 'status-published' : 'status-draft'}">
            ${user.role === 'admin' ? 'Admin' : 'User'}
          </span>
        </div>
        <div>
          <small>Member since: ${formatDate(user.createdAt)}</small>
          ${currentUser && currentUser.role === 'admin' && user.id !== currentUser.id ? 
            `<button class="btn-small btn-danger" onclick="deleteUser(${user.id})">Delete</button>` : 
            ''}
        </div>
      </div>
    `;
    
    usersList.appendChild(div);
  });
}

function renderPagination(containerId, currentPage, totalPages, onPageChange) {
  const container = document.getElementById(containerId);
  
  if (container && totalPages > 1) {
    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 1) {
      paginationHTML += `<button class="page-btn" onclick="onPageChange(${currentPage - 1})">←</button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages || 
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        paginationHTML += `
          <button class="page-btn ${i === currentPage ? 'active' : ''}" 
                  onclick="onPageChange(${i})">${i}</button>
        `;
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        paginationHTML += `<span class="page-btn">...</span>`;
      }
    }
    
    // Next button
    if (currentPage < totalPages) {
      paginationHTML += `<button class="page-btn" onclick="onPageChange(${currentPage + 1})">→</button>`;
    }
    
    container.innerHTML = paginationHTML;
  } else if (container) {
    container.innerHTML = '';
  }
}

async function deleteUser(userId) {
  if (confirm('Are you sure you want to delete this user?')) {
    const users = await loadUsers();
    const updatedUsers = users.filter(u => u.id !== userId);
    await saveUsers(updatedUsers);
    await renderUsers();
    showAlert('User deleted successfully.', 'success', 'authAlert');
  }
}

async function updateStats() {
  const notices = await loadNotices();
  const requests = await loadRequests();
  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  
  if (document.getElementById('totalNotices')) {
    document.getElementById('totalNotices').textContent = notices.length;
  }
  if (document.getElementById('publishedNotices')) {
    document.getElementById('publishedNotices').textContent = 
      notices.filter(n => n.published).length;
  }
  if (document.getElementById('pendingRequests')) {
    document.getElementById('pendingRequests').textContent = pendingRequests;
  }
  if (document.getElementById('pinnedNotices')) {
    document.getElementById('pinnedNotices').textContent = 
      notices.filter(n => n.pinned).length;
  }
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

// Real-time updates for Firebase
function enableRealTimeUpdates() {
  try {
    dbService.onNoticesChange((notices) => {
      renderNotices();
      showPublicNotices();
      updateStats();
    });
  } catch (error) {
    console.log('Real-time updates not available:', error);
  }
}

// Enable real-time updates when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  enableRealTimeUpdates();
});
