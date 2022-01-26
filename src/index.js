import { box2d, loadBox2d } from "./Physics";
import { game } from "./Graphics/game";
import { node, circle, rectangle, square } from "./Node";

function delay(time) {
  return new Promise((res, rej) => {
    setTimeout(() => res(new Date()), time);
  });
}

export async function test1() {
  console.log("first ====>)(((000000|=<==", new Date());
  const t = await delay(3000);
  console.log("after 3 seconds", t);
  const t2 = await delay(4000);
  console.log("after 4 s", t2);
}

export { box2d, loadBox2d, game, node, circle, rectangle, square };
