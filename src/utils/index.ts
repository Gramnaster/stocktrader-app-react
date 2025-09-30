import axios from "axios";

const productionUrl = import.meta.env.VITE_API_URL;

export const customFetch = axios.create({
  baseURL: productionUrl,
});

customFetch.defaults.headers.common['Accept'] = '*/*';