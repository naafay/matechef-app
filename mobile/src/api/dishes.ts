// mobile/src/api/dishes.ts
// Fetch all dishes (optionally filtered), always including your JWT

import { API_BASE_URL } from './config';
import { getAuthHeaders } from './authHeaders';

export interface Dish {
  id: number;
  chef_id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
}

// No trailing slash on `/dishes`
export async function getDishes(filter?: string): Promise<Dish[]> {
  const headers = await getAuthHeaders();
  let url = `${API_BASE_URL}/dishes`;
  if (filter) {
    url += `?filter=${encodeURIComponent(filter)}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Failed to fetch dishes: ${res.status} ${res.statusText}`);
  }
  return await res.json();
}
