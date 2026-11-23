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
