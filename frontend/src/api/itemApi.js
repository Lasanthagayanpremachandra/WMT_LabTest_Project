import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://backend-nine-flame-29.vercel.app/api",
});

export const getItems = () => API.get("/items");
export const getItemById = (id) => API.get(`/items/${id}`);
export const createItem = (itemData) => API.post("/items", itemData);
export const updateItem = (id, itemData) => API.put(`/items/${id}`, itemData);
export const deleteItem = (id) => API.delete(`/items/${id}`);

export default API;