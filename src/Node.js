export function node(type, props, children) {
  let obj = { type, ...props };
  if (children && children.length) {
    obj.children = children;
  }
  return obj;
}

export function rectangle(props) {
  return node("simpleShape", { ...props, shape: "rectangle" });
}

export function square({ size, ...props }) {
  if (size) {
    props = { ...props, width: size, height: size };
  }
  return node("simpleShape", { ...props, shape: "rectangle" });
}

export function circle(props) {
  return node("simpleShape", { ...props, shape: "circle" });
}

export function sprite(props) {
  return node("sprite", props);
}
