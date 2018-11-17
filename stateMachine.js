function StateMachine(states, transitions) {
    var _this = this;
    var transitionFontSize = 22;
    var _states = states;
    var _transitions = transitions;
    var transitionsDrawings = [];

    drawAllLinksBetweenTransitions();

    function drawAllLinksBetweenTransitions() {
        for (var i = 0; i < _transitions.length; i++) {
            var transition = _transitions[i];
            var fromState = getState(transition['fromStateId']);
            var toState = getState(transition['toStateId']);
            var transitionDrawing =
                fromState.id === toState.id
                    ?
                    generateTransitionDrawingObjToSelf(fromState, transition)
                    :
                    generateTransitionDrawingObjBetweenTwoStates(fromState, toState, transition);


            transitionsDrawings.push(transitionDrawing);
            transitionDrawing.objectsNeededToBeDrawn.forEach(obj => canvas.add(obj));

            bringStateToFront(fromState, canvas);
            bringStateToFront(toState, canvas);
        }
    }

    //generates object required for drawing link between the states
    //returns object containing line between the states and the symbol required to move to another state
    function generateTransitionDrawingObjBetweenTwoStates(fromState, toState, theirTransition) {
        var fromStatePosition = fromState.getPosition();
        var toStatePosition = toState.getPosition();
        var x1 = fromStatePosition.x + fromState.circle.radius;
        var y1 = fromStatePosition.y + fromState.circle.radius;
        var x2 = toStatePosition.x + toState.circle.radius;
        var y2 = toStatePosition.y + toState.circle.radius;

        var lineCoordinates = [x1, y1, x2, y2];
        var line = new fabric.Line(lineCoordinates, {'fill': 'black', 'stroke': 'black', 'strokeWidth': 1});

        var text = new fabric.Text(theirTransition.key, {'fill': 'black', 'fontSize': transitionFontSize});
        var textLeft = toStatePosition.x + ((x1 - x2) / 2) + text.width;
        var textTop = fromStatePosition.y + fromState.circle.radius / 2;

        var transitionDrawingsLines =
            transitionsDrawings.filter(function (el) {
                return el.drawing.x1 &&
                    el.drawing.y1 &&
                    el.drawing.x2 &&
                    el.drawing.y2 &&
                    el.drawing.x1 === x2 &&
                    el.drawing.y1 === y2 &&
                    el.drawing.x2 === x1 &&
                    el.drawing.y2 === y1
            }).length;

        if (transitionDrawingsLines > 0) {
            textTop += line.height + text.height + 10 + (10 * transitionDrawingsLines);
        } else {
            textTop -= line.height + text.height;
        }

        line.top += transitionDrawingsLines * 10;

        text.left = textLeft;
        text.top = textTop;

        var transitionDrawing = {'transition': theirTransition};
        transitionDrawing.drawing = line;
        transitionDrawing.text = text;
        transitionDrawing.objectsNeededToBeDrawn = [line, text];
        return transitionDrawing;
    }

    //generates object required for drawing link to self
    //returns object containing line between the states and the symbol required to move to another state
    function generateTransitionDrawingObjToSelf(state, transition) {
        var statePosition = state.getPosition();
        var path = 'M{0},{1} C{2},{3} {4},{5} {0},{1} Z';
        var curveX = statePosition.x + state.circle.radius;
        var curveY = statePosition.y + state.circle.radius;

        path = path.replaceAll('{0}', curveX)
            .replaceAll('{1}', curveY)
            .replaceAll('{2}', curveX - 100)
            .replaceAll('{3}', curveY - 100)
            .replaceAll('{4}', curveX + 100)
            .replaceAll('{5}', curveY - 100);

        var curve = new fabric.Path(path);
        curve.set({'stroke': 'black', 'fill': null});

        var text = new fabric.Text(transition.key, {'fill': 'black', 'fontSize': transitionFontSize});

        text.left = curveX - text.width / 2;
        text.top = curveY - (100 + text.height / 2);

        var transitionDrawing = {'transition': transition};
        transitionDrawing.drawing = curve;
        transitionDrawing.text = text;
        transitionDrawing.objectsNeededToBeDrawn = [curve, text];
        return transitionDrawing;
    }

    function getState(stateId) {
        var result = _states.filter(function (state) {
            return state.id === stateId;
        });

        if (result.length > 0) {
            return result[0];
        }

        return null;
    }

    function canTransition(fromStateId, key) {
        return getTransitions(fromStateId, key).length > 0;
    }

    function getTransitions(fromStateId, key) {
        return _transitions.filter(function (el) {
            return el.fromStateId === fromStateId && el.key === key
        });
    }

    var defaultTransitionDuration = 2000;
    var defaultWaitTimeBetweenTransitions = 200;

    function makeTransitionToWith(fromStateId, key) {
        var deferred = Q.defer();
        var legalTransitions = getTransitions(fromStateId, key);

        if (legalTransitions.length !== 1) {
            deferred.reject(fromStateId);
            return deferred.promise;
        }

        var currentTransition = legalTransitions[0];
        var transitionDrawing = transitionsDrawings.filter(function (el) {
            return el.transition === currentTransition
        })[0];

        transitionDrawing.drawing.stroke = 'orange';
        transitionDrawing.text.fill = 'orange';
        transitionDrawing.drawing.dirty = true;
        transitionDrawing.text.dirty = true;

        canvas.renderAll();

        setTimeout(function () {
            transitionDrawing.drawing.stroke = 'black';
            transitionDrawing.text.fill = 'black';
            transitionDrawing.drawing.dirty = true;
            transitionDrawing.text.dirty = true;

            var fromState = getState(currentTransition.fromStateId);
            fromState.circle.stroke = 'black';
            fromState.circle.dirty = true;

            var toState = getState(currentTransition.toStateId);
            toState.circle.stroke = 'orange';
            toState.circle.dirty = true;

            canvas.renderAll();

            setTimeout(function () {
                deferred.resolve(toState.id)
            }, defaultWaitTimeBetweenTransitions);
        }, defaultTransitionDuration);

        return deferred.promise;
    }

    //starts state machine detection
    //numberLeftOver -> number to be checked
    //on completed returns true if word the word is recognizable
    this.detect = function (word, onCompleted, currentStateId) {
        var remainingDigitsToCheck = word + '';
        var letter = remainingDigitsToCheck[0];

        makeTransitionToWith(currentStateId, letter).then(function (newCurrentStateId) {
            _this.detect(remainingDigitsToCheck.substring(1), onCompleted, newCurrentStateId);
        }, function (error) {
            var fromStateId = error;
            onCompleted(fromStateId === _states[0].id);
        }).done();
    }
}