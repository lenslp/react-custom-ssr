import axios, { AxiosResponse } from 'axios';

axios.defaults.baseURL = 'http://127.0.0.1:8007/';

axios.interceptors.response.use(
  ({ data }: AxiosResponse) => {
    return data;
  },
  error => Promise.reject(error),
);
