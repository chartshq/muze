/* global describe, it,document */
import { expect } from 'chai';
import ColorAxis from './color-axis';

const palette1 = ['red'];
const palette2 = ['red', 'green', 'blue'];

describe('Color Axis', () => {
    const axis = new ColorAxis({
        type: 'ordinal',
        domain: ['a', 'b', 'c'],
        range: palette2
    });
    it('tests construction of color axis', () => {
        expect(
            axis
        ).to.be.defined;
    });
    it('tests transformation of colors', () => {
        expect(
            axis.transformColor([1, 0.5, 0.5, 1], [0, 0, 20, 0])
        ).to.deep.equal({
            color: 'hsla(360,50%,70%,1)',
            hsla: [1, 0.5, 0.7, 1]
        });
    });
    it('tests getting raw color', () => {
        expect(
            axis.getRawColor('a').map(e => Math.round(e * 100) / 100)
        ).to.deep.equal([0, 1, 0.5, 1]);
    });
    it('tests getting hsla color', () => {
        expect(
            axis.getColor('a')
        ).to.deep.equal('hsla(0,100%,50%,1)');
    });
    it('tests getting correct hsl string', () => {
        expect(
            axis.getHslString([0.5, 0.5, 0.5, 1])
        ).to.deep.equal('hsla(180,50%,50%,1)');
    });
});

describe('Color Axis For Dimensions', () => {
    const bandOrdinal = new ColorAxis({
        type: 'ordinal',
        domain: ['a', 'b', 'c'],
        range: palette2
    });
    const bandSequential = new ColorAxis({
        type: 'ordinal',
        domain: ['a', 'b', 'c'],
        range: 'interpolateBlues'
    });
    it('tests construction with discrete range', () => {
        expect(
            bandOrdinal
        ).to.be.defined;
    });
    it('tests correct hsla raw color values for discrete scale', () => {
        expect(
            bandOrdinal.getRawColor('a')
        ).to.deep.equal([0, 1, 0.5, 1]);
    });
    it('tests construction with sequential range', () => {
        expect(
            bandSequential
        ).to.be.defined;
    });
    it('tests correct hsla raw color values for sequential scale', () => {
        expect(
            bandSequential.getRawColor('c').map(e => Math.round(e * 100) / 100)
        ).to.deep.equal([0.6, 0.86, 0.23, 1]);
    });
});

describe('Color Axis For Measures', () => {
    const discreteGradient = new ColorAxis({
        type: 'linear',
        domain: [100, 2000],
        range: palette1
    });

    // GRADIENT color : DISCRETE range
    it('tests construction of gradient color scale with discrete range', () => {
        expect(
            discreteGradient
        ).to.be.defined;
    });

    it('tests correct hsla raw color values for gradient color scale with discrete range', () => {
        expect(
            discreteGradient.getRawColor(2000)
        ).to.deep.equal([0, 1, 0.5, 1]);
        expect(
            discreteGradient.getRawColor(1000).map(e => Math.round(e * 100) / 100)
        ).to.deep.equal([0, 0.85, 0.72, 1]);
    });

    const sequentialGradient = new ColorAxis({
        type: 'linear',
        domain: [100, 2000],
        range: 'interpolateBlues'
    });

     // GRADIENT color : SEQUENTIAL range
    it('tests construction of gradient color scale with sequential range', () => {
        expect(
            sequentialGradient
        ).to.be.defined;
    });

    it('tests correct hsla raw color values for gradient color scale with sequential range', () => {
        expect(
            sequentialGradient.getRawColor(2000).map(e => Math.round(e * 100) / 100)
        ).to.deep.equal([0.6, 0.86, 0.23, 1]);
    });

    const discreteStep = new ColorAxis({
        type: 'linear',
        domain: [100, 2000],
        step: true,
        stops: 3,
        range: palette2
    });

    // STEP color : DISCRETE range
    it('tests construction of step color scale with discrete range', () => {
        expect(
            discreteStep
        ).to.be.defined;
    });

    it('tests correct hsla raw color values for step color scale with discrete range', () => {
        expect(
            discreteStep.getRawColor(2000).map(e => Math.round(e * 100) / 100)
        ).to.deep.equal([0.67, 1, 0.5, 1]);
        expect(
            discreteStep.getRawColor(1000).map(e => Math.round(e * 100) / 100)
        ).to.deep.equal([0.33, 1, 0.25, 1]);
    });

    const sequentialStep = new ColorAxis({
        type: 'linear',
        domain: [100, 2000],
        step: true,
        stops: 3,
        range: 'interpolateBlues'
    });

    // STEP color : SEQUENTIAL range
    it('tests construction of step color scale with sequential range', () => {
        expect(
            sequentialStep
        ).to.be.defined;
    });

    it('tests correct hsla raw color values for step color scale with sequential range', () => {
        expect(
            sequentialStep.getRawColor(2000).map(e => Math.round(e * 100) / 100)
        ).to.deep.equal([0.6, 0.86, 0.23, 1]);
        expect(
            sequentialStep.getRawColor(1000).map(e => Math.round(e * 100) / 100)
        ).to.deep.equal([0.56, 0.55, 0.66, 1]);
    });
});
