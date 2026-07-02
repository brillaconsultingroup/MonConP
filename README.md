# MonConP — Monitor de Convenios | Prefectura del Guayas

Sistema integral de **monitoreo y gestión de convenios** de cooperación nacional e internacional de la Prefectura del Guayas. Dashboard web autónomo (HTML + CSS + JavaScript, sin backend) cuya **portada es el reporte oficial en Power BI**, complementado con vistas locales de tablero, línea de tiempo interactiva, tabla, gráficos, calendario y mapa.

> Identidad visual institucional: Azul Brillante (Pantone 2995 C `#00AFFF`) y Azul Oscuro (Pantone 281 C `#002061`). Lema: *Guayas Se Mueve*.

---

## 🚀 Cómo ejecutarlo

**Local:** abre `index.html` en cualquier navegador (Chrome, Firefox, Edge, Safari).

**GitHub Pages:** en `Settings → Pages`, rama `main`, carpeta `/ (root)`. Queda publicado en `https://brillaconsultingroup.github.io/MonConP/`.

No requiere instalación ni servidor. Las librerías (Chart.js, Leaflet) se cargan por CDN.

---

## 📈 Portada: reporte Power BI

La primera vista al abrir el sistema es el reporte **MonConP** embebido desde Power BI:

- Report ID: `0b31a829-ed17-446d-a4b6-8a4f6b0b323d` (embed con `autoAuth=true`).
- **Requiere sesión institucional:** el visitante debe iniciar sesión con una cuenta del tenant de la organización para ver el reporte. Si el navegador no tiene sesión activa, Power BI mostrará la pantalla de inicio de sesión dentro del marco.
- Controles incluidos: **↺ Recargar** y **⛶ Pantalla completa**.
- El marco es responsivo (relación 16:9) y se adapta al ancho disponible.

Para cambiar el reporte embebido, edita el atributo `src` del `<iframe id="pbiFrame">` en `index.html`.

---

## 📂 Estructura del proyecto

```
MonConP/
├── index.html              # Página principal — portada Power BI + 6 vistas locales
├── assets/
│   ├── css/styles.css       # Estilos e identidad visual institucional
│   └── js/
│       ├── data.js          # Fuente de datos local (window.convenios) — EDITAR AQUÍ
│       └── app.js           # Lógica: navegación, tabla, gráficos, timeline, calendario, mapa, Power BI
├── data/convenios.json      # Mismos datos en JSON (interoperabilidad)
└── docs/BITACORA.md         # Bitácora de avances del proyecto
```

---

## 🧩 Secciones

| Sección | Descripción |
|---|---|
| 📈 Reporte Power BI | **Portada.** Reporte oficial embebido en vivo desde Power BI, con recarga y pantalla completa. |
| 📊 Dashboard | KPIs (total, en ejecución, vigentes, en trámite) + gráfico de estado + alertas de vencimiento. |
| 📅 Línea de tiempo | Barras por convenio según fechas reales, con sliders de rango y filtros por estado. |
| 📋 Tabla | Listado numerado (1–20) con búsqueda en vivo y filtros por estado y origen. |
| 📈 Gráficos | Estado, origen, dirección, coordinación y rangos de ejecución (Chart.js). |
| 🗓️ Calendario | Calendario mensual que marca suscripciones (verde) y vencimientos (rojo). |
| 🗺️ Mapa | Distribución geográfica por cantón (Leaflet), color por estado. |

---

## 🗃️ Modelo de datos

Cada convenio en `assets/js/data.js` / `data/convenios.json` tiene esta forma:

```js
{
 num: 1,                  // identificador 1..N
 entidad: "...",          // institución cooperante
 objeto: "...",           // objeto del convenio (resumen)
 origen: "Nacional",      // "Nacional" | "Internacional"
 estado: "exec",          // "exec" | "vig" | "tram" | "fin"
 direccion: "...",        // dirección/área responsable
 coordinacion: "...",     // coordinación general
 monto: 590000,           // USD (0 si no aplica)
 ejec: 24.56,             // % de ejecución (null si N/D)
 inicio: "2025-10-22",    // fecha de suscripción (null si por definir)
 fin: "2027-10-22",       // fin de vigencia (null si por definir)
 lat: -2.1709, lng: -79.9224 // ubicación aproximada (mapa)
}
```

Estados: `exec` = En ejecución · `vig` = Vigente · `tram` = En trámite / por suscribir · `fin` = Finalizado.

**Para agregar o editar convenios locales:** modifica `assets/js/data.js`. Todas las vistas locales se actualizan solas. El reporte Power BI se actualiza desde su propia fuente (la matriz Excel) en el servicio de Power BI.

---

## 🛣️ Roadmap

- [x] Carga de los convenios 1–20 con datos reales y numeración.
- [x] **Portada con reporte Power BI embebido (v2.0).**
- [ ] Cargar los 117 convenios completos de la matriz institucional.
- [ ] Coordenadas exactas (hoy aproximadas por cantón).
- [ ] Edición CRUD desde la interfaz y exportación a Excel/PDF.
- [ ] Persistencia (localStorage o backend) y control de usuarios.

---

## 📌 Notas sobre los datos actuales

- El monto solo está registrado en el convenio **#12** (Catedral, USD 590.000); el resto figura como `—`.
- Las **coordenadas del mapa son aproximadas por cantón**; la matriz no incluye latitud/longitud.
- Los convenios sin fecha definida se muestran como *"Por definir"* y se excluyen solo de la línea de tiempo.
- El reporte Power BI usa `autoAuth`; en GitHub Pages (público) los visitantes sin cuenta del tenant verán la pantalla de inicio de sesión de Microsoft, no el reporte.

---

## 🔗 Repositorio GitHub

`https://github.com/brillaconsultingroup/MonConP`

© Brilla Consulting Group — Prefectura del Guayas. Uso institucional.
