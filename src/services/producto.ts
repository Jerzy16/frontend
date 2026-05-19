import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listar(): Observable<Producto[]>{
    return this.http.get<Producto[]>(this.apiUrl);
  }

  obtener(id:string): Observable<Producto>{
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  crear(producto:Producto): Observable<Producto>{
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  actualizar(id:string, producto:Producto): Observable<Producto>{
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto);
  }

  eliminar(id:string): Observable<any>{
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}