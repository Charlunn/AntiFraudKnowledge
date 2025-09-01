import api from './http';

export function fetchQuestions(level) {
  return api.get('/quiz/questions/', { params: { level } });
}

export function submitAnswers(level, answers) {
  return api.post('/quiz/submit/', { level, answers });
}
