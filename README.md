# Jangueo — Gestión del negocio

App interna para ventas rápidas, inventario, utilidad y reportes. Moneda: **COP**.

## Inicio

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

- **Usuario:** `PulpoPaul`
- Contraseña configurada en seed (hash bcrypt en BD)
- Actualizar usuario: `npm run db:update-user`

## Productos

37 productos exactos: cervezas, gaseosas, hidratación, licores, granizados y cigarrillos.

## Marca

Logo en login, sidebar, header y dashboard. Colores: púrpura oscuro + rosa neón.

## Funciones

- Ventas rápidas con botón + cantidad
- Anulación de ventas (repone stock, no borra historial)
- Inventario en cards con cargar stock
- Estadísticas y ventas por día
- Reportes con gráficos
- Seguridad bcrypt + JWT httpOnly
