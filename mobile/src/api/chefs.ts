// chefs.ts
// Fetch all chefs and fetch dishes for a specific chef

import { API_BASE_URL } from './config';
import { Dish } from './dishes';

export interface Chef {
  id: number;
  name: string;
  bio?: string;
}

/**
 * Fetches the list of all chefs.
 */
export async function getChefs(): Promise<Chef[]> {
  const res = await fetch(`${API_BASE_URL}/chefs/`);
  if (!res.ok) {
    throw new Error(`Failed to fetch chefs: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fetches dishes belonging to a given chef.
 * 
 * @param chefId ID of the chef
 */
export async function getChefDishes(chefId: number): Promise<Dish[]> {
  const res = await fetch(`${API_BASE_URL}/chefs/${chefId}/dishes`);
  if (!res.ok) {
    throw new Error(`Failed to fetch dishes for chef ${chefId}: ${res.statusText}`);
  }
  return res.json();
}
