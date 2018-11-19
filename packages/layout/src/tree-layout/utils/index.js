/* eslint no-undef: "off" */
/* eslint default-case: "off" */
export class Utils {
    static isDOMElement (element) {
        return element instanceof Element;
    }

    static getID (element) {
        return element.id;
    }

    static getElement (id) {
        return document.getElementById(id);
    }

    static findContainer (data) {
        return data.filter(coordinate => coordinate.parent == null)[0];
    }
  /**
   * static method to remove the div
   * @param  {} divId - div ID to be removed.
   */
    static removeDiv (divId) {
        if (document.getElementById(divId) !== null) { document.getElementById(divId).remove(); }
    }
}
