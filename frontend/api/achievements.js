import axios from 'axios';

export function fetchAchievements() {
  return axios.get('/achievements/');
}

export function grantAchievement(achievement_id) {
  return axios.post('/achievements/grant/', { achievement_id });
}
