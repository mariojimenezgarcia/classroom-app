import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  const token = localStorage.getItem('token') || localStorage.getItem('jwt');

  if (!token) {
    router.navigate(['/auth/login'], { replaceUrl: true });
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;

    if (!exp) return true;

    const now = Math.floor(Date.now() / 1000);

    if (exp < now) {
      // Token expirado
      localStorage.clear();
      router.navigate(['/auth/login'], { replaceUrl: true });
      return false;
    }

    return true;

  } catch {
    localStorage.clear();
    router.navigate(['/auth/login'], { replaceUrl: true });
    return false;
  }
};