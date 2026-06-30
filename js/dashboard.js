const Dashboard = {
  init() {
    this.render();
    document.addEventListener('data:change', () => this.render());
  },

  render() {
    const vehiculos = Store.getCollection('vehiculos');
    const puntos = Store.getCollection('puntosventa');
    const visitas = Store.getCollection('visitas');
    const hoy = Utils.getTodayISO();
    const visitasHoy = visitas.filter((v) => v.fecha === hoy);
    const entregasHoy = visitasHoy.filter((v) => v.entregado);

    document.getElementById('dashboard-summary').innerHTML = `
      <div class="card">
        <div class="card__label">Vehículos</div>
        <div class="card__value card__value--primary">${vehiculos.length}</div>
      </div>
      <div class="card">
        <div class="card__label">Puntos de Venta</div>
        <div class="card__value card__value--info" style="color:var(--color-info)">${puntos.length}</div>
      </div>
      <div class="card">
        <div class="card__label">Visitas Hoy</div>
        <div class="card__value card__value--warning">${visitasHoy.length}</div>
        <div class="card__sub">${Utils.formatDateShort(hoy)}</div>
      </div>
      <div class="card">
        <div class="card__label">Entregas Hoy</div>
        <div class="card__value ${entregasHoy.length >= visitasHoy.length / 2 ? 'card__value--success' : 'card__value--danger'}">${entregasHoy.length}/${visitasHoy.length}</div>
        <div class="card__sub">${visitasHoy.length > 0 ? Math.round((entregasHoy.length / visitasHoy.length) * 100) + '% efectividad' : 'Sin datos'}</div>
      </div>
    `;
  },
};
