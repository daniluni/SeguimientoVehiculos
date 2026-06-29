const Visitas = {
  _tableBody: null,
  _modalOverlay: null,
  _modalTitle: null,
  _form: null,
  _editId: null,

  init() {
    this._tableBody = document.getElementById('visitas-body');
    this._modalOverlay = document.getElementById('visita-modal');
    this._modalTitle = document.getElementById('visita-modal-title');
    this._form = document.getElementById('visita-form');

    document.getElementById('btn-nueva-visita').addEventListener('click', () => this._openForm());
    document.getElementById('btn-cancelar-visita').addEventListener('click', () => this._closeForm());
    document.getElementById('btn-cancelar-visita2').addEventListener('click', () => this._closeForm());
    this._form.addEventListener('submit', (e) => this._handleSubmit(e));
    this._modalOverlay.addEventListener('click', (e) => {
      if (e.target === this._modalOverlay) this._closeForm();
    });

    this._populateSelects();
    this.render();
    document.addEventListener('data:change', () => this._populateSelects());
  },

  _populateSelects() {
    const vehSelect = document.getElementById('visita-vehiculo');
    const vehiculos = Store.getCollection('vehiculos');
    vehSelect.innerHTML = vehiculos.length === 0
      ? '<option value="">— Sin vehículos —</option>'
      : vehiculos.map((v) => `<option value="${v.id}">${v.placa} — ${Utils.escapeHtml(v.nombreConductor)}</option>`).join('');

    const ptoSelect = document.getElementById('visita-punto');
    const puntos = Store.getCollection('puntosventa');
    const tiposMap = Object.fromEntries(Models.TIPOS_PUNTO.map((t) => [t.id, t]));
    ptoSelect.innerHTML = puntos.length === 0
      ? '<option value="">— Sin puntos —</option>'
      : puntos.map((p) => {
          const tipoNombre = (tiposMap[p.tipo] || {}).nombre || p.tipo;
          return `<option value="${p.id}">${Utils.escapeHtml(p.nombre)} (${tipoNombre})</option>`;
        }).join('');
  },

  render() {
    const visitas = Store.getCollection('visitas').sort((a, b) => b.fecha.localeCompare(a.fecha) || b.horaVisita.localeCompare(a.horaVisita));
    const vehiculosMap = Object.fromEntries(Store.getCollection('vehiculos').map((v) => [v.id, v]));
    const puntosMap = Object.fromEntries(Store.getCollection('puntosventa').map((p) => [p.id, p]));

    if (visitas.length === 0) {
      this._tableBody.innerHTML = `<tr><td colspan="7"><div class="empty-state">
        <div class="empty-state__icon">🚛</div>
        <div class="empty-state__text">No hay visitas registradas</div>
      </div></td></tr>`;
      return;
    }

    this._tableBody.innerHTML = visitas.map((v) => {
      const veh = vehiculosMap[v.idVehiculo] || {};
      const pto = puntosMap[v.idPuntoVenta] || {};
      return `<tr>
        <td><strong>${veh.placa || '—'}</strong><br><span style="font-size:0.75rem;color:var(--color-text-secondary)">${Utils.escapeHtml(veh.nombreConductor || '')}</span></td>
        <td>${Utils.escapeHtml(pto.nombre || '—')}</td>
        <td>${Utils.formatDateShort(v.fecha)}</td>
        <td>${v.horaVisita || '—'}</td>
        <td><span class="badge ${v.entregado ? 'badge--entregado' : 'badge--no-entregado'}">${v.entregado ? '✓ Entregado' : '✗ No entregado'}</span></td>
        <td>${Utils.currency(v.valor)}</td>
        <td>
          <button class="btn btn--secondary btn--sm" data-visita-edit="${v.id}">✏️</button>
          <button class="btn btn--danger btn--sm" data-visita-delete="${v.id}">🗑️</button>
        </td>
      </tr>`;
    }).join('');

    this._tableBody.querySelectorAll('[data-visita-edit]').forEach((btn) => {
      btn.addEventListener('click', () => this._openForm(btn.dataset.visitaEdit));
    });
    this._tableBody.querySelectorAll('[data-visita-delete]').forEach((btn) => {
      btn.addEventListener('click', () => this._deleteVisita(btn.dataset.visitaDelete));
    });
  },

  _openForm(id) {
    this._editId = id || null;
    this._modalTitle.textContent = id ? 'Editar Visita' : 'Nueva Visita';
    this._form.reset();
    document.getElementById('visita-id').value = '';

    if (id) {
      const v = Store.getById('visitas', id);
      if (v) {
        document.getElementById('visita-id').value = v.id;
        document.getElementById('visita-vehiculo').value = v.idVehiculo;
        document.getElementById('visita-fecha').value = v.fecha;
        document.getElementById('visita-punto').value = v.idPuntoVenta;
        document.getElementById('visita-entregado').value = v.entregado ? '1' : '0';
        document.getElementById('visita-producto').value = v.producto;
        document.getElementById('visita-cantidad').value = v.cantidad;
        document.getElementById('visita-valor').value = v.valor;
        document.getElementById('visita-hora').value = v.horaVisita;
        document.getElementById('visita-observaciones').value = v.observaciones;
      }
    } else {
      document.getElementById('visita-fecha').value = Utils.getTodayISO();
    }

    this._modalOverlay.classList.add('modal-overlay--open');
    if (Store.getCollection('vehiculos').length === 0 || Store.getCollection('puntosventa').length === 0) {
      alert('Primero configura vehículos y puntos de venta en la pestaña ⚙️ Config');
      this._closeForm();
      return;
    }
  },

  _closeForm() {
    this._modalOverlay.classList.remove('modal-overlay--open');
    this._editId = null;
  },

  _handleSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('visita-id').value;
    const data = {
      idVehiculo: document.getElementById('visita-vehiculo').value,
      fecha: document.getElementById('visita-fecha').value,
      idPuntoVenta: document.getElementById('visita-punto').value,
      entregado: document.getElementById('visita-entregado').value === '1',
      producto: document.getElementById('visita-producto').value.trim(),
      cantidad: document.getElementById('visita-cantidad').value,
      valor: document.getElementById('visita-valor').value,
      horaVisita: document.getElementById('visita-hora').value,
      observaciones: document.getElementById('visita-observaciones').value.trim(),
    };

    if (!data.idVehiculo || !data.idPuntoVenta) { alert('Debes seleccionar vehículo y punto de venta'); return; }
    if (!data.fecha) { alert('La fecha es obligatoria'); return; }

    if (id) {
      Store.updateInCollection('visitas', id, data);
    } else {
      Store.addToCollection('visitas', Models.crearVisita(data));
    }

    this._closeForm();
    this.render();
    document.dispatchEvent(new CustomEvent('data:change'));
  },

  _deleteVisita(id) {
    if (!confirm('¿Eliminar esta visita?')) return;
    Store.removeFromCollection('visitas', id);
    this.render();
    document.dispatchEvent(new CustomEvent('data:change'));
  },
};
