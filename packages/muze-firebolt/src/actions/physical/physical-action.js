/**
 * Physical action is a function which returns a function that gets called with the target element and
 * an array of mapped behaviour names.
 *
 * @public
 *
 * @param {Firebolt} firebolt Instance of firebolt.
 * @param {VisualUnit} firebolt.context Instance of visual unit attached with the firebolt.
 *
 * @module PhysicalAction
 *
 * @return {PhysicalActionInitializer} Function which dispatches the behavioural action on event trigger.
 */

 /**
  * This function binds the dom event to the target element and dispatches the behaviours with a
  * payload which contains the criteria.
  *
  * @public
  *
  * @param {D3Selection} targetEl d3 selection of the target element.
  * @param {Array} behaviours Array of behaviours.
  *
  * @module PhysicalActionInitializer
  *
  * @function
  */
