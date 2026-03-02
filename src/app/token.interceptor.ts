import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);
  const token = localStorage.getItem('token');

  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error) => {

      if (error.status === 401) {
        // Token inválido o expirado
        localStorage.clear();
        router.navigate(['/auth/login'], { replaceUrl: true });
      }

      return throwError(() => error);
    })
  );
};
// si no hay caduca el token 


// import { HttpInterceptorFn } from '@angular/common/http';

// export const tokenInterceptor: HttpInterceptorFn = (req, next) => {

//   const token = localStorage.getItem('token');

//   if (token) {

//     const authReq = req.clone({
//       setHeaders: {
//         Authorization: `Bearer ${token}`
//       }
//     });

//     return next(authReq);
//   }

//   return next(req);
// };