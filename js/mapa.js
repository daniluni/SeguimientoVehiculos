const Mapa = {
  _map: null,
  _markersLayer: null,
  _filtroFecha: null,
  _filtroPlaca: null,

  init() {
    this._filtroFecha = document.getElementById('mapa-fecha');
    this._filtroPlaca = document.getElementById('mapa-placa');
    this._filtroFecha.value = Utils.getTodayISO();

    document.getElementById('mapa-filtrar').addEventListener('click', () => this._actualizarMapa());
    document.getElementById('mapa-limpiar').addEventListener('click', () => this._limpiarFiltros());

    this._initMap();
    this._poblarPlacas();
    this._actualizarMapa();
    document.addEventListener('data:change', () => {
      this._poblarPlacas();
      this._actualizarMapa();
    });
  },

  _initMap() {
    this._map = L.map('mapa-leaflet').setView([-33.4500, -70.6750], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
    }).addTo(this._map);
    this._markersLayer = L.layerGroup().addTo(this._map);
  },

  _poblarPlacas() {
    const vehiculos = Store.getCollection('vehiculos');
    this._filtroPlaca.innerHTML = '<option value="">Todas las placas</option>' +
      vehiculos.map((v) => `<option value="${v.id}">${v.placa} — ${Utils.escapeHtml(v.nombreConductor)}</option>`).join('');
  },

  _actualizarMapa() {
    this._markersLayer.clearLayers();
    const puntos = Store.getCollection('puntosventa');
    const visitas = Store.getCollection('visitas');
    const fecha = this._filtroFecha.value;
    const idVehiculo = this._filtroPlaca.value;

    if (puntos.length === 0) return;

    let visitasFiltradas = visitas;
    if (fecha) visitasFiltradas = visitasFiltradas.filter((v) => v.fecha === fecha);
    if (idVehiculo) visitasFiltradas = visitasFiltradas.filter((v) => v.idVehiculo === idVehiculo);

    const visitasPorPunto = {};
    visitasFiltradas.forEach((v) => {
      visitasPorPunto[v.idPuntoVenta] = v;
    });

    const tiposMap = Object.fromEntries(Models.TIPOS_PUNTO.map((t) => [t.id, t]));
    const vehiculosMap = Object.fromEntries(Store.getCollection('vehiculos').map((v) => [v.id, v]));

    puntos.forEach((p) => {
      const visita = visitasPorPunto[p.id];
      let estado, color, icon;

      if (visita) {
        if (visita.entregado) {
          estado = 'entregado';
          color = '#27ae60';
          icon = '✅';
        } else {
          estado = 'no-entregado';
          color = '#e74c3c';
          icon = '❌';
        }
      } else {
        estado = 'sin-visita';
        color = '#b2bec3';
        icon = '⚪';
      }

      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 10,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      }).addTo(this._markersLayer);

      const tipoNombre = (tiposMap[p.tipo] || {}).nombre || p.tipo;
      let popupHtml = `<strong>${Utils.escapeHtml(p.nombre)}</strong><br>
        <span style="font-size:0.85rem;color:#636e72">${Utils.escapeHtml(p.direccion)}<br>${tipoNombre}</span><hr style="margin:6px 0">`;

      if (visita) {
        const veh = vehiculosMap[visita.idVehiculo] || {};
        popupHtml += `
          <div style="font-size:0.85rem">
            <strong>${icon} ${estado === 'entregado' ? 'Entregado' : 'No entregado'}</strong><br>
            🚛 ${veh.placa || '—'} · ${Utils.escapeHtml(veh.nombreConductor || '')}<br>
            🕐 ${visita.horaVisita || '—'}<br>
            📦 ${Utils.escapeHtml(visita.producto || '—')}<br>
            🔢 ${visita.cantidad} unidades · ${Utils.currency(visita.valor)}<br>
            ${visita.observaciones ? '💬 ' + Utils.escapeHtml(visita.observaciones) : ''}
          </div>`;
      } else {
        popupHtml += `<span style="font-size:0.85rem;color:#636e72">Sin visita este día</span>`;
      }

      marker.bindPopup(popupHtml);
    });
  },

  _limpiarFiltros() {
    this._filtroFecha.value = Utils.getTodayISO();
    this._filtroPlaca.value = '';
    this._actualizarMapa();
  },
};
