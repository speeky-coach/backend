import axios from 'axios';

const culqiClient = axios.create({
  baseURL: process.env.CULQI_API_URL,
  headers: {
    'Content-type': 'application/json',
    Authorization: 'Bearer ' + process.env.CULQI_API_PRIVATE_KEY,
  },
});

export default culqiClient;
