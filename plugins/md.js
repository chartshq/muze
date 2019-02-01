const fs = require('fs');
const marked = require('marked');
const converter = require('json2yaml');
const config = require('../jsdoc.conf.json');

const NAMESPACES = ['muze', 'utils', 'datamodel'];

/**
 * This method generates a nested hashmap for the parameters table
 * @param {Object} objArray the Array structure containing the parameters
 */
function generateNestedMap(objArray) {
    let mainMap = new Map();
    objArray.forEach((obj) => {
        let params = obj.name.split('.');
        let i = 0;
        let k = mainMap;

        while (k.has(params[i])) {
            k = k.get(params[i]);
            i++;
        }
        let kk = new Map();
        kk.set('value', obj.description.replace(/(\r\n|\n|\r)/gm, ' '));
        kk.set('type', obj.type.names.join('\n\n').replace(/\./gi, ''));
        k.set(params[i], kk);
    });
    return mainMap;
}

/**
 * This method replaces {@link Link} to markdown
 * @param {*} matched the matched string
 * @param {*} index index of matched string
 * @param {*} original the original string
 */
function replaceLink(matched, index, original) {
    if (matched.includes('|')) {
        matched = matched.split('|');
        matched[0] = matched[0].replace(/[^\w\s]/gi, '').split(' ')[1].trim();
        matched[1] = matched[1].replace(/[^\w\s]/gi, '').trim();
        return `[${matched[1]}](${matched[0]})`;
    }
	const matchedString = matched.match(/\s.+\b/, matched)[0].trim();
    return `[${matchedString}](${matchedString.split(' ').join('-')})`;
}

/**
 * 
 * @param {string} value
 * @param {*} blockquote boolean
 */
function createTableItem(value, typeofItem) {
    if (typeofItem === 'name') {
        return `<td class="param-name">${value.replace(/{@link\s+.*?}/gi, replaceLink).replace(/\s\s+/g, ' ').replace(/[^\w\s]/gi, '')}</td>`;
    }
    return `<td>${marked(value.replace(/{@link\s+.*?}/gi, replaceLink).replace(/(null)/gi, '')).replace(/(\r\n|\n|\r)/gm, ' ')}</td>`;
}

function createTableHeader() {
    return '<table><thead><tr><td>Name</td><td>Type</td><td>Description</td></tr></thead>';
}

function createTableRow(name, type, description) {
    return `<tr>
                ${name && name.length ? createTableItem(name, 'name') : ''}
                ${type ? createTableItem(type, 'type').replace(/(\s*Array\s*)<(\s*[^>]+\s*)>\s*/g, (m, g1, g2) => `${g1} of ${g2}`) : ''}
                ${description ? createTableItem(description) : ''}
            </tr>`.trim();
}

function createTable (oldkey, map) {
    let description = null;
    let type = null;
    let childTableRows = null;
    let table = '';
    let c = 0;

    if (map.has('value')) {
        description = map.get('value');
    }
    if (map.has('type')) {
        type = map.get('type');
    }
    for (let [key, data] of map) {
        if (key === 'value' || key === 'type') {
            c++;
            continue;
        } else {
            childTableRows = childTableRows || createTableHeader();
            childTableRows = `${childTableRows}\n${createTable(key, data)}`;
            c++;
        }
        if (c === map.size) {
            childTableRows = childTableRows ? `${childTableRows}</table>` : '';
        }
    }

    if (oldkey === '' && type == null) {
        table = childTableRows;
    } else {
        table = createTableRow(oldkey, type, `${description}${childTableRows}`);
    }
    return table;
}

/**
 * This function parses a JSDOC doclet and returns an object whose
 * YAML representation follows the schema expected by the React component
 * used to showcase samples.
 *
 * @param {Object} doclet JSDOC doclet.
 * @returns {Array} Array that follows the Proptypes of the Editor component.
 */
function parseDoclet(doclet, namespace) {
    let name = doclet.name;                         // name of current jsdoc item
    let classDescription = doclet.classdesc;        // descrption about the class (if any)
    const accessSpecifier = doclet.access;          // access specifier of the code block
    let itemDescription = doclet.description;       // jsdoc description
    let { kind } = doclet;                          // kind of item
    let { scope } = doclet;
    let examples = doclet.examples;                 // captures @examples from jsdoc snippet
    let params = doclet.params;                     // captures @param from jsdoc snippet
    let returnValue = doclet.returns;               // captures @return from jsdoc snippet
    let returnType = null;
    let sections = [];                              // master array to store all sections
    let textTags = [];
    let docletTags = doclet.tags;
    let { memberof } = doclet;
    let extendsItem = doclet.extends;

    if (Array.isArray(extendsItem) && extendsItem.length > 0) {
        extendsItem = extendsItem[0];
    }

    if (memberof && NAMESPACES.includes(memberof.toLowerCase())) {
        namespace.memberof = memberof.toLowerCase();
    }

    // Append @text block
    if (docletTags) {
        textTags = docletTags.filter(textTag => textTag.title === 'text');
    }
    // Only consider snippets with @public access specifier
    if (accessSpecifier === 'public') {
        // Check if snippet returns a value, if it does assign it to a variable
        if (returnValue) {
            returnType = returnValue.map(value => value.type.names.join(', '));
        }
        if (doclet.comment.includes('@constructor')) {
            name = '### <a name="constructor"></a> constructor';
        }
        if (classDescription) {
            name = `## <a name=${name}></a> Class: ${name}`;
        }
        /**
         * If snippet item is a function, append it to item's name with parameters and return type
         * The result will be -> functionName(param1, param2) -> {Return Type}
         */
        if (kind === 'function') {
            let { paramnames } = doclet.meta.code;
            paramnames = paramnames.join(', ').replace(/</gi, '&lt;').replace(/>/gi, '&gt;').replace(/\./gi, ' ');
            if (returnType) {
                returnType = returnType.join(' ').replace(/</gi, '&lt;').replace(/>/gi, '&gt;').replace(/\./gi, ' ');
                returnType = `[${returnType}](${returnType})`;
                name = `### <a name=${name}></a> ${name}(${paramnames}) → {${returnType}}`;
            } else {
                name = `### <a name=${name}></a> ${name}(${paramnames})`;
            }
        }
        if (kind === 'member' && scope && scope === 'static') {
            name = `### <a name=${name}></a> static ${name}`;
        }

        const description = classDescription || itemDescription;
        if (description) {
            if (extendsItem) {
                sections.push({
                    type: 'markdown-section',
                    content: `${name}\n\n${description.replace(/{@link\s+.*?}/gi, replaceLink)}\n\nExtends: [${extendsItem}](${extendsItem})`,
                });
            } else {
                // Append description property
                sections.push({
                    type: 'markdown-section',
                    content: `${name}\n\n${description.replace(/{@link\s+.*?}/gi, replaceLink)}`,
                });
            }

            let paramString = '';

            // add parameters as a table
            if (!classDescription && params && params.length) {
                const paramsTree = generateNestedMap(params);
                const paramTable = createTable('', paramsTree);
                paramString = `<p class="sub-header">Parameters:</p>\n${paramTable}`;
            }
            if (paramString) {
                sections.push({
                    type: 'markdown-section',
                    content: paramString,
                });
            }

            // Append code block
            if (examples && examples.length) {
                const text = doclet.text;
                if (text) {
                    examples.map((example) => {
                        let textMatch = example.match(/\[([^]+)\]/);
                        if (textMatch) {
                            textMatch = textMatch[1];
                            text.forEach((textItem) => {
                                if (textItem.value && textItem.value.includes(textMatch)) {
                                    textItem.value.replace(/\[([^]+)\]/, '');
                                    example.replace(/\[([^]+)\]/, textItem);
                                    sections.push({
                                        type: 'code-section',
                                        content: example,
                                        preamble: '',
                                    });
                                    sections.push({
                                        type: 'markdown-section',
                                        content: textItem,
                                    });
                                }
                            });
                        } else {
                            sections.push({
                                type: 'code-section',
                                content: example,
                                preamble: '',
                            });
                        }
                    });
                } else {
                    examples.map((example) => {
                        sections.push({
                            type: 'code-section',
                            content: example,
                            preamble: '',
                        });
                    });
                }
            }

            // Append return value type and description
            if (returnValue && returnValue.length) {
                let desc = returnValue[0].description;
                if (desc) {
                    let matchedArr = desc.match(/(```)([\s\S]*?)(```)/gm);
                    let matched = null;
                    if (matchedArr && matchedArr.length) {
                        matched = matchedArr[0];
                    }
                    let backTickText = null;
                    if (matched) {
                        backTickText = marked(matched);
                        desc = desc.replace(/(```)([\s\S]*?)(```)/gm, backTickText);
                    }
                }
                let returnVal =
                `<a name=${returnValue[0].type.names[0]}></a><p class="sub-header">Returns:</p>\n\n <span style="font-family: 'Source Code Pro';margin-left: 2%;">${returnValue[0].type.names.join(' ').replace(/</gi, '&lt;').replace(/>/gi, '&gt;').replace(/\./gi, '')}:</span>`;
                if (desc) {
                    returnVal = `${returnVal}${desc}`;
                }
                sections.push({
                    type: 'markdown-section',
                    content: returnVal.replace(/{@link\s+.*?}/gi, replaceLink),
                });
            }
            return sections;
        }
    }
    return null;
}

exports.defineTags = (dictionary) => {
    dictionary.defineTag('extends', {
        onTagged: (doclet, tag) => {
            doclet.extends = doclet.extends || [];
            doclet.extends.push(tag.value);
        }
    });
};

exports.defineTags = function(dictionary) {
    dictionary.defineTag('text', {
        onTagged(doclet, tag) {
            // console.log(doclet);
            // console.log(tag);
            if (!doclet.text) {
                doclet.text = [];
            }
            if (tag.value) {
                doclet.text.push({
                    name: tag.title,
                    type: tag.originalTitle,
                    value: tag.text,
                });
            }
        }
    });
};
exports.handlers = {
    /**
     * This function executes after jsdoc has parsed all files and created doclets
     * for all documented functions.
     *
     * @param {Object} e JSDOC parsed configuration
     * @param {Array<Object>} e.doclets Array of JSDOC doclets
     */
    parseComplete(e) {
        const doclets = e.doclets;
        const fileMap = {};
        // create a map of file name vs doclet
        doclets.forEach((item) => {
            const fileName = item.meta.filename;
            if (!fileMap[fileName]) {
                fileMap[fileName] = [];
            }
            fileMap[fileName].push(item);
        });
        // create parsed yaml for each file
        Object.keys(fileMap).forEach((fileName) => {
            const perFileDoclets = fileMap[fileName];

            // Filter out the doclets with no description
            const filteredDoclets = perFileDoclets.filter(doclet => (doclet.description ? doclet : null));
            // Object to store object parameters which may have nested keys
            let namespace = {};

            let parsed = filteredDoclets.map(doclet => parseDoclet(doclet, namespace)).filter(item => item);
            parsed = parsed.reduce((accum, value) => [...accum, ...value], []);

            let documentName = fileName.split('.')[0];
            documentName = documentName[0].toUpperCase() + documentName.slice(1);

            // Create master section to be converted to a YAML file
            const fileDump = {
                title: documentName,
                description: 'Documented Methods',
                sections: parsed,
            };
            // convert to YAML
            const yml = converter.stringify(fileDump);

            // get the path directory path where files will be written
            let destination = config.opts.yaml;
            let temp = fileName.split('-').join('').split('.');
            temp[temp.length - 1] = 'yml';
            let moduleFile = perFileDoclets.filter(doclet => doclet.kind === 'module' ? doclet : null);
            moduleFile.map((file) => {
                if (file.kind === 'module') {
                    temp[0] = file.name;
                }
            });
            let ymlFileName = temp.join('.');
            // If file is memberof a namespace, store it inside the appropriate namespace folder
            // if (namespace.memberof) {
            //     destination = `${destination}${namespace.memberof}`;
            // }
            // write the file
            fs.writeFile(`${destination}${ymlFileName}`, yml, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        });
    }
};
