<script setup>
import { ref, onMounted } from 'vue';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const tasks = ref([]);
const title = ref('');
const category = ref('Study');
const loading = ref(false);
const error = ref('');

async function fetchTasks() {
  loading.value = true;
  error.value = '';
  try {
    const res = await fetch(`${API_URL}/tasks`);
    tasks.value = await res.json();
  } catch (e) {
    error.value = 'Cannot connect to Backend API';
  } finally {
    loading.value = false;
  }
}

async function addTask() {
  if (!title.value.trim()) return;
  await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title.value, category: category.value })
  });
  title.value = '';
  await fetchTasks();
}

async function toggleTask(task) {
  await fetch(`${API_URL}/tasks/${task._id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: !task.completed })
  });
  await fetchTasks();
}

async function deleteTask(id) {
  await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
  await fetchTasks();
}

onMounted(fetchTasks);
</script>

<template>
  <main class="container">
    <header>
      <h1>TaskFlow Manager</h1>
      <p>Vue 3 + Node.js + MongoDB + Docker on AWS</p>
    </header>

    <form class="form" @submit.prevent="addTask">
      <input v-model="title" placeholder="Enter a new task..." required />
      <select v-model="category">
        <option>Study</option>
        <option>Work</option>
        <option>Personal</option>
      </select>
      <button type="submit">Add Task</button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="muted">Loading tasks...</p>

    <ul class="list">
      <li v-for="task in tasks" :key="task._id" :class="{ done: task.completed }">
        <div class="info" @click="toggleTask(task)">
          <input type="checkbox" :checked="task.completed" />
          <span>{{ task.title }}</span>
          <small class="badge">{{ task.category }}</small>
        </div>
        <button class="del" @click="deleteTask(task._id)">Delete</button>
      </li>
    </ul>
  </main>
</template>

<style>
* { box-sizing: border-box; font-family: system-ui, sans-serif; }
body { background: #0f172a; color: #f8fafc; margin: 0; padding: 2rem 1rem; }
.container { max-width: 640px; margin: 0 auto; background: #1e293b; padding: 2rem; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
header h1 { margin: 0 0 0.25rem; color: #38bdf8; }
header p { margin: 0 0 1.5rem; color: #94a3b8; font-size: 0.9rem; }
.form { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
input, select { padding: 0.65rem; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #fff; }
input { flex: 1; }
button { padding: 0.65rem 1.1rem; border: none; border-radius: 8px; background: #0284c7; color: #fff; font-weight: 600; cursor: pointer; }
button:hover { background: #0369a1; }
.list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem; }
.list li { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: #0f172a; border-radius: 8px; }
.info { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; }
.done span { text-decoration: line-through; color: #64748b; }
.badge { background: #334155; padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.75rem; color: #38bdf8; }
.del { background: #dc2626; padding: 0.4rem 0.75rem; font-size: 0.85rem; }
.del:hover { background: #b91c1c; }
.error { color: #f87171; }
.muted { color: #94a3b8; }
</style>
