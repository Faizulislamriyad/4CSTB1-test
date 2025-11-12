const STORAGE_USERS = 'mini_users_box';
const STORAGE_NOTICES = 'mini_notices_box';
const STORAGE_REQUESTS = 'mini_requests_box';
const STORAGE_REMEMBER_ME = 'mini_remember_me';
const SESSION_USER = 'session_user_box';
const NOTICES_PER_PAGE = 5;

function saveUsers(users) {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}
function loadUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_USERS) || '[]');
}
function saveNotices(notices) {
  localStorage.setItem(STORAGE_NOTICES, JSON.stringify(notices));
}
function loadNotices() {
  return JSON.parse(localStorage.getItem(STORAGE_NOTICES) || '[]');
}
function saveRequests(requests) {
  localStorage.setItem(STORAGE_REQUESTS, JSON.stringify(requests));
}
function loadRequests() {
  return JSON.parse(localStorage.getItem(STORAGE_REQUESTS) || '[]');
}
function getCurrentUser() {
  // First check session storage
  const sessionUser = sessionStorage.getItem(SESSION_USER);
  if (sessionUser) {
    return JSON.parse(sessionUser);
  }
  
  // rebember me optn chek
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
(function() {
  const users = loadUsers();
  
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
  
  saveUsers(users);
  
  // No Default Note
  const notices = loadNotices();
  if (notices.length === 0) {
    // No sample notices will be added
    saveNotices([]);
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
function showSectionsBasedOnRole(user, page) {
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
  if (page === 'notice.html') { //______________________LINK_LOG_IN_PAGE_________________________
    if (user.role === 'admin') {
      // Only show admin board and admin box for admin users
      if (headerSection) headerSection.classList.remove('hidden');
      if (adminBox) adminBox.classList.remove('hidden');
      if (publicNotices) publicNotices.classList.add('hidden'); // Notice Hide hobe 4 adlog
      updateStats();
      renderNotices();
    } else {
      // Regular user on admin page - show request section only (no admin board)
      if (userRequestSection) userRequestSection.classList.remove('hidden');
      renderMyRequests();
    }
  }
}
// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  // Check login status
  const user = checkLoginStatus();
  
  // Get current page name
  const currentPageName = window.location.pathname.split('/').pop() || 'others.html';
  
  // Show appropriate sections
  showSectionsBasedOnRole(user, currentPageName);
  
  // Load public notices for all pages
  showPublicNotices();
  
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
    tab.addEventListener('click', function() {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      this.classList.add('active');
      document.getElementById(`${this.dataset.tab}-tab`).classList.add('active');
      
      if (this.dataset.tab === 'manage') {
        renderNotices(currentPage, searchQuery);
      } else if (this.dataset.tab === 'requests') {
        renderRequests();
      } else if (this.dataset.tab === 'users') {
        renderUsers();
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
  authForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('authUser').value.trim();
    const password = document.getElementById('authPass').value;
    const rememberMe = rememberMeCheckbox ? rememberMeCheckbox.checked : false;
    
    if (!username || !password) {
      showAlert('Username and password are required.', 'error');
      return;
    }
    
    const users = loadUsers();
    const foundUser = users.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      setCurrentUser(foundUser);
      
      // Save to remember me if checked
      if (rememberMe) {
        setRememberMe(foundUser);
      }
      
      // Get current page and show appropriate sections
      const currentPageName = window.location.pathname.split('/').pop() || 'others.html'; //____LOG_IN_PAGE___
      showSectionsBasedOnRole(foundUser, currentPageName);
      
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
      alert('This username is already taken.'); //____JODI_SM_USERN_ALREDY_EXSIST_KRE_____
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
    alert('Account created successfully. Please login now.'); //__AC_CREATN MSG___
  });
}
if (logoutBtn) {
  logoutBtn.addEventListener('click', function() {
    clearCurrentUser();
    // Show auth section after logout
    const currentPageName = window.location.pathname.split('/').pop() || 'others.html'; //____LOG_IN_PAGE_3RD_AT___
    showSectionsBasedOnRole(null, currentPageName);
    showAlert('Logout successful!', 'success');
  });
}
// ___NOTICE_MANAGEMENT_4_ADMIN___
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
//____NOTICE_REQUEST_4_USERS____
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
//New Changes For 3rd File Copy.. ____MY_FILE____
function saveNotice() {
  const id = document.getElementById('noticeId').value;
  const title = document.getElementById('noticeTitle').value.trim();
  const body = document.getElementById('noticeBody').value.trim();
  const pinned = document.getElementById('noticePinned').checked;
  const showOnHomepage = document.getElementById('showOnHomepage').checked; // Home Page...
  
  if (!title || !body) {
    showAlert('Title and message are required.', 'error', 'authAlert');
    return;
  }
  const user = getCurrentUser();
  if (!user) {
    showAlert('Login required.', 'error', 'authAlert'); 
    return;
  }
  let notices = loadNotices();
  if (id) {
    // Editing existing notice
    notices = notices.map(n => 
      n.id == id ? {
        ...n,
        title,
        body,
        pinned,
        showOnHomepage, // Home Page..
        updatedAt: Date.now()
      } : n
    );
  } else {
    // ___4_NEW_NOTICE___
    notices.push({
      id: Date.now(),
      title,
      body,
      author: user.username,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      published: true,
      pinned,
      showOnHomepage: showOnHomepage // _____SW_HOME_PAGE_NOTICE____
    });
  }
  saveNotices(notices);
  document.getElementById('noticeForm').reset();
  document.getElementById('noticeId').value = '';
  if (titleCounter) titleCounter.textContent = '0/100 characters'; //__CUNT_NUM
  if (bodyCounter) bodyCounter.textContent = '0/500 characters'; //__CUNT_NUM
  
  showAlert('Notice published successfully!', 'success', 'authAlert');
  
  renderNotices(currentPage, searchQuery);
  showPublicNotices();
  updateStats();
}
function submitRequest() {
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
  
  let requests = loadRequests();
  
  requests.push({
    id: Date.now(),
    title,
    body,
    author: user.username,
    createdAt: Date.now(),
    status: 'pending'
  });
  
  saveRequests(requests);
  document.getElementById('noticeRequestForm').reset();
  if (requestTitleCounter) requestTitleCounter.textContent = '0/100 characters';
  if (requestBodyCounter) requestBodyCounter.textContent = '0/500 characters';
  
  showAlert('Notice request submitted successfully!', 'success');
  renderMyRequests();
  updateStats();
}
function editNotice(id) {
  const notice = loadNotices().find(n => n.id === id);
  if (notice) {
    document.getElementById('noticeId').value = notice.id;
    document.getElementById('noticeTitle').value = notice.title;
    document.getElementById('noticeBody').value = notice.body;
    document.getElementById('noticePinned').checked = notice.pinned;
    
    if (titleCounter) titleCounter.textContent = `${notice.title.length}/100 characters`;
    if (bodyCounter) bodyCounter.textContent = `${notice.body.length}/500 characters`;
    
    // Switch to create tab
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    document.querySelector('.tab[data-tab="create"]').classList.add('active');
    document.getElementById('create-tab').classList.add('active');
  }
}
function deleteNotice(id) {
  if (confirm('Are you sure you want to delete this notice?')) {
    const notices = loadNotices().filter(n => n.id !== id);
    saveNotices(notices);
    renderNotices(currentPage, searchQuery);
    showPublicNotices();
    updateStats();
    showAlert('Notice deleted successfully.', 'success', 'authAlert');
  }
}
function togglePublishStatus(id) {
  const notices = loadNotices();
  const updatedNotices = notices.map(n => 
    n.id === id ? { ...n, published: !n.published, updatedAt: Date.now() } : n
  );
  saveNotices(updatedNotices);
  renderNotices(currentPage, searchQuery);
  showPublicNotices();
  updateStats();
}
function togglePinStatus(id) {
  const notices = loadNotices();
  const updatedNotices = notices.map(n => 
    n.id === id ? { ...n, pinned: !n.pinned, updatedAt: Date.now() } : n
  );
  saveNotices(updatedNotices);
  renderNotices(currentPage, searchQuery);
  showPublicNotices();
  updateStats();
}
function approveRequest(requestId) {
  const requests = loadRequests();
  const request = requests.find(r => r.id === requestId);
  
  if (request) {
    // Add to notices
    const notices = loadNotices();
    notices.push({
      id: Date.now(),
      title: request.title,
      body: request.body,
      author: request.author,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      published: true,
      pinned: false
    });
    saveNotices(notices);
    
    // Update request status
    const updatedRequests = requests.map(r => 
      r.id === requestId ? { ...r, status: 'approved' } : r
    );
    saveRequests(updatedRequests);
    
    renderRequests();
    renderMyRequests();
    updateStats();
    showAlert('Notice request approved successfully!', 'success', 'authAlert');
  }
}
function rejectRequest(requestId) {
  if (confirm('Are you sure you want to reject this request?')) {
    const requests = loadRequests();
    const updatedRequests = requests.map(r => 
      r.id === requestId ? { ...r, status: 'rejected' } : r
    );
    saveRequests(updatedRequests);
    
    renderRequests();
    renderMyRequests();
    updateStats();
    showAlert('Notice request rejected successfully!', 'success', 'authAlert');
  }
}
// Rendering functions
function renderNotices(page = 1, query = '') {
  if (!noticesList) return;
  
  let notices = loadNotices();
  
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
        <button class="btn-small" onclick="editNotice(${notice.id})">Edit</button>
        <button class="btn-small ${notice.published ? 'btn-warning' : 'btn-success'}" 
                onclick="togglePublishStatus(${notice.id})">
          ${notice.published ? 'Unpublish' : 'Publish'}
        </button>
        <button class="btn-small ${notice.pinned ? 'btn-soft' : 'btn-warning'}" 
                onclick="togglePinStatus(${notice.id})">
          ${notice.pinned ? 'Unpin' : 'Pin'}
        </button>
        <button class="btn-small btn-danger" onclick="deleteNotice(${notice.id})">Delete</button>
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
function renderRequests() {
  if (!requestsList) return;
  
  const requests = loadRequests().filter(r => r.status === 'pending');
  
  requestsList.innerHTML = '';
  
  if (requests.length === 0) {
    requestsList.innerHTML = '<div class="alert alert-info">No pending requests.</div>';
    return;
  }
  
  requests.forEach(request => {
    const div = document.createElement('div');
    div.className = 'notice request';
    
    div.innerHTML = `
      <h3>${request.title} <span class="status-badge status-pending">Pending</span></h3>
      <div class="notice-meta">
        ${formatDate(request.createdAt)} | ${request.author}
      </div>
      <p>${request.body}</p>
      <div class="notice-actions">
        <button class="btn-small btn-success" onclick="approveRequest(${request.id})">Approve</button>
        <button class="btn-small btn-danger" onclick="rejectRequest(${request.id})">Reject</button>
      </div>
    `;
    
    requestsList.appendChild(div);
  });
}
function renderMyRequests() {
  if (!myRequestsList) return;
  
  const user = getCurrentUser();
  if (!user) return;
  
  const requests = loadRequests().filter(r => r.author === user.username);
  
  myRequestsList.innerHTML = '';
  
  if (requests.length === 0) {
    myRequestsList.innerHTML = '<div class="alert alert-info">You have no requests.</div>';
    return;
  }
  
  requests.forEach(request => {
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
function showPublicNotices(page = 1) {
  if (!publicNoticesList) return;
  
  let notices = loadNotices().filter(n => n.published);
  
  // Sort by pinned first, then by creation date (newest first)
  notices.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.createdAt - a.createdAt;
  });
  
  const totalPages = Math.ceil(notices.length / NOTICES_PER_PAGE);
  const startIndex = (page - 1) * NOTICES_PER_PAGE;
  const paginatedNotices = notices.slice(startIndex, startIndex + NOTICES_PER_PAGE);
  
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
    `; // space Catchable 
    
    publicNoticesList.appendChild(div);
  });
  if (document.getElementById('publicPagination')) {
    renderPagination('publicPagination', page, totalPages, (newPage) => {
      currentPublicPage = newPage;
      showPublicNotices(currentPublicPage);
    });
  }
}
function renderUsers() {
  if (!usersList) return;
  
  const users = loadUsers();
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
function deleteUser(userId) {
  if (confirm('Are you sure you want to delete this user?')) {
    const users = loadUsers().filter(u => u.id !== userId);
    saveUsers(users);
    renderUsers();
    showAlert('User deleted successfully.', 'success', 'authAlert');
  }
}
function updateStats() {
  const notices = loadNotices();
  const requests = loadRequests();
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