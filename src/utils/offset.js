const getPageCoord = (target) => {
  let coord = { X: 0, Y: 0 };
  let element = target;
  while (element) {
    coord.X += element.offsetLeft;
    coord.Y += element.offsetTop;
    element = element.offsetParent;
  }
  return coord;
};

const getOffset = (e) => {
  const target = e.target;
  let pageCoord = getPageCoord(target);
  const eventCoord = {
    X: window.scrollX + e.clientX,
    Y: window.scrollY + e.clientY,
  };
  return {
    X: eventCoord.X - pageCoord.X,
    Y: eventCoord.Y - pageCoord.Y,
  };
};

const coordinate = (e) => {
   e = window.e || e;
  return {
    coord_X: e.offsetX ? e.offsetX : getOffset(e).X,
    coord_Y: e.offsetY ? e.offsetY : getOffset(e).Y,
  };
};

export { coordinate };
