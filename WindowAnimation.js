class WindowAnimation {

    constructor(id) {

        this.id = id;
        this.turnOnImgs = [];
        this.turnOffImgs = [];
        this.length = 12;

        for (let i = 0; i < this.length; i++) {
            this.turnOnImgs[i] = loadImage( "assets/" + (this.id + 1) + "TurnOn" + (i + 1) + ".png");
            this.turnOffImgs[i] = loadImage( "assets/" + (this.id + 1) + "TurnOff" + (i + 1) + ".png");
        }

    }

    turnOn(x, y, index) {
        push();
        translate(x, y);
        scale(sizeScale);
        image(this.turnOnImgs[index], 0, 0);
        pop();
    }

    turnOff(x, y, index) {
        push();
        translate(x, y);
        scale(sizeScale);
        image(this.turnOffImgs[index], 0, 0);
        pop();
    }

}