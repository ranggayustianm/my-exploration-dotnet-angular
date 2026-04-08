import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  const user = authService.currentUser();
  const token = user?.token;

  // Clone the request and add the auth header if token exists
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle response and catch errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMsg = 'An unexpected error occurred';

      if (error.status === 401) {
        errorMsg = 'Session expired. Please login again.';
        authService.logout();
      } else if (error.status === 403) {
        errorMsg = 'You do not have permission to access this resource.';
      } else if (error.status === 500) {
        errorMsg = 'Server error. Please try again later.';
      } else if (error.error?.message) {
        errorMsg = error.error.message;
      }

      toastService.showError(errorMsg);
      return throwError(() => error);
    })
  );
};
