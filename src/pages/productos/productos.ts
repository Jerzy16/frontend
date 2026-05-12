import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto';
import { Producto } from '../../models/producto';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css']
})
export class ProductosComponent implements OnInit {

  productos: Producto[] = [];
  producto: Producto = new Producto();

  constructor(private service: ProductoService) {}

  ngOnInit(): void {
    this.listar();
  }

  listar() {
    this.service.listar().subscribe((data: Producto[]) => {
      this.productos = data;
    });
  }

  guardar() {
    this.service.crear(this.producto).subscribe(() => {
      this.listar();
      this.resetProducto();
    });
  }

  editar(p: Producto) {
    if (p.id) {
      this.service.obtener(p.id).subscribe((producto) => {
        this.producto = { ...producto };
      });
    }
  }

  actualizar() {
    if (this.producto.id) {
      this.service.actualizar(this.producto.id, this.producto)
        .subscribe(() => {
          this.listar();
          this.resetProducto();
        });
    }
  }

  limpiar() {
    this.resetProducto();
  }

  resetProducto() {
    this.producto = new Producto();
  }

  eliminar(id: string) {
    this.service.eliminar(id).subscribe(() => {
      this.listar();
    });
  }
}
