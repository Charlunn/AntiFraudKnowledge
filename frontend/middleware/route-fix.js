export default defineNuxtRouteMiddleware((to, from) => {
  // 忽略/@vite/client路径的路由警告
  if (to.path === '/@vite/client') {
    return abortNavigation();
  }
  return;
});