<template>
  <div class="flex flex-col h-[calc(100vh-64px)]">
    <div class="container mx-auto px-6 py-8 flex-1 flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold text-white">Anti-Fraud Knowledge Graph</h2>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-400">Filter by:</span>
          <select class="form-select bg-gray-800 border border-gray-700 text-white rounded-lg text-sm focus:ring-primary-color focus:border-primary-color">
            <option>All Techniques</option>
            <option>Phishing</option>
            <option>Social Engineering</option>
            <option>Malware</option>
          </select>
        </div>
      </div>
      <div class="flex-1 bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl shadow-black/20 overflow-hidden relative">
        <div class="w-full h-full relative" id="graph-container">
          <!-- Render nodes dynamically -->
          <div
            v-for="(node, index) in filteredNodes"
            :key="node.id"
            class="node"
            :style="getNodeStyle(index)"
          >
            {{ node.name }}
          </div>
        </div>
        <div class="absolute top-6 left-6 z-10">
          <label class="flex items-center bg-gray-900 rounded-full shadow-lg border border-gray-700">
            <input v-model="searchTerm" class="bg-transparent border-none text-white placeholder:text-gray-500 focus:ring-0 w-64 py-2 px-4" placeholder="Search nodes..." type="text"/>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getInitialGraph } from '~/api/graph.js';

definePageMeta({
  middleware: 'auth'
});

const nodes = ref([]);
const searchTerm = ref('');

onMounted(async () => {
  try {
    const response = await getInitialGraph();
    nodes.value = response.data.nodes;
  } catch (error) {
    console.error('Failed to fetch initial graph data:', error);
  }
});

const filteredNodes = computed(() => {
  if (!searchTerm.value) {
    return nodes.value;
  }
  return nodes.value.filter(node =>
    node.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const getNodeStyle = (index) => {
  const total = filteredNodes.value.length;
  if (total === 0) return {};
  const angle = (index / total) * 2 * Math.PI;
  const radius = 35; // percentage of container
  const containerSize = 500; // approximation of container size in pixels
  const x = 50 + radius * Math.cos(angle);
  const y = 50 + radius * Math.sin(angle);
  return {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    transform: 'translate(-50%, -50%)',
  };
};

</script>

<style scoped>
:root {
  --primary-color: #38e07b;
  --secondary-color: #2a9d8f;
}
.node {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 50%;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #111827;
  font-weight: bold;
  font-size: 12px;
  box-shadow: 0 0 15px rgba(56, 224, 123, 0.3);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  padding: 8px;
}
.node:hover {
  transform: scale(1.1) translate(-45%, -45%);
  box-shadow: 0 0 25px rgba(56, 224, 123, 0.5);
}
.focus\:ring-primary-color:focus {
  --tw-ring-color: var(--primary-color);
}
</style>
