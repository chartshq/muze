/* global describe, it,document */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import ColorAxis from './color-axis';

describe('Color Axis', () => {
    const bandOrdinal = new ColorAxis({
        type: 'ordinal',
        domain: ['a', 'b', 'c']
    });
    const bandSequential = new ColorAxis({
        type: 'ordinal',
        domain: ['a', 'b', 'c'],
        range: 'interpolateBlues'
    });
    const linearOrdinalGradient = new ColorAxis({
        type: 'linear',
        domain: [100, 2000]
    });
    const linearOrdinalStep = new ColorAxis({
        type: 'linear',
        domain: [100, 2000],
        step: true
    });
    const linearSequentialGradient = new ColorAxis({
        type: 'linear',
        domain: [100, 2000],
        range: 'interpolateBlues'
    });
    const linearSequentialStep = new ColorAxis({
        type: 'linear',
        domain: [100, 2000],
        step: true,
        range: 'interpolateBlues'
    });
    it('tests construction of band color axis with discrete scale', () => {
        expect(
            bandOrdinal
        ).to.be.defined;
    });
    it('tests construction of band color axis with sequential scale', () => {
        expect(
            bandSequential
        ).to.be.defined;
    });
    it('tests construction of gradient color axis with discrete scale', () => {
        expect(
            linearOrdinalGradient
        ).to.be.defined;
    });
    it('tests construction of gradient color axis with sequential scale', () => {
        expect(
            linearSequentialGradient
        ).to.be.defined;
    });
    it('tests construction of step color axis with discrete scale', () => {
        expect(
            linearOrdinalStep
        ).to.be.defined;
    });
    it('tests construction of step color axis with sequential scale', () => {
        expect(
            linearSequentialStep
        ).to.be.defined;
    });
});

