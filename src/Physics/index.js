import Box2DFactory from "box2d-wasm";
/**
 * @type {{loaded:boolean,box2d: null| Box2D & EmscriptenModule}}
 */
export const box2d = {
  loaded: false,
  box2d: null,
};

export async function loadBox2d() {
  box2d.box2d = await Box2DFactory({
    locateFile: (url) =>
      `https://cdn.jsdelivr.net/npm/box2d-wasm@7.0.0/dist/es/${url}`,
  });
  box2d.loaded = true;
  console.log("box2d", box2d);
}
