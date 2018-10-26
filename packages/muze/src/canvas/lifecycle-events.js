/**
 * Life cycle events trigger throughout the lifecycle of every component of canvas. These events can be tapped into
 * and be used for doing any work before and after these events occur.
 *
 * The events which are registered in canvas are:-
 * - `canvas.initialized`: Fired when the canvas is initialized first time.
 * - `canvas.updated`: Fired when the canvas gets updated with new data or new configuration.
 * - `canvas.beforedraw`: Fired before the canvas has started drawing.
 * - `canvas.drawn`: Fired when the canvas has finished drawing.
 * - `unit.initialized`: Fired when all the visual units of the canvas gets initialized.
 * - `unit.updated`: Fired when all the visual units of the canvas gets updated.
 * - `unit.beforedraw`: Fired before the units are being drawn.
 * - `unit.drawn`: Fired when all of the units has been rendered.
 * - `layer.initialized`: Fired when all the layers of a visual unit gets created.
 * - `layer.beforedraw`: Fired before the layers are being drawn.
 * - `layer.drawn`: Fired after the layers has been drawn.
 *
 * @public
 * @module LifecycleEvents
 */
