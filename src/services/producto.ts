import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Producto } from '../models/producto';
import { environment } from '../environments/environment';

interface RawProducto {
  _id?: { $oid: string } | string;
  id?: string;
  nombre: string;
  precio: number;
}

function parseProducto(raw: RawProducto): Producto {
  const id = raw._id && typeof raw._id === 'object' ? raw._id.$oid : raw._id ?? raw.id;
  return {
    id,
    nombre: raw.nombre ?? '',
    precio: raw.precio ?? 0
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private baseUrl = environment.apiUrl + '/api/productos';

  constructor(private http: HttpClient) {}

  listar(): Observable<Producto[]> {
    return this.http.get<RawProducto[]>(this.baseUrl).pipe(
      map((items) => items.map(parseProducto))
    );
  }

  obtener(id: string): Observable<Producto> {
    return this.http.get<RawProducto>(`${this.baseUrl}/${id}`).pipe(
      map(parseProducto)
    );
  }

  crear(producto: Producto): Observable<Producto> {
    const body = { nombre: producto.nombre, precio: producto.precio };
    return this.http.post<RawProducto>(this.baseUrl, body).pipe(
      map(parseProducto)
    );
  }

  actualizar(id: string, producto: Producto): Observable<Producto> {
    const body = { nombre: producto.nombre, precio: producto.precio };
    return this.http.put<RawProducto>(`${this.baseUrl}/${id}`, body).pipe(
      map(parseProducto)
    );
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
export { Producto };

