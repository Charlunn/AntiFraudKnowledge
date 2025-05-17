<template>
  <footer class="app-footer">
    <div class="container">
      <p>&copy; 2023 Your App Name. All rights reserved.</p>
      <div class="footer-links"> 
        <a href="#">Privacy Policy</a> 
        <a href="#">Terms of Service</a>
      </div>
    </div>
  </footer>
</template>

<script setup>
// Footer logic if any
</script>

<style scoped>
.app-footer {
  background-color: #f0f0f0; /* Example neutral background */
  padding: 20px;
  text-align: center;
  font-size: 0.9em;
  color: #555;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.footer-links a {
  color: #555;
  text-decoration: none;
  margin-left: 15px;
}

.footer-links a:hover {
  text-decoration: underline;
}
</style>