var globalStateId = 1;

//stateNumber -> number drawn on top of the circle
//position -> position in the canvas
//canvas -> canvas obj
function State(stateNumber, position, canvas) {
    var statePosition = {x: 0, y: 0};
    var enlargedCircleSize = 38;
    var defaultCircleSize = 30;
    var defaultFontSize = 24;
    var defaultAnimationDuration = 250; //in ms
    var pauseBetweenAnimations = 1000; //in ms

    this.setPosition = function (x, y) {
        statePosition.x = x;
        statePosition.y = y;

        this.circle.left = statePosition.x;
        this.circle.top = statePosition.y;

        this.stateNumberText.left = statePosition.x + this.circle.radius - (this.stateNumberText.width / 2);
        this.stateNumberText.top = statePosition.y + this.circle.radius - (this.stateNumberText.height / 2);
    };

    this.getPosition = function () {
        return statePosition;
    };

    this.playStateSelectedAnimation = function (onComplete) {
        var _this = this;
        this.playEnlargementAnimation(function () {
            setTimeout(
                function () {
                    _this.playShrinkingAnimation(onComplete, _this)
                },
                pauseBetweenAnimations);
        });
    };

    this.playEnlargementAnimation = function (onComplete) {
        this.playAnimation(enlargedCircleSize, onComplete);
    };

    this.playShrinkingAnimation = function (onComplete) {
        this.playAnimation(defaultCircleSize, onComplete);
    };

    this.playAnimation = function (desiredCircleSize, onComplete) {
        var _canvas = this.canvas;
        var _this = this;

        this.circle.animate('radius', desiredCircleSize, {
            onChange: function () {
                var oldPosition = _this.getPosition();
                _this.setPosition(oldPosition.x, oldPosition.y);
                _canvas.renderAll();
            },
            duration: defaultAnimationDuration,
            onComplete: onComplete,
            easing: fabric.util.ease.easeInBack
        });
    };

    if (position && position.x && position.y) {
        statePosition.x = position.x;
        statePosition.y = position.y;
    }

    this.canvas = canvas;

    this.circle = new fabric.Circle({radius: defaultCircleSize, stroke: 'black', strokeWidth: 2});
    this.stateNumberText = new fabric.Text(stateNumber + '', {fill: 'white', fontSize: defaultFontSize});

    this.id = ++globalStateId;

    this.setPosition(statePosition.x, statePosition.y);
}
