/**
 * Creates a JS native date object from input
 *
 * @param {string | number | Date} date Input using which date object to be created
 * @return {Date} : JS native date object
 */
function convertToNativeDate (date) {
    if (date instanceof Date) {
        return date;
    }

    return new Date(date);
}
/**
 * Apply padding before a number if its less than 1o. This is used when constant digit's number to be returned
 * between 0 - 99
 *
 * @param {number} n Input to be padded
 * @return {string} Padded number
 */
function pad (n) {
    return (n < 10) ? (`0${n}`) : n;
}
/*
 * DateFormatter utility to convert any date format to any other date format
 * DateFormatter parse a date time stamp specified by a user abiding by rules which are defined
 * by user in terms of token. It creates JS native date object from the user specified format.
 * That native date can also be displayed
 * in any specified format.
 * This utility class only takes care of format conversion only
 */

/*
 * Escapes all the special character that are used in regular expression.
 * Like
 * RegExp.escape('sgfd-$') // Output: sgfd\-\$
 *
 * @param text {String} : text which is to be escaped
 */
RegExp.escape = function (text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

/**
 * DateTimeFormatter class to convert any user format of date time stamp to any other format
 * of date time stamp.
 *
 * @param {string} format Format of the date given. For the above date,
 * 'year: %Y, month: %b, day: %d'.
 * @class
 */
/* istanbul ignore next */ function DateTimeFormatter (format) {
    this.format = format;
    this.dtParams = undefined;
    this.nativeDate = undefined;
}

// The identifier of the tokens
DateTimeFormatter.TOKEN_PREFIX = '%';

// JS native Date constructor takes the date params (year, month, etc) in a certail sequence.
// This defines the sequence of the date parameters in the constructor.
DateTimeFormatter.DATETIME_PARAM_SEQUENCE = {
    YEAR: 0,
    MONTH: 1,
    DAY: 2,
    HOUR: 3,
    MINUTE: 4,
    SECOND: 5,
    MILLISECOND: 6
};

/*
 * This is a default number parsing utility. It tries to parse a number in integer, if parsing is unsuccessful, it
 * gives back a default value.
 *
 * @param: defVal {Number} : Default no if the parsing to integer is not successful
 * @return {Function} : An closure function which is to be called by passing an the value which needs to be parsed.
 */
DateTimeFormatter.defaultNumberParser = function (defVal) {
    return function (val) {
        let parsedVal;
        if (isFinite(parsedVal = parseInt(val, 10))) {
            return parsedVal;
        }

        return defVal;
    };
};

/*
 * This is a default number range utility. It tries to find an element in the range. If not found it returns a
 * default no as an index.
 *
 * @param: range {Array} : The list which is to be serached
 * @param: defVal {Number} : Default no if the serach and find does not return anything
 * @return {Function} : An closure function which is to be called by passing an the value which needs to be found
 */
DateTimeFormatter.defaultRangeParser = function (range, defVal) {
    return (val) => {
        let i;
        let l;

        if (!val) { return defVal; }

        const nVal = val.toLowerCase();

        for (i = 0, l = range.length; i < l; i++) {
            if (range[i].toLowerCase() === nVal) {
                return i;
            }
        }

        if (i === undefined) {
            return defVal;
        }
        return null;
    };
};

/*
 * Defines the tokens which are supporter by the dateformatter. Using this definitation a value gets extracted from
 * the user specifed date string. This also formats the value for display purpose from native JS date.
 * The definition of each token contains the following named properties
 * {
 *     %token_name% : {
 *         name: name of the token, this is used in reverse lookup,
 *         extract: a function that returns the regular expression to extract that piece of information. All the
 *                  regex should be gouped by using ()
 *         parser: a function which receives value extracted by the above regex and parse it to get the date params
 *         formatter: a formatter function that takes milliseconds or JS Date object and format the param
 *                  represented by the token only.
 *     }
 * }
 *
 * @return {Object} : Definition of the all the supported tokens.
 */
DateTimeFormatter.getTokenDefinitions = function () {
    const daysDef = {
        short: [
            'Sun',
            'Mon',
            'Tue',
            'Wed',
            'Thu',
            'Fri',
            'Sat'
        ],
        long: [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
        ]
    };
    const monthsDef = {
        short: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
        ],
        long: [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ]
    };

    const definitions = {
        H: {
            // 24 hours format
            name: 'H',
            index: 3,
            extract () { return '(\\d+)'; },
            parser: DateTimeFormatter.defaultNumberParser(),
            formatter (val) {
                const d = convertToNativeDate(val);

                return d.getHours().toString();
            }
        },
        l: {
            // 12 hours format
            name: 'l',
            index: 3,
            extract () { return '(\\d+)'; },
            parser: DateTimeFormatter.defaultNumberParser(),
            formatter (val) {
                const d = convertToNativeDate(val);
                const hours = d.getHours() % 12;

                return (hours === 0 ? 12 : hours).toString();
            }
        },
        p: {
            // AM or PM
            name: 'p',
            index: 3,
            extract () { return '(AM|PM)'; },
            parser: (val) => {
                if (val) {
                    return val.toLowerCase();
                }
                return null;
            },
            formatter: (val) => {
                const d = convertToNativeDate(val);
                const hours = d.getHours();

                return (hours < 12 ? 'AM' : 'PM');
            }
        },
        P: {
            // am or pm
            name: 'P',
            index: 3,
            extract () { return '(am|pm)'; },
            parser: (val) => {
                if (val) {
                    return val.toLowerCase();
                }
                return null;
            },
            formatter: (val) => {
                const d = convertToNativeDate(val);
                const hours = d.getHours();

                return (hours < 12 ? 'am' : 'pm');
            }
        },
        M: {
            // Two digit minutes 00 - 59
            name: 'M',
            index: 4,
            extract () { return '(\\d+)'; },
            parser: DateTimeFormatter.defaultNumberParser(),
            formatter (val) {
                const d = convertToNativeDate(val);
                const mins = d.getMinutes();

                return pad(mins);
            }
        },
        S: {
            // Two digit seconds 00 - 59
            name: 'S',
            index: 5,
            extract () { return '(\\d+)'; },
            parser: DateTimeFormatter.defaultNumberParser(),
            formatter (val) {
                const d = convertToNativeDate(val);
                const seconds = d.getSeconds();

                return pad(seconds);
            }
        },
        K: {
            // Milliseconds
            name: 'K',
            index: 6,
            extract () { return '(\\d+)'; },
            parser: DateTimeFormatter.defaultNumberParser(),
            formatter (val) {
                const d = convertToNativeDate(val);
                const ms = d.getMilliseconds();

                return ms.toString();
            }
        },
        a: {
            // Short name of day, like Mon
            name: 'a',
            index: 2,
            extract () { return `(${daysDef.short.join('|')})`; },
            parser: DateTimeFormatter.defaultRangeParser(daysDef.short),
            formatter (val) {
                const d = convertToNativeDate(val);
                const day = d.getDay();

                return (daysDef.short[day]).toString();
            }
        },
        A: {
            // Long name of day, like Monday
            name: 'A',
            index: 2,
            extract () { return `(${daysDef.long.join('|')})`; },
            parser: DateTimeFormatter.defaultRangeParser(daysDef.long),
            formatter (val) {
                const d = convertToNativeDate(val);
                const day = d.getDay();

                return (daysDef.long[day]).toString();
            }
        },
        e: {
            // 8 of March, 11 of November
            name: 'e',
            index: 2,
            extract () { return '(\\d+)'; },
            parser: DateTimeFormatter.defaultNumberParser(),
            formatter (val) {
                const d = convertToNativeDate(val);
                const day = d.getDate();

                return day.toString();
            }
        },
        d: {
            // 08 of March, 11 of November
            name: 'd',
            index: 2,
            extract () { return '(\\d+)'; },
            parser: DateTimeFormatter.defaultNumberParser(),
            formatter (val) {
                const d = convertToNativeDate(val);
                const day = d.getDate();

                return pad(day);
            }
        },
        b: {
            // Short month, like Jan
            name: 'b',
            index: 1,
            extract () { return `(${monthsDef.short.join('|')})`; },
            parser: DateTimeFormatter.defaultRangeParser(monthsDef.short),
            formatter (val) {
                const d = convertToNativeDate(val);
                const month = d.getMonth();

                return (monthsDef.short[month]).toString();
            }
        },
        B: {
            // Long month, like January
            name: 'B',
            index: 1,
            extract () { return `(${monthsDef.long.join('|')})`; },
            parser: DateTimeFormatter.defaultNumberParser(monthsDef.long),
            formatter (val) {
                const d = convertToNativeDate(val);
                const month = d.getMonth();

                return (monthsDef.long[month]).toString();
            }
        },
        m: {
            // Two digit month of year like 01 for January
            name: 'm',
            index: 1,
            extract () { return '(\\d+)'; },
            parser (val) { return DateTimeFormatter.defaultNumberParser()(val) - 1; },
            formatter (val) {
                const d = convertToNativeDate(val);
                const month = d.getMonth();

                return pad(month + 1);
            }
        },
        y: {
            // Short year like 90 for 1990
            name: 'y',
            index: 0,
            extract () { return '(\\d{4})'; },
            parser (val) {
                if (val) {
                    const l = val.length;
                    val = val.substring(l - 2, l);
                }

                return DateTimeFormatter.defaultNumberParser()(val);
            },
            formatter (val) {
                const d = convertToNativeDate(val);
                let year = d.getFullYear().toString();
                let l;

                if (year) {
                    l = year.length;
                    year = year.substring(l - 2, l);
                }

                return year;
            }
        },
        Y: {
            // Long year like 1990
            name: 'Y',
            index: 0,
            extract () { return '(\\d{4})'; },
            parser: DateTimeFormatter.defaultNumberParser(),
            formatter (val) {
                const d = convertToNativeDate(val);
                const year = d.getFullYear().toString();

                return year;
            }
        }
    };

    return definitions;
};

/*
 * The tokens which works internally is not user friendly in terms of memorizing the names. This gives a formal
 * definition to the informal notations.
 *
 * @return {Object} : Formal definition of the tokens
 */
DateTimeFormatter.getTokenFormalNames = function () {
    const definitions = DateTimeFormatter.getTokenDefinitions();

    return {
        HOUR: definitions.H,
        HOUR_12: definitions.l,
        AMPM_UPPERCASE: definitions.p,
        AMPM_LOWERCASE: definitions.P,
        MINUTE: definitions.M,
        SECOND: definitions.S,
        SHORT_DAY: definitions.a,
        LONG_DAY: definitions.A,
        DAY_OF_MONTH: definitions.e,
        DAY_OF_MONTH_CONSTANT_WIDTH: definitions.d,
        SHORT_MONTH: definitions.b,
        LONG_MONTH: definitions.B,
        MONTH_OF_YEAR: definitions.m,
        SHORT_YEAR: definitions.y,
        LONG_YEAR: definitions.Y
    };
};

/*
 * This defines the rules and declares dependencies that resolves a date parameter (year, month etc) from
 * the date time parameter array.
 *
 * @return {Object} : An object that contains dependencies and a resolver function. The dependencies values are fed
 *                  to the resolver function in that particular sequence only.
 */
DateTimeFormatter.tokenResolver = function () {
    const definitions = DateTimeFormatter.getTokenDefinitions();
    const defaultResolver = (...args) => { // eslint-disable-line require-jsdoc
        let i = 0;
        let arg;
        let targetParam;
        const l = args.length;

        for (; i < l; i++) {
            arg = args[i];
            if (args[i]) {
                targetParam = arg;
            }
        }

        if (!targetParam) { return null; }

        return targetParam[0].parser(targetParam[1]);
    };

    return {
        YEAR: [definitions.y, definitions.Y,
            defaultResolver
        ],
        MONTH: [definitions.b, definitions.B, definitions.m,
            defaultResolver
        ],
        DAY: [definitions.a, definitions.A, definitions.e, definitions.d,
            defaultResolver
        ],
        HOUR: [definitions.H, definitions.l, definitions.p, definitions.P,
            function (hourFormat24, hourFormat12, ampmLower, ampmUpper) {
                let targetParam;
                let amOrpm;
                let isPM;
                let val;

                if (hourFormat12 && (amOrpm = (ampmLower || ampmUpper))) {
                    if (amOrpm[0].parser(amOrpm[1]) === 'pm') {
                        isPM = true;
                    }

                    targetParam = hourFormat12;
                } else if (hourFormat12) {
                    targetParam = hourFormat12;
                } else {
                    targetParam = hourFormat24;
                }

                if (!targetParam) { return null; }

                val = targetParam[0].parser(targetParam[1]);
                if (isPM) {
                    val += 12;
                }
                return val;
            }
        ],
        MINUTE: [definitions.M,
            defaultResolver
        ],
        SECOND: [definitions.S,
            defaultResolver
        ]
    };
};

/*
 * Finds token from the format rule specified by a user.
 * @param format {String} : The format of the input date specified by the user
 * @return {Array} : An array of objects which contains the available token and their occurence index in the format
 */
DateTimeFormatter.findTokens = function (format) {
    const tokenPrefix = DateTimeFormatter.TOKEN_PREFIX;
    const definitions = DateTimeFormatter.getTokenDefinitions();
    const tokenLiterals = Object.keys(definitions);
    const occurrence = [];
    let i;
    let forwardChar;

    while ((i = format.indexOf(tokenPrefix, i + 1)) >= 0) {
        forwardChar = format[i + 1];
        if (tokenLiterals.indexOf(forwardChar) === -1) { continue; }

        occurrence.push({
            index: i,
            token: forwardChar
        });
    }

    return occurrence;
};

/*
 * Format any JS date to a specified date given by user.
 *
 * @param date {Number | Date} : The date object which is to be formatted
 * @param format {String} : The format using which the date will be formatted for display
 */
DateTimeFormatter.formatAs = function (date, format) {
    const nDate = convertToNativeDate(date);
    const occurrence = DateTimeFormatter.findTokens(format);
    const definitions = DateTimeFormatter.getTokenDefinitions();
    let formattedStr = String(format);
    const tokenPrefix = DateTimeFormatter.TOKEN_PREFIX;
    let token;
    let formattedVal;
    let i;
    let l;

    for (i = 0, l = occurrence.length; i < l; i++) {
        token = occurrence[i].token;
        formattedVal = definitions[token].formatter(nDate);
        formattedStr = formattedStr.replace(new RegExp(tokenPrefix + token, 'g'), formattedVal);
    }

    return formattedStr;
};

/*
 * Parses the user specified date string to extract the date time params.
 *
 * @return {Array} : Value of date time params in an array [year, month, day, hour, minutes, seconds, milli]
 */
DateTimeFormatter.prototype.parse = function (dateTimeStamp, options) {
    const tokenResolver = DateTimeFormatter.tokenResolver();
    const dtParams = this.extractTokenValue(dateTimeStamp);
    const dtParamSeq = DateTimeFormatter.DATETIME_PARAM_SEQUENCE;
    const noBreak = options && options.noBreak;
    const dtParamArr = [];
    const args = [];
    let resolverKey;
    let resolverParams;
    let resolverFn;
    let val;
    let i;
    let param;
    let resolvedVal;
    let l;

    for (resolverKey in tokenResolver) {
        if (!{}.hasOwnProperty.call(tokenResolver, resolverKey)) { continue; }

        args.length = 0;
        resolverParams = tokenResolver[resolverKey];
        resolverFn = resolverParams.splice(resolverParams.length - 1, 1)[0];

        for (i = 0, l = resolverParams.length; i < l; i++) {
            param = resolverParams[i];
            val = dtParams[param.name];

            if (val === undefined) {
                args.push(null);
            } else {
                args.push([param, val]);
            }
        }

        resolvedVal = resolverFn.apply(this, args);

        if ((resolvedVal === undefined || resolvedVal === null) && !noBreak) {
            break;
        }

        dtParamArr[dtParamSeq[resolverKey]] = resolvedVal;
    }

    return dtParamArr;
};

/*
 * Extract the value of the token from user specified date time string.
 *
 * @return {Object} : An key value pair which contains the tokens as key and value as pair
 */
DateTimeFormatter.prototype.extractTokenValue = function (dateTimeStamp) {
    const format = this.format;
    const definitions = DateTimeFormatter.getTokenDefinitions();
    const tokenPrefix = DateTimeFormatter.TOKEN_PREFIX;
    const occurrence = DateTimeFormatter.findTokens(format);
    const tokenObj = {};

    let lastOccurrenceIndex;
    let occObj;
    let occIndex;
    let targetText;
    let regexFormat;

    let l;
    let i;

    regexFormat = String(format);

    const tokenArr = occurrence.map(obj => obj.token);
    const occurrenceLength = occurrence.length;
    for (i = occurrenceLength - 1; i >= 0; i--) {
        occIndex = occurrence[i].index;

        if (occIndex + 1 === regexFormat.length - 1) {
            lastOccurrenceIndex = occIndex;
            continue;
        }

        if (lastOccurrenceIndex === undefined) {
            lastOccurrenceIndex = regexFormat.length;
        }

        targetText = regexFormat.substring(occIndex + 2, lastOccurrenceIndex);
        regexFormat = regexFormat.substring(0, occIndex + 2) +
            RegExp.escape(targetText) +
            regexFormat.substring(lastOccurrenceIndex, regexFormat.length);

        lastOccurrenceIndex = occIndex;
    }

    for (i = 0; i < occurrenceLength; i++) {
        occObj = occurrence[i];
        regexFormat = regexFormat.replace(tokenPrefix + occObj.token, definitions[occObj.token].extract());
    }

    const extractValues = dateTimeStamp.match(new RegExp(regexFormat)) || [];
    extractValues.shift();

    for (i = 0, l = tokenArr.length; i < l; i++) {
        tokenObj[tokenArr[i]] = extractValues[i];
    }
    return tokenObj;
};

/*
 * Give back the JS native date formed from  user specified date string
 *
 * @return {Date} : Native JS Date
 */
DateTimeFormatter.prototype.getNativeDate = function (dateTimeStamp) {
    if (dateTimeStamp instanceof Date) {
        return dateTimeStamp;
    } else if (isFinite(dateTimeStamp) && !!this.format) {
        return new Date(dateTimeStamp);
    }

    const dtParams = this.dtParams = this.parse(dateTimeStamp);

    dtParams.unshift(null);
    this.nativeDate = new (Function.prototype.bind.apply(Date, dtParams))();
    return this.nativeDate;
};

/*
 * Represents JS native date to a user specified format.
 *
 * @param format {String} : The format according to which the date is to be represented
 * @return {String} : The formatted date string
 */
DateTimeFormatter.prototype.formatAs = function (format, dateTimeStamp) {
    let nativeDate;

    if (dateTimeStamp) {
        nativeDate = this.nativeDate = this.getNativeDate(dateTimeStamp);
    } else if (!(nativeDate = this.nativeDate)) {
        nativeDate = this.getNativeDate(dateTimeStamp);
    }

    return DateTimeFormatter.formatAs(nativeDate, format);
};

export { DateTimeFormatter as default };
