import { GridLayout } from '@chartshq/layout';
import { transactor, Store, getUniqueId, selectElement, STATE_NAMESPACES, CommonProps } from 'muze-utils';
import UnitBrushBehaviour from '@chartshq/visual-unit/src/firebolt/behaviours/brush';
import { physicalActions, sideEffects, behaviouralActions, behaviourEffectMap } from '@chartshq/muze-firebolt';
import { RETINAL } from '../constants';
import TransactionSupport from '../transaction-support';
import { getRenderDetails, prepareLayout, renderLayout } from './layout-maker';
import { localOptions, canvasOptions } from './local-options';
import GroupFireBolt from './firebolt';
import options from '../options';
import { APP_INITIAL_STATE } from './app-state';
import { initCanvas,
        setupChangeListener,
        setLabelRotationForAxes,
        createGroupState,
        createLayoutManager,
        setLayoutInfForUnits
} from './helper';
/**
 * Canvas is a logical component which houses a visualization by taking multiple variable in different encoding channel.
 * Canvas manages lifecycle of many other logical component and exposes one consistent interface for creation of chart.
 * Canvas is intialized from environment with settings from environment and singleton dependencies.
 *
 * To create an instance of canvas
 * ```
 *  const env = Muze();
 *  const canvas = env.canvas()
 * ```
 *
 *
 * @class
 * @public
 * @module Canvas
 */
export default class Canvas extends TransactionSupport {

    /**
     * Creates reactive property accessors.
     * - data
     * - height
     * - width
     * - config
     * This configs are retrieved from options.
     */
    constructor (globalDependencies) {
        super();

        this._allOptions = Object.assign({}, options, localOptions);
        this._registry = {};
        this._composition = {};
        this._cachedProps = {};
        this._alias = null;
        this._renderedResolve = null;
        this._renderedPromise = new Promise((resolve) => {
            this._renderedResolve = resolve;
        });
        this._composition.layout = new GridLayout();
        this._store = new Store(APP_INITIAL_STATE);

        this._throwback = new Store({
            [CommonProps.MATRIX_CREATED]: false,
            [CommonProps.ON_LAYER_DRAW]: null,
            propagationInfo: null
        });

        // Setters and getters will be mounted on this. The object will be mutated.
        const namespace = STATE_NAMESPACES.CANVAS_LOCAL_NAMESPACE;
        const allOptions = Object.assign({}, options, localOptions, canvasOptions);

        transactor(this, allOptions, this._store, {
            namespace
        });

        this.dependencies(Object.assign({}, globalDependencies, this._dependencies));
        this.firebolt(new GroupFireBolt(this, {
            behavioural: Object.assign({}, behaviouralActions, {
                brush: UnitBrushBehaviour
            }),
            physical: physicalActions,
            physicalBehaviouralMap: {}
        }, sideEffects, behaviourEffectMap));
        this.alias(`canvas-${getUniqueId()}`);
        this.title('', {});
        this.subtitle('', {});
        this.legend({});
        this.color({});
        this.shape({});
        this.size({});
        setupChangeListener(this);
         // init layoutManager
        this._layoutManager = createLayoutManager();
    }

    /**
     * Retrieves an instance of layout which is responsible for layouting. Layout is responsible for creating faceted
     * presentation using table layout.
     *
     * @public
     *
     * @return {GridLayout} Instance of layout attached to canvas.
     */
    layout (...params) {
        if (params.length) {
            return this;
        }
        return this.composition().layout;
    }

    /**
     * Retrieves the composition for a canvas
     *
     * @public
     *
     * @return {object} Instances of the components which canvas requires to draw the full visualization.
     *      ```
     *          {
     *              layout: // Instance of {@link GridLayout}
     *              legend: // Instance of {@link Legend}
     *              subtitle: // Instance of {@link TextCell} using which the title is rendered
     *              title: // Instance of {@link TextCell} using which the title is rendered
     *              visualGroup: // Instance of {@link visualGroup}
     *          }
     *      ```
     */
    composition (...params) {
        if (params.length) {
            return this;
        }
        return this._composition;
    }

    done () {
        return this._renderedPromise;
    }

    /**
     * Sets or gets the alias of the canvas. Alias is a name by which the canvas can be referred.
     *
     * When setter
     * @param {string} alias Name of the alias.
     *
     * @return {Canvas} Instance of the canvas.
     *
     * When getter
     *
     * @return {string} Alias of canvas.
     *
     * @public
     */
    alias (...params) {
        if (params.length) {
            const visualGroup = this.composition().visualGroup;
            this._alias = params[0];
            visualGroup && visualGroup.alias(this.alias());
            return this;
        }
        return this._alias;
    }

    /**
     * Creates an instance initiated with given settings.
     *
     * @param {Object} initialSettings Initial settings to be populated in the model
     * @param {Object} regEntry newly created instance with the initial settings
     * @param {Object} globalDependencies dependencies which will be created only once in the page
     *
     * @return {Object} newly created instance with the initial settings
     */
    static withSettings (initialSettings, regEntry, globalDependencies) {
        const instance = new Canvas(globalDependencies);

        for (const key in initialSettings) {
            instance[key](initialSettings[key]);
        }
        // set registry for instance
        instance.registry(regEntry);
        return instance;
    }

    /**
     *
     *
     * @static
     *
     * @memberof Canvas
     */
    static formalName () {
        return 'canvas';
    }

    /**
     * Returns the instance of firebolt associated with this canvas. The firebolt instance can be used to dispatch a
     * behaviour dynamically on the canvas. This firebolt does not handle any physical actions. It is just used to
     * propagate the action to all the visual units in it's composition.
     *
     * @public
     *
     * @return {GroupFireBolt} Instance of firebolt associated with canvas.
     */
    firebolt (...firebolt) {
        if (firebolt.length) {
            this._firebolt = firebolt[0];
            return this;
        }
        return this._firebolt;
    }

    /**
     * Registry peoperty accessor
     *
     * @param {Object} reg plain old javascript object keyvalue pairs. Key containing module name and value contains
     * module definition class. The reg object has to be flat object of level 1.
     */
    registry (...params) {
        if (params.length) {
            const param = params[0];
            const components = Object.assign({}, param.components);
            const componentSubRegistry = Object.assign({}, param.componentSubRegistry);
            const interactionRegistry = Object.assign({}, param.interactions);

            this._registry = { components, componentSubRegistry, interactions: interactionRegistry };
            const initedComponents = initCanvas(this);
            // @todo is it okay to continue this tight behaviour? If not use a resolver to resolve diff component type.
            this._composition.visualGroup = initedComponents[0];
            createGroupState(this);
            this.composition().visualGroup.alias(this.alias()).store(this._store);
            return this;
        }
        return this._registry;
    }

    /*
     * Prepare dependencies for top level elements
     */
    dependencies (...param) {
        if (param.length) {
            this._dependencies = param[0];
            return this;
        }
        // @todo prepare dependencies here.
        return this._dependencies;
    }

    /**
     *
     *
     * @param {*} lifeCycles
     *
     * @memberof Canvas
     */
    lifeCycle (lifeCycles) {
        const lifeCycleManager = this.dependencies().lifeCycleManager;
        if (lifeCycles) {
            lifeCycleManager.register(lifeCycles);
            return this;
        }
        return lifeCycleManager;
    }

    /**
     *
     *
     * @readonly
     * @memberof Canvas
     */
    legend (...params) {
        if (params.length) {
            return this;
        }
        return this.composition().legend;
    }

    /**
     * Returns a promise for various {@link LifecycleEvents} of the various components of canvas. The promise gets
     * resolved once the particular event gets completed.
     *
     * To use this,
     * ```
     *      canvas.once('layer.drawn').then(() => {
     *          // Do any post drawing work here.
     *      });
     * ```
     * @public
     *
     * @param {string} eventName Name of the lifecycle event.
     *
     * @return {Promise} A pending promise waiting for resolve to be called.
     */
    once (eventName) {
        const lifeCycleManager = this.dependencies().lifeCycleManager;
        return lifeCycleManager.retrieve(eventName);
    }

    /**
     * Internal function to trigger render, this method is cognizant of all the properties of the core modules and
     * establish a passive reactivity. Passive reactivity is not always a bad thing :)
     * @internal
     */
    render () {
        const mount = this.mount();
        // removeChild(mount);
        const lifeCycleManager = this.dependencies().lifeCycleManager;
        // Get render details including arrangement and measurement
        const renderDetails = getRenderDetails(this, mount);
        lifeCycleManager.notify({ client: this, action: 'beforedraw' });
        // Prepare the layout by triggering the matrix calculation
        prepareLayout(this.layout(), renderDetails);

        this._layoutManager.dimension({
            height: renderDetails.measurement.canvasHeight,
            width: renderDetails.measurement.canvasWidth
        });

        this._layoutManager.renderAt(mount);

        // Render each component
        renderLayout(this, renderDetails);

        setLayoutInfForUnits(this);

        // setLabelRotation
        setLabelRotationForAxes(this);

        this.firebolt().mapActionsAndBehaviour();
    }

    /**
     * Returns the instances of x axis of the canvas. It returns the instances in a two dimensional array form.
     *
     * ```
     *   // The first element in the sub array represents the top axis and the second element represents the bottom
     *   // axis.
     *   [
     *      [X1, X2],
     *      [X3, X4]
     *   ]
     * ```
     * @public
     *
     * @return {Array.<Array>} Instances of x axis.
     */
    xAxes () {
        return this.composition().visualGroup.getAxes('x');
    }

    /**
     * Returns the instances of y axis of the canvas. It returns the instances in a two dimensional array form.
     *
     * ```
     *   // The first element in the sub array represents the left axis and the second element represents the right
     *   // axis.
     *   [
     *      [Y1, Y2],
     *      [Y3, Y4]
     *   ]
     * ```
     * @public
     * @return {Array.<Array>} Instances of y axis.
     */
    yAxes () {
        return this.composition().visualGroup.getAxes('y');
    }

    /**
     * Returns all the retinal axis of the canvas. Color, shape and size axis are combinedly called retinal axis.
     *
     * @public
     * @return {Object} Instances of retinal axis.
     *          ```
     *              {
     *                  color: [ColorAxis], // Array of color axis.
     *                  shape: [ShapeAxis], // Array of shape axis.
     *                  size: [SizeAxis] // Array of size axis.
     *              }
     *          ```
     */
    getRetinalAxes () {
        const visualGroup = this.composition().visualGroup;
        return visualGroup.getAxes(RETINAL);
    }

    mount (...params) {
        if (params.length) {
            let value = params[0];
            if (typeof params[0] === 'string') {
                value = selectElement(params[0]).node();
            }
            this._mount = value;
            return this;
        }
        return this._mount;
    }
}
