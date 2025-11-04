class KvDiag {
    /* class variables */
    container;
    controls;
    /* fixed settings */
    FIELD_SIZE = 80; /* px */
    FIELD_MAP = [
                 [  0,  1,  5,  4, 20, 21, 17, 16],
                 [  2,  3,  7,  6, 22, 23, 19, 18],
                 [ 10, 11, 15, 14, 30, 31, 27, 26],
                 [  8,  9, 13, 12, 28, 29, 25, 24],
                 [ 40, 41, 45, 44, 60, 61, 57, 56],
                 [ 42, 43, 47, 46, 62, 63, 59, 58],
                 [ 34, 35, 39, 38, 54, 55, 51, 50],
                 [ 32, 33, 37, 36, 52, 53, 49, 48],
                ];

    constructor(container) {
        this.container = container;
    }

    init() {
        /* delete all content from container */
        this.container.innerHTML = "";
        /* create controls */
        this.control = {};
        this.control.numOfVars = document.createElement("select");
        this.control.numOfVars.add(new Option("2 Variablen", 2, true));
        this.control.numOfVars.add(new Option("3 Variablen", 3));
        this.control.numOfVars.add(new Option("4 Variablen", 4));
        this.control.numOfVars.add(new Option("5 Variablen", 5));
        this.control.numOfVars.add(new Option("6 Variablen", 6));
        this.control.numOfVars.addEventListener("change", this.onNumOfVarsChange.bind(this));

        /* add control container (no persistant reference) */
        this.control.container = document.createElement("div");
        this.control.container.classList += "kvdiag.controls";
        this.control.container.appendChild(this.control.numOfVars);
        /* finally */
        this.container.appendChild(this.control.container);
        /* create drawing surface */
        this.canvas = document.createElement("canvas");

        this.numOfVars = 2; /* default value */
        this.canvas.width  = this.canvasSizeFromNumOfVars(this.numOfVars).width;
        this.canvas.height = this.canvasSizeFromNumOfVars(this.numOfVars).height;

        this.canvas.classList += "kvdiag";
        this.container.appendChild(this.canvas);
        /* initial rendering */
        this.updateCanvas();
    }

    updateCanvas() {
        var ctx = this.canvas.getContext("2d");
        var dims = this.dimensionsFromNumOfVars(this.numOfVars);
        /* clear canvas */
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = "black";
        /* line width */
        ctx.lineWidth = 3;
        ctx.font = "16px Arial";
        /* lines from top to bottom */
        for(var x = 1; x < dims.width; x++) {
            ctx.moveTo(x * this.FIELD_SIZE, 0);
            ctx.lineTo(x * this.FIELD_SIZE, dims.height * this.FIELD_SIZE);
            ctx.stroke();
        }
        /* lines from left to right */
        for(var y = 1; y < dims.height; y++) {
            ctx.moveTo(0, y * this.FIELD_SIZE);
            ctx.lineTo(dims.width * this.FIELD_SIZE, y * this.FIELD_SIZE);
            ctx.stroke();
        }
        /* field numbering */
        for(var x = 0; x < dims.width; x++) {
            for(var y = 0; y < dims.height; y++) {
                ctx.fillText(this.FIELD_MAP[y][x], 
                    x * this.FIELD_SIZE + 8, 
                    y * this.FIELD_SIZE + (this.FIELD_SIZE - 8));
            }
        }
    }

    dimensionsFromNumOfVars(numOfVars) {
        var ret = {};
        switch(Number(numOfVars)) {
            case 2: ret = {width: 2, height: 2}; break;
            case 3: ret = {width: 4, height: 2}; break;
            case 4: ret = {width: 4, height: 4}; break;
            case 5: ret = {width: 8, height: 4}; break;
            case 6: ret = {width: 8, height: 8}; break;
        }
        return ret;
    }

    canvasSizeFromNumOfVars(numOfVars) {
        var ret = this.dimensionsFromNumOfVars(numOfVars);
        return {
            width:  ret.width  * this.FIELD_SIZE,
            height: ret.height * this.FIELD_SIZE, 
        };
    }

    onNumOfVarsChange(event) {
        var newNumOfVars = event.target.value; /* num of variables */
        console.log(`[kvdiag.js] numOfVars changed to ${event.target.value}`);
        this.canvas.width  = this.canvasSizeFromNumOfVars(newNumOfVars).width;
        this.canvas.height = this.canvasSizeFromNumOfVars(newNumOfVars).height;
        this.numOfVars = newNumOfVars;
        /* redraw */
        this.updateCanvas();
    }
}