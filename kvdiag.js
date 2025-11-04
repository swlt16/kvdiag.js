class KvDiag {
    /* class variables */
    container;
    controls;
    /* fixed settings */
    BORDER_OFFSET = 80; /* px */
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
    TOOL = Object.freeze({
        EMPTY:      { name: "Inhalt löschen",   setTo: "" },
        ONE:        { name: "1 setzen",  setTo: "1" },
        ZERO:       { name: "0 setzen", setTo: "0" },
        DONTCARE:   { name: "<i>Don't Care</i> setzen", setTo: "X" },
        MARK:       { name: "Markieren"},
    });
    COLOR = [
        {name: "blau", color: "dodgerBlue"},
        {name: "rot", color: "red"},
        {name: "sandfarben", color: "#fff200"},
        {name: "grün", color: "limeGreen"},
        {name: "grau", color: "slateGrey"},
        {name: "orange", color: "orange"},
        {name: "pink", color: "hotPink"}, 
        {name: "schwarz", color: "#080808"}
    ];

    constructor(container) {
        this.container = container;
    }

    init() {
        /* delete all content from container */
        this.container.innerHTML = "";
        /* default value */
        this.numOfVars = 2; 
        this.tool = this.TOOL.ONE;
        this.map = Array.from({length: 8}, () => Array(8).fill(this.TOOL.EMPTY.setTo));

        /* create controls */
        this.control = {};
        /* num of vars */
        this.control.numOfVars = document.createElement("select");
        this.control.numOfVars.add(new Option("2 Variablen", 2, true));
        this.control.numOfVars.add(new Option("3 Variablen", 3));
        this.control.numOfVars.add(new Option("4 Variablen", 4));
        this.control.numOfVars.add(new Option("5 Variablen", 5));
        this.control.numOfVars.add(new Option("6 Variablen", 6));
        this.control.numOfVars.addEventListener("change", this.onNumOfVarsChange.bind(this));
        /* setter tools */
        this.control.set = {};
        this.control.set.empty = document.createElement("button");
        this.control.set.empty.innerText = "_";
        this.control.set.one = document.createElement("button");
        this.control.set.one.innerText = "1";
        this.control.set.one.classList.add("active");
        this.control.set.zero = document.createElement("button");
        this.control.set.zero.innerText = "0";
        this.control.set.dontCare = document.createElement("button");
        this.control.set.dontCare.innerText = "X";
        /* marker tools */
        this.control.mark = [];
        this.COLOR.forEach((color) => {
            var elem = document.createElement("button");
            elem.innerText = color.name;
            this.control.mark.push(elem);
        });
        /* mode display */
        this.control.mode = {}
        this.control.mode.container = document.createElement("span");
        this.control.mode.label = document.createElement("span");
        this.control.mode.label.innerText = "Modus: ";
        this.control.mode.mode = document.createElement("span");
        this.control.mode.mode.innerHTML = this.tool.name; /* display current mode */
        this.control.mode.container.appendChild(this.control.mode.label);
        this.control.mode.container.appendChild(this.control.mode.mode);

        /* add control container (no persistant reference) and append all controls */
        this.control.container = document.createElement("div");
        this.control.container.classList += "kvdiag-controls";
        this.control.container.appendChild(this.control.numOfVars);
        for (const btn of Object.values(this.control.set)) {
            this.control.container.appendChild(btn);
            btn.addEventListener("click", this.onToolChange.bind(this));
        }
        for (const btn of this.control.mark) {
            this.control.container.appendChild(btn);
            btn.addEventListener("click", this.onToolChange.bind(this));
        }
        this.control.container.appendChild(this.control.mode.container);


        /* finally */
        this.container.appendChild(this.control.container);
        /* create drawing surface */
        this.canvas = document.createElement("canvas");
        this.canvas.width  = this.canvasSizeFromNumOfVars(this.numOfVars).width;
        this.canvas.height = this.canvasSizeFromNumOfVars(this.numOfVars).height;
        this.canvas.classList += "kvdiag";
        this.canvas.addEventListener("click", this.onCanvasClick.bind(this));
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
        /* lines from top to bottom */
        for(var x = 0; x <= dims.width; x++) {
            ctx.moveTo(x * this.FIELD_SIZE + this.BORDER_OFFSET, 0 + this.BORDER_OFFSET);
            ctx.lineTo(x * this.FIELD_SIZE + this.BORDER_OFFSET, dims.height * this.FIELD_SIZE + this.BORDER_OFFSET);
            ctx.stroke();
        }
        /* lines from left to right */
        for(var y = 0; y <= dims.height; y++) {
            ctx.moveTo(0 + this.BORDER_OFFSET, y * this.FIELD_SIZE + this.BORDER_OFFSET);
            ctx.lineTo(dims.width * this.FIELD_SIZE + this.BORDER_OFFSET, y * this.FIELD_SIZE + this.BORDER_OFFSET);
            ctx.stroke();
        }
        /* field numbering */
        ctx.font = "16px Arial";
        ctx.textAlign = "start";
        for(var x = 0; x < dims.width; x++) {
            for(var y = 0; y < dims.height; y++) {
                ctx.fillText(this.FIELD_MAP[y][x], 
                    this.BORDER_OFFSET + x * this.FIELD_SIZE + 8, 
                    this.BORDER_OFFSET + y * this.FIELD_SIZE + (this.FIELD_SIZE - 8));
            }
        }
        /* field content */
        ctx.font = "32px Arial";
        ctx.textAlign = "center";
        for(var x = 0; x < dims.width; x++) {
            for(var y = 0; y < dims.height; y++) {
                ctx.fillText(this.map[y][x], 
                    this.BORDER_OFFSET + (x + 0.5) * this.FIELD_SIZE, 
                    this.BORDER_OFFSET + (y + 0.5) * this.FIELD_SIZE + 8);
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
            width:  ret.width  * this.FIELD_SIZE + 2 * this.BORDER_OFFSET,
            height: ret.height * this.FIELD_SIZE + 2 * this.BORDER_OFFSET, 
        };
    }

    onCanvasClick(event) {
        var click = {x: event.offsetX, y: event.offsetY};
        var dims = this.dimensionsFromNumOfVars(this.numOfVars);
        console.log(`[kvdiag.js] click at (${click.x}|${click.y})`);
        /* translate screen coordinates to field coordinates */
        var field = {
            x: Math.floor((click.x - this.BORDER_OFFSET) / this.FIELD_SIZE),
            y: Math.floor((click.y - this.BORDER_OFFSET) / this.FIELD_SIZE),
        }
        if( (field.x < 0) || (field.x >= dims.width) || (field.y < 0) || (field.y >= dims.height) ) {
            console.log("[kvdiag.js] click is out of field bounds");
            return;
        }
        console.log(`[kvdiag.js] click is field (${field.x}|${field.y}) => No. ${this.FIELD_MAP[field.y][field.x]}`);
        /* from now on, it's a valid field click */

        /* check tool */
        switch(this.tool) {
            case this.TOOL.EMPTY:
            case this.TOOL.ONE:
            case this.TOOL.ZERO:
            case this.TOOL.DONTCARE:
                this.map[field.y][field.x] = this.tool.setTo;
                break;
        }

        /* redraw field */
        this.updateCanvas();
    }

    onToolChange(event) {
        var src = event.srcElement;
        if(this.control.set.empty.isSameNode(src)) this.tool = this.TOOL.EMPTY;
        if(this.control.set.one.isSameNode(src)) this.tool = this.TOOL.ONE;
        if(this.control.set.zero.isSameNode(src)) this.tool = this.TOOL.ZERO;
        if(this.control.set.dontCare.isSameNode(src)) this.tool = this.TOOL.DONTCARE;

        if(this.control.mark.includes(src)) {
            /* color mode */
            console.log("LOLOL");
            this.tool = this.TOOL.MARK;
        }


        this.control.mode.mode.innerHTML = this.tool.name; /* display current mode */
        console.log("[kvdiag.js] Tool changed.");
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