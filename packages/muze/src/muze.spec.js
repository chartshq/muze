/* global describe, it */

import { expect } from 'chai';

import muze from './muze';

describe('#layerRegistry', () => {
    it('should get layers', () => {
        expect(muze.registry.layers.get()).to.be.an.instanceOf(Object);
    });

    it('should register new layers', () => {
        const { bar: BarLayer } = muze.registry.layers.get();

        class CustomBar extends BarLayer {
            static formalName () {
                return 'custom-bar';
            }
        }
        muze.registry.layers.register(CustomBar);
        const customBar = muze.registry.layers.get()['custom-bar'];
        expect(customBar).to.equals(CustomBar);
    });
});
