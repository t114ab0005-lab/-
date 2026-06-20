/**
 * UniTask - 大學生任務平台
 * Core Application Script
 */

const INITIAL_USER = {
  name: "未設定姓名",
  university: "未設定學校",
  major: "未設定科系",
  year: "大一",
  rating: 5.0,
  completedCount: 0,
  earnings: 0,
  skills: [],
  bio: "尚未填寫個人簡介，請點擊下方「編輯個人資料」進行設定。",
  avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=placeholder"
};

// 預填的 Demo 體驗帳號
const DEMO_USER = {
  ...INITIAL_USER
};

const AVATAR_OPTIONS = [
  "https://api.dicebear.com/7.x/adventurer/svg?seed=GuanYu",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Sophia",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Leo",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Mia",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Emma",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Ruby",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Ryan",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Bella"
];

// --- 資料版本控制 (當資料結構更新時，自動清除舊快取) ---
const DATA_VERSION = "1.3";

// --- 系統狀態管理 ---
let state = {
  tasks: [],
  user: {},
  activeTab: 'lobby',
  activeProfileTab: 'history',
  selectedTask: null,
  filters: {
    keyword: '',
    category: 'all',
    minReward: 0,
    school: 'all',
    sortBy: 'newest'
  },
  matchSelectedSlots: [],
  matchSelectedTags: [],
  matchMinReward: 0,
  isLoggedIn: false
};

// --- 初始化與 DOM 載入 ---
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  const currentVersion = localStorage.getItem('unitask_data_version');
  if (currentVersion !== DATA_VERSION) {
    localStorage.removeItem('unitask_tasks');
    localStorage.setItem('unitask_data_version', DATA_VERSION);
    console.log("資料版本已更新，舊快取已清除。");
  }

  let storedTasks = localStorage.getItem('unitask_tasks');
  const storedUser = localStorage.getItem('unitask_user');
  const loginFlag = localStorage.getItem('unitask_is_logged_in');

  if (storedTasks) {
    state.tasks = JSON.parse(storedTasks);
  } else {
    state.tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
  }
  
  if (loginFlag === 'true') {
    state.isLoggedIn = true;
    state.user = storedUser ? JSON.parse(storedUser) : JSON.parse(JSON.stringify(DEMO_USER));
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) {
      loginScreen.classList.add('hidden');
      loginScreen.classList.remove('flex');
    }
  } else {
    state.isLoggedIn = false;
    state.user = JSON.parse(JSON.stringify(INITIAL_USER));
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) {
      loginScreen.classList.add('hidden'); // 預設不再跳出登入畫面
      loginScreen.classList.remove('flex');
    }
  }

  // 確保有一筆使用者自己發布且處於「待審核」狀態的任務以利 Demo 測試
  const hasUserPosted = state.tasks.some(t => t.isUserPosted);
  if (!hasUserPosted) {
    state.tasks.unshift({
      id: 999,
      title: "【急】影印期末專題報告並送至工綜 302 教室",
      description: "明早 10 點前需要影印好的報告。影印店已付清，直接報名字林小宇拿取。請幫忙送至工綜 302 教室講桌上，感謝！",
      reward: 350,
      category: "delivery",
      categoryLabel: "校園跑腿",
      university: state.user.university === "未設定學校" ? "國立臺灣大學" : state.user.university,
      deadline: "2026-06-16",
      estTime: "1 小時",
      posterName: state.user.name === "未設定姓名" ? "體驗學生" : state.user.name,
      posterAvatar: state.user.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=placeholder",
      status: "submitted",
      matchTags: ["跑腿"],
      timeSlots: ["Tue-morning"],
      isUserPosted: true,
      mockSubmission: {
        studentName: "林育辰 (大二)",
        note: "學長好，我已經幫您領取報告並送達工綜館 302 教室囉！請核對確認！"
      }
    });
    saveStateToStorage();
  }

  // 確保有一些歷史已完成的任務用以繪製收益曲線與時長分析
  const completedCountForDemo = state.tasks.filter(t => t.status === 'completed' && !t.isUserPosted).length;
  if (completedCountForDemo === 0) {
    const pastTasks = [
      {
        id: 901,
        title: "代排隊購買限量校園紀念帽 T",
        description: "幫忙排隊購買合作社限量發售的校慶紀念款帽 T（灰色 L 號一件）。早上 8:30 需到合作社門口排隊，預計 9:00 開賣，預估排隊時間約 40 分鐘。商品費用會另外付現。",
        reward: 200,
        category: "delivery",
        categoryLabel: "校園跑腿",
        university: state.user.university === "未設定學校" ? "國立臺灣大學" : state.user.university,
        deadline: "2026-06-05",
        estTime: "1 小時",
        posterName: "黃同學",
        posterAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=huang",
        status: "completed",
        completionTime: "2026-06-05T09:45:00Z",
        actualDuration: 0.8,
        matchTags: ["跑腿", "體力活"],
        timeSlots: ["Mon-morning"]
      },
      {
        id: 902,
        title: "校園創客空間 - 3D 列印機操作與維護協助",
        description: "協助創客空間使用者操作 FDM 3D 列印機，並進行日常噴嘴清潔、調平與線材更換。需要對 3D 列印有基礎認識，懂 Cura 切片軟體。時段為週三下午 1:00-5:00。",
        reward: 800,
        category: "tech",
        categoryLabel: "技術開發",
        university: state.user.university === "未設定學校" ? "國立臺灣科技大學" : state.user.university,
        deadline: "2026-06-08",
        estTime: "4 小時",
        posterName: "創客空間管理員",
        posterAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=maker",
        status: "completed",
        completionTime: "2026-06-08T15:30:00Z",
        actualDuration: 3.5,
        matchTags: ["技術", "文書"],
        timeSlots: ["Wed-afternoon", "Fri-afternoon"]
      },
      {
        id: 903,
        title: "社團成果發表會 - 宣傳海報與折頁設計",
        description: "吉他社期末果發海報設計，風格希望是日系清新或復古風。需要交付 A2 海報電子檔 (AI/PSD) 以及三折頁的排版。會有 2 次線上校稿修改，請隨信附上作品集連結。",
        reward: 1500,
        category: "design",
        categoryLabel: "設計創意",
        university: "私立輔仁大學",
        deadline: "2026-06-12",
        estTime: "5 小時",
        posterName: "吉他社社長",
        posterAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=guitar",
        status: "completed",
        completionTime: "2026-06-12T18:15:00Z",
        actualDuration: 4.8,
        matchTags: ["設計", "文書"],
        timeSlots: ["Mon-afternoon", "Tue-afternoon", "Wed-afternoon", "Thu-afternoon", "Fri-afternoon"]
      }
    ];
    state.tasks.push(...pastTasks);
    
    // 初始化收益與完成數 (以符合歷史資料)
    if (loginFlag === 'true' && storedUser) {
      if (state.user.earnings < 2500) state.user.earnings = 2500;
      if (state.user.completedCount < 3) state.user.completedCount = 3;
    } else {
      state.user.earnings = 2500;
      state.user.completedCount = 3;
    }
    saveStateToStorage();
  }

  renderSidebarBrief();
  renderStats();
  switchTab('lobby');
  updateAuthUI();

  bindEvents();
  setupDemoPublishData();
  initMobileSidebar();
}

function updateAuthUI() {
  const authItem = document.getElementById('sidebar-logout-item');
  const profileAuthItem = document.getElementById('profile-logout-btn');
  
  if (state.isLoggedIn) {
    if (authItem) {
      authItem.innerHTML = `<i class="fa-solid fa-right-from-bracket w-6 text-center"></i><span>登出系統</span>`;
      authItem.classList.remove('text-cyan-400', 'hover:bg-cyan-500/10');
      authItem.classList.add('text-rose-400', 'hover:bg-rose-500/10');
      authItem.onclick = handleLogout;
    }
    if (profileAuthItem) {
      profileAuthItem.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> 登出帳戶`;
      profileAuthItem.classList.remove('text-cyan-400', 'border-cyan-500/30', 'hover:bg-cyan-500/10');
      profileAuthItem.classList.add('text-rose-400', 'border-rose-500/30', 'hover:bg-rose-500/10');
      profileAuthItem.onclick = handleLogout;
      profileAuthItem.style.display = 'flex';
    }
  } else {
    if (authItem) {
      authItem.innerHTML = `<i class="fa-solid fa-right-to-bracket w-6 text-center"></i><span>登入系統</span>`;
      authItem.classList.remove('text-rose-400', 'hover:bg-rose-500/10');
      authItem.classList.add('text-cyan-400', 'hover:bg-cyan-500/10');
      authItem.onclick = openLoginScreen;
    }
    if (profileAuthItem) {
      profileAuthItem.style.display = 'none'; // 未登入不在個人頁面顯示登出
    }
  }
}

function openLoginScreen() {
  const loginScreen = document.getElementById('login-screen');
  if (loginScreen) {
    loginScreen.classList.remove('hidden');
    loginScreen.classList.add('flex');
    loginScreen.style.opacity = '1';
  }
}

// --- 登入與登出處理邏輯 ---

function showRegisterForm() {
  document.getElementById('login-form-box').style.display = 'none';
  document.getElementById('register-form-box').style.display = 'block';
  document.getElementById('login-modal-title').innerText = '註冊學生帳號';
}

function showLoginForm() {
  document.getElementById('register-form-box').style.display = 'none';
  document.getElementById('login-form-box').style.display = 'block';
  document.getElementById('login-modal-title').innerText = '學生接案登入';
}

function checkStudentEmail(email) {
  return email.toLowerCase().endsWith('.edu.tw');
}

function performLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showToast("請填寫所有欄位！", "danger");
    return;
  }

  if (!checkStudentEmail(email)) {
    showToast("提示：建議使用學校信箱 (.edu.tw) 進行註冊，以享有完整大學生專屬權益！", "warning");
  }

  if (email === "student@ntu.edu.tw") {
    state.user = { 
      ...JSON.parse(JSON.stringify(INITIAL_USER)),
      name: "體驗學生",
      university: "國立臺灣大學"
    };
  } else {
    state.user = {
      ...JSON.parse(JSON.stringify(INITIAL_USER)),
      name: email.split('@')[0],
      university: "學生體驗學校"
    };
  }

  saveStateToStorage();
  localStorage.setItem('unitask_is_logged_in', 'true');
  state.isLoggedIn = true;

  const loginOverlay = document.getElementById('login-screen');
  if (loginOverlay) {
    loginOverlay.style.opacity = '0';
    setTimeout(() => {
      loginOverlay.classList.add('hidden');
      loginOverlay.classList.remove('flex');
      loginOverlay.style.opacity = '1';
    }, 300);
  }

  renderSidebarBrief();
  renderStats();
  updateAuthUI();
  switchTab('lobby');
  showToast(`歡迎回來！親愛的 ${state.user.name} 同學。`, "success");
}

function performRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const school = document.getElementById('reg-school').value.trim();
  const major = document.getElementById('reg-major').value.trim();
  const year = document.getElementById('reg-year').value;
  const password = document.getElementById('reg-password').value;

  if (!name || !email || !school || !major || !password) {
    showToast("請填寫所有必填欄位！", "danger");
    return;
  }

  if (!checkStudentEmail(email)) {
    showToast("提示：建議使用學校信箱 (.edu.tw) 進行註冊，以享有完整大學生專屬權益！", "warning");
  }

  const randomAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];

  const newUser = {
    name: name,
    university: school,
    major: major,
    year: year,
    rating: 5.0,
    completedCount: 0,
    earnings: 0,
    skills: [],
    bio: "尚未填寫個人簡介，請點擊下方「編輯個人資料」進行設定。",
    avatar: randomAvatar
  };

  state.user = newUser;
  saveStateToStorage();
  localStorage.setItem('unitask_is_logged_in', 'true');
  state.isLoggedIn = true;

  const loginOverlay = document.getElementById('login-screen');
  if (loginOverlay) {
    loginOverlay.style.opacity = '0';
    setTimeout(() => {
      loginOverlay.classList.add('hidden');
      loginOverlay.classList.remove('flex');
      loginOverlay.style.opacity = '1';
    }, 300);
  }

  renderSidebarBrief();
  renderStats();
  updateAuthUI();
  switchTab('lobby');
  showToast("註冊成功！歡迎加入 CampusShift (時間變現曆) 社群。", "success");
}

function quickGuestLogin() {
  localStorage.removeItem('unitask_user');
  
  state.user = JSON.parse(JSON.stringify(INITIAL_USER));
  
  saveStateToStorage();
  localStorage.setItem('unitask_is_logged_in', 'guest');
  state.isLoggedIn = false;

  const loginOverlay = document.getElementById('login-screen');
  if (loginOverlay) {
    loginOverlay.style.opacity = '0';
    setTimeout(() => {
      loginOverlay.classList.add('hidden');
      loginOverlay.classList.remove('flex');
      loginOverlay.style.opacity = '1';
    }, 300);
  }

  renderSidebarBrief();
  renderStats();
  updateAuthUI();
  switchTab('lobby');
  showToast("已使用學生訪客身份快速登入！", "success");
}

function handleLogout() {
  localStorage.setItem('unitask_is_logged_in', 'false');
  state.isLoggedIn = false;
  state.user = JSON.parse(JSON.stringify(INITIAL_USER));

  const loginOverlay = document.getElementById('login-screen');
  if (loginOverlay) {
    loginOverlay.classList.remove('hidden');
    loginOverlay.classList.add('flex');
  }
  
  localStorage.removeItem('unitask_user');

  renderSidebarBrief();
  renderStats();
  updateAuthUI();
  
  showToast("您已成功安全登出系統。", "info");
}

function renderSidebarBrief() {
  document.getElementById('sidebar-avatar').src = state.user.avatar;
  document.getElementById('sidebar-name').innerText = state.user.name;
  document.getElementById('sidebar-school').innerText = `${state.user.university} · ${state.user.major}`;
}

function renderStats() {
  const availableCount = state.tasks.filter(t => t.status === 'available').length;
  document.getElementById('stat-available').innerText = availableCount;

  const statActiveEl = document.getElementById('stat-active');
  const statCompletedEl = document.getElementById('stat-completed');
  const statEarningsEl = document.getElementById('stat-earnings');

  if (state.isLoggedIn) {
    const activeCount = state.tasks.filter(t => t.status === 'ongoing').length;
    const completedCount = state.user.completedCount || 0;
    const totalEarnings = state.user.earnings || 0;

    statActiveEl.innerHTML = activeCount;
    statActiveEl.className = "text-3xl font-black text-white leading-tight";
    
    statCompletedEl.innerHTML = completedCount;
    statCompletedEl.className = "text-3xl font-black text-white leading-tight";
    
    statEarningsEl.innerHTML = `$${totalEarnings.toLocaleString()}`;
    statEarningsEl.className = "text-3xl font-black text-white leading-tight";
  } else {
    const promptHtml = `<span class="text-sm text-purple-400 font-bold bg-purple-500/10 px-2 py-1 rounded border border-purple-500/30" onclick="openLoginScreen(); event.stopPropagation();">需登入查看</span>`;
    
    statActiveEl.innerHTML = promptHtml;
    statActiveEl.className = "mt-1 mb-2 inline-block";
    
    statCompletedEl.innerHTML = promptHtml;
    statCompletedEl.className = "mt-1 mb-2 inline-block";
    
    statEarningsEl.innerHTML = promptHtml;
    statEarningsEl.className = "mt-1 mb-2 inline-block";
  }
}

function renderTasksList() {
  const container = document.getElementById('tasks-container');
  container.innerHTML = '';

  let filtered = state.tasks.filter(task => {
    const matchKeyword = state.filters.keyword === '' || 
      task.title.toLowerCase().includes(state.filters.keyword.toLowerCase()) || 
      task.description.toLowerCase().includes(state.filters.keyword.toLowerCase());
    const matchCategory = state.filters.category === 'all' || task.category === state.filters.category;
    const matchReward = task.reward >= state.filters.minReward;
    const matchSchool = state.filters.school === 'all' || 
      (state.filters.school === 'my' && task.university === state.user.university) ||
      (state.filters.school === 'other' && task.university !== state.user.university);
    const matchStatus = task.status === 'available';

    return matchKeyword && matchCategory && matchReward && matchSchool && matchStatus;
  });

  if (state.filters.sortBy === 'newest') {
    filtered.sort((a, b) => b.id - a.id);
  } else if (state.filters.sortBy === 'reward-desc') {
    filtered.sort((a, b) => b.reward - a.reward);
  } else if (state.filters.sortBy === 'reward-asc') {
    filtered.sort((a, b) => a.reward - b.reward);
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; width: 100%;">
        <i class="fa-regular fa-folder-open"></i>
        <h3>找不到符合條件的任務</h3>
        <p>請嘗試清除篩選條件，或稍後再回來查看。</p>
      </div>
    `;
    return;
  }

  filtered.forEach(task => {
    container.appendChild(createTaskCard(task));
  });
}

function createTaskCard(task, showStatusBadge = false) {
  const card = document.createElement('div');
  
  card.className = `p-5 rounded-2xl bg-white/5 backdrop-blur-md shadow-xl border border-white/10 flex flex-col gap-3 cursor-pointer hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all`;
  card.setAttribute('data-id', task.id);

  let categoryIcon = 'fa-solid fa-circle-info';
  let categoryColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  if (task.category === 'academic') { categoryIcon = 'fa-solid fa-graduation-cap'; categoryColor = 'text-purple-400 bg-purple-500/10 border-purple-500/20'; }
  if (task.category === 'delivery') { categoryIcon = 'fa-solid fa-motorcycle'; categoryColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'; }
  if (task.category === 'event') { categoryIcon = 'fa-solid fa-calendar-day'; categoryColor = 'text-green-400 bg-green-500/10 border-green-500/20'; }
  if (task.category === 'tech') { categoryIcon = 'fa-solid fa-code'; categoryColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20'; }
  if (task.category === 'design') { categoryIcon = 'fa-solid fa-palette'; categoryColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20'; }
  if (task.category === 'survey') { categoryIcon = 'fa-solid fa-clipboard-question'; categoryColor = 'text-pink-400 bg-pink-500/10 border-pink-500/20'; }

  card.innerHTML = `
    <div class="flex justify-between items-start">
      <span class="${categoryColor} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border">
        <i class="${categoryIcon}"></i> ${task.categoryLabel}
      </span>
      <span class="text-xl font-black text-green-400"><i class="fa-solid fa-dollar-sign"></i>${task.reward}</span>
    </div>
    <h3 class="text-lg font-bold text-white leading-tight mt-1">${task.title}</h3>
    <p class="text-sm text-slate-400 line-clamp-2">${task.description}</p>
    <div class="flex flex-wrap gap-4 mt-auto pt-3 border-t border-white/10 text-xs text-slate-400">
      <div class="flex items-center gap-1">
        <i class="fa-regular fa-clock"></i>
        <span>預估：${task.estTime}</span>
      </div>
      <div class="flex items-center gap-1">
        <i class="fa-regular fa-calendar"></i>
        <span>截止：${task.deadline}</span>
      </div>
      ${task.isPhased ? `<div class="flex items-center gap-1 text-purple-400 font-bold"><i class="fa-solid fa-diagram-project"></i><span>階段性任務</span></div>` : ''}
    </div>
    <div class="flex justify-between items-center mt-3">
      <div class="flex items-center gap-1 text-xs text-slate-500">
        <i class="fa-solid fa-location-dot"></i>
        <span>${task.university}</span>
      </div>
      ${showStatusBadge ? renderStatusBadge(task.status) : `<span class="px-2 py-1 bg-white/5 text-slate-300 text-xs rounded-md border border-white/10">開放申請</span>`}
    </div>
  `;

  card.addEventListener('click', () => openDetailModal(task.id));
  return card;
}

function renderStatusBadge(status) {
  if (status === 'ongoing') return `<span class="px-2 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs rounded-md font-bold">執行中</span>`;
  if (status === 'submitted') return `<span class="px-2 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs rounded-md font-bold">審核中</span>`;
  if (status === 'completed') return `<span class="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 text-xs rounded-md font-bold">已完成</span>`;
  return `<span class="px-2 py-1 bg-white/5 text-slate-300 border border-white/10 text-xs rounded-md font-bold">開放申請</span>`;
}

function renderProfileSection() {
  document.getElementById('profile-avatar').src = state.user.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=placeholder';
  document.getElementById('profile-name').innerText = state.user.name || '未設定姓名';
  document.getElementById('profile-identity').innerText = `${state.user.university || '未設定學校'} · ${state.user.major || '未設定科系'} (${state.user.year || '大一'})`;
  document.getElementById('profile-rating').innerHTML = `<i class="fa-solid fa-star" style="color: #fbbf24; margin-right: 2px;"></i> ${state.user.rating || '5.0'}`;
  document.getElementById('profile-stat-completed').innerText = state.user.completedCount || 0;
  document.getElementById('profile-stat-earnings').innerText = `$${(state.user.earnings || 0).toLocaleString()}`;
  document.getElementById('profile-bio').innerText = state.user.bio || "此使用者尚未填寫簡介。";

  const skillsContainer = document.getElementById('profile-skills');
  skillsContainer.innerHTML = '';
  if (state.user.skills && state.user.skills.length > 0) {
    state.user.skills.forEach(skill => {
      const tag = document.createElement('span');
      tag.className = 'px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs border border-gray-200';
      tag.innerText = skill;
      skillsContainer.appendChild(tag);
    });
  } else {
    skillsContainer.innerHTML = `<span class="text-gray-400 text-xs">暫無技能標籤</span>`;
  }

  const earningsCard = document.getElementById('profile-earnings-card');
  const tabsCard = document.getElementById('profile-tabs-card');
  const loginPrompt = document.getElementById('profile-login-prompt');

  if (state.isLoggedIn) {
    if (earningsCard) earningsCard.style.display = 'flex';
    if (tabsCard) tabsCard.style.display = 'flex';
    if (loginPrompt) loginPrompt.style.display = 'none';
    renderProfileTabsList();
    setTimeout(renderEarningsChart, 50);
  } else {
    if (earningsCard) earningsCard.style.display = 'none';
    if (tabsCard) tabsCard.style.display = 'none';
    if (loginPrompt) loginPrompt.style.display = 'flex';
  }
}

function renderProfileTabsList() {
  const container = document.getElementById('profile-history-container');
  container.innerHTML = '';

  const activeTab = state.activeProfileTab;
  let filtered = [];
  if (activeTab === 'history') {
    // 排除使用者自己發布的任務 (只顯示接案完成)
    filtered = state.tasks.filter(t => t.status === 'completed' && !t.isUserPosted);
  } else if (activeTab === 'active') {
    // 排除使用者自己發布的任務 (只顯示接案執行中)
    filtered = state.tasks.filter(t => (t.status === 'ongoing' || t.status === 'submitted') && !t.isUserPosted);
  } else if (activeTab === 'posted') {
    // 顯示使用者自己發布的任務
    filtered = state.tasks.filter(t => t.isUserPosted === true);
  }

  if (filtered.length === 0) {
    let icon = 'fa-solid fa-clipboard-check';
    let title = '尚無歷史完成紀錄';
    let desc = '接案完成並經案主審核通過後，會顯示在此處。';
    
    if (activeTab === 'active') {
      icon = 'fa-solid fa-person-running';
      title = '目前沒有執行中的任務';
      desc = '快前往任務大廳接案吧！';
    } else if (activeTab === 'posted') {
      icon = 'fa-solid fa-circle-plus';
      title = '您尚未發布過任何任務';
      desc = '可以前往「發布任務」頁面模擬發布一個新任務喔！';
    }
    
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center p-10 text-gray-400">
        <i class="${icon} text-4xl mb-3"></i>
        <h3 class="text-lg font-bold text-gray-600">${title}</h3>
        <p class="text-sm">${desc}</p>
      </div>
    `;
    return;
  }

  if (activeTab === 'posted') {
    filtered.forEach(task => {
      const item = document.createElement('div');
      item.className = 'p-5 bg-white border border-gray-100 rounded-xl shadow-sm mb-4 flex flex-col gap-4 transition-all hover:shadow-md';
      item.setAttribute('data-id', task.id);

      let categoryIcon = 'fa-solid fa-tasks';
      let categoryColor = 'text-purple-600 bg-purple-50';
      if (task.category === 'academic') { categoryIcon = 'fa-solid fa-graduation-cap'; categoryColor = 'text-purple-600 bg-purple-50'; }
      if (task.category === 'delivery') { categoryIcon = 'fa-solid fa-motorcycle'; categoryColor = 'text-cyan-600 bg-cyan-50'; }
      if (task.category === 'event') { categoryIcon = 'fa-solid fa-calendar-day'; categoryColor = 'text-green-600 bg-green-50'; }
      if (task.category === 'tech') { categoryIcon = 'fa-solid fa-code'; categoryColor = 'text-rose-600 bg-rose-50'; }
      if (task.category === 'design') { categoryIcon = 'fa-solid fa-palette'; categoryColor = 'text-amber-600 bg-amber-50'; }
      if (task.category === 'survey') { categoryIcon = 'fa-solid fa-clipboard-question'; categoryColor = 'text-pink-600 bg-pink-50'; }

      // Status Badge
      let statusBadge = '';
      if (task.status === 'available') {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-600 border border-cyan-100">🟢 開放招募中</span>`;
      } else if (task.status === 'ongoing') {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-600 border border-purple-100">⚡ 學生執行中</span>`;
      } else if (task.status === 'submitted') {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100 animate-pulse">🟡 收到成果，待審核</span>`;
      } else if (task.status === 'completed') {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100">🏆 任務已完成</span>`;
      }

      // Actions section depending on status
      let actionHTML = '';
      if (task.status === 'available') {
        actionHTML = `
          <div class="mt-1 flex justify-end">
            <button onclick="simulateStudentSubmit(${task.id}); event.stopPropagation();" class="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-sm">
              <i class="fa-solid fa-robot"></i> 模擬學生接案並提交成果
            </button>
          </div>
        `;
      } else if (task.status === 'ongoing') {
        actionHTML = `
          <div class="mt-1 flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
            <span class="text-xs text-gray-500"><i class="fa-solid fa-circle-notch fa-spin text-purple-500"></i> 接案學生正在努力執行中...</span>
            <button onclick="simulateStudentSubmit(${task.id}); event.stopPropagation();" class="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1.5">
              <i class="fa-solid fa-forward"></i> 模擬學生提交成果
            </button>
          </div>
        `;
      } else if (task.status === 'submitted') {
        const submission = task.mockSubmission || { studentName: "林育辰 (大二)", note: "學長好，我已經幫您領取報告並送達工綜館 302 教室囉！請核對確認！" };
        actionHTML = `
          <div class="mt-1 flex flex-col gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200" onclick="event.stopPropagation();">
            <div class="flex justify-between items-center text-xs border-b border-gray-200 pb-2">
              <span class="text-gray-700 font-semibold flex items-center gap-1.5">
                <i class="fa-solid fa-user-graduate text-cyan-600"></i> 提交人：${submission.studentName}
              </span>
              <span class="text-gray-400">剛剛</span>
            </div>
            <p class="text-sm text-gray-600 leading-relaxed font-sans p-2.5 rounded bg-white border border-gray-100">${submission.note}</p>
            <div class="flex justify-end gap-2 mt-1">
              <button onclick="rejectPostedTask(${task.id}); event.stopPropagation();" class="px-3.5 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors font-bold rounded-lg text-xs flex items-center gap-1">
                <i class="fa-solid fa-arrow-rotate-left"></i> 退回修改
              </button>
              <button onclick="approvePostedTask(${task.id}); event.stopPropagation();" class="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-md">
                <i class="fa-solid fa-circle-check"></i> 核准撥款
              </button>
            </div>
          </div>
        `;
      } else if (task.status === 'completed') {
        actionHTML = `
          <div class="mt-1 text-xs text-green-700 bg-green-50 p-3 rounded-lg border border-green-100 flex items-center gap-1.5 font-medium">
            <i class="fa-solid fa-circle-info"></i> 已於 2026-06-15 撥款給接案學生，任務結案。
          </div>
        `;
      }

      item.innerHTML = `
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center ${categoryColor} text-sm">
              <i class="${categoryIcon}"></i>
            </div>
            <div class="flex flex-col">
              <span class="font-bold text-gray-800 text-base">${task.title}</span>
              <div class="flex items-center gap-3 text-xs text-gray-500 mt-1">
                <span>截止：${task.deadline}</span>
                <span>•</span>
                <span>預估：${task.estTime}</span>
              </div>
            </div>
          </div>
          <div class="flex flex-col items-end gap-2">
            <span class="font-black text-lg text-green-600">$${task.reward}</span>
            ${statusBadge}
          </div>
        </div>
        ${actionHTML}
      `;
      container.appendChild(item);
    });
  } else {
    filtered.forEach(task => {
      const item = document.createElement('div');
      item.className = 'flex justify-between items-center p-4 bg-white border border-gray-100 rounded-lg shadow-sm mb-3 cursor-pointer hover:shadow-md transition-shadow';
      item.setAttribute('data-id', task.id);

      let bgStyle = 'bg-purple-100 text-purple-500';
      if (task.category === 'delivery') bgStyle = 'bg-cyan-100 text-cyan-500';
      if (task.status === 'completed') bgStyle = 'bg-green-100 text-green-500';

      let icon = 'fa-solid fa-tasks';
      if (task.category === 'academic') icon = 'fa-solid fa-graduation-cap';
      if (task.category === 'delivery') icon = 'fa-solid fa-motorcycle';
      if (task.category === 'event') icon = 'fa-solid fa-calendar-day';
      if (task.category === 'tech') icon = 'fa-solid fa-code';
      if (task.category === 'design') icon = 'fa-solid fa-palette';
      if (task.category === 'survey') icon = 'fa-solid fa-clipboard-question';

      item.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full flex items-center justify-center ${bgStyle}">
            <i class="${icon}"></i>
          </div>
          <div class="flex flex-col">
            <span class="font-bold text-gray-800">${task.title}</span>
            <span class="text-xs text-gray-500">截止：${task.deadline}</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="font-black text-green-600">+$${task.reward}</span>
          ${renderStatusBadge(task.status)}
        </div>
      `;

      item.addEventListener('click', () => openDetailModal(task.id));
      container.appendChild(item);
    });
  }
}

function switchTab(tabId) {
  state.activeTab = tabId;
  
  renderStats();

  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  document.getElementById('lobby-view').style.display = 'none';
  document.getElementById('quick-match-view').style.display = 'none';
  document.getElementById('post-demo-view').style.display = 'none';
  document.getElementById('profile-view').style.display = 'none';

  const headerTitle = document.getElementById('header-main-title');
  const headerDesc = document.getElementById('header-main-desc');
  const searchWrapper = document.getElementById('search-wrapper-container');
  const filterPanel = document.getElementById('filter-panel-container');

  if (tabId === 'lobby') {
    document.getElementById('lobby-view').style.display = 'block';
    headerTitle.innerText = "任務大廳";
    headerDesc.innerText = "瀏覽最新的校園互助任務，接取合適的工作賺取報酬！";
    searchWrapper.style.display = 'block';
    filterPanel.style.display = 'block';
    renderTasksList();
  } else if (tabId === 'quick-match') {
    document.getElementById('quick-match-view').style.display = 'block';
    headerTitle.innerText = "一鍵空檔速配";
    headerDesc.innerText = "點選您的週間空閒時段與興趣類型，由系統即時配對校園任務！";
    searchWrapper.style.display = 'none';
    filterPanel.style.display = 'none';
    resetQuickMatchUI();
  } else if (tabId === 'post-demo') {
    document.getElementById('post-demo-view').style.display = 'block';
    headerTitle.innerText = "發布任務 (Demo)";
    headerDesc.innerText = "在此頁面模擬快速發佈一個新任務，完成後將自動跳轉至任務大廳。";
    searchWrapper.style.display = 'none';
    filterPanel.style.display = 'none';
    setupDemoPublishData();
  } else if (tabId === 'profile') {
    document.getElementById('profile-view').style.display = 'block';
    headerTitle.innerText = "個人檔案與履歷";
    headerDesc.innerText = "檢視並編輯你的個人學生認證履歷、信譽評價與接案明細。";
    searchWrapper.style.display = 'none';
    filterPanel.style.display = 'none';

    if (!state.preventProfileTabReset) {
      state.activeProfileTab = 'history';
      document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.getAttribute('data-subtab') === 'history') {
          btn.classList.remove('font-medium', 'text-slate-400', 'hover:text-slate-200');
          btn.classList.add('active', 'font-bold', 'text-purple-400', 'border-b-2', 'border-purple-500');
        } else {
          btn.classList.remove('active', 'font-bold', 'text-purple-400', 'border-b-2', 'border-purple-500');
          btn.classList.add('font-medium', 'text-slate-400', 'hover:text-slate-200');
        }
      });
    }
    state.preventProfileTabReset = false;
    renderProfileSection();
  }

  closeAllModals();
  closeMobileSidebar();
}

function initMobileSidebar() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('mobile-close-btn');
  const overlay = document.getElementById('sidebar-overlay');

  if(menuBtn) menuBtn.addEventListener('click', openMobileSidebar);
  if(closeBtn) closeBtn.addEventListener('click', closeMobileSidebar);
  if(overlay) overlay.addEventListener('click', closeMobileSidebar);
}

function openMobileSidebar() {
  const sidebar = document.getElementById('main-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if(sidebar && overlay) {
    sidebar.classList.remove('-translate-x-full');
    sidebar.classList.add('translate-x-0');
    overlay.classList.remove('hidden');
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('main-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if(sidebar && overlay) {
    sidebar.classList.add('-translate-x-full');
    sidebar.classList.remove('translate-x-0');
    overlay.classList.add('hidden');
  }
}

function navigateToProfileTab(subtabId) {
  state.preventProfileTabReset = true;
  switchTab('profile');
  
  state.activeProfileTab = subtabId;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.getAttribute('data-subtab') === subtabId) {
      btn.classList.remove('font-medium', 'text-slate-400', 'hover:text-slate-200');
      btn.classList.add('active', 'font-bold', 'text-purple-400', 'border-b-2', 'border-purple-500');
    } else {
      btn.classList.remove('active', 'font-bold', 'text-purple-400', 'border-b-2', 'border-purple-500');
      btn.classList.add('font-medium', 'text-slate-400', 'hover:text-slate-200');
    }
  });
  renderProfileTabsList();
}

function resetQuickMatchUI() {
  state.matchSelectedSlots = [];
  state.matchSelectedTags = [];
  state.matchMinReward = 0;

  document.querySelectorAll('.calendar-cell').forEach(cell => cell.classList.remove('selected', 'bg-purple-500'));
  document.querySelectorAll('.match-tag-btn').forEach(btn => {
    btn.classList.remove('active', 'bg-purple-500', 'text-white');
    btn.classList.add('bg-white/5', 'text-slate-300');
  });
  
  const nlpInput = document.getElementById('nlp-search-input');
  if (nlpInput) nlpInput.value = '';

  const matchRewardSlider = document.getElementById('match-reward-slider');
  const matchRewardValue = document.getElementById('match-reward-display');
  if (matchRewardSlider && matchRewardValue) {
    matchRewardSlider.value = 0;
    matchRewardValue.innerText = '$0+';
  }

  document.getElementById('quick-match-results').innerHTML = `
    <div class="flex flex-col items-center justify-center p-10 text-slate-500">
      <i class="fa-solid fa-calendar-days text-4xl mb-3"></i>
      <h3 class="text-lg font-bold text-slate-400">尚未開始速配</h3>
      <p class="text-sm">請在上方行事曆選取空檔時段，並點選至少一個興趣標籤，或直接輸入文字進行智能速配！</p>
    </div>
  `;
}

function handleTimeSlotClick(cell) {
  const slotId = cell.getAttribute('data-slot');
  if (!slotId) return;

  const index = state.matchSelectedSlots.indexOf(slotId);
  if (index > -1) {
    state.matchSelectedSlots.splice(index, 1);
    cell.classList.remove('selected', 'bg-purple-500');
  } else {
    state.matchSelectedSlots.push(slotId);
    cell.classList.add('selected', 'bg-purple-500');
  }
}



function handleMatchTagClick(btn) {
  const tag = btn.getAttribute('data-tag');
  if (!tag) return;

  const index = state.matchSelectedTags.indexOf(tag);
  if (index > -1) {
    state.matchSelectedTags.splice(index, 1);
    btn.classList.remove('active', 'bg-purple-500', 'text-white');
    btn.classList.add('bg-white/5', 'text-slate-300');
  } else {
    state.matchSelectedTags.push(tag);
    btn.classList.remove('bg-white/5', 'text-slate-300');
    btn.classList.add('active', 'bg-purple-500', 'text-white');
  }
}

// --- 資料結構：優先權佇列 (Priority Queue) ---
// 用於實作「一鍵空檔速配」時，根據任務的 CP 值 (報酬/工時) 進行最高 CP 值優先排序。
class PriorityQueue {
  constructor() {
    this.items = [];
  }

  // 時間複雜度：O(N) (陣列插入)
  enqueue(task, cpValue) {
    const qElement = { task, cpValue };
    let added = false;
    
    // 依 CP 值尋找插入點 (由小排到大，讓最大值保持在陣列尾端)
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].cpValue > qElement.cpValue) {
        this.items.splice(i, 0, qElement);
        added = true;
        break;
      }
    }
    
    if (!added) {
      this.items.push(qElement);
    }
  }

  // 取出最高 CP 值的任務
  // 時間複雜度：O(1) (從陣列尾端 pop 取出)
  dequeue() {
    if (this.isEmpty()) return null;
    return this.items.pop();
  }

  isEmpty() {
    return this.items.length === 0;
  }
}

function runQuickMatch() {
  const resultsContainer = document.getElementById('quick-match-results');
  resultsContainer.innerHTML = '';

  const slots = state.matchSelectedSlots;
  const tags = state.matchSelectedTags;
  const minReward = state.matchMinReward;

  if (slots.length === 0 && tags.length === 0 && minReward === 0) {
    showToast("請至少選取一個空檔時段、標籤按鈕，或輸入文字速配條件！", "warning");
    resultsContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center p-10 text-orange-400">
        <i class="fa-solid fa-circle-exclamation text-4xl mb-3"></i>
        <h3 class="text-lg font-bold">條件不足</h3>
        <p class="text-sm text-slate-400">無法進行速配，請提供更多條件。</p>
      </div>
    `;
    return;
  }

  const matched = state.tasks.filter(task => {
    if (task.status !== 'available') return false;

    let matchSlot = true;
    if (slots.length > 0) {
      matchSlot = task.timeSlots && task.timeSlots.some(s => slots.includes(s));
    }

    let matchTag = true;
    if (tags.length > 0) {
      matchTag = task.matchTags && task.matchTags.some(t => tags.includes(t));
    }
    
    let matchReward = true;
    if (minReward > 0) {
      matchReward = task.reward >= minReward;
    }

    return matchSlot && matchTag && matchReward;
  });

  if (matched.length === 0) {
    resultsContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center p-10 text-gray-400">
        <i class="fa-solid fa-heart-crack text-4xl mb-3"></i>
        <h3 class="text-lg font-bold text-gray-600">糟糕，目前沒有完全符合的速配任務</h3>
        <p class="text-sm">可以試著勾選更多時間空檔、選擇其他興趣標籤，或是稍後再試試看！</p>
      </div>
    `;
    return;
  }

  // 使用 Priority Queue 進行最高 CP 值排序
  const pq = new PriorityQueue();
  matched.forEach(task => {
    const timeMatch = task.estTime.match(/\d+(\.\d+)?/);
    const hours = timeMatch ? parseFloat(timeMatch[0]) : 1;
    const cpValue = task.reward / hours;
    
    pq.enqueue(task, cpValue);
  });

  const resultsGrid = document.createElement('div');
  resultsGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
  resultsGrid.style.width = '100%';

  const sortedTasks = [];
  while (!pq.isEmpty()) {
    const item = pq.dequeue();
    sortedTasks.push(item.task.title);
    resultsGrid.appendChild(createTaskCard(item.task));
  }

  console.log(`任務依 CP 值排序完成：${sortedTasks.join(' -> ')}`);

  resultsContainer.appendChild(resultsGrid);
  showToast(`成功配對出 ${matched.length} 筆最適合您的任務！`, "success");
}

function setupDemoPublishData() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatDigit = (d) => d < 10 ? '0' + d : d;
  const tomorrowStr = `${tomorrow.getFullYear()}-${formatDigit(tomorrow.getMonth() + 1)}-${formatDigit(tomorrow.getDate())}`;

  document.getElementById('demo-title').value = "代拿期末專題報告並列印 (微積分與物理組)";
  document.getElementById('demo-category').value = "delivery";
  document.getElementById('demo-reward').value = 350;
  document.getElementById('demo-est-time').value = "1 小時內";
  document.getElementById('demo-deadline').value = tomorrowStr;
  document.getElementById('demo-desc').value = "期末大魔王專題報告需要印出成實體紙本！請幫忙到椰林大道的影印店領取我的報告，並幫忙送到工綜大樓 302 教室。影印費用已付清，直接報名字「林小宇」拿取即可。椰林大道與工綜大樓大約步行 10 分鐘，希望能在明天下午兩點前送到。完成後請記得拍照回傳。";
  
  // Reset phases
  const isPhasedCheckbox = document.getElementById('demo-is-phased');
  if(isPhasedCheckbox) {
    isPhasedCheckbox.checked = false;
    togglePhasedTaskUI();
  }
}

function togglePhasedTaskUI() {
  const isPhased = document.getElementById('demo-is-phased').checked;
  const container = document.getElementById('demo-phases-container');
  const rewardInput = document.getElementById('demo-reward');
  if (isPhased) {
    container.classList.remove('hidden');
    rewardInput.disabled = true;
    rewardInput.placeholder = "由各階段加總";
    rewardInput.classList.add('opacity-50', 'cursor-not-allowed');
    if (document.getElementById('demo-phases-list').children.length === 0) {
      addPhaseInput();
      addPhaseInput();
    }
    updateTotalReward();
  } else {
    container.classList.add('hidden');
    rewardInput.disabled = false;
    rewardInput.placeholder = "報酬金額";
    rewardInput.classList.remove('opacity-50', 'cursor-not-allowed');
  }
}

function addPhaseInput() {
  const list = document.getElementById('demo-phases-list');
  const index = list.children.length + 1;
  const div = document.createElement('div');
  div.className = 'flex gap-2 items-center phase-item bg-slate-900/50 p-2 rounded-lg border border-white/5';
  div.innerHTML = `
    <span class="text-purple-400 text-xs font-black w-10 shrink-0 text-center phase-index">S${index}</span>
    <input type="text" class="phase-title w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white text-sm" placeholder="本階段目標" required>
    <div class="flex items-center gap-1 shrink-0">
      <span class="text-green-400 text-sm font-bold">$</span>
      <input type="number" class="phase-reward w-20 px-2 py-2 bg-slate-800 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white text-sm" placeholder="金額" min="1" required oninput="updateTotalReward()">
    </div>
    <button type="button" class="w-8 h-8 flex items-center justify-center shrink-0 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors" onclick="removePhaseInput(this)">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;
  list.appendChild(div);
  updatePhaseIndices();
}

function removePhaseInput(btn) {
  const list = document.getElementById('demo-phases-list');
  if (list.children.length > 1) {
    btn.parentElement.remove();
    updatePhaseIndices();
    updateTotalReward();
  } else {
    showToast("至少需要保留一個階段！", "warning");
  }
}

function updatePhaseIndices() {
  const list = document.getElementById('demo-phases-list');
  Array.from(list.children).forEach((child, idx) => {
    child.querySelector('.phase-index').innerText = `S${idx + 1}`;
  });
}

function updateTotalReward() {
  const isPhased = document.getElementById('demo-is-phased').checked;
  if (!isPhased) return;
  
  let total = 0;
  document.querySelectorAll('.phase-reward').forEach(input => {
    total += parseInt(input.value) || 0;
  });
  document.getElementById('demo-reward').value = total;
}

function handleDemoPublish(e) {
  e.preventDefault();

  const title = document.getElementById('demo-title').value.trim();
  const reward = parseInt(document.getElementById('demo-reward').value) || 200;
  const category = document.getElementById('demo-category').value;
  const estTime = document.getElementById('demo-est-time').value.trim();
  const deadline = document.getElementById('demo-deadline').value;
  const description = document.getElementById('demo-desc').value.trim();

  const categoryLabels = {
    academic: "學術輔導",
    delivery: "校園跑腿",
    event: "活動協助",
    tech: "技術開發",
    design: "設計創意",
    survey: "問卷研究"
  };

  const isPhased = document.getElementById('demo-is-phased') ? document.getElementById('demo-is-phased').checked : false;
  let phases = [];
  if (isPhased) {
    const phaseItems = document.querySelectorAll('.phase-item');
    phaseItems.forEach((item, idx) => {
      const pTitle = item.querySelector('.phase-title').value;
      const pReward = parseInt(item.querySelector('.phase-reward').value) || 0;
      phases.push({
        id: Date.now() + idx,
        title: pTitle,
        reward: pReward,
        status: 'pending'
      });
    });
  }

  const newDemoTask = {
    id: Date.now(),
    title: title,
    description: description,
    reward: reward,
    category: category,
    categoryLabel: categoryLabels[category] || "校園跑腿",
    university: state.user.university === "未設定學校" ? "國立臺灣大學" : state.user.university,
    deadline: deadline,
    estTime: estTime,
    posterName: state.user.name === "未設定姓名" ? "匿名學生" : state.user.name,
    posterAvatar: state.user.avatar,
    status: "available",
    matchTags: ["跑腿", "體力活"],
    timeSlots: ["Mon-afternoon", "Tue-afternoon", "Wed-afternoon", "Sat-afternoon"],
    isPhased: isPhased,
    phases: isPhased ? phases : null
  };

  state.tasks.unshift(newDemoTask);
  saveStateToStorage();
  
  renderStats();

  showToast("模擬發布成功！已自動置頂於任務大廳。", "success");

  setTimeout(() => {
    switchTab('lobby');
  }, 500);
}

function openDetailModal(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  state.selectedTask = task;
  const overlay = document.getElementById('detail-modal');
  if(!overlay) return;
  
  document.getElementById('detail-title').innerText = task.title;
  document.getElementById('detail-category-badge').className = `px-3 py-1 rounded-full text-sm font-bold border ${task.category === 'academic' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-white/5 text-slate-300 border-white/10'}`;
  document.getElementById('detail-category-badge').innerHTML = `<i class="fa-solid fa-tag"></i> ${task.categoryLabel}`;
  document.getElementById('detail-reward').innerText = `$${task.reward}`;
  document.getElementById('detail-school').innerText = task.university;
  document.getElementById('detail-est-time').innerText = task.estTime;
  document.getElementById('detail-deadline').innerText = task.deadline;
  document.getElementById('detail-desc').innerText = task.description;
  document.getElementById('detail-poster-avatar').src = task.posterAvatar;
  document.getElementById('detail-poster-name').innerText = task.posterName;

  const phasesContainer = document.getElementById('detail-phases-container');
  if (task.isPhased && task.phases && task.phases.length > 0) {
    phasesContainer.classList.remove('hidden');
    
    // 將假資料放入 LinkedList
    const linkedList = new PhasedTaskLinkedList();
    task.phases.forEach(p => linkedList.append(p.id, p.title, p.reward, p.status));
    
    const phasesHTML = linkedList.toArray().map((phase, index) => {
      let phaseIcon = '<i class="fa-solid fa-circle text-slate-600"></i>';
      let phaseClass = 'text-slate-400 border-slate-700';
      if (phase.status === 'completed') {
        phaseIcon = '<i class="fa-solid fa-circle-check text-green-400"></i>';
        phaseClass = 'text-green-400 border-green-500/30 bg-green-500/10';
      } else if (phase.status === 'active') {
        phaseIcon = '<i class="fa-solid fa-circle-dot text-purple-400"></i>';
        phaseClass = 'text-purple-400 border-purple-500/30 bg-purple-500/10';
      }
      return `
        <div class="flex items-center gap-3 p-3 rounded-lg border ${phaseClass} relative z-10 bg-slate-900">
          <div class="w-6 flex justify-center">${phaseIcon}</div>
          <div class="flex-grow font-medium text-sm">步驟 ${index + 1}: ${phase.title}</div>
          <div class="font-black text-xs">+$${phase.reward}</div>
        </div>
      `;
    }).join('');

    phasesContainer.innerHTML = `
      <h4 class="text-sm font-bold text-slate-300 mb-3 border-l-2 border-cyan-500 pl-2">階段性任務進度 <span class="text-xs text-slate-500 font-normal ml-2">(透過 Linked List 實作)</span></h4>
      <div class="flex flex-col gap-2 relative">
        <div class="absolute left-[1.35rem] top-4 bottom-4 w-0.5 bg-slate-700 z-0"></div>
        ${phasesHTML}
      </div>
    `;
  } else {
    phasesContainer.classList.add('hidden');
    phasesContainer.innerHTML = '';
  }

  const actionContainer = document.getElementById('detail-action-container');
  actionContainer.innerHTML = '';

  if (task.status === 'available') {
    actionContainer.innerHTML = `
      <button class="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700 w-full font-bold" onclick="handleAcceptTask(${task.id})">
        <i class="fa-solid fa-hand-holding-hand"></i> 接受此任務
      </button>
    `;
  } else if (task.status === 'ongoing') {
    actionContainer.innerHTML = `
      <button class="bg-amber-500 text-white px-4 py-2 rounded shadow hover:bg-amber-600 w-full font-bold" onclick="handleSubmitTask(${task.id})">
        <i class="fa-solid fa-paper-plane"></i> 提交工作成果
      </button>
    `;
  } else if (task.status === 'submitted') {
    actionContainer.innerHTML = `
      <div class="flex gap-2 w-full">
        <button class="flex-1 bg-gray-200 text-gray-500 px-4 py-2 rounded cursor-not-allowed" disabled>
          <i class="fa-solid fa-spinner fa-spin"></i> 等待審核...
        </button>
        <button class="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 font-bold" onclick="handleSimulateComplete(${task.id})">
          <i class="fa-solid fa-user-check"></i> 模擬審核通過
        </button>
      </div>
    `;
  } else if (task.status === 'completed') {
    actionContainer.innerHTML = `
      <button class="w-full bg-white border border-green-500 text-green-500 px-4 py-2 rounded cursor-default font-bold" onclick="event.stopPropagation()">
        <i class="fa-solid fa-circle-check"></i> 任務已完成，款項已撥付
      </button>
    `;
  }

  overlay.classList.add('flex');
  overlay.classList.remove('hidden');
}

function handleAcceptTask(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.status = 'ongoing';
  if (task.isPhased && task.phases && task.phases.length > 0) {
    task.phases[0].status = 'active';
  }
  saveStateToStorage();

  renderStats();
  if (state.activeTab === 'lobby') renderTasksList();
  if (state.activeTab === 'quick-match') runQuickMatch();
  
  closeAllModals();
  showToast(`成功接受任務：${task.title}！已移至「進行中工作」。`, 'success');
}

function handleSubmitTask(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.status = 'submitted';
  saveStateToStorage();

  renderStats();
  if (state.activeTab === 'profile') renderProfileSection();

  closeAllModals();
  showToast(`工作成果已送出！等待案主確認款項。`, 'info');
}

function handleSimulateComplete(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  if (task.isPhased && task.phases && task.phases.length > 0) {
    const currentPhaseIndex = task.phases.findIndex(p => p.status !== 'completed');
    if (currentPhaseIndex !== -1) {
      const currentPhase = task.phases[currentPhaseIndex];
      currentPhase.status = 'completed';
      state.user.earnings += currentPhase.reward;
      
      const nextPhase = task.phases[currentPhaseIndex + 1];
      if (nextPhase) {
        nextPhase.status = 'active';
        task.status = 'ongoing';
        saveStateToStorage();
        renderStats();
        renderSidebarBrief();
        if (state.activeTab === 'profile') renderProfileSection();
        showToast(`階段「${currentPhase.title}」審核通過！$${currentPhase.reward} 已入帳。進入下一階段！`, 'success');
        openDetailModal(taskId);
        return;
      } else {
        // Last phase completed!
        task.status = 'completed';
        state.user.completedCount += 1;
        saveStateToStorage();
        renderStats();
        renderSidebarBrief();
        if (state.activeTab === 'profile') renderProfileSection();
        closeAllModals();
        showToast(`任務所有階段皆已核准！總階段款項已全數撥入您的帳戶！`, 'success');
        return;
      }
    }
  }

  // General single-phase task completion
  task.status = 'completed';
  state.user.earnings += task.reward;
  state.user.completedCount += 1;
  saveStateToStorage();

  renderStats();
  renderSidebarBrief();
  if (state.activeTab === 'profile') renderProfileSection();

  closeAllModals();
  showToast(`任務已完全核准！款項已撥入您的帳戶！`, 'success');
}

function openEditProfileModal() {
  if (!state.isLoggedIn || state.user.name === "未設定姓名") {
    openLoginScreen();
    showToast("訪客無法編輯資料，請先註冊或登入正式帳號！", "warning");
    return;
  }

  const overlay = document.getElementById('edit-profile-modal');
  if(!overlay) return;
  
  document.getElementById('edit-name').value = state.user.name === "未設定姓名" ? "" : state.user.name;
  document.getElementById('edit-school').value = state.user.university === "未設定學校" ? "" : state.user.university;
  document.getElementById('edit-major').value = state.user.major === "未設定科系" ? "" : state.user.major;
  document.getElementById('edit-year').value = state.user.year;
  document.getElementById('edit-bio').value = state.user.bio.startsWith("尚未填寫") ? "" : state.user.bio;
  document.getElementById('edit-skills').value = state.user.skills.join(', ');

  const avatarGrid = document.getElementById('avatar-selection-grid');
  avatarGrid.innerHTML = '';
  
  AVATAR_OPTIONS.forEach(avatarUrl => {
    const isSelected = state.user.avatar === avatarUrl;
    const option = document.createElement('div');
    option.className = `p-1 cursor-pointer rounded-full border-2 ${isSelected ? 'border-purple-500' : 'border-transparent'} hover:border-purple-300`;
    option.innerHTML = `<img src="${avatarUrl}" alt="Avatar" class="w-12 h-12 rounded-full">`;
    option.addEventListener('click', () => {
      document.querySelectorAll('#avatar-selection-grid > div').forEach(el => {
        el.classList.remove('border-purple-500');
        el.classList.add('border-transparent');
      });
      option.classList.add('border-purple-500');
      option.classList.remove('border-transparent');
      option.setAttribute('data-url', avatarUrl);
    });
    if (isSelected) {
      option.setAttribute('data-url', avatarUrl);
    }
    avatarGrid.appendChild(option);
  });

  overlay.classList.add('flex');
  overlay.classList.remove('hidden');
}

function handleSaveProfile(e) {
  e.preventDefault();

  let avatarUrl = state.user.avatar;
  document.querySelectorAll('#avatar-selection-grid > div').forEach(el => {
    if(el.classList.contains('border-purple-500')) {
        avatarUrl = el.getAttribute('data-url');
    }
  });

  state.user.name = document.getElementById('edit-name').value.trim() || "未設定姓名";
  state.user.university = document.getElementById('edit-school').value.trim() || "未設定學校";
  state.user.major = document.getElementById('edit-major').value.trim() || "未設定科系";
  state.user.year = document.getElementById('edit-year').value;
  state.user.bio = document.getElementById('edit-bio').value.trim() || "尚未填寫個人簡介，請點擊下方「編輯個人資料」進行設定。";
  state.user.avatar = avatarUrl;

  const skillsInput = document.getElementById('edit-skills').value;
  state.user.skills = skillsInput.split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  saveStateToStorage();

  renderSidebarBrief();
  renderStats();
  if (state.activeTab === 'profile') renderProfileSection();

  closeAllModals();
  showToast("個人資料已成功更新！", "success");
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
  });
  state.selectedTask = null;
}

function saveStateToStorage() {
  localStorage.setItem('unitask_tasks', JSON.stringify(state.tasks));
  localStorage.setItem('unitask_user', JSON.stringify(state.user));
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  
  let bgClass = 'bg-gray-800';
  let icon = 'fa-solid fa-info-circle text-blue-400';
  if (type === 'success') { bgClass = 'bg-gray-900 border-green-500'; icon = 'fa-solid fa-circle-check text-green-400'; }
  if (type === 'warning') { bgClass = 'bg-gray-900 border-yellow-500'; icon = 'fa-solid fa-circle-exclamation text-yellow-400'; }
  if (type === 'danger') { bgClass = 'bg-gray-900 border-red-500'; icon = 'fa-solid fa-circle-xmark text-red-400'; }

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm border-l-4 ${bgClass} transform transition-all duration-300 translate-y-full opacity-0`;
  
  toast.innerHTML = `
    <i class="${icon} text-lg"></i>
    <div>${message}</div>
  `;

  container.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.classList.remove('translate-y-full', 'opacity-0');
  }, 10);
  
  setTimeout(() => {
    toast.classList.add('translate-y-full', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function bindEvents() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      if (tabId) switchTab(tabId);
    });
  });

  const searchInput = document.getElementById('task-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.filters.keyword = e.target.value.trim();
      renderTasksList();
    });
  }

  document.querySelectorAll('.category-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      document.querySelectorAll('.category-tag').forEach(el => el.classList.remove('active', 'bg-purple-100', 'text-purple-700', 'border-purple-300'));
      tag.classList.add('active', 'bg-purple-100', 'text-purple-700', 'border-purple-300');
      state.filters.category = tag.getAttribute('data-category');
      renderTasksList();
    });
  });

  const rewardSlider = document.getElementById('reward-slider');
  const rewardValue = document.getElementById('reward-value-display');
  if (rewardSlider) {
    rewardSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      rewardValue.innerText = `$${val}+`;
      state.filters.minReward = val;
      renderTasksList();
    });
  }

  const matchRewardSlider = document.getElementById('match-reward-slider');
  const matchRewardValue = document.getElementById('match-reward-display');
  if (matchRewardSlider) {
    matchRewardSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      matchRewardValue.innerText = `$${val}+`;
      state.matchMinReward = val;
    });
  }

  const schoolSelect = document.getElementById('school-select');
  if (schoolSelect) {
    schoolSelect.addEventListener('change', (e) => {
      state.filters.school = e.target.value;
      renderTasksList();
    });
  }

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.filters.sortBy = e.target.value;
      renderTasksList();
    });
  }

  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabBtns.forEach(b => {
        b.classList.remove('active', 'font-bold', 'text-purple-400', 'border-b-2', 'border-purple-500');
        b.classList.add('font-medium', 'text-slate-400', 'hover:text-slate-200');
      });
      btn.classList.remove('font-medium', 'text-slate-400', 'hover:text-slate-200');
      btn.classList.add('active', 'font-bold', 'text-purple-400', 'border-b-2', 'border-purple-500');
      state.activeProfileTab = btn.getAttribute('data-subtab');
      renderProfileTabsList();
    });
  });

  document.querySelectorAll('.calendar-cell').forEach(cell => {
    cell.addEventListener('click', () => handleTimeSlotClick(cell));
  });

  document.querySelectorAll('.match-tag-btn').forEach(btn => {
    btn.addEventListener('click', () => handleMatchTagClick(btn));
  });

  const runMatchBtn = document.getElementById('run-match-btn');
  if (runMatchBtn) {
    runMatchBtn.addEventListener('click', runQuickMatch);
  }

  const demoForm = document.getElementById('demo-publish-form');
  if (demoForm) {
    demoForm.addEventListener('submit', handleDemoPublish);
  }

  const loginForm = document.getElementById('email-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', performLogin);
  }

  const registerForm = document.getElementById('student-register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', performRegister);
  }

  const guestBtn = document.getElementById('guest-login-btn');
  if (guestBtn) {
    guestBtn.addEventListener('click', quickGuestLogin);
  }

  // Auth button in sidebar is handled dynamically via onClick in updateAuthUI.
  // Profile logout button is also handled dynamically.

  const switchToReg = document.getElementById('switch-to-register');
  if (switchToReg) {
    switchToReg.addEventListener('click', showRegisterForm);
  }

  const switchToLogin = document.getElementById('switch-to-login');
  if (switchToLogin) {
    switchToLogin.addEventListener('click', showLoginForm);
  }

  const editProfileForm = document.getElementById('edit-profile-form');
  if (editProfileForm) {
    editProfileForm.addEventListener('submit', handleSaveProfile);
  }

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });
}

// --- 資料結構實作：階段性任務 Linked List ---
class TaskPhaseNode {
  constructor(id, title, reward, status = 'pending') {
    this.id = id;
    this.title = title;
    this.reward = reward;
    this.status = status; // pending, active, completed
    this.next = null;
  }
}

class PhasedTaskLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
  }
  
  append(id, title, reward, status = 'pending') {
    const newNode = new TaskPhaseNode(id, title, reward, status);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      this.tail = newNode;
    }
  }

  toArray() {
    const arr = [];
    let current = this.head;
    while (current) {
      arr.push({ id: current.id, title: current.title, reward: current.reward, status: current.status });
      current = current.next;
    }
    return arr;
  }
}

// --- 自然語言智能解析演算法 (NLP Parser) ---
function parseNaturalLanguageQuery() {
  const inputEl = document.getElementById('nlp-search-input');
  if (!inputEl) return;
  const text = inputEl.value.trim();
  
  if (!text) {
    showToast("請輸入一段文字，例如：「禮拜三下午想接個設計案，報酬希望有1000元以上」", "warning");
    return;
  }

  // 1. 重設 UI
  resetQuickMatchUI();
  inputEl.value = text;

  let parsedInfo = [];

  // 2. 解析時間 (Day)
  const daysMap = {
    '一': 'Mon', '1': 'Mon',
    '二': 'Tue', '2': 'Tue',
    '三': 'Wed', '3': 'Wed',
    '四': 'Thu', '4': 'Thu',
    '五': 'Fri', '5': 'Fri',
    '六': 'Sat', '6': 'Sat',
    '日': 'Sun', '天': 'Sun'
  };
  
  const dayRegex = /(?:週|禮拜|星期|周)([一二三四五六日天123456])/g;
  let dayMatches = [...text.matchAll(dayRegex)];
  
  const timeRegex = /(早上|上午|下午|晚上|半夜)/g;
  let timeMatches = [...text.matchAll(timeRegex)];
  
  let targetDays = dayMatches.map(m => daysMap[m[1]]);
  if (targetDays.length === 0) targetDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  
  let targetTimes = timeMatches.map(m => {
    if (m[1] === '早上' || m[1] === '上午') return 'morning';
    if (m[1] === '下午') return 'afternoon';
    if (m[1] === '晚上' || m[1] === '半夜') return 'evening';
    return 'afternoon';
  });
  if (targetTimes.length === 0) targetTimes = ['morning','afternoon','evening'];

  let slotsSelected = 0;
  if (dayMatches.length > 0 || timeMatches.length > 0) {
    targetDays.forEach(day => {
      targetTimes.forEach(time => {
        const slotId = `${day}-${time}`;
        const cell = document.querySelector(`.calendar-cell[data-slot="${slotId}"]`);
        if (cell && !cell.classList.contains('selected')) {
          handleTimeSlotClick(cell);
          slotsSelected++;
        }
      });
    });
    parsedInfo.push(`勾選了 ${slotsSelected} 個時段`);
  }

  // 3. 解析標籤 (Tags)
  const tagKeywords = ['跑腿', '文書', '體力活', '學術', '設計', '技術'];
  let tagsSelected = 0;
  tagKeywords.forEach(tag => {
    if (text.includes(tag)) {
      const btn = document.querySelector(`.match-tag-btn[data-tag="${tag}"]`);
      if (btn && !btn.classList.contains('active')) {
        handleMatchTagClick(btn);
        tagsSelected++;
        parsedInfo.push(`標籤 #${tag}`);
      }
    }
  });

  // 4. 解析報酬 (Reward)
  const rewardRegex = /(?:報酬|大於|超過)?\s*(\d+)\s*(?:元|塊|以上|左右)?/;
  const rewardMatch = text.match(rewardRegex);
  if (rewardMatch && rewardMatch[1]) {
    const amount = parseInt(rewardMatch[1], 10);
    if (amount > 0) {
      state.matchMinReward = amount;
      
      // Update the visual slider
      const matchRewardSlider = document.getElementById('match-reward-slider');
      const matchRewardValue = document.getElementById('match-reward-display');
      if (matchRewardSlider && matchRewardValue) {
        // Clamp to max 5000 based on slider HTML attribute
        const sliderVal = Math.min(amount, 5000);
        matchRewardSlider.value = sliderVal;
        matchRewardValue.innerText = `$${amount}+`;
      }
      
      parsedInfo.push(`最低報酬 $${amount}`);
    }
  }

  if (parsedInfo.length > 0) {
    showToast(`🧠 智慧解析完成！已萃取條件：${parsedInfo.join('、')}`, "success");
    setTimeout(() => {
      runQuickMatch();
    }, 600);
  } else {
    showToast("無法從您的輸入中解析出具體條件，已為您列出所有任務。", "info");
    runQuickMatch();
  }
}

// --- 初始化與 DOM 載入 ---
document.addEventListener('DOMContentLoaded', initApp);

// --- Chart.js 與 審核功能實作 ---

let earningsChartInstance = null;

function renderEarningsChart() {
  const ctx = document.getElementById('earnings-chart');
  if (!ctx) return;
  
  if (earningsChartInstance) {
    earningsChartInstance.destroy();
  }

  // 取得歷史完成任務，計算數據
  const completedTasks = state.tasks.filter(t => t.status === 'completed' && !t.isUserPosted);
  
  // 計算總收益
  const totalEarnings = completedTasks.reduce((sum, t) => sum + parseInt(t.reward), 0);
  document.getElementById('metric-current-earnings').innerText = `$${totalEarnings.toLocaleString()}`;

  // 計算平均時長
  let avgDuration = 0;
  if (completedTasks.length > 0) {
    const totalDuration = completedTasks.reduce((sum, t) => sum + (t.actualDuration || parseFloat(t.estTime) || 2), 0);
    avgDuration = (totalDuration / completedTasks.length).toFixed(1);
  }
  document.getElementById('metric-avg-duration').innerText = `${avgDuration} 小時`;

  // 整理圖表資料 (這裡用簡單的假資料當作範例)
  const labels = ['5/1', '5/8', '5/15', '5/22', '5/29', '6/5', '6/12'];
  const earningsData = [0, 500, 1200, 1200, 1800, 2000, totalEarnings];
  const efficiencyData = [0, 2, 2.5, 2.1, 3.0, 2.8, parseFloat(avgDuration) || 2.5];

  earningsChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: '累積收益 (NT$)',
          data: earningsData,
          borderColor: '#a855f7',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          yAxisID: 'y'
        },
        {
          type: 'bar',
          label: '平均任務時長 (小時)',
          data: efficiencyData,
          backgroundColor: 'rgba(6, 182, 212, 0.5)',
          borderRadius: 4,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#94a3b8',
            font: { family: 'Inter', size: 10 },
            usePointStyle: true,
            boxWidth: 6
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: '#fff',
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          padding: 10,
          boxPadding: 4
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
          ticks: { color: '#64748b', font: { size: 10 } }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
          ticks: { color: '#a855f7', font: { size: 10 }, callback: (value) => '$' + value }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { color: '#06b6d4', font: { size: 10 }, callback: (value) => value + 'h' }
        }
      }
    }
  });
}

function toggleEarningsView() {
  const mode = document.getElementById('chart-view-mode').value;
  const chartContainer = document.getElementById('earnings-chart-container');
  const calContainer = document.getElementById('earnings-calendar-container');

  if (mode === 'chart') {
    chartContainer.classList.remove('hidden');
    calContainer.classList.add('hidden');
  } else {
    chartContainer.classList.add('hidden');
    calContainer.classList.remove('hidden');
    currentCalendarDate = new Date(); // reset to current month
    renderEarningsCalendar();
  }
}

let currentCalendarDate = new Date();

function changeCalendarMonth(delta) {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
  renderEarningsCalendar();
}

function renderEarningsCalendar() {
  const container = document.getElementById('earnings-calendar');
  const label = document.getElementById('calendar-month-label');
  if (!container || !label) return;
  container.innerHTML = '';

  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  label.innerText = `${year}年 ${month + 1}月`;

  // Get first day of month (0 = Sunday)
  const firstDay = new Date(year, month, 1).getDay();
  // Get number of days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const completedTasks = state.tasks.filter(t => t.status === 'completed' && !t.isUserPosted);
  
  // Map tasks by date
  const tasksByDate = {};
  completedTasks.forEach(t => {
    const dateStr = (t.completionTime || t.deadline).split('T')[0];
    if (!tasksByDate[dateStr]) tasksByDate[dateStr] = [];
    tasksByDate[dateStr].push(t);
  });

  // Empty cells for days before the 1st
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'bg-white/5 rounded-md border border-white/5 opacity-50';
    container.appendChild(emptyCell);
  }

  // Days
  for (let i = 1; i <= daysInMonth; i++) {
    const cell = document.createElement('div');
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const dayTasks = tasksByDate[dStr] || [];
    
    const totalAmount = dayTasks.reduce((sum, t) => sum + parseInt(t.reward), 0);
    
    let colorClass = 'bg-slate-800 border border-white/10 text-slate-500';
    let contentHTML = `<div class="text-[10px] text-left px-1 pt-0.5 opacity-50">${i}</div>`;

    if (totalAmount > 0) {
      if (totalAmount > 1500) {
        colorClass = 'bg-purple-600/30 border border-purple-500 text-purple-200 cursor-pointer hover:bg-purple-500/50 hover:shadow-[0_0_10px_rgba(139,92,246,0.5)]';
      } else if (totalAmount > 500) {
        colorClass = 'bg-purple-800/50 border border-purple-600/70 text-purple-200 cursor-pointer hover:bg-purple-700/60';
      } else {
        colorClass = 'bg-white/10 border border-white/20 text-slate-300 cursor-pointer hover:bg-white/20';
      }
      contentHTML = `
        <div class="text-[10px] text-left px-1 pt-0.5">${i}</div>
        <div class="text-[10px] sm:text-xs font-bold mt-0.5 text-center truncate">+$${totalAmount}</div>
      `;
      cell.onclick = () => openDailyDetailsModal(dStr, dayTasks, totalAmount);
    }

    cell.className = `rounded-md transition-all flex flex-col overflow-hidden ${colorClass}`;
    cell.innerHTML = contentHTML;
    container.appendChild(cell);
  }
}

function openDailyDetailsModal(dateStr, tasks, totalAmount) {
  const modal = document.getElementById('daily-earnings-modal');
  const title = document.getElementById('daily-modal-title');
  const content = document.getElementById('daily-modal-content');
  if(!modal || !title || !content) return;

  title.innerHTML = `${dateStr} <span class="text-sm font-normal text-purple-400 ml-2">總計: $${totalAmount}</span>`;
  
  content.innerHTML = tasks.map(t => `
    <div class="bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 transition-colors">
      <div class="flex justify-between items-start mb-1">
        <div class="font-bold text-sm text-white line-clamp-1">${t.title}</div>
        <div class="font-black text-cyan-400 whitespace-nowrap ml-2">+$${t.reward}</div>
      </div>
      <div class="flex items-center gap-2 mt-2">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">${t.categoryLabel}</span>
        <span class="text-xs text-slate-400"><i class="fa-regular fa-clock"></i> 耗時: ${t.actualDuration || t.estTime || 'N/A'}</span>
      </div>
    </div>
  `).join('');

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function simulateStudentSubmit(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;
  
  if (task.status === 'available') {
    task.status = 'ongoing';
    showToast("已模擬：有學生接取了您的任務！", "info");
    saveStateToStorage();
    renderProfileTabsList();
    
    // 模擬 1.5 秒後學生提交成果
    setTimeout(() => {
      const currentTask = state.tasks.find(t => t.id === taskId);
      if (currentTask && currentTask.status === 'ongoing') {
        currentTask.status = 'submitted';
        currentTask.mockSubmission = {
          studentName: "李大宇 (資工大三)",
          note: "您好，我已經完成任務囉！請幫我確認一下，沒問題的話再麻煩撥款，謝謝您！"
        };
        showToast(`您的任務「${currentTask.title}」有學生提交成果了！`, "success");
        saveStateToStorage();
        if (state.activeTab === 'profile' && state.activeProfileTab === 'posted') {
          renderProfileTabsList();
        }
      }
    }, 1500);
    
  } else if (task.status === 'ongoing') {
    task.status = 'submitted';
    task.mockSubmission = {
      studentName: "李大宇 (資工大三)",
      note: "您好，我已經完成任務囉！請幫我確認一下，沒問題的話再麻煩撥款，謝謝您！"
    };
    showToast(`模擬成功：學生已提交成果！`, "success");
    saveStateToStorage();
    renderProfileTabsList();
  }
}

function rejectPostedTask(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;
  
  task.status = 'ongoing';
  showToast("已將任務退回，學生需重新修改並提交成果。", "warning");
  saveStateToStorage();
  renderProfileTabsList();
}

function approvePostedTask(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;
  
  task.status = 'completed';
  showToast(`已核准！系統已將 ${task.reward} 元撥款給接案學生。`, "success");
  saveStateToStorage();
  renderProfileTabsList();
}
