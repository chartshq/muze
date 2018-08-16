import { TextCell } from 'visual-cell';
import { escapeHTML } from 'muze-utils';

/**
 *
 *
 * @param {*} rawContent
 * @returns
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
 * @returns
 */
const headerCreator = (config, cellType, labelManager, prevCell) => {
    const {
        content,
    } = config;
    const cell = prevCell || new TextCell({ type: cellType }, { labelManager });

    cell.source(content);

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
 * @returns
 */
const createHeading = (config, type, labelManager, prevCell) => {
    if (!config) { return ''; }

    return headerCreator(
        config,
        type === 'title' ? 'header' : 'text',
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

    canvasHeight > 200 && canvasWidth > 200 && ['title', 'subtitle'].forEach((type) => {
        const headerOptions = context[type]();
        const content = resolveTitleSubTitleContent(headerOptions[0]);
        if (content.length) {
            const config = headerOptions[1];

            config.width = context.width();
            config.content = content;

            const { height, cell } = createHeading(config, type, context.dependencies().smartlabel,
                context[`${type}Cell`]);

            headers[`${type}Cell`] = cell;
            headerHeight += height + config.padding;
        }
    });
    return { headerHeight, headers };
};

