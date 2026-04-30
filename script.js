const API = 'http://localhost:5000/api';
let token = localStorage.getItem('token');
let userName = localStorage.getItem('userName');

if (token) {
  showChat();
}

function showTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  if(tab === 'login') {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.querySelectorAll('.tab')[0].classList.add('active');
  } else {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.querySelectorAll('.tab')[1].classList.add('active');
  }
}

async function register() {
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  if(!name || !email || !password) {
    document.getElementById('authMsg').textContent = 'Please fill all fields!';
    return;
  }
  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.name);
      token = data.token;
      userName = data.name;
      showChat();
    } else {
      document.getElementById('authMsg').textContent = data.message;
    }
  } catch(err) {
    document.getElementById('authMsg').textContent = 'Server error! Is backend running?';
  }
}

async function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  if(!email || !password) {
    document.getElementById('authMsg').textContent = 'Please fill all fields!';
    return;
  }
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.name);
      token = data.token;
      userName = data.name;
      showChat();
    } else {
      document.getElementById('authMsg').textContent = data.message;
    }
  } catch(err) {
    document.getElementById('authMsg').textContent = 'Server error! Is backend running?';
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  token = null;
  userName = null;
  document.getElementById('chatPage').style.display = 'none';
  document.getElementById('authPage').style.display = 'flex';
  document.getElementById('chatBox').innerHTML = '';
}

function showChat() {
  document.getElementById('authPage').style.display = 'none';
  document.getElementById('chatPage').style.display = 'flex';
  addMessage('ai', `Hello ${userName}! I am your AI Study Assistant! Ask me anything!`);
}

async function sendMessage() {
  const input = document.getElementById('userInput');
  const message = input.value.trim();
  if (!message) return;
  addMessage('user', message);
  input.value = '';
  addMessage('ai', 'Thinking...');
  try {
    const res = await fetch(`${API}/auth/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    const chatBox = document.getElementById('chatBox');
    chatBox.lastElementChild.textContent = data.reply;
  } catch (error) {
    const chatBox = document.getElementById('chatBox');
    chatBox.lastElementChild.textContent = 'Something went wrong. Try again!';
  }
}

function addMessage(type, text) {
  const chatBox = document.getElementById('chatBox');
  const div = document.createElement('div');
  div.classList.add('message', type === 'user' ? 'user-message' : 'ai-message');
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}