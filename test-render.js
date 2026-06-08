const fs = require('fs');
const path = require('path');

// Mock a browser environment
const { JSDOM } = require('jsdom');
const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const dom = new JSDOM(htmlContent, { runScripts: "dangerously" });
const { window } = dom;
const { document, localStorage } = window;

global.window = window;
global.document = document;
global.localStorage = localStorage;
global.navigator = window.navigator;

// Mock window functions or DOM APIs if needed
window.showToast = () => {};
window.scrollTo = () => {};

// Load app.js
const appJsContent = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

// We will execute the app.js script in the window context
try {
  const scriptEl = document.createElement("script");
  scriptEl.textContent = appJsContent;
  document.body.appendChild(scriptEl);
  console.log("Successfully loaded app.js!");
  
  // Simulate DomContentLoaded
  const event = new window.Event('DOMContentLoaded');
  document.dispatchEvent(event);
  console.log("Triggered DOMContentLoaded.");

  // Click on guest login button to login
  const guestBtn = document.getElementById('guest-login-btn');
  if (guestBtn) {
    guestBtn.click();
    console.log("Clicked guest login button.");
  } else {
    console.error("Guest login button not found!");
  }

  // Find a task card in the lobby and click it
  const taskCards = document.querySelectorAll('.task-card');
  console.log(`Found ${taskCards.length} task cards in the lobby.`);
  if (taskCards.length > 0) {
    // Click the first task card
    taskCards[0].click();
    console.log("Clicked the first task card.");

    // The detail modal should now be open
    const detailModal = document.getElementById('detail-modal');
    console.log(`Detail modal is open: ${detailModal.classList.contains('open')}`);

    // Click the accept button in the detail modal
    const acceptBtn = detailModal.querySelector('button.btn-primary');
    if (acceptBtn) {
      acceptBtn.click();
      console.log("Clicked accept task button.");
    } else {
      console.error("Accept button not found in detail modal!");
    }
  }

  // Check stats
  const activeStat = document.getElementById('stat-active').innerText;
  console.log(`Ongoing tasks count in stats: ${activeStat}`);

  // Navigate to profile tab using navigateToProfileTab('active')
  window.navigateToProfileTab('active');
  console.log("Navigated to Profile active tab.");

  // Check what is rendered in profile-history-container
  const container = document.getElementById('profile-history-container');
  console.log("Profile active tab container innerHTML:");
  console.log(container.innerHTML);

  // Check if there are any history-items rendered
  const items = container.querySelectorAll('.history-item');
  console.log(`Found ${items.length} items in '進行中工作'.`);

} catch (err) {
  console.error("Error occurred during execution:", err);
}
