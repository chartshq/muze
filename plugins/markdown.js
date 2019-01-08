const fs = require('fs');
const converter = require('json2yaml');
const marked = require('marked');
const config = require('../jsdoc.conf.json');
const CONSTANTS = require('./constants');
const yaml = require('yamljs');
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
        while (k instanceof Map && k.has(params[i])) {
            k = k.get(params[i]);
            i++;
        }
        let kk = new Map();
        obj.description && kk.set('value', obj.description.replace(/(\r\n|\n|\r)/gm, ' '));
        kk.set('type', obj.type.names.join('\n\n').replace(/\./gi, ''));
        k instanceof Map && k.set(params[i], kk);
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
        // matched[0] = matched[0].replace(/[^\w\s]/gi, '').split(' ')[1].trim();
        matched[0] = matched[0].replace(/({@link )/g, '').trim();
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
    if (typeof value === 'object') {
        value = value.get('value');
    }
    let matchedArr = value.match(/(```)([\s\S]*?)(```)/gm);
    let matched = null;
    if (matchedArr && matchedArr.length) {
        matched = matchedArr[0];
    }
    let backTickText = null;
    if (matched) {
        backTickText = marked(matched);
        value = value.replace(/(```)([\s\S]*?)(```)/gm, backTickText);
    }
    return `<td>${marked(value.replace(/{@link\s+.*?}/gi, replaceLink).replace(/(null)/gi, '')).replace(/(\r\n|\n|\r)/gm, ' ')}</td>`;
}

function createTableHeader() {
    return '<table><thead><tr><td>Name</td><td>Type</td><td>Description</td></tr></thead>';
}

function createTableRow(name, type, description) {
    return `<tr>
                ${name && name.length ? createTableItem(name, 'name') : ''}
                ${type ? createTableItem(type, 'type') : ''}
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
 * function to filter the preamble tags in lines
 * @param  {Array} array lines array
 * @param  {string} what string to be removed
 * @return {Array} the modified array
 */
function without(array, what) {
    return array.filter(element => element.trim() !== what);
}

/**
 * This function parses a JSDOC doclet and returns an object whose
 * YAML representation follows the schema expected by the React component
 * used to showcase samples.
 *
 * @param {Object} doclet JSDOC doclet.
 * @param sameLevel boolean to alter size of headers
 * @returns {Array} Array that follows the Proptypes of the Editor component.
 */
function parseDoclet(doclet, sameLevel = false) {
    const sectionObj = {};
    // JSDOC Comment for the block
    const docletComment = doclet.comment.replace(/\/|\*|\s/g, '');
    let docDescription = doclet.description.replace(/\/|\*|\s/g, '');      // JSDOC description
    if (docletComment.indexOf(docDescription) > -1) {
        sectionObj.description = {
            startIndex: docletComment.indexOf(docDescription),
        };
    }

    let docExamples = doclet.examples;
    if (docExamples && docExamples.length) {
        docExamples.forEach((doc, index) => {
            doc = `@example${doc.replace(/\/|\*|\s/g, '')}`;
            if (docletComment.indexOf(doc) > -1) {
                sectionObj[`example${index}`] = {
                    order: index,
                    startIndex: docletComment.indexOf(doc),
                };
            }
        });
    }

    let textTags = doclet.tags && doclet.tags.filter(textTag => textTag.title === 'text');
    if (textTags && textTags.length) {
        textTags.forEach((doc, index) => {
            let textVal = doc.value.replace(/\/|\*|\s/g, '');
            if (docletComment.indexOf(textVal) > -1) {
                sectionObj[`text${index}`] = {
                    order: index,
                    startIndex: docletComment.indexOf(textVal),
                };
            }
        });
    }

    let infoBoxes = doclet.tags && doclet.tags.filter(infoBox => ['info', 'warning', 'alert'].includes(infoBox.title));
    if (infoBoxes && infoBoxes.length) {
        infoBoxes.forEach((infoBox, index) => {
            let infoText = `@${infoBox.title}${infoBox.value.replace(/\/|\*|\s/g, '')}`;
            if (docletComment.indexOf(infoText) > -1) {
                sectionObj[`${infoBox.title}${index}`] = {
                    order: index,
                    startIndex: docletComment.indexOf(infoText),
                };
            }
        });
    }

    let returnVal = doclet.returns;
    if (returnVal && returnVal.length) {
        returnVal.forEach((value, index) => {
            let val = value.description && value.description.replace(/\/|\*|\s/g, '');
            if (docletComment.indexOf(val) > -1) {
                sectionObj[`return${index}`] = {
                    order: index,
                    startIndex: docletComment.indexOf(val),
                };
            }
        });
    }

    let docParams = doclet.params;
    if (docParams && docParams.length) {
        let firstParamIndex = docletComment.indexOf('@param');
        sectionObj.params = {
            startIndex: firstParamIndex,
        };
    }

    // Sort the occurences of JSDOCS on starting index and generate YAML
    let sortedDocs = [];
    for (let key in sectionObj) {
        sortedDocs.push([key, sectionObj[key]]);
    }
    // Sort array in ascending order
    sortedDocs.sort((a, b) => a[1].startIndex - b[1].startIndex);

    let name = doclet.name;                         // name of current jsdoc item
    let classDescription = doclet.classdesc;        // descrption about the class (if any)
    const accessSpecifier = doclet.access;          // access specifier of the code block
    let { kind } = doclet;                          // kind of item
    let { scope } = doclet;
    let extendsItem = doclet.extends;
    let returnType;

    if (Array.isArray(extendsItem) && extendsItem.length > 0) {
        extendsItem = extendsItem[0];
    }

    if (doclet.returns) {
        returnType = doclet.returns.map(value => value.type && value.type.names.join(', '));
    }
    if (doclet.comment.includes('@constructor')) {
        name =
        '## <span style="font-family: Source Code Pro;font-weight: 500; color: #eb5757;"><a name="constructor"></a> constructor</span>';
    }
    if (classDescription) {
        name = `## <span style="font-family: Source Code Pro;font-weight: 500; color: #eb5757;"><a name=${name}></a> Class: ${name}</span>`;
    }

    if (kind === 'function') {
        if (returnType) {
            returnType = returnType.join(' ').replace(/</gi, '&lt;').replace(/>/gi, '&gt;').replace(/\./gi, ' ');
            returnType = `[${returnType}](${returnType})`;
            name = `<h2><span style="font-family: Source Code Pro;font-weight:500;font-size:24px;color: #eb5757"><a name=${name}></a> ${name} </span></h2>`;
        }
        else {
            name = `## <a name=${name}></a> ${name}`;
        }
    }

    if (kind === 'member' && scope && scope === 'static') {
        name = `## <span style="font-family: Source Code Pro;font-weight: 500; color: #eb5757;"><a name=${name}></a> static ${name}</span>`;
    }

    const description = classDescription || doclet.description;
    const shortName = doclet.longname.split(':')[1];
    if (shortName && doclet.name.toLowerCase() === shortName.toLowerCase()) {
        name = '';
    } else if (!name.match(/</g)) {
        name = `## <a name=${name}></a> <span style="font-family: Source Code Pro; font-weight: 500;color: #eb5757;">${name}</span>`;
    }

    /* eslint no-case-declarations: 0 */
    function createSections(arr) {
        const sections = [];
        arr.forEach((jsdoclet) => {
            if (CONSTANTS.DOCLET_TYPES.includes(jsdoclet[0].replace(/[0-9]/g, ''))) {
                let docIndex = CONSTANTS.DOCLET_TYPES.indexOf(jsdoclet[0].replace(/[0-9]/g, ''));
                const docletType = CONSTANTS.DOCLET_TYPES[docIndex];

                switch (docletType) {
                case 'description':
                    if (extendsItem) {
                        sections.push({
                            type: CONSTANTS.MARKDOWN_SECTION,
                            content: `${name}\n\n${description.replace(/{@link\s+.*?}/gi, replaceLink)}\n\nExtends: [${extendsItem}](api-${extendsItem})`,
                        });
                    }
                    else {
                        sections.push({
                            type: CONSTANTS.MARKDOWN_SECTION,
                            content: `${name}\n\n${description.replace(/{@link\s+.*?}/gi, replaceLink)}`,
                        });
                    }
                    break;
                case 'params':
                    let paramString = '';
                    // add parameters as a table
                    if (!classDescription && docParams && docParams.length) {
                        const paramsTree = generateNestedMap(docParams);
                        const paramTable = createTable('', paramsTree);
                        paramString = `<p class="sub-header">Parameters:</p>\n${paramTable}`;
                    }
                    if (paramString) {
                        sections.push({
                            type: CONSTANTS.MARKDOWN_SECTION,
                            content: paramString,
                        });
                    }
                    break;
                case 'example':
                    let order = jsdoclet[1].order;

                    // Append code block
                    if (docExamples && docExamples.length) {
                        let example = docExamples[order].trim();
                        // field to store preamble
                        let preamble = [];
                        // get the lines
                        let lines = example.split('\n');
                        let preambleStart = 0;
                        let preambleEnd = 0;
                        let count = 0;

                        // get the index of the preamble tags
                        lines.forEach((line, lIdx) => {
                            line = line.trim();
                            if (line === CONSTANTS.PREAMBLE_START) {
                                preambleStart = lIdx;
                            }
                            if (line === CONSTANTS.PREAMBLE_END) {
                                preambleEnd = lIdx;

                                // get the preamble content if it exists
                                if (preambleEnd - preambleStart) {
                                    for (let i = preambleStart + 1; i < preambleEnd; i += 1) {
                                        if (count === 0) {
                                            preamble.push({
                                                preTag: `${lines[i]}`
                                            });
                                        } else {
                                            preamble.push({
                                                endTag: `${lines[i]}`
                                            });
                                        }
                                    }
                                    ++count;
                                }
                            }
                        });

                        // get the index of the preamble tags
                        lines.forEach((line, lIdx) => {
                            line = line.trim();
                            if (line === CONSTANTS.PREAMBLE_START) {
                                preambleStart = lIdx;
                            }
                            if (line === CONSTANTS.PREAMBLE_END) {
                                preambleEnd = lIdx;
                                // get the preamble content if it exists
                                if (preambleEnd - preambleStart) {
                                    for (let i = preambleStart + 1; i < preambleEnd; i += 1) {
                                        delete lines[i];
                                    }
                                }
                            }
                        });

                        let linesWithoutStart = without(lines, CONSTANTS.PREAMBLE_START);
                        let linesWithoutEnd = without(linesWithoutStart, CONSTANTS.PREAMBLE_END);

                        const content = linesWithoutEnd.join('\n');

                        sections.push({
                            type: CONSTANTS.CODE_SECTION,
                            content,
                            preamble,
                            preambleWithContent: example,
                        });
                    }
                    break;
                case 'text':
                    let textOrder = jsdoclet[1].order;
                    const textValue = textTags[textOrder].value;
                    sections.push({
                        type: CONSTANTS.MARKDOWN_SECTION,
                        content: textValue.replace(/{@link\s(.)*}/gi, replaceLink)
                    });
                    break;
                case 'info':
                case 'warning':
                case 'alert':
                    let infoBoxOrder = jsdoclet[1].order;
                    let clonedInfoBox = infoBoxes[infoBoxOrder].value.split('\n');
                    let infoBoxTitle = clonedInfoBox.splice(0, 1)[0];
                    let infoBoxDescription = clonedInfoBox.join('\n');
                    sections.push({
                        type: 'Info',
                        content: {
                            subType: infoBoxes[infoBoxOrder].title,
                            title: infoBoxTitle,
                            description: infoBoxDescription
                        }
                    });
                    break;
                case 'return':
                    let returnOrder = jsdoclet[1].order;
                    const returnValue = returnVal[returnOrder];
                    let desc = returnValue.description;
                    // covert text inside ``` to non-executable code section
                    if (desc) {
                        let matchedArr = desc.match(/(```)([\s\S]*?)(```)/gm);
                        let backTickText = null;
                        if (matchedArr && matchedArr.length) {
                            backTickText = marked(matchedArr[0]);
                            desc = desc.replace(/(```)([\s\S]*?)(```)/gm, backTickText);
                            desc = marked(desc.replace(/{@link\s+.*?}/gi, replaceLink));
                        }
                    }
                    let returnedValue = returnValue.type.names.join(' ').replace(/</gi, '&lt;').replace(/>/gi, '&gt;').replace(/\./gi, '');

                    let returnedVal;
                    if (!CONSTANTS.NO_RETURN_LINK.includes(returnedValue.toLowerCase())) {
                        returnedVal = `<a name=${returnValue.type.names[returnOrder]}></a><p class="sub-header">Returns:</p>\n\n <span style="font-family: 'Source Code Pro';margin-left: 2%;">[${returnedValue}](api-${returnedValue}):&nbsp;</span>`;
                    } else {
                        returnedVal = `<a name=${returnValue.type.names[0]}></a><p class="sub-header">Returns:</p>\n\n <span style="font-family: 'Source Code Pro';margin-left: 2%;">${returnedValue}:&nbsp;</span>`;
                    }
                    if (desc) {
                        returnedVal = `${returnedVal}${desc}`;
                    }
                    sections.push({
                        type: CONSTANTS.MARKDOWN_SECTION,
                        content: returnedVal.replace(/{@link\s+.*?}/gi, replaceLink),
                    });
                    break;
                default:
                    throw new Error('unhandled JSDOC type');
                }
            }
        });
        return sections;
    }

    if (accessSpecifier === 'public') {
        const sections = createSections(sortedDocs);
        return sections;
    }
    return [];
}

exports.defineTags = (dictionary) => {
    dictionary.defineTag('extends', {
        onTagged: (doclet, tag) => {
            doclet.extends = doclet.extends || [];
            doclet.extends.push(tag.value);
        }
    });
};

let segmentArray = [];

exports.handlers = {
    /**
     * This function executes after JSDOC has parsed all the files and created doclets
     * @param {e} JSDOC configuration
     * @param {Array<Object>} e.doclets Array of JSDOC doclets
     */
    parseComplete(e) {
        const { doclets } = e;
        const fileMap = {};
        // Create a map of {fileName: doclet}
        doclets.forEach((doclet) => {
            const { filename } = doclet.meta;
            if (!fileMap[filename]) {
                fileMap[filename] = [];
            }
            fileMap[filename].push(doclet);
        });

        function getSegments(segmentTag) {
            return segmentTag
                            .some(obj => obj.originalTitle.toLowerCase().trim() === 'segment');
        }

        // Iterate each file and generate a YAML file for the same
        Object.keys(fileMap).forEach((docFile) => {
            let perFileDoclets = fileMap[docFile];
            // Remove doclets with no description text
            perFileDoclets = perFileDoclets.filter(doclet => (doclet.description ? doclet : null));

            const segmentDocs = perFileDoclets.filter(doclet =>
                doclet.tags && doclet.tags.length && getSegments(doclet.tags)
            );
            segmentArray = segmentArray.concat(segmentDocs);

            const docsWithoutSegments = perFileDoclets.filter(obj => segmentArray.indexOf(obj) === -1);
            let parsed = docsWithoutSegments.map(doclet => parseDoclet(doclet)).filter(item => item);
            parsed = parsed.reduce((accum, value) => [...accum, ...value], []);

            let destination = config.opts.yaml;
            let temp = docFile.split('-').join('').split('.');
            temp[temp.length - 1] = 'yml';
            let moduleFile = perFileDoclets.filter(doclet => doclet.kind === 'module' ? doclet : null);
            moduleFile.map((file) => {
                if (file.kind === 'module') {
                    temp[0] = file.name;
                }
            });
            let ymlFileName = `api-${temp.join('.')}`;

            temp[0] = temp[0].charAt(0).toUpperCase() + temp[0].substr(1).toLowerCase();
            let fileTitle = docFile.split('.js')[0];
            fileTitle = fileTitle.split('-');
            let fileDumpTitle = fileTitle.map((title) => {
                return title.charAt(0).toUpperCase() + title.substr(1).toLowerCase();
            }).join(' ');
            const fileDump = {
                title: fileDumpTitle,
                description: 'Documented Methods',
                sections: parsed,
            };
            // convert to YAML
            const yml = converter.stringify(fileDump);
            if (fileDump.sections.length) {
                // write the file
                fs.writeFile(`${destination}${ymlFileName.toLowerCase()}`, yml, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        });

        // Process the segment file
        const segmentObj = {};
        segmentArray.forEach((segment) => {
            segment.tags.forEach((tag) => {
                if (tag.originalTitle === 'segment') {
                    if (Object.prototype.hasOwnProperty.call(segmentObj, tag.value)) {
                        segmentObj[tag.value].push(segment);
                    }
                    else {
                        segmentObj[tag.value] = [];
                        segmentObj[tag.value].push(segment);
                    }
                }
            });
        });

        let yamlFiles = fs.readdirSync('./yaml');
        yamlFiles = yamlFiles.map(file => file.toLowerCase());

        for (let obj in segmentObj) {
            const sameLevel = true;
            let objParsed = segmentObj[obj].map(doclet => parseDoclet(doclet, sameLevel)).filter(item => item);
            objParsed = objParsed.reduce((accum, value) => [...accum, ...value], []);
            const fileDump = {
                title: obj,
                description: 'Documented Methods',
                sections: objParsed
            };
            const yml = converter.stringify(fileDump);
            let yamlFileName = `api-${obj}.yml`;
            yamlFileName = yamlFileName.toLowerCase();

            if (!yamlFiles.includes(yamlFileName)) {
                fs.writeFile(`./yaml/${yamlFileName}`, yml, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
            } else {
                // If a file with the same @segment name is present append data to that file
                fs.readFile(`./yaml/${yamlFileName}`, 'utf-8', (error, content) => {
                    if (error) {
                        throw new Error(error.message);
                    }
                    const data = yaml.parse(content);
                    let dataSections = JSON.parse(JSON.stringify(data.sections));
                    dataSections = dataSections.concat(objParsed);
                    const newDataObj = {
                        title: data.title,
                        description: 'Documented Methods',
                        sections: dataSections
                    };
                    const newYmlData = converter.stringify(newDataObj);
                    fs.writeFile(`./yaml/${yamlFileName}`, newYmlData, (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                });
            }
        }
    }
};
