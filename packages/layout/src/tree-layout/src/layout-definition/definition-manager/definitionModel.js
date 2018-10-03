export default class DefinitionModel {
    constructor (host, cut, ratioWeight, preferred, lanes) {
        this.host = host || null;
        this.cut = cut || 'h';
        this.ratioWeight = ratioWeight || 1;
        this.preferred = preferred || false;
        this.lanes = lanes || [];
        this._remainingHeight = 0;
        this._remainingWidth = 0;
    }
  // get host () {
  //   return this._host
  // }

  // set host (host) {
  //   this._host = host
  //   return this
  // }
  // get cut () {
  //   return this._cut
  // }

  // set cut (cut) {
  //   this._cut = cut
  //   return this
  // }
  // get ratioWeight () {
  //   return this._ratioWeight
  // }

  // set ratioWeight (ratioWeight) {
  //   this._ratioWeight = ratioWeight
  //   return this
  // }
  // get preferred () {
  //   return this._preferred
  // }

  // set preferred (preferred) {
  //   this._preferred = preferred
  //   return this
  // }
  // get lanes () {
  //   return this._lanes
  // }

  // set lanes (lanes) {
  //   this._lanes = lanes
  //   return this
  // }

  // set _remainingHeight (h) {
  //   this.__remainingHeight = h
  // }

  // get _remainingHeight () {
  //   return this.__remainingHeight
  // }

  // set _remainingWidth (w) {
  //   this.__remainingWidth = w
  // }

  // get _remainingWidth () {
  //   return this.__remainingWidth
  // }
}
