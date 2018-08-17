/* eslint-disable */
const OBJECTSTRING = 'object';
const objectToStrFn = Object.prototype.toString;
const objectToStr = '[object Object]';
const arrayToStr = '[object Array]';

function checkCyclicRef(obj, parentArr) {
    let i = parentArr.length;
    let bIndex = -1;

    while (i) {
        if (obj === parentArr[i]) {
            bIndex = i;
            return bIndex;
        }
        i -= 1;
    }

    return bIndex;
}

function merge(obj1, obj2, skipUndef, tgtArr, srcArr) {
    var item,
        srcVal,
        tgtVal,
        str,
        cRef;
    // check whether obj2 is an array
    // if array then iterate through it's index
    // **** MOOTOOLS precution

    if (!srcArr) {
        tgtArr = [obj1];
        srcArr = [obj2];
    }
    else {
        tgtArr.push(obj1);
        srcArr.push(obj2);
    }

    if (obj2 instanceof Array) {
        for (item = 0; item < obj2.length; item += 1) {
            try {
                srcVal = obj1[item];
                tgtVal = obj2[item];
            }
            catch (e) {
                continue;
            }

            if (typeof tgtVal !== OBJECTSTRING) {
                if (!(skipUndef && tgtVal === undefined)) {
                    obj1[item] = tgtVal;
                }
            }
            else {
                if (srcVal === null || typeof srcVal !== OBJECTSTRING) {
                    srcVal = obj1[item] = tgtVal instanceof Array ? [] : {};
                }
                cRef = checkCyclicRef(tgtVal, srcArr);
                if (cRef !== -1) {
                    srcVal = obj1[item] = tgtArr[cRef];
                }
                else {
                    merge(srcVal, tgtVal, skipUndef, tgtArr, srcArr);
                }
            }
        }
    }
    else {
        for (item in obj2) {
            try {
                srcVal = obj1[item];
                tgtVal = obj2[item];
            }
            catch (e) {
                continue;
            }

            if (tgtVal !== null && typeof tgtVal === OBJECTSTRING) {
                // Fix for issue BUG: FWXT-602
                // IE < 9 Object.prototype.toString.call(null) gives
                // '[object Object]' instead of '[object Null]'
                // that's why null value becomes Object in IE < 9
                str = objectToStrFn.call(tgtVal);
                if (str === objectToStr) {
                    if (srcVal === null || typeof srcVal !== OBJECTSTRING) {
                        srcVal = obj1[item] = {};
                    }
                    cRef = checkCyclicRef(tgtVal, srcArr);
                    if (cRef !== -1) {
                        srcVal = obj1[item] = tgtArr[cRef];
                    }
                    else {
                        merge(srcVal, tgtVal, skipUndef, tgtArr, srcArr);
                    }
                }
                else if (str === arrayToStr) {
                    if (srcVal === null || !(srcVal instanceof Array)) {
                        srcVal = obj1[item] = [];
                    }
                    cRef = checkCyclicRef(tgtVal, srcArr);
                    if (cRef !== -1) {
                        srcVal = obj1[item] = tgtArr[cRef];
                    }
                    else {
                        merge(srcVal, tgtVal, skipUndef, tgtArr, srcArr);
                    }
                }
                else {
                    obj1[item] = tgtVal;
                }
            }
            else {
                if (skipUndef && tgtVal === undefined) {
                    continue;
                }
                obj1[item] = tgtVal;
            }
        }
    }
    return obj1;
}


function extend2 (obj1, obj2, skipUndef) {
    //if none of the arguments are object then return back
    if (typeof obj1 !== OBJECTSTRING && typeof obj2 !== OBJECTSTRING) {
        return null;
    }

    if (typeof obj2 !== OBJECTSTRING || obj2 === null) {
        return obj1;
    }

    if (typeof obj1 !== OBJECTSTRING) {
        obj1 = obj2 instanceof Array ? [] : {};
    }
    merge(obj1, obj2, skipUndef);
    return obj1;
}

export { extend2 as default };
