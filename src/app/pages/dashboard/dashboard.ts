import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../sidebar/sidebar';
import { Productos } from '../productos/productos';
import { ProductoService } from '../../../services/producto';
import { Producto } from '../../../models/producto';

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  estado: 'Activo' | 'Inactiva';
  cantidad: number;
  stockTotal: number;
  local?: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar, Productos],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  selectedPage: 'dashboard' | 'productos' | 'categorias' = 'dashboard';
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];
  categoriaBusqueda = '';
  categoriaEstadoFiltro = '';
  modalCategoriaVisible = false;
  categoriaEditando: Categoria | null = null;
  categoriaForm: { id?: string; nombre: string; descripcion: string; estado: 'Activo' | 'Inactiva' } = {
    nombre: '',
    descripcion: '',
    estado: 'Activo'
  };
  totalProductos = 0;
  totalStock = 0;
  totalActivos = 0;
  totalInactivos = 0;

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.loadMetrics();
  }

  changePage(page: 'dashboard' | 'productos' | 'categorias') {
    this.selectedPage = page;
    if (page !== 'productos') {
      this.loadMetrics();
    }
  }

  loadMetrics() {
    this.productoService.listar().subscribe({
      next: (data: Producto[]) => {
        this.productos = data;
        this.totalProductos = data.length;
        this.totalStock = data.reduce((sum: number, item: Producto) => sum + Number(item.stock || 0), 0);
        this.totalActivos = data.filter(item => item.estado.toLowerCase() === 'activo').length;
        this.totalInactivos = data.filter(item => item.estado.toLowerCase() === 'inactivo').length;

        const descripcionMap = new Map<string, string>([
          ['Tecnología', 'Computadoras, periféricos y gadgets'],
          ['Accesorios', 'Mouses, teclados, cables, etc.'],
          ['Audio', 'Audífonos, parlantes y micrófonos'],
          ['Hogar Digital', 'Dispositivos inteligentes y domótica'],
          ['Videojuegos', 'Consolas, juegos y accesorios de gaming']
        ]);

        const agrupadas = new Map<string, { cantidad: number; stockTotal: number; activos: number; inactivos: number }>();
        data.forEach((item: Producto) => {
          const key = item.categoria || 'Sin categoría';
          const actual = agrupadas.get(key) || { cantidad: 0, stockTotal: 0, activos: 0, inactivos: 0 };
          agrupadas.set(key, {
            cantidad: actual.cantidad + 1,
            stockTotal: actual.stockTotal + Number(item.stock || 0),
            activos: actual.activos + (item.estado.toLowerCase() === 'activo' ? 1 : 0),
            inactivos: actual.inactivos + (item.estado.toLowerCase() === 'inactivo' ? 1 : 0)
          });
        });

        this.categorias = Array.from(agrupadas.entries()).map(([nombre, datos], index) => ({
          id: `CAT-${(index + 1).toString().padStart(3, '0')}`,
          nombre,
          descripcion: descripcionMap.get(nombre) || `Productos de la categoría ${nombre}`,
          estado: datos.activos >= datos.inactivos ? 'Activo' : 'Inactiva',
          cantidad: datos.cantidad,
          stockTotal: datos.stockTotal
        }));

        this.categoriasFiltradas = [...this.categorias];
      }
    });
  }

  buscarCategorias() {
    const busqueda = this.categoriaBusqueda.trim().toLowerCase();
    this.categoriasFiltradas = this.categorias.filter(item => {
      const matchNombre = !busqueda || item.nombre.toLowerCase().includes(busqueda);
      const matchEstado = !this.categoriaEstadoFiltro || item.estado === this.categoriaEstadoFiltro;
      return matchNombre && matchEstado;
    });
  }

  limpiarFiltroCategorias() {
    this.categoriaBusqueda = '';
    this.categoriaEstadoFiltro = '';
    this.categoriasFiltradas = [...this.categorias];
  }

  abrirModalCategoria() {
    this.categoriaEditando = null;
    this.categoriaForm = {
      nombre: '',
      descripcion: '',
      estado: 'Activo'
    };
    this.modalCategoriaVisible = true;
  }

  editarCategoria(item: Categoria) {
    this.categoriaEditando = item;
    this.categoriaForm = {
      id: item.id,
      nombre: item.nombre,
      descripcion: item.descripcion,
      estado: item.estado
    };
    this.modalCategoriaVisible = true;
  }

  guardarCategoria() {
    const nombre = this.categoriaForm.nombre.trim();
    if (!nombre) {
      alert('El nombre de la categoría es obligatorio.');
      return;
    }

    if (this.categoriaEditando) {
      const viejoNombre = this.categoriaEditando.nombre;
      this.categoriaEditando.nombre = nombre;
      this.categoriaEditando.descripcion = this.categoriaForm.descripcion.trim();
      this.categoriaEditando.estado = this.categoriaForm.estado;

      if (viejoNombre !== nombre) {
        this.productos = this.productos.map(producto => {
          if (producto.categoria === viejoNombre) {
            return { ...producto, categoria: nombre };
          }
          return producto;
        });
      }
    } else {
      const nuevaCategoria: Categoria = {
        id: `CAT-${(this.categorias.length + 1).toString().padStart(3, '0')}`,
        nombre,
        descripcion: this.categoriaForm.descripcion.trim() || `Productos de la categoría ${nombre}`,
        estado: this.categoriaForm.estado,
        cantidad: 0,
        stockTotal: 0,
        local: true
      };
      this.categorias.unshift(nuevaCategoria);
    }

    this.buscarCategorias();
    this.cerrarModalCategoria();
  }

  eliminarCategoria(item: Categoria) {
    const confirmacion = confirm(`¿Eliminar la categoría "${item.nombre}"? Esta acción dejará los productos asociados sin categoría.`);
    if (!confirmacion) {
      return;
    }

    this.productos = this.productos.map(producto => {
      if (producto.categoria === item.nombre) {
        return { ...producto, categoria: 'Sin categoría' };
      }
      return producto;
    });

    this.categorias = this.categorias.filter(categoria => categoria.id !== item.id);
    this.buscarCategorias();
  }

  cerrarModalCategoria() {
    this.modalCategoriaVisible = false;
  }
}