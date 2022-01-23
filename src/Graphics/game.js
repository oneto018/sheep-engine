import * as PIXI from "pixi.js-legacy";
import _flattenDeep from "lodash.flattendeep";

/**
 *
 * @param {[]any} initialNodes
 * @param {[]any} updatedNodes
 * @param {PIXI.Application} app
 * @param {number} delta
 * @param {{[key:string]:any}} state
 */
function handleDiff(initialNodes, updatedNodes, app, delta, state) {}

/**
 *
 * @param {{element: HTMLElement}} param
 */
export function game({ element, onSetup, onUpdate, ...props }) {
  const app = new PIXI.Application(props);
  if (!element) {
    element = document.body;
  }
  element.appendChild(app.view);
  const state = {};
  let initialNodes = [];
  if (onSetup) {
    const setupNodes = onSetup({ app, state, element });
    if (setupNodes && Array.isArray(setupNodes) && setupNodes.length) {
      initialNodes = setupNodes;
    }
  }
  app.ticker.add((delta) => {
    if (onUpdate) {
      const updatedNodes = onUpdate({ delta, app, state });
      if (updatedNodes && Array.isArray(updatedNodes) && updatedNodes.length) {
        handleDiff(initialNodes, updatedNodes, app, delta, state);
        initialNodes = updatedNodes;
      }
    }
  });
}
