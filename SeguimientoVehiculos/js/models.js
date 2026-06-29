const Models = {
  TIPOS_PUNTO: [
    { id: 'supermercado', nombre: 'Supermercado', badge: 'badge--supermercado' },
    { id: 'minimarket', nombre: 'Minimarket', badge: 'badge--minimarket' },
    { id: 'almacen', nombre: 'Almacén', badge: 'badge--almacen' },
    { id: 'botilleria', nombre: 'Botillería', badge: 'badge--botilleria' },
    { id: 'restaurante', nombre: 'Restaurante', badge: 'badge--restaurante' },
    { id: 'otro', nombre: 'Otro', badge: 'badge--otro' },
  ],

  PRESET_VEHICULOS: [
    { placa: 'GH-4521', nombreConductor: 'Pedro Pérez', marca: 'Ford', modelo: 'Transit', anio: 2022 },
    { placa: 'KT-7890', nombreConductor: 'María González', marca: 'Mercedes', modelo: 'Sprinter', anio: 2021 },
    { placa: 'LB-3344', nombreConductor: 'Carlos Muñoz', marca: 'Chevrolet', modelo: 'NPR', anio: 2020 },
  ],

  PRESET_PUNTOS_VENTA: [
    { nombre: 'Supermercado Líder', direccion: 'Av. Providencia 1234', lat: -33.4489, lng: -70.6693, tipo: 'supermercado' },
    { nombre: 'Minimarket Don Pepe', direccion: 'Calle Moneda 567', lat: -33.4520, lng: -70.6750, tipo: 'minimarket' },
    { nombre: 'Almacén La Esquina', direccion: 'Av. Santa María 890', lat: -33.4460, lng: -70.6650, tipo: 'almacen' },
    { nombre: 'Botillería El Gato', direccion: 'Calle San Diego 234', lat: -33.4500, lng: -70.6800, tipo: 'botilleria' },
    { nombre: 'Restaurante El Fogón', direccion: 'Av. Las Condes 3456', lat: -33.4550, lng: -70.6600, tipo: 'restaurante' },
    { nombre: 'Supermercado Tottus', direccion: 'Av. Vicuña Mackenna 123', lat: -33.4420, lng: -70.6900, tipo: 'supermercado' },
    { nombre: 'Almacén Doña Rosa', direccion: 'Calle General Bustamante 456', lat: -33.4600, lng: -70.6700, tipo: 'almacen' },
    { nombre: 'Minimarket La Estación', direccion: 'Av. Libertador Bernardo O\'Higgins 345', lat: -33.4450, lng: -70.6850, tipo: 'minimarket' },
  ],

  PRESET_VISITAS: [
    { idVehiculoIdx: 0, idPuntoVentaIdx: 0, fecha: '2026-06-25', entregado: true, producto: 'Coca-Cola 2L x12, Sprite 1.5L x6', cantidad: 18, valor: 36000, horaVisita: '09:15', observaciones: '' },
    { idVehiculoIdx: 0, idPuntoVentaIdx: 1, fecha: '2026-06-25', entregado: true, producto: 'Fanta 2L x8, Coca-Cola Zero 1.5L x10', cantidad: 18, valor: 32000, horaVisita: '10:30', observaciones: '' },
    { idVehiculoIdx: 0, idPuntoVentaIdx: 2, fecha: '2026-06-25', entregado: false, producto: 'Sprite 2L x6', cantidad: 6, valor: 9000, horaVisita: '11:45', observaciones: 'Cerrado por inventario' },
    { idVehiculoIdx: 0, idPuntoVentaIdx: 3, fecha: '2026-06-25', entregado: true, producto: 'Coca-Cola 1.5L x15, Fanta 1.5L x8', cantidad: 23, valor: 34500, horaVisita: '12:20', observaciones: '' },
    { idVehiculoIdx: 1, idPuntoVentaIdx: 4, fecha: '2026-06-25', entregado: true, producto: 'Coca-Cola 2L x20, Sprite 2L x10', cantidad: 30, valor: 60000, horaVisita: '08:45', observaciones: 'Pedido grande' },
    { idVehiculoIdx: 1, idPuntoVentaIdx: 5, fecha: '2026-06-25', entregado: false, producto: 'Coca-Cola Zero 1.5L x6', cantidad: 6, valor: 9000, horaVisita: '10:00', observaciones: 'No había quién recibiera' },
    { idVehiculoIdx: 1, idPuntoVentaIdx: 6, fecha: '2026-06-25', entregado: true, producto: 'Fanta 2L x10, Sprite 1.5L x10', cantidad: 20, valor: 30000, horaVisita: '11:15', observaciones: '' },
    { idVehiculoIdx: 2, idPuntoVentaIdx: 7, fecha: '2026-06-26', entregado: true, producto: 'Coca-Cola 2L x10, Coca-Cola Zero 2L x6', cantidad: 16, valor: 32000, horaVisita: '09:30', observaciones: '' },
    { idVehiculoIdx: 2, idPuntoVentaIdx: 0, fecha: '2026-06-26', entregado: true, producto: 'Sprite 2L x12, Fanta 2L x8', cantidad: 20, valor: 36000, horaVisita: '10:45', observaciones: '' },
    { idVehiculoIdx: 2, idPuntoVentaIdx: 1, fecha: '2026-06-26', entregado: false, producto: 'Coca-Cola 1.5L x6', cantidad: 6, valor: 7800, horaVisita: '12:00', observaciones: 'No tenían efectivo' },
  ],

  initDefaults() {
    if (!Store.get('vehiculos')) {
      Store.set('vehiculos', this.PRESET_VEHICULOS.map((v) => this.crearVehiculo(v)));
    }
    if (!Store.get('puntosventa')) {
      Store.set('puntosventa', this.PRESET_PUNTOS_VENTA.map((p) => this.crearPuntoVenta(p)));
    }
    if (!Store.get('visitas')) {
      const vehiculos = Store.getCollection('vehiculos');
      const puntos = Store.getCollection('puntosventa');
      const visitas = this.PRESET_VISITAS.map((v) => this.crearVisita({
        ...v,
        idVehiculo: (vehiculos[v.idVehiculoIdx] || {}).id || '',
        idPuntoVenta: (puntos[v.idPuntoVentaIdx] || {}).id || '',
      }));
      Store.set('visitas', visitas);
    }
  },

  crearVehiculo(data) {
    return {
      id: Utils.uuid(),
      placa: (data.placa || '').trim().toUpperCase(),
      nombreConductor: (data.nombreConductor || '').trim(),
      marca: (data.marca || '').trim(),
      modelo: (data.modelo || '').trim(),
      anio: data.anio || '',
      fechaCreacion: Utils.getNowISO(),
    };
  },

  crearPuntoVenta(data) {
    return {
      id: Utils.uuid(),
      nombre: data.nombre.trim(),
      direccion: (data.direccion || '').trim(),
      lat: Number(data.lat) || 0,
      lng: Number(data.lng) || 0,
      tipo: data.tipo || 'otro',
      fechaCreacion: Utils.getNowISO(),
    };
  },

  crearVisita(data) {
    return {
      id: Utils.uuid(),
      idVehiculo: data.idVehiculo,
      fecha: data.fecha,
      idPuntoVenta: data.idPuntoVenta,
      entregado: Boolean(data.entregado),
      producto: (data.producto || '').trim(),
      cantidad: Number(data.cantidad) || 0,
      valor: Number(data.valor) || 0,
      horaVisita: data.horaVisita || '',
      observaciones: (data.observaciones || '').trim(),
      fechaCreacion: Utils.getNowISO(),
    };
  },
};
