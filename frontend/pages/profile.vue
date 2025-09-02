<template>
  <div class="px-20 py-10 lg:px-40">
    <div class="mx-auto max-w-5xl">
      <h2 class="text-4xl font-bold tracking-tight text-white mb-12">My Profile</h2>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Profile Update Form -->
          <div class="bg-gray-800 p-6 rounded-2xl gradient-border">
            <h3 class="text-xl font-semibold mb-4 text-white">Update Information</h3>
            <form @submit.prevent="handleUpdateProfile" class="space-y-4">
              <div>
                <label for="nickname" class="block text-sm font-medium text-gray-300">Nickname</label>
                <input
                  id="nickname"
                  v-model="newNickname"
                  type="text"
                  class="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color"
                />
              </div>
              <button
                type="submit"
                class="px-4 py-2 font-semibold text-gray-900 bg-primary-color rounded-md hover:bg-opacity-90 transition-colors"
              >
                Update Nickname
              </button>
              <p v-if="updateSuccess" class="text-green-400 text-sm mt-2">{{ updateSuccess }}</p>
              <p v-if="updateError" class="text-red-400 text-sm mt-2">{{ updateError }}</p>
            </form>
          </div>

          <!-- Change Password Form -->
          <div class="bg-gray-800 p-6 rounded-2xl gradient-border">
            <h3 class="text-xl font-semibold mb-4 text-white">Change Password</h3>
            <form @submit.prevent="handleChangePassword" class="space-y-4">
              <div>
                <label for="old_password" class="block text-sm font-medium text-gray-300">Old Password</label>
                <input
                  id="old_password"
                  v-model="oldPassword"
                  type="password"
                  class="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color"
                />
              </div>
              <div>
                <label for="new_password" class="block text-sm font-medium text-gray-300">New Password</label>
                <input
                  id="new_password"
                  v-model="newPassword"
                  type="password"
                  class="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color"
                />
              </div>
              <button
                type="submit"
                class="px-4 py-2 font-semibold text-gray-900 bg-primary-color rounded-md hover:bg-opacity-90 transition-colors"
              >
                Change Password
              </button>
               <p v-if="passwordSuccess" class="text-green-400 text-sm mt-2">{{ passwordSuccess }}</p>
               <p v-if="passwordError" class="text-red-400 text-sm mt-2">{{ passwordError }}</p>
            </form>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-8">
          <div class="bg-gray-800 p-6 rounded-2xl gradient-border text-center">
             <img v-if="authStore.user && authStore.user.avatar" :src="authStore.user.avatar" alt="User avatar" class="size-24 rounded-full object-cover mx-auto mb-4" />
             <div v-else class="size-24 rounded-full bg-gray-700 mx-auto mb-4"></div>
            <h3 class="text-2xl font-bold text-white">{{ authStore.user?.nickname }}</h3>
            <p class="text-sm text-gray-400 mt-1">Anti-Fraud Level: <span class="font-bold text-primary-color">Expert</span></p>
          </div>
          <div class="bg-gray-800 p-6 rounded-2xl gradient-border">
            <h3 class="text-xl font-semibold mb-4 text-white">Achievements</h3>
            <div class="space-y-4">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center badge-gradient-novice text-gray-900 font-bold">N</div>
                    <div>
                        <p class="font-bold">Novice Investigator</p>
                        <p class="text-gray-400 text-xs">Complete 5 challenges</p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center badge-gradient-star text-gray-900 font-bold">R</div>
                    <div>
                        <p class="font-bold">Rising Star</p>
                        <p class="text-gray-400 text-xs">Score 80%+ in 10 challenges</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { updateProfile, changePassword } from '~/api/auth';

definePageMeta({
  middleware: 'auth'
});

const authStore = useAuthStore();

const newNickname = ref('');
const oldPassword = ref('');
const newPassword = ref('');

const updateSuccess = ref('');
const updateError = ref('');
const passwordSuccess = ref('');
const passwordError = ref('');


onMounted(() => {
  if (authStore.user) {
    newNickname.value = authStore.user.nickname;
  }
});

const handleUpdateProfile = async () => {
  updateSuccess.value = '';
  updateError.value = '';
  try {
    const response = await updateProfile({ nickname: newNickname.value });
    authStore.setUser(response.data);
    updateSuccess.value = 'Nickname updated successfully!';
  } catch (err) {
    updateError.value = 'Failed to update nickname.';
  }
};

const handleChangePassword = async () => {
  passwordSuccess.value = '';
  passwordError.value = '';
  try {
    await changePassword({ old_password: oldPassword.value, new_password: newPassword.value });
    passwordSuccess.value = 'Password changed successfully!';
    oldPassword.value = '';
    newPassword.value = '';
  } catch (err) {
    passwordError.value = 'Failed to change password. Check your old password.';
  }
};
</script>

<style scoped>
:root {
  --primary-color: #38e07b;
}
.text-primary-color {
  color: var(--primary-color);
}
.bg-primary-color {
  background-color: var(--primary-color);
}
.focus\:ring-primary-color:focus {
  --tw-ring-color: var(--primary-color);
}
.gradient-border {
  border: 1px solid transparent;
  background-image: linear-gradient(var(--card-background, #1f2937), var(--card-background, #1f2937)),
    linear-gradient(to right, #38e07b, #2a9d8f);
  background-origin: border-box;
  background-clip: padding-box, border-box;
}
.badge-gradient-novice {
    background-image: linear-gradient(to top right, #38e07b, #4ecdc4);
}
.badge-gradient-star {
    background-image: linear-gradient(to top right, #4ecdc4, #2a9d8f);
}
</style>
