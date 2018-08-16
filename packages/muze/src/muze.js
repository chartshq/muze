/**
 * The accumulator factory namespace muze which provides an consistence api to work with the renderer.
 * Please read the usage.md file for usage informaiton.
 */
import Smartlabel from 'fusioncharts-smartlabel';
import { transactor, enableChainedTransaction, LifeCycleManager } from 'muze-utils';
import { SurrogateSideEffect, SpawnableSideEffect, sideEffects } from 'muze-firebolt';
import { layerFactory } from 'visual-layer';
import DataModel from 'datamodel';
import pkg from '../package.json';
import * as operators from './operators';
import { actionModel as ActionModel } from './action-model';
import options from './options';
import { Canvas } from './canvas';
import { COMPONENTS, SUBREGISTRIES } from './default-registry';
import './muze.scss';

// Holder of singleton instances
const globalCache = {};
 // @todo currently components are used as default registry
const defaultRegistry = COMPONENTS;

const muze = () => {
    // Setters and getters will be mounted on this. The object will be mutated.
    const [holder, globalStore] = transactor({}, options);
    const components = Object.assign({}, COMPONENTS);
    // Create instance of sub-registries
    const componentSubRegistryDef = Object.assign(SUBREGISTRIES);
    const componentSubRegistry = {};

    for (const prop in componentSubRegistryDef) {
        componentSubRegistry[prop] = componentSubRegistryDef[prop]();
    }

    // Apart form the setter getter, an instance method is injected to create real renderer instances
    holder.canvas = () => {
        // Create a canvas instance with this settings
        const settings = globalStore.serialize();
        const canvas = Canvas.withSettings(settings, { /* registry */
            components,
            componentSubRegistry
        }, holder.globalDependencies());

        // Whenever settings will be changed canvas will be changed to update its settings
        enableChainedTransaction(globalStore, canvas, Object.keys(settings));

        return canvas;
    };

    // Global dependencies for for compositions. Only one copy of the same should be in the page
    holder.globalDependencies = () => {
        if (!globalCache.smartlabel) {
            globalCache.smartlabel = new Smartlabel(1, 'body');
        }
        return {
            smartlabel: globalCache.smartlabel,
            lifeCycleManager: new LifeCycleManager()
        };
    };

    // Retrieves global settings. This getter is readonly so that user can't change this as change should happen
    // only from setter to avoid unwanted sync issues.
    holder.settings = () => globalStore.serialize();

    holder.registry = (overrideRegistry) => {
        // Selectively copy the properties from COMPONENTS
        for (const prop in overrideRegistry) {
            if (!(prop in defaultRegistry)) {
                continue;
            }
            components[prop] = overrideRegistry[prop];
        }

        return holder;
    };

    return holder;
};

const SideEffects = Object.assign({
    SurrogateSideEffect,
    SpawnableSideEffect
}, sideEffects);

muze.DataModel = DataModel;
muze.pkg = pkg;
muze.SideEffects = SideEffects;
muze.ActionModel = ActionModel;
muze.layerFactory = layerFactory;
muze.operators = operators;

export default muze;
