// stores/statistics.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import { useRuntimeConfig } from '#imports';

export const useStatisticsStore = defineStore('statistics', () => {
  const config = useRuntimeConfig();
  const API_BASE_URL = config.public.apiBase;
  // 平台级数据
  const platformStats = ref({
    fraudTypeDistribution: [],
    tacticFrequency: [],
    emotionalTriggers: [],
    fraudFlow: { nodes: [], links: [] },
    fraudCasesYearly: []
  });
  
  // 用户级数据
  const userStats = ref({
    achievements: [],
    skills: []
  });
  
  const isLoadingPlatform = ref(false);
  const isLoadingUser = ref(false);
  const platformError = ref(null);
  const userError = ref(null);

  // 获取平台统计数据
  async function fetchPlatformStatistics() {
    console.log('开始获取平台统计数据');
    isLoadingPlatform.value = true;
    platformError.value = null;
    
    try {
      console.log('发送API请求到:', `${API_BASE_URL}/statistics/platform/`);
      const response = await axios.get(`${API_BASE_URL}/statistics/platform/`);
      console.log('API响应:', response.data);
      
      platformStats.value = {
        fraudTypeDistribution: response.data.fraud_type_distribution || [],
        tacticFrequency: response.data.tactic_frequency || [],
        emotionalTriggers: response.data.emotional_triggers || [],
        fraudFlow: response.data.fraud_flow || { nodes: [], links: [] },
        fraudCasesYearly: response.data.fraud_cases_yearly || []
      };
      
      console.log('处理后的平台统计数据:', platformStats.value);
    } catch (error) {
      console.error('获取平台统计数据失败:', error);
      platformError.value = '获取平台统计数据失败';
    } finally {
      isLoadingPlatform.value = false;
      console.log('平台统计数据加载完成，状态:', { 
        isLoading: isLoadingPlatform.value, 
        hasError: !!platformError.value 
      });
    }
  }

  // 获取用户统计数据
  async function fetchUserStatistics() {
    console.log('开始获取用户统计数据');
    isLoadingUser.value = true;
    userError.value = null;
    
    try {
      console.log('发送API请求到:', `${API_BASE_URL}/statistics/user/`);
      const response = await axios.get(`${API_BASE_URL}/statistics/user/`);
      console.log('API响应:', response.data);
      
      userStats.value = {
        achievements: response.data.achievements || [],
        skills: response.data.skills || []
      };
      
      console.log('处理后的用户统计数据:', userStats.value);
    } catch (error) {
      console.error('获取用户统计数据失败:', error);
      userError.value = '获取用户统计数据失败';
    } finally {
      isLoadingUser.value = false;
      console.log('用户统计数据加载完成，状态:', { 
        isLoading: isLoadingUser.value, 
        hasError: !!userError.value 
      });
    }
  }

  return {
    platformStats,
    userStats,
    isLoadingPlatform,
    isLoadingUser,
    platformError,
    userError,
    fetchPlatformStatistics,
    fetchUserStatistics
  };
}); 