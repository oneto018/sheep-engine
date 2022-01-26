import * as PIXI from "pixi.js-legacy";
import _flattenDeep from "lodash.flattendeep";
import { loadBox2d } from "../index";
import { createSimpleShapeSprite } from "../Graphics/SimpleShapes";

function createSprite({ url, name, width, height, ...props }) {
  let sprite;
  if (url) {
    sprite = PIXI.Sprite.from(url);
  } else if (name) {
    sprite = PIXI.Sprite.from(name);
  } else {
    throw new Error("Sprite creation error");
  }
  return sprite;
}

/**
 *
 * @param {PIXI.Application} app
 * @param {{id: string,type:string}} param1
 * @param {undefined|PIXI.Container} container
 */
function createNode(
  app,
  { id, type, shape, radius, filled, color, lineWidth, ...props },
  container = undefined
) {
  let obj = null;
  if (type === "simpleShape") {
    obj = createSimpleShapeSprite({
      shape,
      radius,
      filled,
      color,
      lineWidth,
      ...props,
    });
  } else if (type === "sprite") {
    obj = createSprite(props);
  }
  app.meta[id] = { obj };
  Object.assign(obj, props);
  if (!container) {
    app.stage.addChild(obj);
  } else {
    const containerId = container.itemId;
    container.addChild(obj);
    app.meta[containerId].childIds = app.meta[containerId].childIds || [];
    app.meta[containerId].childIds.push(containerId);
  }
  obj.itemId = id;
}

/**
 *
 * @param {PIXI.Application} app
 * @param {string} id
 * @param {undefined|PIXI.Container} container
 */
function removeNode(app, id, container) {
  const meta = app.meta[id];
  /**
   * @type {PIXI.DisplayObject}
   */
  const obj = meta["obj"];

  if (container) {
    container.removeChild(obj);
    const childIds = meta.childIds;
    for (const itemId of childIds) {
      delete app.meta[itemId];
    }
  } else {
    app.stage.removeChild(obj);
  }
  obj.destroy({ texture: true, children: true });
}

/**
 *
 * @param {*} app
 * @param {DisplayObject} oldNode
 * @param {DisplayObject} newNode
 */
function updateNode(app, oldNode, newNode, delta, state) {
  const { type, shape, id, children: oldChildren = [], ...oldProps } = oldNode;
  const {
    type: _type,
    shape: _shape,
    id: _id,
    children: newChildren = [],
    ...newProps
  } = newNode;
  const obj = app.meta[id].obj;
  Object.assign(obj, newProps);
  if (type === "container") {
    handleDiff(oldChildren, newChildren, app, delta, state, obj);
  }
}

/**
 *
 * @param {[]any} initialNodes
 * @param {[]any} updatedNodes
 * @param {PIXI.Application} app
 * @param {number} delta
 * @param {{[key:string]:any}} state
 *
 */
function handleDiff(initialNodes, updatedNodes, app, delta, state, container) {
  initialNodes = _flattenDeep(initialNodes);
  updatedNodes = _flattenDeep(updatedNodes);
  const oldIdsSet = new Set(initialNodes.map((x) => x.id));
  const newIdsSet = new Set(updatedNodes.map((x) => x.id));
  const idsToBeUpdatedSet = new Set();
  const createdNodes = [];
  const deletedNodes = [];
  const nodesToBeUpdated = {};
  for (const node of updatedNodes) {
    if (oldIdsSet.has(node.id)) {
      nodesToBeUpdated[node.id] = nodesToBeUpdated[node.id] || {};
      nodesToBeUpdated[node.id].updated = node;
    } else {
      createdNodes.push(node);
    }
  }

  for (const node of initialNodes) {
    if (newIdsSet.has(node.id)) {
      if (!idsToBeUpdatedSet.has(node.id)) {
        nodesToBeUpdated[node.id] = nodesToBeUpdated[node.id] || {};
        nodesToBeUpdated[node.id].original = node;
      }
    } else {
      deletedNodes.push(node);
    }
  }

  for (const node of createdNodes) {
    createNode(app, node, container);
  }
  for (const node of deletedNodes) {
    removeNode(app, node.id, container);
  }

  for (const k of Object.keys(nodesToBeUpdated)) {
    const item = nodesToBeUpdated[k];
    updateNode(app, item.original, item.updated, delta, state);
  }
}

/**
 *
 * @param {[]any} initialNodes
 * @param {PIXI.Application} app
 * @param {{[key:string]:any}} state
 */
function setUpInitialNodes(initialNodes, app, state) {
  handleDiff([], initialNodes, app, 0, state);
}

/**
 * @param { PIXI.Application } app
 * @param {{name:string,path:string}[]} res
 */
function loadResources(app, res) {
  return new Promise((resolve, reject) => {
    const loader = app.loader;
    for (const item of res) {
      loader.add(item.name, item.path);
    }
    loader.load((loader, resources) => {
      app.meta["resources"] = resources;
      resolve(resources);
    });
    loader.onError((e) => {
      reject(e);
    });
  });
}

/**
 *
 * @param {{element?: HTMLElement, onSetup?: Function, onUpdate?:Function, box2dEnabled?:boolean}} param
 */
export function game({
  element,
  onSetup,
  onUpdate,
  box2dEnabled = false,
  resources = [],
  ...props
}) {
  const app = new PIXI.Application(props);
  app.meta = {};
  if (!element) {
    element = document.body;
  }
  element.appendChild(app.view);
  const state = {};
  let initialNodes = [];

  if (onSetup) {
    const setupNodes = onSetup({ app, state, element });
    if (setupNodes && Array.isArray(setupNodes) && setupNodes.length) {
      setUpInitialNodes(setupNodes, app, state);
      initialNodes = setupNodes;
    }
  }
  app.stage.sortableChildren = true;
  app.ticker.add((delta) => {
    if (onUpdate) {
      const updatedNodes = onUpdate({ delta, app, state });

      if (updatedNodes && Array.isArray(updatedNodes) && updatedNodes.length) {
        handleDiff(initialNodes, updatedNodes, app, delta, state);
        initialNodes = updatedNodes;
      }
    }
  });
  let loadingTasks = [];
  if (resources.length) {
    loadingTasks.push(loadResources(app, resources));
  }
  if (box2dEnabled) {
    loadingTasks.push(loadBox2d());
  }
  if (loadingTasks.length) {
    state.loading = true;
    state.loaded = false;
    Promise.all(loadingTasks)
      .catch((e) => {
        state.loading = false;
        throw e;
      })
      .then(() => {
        state.loaded = true;
        state.loading = false;
      });
  } else {
    state.loading = false;
    state.loaded = true;
  }
  window.__app = app;
}
