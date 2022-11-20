import axios from 'axios';

const mercadoPagoClient = axios.create({
  baseURL: process.env.MERCADO_PAGO_API_URL,
  headers: {
    'Content-type': 'application/json',
    Authorization: 'Bearer ' + process.env.MERCADO_PAGO_API_ACCESS_TOKEN,
  },
});

export default mercadoPagoClient;
