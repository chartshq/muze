import { TextCell } from '@chartshq/visual-cell';
import { escapeHTML } from 'muze-utils';
import { TOP } from '../constants';

/**
 *
 *
 * @param {*} rawContent
 *
 */
const resolveTitleSubTitleContent = (rawContent) => {
    if (typeof rawContent === 'function' && !rawContent._sanitize) {
        return rawContent();
    }
    return escapeHTML(rawContent());
};

/**
 *
 *
 * @param {*} config
 * @param {*} cellType
 * @param {*} labelManager
 * @param {*} prevCell
 *
 */
const headerCreator = (config, cellType, labelManager, prevCell) => {
    const {
        content,
        classPrefix,
        maxLines
    } = config;
    const cell = prevCell || new TextCell(
        {
            type: cellType === 'title' ? 'header' : 'text',
            className: `${classPrefix}-${cellType}-cell`
        }, {
            labelManager
        })
     .config({ maxLines }).minSpacing({ width: 0, height: 0 });

    cell.source(content);
    cell._minTickDiff = { height: 0, width: 0 };
    let margin = {};
    if (config.position === TOP) {
        margin = { top: 0, bottom: config.padding };
    } else {
        margin = { top: config.padding, bottom: 0 };
    }
    cell.config({ margin });
    return {
        height: cell.getLogicalSpace().height,
        cell
    };
};

/**
 *
 *
 * @param {*} config
 * @param {*} type
 * @param {*} labelManager
 * @param {*} cell
 *
 */
const createHeading = (config, type, labelManager, prevCell) => {
    if (!config) { return ''; }

    return headerCreator(
        config,
        type,
        labelManager,
        prevCell
    );
};

/**
 *
 *
 * @param {*} context
 */
export const createHeaders = (context, canvasHeight, canvasWidth) => {
    let headerHeight = 0;
    const headers = {};

    canvasHeight >= 200 && canvasWidth >= 200 && ['title', 'subtitle'].forEach((type) => {
        const headerOptions = context[type]();
        const content = resolveTitleSubTitleContent(headerOptions[0]);
        if (content.length) {
            const config = headerOptions[1];

            config.width = context.width();
            config.height = context.height();
            config.classPrefix = context.config().classPrefix;
            config.content = content;
            config.classPrefix = context.config().classPrefix;

            const { height, cell } = createHeading(config, type, context.dependencies().smartlabel,
                context[`${type}Cell`]);

            headers[`${type}Cell`] = cell;
            context._composition[type] = cell;
            headerHeight += height + config.padding;
        }
    });
    return { headerHeight, headers };
};

