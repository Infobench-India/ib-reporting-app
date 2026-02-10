// Fake API call simulation

import type { User } from "../../types/customTypes";

export async function fetchUserProfile(user: { id: string; name: string; role: string; }): Promise<User> {
  // Simulate API delay
  const userDetails = localStorage.getItem('selectedCompany');
  return new Promise((resolve,reject) => {
    if (!userDetails) {
      reject(new Error('No user details found in sessionStorage')); 
      return;
    }
    resolve(JSON.parse(userDetails) as User)
  })
}
