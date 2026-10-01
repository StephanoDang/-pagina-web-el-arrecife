# Plan de trabajo — 29 de septiembre al 15 de octubre de 2026

**Plan histórico, sustituido el 1 de octubre de 2026.** La nueva propuesta de noviembre de 2026 a enero de 2027 está en la [bitácora diaria](bitacora-diaria.md), que contiene también la revisión del total de horas y de la distribución semanal. El [registro anterior](bitacora-septiembre-octubre-2026.md) conserva los avances de septiembre.

Hay 12 jornadas previstas de 6 horas (72 horas planificadas), de lunes a viernes, sin contar el feriado del 8 de octubre. Se registran únicamente las horas realmente trabajadas.

## Alcance de este sprint

La secuencia acordada es: estructura y navegación, carta pública, carrito, checkout de prueba, reservas de prueba, panel administrativo, gestión de platos, gestión de pedidos, gestión de reservas, pruebas y documentación. No incluye pagos en línea.

Los datos simulados, LocalStorage y el login simulado permiten mostrar un prototipo local. Para que la web reciba pedidos y reservas del restaurante desde distintos dispositivos faltarán almacenamiento compartido y autenticación real.

## Información necesaria del restaurante

- Carta: categorías, platos, precios, descripciones y disponibilidad.
- Logo, colores, fotos autorizadas, horario, dirección y medios de contacto.
- Cómo se reciben pedidos y reservas; datos necesarios y estados que usa el personal.
- Quién revisará el resultado y quién administrará la web.

Al cerrar cada día, anota en la bitácora el avance comprobado, los bloqueos y el siguiente paso. Haz commits descriptivos de cambios reales, sin una cuota de commits por jornada.
