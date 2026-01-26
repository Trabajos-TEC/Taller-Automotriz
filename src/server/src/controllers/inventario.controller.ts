import { Request, Response } from 'express';
import { InventarioModel } from '../models/inventario.model';

export const InventarioController = {
  // Obtener todos los productos del inventario
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { search } = req.query;
      const searchTerm = typeof search === 'string' ? search : undefined;
      
      const productos = await InventarioModel.getAll(searchTerm);
      
      // Transformar datos para el frontend
      const productosTransformados = productos.map(producto => ({
        id: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        categoria: producto.categoria,
        cantidad: producto.cantidad,
        cantidad_minima: producto.cantidad_minima,
        precio_compra: producto.precio_compra,
        precio_venta: producto.precio_venta,
        proveedor: producto.proveedor || '',
        vehiculos_asociados: producto.vehiculos_asociados || []
      }));

      return res.json({
        success: true,
        data: productosTransformados,
        message: 'Productos obtenidos exitosamente'
      });
    } catch (error: any) {
      console.error('Error en InventarioController.getAll:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener productos',
        error: error.message
      });
    }
  },

  // Obtener un producto por código
  async getByCodigo(req: Request, res: Response): Promise<Response> {
    try {
      const codigoParam = req.params.codigo;
      const codigo = Array.isArray(codigoParam) ? codigoParam[0] : codigoParam;
      
      if (!codigo) {
        return res.status(400).json({
          success: false,
          message: 'Código requerido'
        });
      }

      const producto = await InventarioModel.getByCodigo(codigo);
      
      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      return res.json({
        success: true,
        data: producto,
        message: 'Producto obtenido exitosamente'
      });
    } catch (error: any) {
      console.error('Error en InventarioController.getByCodigo:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener producto',
        error: error.message
      });
    }
  },

  // Verificar si un código existe
  async checkCodigo(req: Request, res: Response): Promise<Response> {
    try {
      const codigoParam = req.params.codigo;
      const codigo = Array.isArray(codigoParam) ? codigoParam[0] : codigoParam;
      
      if (!codigo) {
        return res.status(400).json({
          success: false,
          message: 'Código requerido'
        });
      }

      const resultado = await InventarioModel.checkCodigo(codigo);
      
      return res.json({
        success: true,
        data: resultado,
        message: resultado.exists ? 'Código ya existe' : 'Código disponible'
      });
    } catch (error: any) {
      console.error('Error en InventarioController.checkCodigo:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar código',
        error: error.message
      });
    }
  },

  // Crear un nuevo producto
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const {
        codigo,
        nombre,
        descripcion,
        categoria = 'Repuesto',
        cantidad = 0,
        cantidad_minima = 5,
        precio_compra,
        precio_venta,
        proveedor,
        vehiculos_ids = []  // Array de IDs de vehículos para asociar
      } = req.body;

      // Validaciones
      if (!codigo || !nombre || precio_compra === undefined || precio_venta === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Campos requeridos: codigo, nombre, precio_compra, precio_venta'
        });
      }

      if (cantidad < 0 || cantidad_minima < 0 || precio_compra < 0 || precio_venta < 0) {
        return res.status(400).json({
          success: false,
          message: 'Cantidades y precios no pueden ser negativos'
        });
      }

      // Verificar si el código ya existe
      const codigoExiste = await InventarioModel.checkCodigo(codigo);
      if (codigoExiste.exists) {
        return res.status(409).json({
          success: false,
          message: 'El código ya está registrado'
        });
      }

      // Crear el producto
      const nuevoProducto = await InventarioModel.create({
        codigo,
        nombre,
        descripcion,
        categoria,
        cantidad,
        cantidad_minima,
        precio_compra,
        precio_venta,
        proveedor
      });

      // Asociar vehículos si se proporcionaron
      if (Array.isArray(vehiculos_ids) && vehiculos_ids.length > 0) {
        for (const vehiculoId of vehiculos_ids) {
          await InventarioModel.asociarVehiculo(nuevoProducto.id, vehiculoId);
        }
      }

      // Obtener el producto con sus asociaciones
      const productoCompleto = await InventarioModel.getByCodigo(codigo);

      return res.status(201).json({
        success: true,
        data: productoCompleto,
        message: 'Producto creado exitosamente'
      });
    } catch (error: any) {
      console.error('Error en InventarioController.create:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al crear producto',
        error: error.message
      });
    }
  },

  // Actualizar un producto
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const codigoParam = req.params.codigo;
      const codigo = Array.isArray(codigoParam) ? codigoParam[0] : codigoParam;
      
      if (!codigo) {
        return res.status(400).json({
          success: false,
          message: 'Código requerido'
        });
      }

      const {
        nombre,
        descripcion,
        categoria,
        cantidad,
        cantidad_minima,
        precio_compra,
        precio_venta,
        proveedor,
        vehiculos_ids
      } = req.body;

      // Validar que haya al menos un campo para actualizar
      const campos = [
        nombre, descripcion, categoria, cantidad, 
        cantidad_minima, precio_compra, precio_venta, proveedor, vehiculos_ids
      ];
      
      if (campos.every(campo => campo === undefined)) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar al menos un campo para actualizar'
        });
      }

      // Validaciones de valores
      if (cantidad !== undefined && cantidad < 0) {
        return res.status(400).json({
          success: false,
          message: 'Cantidad no puede ser negativa'
        });
      }

      if (cantidad_minima !== undefined && cantidad_minima < 0) {
        return res.status(400).json({
          success: false,
          message: 'Cantidad mínima no puede ser negativa'
        });
      }

      if (precio_compra !== undefined && precio_compra < 0) {
        return res.status(400).json({
          success: false,
          message: 'Precio de compra no puede ser negativo'
        });
      }

      if (precio_venta !== undefined && precio_venta < 0) {
        return res.status(400).json({
          success: false,
          message: 'Precio de venta no puede ser negativo'
        });
      }

      // Actualizar el producto
      const productoActualizado = await InventarioModel.update(codigo, {
        nombre,
        descripcion,
        categoria,
        cantidad,
        cantidad_minima,
        precio_compra,
        precio_venta,
        proveedor
      });

      if (!productoActualizado) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      // Manejar asociaciones de vehículos si se proporcionan
      if (Array.isArray(vehiculos_ids)) {
        // Obtener las asociaciones actuales si es necesario para actualizarlas
        // Por ahora solo estamos actualizando el producto básico
      }

      return res.json({
        success: true,
        data: productoActualizado,
        message: 'Producto actualizado exitosamente'
      });
    } catch (error: any) {
      console.error('Error en InventarioController.update:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar producto',
        error: error.message
      });
    }
  },

  // Eliminar un producto
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const codigoParam = req.params.codigo;
      const codigo = Array.isArray(codigoParam) ? codigoParam[0] : codigoParam;
      
      if (!codigo) {
        return res.status(400).json({
          success: false,
          message: 'Código requerido'
        });
      }

      const eliminado = await InventarioModel.delete(codigo);
      
      if (!eliminado) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      return res.json({
        success: true,
        message: 'Producto eliminado exitosamente'
      });
    } catch (error: any) {
      console.error('Error en InventarioController.delete:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar producto',
        error: error.message
      });
    }
  }
};