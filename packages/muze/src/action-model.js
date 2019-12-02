import { mergeRecursive, CommonProps } from 'muze-utils';

const defaultPolicy = (registrableComponents) => {
    const aliases = registrableComponents.map(comp => comp.alias());
    return {
        behaviours: {
            '*': (propagationPayload) => {
                const propagationCanvas = propagationPayload.sourceCanvas;
                return propagationCanvas ? aliases.indexOf(propagationCanvas) !== -1 : true;
            }
        },
        sideEffects: {
            '*': (propagationPayload) => {
                const propagationCanvas = propagationPayload.sourceCanvas;
                return propagationCanvas ? aliases.indexOf(propagationCanvas) !== -1 : true;
            }
        }
    };
};

const listenerFn = (canvas, fn) => () => {
    const valueMatrix = canvas.composition().visualGroup.matrixInstance().value;
    valueMatrix.each(cell => fn(cell.valueOf().firebolt()));
};

const canvasIterator = (canvases, iteratorFn, cFn) => {
    canvases.forEach((canvas) => {
        const matrix = canvas.composition().visualGroup.matrixInstance().value;
        matrix.each(cell => iteratorFn(cell.valueOf().firebolt()));
        cFn && cFn(canvas);
        // Also register actions on canvas update
        const throwback = canvas._throwback;

        throwback.registerImmediateListener([CommonProps.MATRIX_CREATED],
            listenerFn(canvas, iteratorFn));
    });
};

const registerActions = (context, type, fnName, deps) => {
    const canvases = context._registrableComponents;

    canvases.forEach((canvas) => {
        const vGroup = canvas.composition().visualGroup;

        vGroup.resolver().setFireboltDependencies(type, deps);
        canvas.firebolt()[fnName](deps);
    });
};

/**
 * This class is initiated only once in lifecycle and is reponsible for regisration of physical and behavioural
 * actions and side effects and the mapping between them.
 *
 * To get the instance of action model
 * ```
 *  const ActionModel = muze.ActionModel;
 * ```
 *
 * @public
 * @module ActionModel
 */
class ActionModel {
    constructor () {
        this._registrableComponents = [];
    }

    /**
     * Takes an array of canvases on which the physical and behavioural actions will get registered.
     *
     * @public
     * @param  {Canvas} components Array of canvases
     *
     * @return {ActionModel} Instance of action model.
     */
    for (...components) {
        this._registrableComponents = components;
        return this;
    }

    /**
     * Registers physical actions on the canvases. It takes an object with key as the name of action and value having
     * the definition of the action.
     *
     * To register a {@link PhysicalAction},
     * ```
     *  const ActionModel = muze.ActionModel;
     *  ActionModel
     *       // Physical actions will be registered on these canvases.
     *      .for(canvas)
     *      .registerPhysicalActions({
     *          // Key is the name of physical action.
     *          ctrlClick: (firebolt) => (targetEl, behaviours) => {
     *              targetEl.on('click', function (data) {
     *                  const event = utils.getEvent();
     *                  const pos = utils.getClientPoint(event, this);
     *                  // Get the data point nearest to the mouse position.
     *                  const nearestPoint = firebolt.context.getNearestPoint(pos, {
     *                      data
     *                  });
     *                  // Prepare the payload
     *                  const payload = {
     *                      criteria: nearestPoint.id
     *                  };
     *                  behaviours.forEach((behaviour) => firebolt.dispatchBehaviour(behaviour, payload));
     *              });
     *          }
     *      });
     * ```
     * @public
     *
     * @param {Object} action Names of physical actions and their definitions.
     *
     * @return {ActionModel} Instance of the action model.
     */
    registerPhysicalActions (action) {
        registerActions(this, 'physicalActions', 'registerPhysicalActions', action);

        return this;
    }

    /**
     * Registers behavioural actions on the canvases. It takes definitions of the behavioural actions and registers
     * them on the canvases. Every behavioural action must inherit the {@link GenericBehaviour} class.
     *
     * To register a behavioural action
     * ```
     *  // Define a new behavioural action
     *  class SingleSelectBehaviour extends GenericBehaviour {
     *      static formalName () {
     *          return 'singleSelect';
     *      }
     *
     *      setSelectionSet (addSet, selectionSet) {
     *          if (addSet === null) {
     *              selectionSet.reset();
     *          } else if (addSet.length) {
     *              const existingAddSet = selectionSet.getExistingEntrySet(addSet);
     *              if (existingAddSet.length){
     *                  selectionSet.reset();
     *              } else {
     *               selectionSet.add(addSet);
     *              }
     *          } else {
     *              selectionSet.reset();
     *          }
     *      }
     * }
     * muze.ActionModel.registerBehaviouralActions(SingleSelectBehaviour);
     * ```
     *
     * @public
     *
     * @param {GenericBehaviour} actions Definition of behavioural actions.
     *
     * @return {ActionModel} Instance of action model.
     */
    registerBehaviouralActions (...actions) {
        registerActions(this, 'behaviouralActions', 'registerBehaviouralActions', actions);
        return this;
    }

    /**
     * Registers the mapping of physical and behavioural actions. This mapping is used to establish which behavioural
     * actions should be dispatched on any triggering of physical actions.
     *
     * To map physical actions with behavioural actions,
     * ```
     *  muze.ActionModel.registerPhysicalBehaviouralMap({
     *      ctrlClick: {
     *          behaviours: ['select'] // This array must be the formal names of the behavioural actions.
     *      }
     *  });
     * ```
     *
     * @public
     * @param {Object} map Contains the physical and behavioural action map.
     * ```
     *   {
     *      // Name of the physical action
     *      click: {
     *          // Target element selector. This is an optional field. If not passed, then by default takes the
     *          // container element of visual unit.
     *          target: '.muze-layers-area path',
     *          // Behaviours which should be dispatched on triggering of the mapped physical action.
     *          behaviours: ['select']
     *      }
     *   }
     * ```
     *
     * @return {ActionModel} Instance of action model.
     */
    registerPhysicalBehaviouralMap (map) {
        canvasIterator(this._registrableComponents, (firebolt) => {
            firebolt.registerPhysicalBehaviouralMap(map);
        }, (canvas) => {
            canvas.firebolt().registerPhysicalBehaviouralMap(map);
        });
        return this;
    }

    /**
     * Registers what behaviour to propagate on dispatch of a certain behavioural action. By default, when any
     * behavioural action is dispatched, then the same behavioural action gets propagated to all the other canvases.
     * This can be changed using this api.
     *
     * To register what behaviour should be propagated on dispatch of any behavioural action,
     * ```
     *  ActionModel.for(canvas1, canvas2).registerPropagationBehaviourMap({
     *      select: 'filter',
     *      brush: 'filter'
     *  });
     * ```
     *
     * @public
     * @param {Object} map Propagation behaviour map.
     *
     * @return {ActionModel} Instance of action model.
     */
    registerPropagationBehaviourMap (map) {
        canvasIterator(this._registrableComponents, (firebolt) => {
            firebolt.registerPropagationBehaviourMap(map);
        }, (canvas) => {
            canvas.firebolt().registerPropagationBehaviourMap(map);
        });

        return this;
    }

    /**
     * Registers the mapping of side effects and behavioural actions. It takes an object which contains key as the
     * name of behavioural action and the side effects which will be linked to it.
     *
     * To map side effects to select behaviour,
     * ```
     *  muze.ActionModel.mapSideEffects({
     *      select: ['infoBox'] // This array must be the formal names of the side effects
     *  });
     * ```
     *
     * To map side effects to select behaviour, but disable all the default side effects attached with this behaviour,
     * ```
     *  muze.ActionModel.mapSideEffects({
     *      select: {
     *          effects: ['infoBox'],
     *          preventDefaultActions: true
     *      }
     *  });
     * @public
     * @param {Object} map Mapping of behavioural actions and side effects.
     * ```
     *     {
     *          select: ['infoBox']
     *     }
     * ```
     * @return {ActionModel} Instance of action model.
     */
    mapSideEffects (map) {
        canvasIterator(this._registrableComponents, (firebolt) => {
            firebolt.mapSideEffects(map);
        }, (canvas) => {
            canvas.firebolt().mapSideEffects(map);
        });
        return this;
    }

    /**
     * Registers the side effects on the registered canvases. It takes definitions of side effects and registers them
     * on the canvases. Every side effect must inherit the base class {@link GenericSideEffect} or
     * {@link SpawnableSideEffect} or {@link SurrogateSideEffect} class.
     *
     * ```
     * // Define a custom side effect
     *  class InfoBox extends SpawnableSideEffect {
     *      static formalName () {
     *          return 'infoBox';
     *      }
     *
     *      apply (selectionSet) {
     *      }
     *  }
     *  muze.ActionModel.registerSideEffects(InfoBox);
     * ```
     * @public
     * @param  {GenericSideEffect} sideEffects Definition of side effects.
     *
     * @return {ActionModel} Instance of action model.
     */
    registerSideEffects (...sideEffects) {
        registerActions(this, 'sideEffects', 'registerSideEffects', sideEffects);
        return this;
    }

    /**
     * Breaks the link between behavioural actions and physical actions. It takes an array of behavioural action
     * and it's physical action.
     *
     * To dissociate behavioural actions from physical actions
     * ```
     *  muze.ActionModel.dissociateBehaviour(['select', 'click'], ['highlight', 'hover']);
     * ```
     * @public
     * @param  {Array} maps Array of behavioural action and physical action.
     *
     * @return {ActionModel} Instance of action model.
     */
    dissociateBehaviour (...maps) {
        canvasIterator(this._registrableComponents, (firebolt) => {
            maps.forEach(val => firebolt.dissociateBehaviour(val[0], val[1]));
        }, (canvas) => {
            maps.forEach(val => canvas.firebolt().dissociateBehaviour(val[0], val[1]));
        });
        return this;
    }

    /**
     * Breaks the link between side effects and behavioural actions. It takes an array of formal names of the side
     * effects and it's linked behavioural action.
     *
     * To dissociate side effects from behavioural actions
     * ```
     *  muze.ActionModel.dissociateSideEffect(['crossline', 'highlight'], ['selectionBox', 'brush']);
     * ```
     * @public
     * @param  {Array} maps Array of side effects and behavioural actions.
     *
     * @return {ActionModel} Instance of action model.
     */
    dissociateSideEffect (...maps) {
        canvasIterator(this._registrableComponents, (firebolt) => {
            maps.forEach(val => firebolt.dissociateSideEffect(val[0], val[1]));
        }, (canvas) => {
            maps.forEach(val => canvas.firebolt().dissociateSideEffect(val[0], val[1]));
        });
        return this;
    }

    /**
     * By default cross interactivity is disabled between canvases. This enables cross interaction between the canvases
     * so that any action happening in one canvas gets dispatched on other canvases as well. An optional policy can also
     * be passed in this method. The policy can be used to control on which canvases the behavioural actions and
     * side effects gets dispatched.
     *
     * To just enable cross interactivity between two canvases,
     * ```
     *  ActionModel.for(canvas1, canvas2)
     *      .enableCrossInteractivity();
     * ```
     *
     * To enable cross interactivity but enable any behavioural action only when it is triggered from canvas1.
     * ```
     *  ActionModel.for(canvas1, canvas2)
     *      .enableCrossInteractivity({
     *          behaviours: {
     *              // Here * stands for any behavioural action name. We can also give any name of behavioural action
     *              // in place of this.
     *              '*': (propPayload, context) => {
     *                  return propPayload.sourceCanvas === canvas1.alias();
     *              }
     *          }
     *      });
     * ```
     *
     * To enable cross interactivity but enable tooltip effect if the action is propagated from canvas1,
     * ```
     *  ActionModel.for(canvas1, canvas2)
     *      .enableCrossInteractivity({
     *          sideEffects: {
     *              tooltip: (propPayload, context) => {
     *                  return propPayload.sourceCanvas === canvas1.alias();
     *              }
     *          }
     *      });
     * ```
     * @public
     * @param {Object} policy Policy definition.
     *
     * @return {ActionModel} Instance of action model.
     */
    enableCrossInteractivity (policy = {}) {
        const registrableComponents = this._registrableComponents;
        const mergedPolicy = mergeRecursive(mergeRecursive({}, defaultPolicy(registrableComponents)), policy);

        registrableComponents.forEach((canvas) => {
            canvas.firebolt().crossInteractionPolicy(mergedPolicy);
        });

        return this;
    }
}

export const actionModel = (() => new ActionModel())();
