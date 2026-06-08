/**
 * UniTask - 大學生任務平台
 * Core Application Script
 */

// --- 初始模擬數據 ---
const INITIAL_TASKS = [
  {
    id: 1,
    title: "微積分期中考考前衝刺輔導 (一對一)",
    description: "微積分(一)極限、導數與積分基礎。對象為大一工學院學生，需要有耐心且微積分成績優異（請附上成績證明）。預計進行兩次，每次 2 小時，地點在總圖討論室或線上皆可。",
    reward: 1200,
    category: "academic",
    categoryLabel: "學術輔導",
    university: "國立臺灣大學",
    deadline: "2026-06-15",
    estTime: "4 小時",
    posterName: "王小明 (大一生)",
    posterAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=xiaoming",
    status: "available",
    matchTags: ["學術", "文書"],
    timeSlots: ["Tue-evening", "Thu-evening", "Sat-afternoon"]
  },
  {
    id: 2,
    title: "宿舍行李代搬與整理 (校外公寓至宿舍)",
    description: "需要一位壯丁幫忙將行李從校外水源舍區搬到水源宿舍 5 樓（無電梯）。行李包括 3 個大箱子與一個摺疊床。有推車者優先，預估 1.5 小時內可搞定。",
    reward: 450,
    category: "delivery",
    categoryLabel: "校園跑腿",
    university: "國立臺灣大學",
    deadline: "2026-06-10",
    estTime: "1.5 小時",
    posterName: "李詩雅 (大三生)",
    posterAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=shiya",
    status: "available",
    matchTags: ["體力活", "跑腿"],
    timeSlots: ["Wed-afternoon", "Sat-afternoon", "Sun-morning"]
  },
  {
    id: 3,
    title: "校園音樂祭 - 現場舞台協助人員",
    description: "協助校園音樂祭現場秩序維護、舞台器材搬運與樂團接待。工作時間為下午 1 點至晚上 9 點，供兩餐便當與飲用水。須穿著黑色素面 T-shirt，配合度高者佳。",
    reward: 1800,
    category: "event",
    categoryLabel: "活動協助",
    university: "國立臺灣大學",
    deadline: "2026-06-20",
    estTime: "8 小時",
    posterName: "學生會活動部",
    posterAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=sa",
    status: "available",
    matchTags: ["體力活", "跑腿"],
    timeSlots: ["Fri-afternoon", "Fri-evening", "Sat-morning", "Sat-afternoon", "Sat-evening"]
  },
  {
    id: 4,
    title: "Python 網路爬蟲腳本撰寫 (電商資料收集)",
    description: "需要編寫一個簡單的 Python 爬蟲，抓取特定電商網站的商品價格與評價，並輸出為 CSV 格式。需處理基本的分頁與防爬機制。完成後需交付原始碼並進行 15 分鐘說明。",
    reward: 2500,
    category: "tech",
    categoryLabel: "技術開發",
    university: "國立臺灣大學",
    deadline: "2026-06-25",
    estTime: "6 小時",
    posterName: "林博士 (實驗室助理)",
    posterAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=assistant",
    status: "available",
    matchTags: ["技術"],
    timeSlots: ["Mon-evening", "Wed-evening", "Fri-evening", "Sun-evening"]
  },
  {
    id: 5,
    title: "社團成果發表會 - 宣傳海報與折頁設計",
    description: "吉他社期末果發海報設計，風格希望是日系清新或復古風。需要交付 A2 海報電子檔 (AI/PSD) 以及三折頁的排版。會有 2 次線上校稿修改，請隨信附上作品集連結。",
    reward: 1500,
    category: "design",
    categoryLabel: "設計創意",
    university: "私立輔仁大學",
    deadline: "2026-06-18",
    estTime: "5 小時",
    posterName: "吉他社社長",
    posterAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=guitar",
    status: "available",
    matchTags: ["設計", "文書"],
    timeSlots: ["Mon-afternoon", "Tue-afternoon", "Wed-afternoon", "Thu-afternoon", "Fri-afternoon"]
  },
  {
    id: 6,
    title: "認知心理學實驗 - 眼動儀測試受試者",
    description: "本實驗探討讀者在閱讀不同排版網頁時的注意力分配。實驗約需 50 分鐘，包含前置儀器校正。受試者條件：視力正常（戴隱形眼鏡可，不可散光過重），無重大神經病史。",
    reward: 300,
    category: "survey",
    categoryLabel: "問卷研究",
    university: "國立臺灣大學",
    deadline: "2026-06-30",
    estTime: "1 小時",
    posterName: "心理所實驗室",
    posterAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=psy",
    status: "available",
    matchTags: ["學術", "跑腿"],
    timeSlots: ["Mon-morning", "Tue-morning", "Wed-morning", "Thu-morning", "Fri-morning"]
  },
  {
    id: 7,
    title: "英文學術論文潤稿與文法糾錯",
    description: "欲投稿國際研討會的短篇論文 (約 4000 字)，主題為機器學習在生醫的應用。主要修改英文文法流暢度與用詞精準度。投稿人英文中等，希望找英文母語或有學術論文撰寫經驗者。",
    reward: 3200,
    category: "academic",
    categoryLabel: "學術輔導",
    university: "國立政治大學",
    deadline: "2026-06-22",
    estTime: "8 小時",
    posterName: "張副教授",
    posterAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=prof",
    status: "available",
    matchTags: ["學術", "文書"],
    timeSlots: ["Sat-morning", "Sat-afternoon", "Sun-afternoon", "Sun-evening"]
  },
  {
    id: 8,
    title: "代排隊購買限量校園紀念帽 T",
    description: "幫忙排隊購買合作社限量發售的校慶紀念款帽 T（灰色 L 號一件）。早上 8:30 需到合作社門口排隊，預計 9:00 開賣，預估排隊時間約 40 分鐘。商品費用會另外付現。",
    reward: 200,
    category: "delivery",
    categoryLabel: "校園跑腿",
    university: "國立臺灣大學",
    deadline: "2026-06-09",
    estTime: "1 小時",
    posterName: "黃同學",
    posterAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=huang",
    status: "available",
    matchTags: ["跑腿", "體力活"],
    timeSlots: ["Mon-morning", "Tue-morning", "Wed-morning"]
  },
  {
    id: 9,
    title: "校園創客空間 - 3D 列印機操作與維護協助",
    description: "協助創客空間使用者操作 FDM 3D 列印機，並進行日常噴嘴清潔、調平與線材更換。需要對 3D 列印有基礎認識，懂 Cura 切片軟體。時段為週三下午 1:00-5:00。",
    reward: 800,
    category: "tech",
    categoryLabel: "技術開發",
    university: "國立臺灣科技大學",
    deadline: "2026-06-14",
    estTime: "4 小時",
    posterName: "創客空間管理員",
    posterAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=maker",
    status: "available",
    matchTags: ["技術", "文書"],
    timeSlots: ["Wed-afternoon", "Fri-afternoon"]
  },
  {
    id: 10,
    title: "大學博覽會 - 攤位發傳單與諮詢人員",
    description: "於台北花博爭艷館代表學校進行攤位解說、發放招生簡章，引導高中生填寫諮詢表單。需要個性活潑外向、口齒清晰、能主動拉客的大學生。提供午餐便當與水。",
    reward: 1600,
    category: "event",
    categoryLabel: "活動協助",
    university: "私立輔仁大學",
    deadline: "2026-06-12",
    estTime: "8 小時",
    posterName: "招生組陳老師",
    posterAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=admission",
    status: "available",
    matchTags: ["體力活", "跑腿"],
    timeSlots: ["Sat-morning", "Sat-afternoon", "Sun-morning", "Sun-afternoon"]
  },
  {
    id: 11,
    title: "學生新創團隊 App UI/UX 原型設計",
    description: "我們正在開發一款校園二手書交易 App，需要設計主畫面、商品詳情、聊天室與個人資料頁面的高保真 (High-fidelity) UI 原型。使用 Figma 設計，需提供可互動的 Prototype。",
    reward: 5000,
    category: "design",
    categoryLabel: "設計創意",
    university: "國立臺灣大學",
    deadline: "2026-06-28",
    estTime: "12 小時",
    posterName: "UniTrade 創辦人",
    posterAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=unitrade",
    status: "available",
    matchTags: ["設計", "技術"],
    timeSlots: ["Sat-evening", "Sun-evening", "Mon-evening", "Tue-evening"]
  },
  {
    id: 12,
    title: "大學生消費習慣與理財認知問卷調查",
    description: "限大專院校在學生填寫。本問卷旨在調查通膨背景下大學生的儲蓄與理財渠道選擇。問卷填寫約需 5-8 分鐘。請務必真實回答，我們會進行重複性與隨機回答檢測。",
    reward: 50,
    category: "survey",
    categoryLabel: "問卷研究",
    university: "國立臺灣大學",
    deadline: "2026-06-30",
    estTime: "10 分鐘",
    posterName: "財金系專題小組",
    posterAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=finance",
    status: "available",
    matchTags: ["學術"],
    timeSlots: ["Mon-morning", "Tue-afternoon", "Wed-evening", "Thu-morning", "Fri-afternoon", "Sat-evening", "Sun-morning"]
  }
];

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

// 預填的 Demo 體驗帳號 (已重置為空資料)
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

// --- 系統狀態管理 ---
let state = {
  tasks: [],
  user: {},
  activeTab: 'lobby', // lobby, quick-match, post-demo, profile
  activeProfileTab: 'history', // history, active
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
  isLoggedIn: false
};

// --- 初始化應用 ---
function initApp() {
  // 檢查登入狀態
  const loginFlag = localStorage.getItem('unitask_is_logged_in');
  const storedTasks = localStorage.getItem('unitask_tasks');
  const storedUser = localStorage.getItem('unitask_user');

  // 初始化任務數據
  state.tasks = storedTasks ? JSON.parse(storedTasks) : JSON.parse(JSON.stringify(INITIAL_TASKS));

  if (loginFlag === 'true') {
    state.isLoggedIn = true;
    state.user = storedUser ? JSON.parse(storedUser) : JSON.parse(JSON.stringify(DEMO_USER));
    document.getElementById('login-screen').style.display = 'none';
  } else {
    state.isLoggedIn = false;
    state.user = JSON.parse(JSON.stringify(INITIAL_USER));
    document.getElementById('login-screen').style.display = 'flex';
  }

  // 渲染側邊欄與初始頁面
  renderSidebarBrief();
  renderStats();
  switchTab('lobby');

  // 綁定各類事件監聽器
  bindEvents();
  setupDemoPublishData();
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

// 驗證是否為學生信箱 (提示用途)
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

  // 提示非學術信箱，但仍放行（以利測試體驗）
  if (!checkStudentEmail(email)) {
    showToast("提示：建議使用學校信箱 (.edu.tw) 進行註冊，以享有完整大學生專屬權益！", "warning");
  }

  // 每次登入時強制清空先前可能殘留的任務進度與快取
  localStorage.removeItem('unitask_tasks');
  localStorage.removeItem('unitask_user');
  state.tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));

  // 若輸入 demo 帳號，載入空白的初始資料，並預設信箱對應名稱以利體驗
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

  // 隱藏登入畫面
  const loginOverlay = document.getElementById('login-screen');
  loginOverlay.style.opacity = '0';
  setTimeout(() => {
    loginOverlay.style.display = 'none';
    loginOverlay.style.opacity = '1';
  }, 300);

  // 刷新所有頁面狀態與大廳
  renderSidebarBrief();
  renderStats();
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

  // 隨機選一個頭像
  const randomAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];

  // 建立全新學生帳戶資料
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

  // 隱藏登入畫面
  const loginOverlay = document.getElementById('login-screen');
  loginOverlay.style.opacity = '0';
  setTimeout(() => {
    loginOverlay.style.display = 'none';
    loginOverlay.style.opacity = '1';
  }, 300);

  renderSidebarBrief();
  renderStats();
  switchTab('lobby');
  showToast("註冊成功！歡迎加入 UniTask 大學生互助社群。", "success");
}

// 快速體驗訪客登入
function quickGuestLogin() {
  // 每次訪客登入時，強制重置清空所有的接案進度與快取
  localStorage.removeItem('unitask_tasks');
  localStorage.removeItem('unitask_user');
  
  state.tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
  state.user = JSON.parse(JSON.stringify(INITIAL_USER));
  
  saveStateToStorage();
  localStorage.setItem('unitask_is_logged_in', 'true');
  state.isLoggedIn = true;

  const loginOverlay = document.getElementById('login-screen');
  loginOverlay.style.opacity = '0';
  setTimeout(() => {
    loginOverlay.style.display = 'none';
    loginOverlay.style.opacity = '1';
  }, 300);

  renderSidebarBrief();
  renderStats();
  switchTab('lobby');
  showToast("已使用學生訪客身份快速登入！", "success");
}

function handleLogout() {
  // 清除登入標籤
  localStorage.setItem('unitask_is_logged_in', 'false');
  state.isLoggedIn = false;
  state.user = JSON.parse(JSON.stringify(INITIAL_USER));

  // 顯示登入畫面並重置首頁
  const loginOverlay = document.getElementById('login-screen');
  loginOverlay.style.display = 'flex';
  
  // 清除快取中的狀態，重置回初始任務與用戶
  localStorage.removeItem('unitask_tasks');
  localStorage.removeItem('unitask_user');
  state.tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));

  renderSidebarBrief();
  renderStats();
  
  showToast("您已成功安全登出系統。", "info");
}

// --- 渲染與更新介面 ---

function renderSidebarBrief() {
  document.getElementById('sidebar-avatar').src = state.user.avatar;
  document.getElementById('sidebar-name').innerText = state.user.name;
  document.getElementById('sidebar-school').innerText = `${state.user.university} · ${state.user.major}`;
}

function renderStats() {
  const availableCount = state.tasks.filter(t => t.status === 'available').length;
  const activeCount = state.tasks.filter(t => t.status === 'ongoing').length;
  const completedCount = state.user.completedCount || 0;
  const totalEarnings = state.user.earnings || 0;

  document.getElementById('stat-available').innerText = availableCount;
  document.getElementById('stat-active').innerText = activeCount;
  document.getElementById('stat-completed').innerText = completedCount;
  document.getElementById('stat-earnings').innerText = `$${totalEarnings.toLocaleString()}`;
}

// 任務大廳列表渲染
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
    const matchStatus = task.status === 'available'; // 大廳只顯示開放中

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
  const isHighReward = task.reward >= 1500;
  const card = document.createElement('div');
  card.className = `task-card ${isHighReward ? 'high-reward' : ''}`;
  card.setAttribute('data-id', task.id);

  let categoryIcon = 'fa-solid fa-circle-info';
  if (task.category === 'academic') categoryIcon = 'fa-solid fa-graduation-cap';
  if (task.category === 'delivery') categoryIcon = 'fa-solid fa-motorcycle';
  if (task.category === 'event') categoryIcon = 'fa-solid fa-calendar-day';
  if (task.category === 'tech') categoryIcon = 'fa-solid fa-code';
  if (task.category === 'design') categoryIcon = 'fa-solid fa-palette';
  if (task.category === 'survey') categoryIcon = 'fa-solid fa-clipboard-question';

  card.innerHTML = `
    <div class="task-card-header">
      <span class="task-category-badge ${task.category}">
        <i class="${categoryIcon}"></i> ${task.categoryLabel}
      </span>
      <span class="task-reward"><i class="fa-solid fa-dollar-sign"></i>${task.reward}</span>
    </div>
    <h3 class="task-title">${task.title}</h3>
    <p class="task-desc">${task.description}</p>
    <div class="task-details-row">
      <div class="task-detail-item">
        <i class="fa-regular fa-clock"></i>
        <span>預估：${task.estTime}</span>
      </div>
      <div class="task-detail-item">
        <i class="fa-regular fa-calendar"></i>
        <span>截止：${task.deadline}</span>
      </div>
    </div>
    <div class="task-card-footer">
      <div class="task-school-info">
        <i class="fa-solid fa-location-dot"></i>
        <span>${task.university}</span>
      </div>
      ${showStatusBadge ? renderStatusBadge(task.status) : `<span class="status-badge available">開放申請</span>`}
    </div>
  `;

  card.addEventListener('click', () => openDetailModal(task.id));
  return card;
}

function renderStatusBadge(status) {
  if (status === 'ongoing') return `<span class="status-badge ongoing">執行中</span>`;
  if (status === 'submitted') return `<span class="status-badge submitted">審核中</span>`;
  if (status === 'completed') return `<span class="status-badge completed">已完成</span>`;
  return `<span class="status-badge available">開放申請</span>`;
}

// 4. 渲染個人檔案頁面
function renderProfileSection() {
  document.getElementById('profile-avatar').src = state.user.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=placeholder';
  document.getElementById('profile-name').innerText = state.user.name || '未設定姓名';
  document.getElementById('profile-identity').innerText = `${state.user.university || '未設定學校'} · ${state.user.major || '未設定科系'} (${state.user.year || '大一'})`;
  document.getElementById('profile-rating').innerHTML = `<i class="fa-solid fa-star" style="color: #fbbf24; margin-right: 2px;"></i> ${state.user.rating || '5.0'}`;
  document.getElementById('profile-stat-completed').innerText = state.user.completedCount || 0;
  document.getElementById('profile-stat-earnings').innerText = `$${(state.user.earnings || 0).toLocaleString()}`;
  document.getElementById('profile-bio').innerText = state.user.bio || "此使用者尚未填寫簡介。";

  // 技能 Tags
  const skillsContainer = document.getElementById('profile-skills');
  skillsContainer.innerHTML = '';
  if (state.user.skills && state.user.skills.length > 0) {
    state.user.skills.forEach(skill => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.innerText = skill;
      skillsContainer.appendChild(tag);
    });
  } else {
    skillsContainer.innerHTML = `<span class="text-muted" style="font-size: 0.85rem;">暫無技能標籤</span>`;
  }

  renderProfileTabsList();
}

function renderProfileTabsList() {
  const container = document.getElementById('profile-history-container');
  container.innerHTML = '';

  const activeTab = state.activeProfileTab; // 'history' or 'active'
  let filtered = [];
  if (activeTab === 'history') {
    filtered = state.tasks.filter(t => t.status === 'completed');
  } else {
    filtered = state.tasks.filter(t => t.status === 'ongoing' || t.status === 'submitted');
  }

  if (filtered.length === 0) {
    const icon = activeTab === 'history' ? 'fa-solid fa-clipboard-check' : 'fa-solid fa-person-running';
    const title = activeTab === 'history' ? '尚無歷史完成紀錄' : '目前沒有執行中的任務';
    const desc = activeTab === 'history' ? '接案完成並經案主審核通過後，會顯示在此處。' : '快前往任務大廳接案吧！';
    
    container.innerHTML = `
      <div class="empty-state">
        <i class="${icon}"></i>
        <h3>${title}</h3>
        <p>${desc}</p>
      </div>
    `;
    return;
  }

  filtered.forEach(task => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.setAttribute('data-id', task.id);

    let bgStyle = 'background: rgba(139, 92, 246, 0.1); color: var(--primary-hover);';
    if (task.category === 'delivery') bgStyle = 'background: rgba(6, 182, 212, 0.1); color: var(--secondary);';
    if (task.status === 'completed') bgStyle = 'background: rgba(16, 185, 129, 0.1); color: var(--success);';

    let icon = 'fa-solid fa-tasks';
    if (task.category === 'academic') icon = 'fa-solid fa-graduation-cap';
    if (task.category === 'delivery') icon = 'fa-solid fa-motorcycle';
    if (task.category === 'event') icon = 'fa-solid fa-calendar-day';
    if (task.category === 'tech') icon = 'fa-solid fa-code';
    if (task.category === 'design') icon = 'fa-solid fa-palette';
    if (task.category === 'survey') icon = 'fa-solid fa-clipboard-question';

    item.innerHTML = `
      <div class="history-item-left">
        <div class="history-item-icon" style="${bgStyle}">
          <i class="${icon}"></i>
        </div>
        <div class="history-item-info">
          <span class="history-item-title">${task.title}</span>
          <span class="history-item-date">截止：${task.deadline}</span>
        </div>
      </div>
      <div class="history-item-right">
        <span class="history-item-reward">+$${task.reward}</span>
        ${renderStatusBadge(task.status)}
      </div>
    `;

    item.addEventListener('click', () => openDetailModal(task.id));
    container.appendChild(item);
  });
}

// --- 視窗分頁路由控制 ---
function switchTab(tabId) {
  state.activeTab = tabId;

  // 更新導覽列狀態
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // 隱藏所有分頁區塊
  document.getElementById('lobby-view').style.display = 'none';
  document.getElementById('quick-match-view').style.display = 'none';
  document.getElementById('post-demo-view').style.display = 'none';
  document.getElementById('profile-view').style.display = 'none';

  // 顯示標題、搜尋框等配置
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

    // 檢查是否需要重設子分頁狀態為預設的「歷史紀錄」
    if (!state.preventProfileTabReset) {
      state.activeProfileTab = 'history';
      document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.getAttribute('data-subtab') === 'history') {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
    state.preventProfileTabReset = false; // 消耗旗標
    renderProfileSection();
  }

  closeAllModals();
}

// 快捷導覽：切換至個人資料並開啟指定子分頁（歷史紀錄/進行中工作）
function navigateToProfileTab(subtabId) {
  state.preventProfileTabReset = true; // 設下旗標，阻止 switchTab 重設子頁面
  switchTab('profile');
  
  state.activeProfileTab = subtabId;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.getAttribute('data-subtab') === subtabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  renderProfileTabsList();
}

// --- 一鍵空檔速配邏輯 ---

function resetQuickMatchUI() {
  state.matchSelectedSlots = [];
  state.matchSelectedTags = [];

  document.querySelectorAll('.calendar-cell').forEach(cell => cell.classList.remove('selected'));
  document.querySelectorAll('.match-tag-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById('quick-match-results').innerHTML = `
    <div class="empty-state" style="padding: 2rem;">
      <i class="fa-solid fa-calendar-days" style="font-size: 2.5rem;"></i>
      <h3>尚未開始速配</h3>
      <p>請在上方行事曆選取空檔時段，並點選至少一個興趣標籤，再點擊「開始空檔速配」！</p>
    </div>
  `;
}

function handleTimeSlotClick(cell) {
  const slotId = cell.getAttribute('data-slot');
  if (!slotId) return;

  const index = state.matchSelectedSlots.indexOf(slotId);
  if (index > -1) {
    state.matchSelectedSlots.splice(index, 1);
    cell.classList.remove('selected');
  } else {
    state.matchSelectedSlots.push(slotId);
    cell.classList.add('selected');
  }
}

function handleMatchTagClick(btn) {
  const tag = btn.getAttribute('data-tag');
  if (!tag) return;

  const index = state.matchSelectedTags.indexOf(tag);
  if (index > -1) {
    state.matchSelectedTags.splice(index, 1);
    btn.classList.remove('active');
  } else {
    state.matchSelectedTags.push(tag);
    btn.classList.add('active');
  }
}

function runQuickMatch() {
  const resultsContainer = document.getElementById('quick-match-results');
  resultsContainer.innerHTML = '';

  const slots = state.matchSelectedSlots;
  const tags = state.matchSelectedTags;

  if (slots.length === 0 && tags.length === 0) {
    showToast("請至少選取一個空檔時段或標籤按鈕！", "warning");
    resultsContainer.innerHTML = `
      <div class="empty-state" style="padding: 2rem;">
        <i class="fa-solid fa-circle-exclamation" style="font-size: 2.5rem; color: var(--warning);"></i>
        <h3>缺少配對條件</h3>
        <p>請選取上方行事曆空檔或興趣類型標籤，以進行任務速配。</p>
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

    return matchSlot && matchTag;
  });

  if (matched.length === 0) {
    resultsContainer.innerHTML = `
      <div class="empty-state" style="padding: 3rem 1rem;">
        <i class="fa-solid fa-heart-crack" style="font-size: 3rem; color: var(--text-muted);"></i>
        <h3>糟糕，目前沒有完全符合的速配任務</h3>
        <p>可以試著勾選更多時間空檔、選擇其他興趣標籤，或是稍後再試試看！</p>
      </div>
    `;
    return;
  }

  const resultsGrid = document.createElement('div');
  resultsGrid.className = 'tasks-grid';
  resultsGrid.style.width = '100%';

  matched.forEach(task => {
    resultsGrid.appendChild(createTaskCard(task));
  });

  resultsContainer.appendChild(resultsGrid);
  showToast(`成功配對出 ${matched.length} 筆最適合您的任務！`, "success");
}

// --- 發布任務 (Demo) 邏輯 ---

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
    timeSlots: ["Mon-afternoon", "Tue-afternoon", "Wed-afternoon", "Sat-afternoon"]
  };

  state.tasks.unshift(newDemoTask);
  saveStateToStorage();

  showToast("模擬發布成功！已自動置頂於任務大廳。", "success");

  setTimeout(() => {
    switchTab('lobby');
  }, 500);
}

// --- 任務詳情彈窗處理 ---

function openDetailModal(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  state.selectedTask = task;
  const overlay = document.getElementById('detail-modal');
  
  document.getElementById('detail-title').innerText = task.title;
  document.getElementById('detail-category-badge').className = `task-category-badge ${task.category}`;
  document.getElementById('detail-category-badge').innerHTML = `<i class="fa-solid fa-tag"></i> ${task.categoryLabel}`;
  document.getElementById('detail-reward').innerText = `$${task.reward}`;
  document.getElementById('detail-school').innerText = task.university;
  document.getElementById('detail-est-time').innerText = task.estTime;
  document.getElementById('detail-deadline').innerText = task.deadline;
  document.getElementById('detail-desc').innerText = task.description;
  document.getElementById('detail-poster-avatar').src = task.posterAvatar;
  document.getElementById('detail-poster-name').innerText = task.posterName;

  const actionContainer = document.getElementById('detail-action-container');
  actionContainer.innerHTML = '';

  if (task.status === 'available') {
    actionContainer.innerHTML = `
      <button class="btn btn-primary" onclick="handleAcceptTask(${task.id})">
        <i class="fa-solid fa-hand-holding-hand"></i> 接受此任務
      </button>
    `;
  } else if (task.status === 'ongoing') {
    actionContainer.innerHTML = `
      <button class="btn btn-warning" onclick="handleSubmitTask(${task.id})" style="color: black;">
        <i class="fa-solid fa-paper-plane"></i> 提交工作成果
      </button>
    `;
  } else if (task.status === 'submitted') {
    actionContainer.innerHTML = `
      <div style="display: flex; gap: 0.75rem; width: 100%;">
        <button class="btn btn-outline" style="flex: 1; cursor: not-allowed;" disabled>
          <i class="fa-solid fa-spinner fa-spin"></i> 等待發佈者審核中...
        </button>
        <button class="btn btn-primary" onclick="handleSimulateComplete(${task.id})" style="background: linear-gradient(135deg, var(--success), #059669); box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">
          <i class="fa-solid fa-user-check"></i> 模擬案主審核通過
        </button>
      </div>
    `;
  } else if (task.status === 'completed') {
    actionContainer.innerHTML = `
      <button class="btn btn-outline" style="color: var(--success); border-color: var(--success); flex-grow: 1; justify-content: center; cursor: default;" onclick="event.stopPropagation()">
        <i class="fa-solid fa-circle-check"></i> 任務已完成，款項已撥付
      </button>
    `;
  }

  overlay.classList.add('open');
}

function handleAcceptTask(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.status = 'ongoing';
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

  task.status = 'completed';
  state.user.earnings += task.reward;
  state.user.completedCount += 1;
  saveStateToStorage();

  renderStats();
  renderSidebarBrief();
  if (state.activeTab === 'profile') renderProfileSection();

  closeAllModals();
  showToast(`案主已核准！$${task.reward} 已撥入您的帳戶！`, 'success');
}

// --- 個人檔案編輯與設定 ---

function openEditProfileModal() {
  const overlay = document.getElementById('edit-profile-modal');
  
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
    option.className = `avatar-select-option ${isSelected ? 'selected' : ''}`;
    option.innerHTML = `<img src="${avatarUrl}" alt="Avatar">`;
    option.addEventListener('click', () => {
      document.querySelectorAll('.avatar-select-option').forEach(el => el.classList.remove('selected'));
      option.classList.add('selected');
      option.setAttribute('data-url', avatarUrl);
    });
    if (isSelected) {
      option.setAttribute('data-url', avatarUrl);
    }
    avatarGrid.appendChild(option);
  });

  overlay.classList.add('open');
}

function handleSaveProfile(e) {
  e.preventDefault();

  const selectedAvatarEl = document.querySelector('.avatar-select-option.selected');
  const avatarUrl = selectedAvatarEl ? selectedAvatarEl.getAttribute('data-url') : state.user.avatar;

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

// --- 通用與資料儲存 ---

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.classList.remove('open');
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
  toast.className = `toast ${type}`;
  
  let icon = 'fa-solid fa-info-circle';
  if (type === 'success') icon = 'fa-solid fa-circle-check';
  if (type === 'warning') icon = 'fa-solid fa-circle-exclamation';
  if (type === 'danger') icon = 'fa-solid fa-circle-xmark';

  toast.innerHTML = `
    <i class="${icon} toast-icon"></i>
    <div class="toast-content">${message}</div>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 4000);
}

// --- 事件處理與監聽 ---
function bindEvents() {
  // 1. 導覽列點擊
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      if (tabId) switchTab(tabId);
    });
  });

  // 2. 搜尋輸入框監聽
  const searchInput = document.getElementById('task-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.filters.keyword = e.target.value.trim();
      renderTasksList();
    });
  }

  // 3. 分類標籤點擊
  document.querySelectorAll('.category-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      document.querySelectorAll('.category-tag').forEach(el => el.classList.remove('active'));
      tag.classList.add('active');
      state.filters.category = tag.getAttribute('data-category');
      renderTasksList();
    });
  });

  // 4. 滑動金額拉條
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

  // 5. 學校篩選與排序下拉框
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

  // 6. 個人資料分頁標籤 (已完成 / 進行中) - 採用直接綁定與更穩健的事件判定
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeProfileTab = btn.getAttribute('data-subtab');
      renderProfileTabsList();
    });
  });

  // 7. 一鍵空檔速配：時間格與標籤多選綁定
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

  // 8. 發布任務 (Demo) 提交
  const demoPublishForm = document.getElementById('demo-publish-form');
  if (demoPublishForm) {
    demoPublishForm.addEventListener('submit', handleDemoPublish);
  }

  // 9. 登入/註冊表單事件與分頁切換
  const switchRegBtn = document.getElementById('switch-to-register');
  if (switchRegBtn) switchRegBtn.addEventListener('click', showRegisterForm);

  const switchLogBtn = document.getElementById('switch-to-login');
  if (switchLogBtn) switchLogBtn.addEventListener('click', showLoginForm);

  const loginForm = document.getElementById('email-login-form');
  if (loginForm) loginForm.addEventListener('submit', performLogin);

  const registerForm = document.getElementById('student-register-form');
  if (registerForm) registerForm.addEventListener('submit', performRegister);

  const guestBtn = document.getElementById('guest-login-btn');
  if (guestBtn) guestBtn.addEventListener('click', quickGuestLogin);

  const sidebarLogoutBtn = document.getElementById('sidebar-logout-item');
  if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', handleLogout);

  const profileLogoutBtn = document.getElementById('profile-logout-btn');
  if (profileLogoutBtn) profileLogoutBtn.addEventListener('click', handleLogout);

  // 10. 彈窗背景與關閉按鈕點擊
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAllModals();
    });
  });

  document.querySelectorAll('.modal-close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => closeAllModals());
  });

  // 11. 個人資料儲存
  const editProfileForm = document.getElementById('edit-profile-form');
  if (editProfileForm) {
    editProfileForm.addEventListener('submit', handleSaveProfile);
  }
}

document.addEventListener('DOMContentLoaded', initApp);
