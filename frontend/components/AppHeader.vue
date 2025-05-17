<template>
  <header class="app-header">
    <div class="container">
      <h1>My Application</h1>
      <nav class="app-nav">
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
// Script setup is empty for this simple header
</script>

<style scoped>
.app-header {
  background-color: #f0f0f0; /* Placeholder background color */
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
}

nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
}

nav li {
  margin-left: 1rem;
}

nav a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
}

.app-nav ul {
  display: flex;
}
</style>