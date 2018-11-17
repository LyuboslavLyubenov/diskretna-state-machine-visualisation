var canvas = new fabric.StaticCanvas('c');
configureCanvas(canvas);

var firstState = new State('S1', {x: 100, y: 100}, canvas);
var secondState = new State('S2', {x: 300, y: 100}, canvas);
var thirdState = new State('S3', {x: 500, y: 100}, canvas);

addStateToCanvas(firstState, canvas);
addStateToCanvas(secondState, canvas);
addStateToCanvas(thirdState, canvas);

var states = [firstState, secondState, thirdState];
var transitions = [];

transitions.push({'fromStateId': firstState.id, 'toStateId': firstState.id, 'key': '0'});
transitions.push({'fromStateId': firstState.id, 'toStateId': secondState.id, 'key': '1'});
transitions.push({'fromStateId': secondState.id, 'toStateId': thirdState.id, 'key': '0'});
transitions.push({'fromStateId': thirdState.id, 'toStateId': thirdState.id, 'key': '1'});
transitions.push({'fromStateId': thirdState.id, 'toStateId': secondState.id, 'key': '0'});
transitions.push({'fromStateId': secondState.id, 'toStateId': firstState.id, 'key': '1'});

var stateMachine = new StateMachine(states, transitions);