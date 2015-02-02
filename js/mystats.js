var MYSTATS = MYSTATS || {REVISION: "1"};

MYSTATS.Stats = function () {
    this.fpsDisplayInterval = 666;
    this.lastDisplayFPS = null;
    this.FPSHistory = new Array(60);
    this.showingFPS = true;
    this.domElement = document.createElement("div");
    this.domElement.style.cssText = "width:100px;height:40px;position:fixed;left:0px;top:0px;";
    this.graphElement = document.createElement("div");
    this.graphElement.style.cssText = "width:70px;height:40px;";
    this.domElement.appendChild(this.graphElement);

    var obj = document.createElement("span");
    obj.style.cssText = "width:1px;height:40px;position:absolute;left:60px;background-color:white;";
    this.graphElement.appendChild(obj);

    obj = document.createElement("div");
    obj.innerText = "FPS";
    obj.style.cssText = "color:white;font-size:11px;width:20px;height:13px;position:absolute;left:61px;top:0px;text-align:left;";
    this.graphElement.appendChild(obj);

    this.fpsTextElement = document.createElement("div");
    this.fpsTextElement.style.cssText = "color:white;font-size:11px;width:39px;height:13px;position:absolute;left:61px;top:0px;text-align:right;";
    this.graphElement.appendChild(this.fpsTextElement);

    obj = document.createElement("div");
    obj.innerText = "m";
    obj.style.cssText = "color:white;font-size:11px;width:20px;height:13px;position:absolute;left:61px;top:14px;text-align:left;";
    this.graphElement.appendChild(obj);

    this.fpsTextMinElement = document.createElement("div");
    this.fpsTextMinElement.style.cssText = "color:white;font-size:11px;width:39px;height:13px;position:absolute;left:61px;top:14px;text-align:right;";
    this.graphElement.appendChild(this.fpsTextMinElement);

    obj = document.createElement("div");
    obj.innerText = "M";
    obj.style.cssText = "color:white;font-size:11px;width:20px;height:13px;position:absolute;left:61px;top:28px;text-align:left;";
    this.graphElement.appendChild(obj);

    this.fpsTextMaxElement = document.createElement("div");
    this.fpsTextMaxElement.style.cssText = "color:white;font-size:11px;width:39px;height:13px;position:absolute;left:61px;top:28px;text-align:right;";
    this.graphElement.appendChild(this.fpsTextMaxElement);

    this.fpsBars = [];

    for (var i = 0; i < 60; ++i) {
        var bar = document.createElement("span");
        bar.id = "fpsBar" + i;
        bar.style.cssText = "width:1px;height:0px;position:absolute;left: " + i + "px;bottom:0px;background-color:red;";
        this.graphElement.appendChild(bar);
        this.fpsBars[i] = bar;
    }
};
MYSTATS.Stats.prototype = {
    constructor: MYSTATS.Stats,
    update: function (delta, show) {
        var fps = 1 / delta;
        if (this.showingFPS != show) {
            if (show) {
                this.domElement.style.display = "block";
            } else {
                this.domElement.style.display = "none";
            }
            showingFPS = show;
        }
        fps = Math.round(fps);
        var now = window.performance.now();
        if (!this.lastDisplayFPS || now - this.lastDisplayFPS >= this.fpsDisplayInterval) {
            this.fpsTextElement.innerText = fps;
            //$("#fpsText").text(fps);
            var minfps, maxfps;
            minfps = maxfps = fps;
            var i;
            for (i = 0; i < 59; ++i) {
                this.FPSHistory[i] = this.FPSHistory[i + 1];
                if (this.FPSHistory[i] > maxfps)
                    maxfps = this.FPSHistory[i];
                else if (this.FPSHistory[i] < minfps)
                    minfps = this.FPSHistory[i];
            }
            this.FPSHistory[59] = fps;
            var scale = 40 / maxfps;
            for (i = 0; i < 60; ++i) {
                this.fpsBars[i].style.height = Math.round(this.FPSHistory[i] * scale) + "px";
                //$("#fpsBar" + i)[0].style.height = Math.round(FPSHistory[i] * scale) + "px";
            }
            this.fpsTextMinElement.innerText = minfps;
            this.fpsTextMaxElement.innerText = maxfps;
            //$("#fpsTextMin").text(minfps);
            //$("#fpsTextMax").text(maxfps);
            this.lastDisplayFPS = now;
        }
    }
}
