import api from './http';

export function fetchAchievements() {
  return api.get('/achievements/');
}

export function grantAchievement(achievement_id) {
  return api.post('/achievements/grant/', { achievement_id });
}
