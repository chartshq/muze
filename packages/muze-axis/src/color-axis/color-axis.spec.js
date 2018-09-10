/* global describe, it,document */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import ColorAxis from './color-axis';

const palette1 = ['red'];
const palette3 = ['red', 'green', 'blue'];

describe('Color Axis For Dimensions', () => {
    const bandOrdinal = new ColorAxis({
        type: 'ordinal',
        domain: ['a', 'b', 'c'],
        range: palette3
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
        range: palette3
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
