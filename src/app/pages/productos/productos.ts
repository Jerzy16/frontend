import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Producto } from '../../../models/producto';
import { ProductoService } from '../../../services/producto';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports:[CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css']
})
export class Productos implements OnInit {

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];

  loading:boolean = false;

  mostrarModal:boolean = false;
  mostrarFiltros:boolean = false;

  editando:boolean = false;

  producto: Producto = {
    nombre:'',
    categoria:'',
    precio:0,
    stock:0,
    descripcion:'',
    imagenUrl:'',
    estado:'Activo'
  };

  busqueda:string='';
  filtroCategoria:string='';
  filtroEstado:string='';
  categorias:string[] = [];
  estados:string[] = ['Activo','Inactivo'];

  constructor(private productoService:ProductoService, private cdr:ChangeDetectorRef){}

  ngOnInit(): void {
    this.listar();
  }

  listar(){

    this.loading=true;

    this.productoService.listar().subscribe({
      next:(data)=>{

        this.refreshProductos(data);

        this.loading=false;
      },
      error:()=>{

        this.loading=false;

        Swal.fire(
          'Error',
          'No se pudo cargar productos',
          'error'
        )
      }
    })
  }

  buscar(){
    this.aplicarFiltros();
  }

  toggleFiltros(){
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  aplicarFiltros(){
    const busqueda = this.busqueda.trim().toLowerCase();

    this.productosFiltrados = this.productos.filter(p => {
      const matchNombre = !busqueda || p.nombre.toLowerCase().includes(busqueda);
      const matchCategoria = !this.filtroCategoria || p.categoria === this.filtroCategoria;
      const matchEstado = !this.filtroEstado || p.estado === this.filtroEstado;
      return matchNombre && matchCategoria && matchEstado;
    });
  }

  refreshProductos(data: Producto[]) {
    this.productos = data;
    this.categorias = [...new Set(data.map(p => p.categoria).filter(Boolean))].sort();
    this.aplicarFiltros();
    this.cdr.detectChanges();
  }
  
  limpiarFiltros(){
    this.busqueda = '';
    this.filtroCategoria = '';
    this.filtroEstado = '';
    this.aplicarFiltros();
  }

  abrirModal(){

    this.editando=false;

    this.producto={
      nombre:'',
      categoria:'',
      precio:0,
      stock:0,
      descripcion:'',
      imagenUrl:'',
      estado:'Activo'
    }

    this.mostrarModal=true;
  }

  resetProducto() {
    this.producto = {
      nombre: '',
      categoria: '',
      precio: 0,
      stock: 0,
      descripcion: '',
      imagenUrl: '',
      estado: 'Activo'
    };
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.editando = false;
    this.resetProducto();
  }

  editar(producto:Producto){

    this.editando=true;

    this.producto={...producto};

    this.mostrarModal=true;
  }

  guardar(){

    if(this.editando){

      this.productoService.actualizar(
        this.producto.id!,
        this.producto
      ).subscribe({
        next: () => {
          this.cerrarModal();
          this.listar();

          Swal.fire(
            'Actualizado',
            'Producto actualizado',
            'success'
          );
        },
        error: () => {
          Swal.fire(
            'Error',
            'No se pudo actualizar el producto',
            'error'
          );
        }
      });

    }else{

      this.productoService.crear(this.producto)
      .subscribe({
        next: () => {
          this.cerrarModal();
          this.listar();

          Swal.fire(
            'Creado',
            'Producto creado correctamente',
            'success'
          );
        },
        error: () => {
          Swal.fire(
            'Error',
            'No se pudo crear el producto',
            'error'
          );
        }
      });

    }

  }

  eliminar(id:string){

    Swal.fire({
      title:'¿Eliminar producto?',
      text:'No podrás revertir esto',
      icon:'warning',
      showCancelButton:true,
      confirmButtonText:'Eliminar'
    }).then((result)=>{

      if(result.isConfirmed){

        this.productoService.eliminar(id)
        .subscribe({
          next: () => {
            this.cerrarModal();
            this.listar();

            Swal.fire(
              'Eliminado',
              'Producto eliminado',
              'success'
            );
          },
          error: () => {
            Swal.fire(
              'Error',
              'No se pudo eliminar el producto',
              'error'
            );
          }
        });

      }

    })

  }

}