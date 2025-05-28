// mobile/src/api/chefs.ts
// Fetch chefs and a chef’s dishes, always including your JWT

import { API_BASE_URL } from './config';
import { getAuthHeaders } from './authHeaders';

export interface Chef {
  id: number;
  name: string;
  bio?: string;
}

// Note: No trailing slash on `/chefs`
export async function getChefs(): Promise<Chef[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/chefs`, { headers });
  if (!res.ok) {
    throw new Error(`Failed to fetch chefs: ${res.status} ${res.statusText}`);
  }
  return await res.json();
}

export interface Dish {
  id: number;
  chef_id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
}

// No trailing slash on `/chefs/{chefId}/dishes`
export async function getChefDishes(chefId: number): Promise<Dish[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/chefs/${chefId}/dishes`, { headers });
  if (!res.ok) {
    throw new Error(`Failed to fetch dishes for chef ${chefId}: ${res.status}`);
  }
  return await res.json();
}
