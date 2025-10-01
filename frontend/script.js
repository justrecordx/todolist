// API 기본 URL 설정
const API_BASE_URL = 'http://localhost:8000/api';

// DOM 요소 가져오기
const todoTitleInput = document.getElementById('todoTitle');
const todoDescriptionInput = document.getElementById('todoDescription');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const loadingSpinner = document.getElementById('loadingSpinner');
const notification = document.getElementById('notification');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

// 통계 요소
const totalCount = document.getElementById('totalCount');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');

// 필터 버튼
const filterButtons = document.querySelectorAll('.filter-btn');

// 전역 상태
let todos = [];
let currentFilter = 'all';

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('TodoList 앱 초기화...');
    loadTodos();
    setupEventListeners();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 할 일 추가
    addBtn.addEventListener('click', handleAddTodo);
    todoTitleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddTodo();
    });
    todoDescriptionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddTodo();
    });

    // 완료된 항목 삭제
    clearCompletedBtn.addEventListener('click', handleClearCompleted);

    // 전체 삭제
    clearAllBtn.addEventListener('click', handleClearAll);

    // 필터 버튼
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTodos();
        });
    });
}

// API 호출 함수들
async function apiCall(endpoint, method = 'GET', data = null) {
    showLoading();
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API 호출 오류:', error);
        showNotification('오류가 발생했습니다: ' + error.message, 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

// 모든 할 일 불러오기
async function loadTodos() {
    try {
        todos = await apiCall('/todos');
        renderTodos();
        updateStats();
    } catch (error) {
        console.error('할 일 목록 불러오기 실패:', error);
    }
}

// 할 일 추가
async function handleAddTodo() {
    const title = todoTitleInput.value.trim();
    const description = todoDescriptionInput.value.trim();

    if (!title) {
        showNotification('할 일 제목을 입력해주세요!', 'error');
        todoTitleInput.focus();
        return;
    }

    try {
        const newTodo = await apiCall('/todos', 'POST', {
            title,
            description,
            completed: false
        });

        todos.push(newTodo);
        renderTodos();
        updateStats();

        // 입력 필드 초기화
        todoTitleInput.value = '';
        todoDescriptionInput.value = '';
        todoTitleInput.focus();

        showNotification('할 일이 추가되었습니다! ✅');
    } catch (error) {
        console.error('할 일 추가 실패:', error);
    }
}

// 할 일 토글 (완료/미완료)
async function handleToggleTodo(id) {
    try {
        const updatedTodo = await apiCall(`/todos/${id}/toggle`, 'PATCH');
        
        const index = todos.findIndex(t => t.id === id);
        if (index !== -1) {
            todos[index] = updatedTodo;
            renderTodos();
            updateStats();
        }
    } catch (error) {
        console.error('할 일 토글 실패:', error);
    }
}

// 할 일 삭제
async function handleDeleteTodo(id) {
    if (!confirm('정말 이 할 일을 삭제하시겠습니까?')) {
        return;
    }

    try {
        await apiCall(`/todos/${id}`, 'DELETE');
        
        todos = todos.filter(t => t.id !== id);
        renderTodos();
        updateStats();

        showNotification('할 일이 삭제되었습니다! 🗑️');
    } catch (error) {
        console.error('할 일 삭제 실패:', error);
    }
}

// 할 일 수정
async function handleEditTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const newTitle = prompt('새로운 제목을 입력하세요:', todo.title);
    if (newTitle === null || newTitle.trim() === '') return;

    const newDescription = prompt('새로운 설명을 입력하세요:', todo.description || '');

    try {
        const updatedTodo = await apiCall(`/todos/${id}`, 'PUT', {
            title: newTitle.trim(),
            description: newDescription ? newDescription.trim() : '',
            completed: todo.completed
        });

        const index = todos.findIndex(t => t.id === id);
        if (index !== -1) {
            todos[index] = updatedTodo;
            renderTodos();
        }

        showNotification('할 일이 수정되었습니다! ✏️');
    } catch (error) {
        console.error('할 일 수정 실패:', error);
    }
}

// 완료된 항목 삭제
async function handleClearCompleted() {
    const completedTodos = todos.filter(t => t.completed);
    
    if (completedTodos.length === 0) {
        showNotification('완료된 항목이 없습니다.', 'error');
        return;
    }

    if (!confirm(`완료된 ${completedTodos.length}개의 항목을 삭제하시겠습니까?`)) {
        return;
    }

    try {
        // 각 완료된 항목 삭제
        for (const todo of completedTodos) {
            await apiCall(`/todos/${todo.id}`, 'DELETE');
        }

        todos = todos.filter(t => !t.completed);
        renderTodos();
        updateStats();

        showNotification(`${completedTodos.length}개의 완료된 항목이 삭제되었습니다! 🧹`);
    } catch (error) {
        console.error('완료된 항목 삭제 실패:', error);
    }
}

// 전체 삭제
async function handleClearAll() {
    if (todos.length === 0) {
        showNotification('삭제할 항목이 없습니다.', 'error');
        return;
    }

    if (!confirm(`모든 ${todos.length}개의 할 일을 삭제하시겠습니까?`)) {
        return;
    }

    try {
        await apiCall('/todos', 'DELETE');
        
        todos = [];
        renderTodos();
        updateStats();

        showNotification('모든 할 일이 삭제되었습니다! 🧹');
    } catch (error) {
        console.error('전체 삭제 실패:', error);
    }
}

// 할 일 목록 렌더링
function renderTodos() {
    // 필터링
    let filteredTodos = todos;
    if (currentFilter === 'active') {
        filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(t => t.completed);
    }

    // 빈 상태 처리
    if (filteredTodos.length === 0) {
        todoList.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    // 할 일 목록 렌더링
    todoList.innerHTML = filteredTodos.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="handleToggleTodo(${todo.id})"
            >
            <div class="todo-content" onclick="handleToggleTodo(${todo.id})">
                <div class="todo-title">${escapeHtml(todo.title)}</div>
                ${todo.description ? `<div class="todo-description">${escapeHtml(todo.description)}</div>` : ''}
                ${todo.created_at ? `<div class="todo-meta">생성: ${formatDate(todo.created_at)}</div>` : ''}
            </div>
            <div class="todo-actions">
                <button class="action-btn edit-btn" onclick="handleEditTodo(${todo.id})" title="수정">
                    ✏️
                </button>
                <button class="action-btn delete-btn" onclick="handleDeleteTodo(${todo.id})" title="삭제">
                    🗑️
                </button>
            </div>
        </li>
    `).join('');
}

// 통계 업데이트
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;

    totalCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;
}

// 유틸리티 함수들
function showLoading() {
    loadingSpinner.classList.remove('hidden');
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type === 'error' ? 'error' : ''}`;
    notification.classList.remove('hidden');

    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // 1분 미만
    if (diff < 60000) {
        return '방금 전';
    }
    // 1시간 미만
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes}분 전`;
    }
    // 24시간 미만
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}시간 전`;
    }
    
    // 그 외에는 날짜 표시
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

