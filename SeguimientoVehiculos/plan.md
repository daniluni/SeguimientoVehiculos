# Plan — SeguimientoVehiculos

App SPA para seguimiento de entregas de bebidas gaseosas en ruta. Conductores registran visitas a puntos de venta con resultado de entrega; el mapa OpenStreetMap muestra el estado por día y vehículo.

## Dependencia externa
Leaflet.js v1.9.4 desde CDN (unpkg) para renderizar OpenStreetMap con marcadores personalizados.

## Estructura

```
SeguimientoVehiculos/
  index.html
  plan.md
  css/   reset.css · variables.css · layout.css · components.css · responsive.css
  js/    utils.js · store.js · models.js
         dashboard.js   — Cards resumen
         config.js      — CRUD vehículos + puntos de venta (dos paneles)
         visitas.js     — CRUD visitas con modal
         mapa.js        — Leaflet map + filtros + marcadores por estado
         app.js         — Orquestación IIFE + 4 tabs + data:change
```

## Modelo de Datos

**Vehículo**: id, placa, nombreConductor, marca, modelo, anio, fechaCreacion
**Punto de Venta**: id, nombre, direccion, lat, lng, tipo, fechaCreacion
**Visita**: id, idVehiculo, fecha, idPuntoVenta, entregado, producto, cantidad, valor, horaVisita, observaciones, fechaCreacion

Tipos de punto: Supermercado, Minimarket, Almacén, Botillería, Restaurante, Otro

## Vistas (4 tabs)

| Tab | Vista | Contenido |
|-----|-------|-----------|
| 📊 Dashboard | dashboard-view | 4 cards (vehículos, puntos, visitas hoy, entregas hoy) + leyenda mapa |
| 🗺️ Mapa | mapa-view | Filtros (fecha + placa) + mapa OSM con Leaflet + marcadores 🟢 entregado / 🔴 no entregado / ⚪ sin visita + popup con datos |
| 📋 Visitas | visitas-view | Tabla de visitas + modal CRUD con todos los campos |
| ⚙️ Config | config-view | Dos paneles paralelos: Vehículos (CRUD inline) + Puntos de Venta (CRUD inline con coordenadas) |

## Mapa

Algoritmo: para una fecha y placa dadas, se obtienen las visitas filtradas. Cada punto de venta existente se marca con un `circleMarker` de Leaflet:
- 🟢 Verde si tiene visita con `entregado=true`
- 🔴 Rojo si tiene visita con `entregado=false`
- ⚪ Gris si no tiene visita ese día

Al hacer clic en el marcador se muestra un popup con: nombre del punto, dirección, tipo, vehículo, hora, productos, cantidad, valor, observaciones.

## Presets

- 3 vehículos (GH-4521 Pedro Pérez, KT-7890 María González, LB-3344 Carlos Muñoz)
- 8 puntos de venta en Santiago centro
- 10 visitas de ejemplo en 2 días distintos con entregados y no entregados
