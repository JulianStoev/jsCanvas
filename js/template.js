var Template = /** @class */ (function () {
    function Template(config) {
        var _this = this;
        this.config = config;
        // the canvas
        this._canvas = {
            el: document.getElementById(this.config.canvas),
            ctx: CanvasRenderingContext2D,
            bcr: null,
            init: function () {
                _this._canvas.ctx = _this._canvas.el.getContext("2d"),
                    _this._canvas.el.width = _this.config.width;
                _this._canvas.el.height = _this.config.height;
                _this._canvas.bcr = _this._canvas.el.getBoundingClientRect();
                _this._canvas.el.onmousedown = function (e) {
                    _this._mouse.down(e);
                },
                    _this._canvas.el.onmouseup = function (e) {
                        _this._mouse.up(e);
                    },
                    _this._canvas.el.onmousemove = function (e) {
                        _this._mouse.move(e);
                    };
            },
            loading: function (state) {
                var loading = document.getElementById('loading');
                if (state == 'show')
                    loading.style.display = 'block';
                else
                    loading.style.display = 'none';
            },
            clear: function () {
                _this._canvas.ctx.clearRect(0, 0, _this.config.width, _this.config.height);
            }
        };
        this._mouse = {
            x: 0,
            y: 0,
            dragging: false,
            down: function (e) {
                e.preventDefault();
                e.stopPropagation();
                var mx = e.clientX - _this._canvas.bcr.left;
                var my = e.clientY - _this._canvas.bcr.top;
                // if we are already dragging no need for the below test
                if (_this._mouse.dragging === false) {
                    for (var i = 0; i < _this.config.images.length; i++) {
                        var img = _this.config.images[i];
                        if (img.draggable === true && mx > img.x && mx < img.x + img.width && my > img.y && my < img.y + img.height) {
                            img.dragging = true;
                            _this._mouse.dragging = true;
                        }
                    }
                }
                // set where we are
                _this._mouse.x = mx;
                _this._mouse.y = my;
            },
            up: function (e) {
                e.preventDefault();
                e.stopPropagation();
                // not dragging anything anymore
                for (var i = 0; i < _this.config.images.length; i++) {
                    _this.config.images[i].dragging = false;
                }
                _this._mouse.dragging = false;
            },
            move: function (e) {
                if (_this._mouse.dragging === true) {
                    e.preventDefault();
                    e.stopPropagation();
                    // get the mouse position
                    var mx = e.clientX - _this._canvas.bcr.left;
                    var my = e.clientY - _this._canvas.bcr.top;
                    // get the distance
                    var dx = mx - _this._mouse.x;
                    var dy = my - _this._mouse.y;
                    // see what we hit and change its coordinates
                    for (var i = 0; i < _this.config.images.length; i++) {
                        var img = _this.config.images[i];
                        if (img.dragging === true) {
                            img.x += dx;
                            img.y += dy;
                            // rebuild with the new position
                            setTimeout(function () {
                                _this.create();
                            }, 200);
                        }
                    }
                    // set current mouse position
                    _this._mouse.x = mx;
                    _this._mouse.y = my;
                }
            }
        };
        // all the drawing methods
        this._draw = {
            rect: function (data) {
                if (data.fillStyle !== undefined) {
                    _this._canvas.ctx.fillStyle = data.fillStyle;
                    _this._canvas.ctx.fillRect(data.x, data.y, data.width, data.height);
                }
                else if (data.addColorStop !== undefined && data.gradient !== undefined) {
                    var gradient = _this._canvas.ctx.createRadialGradient(data.gradient[0], data.gradient[1], data.gradient[2], data.gradient[3], data.gradient[4], data.gradient[5]);
                    var i_1 = 0;
                    data.addColorStop.forEach(function (color) {
                        gradient.addColorStop(i_1++, color);
                    });
                    _this._canvas.ctx.fillStyle = gradient;
                    _this._canvas.ctx.fillRect(data.x, data.y, data.width, data.height);
                }
                else {
                    _this._canvas.ctx.rect(data.x, data.y, data.width, data.height);
                }
                if (data.lineWidth !== undefined && data.lineWidth > 0 && data.strokeStyle !== '') {
                    _this._canvas.ctx.lineWidth = data.lineWidth;
                    _this._canvas.ctx.strokeStyle = data.strokeStyle;
                }
                _this._canvas.ctx.stroke();
            },
            img: function (data) {
                var img = new Image();
                img.onload = function () {
                    if (data.filters !== undefined)
                        _this._canvas.ctx.filter = data.filters;
                    else
                        _this._canvas.ctx.filter = 'none';
                    _this._canvas.ctx.drawImage(img, data.x, data.y, (data.width !== undefined ? data.width : img.width), (data.height !== undefined ? data.height : img.height));
                    if (typeof data.callback == 'function')
                        data.callback();
                };
                img.src = data.src;
            },
            font: function (data) {
                _this._canvas.ctx.font = data.fontSize + 'px ' + data.fontName;
                _this._canvas.ctx.fillStyle = data.fontColor;
                _this._canvas.ctx.textBaseline = data.textBaseline;
                _this._canvas.ctx.textAlign = data.textAlign;
                _this._canvas.ctx.fillText(data.text, data.x, data.y);
            }
        };
        this._canvas.init();
    }
    // download the canvas
    Template.prototype.download = function (link, canvasId, filename) {
        link.href = document.getElementById(canvasId).toDataURL();
        link.download = filename;
    };
    Template.prototype.create = function () {
        var _this = this;
        this._canvas.clear();
        // show that the canvas is loading
        this._canvas.loading('show');
        // draw the rects
        if (this.config.rects[0] !== undefined) {
            this.config.rects.forEach(function (rect) {
                _this._draw.rect(rect);
            });
        }
        var drawFonts = function () {
            if (_this.config.text[0] !== undefined) {
                var i_2 = 0;
                var fcount_1 = _this.config.text.length;
                _this.config.text.forEach(function (text) {
                    _this._draw.font(text);
                    if (++i_2 == fcount_1) {
                        // last element of the canvas, hide the loading
                        _this._canvas.loading('hide');
                    }
                });
            }
        };
        // draw any images if any
        if (this.config.images[0] !== undefined) {
            var i_3 = 0;
            this.config.images.forEach(function (img) {
                _this._draw.img({
                    x: img.x,
                    y: img.y,
                    width: img.width,
                    height: img.height,
                    src: img.src,
                    filters: img.filters,
                    // finished with images, get the fonts going
                    callback: function () {
                        if (_this.config.images.length == ++i_3) {
                            drawFonts();
                        }
                    }
                });
            });
        }
        // no images so place the fonts only
        else {
            drawFonts();
        }
    };
    return Template;
}());
// main configuration passed to the template
var config = {
    canvas: 'mainCanvas',
    width: 1024,
    height: 576,
    text: [
        { x: 200, y: 70, fontName: 'AntennaBlack', fontSize: 94, fontColor: '#00bdfb', textBaseline: 'top', textAlign: 'start', text: '“”' },
        { x: 80, y: 144, fontName: 'GlossAndBloom', fontSize: 46, fontColor: 'white', textBaseline: 'top', textAlign: 'start', text: 'I think team first.' },
        { x: 100, y: 210, fontName: 'FjallaOne', fontSize: 68, fontColor: 'white', textBaseline: 'top', textAlign: 'start', text: 'It allows me' },
        { x: 195, y: 266, fontName: 'BoxedHeavy', fontSize: 68, fontColor: 'white', textBaseline: 'top', textAlign: 'start', text: 'to succeed' },
        { x: 250, y: 350, fontName: 'Finition', fontSize: 30, fontColor: 'white', textBaseline: 'top', textAlign: 'start', text: '- Lebron James -' }
    ],
    images: [
        { x: 476, y: 47, width: 548, height: 529, src: 'images/lebron-back.png', filters: 'grayscale(100%) opacity(33%)' },
        { x: 224, y: 47, width: 800, height: 529, src: 'images/particles.png' },
        { x: 430, y: 0, width: 694, height: 780, src: 'images/lebron.png', draggable: true, dragging: false }
    ],
    rects: [
        { x: 0, y: 0, width: 1024, height: 576, fillStyle: '#052536' },
        { x: 46, y: 43, lineWidth: 5, strokeStyle: '#0a4464', width: 931, height: 490 },
        { x: 324, y: 0, width: 700, height: 600, addColorStop: ['#00a8ff', 'transparent'], gradient: [700, 350, 100, 950, 700, 650] }
    ]
};
var t = new Template(config);
// call the template
window.onload = function () {
    t.create();
};
// nothing interesting below, controls for the HTML part
var controls = {
    change: function (item, number, value) {
        switch (item) {
            case 'text':
                config[item][number].text = value;
                break;
            case 'fillStyle':
                if (value.length == 7)
                    config.rects[0][item] = value;
                break;
            case 'lineWidth':
            case 'strokeStyle':
                if (item === 'strokeStyle' && value.length < 7)
                    return;
                config.rects[1][item] = value;
                break;
            case 'addColorStop':
                if (value.length == 7)
                    config.rects[2][item][0] = value;
                break;
            default:
                config[item] = value;
        }
        if (item == 'strokeStyle' || item == 'fillStyle')
            document.getElementById(item + 'Picker').value = value;
        // rebuild with the changes
        t.create();
    },
    bind: function () {
        var inputs = document.getElementsByClassName('textInput');
        for (var i = 0; i < inputs.length; ++i) {
            inputs[i].onkeyup = function (e) {
                controls.change(e.target.dataset.type, e.target.id, e.target.value);
            };
        }
        document.getElementById('strokeStylePicker').onchange = function (e) {
            document.getElementById('strokeStyle').value = e.target.value;
            controls.change('strokeStyle', 0, e.target.value);
        };
        document.getElementById('fillStylePicker').onchange = function (e) {
            document.getElementById('fillStyle').value = e.target.value;
            controls.change('fillStyle', 0, e.target.value);
        };
        document.getElementById('addColorStopPicker').onchange = function (e) {
            document.getElementById('addColorStop').value = e.target.value;
            controls.change('addColorStop', 0, e.target.value);
        };
    }
};
// bind control listeners
controls.bind();
