class Window {

    constructor(x, y) {

        this.x = x;
        this.y = y;

        this.animation = windowAnimations[floor(random(windowAnimations.length))];
        this.length = this.animation.length;
        this.index = this.length - 1;
        this.isOn = true;
    }

    draw() {

        this.incrementIndex();

        if (this.isOn) {
            this.animation.turnOn(this.x, this.y, floor(this.index));
        } else {
            this.animation.turnOff(this.x, this.y, floor(this.index));
        }
    }

    incrementIndex() {
        if (this.index < this.length - 1) {
            this.index += 0.3;
        }
    }

    turnOn() {
        if (!this.isOn) {
            this.isOn = true;
            this.index = 0;
        }
    }

    turnOff() {
        if (this.isOn) {
            this.isOn = false;
            this.index = 0;
        }
    }

    toggle() {

        if (floor(this.index) == this.length - 1) {
            if (this.isOn) {
                this.turnOff();
            } else {
                this.turnOn();
            }
        }

    }

    inBounds(x, y) {

        let halfWidth = windWidth*0.5;
        let halfHeight = windHeight*0.5;
        if (x != constrain(x, this.x - halfWidth, this.x + halfWidth)) {
            return false;
        }
        if (y != constrain(y, this.y - halfHeight, this.y + halfHeight)) {
            return false;
        }

        return true;

    }

}