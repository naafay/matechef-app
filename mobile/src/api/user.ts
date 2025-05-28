// mobile/src/api/user.ts
// Helpers to add/remove a chef from the current user's favorites

import { API_BASE_URL } from './config';
import { getAuthHeaders } from './authHeaders';

export async function addFavorite(chefId: number): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/users/me/favorites/${chefId}`, {
    method: 'POST',
    headers,
  });
  if (!res.ok) {
    throw new Error(`Failed to favorite chef: ${res.status}`);
  }
}

export async function removeFavorite(chefId: number): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/users/me/favorites/${chefId}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) {
    throw new Error(`Failed to unfavorite chef: ${res.status}`);
  }
}
