import axios from 'axios';

export function fetchQuestions(level) {
  return axios.get('/quiz/questions/', { params: { level } });
}

export function submitAnswers(level, answers) {
  return axios.post('/quiz/submit/', { level, answers });
}
