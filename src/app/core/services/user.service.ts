import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { User } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private readonly http: HttpClient) {}

  getProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/me`);
  }

  updateProfile(id: string, data: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/users/${id}`, data);
  }
}
