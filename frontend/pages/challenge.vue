<template>
  <div class="px-20 py-10">
    <div class="w-full max-w-6xl mx-auto">
      <div class="mb-12">
        <h1 class="text-4xl font-bold">Challenges</h1>
        <p class="text-gray-400 mt-2">Test your knowledge, unlock achievements, and climb the leaderboard.</p>
      </div>
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-6">Knowledge Points</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Static Knowledge Point Cards -->
          <div class="flex flex-col gap-4 group cursor-pointer">
            <div class="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-700"></div>
            <div>
              <p class="text-lg font-bold">Fraud Detection</p>
              <p class="text-gray-400 text-sm">Learn to identify and prevent fraudulent activities.</p>
            </div>
          </div>
          <div class="flex flex-col gap-4 group cursor-pointer">
            <div class="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-700"></div>
            <div>
              <p class="text-lg font-bold">Risk Assessment</p>
              <p class="text-gray-400 text-sm">Understand and evaluate potential risks.</p>
            </div>
          </div>
          <div class="flex flex-col gap-4 group cursor-pointer">
            <div class="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-700"></div>
            <div>
              <p class="text-lg font-bold">Compliance</p>
              <p class="text-gray-400 text-sm">Ensure adherence to regulatory standards.</p>
            </div>
          </div>
        </div>
      </section>
      <section>
        <h2 class="text-2xl font-bold mb-6">Leaderboard</h2>
        <div class="overflow-hidden rounded-xl border border-gray-700 bg-gray-800">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-700/50">
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rank</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Score</th>
              </tr>
            </thead>
            <tbody>
              <!-- Static Leaderboard Rows -->
              <tr class="border-t border-gray-700">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">1</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">Sophia C.</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-primary-color font-bold">1200</td>
              </tr>
              <tr class="border-t border-gray-700 bg-gray-900/20">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">2</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">Ethan L.</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-primary-color font-bold">1150</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
});
</script>

<style scoped>
:root {
  --primary-color: #38e07b;
}
.text-primary-color {
  color: var(--primary-color);
}
</style>
