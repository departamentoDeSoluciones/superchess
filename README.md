
# Super Chess

Juego sencillo de ajedrez desarrollado con **React y TypeScript**.

El proyecto implementa la lógica principal de una partida de ajedrez, incluyendo movimientos legales, capturas, turnos, jaques, jaque mate y movimientos especiales.

## Tecnologías

* React
* TypeScript
* Vite
* CSS

## Funcionalidades

* Movimiento de todas las piezas
* Validación de movimientos legales
* Sistema de turnos para blancas y negras
* Capturas
* Detección de jaque
* Detección de jaque mate
* Detección de tablas por ahogado
* Enroque corto y largo
* Coronación automática del peón a reina
* Opción para rendirse
* Opción para regresar el último movimiento
* Reinicio de la partida
* Carga de posiciones mediante FEN
* Historial de movimientos usando notación algebraica

Ejemplos de movimientos registrados:

```txt
1. e4 e5
2. Nf3 Nc6
3. Bc4 Nf6
4. O-O
```

También soporta capturas, jaques, mates y promoción:

```txt
Qxc5
Qh5+
Qh7#
e8=Q
```

## Estado del proyecto

El juego se encuentra funcional para partidas locales.

Actualmente falta completar la ejecución de la captura **en passant**. La detección de la casilla objetivo ya forma parte del motor, pero todavía falta eliminar correctamente el peón capturado durante el movimiento.

## Instalación

Clona el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
```

Entra al proyecto:

```bash
cd super-chess
```

Instala las dependencias:

```bash
npm install
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

## Scripts

```bash
npm run dev
```

Inicia el proyecto en modo desarrollo.

```bash
npm run build
```

Genera la versión de producción.

```bash
npm run preview
```

Ejecuta localmente la versión de producción.

## Estructura general

```txt
src/
├── components/
├── engine/
│   ├── core/
│   └── models/
├── hooks/
└── App.tsx
```

La lógica del ajedrez se encuentra separada de la interfaz para mantener el motor independiente de React.

El tablero administra:

* Estado de las casillas
* Turnos
* Historial
* Jaques y mates
* Movimientos especiales
* Carga de posiciones

React se encarga de:

* Renderizar el tablero
* Seleccionar piezas
* Mostrar movimientos disponibles
* Actualizar la interfaz
* Mostrar el historial de la partida

## Pendiente

* Completar captura en passant
* Agregar selección de pieza durante la coronación
* Mejorar la reconstrucción del historial al regresar movimientos
* Agregar pruebas para las reglas del motor
