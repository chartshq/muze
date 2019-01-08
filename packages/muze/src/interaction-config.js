/**
 * Configuration properties for interaction.
 *
 * @public
 * @module InteractionConfig
 *
 * @param {Object} tooltip Tooltip configuration.
 * @param {string} tooltip.mode Allows to display tooltip in various modes such as fragmented or consolidated.
 * Supported values are '```consolidated```' and '```fragmented```'.Default mode is ```consolidated```.
 * In consolidated mode, all the rows of data model are show in one tooltip.
 * In fragmented mode, all the rows of data model are shown in separate tooltips.
 * @param {Function} tooltip.formatter Returns a formatted content of tooltip {@link TooltipFormatter}.
 * @param {Array} tooltip.fields Allows to display only the specified fields in the tooltip.
 */
