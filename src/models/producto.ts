
export interface Producto {
  id?: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  descripcion: string;
  imagenUrl: string;
  estado: string;
  fechaCreacion?: string;
}