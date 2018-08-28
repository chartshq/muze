import { ComposedVars, SimpleVariable } from '@chartshq/visual-group';
import { TITLE_TEMPLATE_NOT_ALLOWED_TAGS } from './constants';

/**
 * This method creates a new composed variable instance from multiple variables.
 * @param {Array} vars Variable names
 * @return {ComposedVars} Instance of composed variable
 */
export const share = (...vars) => new ComposedVars(...vars.map(variable => new SimpleVariable(variable)));

/**
 *
 *
 * @param {*} node
 * @returns
 */
function treeShakeNode (node) {
    if (node.nodeType !== Node.ELEMENT_NODE) { return; }

    if (TITLE_TEMPLATE_NOT_ALLOWED_TAGS.indexOf(node.tagName.toLowerCase()) !== -1) {
        node.parentNode.removeChild(node);
    } else {
        for (const childNode of node.childNodes) {
            treeShakeNode(childNode);
        }
    }
}

/**
 * A string template tagged function which sanitizes input html formatted
 * string according to the allowed html tags.
 *
 * @param {Array.<string>} strings - The string parts of the template.
 * @param {Array} exps - The list of evaluated expression values.
 * @return {Function} Returns a function which returns the sanitized html string.
 */
export function html (strings, ...exps) {
    let htmlCode = '';
    const expLn = exps.length;
    let i = 0;

    for (; i < expLn; ++i) {
        htmlCode += strings[i] + exps[i];
    }
    htmlCode += strings[i];

    const frag = document.createDocumentFragment();
    const wrapper = document.createElement('div');

    frag.appendChild(wrapper);
    wrapper.innerHTML = htmlCode;

    treeShakeNode(wrapper);
    const { innerHTML } = wrapper;

    return () => innerHTML;
}
