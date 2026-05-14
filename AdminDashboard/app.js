// ===== LEVIDEX Admin Dashboard - Firebase Connection & Logic =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc, query, orderBy, limit, setDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// Firebase Config (same as LEVIDEX app)
const firebaseConfig = {
    apiKey: "AIzaSyAdqSjaT9bqFfLTo5jEuA5ILVGAzJHFkZ8",
    authDomain: "levidex.firebaseapp.com",
    projectId: "levidex",
    storageBucket: "levidex.firebasestorage.app",
    messagingSenderId: "1030103160013",
    appId: "1:1030103160013:web:2641d5aa76234822d18584",
    measurementId: "G-MZCCQMQ3E5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ===== Auth State & RBAC Logic =====
const loginOverlay = document.getElementById('loginOverlay');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

let isInitialLoad = true;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is logged into Firebase, now check if they are an ADMIN in Firestore
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().role === 'admin') {
                // Success! Let them in
                loginOverlay.classList.add('hidden');
                
                // Only Master Admin can see the Create Admin form
                if (user.email === 'admin@levidex.com') {
                    document.getElementById('createAdminCard').style.display = 'block';
                }

                if (isInitialLoad) {
                    loadAllData();
                    isInitialLoad = false;
                }
            } else {
                // Not an admin
                throw new Error("Access Denied. You do not have administrator privileges.");
            }
        } catch (error) {
            console.error("RBAC Check Failed:", error);
            showLoginError(error.message || "Failed to verify admin privileges.");
            signOut(auth); // Kick them out
        }
    } else {
        // User is logged out
        loginOverlay.classList.remove('hidden');
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.classList.add('hidden');
    loginBtn.textContent = 'Verifying...';
    loginBtn.disabled = true;
    
    // Reset initial load state so the success meme triggers every time they log in
    isInitialLoad = true;

    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    try {
        // Enforce session persistence so the user is logged out when they close the browser tab
        await setPersistence(auth, browserSessionPersistence);
        await signInWithEmailAndPassword(auth, email, password);
        
        // Show success meme ONLY when they explicitly log in
        const successMemeOverlay = document.getElementById('successMemeOverlay');
        successMemeOverlay.style.display = 'flex';
        
        // Wait 7 seconds while dashboard loads in the background
        await new Promise(resolve => setTimeout(resolve, 7000));
        
        successMemeOverlay.style.display = 'none';
    } catch (error) {
        // Show meme overlay
        const memeOverlay = document.getElementById('memeOverlay');
        memeOverlay.style.display = 'flex';
        
        // Wait 9 seconds
        await new Promise(resolve => setTimeout(resolve, 9000));
        
        // Hide meme overlay
        memeOverlay.style.display = 'none';

        let msg = "Login failed: " + error.message;
        if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            msg = "Invalid admin email or password.";
        }
        showLoginError(msg);
    } finally {
        loginBtn.textContent = 'Secure Login';
        loginBtn.disabled = false;
    }
});

logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

function showLoginError(msg) {
    loginError.textContent = msg;
    loginError.classList.remove('hidden');
}

// ===== Secondary Auth for Creating Admins =====
import { createUserWithEmailAndPassword, getAuth as getSecondaryAuth } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
// duplicate setDoc import removed

const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
const secondaryAuth = getSecondaryAuth(secondaryApp);

const createAdminForm = document.getElementById('createAdminForm');
const createAdminBtn = document.getElementById('createAdminBtn');
const createAdminMsg = document.getElementById('createAdminMsg');

createAdminForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    createAdminBtn.disabled = true;
    createAdminBtn.textContent = 'Creating...';
    createAdminMsg.style.display = 'block';
    createAdminMsg.style.color = 'var(--text-secondary)';
    createAdminMsg.textContent = 'Registering new admin...';

    const name = document.getElementById('newAdminName').value;
    const email = document.getElementById('newAdminEmail').value;
    const password = document.getElementById('newAdminPassword').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        
        // Inject admin role into Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
            email: email,
            role: 'admin',
            createdAt: new Date(),
            name: name
        }, { merge: true });

        // Sign out secondary auth to keep it clean
        await signOut(secondaryAuth);

        createAdminMsg.style.color = 'var(--accent-green)';
        createAdminMsg.textContent = `✅ Success! ${email} is now an Admin.`;
        createAdminForm.reset();
        
        // Reload users table to show new admin
        loadUsers().then(() => renderUsersTable());
    } catch (error) {
        createAdminMsg.style.color = '#ff3b30';
        createAdminMsg.textContent = `❌ Error: ${error.message}`;
    } finally {
        createAdminBtn.disabled = false;
        createAdminBtn.textContent = 'Create Admin';
    }
});

// ===== State =====
let allUsers = [];
let allComponents = [];
let allSessions = [];
let categoryChartInstance = null;
let professionChartInstance = null;
let sessionsChartInstance = null;

// ===== Navigation =====
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');
const pageTitle = document.getElementById('pageTitle');
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPage = item.dataset.page;
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        pages.forEach(p => p.classList.remove('active'));
        document.getElementById(`page-${targetPage}`).classList.add('active');
        pageTitle.textContent = item.querySelector('span:last-child').textContent;
        sidebar.classList.remove('open');
    });
});

menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
document.getElementById('refreshBtn').addEventListener('click', () => loadAllData());

// ===== Data Loading =====
async function loadAllData() {
    const loader = document.getElementById('loadingOverlay');
    loader.classList.remove('hidden');

    try {
        await Promise.all([loadUsers(), loadComponents(), loadSessions()]);
        updateDashboard();
        renderUsersTable();
        renderComponentsTable();
        renderUsageTable();
    } catch (err) {
        console.error("Error loading data:", err);
    } finally {
        loader.classList.add('hidden');
    }
}

async function loadUsers() {
    const snapshot = await getDocs(collection(db, "users"));
    allUsers = [];
    snapshot.forEach(doc => {
        allUsers.push({ id: doc.id, ...doc.data() });
    });
}

async function loadComponents() {
    const snapshot = await getDocs(collection(db, "components"));
    allComponents = [];
    snapshot.forEach(doc => {
        allComponents.push({ id: doc.id, ...doc.data() });
    });
}

async function loadSessions() {
    try {
        const q = query(collection(db, "app_sessions"), orderBy("timestamp", "desc"), limit(500));
        const snapshot = await getDocs(q);
        allSessions = [];
        snapshot.forEach(doc => {
            allSessions.push({ id: doc.id, ...doc.data() });
        });
    } catch (e) {
        // Collection might not exist yet
        allSessions = [];
    }
}

// ===== Dashboard Stats =====
function updateDashboard() {
    document.getElementById('totalUsers').textContent = allUsers.length;
    document.getElementById('totalComponents').textContent = allComponents.length;
    document.getElementById('totalSessions').textContent = allSessions.length;

    // Count unique categories
    const categories = new Set(allComponents.map(c => c.categoryId));
    document.getElementById('totalCategories').textContent = categories.size;

    renderCategoryChart();
    renderProfessionChart();
    renderSessionsChart();
}

// ===== Charts =====
const CHART_COLORS = ['#4f7cff', '#7c5cfc', '#34d399', '#fb923c', '#f472b6', '#22d3ee', '#facc15'];

function renderCategoryChart() {
    const counts = {};
    allComponents.forEach(c => {
        const cat = c.categoryId || 'unknown';
        counts[cat] = (counts[cat] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const data = Object.values(counts);

    if (categoryChartInstance) categoryChartInstance.destroy();

    categoryChartInstance = new Chart(document.getElementById('categoryChart'), {
        type: 'doughnut',
        data: {
            labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
            datasets: [{
                data,
                backgroundColor: CHART_COLORS.slice(0, labels.length),
                borderWidth: 0,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#8b8ba3', font: { size: 12, family: 'Inter' }, padding: 12 }
                }
            }
        }
    });
}

function renderProfessionChart() {
    const counts = {};
    allUsers.forEach(u => {
        const prof = u.profession || 'Unknown';
        counts[prof] = (counts[prof] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const data = Object.values(counts);

    if (professionChartInstance) professionChartInstance.destroy();

    professionChartInstance = new Chart(document.getElementById('professionChart'), {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: CHART_COLORS.slice(0, labels.length).reverse(),
                borderWidth: 0,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#8b8ba3', font: { size: 12, family: 'Inter' }, padding: 12 }
                }
            }
        }
    });
}

function renderSessionsChart() {
    // Group sessions by day (last 7 days)
    const days = [];
    const counts = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        days.push(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));

        const dayCount = allSessions.filter(s => {
            if (!s.timestamp) return false;
            const ts = s.timestamp.toDate ? s.timestamp.toDate() : new Date(s.timestamp);
            return ts.toISOString().split('T')[0] === key;
        }).length;
        counts.push(dayCount);
    }

    if (sessionsChartInstance) sessionsChartInstance.destroy();

    sessionsChartInstance = new Chart(document.getElementById('sessionsChart'), {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'App Opens',
                data: counts,
                backgroundColor: 'rgba(79, 124, 255, 0.5)',
                borderColor: '#4f7cff',
                borderWidth: 2,
                borderRadius: 6,
                hoverBackgroundColor: 'rgba(79, 124, 255, 0.7)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#5a5a7a', font: { family: 'Inter' }, stepSize: 1 },
                    grid: { color: 'rgba(42,42,69,0.4)' }
                },
                x: {
                    ticks: { color: '#5a5a7a', font: { family: 'Inter', size: 11 } },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// ===== Users Table =====
function renderUsersTable(filter = '') {
    const body = document.getElementById('usersBody');
    const isMaster = auth.currentUser && auth.currentUser.email === 'admin@levidex.com';
    
    if (isMaster) {
        document.getElementById('userActionHeader').style.display = 'table-cell';
    } else {
        document.getElementById('userActionHeader').style.display = 'none';
    }

    const filtered = allUsers.filter(u =>
        (u.name || '').toLowerCase().includes(filter) ||
        (u.email || '').toLowerCase().includes(filter) ||
        (u.profession || '').toLowerCase().includes(filter)
    );

    body.innerHTML = filtered.map((u, i) => `
        <tr>
            <td>${i + 1}</td>
            <td><strong>${u.name || '—'}</strong></td>
            <td>${u.email || '—'}</td>
            <td>${u.phone || '—'}</td>
            <td>${u.profession || '—'}</td>
            <td><span class="role-badge ${u.role === 'admin' ? 'role-admin' : 'role-user'}">${u.role || 'user'}</span></td>
            ${isMaster ? `<td style="text-align:center;">
                ${u.role === 'admin' ? `<button onclick="editAdminName('${u.id}', '${(u.name || '').replace(/'/g, "\\'")}')" style="background:none; border:none; cursor:pointer; color:var(--accent-blue);" title="Edit Name"><span class="material-icons-round" style="font-size:18px;">edit</span></button>` : '<span style="color:#ccc;">—</span>'}
            </td>` : ''}
        </tr>
    `).join('');

    if (filtered.length === 0) {
        const colSpan = isMaster ? 7 : 6;
        body.innerHTML = `<tr><td colspan="${colSpan}" style="text-align:center;color:#5a5a7a;padding:40px;">No users found</td></tr>`;
    }
}

window.editAdminName = async (uid, oldName) => {
    const newName = prompt("Enter the new name for this Admin:", oldName);
    if (newName !== null && newName.trim() !== "" && newName !== oldName) {
        try {
            await setDoc(doc(db, "users", uid), { name: newName.trim() }, { merge: true });
            
            // Update local array for instant UI update
            const user = allUsers.find(u => u.id === uid);
            if (user) user.name = newName.trim();
            
            renderUsersTable(document.getElementById('userSearch').value.toLowerCase());
        } catch (e) {
            alert("Error updating name: " + e.message);
        }
    }
};

document.getElementById('userSearch').addEventListener('input', (e) => {
    renderUsersTable(e.target.value.toLowerCase());
});

// ===== Components Table =====
function renderComponentsTable(filter = '', catFilter = '') {
    const body = document.getElementById('componentsBody');
    let filtered = allComponents;

    if (catFilter) {
        filtered = filtered.filter(c => c.categoryId === catFilter);
    }
    if (filter) {
        filtered = filtered.filter(c =>
            (c.name || '').toLowerCase().includes(filter) ||
            (c.categoryId || '').toLowerCase().includes(filter)
        );
    }

    body.innerHTML = filtered.map((c, i) => `
        <tr>
            <td>${i + 1}</td>
            <td><img src="images/components/${c.imageKey || c.name.replace(/[^a-zA-Z0-9_]/g, '') + '.png'}" alt="${c.name}" style="width:40px;height:40px;border-radius:6px;object-fit:cover;background:#f2f2f7;"></td>
            <td><strong>${c.name || '—'}</strong></td>
            <td><span class="cat-badge">${c.categoryId || '—'}</span></td>
            <td>${c.symbol || '—'}</td>
            <td class="desc-cell">${(c.description || '—').substring(0, 80)}${(c.description || '').length > 80 ? '...' : ''}</td>
        </tr>
    `).join('');

    if (filtered.length === 0) {
        body.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#5a5a7a;padding:40px;">No components found</td></tr>';
    }

    // Render category filter buttons
    const cats = [...new Set(allComponents.map(c => c.categoryId))].filter(Boolean).sort();
    const filtersDiv = document.getElementById('categoryFilters');
    filtersDiv.innerHTML = `<button class="cat-filter-btn ${!catFilter ? 'active' : ''}" data-cat="">All</button>` +
        cats.map(c => `<button class="cat-filter-btn ${catFilter === c ? 'active' : ''}" data-cat="${c}">${c}</button>`).join('');

    filtersDiv.querySelectorAll('.cat-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            renderComponentsTable(document.getElementById('componentSearch').value.toLowerCase(), btn.dataset.cat);
        });
    });
}

document.getElementById('componentSearch').addEventListener('input', (e) => {
    const activeCat = document.querySelector('.cat-filter-btn.active');
    renderComponentsTable(e.target.value.toLowerCase(), activeCat ? activeCat.dataset.cat : '');
});

// ===== Usage Table =====
function renderUsageTable() {
    const body = document.getElementById('usageBody');

    if (allSessions.length === 0) {
        body.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#5a5a7a;padding:40px;">No usage data yet. Install the updated LEVIDEX app to start tracking.</td></tr>';
        return;
    }

    body.innerHTML = allSessions.slice(0, 100).map((s, i) => {
        let ts = '—';
        if (s.timestamp) {
            const date = s.timestamp.toDate ? s.timestamp.toDate() : new Date(s.timestamp);
            ts = date.toLocaleString();
        }
        return `
            <tr>
                <td>${i + 1}</td>
                <td>${s.userEmail || s.userId || '—'}</td>
                <td>${s.action || 'app_open'}</td>
                <td><span style="font-family: monospace; background: #E5E5EA; padding: 2px 6px; border-radius: 4px;">${s.ipAddress || '—'}</span></td>
                <td>${s.location || '—'}</td>
                <td>${ts}</td>
            </tr>
        `;
    }).join('');
}

// ===== Init =====
// Data loading is now triggered securely via onAuthStateChanged
