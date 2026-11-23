# Configuración de Supabase

La aplicación puede leer el URL del proyecto y su clave pública desde variables Vite. No se debe colocar una clave `service_role` en variables `VITE_*`: Vite las incorpora al JavaScript que recibe el navegador.

1. Copiar `.env.example` a `.env.local`.
2. Reemplazar `VITE_SUPABASE_URL` por el Project URL y `VITE_SUPABASE_ANON_KEY` por la clave pública/publishable del proyecto.
3. Reiniciar `npm run dev` para que Vite vuelva a cargar las variables.
4. Desde el código o la consola del navegador, llamar `checkSupabaseConnection()` desde `src/config/supabase.ts`. La comprobación consulta el endpoint REST sin escribir datos.

No se guardan credenciales reales en Git. La conexión real, las migraciones y los datos de ejemplo quedan pendientes de las credenciales del proyecto y del esquema definido para el día 45; las comprobaciones locales solo validan la configuración y simulan la respuesta REST.

## Autenticación administrativa

El panel usa Supabase Auth con correo y contraseña. En Supabase, crea/invita las cuentas del personal y asigna `app_metadata.role = "admin"` a cada administrador desde un entorno confiable (por ejemplo, Dashboard o servidor con `service_role`). Nunca asignes el rol desde el navegador ni guardes `service_role` en variables `VITE_*`. El panel valida el rol y expulsa sesiones de usuarios autenticados que no lo tengan; Supabase renueva los tokens y elimina la sesión de esta pestaña al cerrar sesión.

Sin URL y clave pública válidas el formulario no inicia sesión. La protección real de datos requiere además aplicar la migración RLS de `../supabase/migrations/202611230001_shared_data_and_rls.sql`; las rutas de React solo controlan la interfaz y no sustituyen RLS.

## Migraciones y verificación local (23/11/2026)

Las migraciones de `supabase/migrations/` se aplican en orden de nombre:

1. `202611230001_shared_data_and_rls.sql`: tablas, restricciones, índices y RLS iniciales.
2. `202611230002_catalog_codes_and_order_rpc.sql`: correcciones de la auditoría:
   - columnas `code` en categorías, platos y presentaciones para enlazar los ids de texto de `src/data/menu.ts` (`leche-tigre`, `unica`) con las filas UUID;
   - elimina las inserciones públicas directas en `orders` y `order_items`; los pedidos solo se crean con `public.create_order(...)`;
   - `create_order` valida cliente, método, dirección y líneas; toma precios y disponibilidad del catálogo, calcula subtotales y total, inserta pedido y líneas en una sola transacción y devuelve el pedido existente si se repite `request_id`;
   - el costo de delivery queda `null` (no calculado) mientras no se confirme; el total corresponde solo a productos;
   - los administradores solo pueden cambiar `status`, siguiendo las transiciones de la interfaz (pedidos: pendiente → en preparación → entregado, con cancelación antes de entregar; reservas: pendiente → confirmada o cancelada); las líneas de pedido no se editan ni borran;
   - las reservas públicas usan la fecha de Lima (Supabase trabaja en UTC) y `created_at` lo fija el servidor.

`npm test` incluye `tests/supabase-rls.test.mjs`, que aplica ambas migraciones sobre PostgreSQL embebido (PGlite) con roles `anon` y `authenticated` equivalentes a Supabase y comprueba RLS, permisos y `create_order` con datos ficticios. Es una verificación local: no sustituye la prueba en un proyecto Supabase real.

### Aplicar en un proyecto de desarrollo

Usar un proyecto sin datos reales de clientes.

1. Crear el proyecto en Supabase y copiar Project URL y clave pública a `.env.local` (pasos de arriba).
2. En el Dashboard, abrir **SQL Editor** y ejecutar el contenido de cada migración, en orden. Alternativa con Supabase CLI: `supabase link --project-ref <ref>` y `supabase db push`; la contraseña de la base de datos se introduce localmente y no se guarda en el repositorio.
3. Crear o invitar la cuenta del personal en **Authentication → Users**. Asignar el rol desde **SQL Editor** (proceso de confianza, no desde la web):

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'
   where email = 'correo-del-personal@ejemplo.com';
   ```

   La persona debe cerrar sesión y volver a entrar para que el token incluya el rol.
4. Comprobaciones manuales en el proyecto conectado:
   - `checkSupabaseConnection()` responde «Conexión con Supabase disponible».
   - Login con la cuenta administradora entra a `/admin`; una cuenta sin rol recibe el rechazo y se cierra su sesión.
   - Con la clave pública y sin sesión: leer `dishes` devuelve solo disponibles; leer `orders` o `reservations` devuelve error de permisos; insertar en `orders` falla.
   - Expiración: en **Authentication → Settings** se puede reducir temporalmente el JWT expiry para observar la renovación automática; al cerrar sesión la pestaña pierde el acceso.

### Uso desde el cliente

- Pedidos: `supabase.rpc('create_order', { p_request_id, p_customer_name, p_phone, p_delivery_method, p_delivery_address, p_items })`, con `p_items = [{ dish, presentation, quantity }]` usando los códigos de la carta. Generar `p_request_id` una sola vez por envío y reutilizarlo en los reintentos. Los errores llegan como mensajes `invalid_*`, `unavailable_items` u `order_total_too_large`.
- Reservas: insertar sin pedir la fila de vuelta (`insert(...)` sin `.select()`), porque el público no tiene permiso de lectura.
- Pendiente: la carga de la carta en la base de datos (seed) a partir de `src/data/menu.ts` y la conexión de las pantallas. La validación de horarios y capacidad de reservas en servidor depende de reglas del restaurante aún sin confirmar.
