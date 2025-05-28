// mobile/src/api/dishes.ts
import { API_BASE_URL } from './config';

export interface Dish {
  id: number;
  name: string;
  description?: string;
  price: number;
  chef_id: number;
}

export async function getDishes(filter?: string): Promise<Dish[]> {
  // **Always** include the trailing slash here:
  let url = `${API_BASE_URL}/dishes/`;
  if (filter) {
    url += `?filter=${encodeURIComponent(filter)}`;
  }

  console.log('[getDishes] fetching', url);
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    console.error('[getDishes] error body:', text);
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}
