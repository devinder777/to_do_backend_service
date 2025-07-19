console.log("Loading web page");

// Auth state management
let authState = {
	isAuthenticated: false,
	user: null,
	token: null
};

// _Todo state management
let todoState = {
	todos: [],
	currentFilter: 'all',
	isLoading: false
};

// DOM elements
const authContainer = document.getElementById('authContainer');
const homeContainer = document.getElementById('homeContainer');
const loginSection = document.getElementById('loginSection');
const signupSection = document.getElementById('signupSection');
const formTitle = document.getElementById('formTitle');
const formSubtitle = document.getElementById('formSubtitle');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const todoList = document.getElementById('todoList');
const newTodoInput = document.getElementById('newTodoInput');
const addTodoBtn = document.getElementById('addTodoBtn');

// Initialize app
function init() {
	checkAuthStatus();
	setupEventListeners();
}

// Check if user is already authenticated
function checkAuthStatus() {
	const token = localStorage.getItem('authToken');
	const userData = localStorage.getItem('userData');

	if (token && userData) {
		try {
			const user = JSON.parse(userData);
			authState = {
				isAuthenticated: true,
				user: user,
				token: token
			};
			showHomeScreen();
			loadTodos();
		} catch (error) {
			console.error('Error parsing user data:', error);
			clearAuthData();
		}
	}
}

// Setup event listeners
function setupEventListeners() {
	// Auth event listeners
	document.getElementById('showSignup').addEventListener('click', (e) => {
		e.preventDefault();
		switchToSignup();
	});

	document.getElementById('showLogin').addEventListener('click', (e) => {
		e.preventDefault();
		switchToLogin();
	});

	document.getElementById('loginForm').addEventListener('submit', handleLogin);
	document.getElementById('signupForm').addEventListener('submit', handleSignup);
	document.getElementById('logoutButton').addEventListener('click', handleLogout);

	// _Todo event listeners
	document.addEventListener('click', (e) => {
		if (e.target.classList.contains('tab')) {
			const filter = e.target.dataset.filter;
			setActiveFilter(filter);
		}
	});

	addTodoBtn.addEventListener('click', addTodo);
	newTodoInput.addEventListener('keypress', (e) => {
		if (e.key === 'Enter') {
			addTodo();
		}
	});
}

// Switch to signup form
function switchToSignup() {
	loginSection.classList.add('hidden');
	signupSection.classList.remove('hidden');
	formTitle.textContent = 'Create Account';
	formSubtitle.textContent = 'Please fill in your details to register';
	clearMessages();
}

// Switch to login form
function switchToLogin() {
	signupSection.classList.add('hidden');
	loginSection.classList.remove('hidden');
	formTitle.textContent = 'Welcome';
	formSubtitle.textContent = 'Please sign in to your account';
	clearMessages();
}

// Show message to user
function showMessage(message, type = 'error') {
	clearMessages();
	const messageEl = type === 'error' ? errorMessage : successMessage;
	messageEl.textContent = message;
	messageEl.style.display = 'block';

	setTimeout(() => {
		messageEl.style.display = 'none';
	}, 5000);
}

// Clear all messages
function clearMessages() {
	errorMessage.style.display = 'none';
	successMessage.style.display = 'none';
}

// Handle login
async function handleLogin(e) {
	e.preventDefault();

	const email = document.getElementById('loginEmail').value;
	const password = document.getElementById('loginPassword').value;

	if (!email || !password) {
		showMessage('Please fill in all fields');
		return;
	}

	setLoadingState(true);

	try {
		const response = await fetch('/auth/login', {
			method: 'POST',
			body: JSON.stringify({
				email: email,
				password: password
			}),
			headers: {
				"content-type": 'application/json'
			}
		});

		const data = await response.json();

		if (response.ok) {
			// Save auth data
			localStorage.setItem('authToken', data.token);
			localStorage.setItem('userData', JSON.stringify({
				email: email,
				userId: data.userId
			}));

			authState = {
				isAuthenticated: true,
				user: {email, userId: data.userId},
				token: data.token
			};

			showMessage('Login successful!', 'success');
			setTimeout(() => {
				showHomeScreen();
				loadTodos();
			}, 1000);
		} else {
			showMessage(response.statusText || 'Login failed');
		}
	} catch (error) {
		showMessage('Network error. Please try again.');
	} finally {
		setLoadingState(false);
	}
}

// Handle signup
async function handleSignup(e) {
	e.preventDefault();

	const email = document.getElementById('signupEmail').value;
	const password = document.getElementById('signupPassword').value;
	const confirmPassword = document.getElementById('confirmPassword').value;

	// Client-side validation
	if (!email || !password || !confirmPassword) {
		showMessage('Please fill in all fields');
		return;
	}

	if (password !== confirmPassword) {
		showMessage('Passwords do not match');
		return;
	}

	if (password.length < 6) {
		showMessage('Password must be at least 6 characters long');
		return;
	}

	setLoadingState(true);

	try {
		const response = await fetch('/auth/register', {
			method: 'POST',
			body: JSON.stringify({
				email: email,
				password: password
			}),
			headers: {
				"content-type": 'application/json'
			}
		});

		const data = await response.json();

		if (response.ok) {
			// Save auth data
			localStorage.setItem('authToken', data.token);
			localStorage.setItem('userData', JSON.stringify({
				email: email,
				userId: data.userId
			}));

			authState = {
				isAuthenticated: true,
				user: {email, userId: data.userId},
				token: data.token
			};

			showMessage('Account created successfully!', 'success');
			setTimeout(() => {
				showHomeScreen();
				loadTodos();
			}, 1000);
		} else {
			showMessage(response.statusText || 'Registration failed');
		}
	} catch (error) {
		showMessage('Network error. Please try again.');
	} finally {
		setLoadingState(false);
	}
}

// Handle logout
function handleLogout() {
	clearAuthData();
	authState = {
		isAuthenticated: false,
		user: null,
		token: null
	};
	todoState = {
		todos: [],
		currentFilter: 'all',
		isLoading: false
	};
	showAuthScreen();
	showMessage('Logged out successfully', 'success');
}

// Show home screen
function showHomeScreen() {
	authContainer.style.display = 'none';
	homeContainer.style.display = 'block';

	// Update user info
	document.getElementById('userEmail').textContent = authState.user.email;
	document.getElementById('userId').textContent = authState.user.userId;
}

// Show auth screen
function showAuthScreen() {
	homeContainer.style.display = 'none';
	authContainer.style.display = 'block';
	clearMessages();
	resetForms();
}

// Set loading state
function setLoadingState(loading) {
	const buttons = document.querySelectorAll('.auth-button');
	buttons.forEach(button => {
		button.disabled = loading;
		button.textContent = loading ? 'Please wait...' :
			(button.id === 'loginButton' ? 'Sign In' : 'Create Account');
	});

	if (loading) {
		authContainer.classList.add('loading');
	} else {
		authContainer.classList.remove('loading');
	}
}

// Clear auth data from localStorage
function clearAuthData() {
	localStorage.removeItem('authToken');
	localStorage.removeItem('userData');
}

// Reset forms
function resetForms() {
	document.getElementById('loginForm').reset();
	document.getElementById('signupForm').reset();
	switchToLogin();
}

// _TODO APP FUNCTIONS
// Load todos from API
async function loadTodos() {
	if (!authState.token) return;

	todoState.isLoading = true;
	renderTodos();

	try {
		const response = await fetch('/todos', {
			method: 'GET',
			headers: {
				'Authorization': authState.token,
				'Content-Type': 'application/json'
			}
		});

		if (response.ok) {
			const data = await response.json();
			todoState.todos = data.todos || [];
		} else if (response.status === 401) {
			showMessage('Session expired. Please log in again.');
			handleLogout();
		} else {
			showMessage('Failed to load todos');
		}
	} catch (error) {
		console.error('Error loading todos:', error);
		showMessage('Network error. Please try again.');
	} finally {
		todoState.isLoading = false;
		renderTodos();
	}
}

// Add new _todo
async function addTodo() {
	const task = newTodoInput.value.trim();

	if (!task) {
		showMessage('Please enter a task');
		return;
	}

	if (!authState.token) return;

	addTodoBtn.disabled = true;
	addTodoBtn.innerHTML = '<span class="loading-spinner"></span>';

	try {
		const response = await fetch('/todos', {
			method: 'POST',
			headers: {
				'Authorization': authState.token,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({task})
		});

		if (response.ok) {
			const newTodo = await response.json();
			todoState.todos.unshift({
				id: newTodo.id,
				task: newTodo.task,
				completed: newTodo.completed,
				user_id: authState.user.userId
			});
			newTodoInput.value = '';
			renderTodos();
			showMessage('Task added successfully!', 'success');
		} else if (response.status === 401) {
			showMessage('Session expired. Please log in again.');
			handleLogout();
		} else {
			showMessage('Failed to add task');
		}
	} catch (error) {
		console.error('Error adding todo:', error);
		showMessage('Network error. Please try again.');
	} finally {
		addTodoBtn.disabled = false;
		addTodoBtn.textContent = 'Add Task';
	}
}

// Toggle _todo completion
async function toggleTodo(id, completed, task) {
	if (!authState.token) return;

	const newCompletedState = completed ? 0 : 1;

	try {
		const response = await fetch(`/todos/${id}`, {
			method: 'PUT',
			headers: {
				'Authorization': authState.token,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				task: task,
				completed: newCompletedState === 1
			})
		});

		if (response.ok) {
			const todo = todoState.todos.find(t => t.id === id);
			if (todo) {
				todo.completed = newCompletedState;
				renderTodos();
			}
		} else if (response.status === 401) {
			showMessage('Session expired. Please log in again.');
			handleLogout();

		} else {
			showMessage('Failed to update task');
		}
	} catch (error) {
		console.error('Error updating todo:', error);
		showMessage('Network error. Please try again.');
	}
}

// Delete _todo
async function deleteTodo(id) {
	if (!authState.token) return;
	if (!confirm('Are you sure you want to delete this task?')) return;

	try {
		const response = await fetch(`/todos/${id}`, {
			method: 'DELETE',
			headers: {
				'Authorization': authState.token,
				'Content-Type': 'application/json'
			}
		});

		if (response.ok) {
			todoState.todos = todoState.todos.filter(todo => todo.id !== id);
			renderTodos();
			showMessage('Task deleted successfully!', 'success');
		} else if (response.status === 401) {
			showMessage('Session expired. Please log in again.');
			handleLogout();

		} else {
			showMessage('Failed to delete task');
		}
	} catch (error) {
		console.error('Error deleting todo:', error);
		showMessage('Network error. Please try again.');
	}
}

// Set active filter
function setActiveFilter(filter) {
	todoState.currentFilter = filter;

	// Update tab appearance
	document.querySelectorAll('.tab').forEach(tab => {
		tab.classList.remove('active');
	});
	document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

	renderTodos();
}

// Filter todos based on current filter
function getFilteredTodos() {
	switch (todoState.currentFilter) {
		case 'completed':
			return todoState.todos.filter(todo => todo.completed === 1);
		case 'open':
			return todoState.todos.filter(todo => todo.completed === 0);
		default:
			return todoState.todos;
	}
}

// Render todos
function renderTodos() {
	if (!todoList) return;

	if (todoState.isLoading) {
		todoList.innerHTML = `
            <div class="empty-state">
                <div class="loading-spinner"></div>
                <p>Loading tasks...</p>
            </div>
        `;
		return;
	}

	const filteredTodos = getFilteredTodos();

	if (filteredTodos.length === 0) {
		let emptyMessage = 'No tasks yet';
		if (todoState.currentFilter === 'completed') {
			emptyMessage = 'No completed tasks';
		} else if (todoState.currentFilter === 'open') {
			emptyMessage = 'No open tasks';
		}

		todoList.innerHTML = `
            <div class="empty-state">
                <h3>${emptyMessage}</h3>
                <p>${todoState.currentFilter === 'all' ? 'Add your first task to get started!' : ''}</p>
            </div>
        `;
		return;
	}

	todoList.innerHTML = filteredTodos.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <div class="todo-text">${escapeHtml(todo.task)}</div>
            <div class="todo-actions">
                <button class="todo-btn ${todo.completed ? 'incomplete-btn' : 'complete-btn'}"
                        onclick="toggleTodo(${todo.id}, ${todo.completed}, '${escapeHtml(todo.task)}')">
                    ${todo.completed ? 'Reopen' : 'Complete'}
                </button>
                <button class="todo-btn delete-btn" onclick="deleteTodo(${todo.id})">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
	const map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};
	return text.replace(/[&<>"']/g, function (m) {
		return map[m];
	});
}


// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);