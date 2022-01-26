import { loadBox2d, game, square, rectangle, circle } from "sheep-engine";

function range(size, startAt = 0) {
  return [...Array(size).keys()].map((i) => i + startAt);
}

game({
  width: 800,
  height: 600,
  backgroundColor: 0xffffff,
  element: document.querySelector(".container"),
  onSetup: ({ app, state }) => {
    state.num = 2;
    const inter = setInterval(() => {
      state.num += 1;
      if (state.num > 7) {
        clearInterval(inter);
      }
    }, 5000);
  },
  onUpdate: ({ app, state, delta }) => {
    const squares = range(state.num).map((x) =>
      square({
        id: `sq-${x}`,
        size: 50,
        x: 30 * x,
        y: 30 * x,
        color: "green",
        zIndex: x % 2,
      })
    );
    const circles = range(state.num).map((x) =>
      circle({
        id: `circ-${x}`,
        radius: 25,
        x: 30 * x,
        y: 30 * x + 60,
        color: "yellow",
        zIndex: 1,
      })
    );
    return [...squares, ...circles];
  },
});
