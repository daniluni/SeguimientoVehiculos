const Config = {
  _vehiculosList: null,
  _puntosList: null,

  init() {
    this._vehiculosList = document.getElementById('vehiculos-list');
    this._puntosList = document.getElementById('puntos-list');

    document.getElementById('btn-agregar-vehiculo').addEventListener('click', () => this._addVehiculo());
    document.getElementById('btn-agregar-punto').addEventListener('click', () => this._addPuntoVenta());

    this.render();
    document.addEventListener('data:change', () => this.render());
  },

  render() {
    this._renderVehiculos();
    this._renderPuntos();
  },

  _renderVehiculos() {
    const vehiculos = Store.getCollection('vehiculos');
    if (vehiculos.length === 0) {
      this._vehiculosList.innerHTML = '<div class="empty-state"><div class="empty-state__text">Sin vehículos</div></div>';
      return;
    }
    this._vehiculosList.innerHTML = vehiculos.map((v) => `
      <div class="config-item" data-id="${v.id}">
        <div class="config-item__info">
          <div class="config-item__name">${Utils.escapeHtml(v.placa)} — ${Utils.escapeHtml(v.nombreConductor)}</div>
          <div class="config-item__meta">${Utils.escapeHtml(v.marca)} ${Utils.escapeHtml(v.modelo)} · ${v.anio}</div>
        </div>
        <div class="config-item__actions">
          <button class="btn btn--danger btn--sm" data-vehiculo-delete="${v.id}">🗑️</button>
        </div>
      </div>
    `).join('');
    this._vehiculosList.querySelectorAll('[data-vehiculo-delete]').forEach((btn) => {
      btn.addEventListener('click', () => this._deleteVehiculo(btn.dataset.vehiculoDelete));
    });
  },

  _renderPuntos() {
    const puntos = Store.getCollection('puntosventa');
    if (puntos.length === 0) {
      this._puntosList.innerHTML = '<div class="empty-state"><div class="empty-state__text">Sin puntos de venta</div></div>';
      return;
    }
    const tiposMap = Object.fromEntries(Models.TIPOS_PUNTO.map((t) => [t.id, t]));
    this._puntosList.innerHTML = puntos.map((p) => `
      <div class="config-item" data-id="${p.id}">
        <div class="config-item__info">
          <div class="config-item__name">${Utils.escapeHtml(p.nombre)}</div>
          <div class="config-item__meta">${Utils.escapeHtml(p.direccion)} · ${(tiposMap[p.tipo] || {}).nombre || p.tipo} · ${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}</div>
        </div>
        <div class="config-item__actions">
          <button class="btn btn--danger btn--sm" data-punto-delete="${p.id}">🗑️</button>
        </div>
      </div>
    `).join('');
    this._puntosList.querySelectorAll('[data-punto-delete]').forEach((btn) => {
      btn.addEventListener('click', () => this._deletePunto(btn.dataset.puntoDelete));
    });
  },

  _addVehiculo() {
    const placa = document.getElementById('veh-placa').value.trim().toUpperCase();
    const conductor = document.getElementById('veh-conductor').value.trim();
    const marca = document.getElementById('veh-marca').value.trim();
    const modelo = document.getElementById('veh-modelo').value.trim();
    const anio = document.getElementById('veh-anio').value;

    if (!placa) { alert('La placa es obligatoria'); return; }
    if (!conductor) { alert('El nombre del conductor es obligatorio'); return; }

    Store.addToCollection('vehiculos', Models.crearVehiculo({ placa, nombreConductor: conductor, marca, modelo, anio }));
    document.getElementById('veh-placa').value = '';
    document.getElementById('veh-conductor').value = '';
    document.getElementById('veh-marca').value = '';
    document.getElementById('veh-modelo').value = '';
    document.getElementById('veh-anio').value = '';
    this.render();
    document.dispatchEvent(new CustomEvent('data:change'));
  },

  _deleteVehiculo(id) {
    if (!confirm('¿Eliminar este vehículo? También se eliminarán sus visitas.')) return;
    Store.removeFromCollection('vehiculos', id);
    const visitas = Store.getCollection('visitas').filter((v) => v.idVehiculo !== id);
    Store.set('visitas', visitas);
    this.render();
    document.dispatchEvent(new CustomEvent('data:change'));
  },

  _addPuntoVenta() {
    const nombre = document.getElementById('pto-nombre').value.trim();
    const direccion = document.getElementById('pto-direccion').value.trim();
    const lat = parseFloat(document.getElementById('pto-lat').value);
    const lng = parseFloat(document.getElementById('pto-lng').value);
    const tipo = document.getElementById('pto-tipo').value;

    if (!nombre) { alert('El nombre es obligatorio'); return; }
    if (isNaN(lat) || isNaN(lng)) { alert('Ingresa coordenadas válidas (lat, lng)'); return; }

    Store.addToCollection('puntosventa', Models.crearPuntoVenta({ nombre, direccion, lat, lng, tipo }));
    document.getElementById('pto-nombre').value = '';
    document.getElementById('pto-direccion').value = '';
    document.getElementById('pto-lat').value = '';
    document.getElementById('pto-lng').value = '';
    this.render();
    document.dispatchEvent(new CustomEvent('data:change'));
  },

  _deletePunto(id) {
    if (!confirm('¿Eliminar este punto de venta? También se eliminarán sus visitas.')) return;
    Store.removeFromCollection('puntosventa', id);
    const visitas = Store.getCollection('visitas').filter((v) => v.idPuntoVenta !== id);
    Store.set('visitas', visitas);
    this.render();
    document.dispatchEvent(new CustomEvent('data:change'));
  },
};
