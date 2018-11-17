function configureCanvas(canvas) {
    setCanvasSize(700, 300, canvas);
}

function setCanvasSize(width, height, canvas) {
    canvas.setWidth(width);
    canvas.setHeight(height);
    canvas.calcOffset();
}

function addStateToCanvas(state, canvas) {
    canvas.add(state.circle);
    canvas.add(state.stateNumberText);
}

function bringStateToFront(state, canvas) {
    canvas.bringToFront(state.circle);
    canvas.bringToFront(state.stateNumberText);
}