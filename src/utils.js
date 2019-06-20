import axios from 'axios';

export default axios.create({
  baseURL: 'http://localhost:3012/',
  timeout: 50000,
  'Content-Type': 'application/x-www-form-urlencoded',
});