import Smartlabel from 'fusioncharts-smartlabel';
import { transactor, enableChainedTransaction, LifeCycleManager, DataModel } from 'muze-utils';
import { SurrogateSideEffect, SpawnableSideEffect, sideEffects } from '@chartshq/muze-firebolt';
import { layerFactory } from '@chartshq/visual-layer';
import pkg from '../package.json';
import * as operators from './operators';
import { actionModel as ActionModel } from './action-model';
import options from './options';
import { Canvas } from './canvas';
import { COMPONENTS, SUBREGISTRIES } from './default-registry';
import './muze.scss';

// Cache singleton instances which should be included only once in a page
const globalCache = {};
const defaultRegistry = COMPONENTS;

/**
 * Entry point to renderer. Initializes an environment with settings and registries for canvas. This is a simple wrapper
 * over {@link Canvas} which enables common configuration passing to multiple such canvas.
 * 
 * Everytime `muze()` is called it creates an environment. These environment supports subset of APIs of Canvas. If a 
 * common configuration is used to render multiple canvases then it can be set directly in the env. Like if data is
 * common across all the visulization then its better to set the data in env. When a canvas is created it receives all
 * those configuration from env.
 * 
 * ```
 *  // Creates an environment
 *  const env = muze()
 *  // Set data property in environment, so that all the canvas created from the same environment gets this data
 *  // automatically
 *  env.data(dm);
 *  // Creates canvas, by default env pushes data to canvas instance
 *  const canvas = env.canvas();
 * ```
 * If a property is set on both environment and canvas instance, property set on canvas instance gets more priority.
 * 
 * @public
 * @module muze
 * @namespace Muze
 * 
 * @return {Env} Instance of an environment
 */
const muze = () => {
    // Setters and getters will be mounted on this. Object will be mutated.
    const [env, globalStore] = transactor({}, options);
    const components = Object.assign({}, COMPONENTS);
    const componentSubRegistryDef = Object.assign(SUBREGISTRIES);
    const componentSubRegistry = {};

    for (const prop in componentSubRegistryDef) {
        componentSubRegistry[prop] = componentSubRegistryDef[prop]();
    }

    // Apart form the setter getter, an instance method is injected to create real renderer instances
    env.canvas = () => {
        // Create a canvas instance with this settings
        const settings = globalStore.serialize();
        const canvas = Canvas.withSettings(settings, { /* registry */
            components,
            componentSubRegistry
        }, env.globalDependencies());

        // Whenever settings is changed canvas is updated
        enableChainedTransaction(globalStore, canvas, Object.keys(settings));

        return canvas;
    };

    // Global dependencies for for compositions. Only one copy of the same should be in the page
    env.globalDependencies = () => {
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
    env.settings = () => globalStore.serialize();

    env.registry = (overrideRegistry) => {
        for (const prop in overrideRegistry) {
            if (!(prop in defaultRegistry)) {
                continue;
            }
            components[prop] = overrideRegistry[prop];
        }

        return env;
    };

    return env;
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
