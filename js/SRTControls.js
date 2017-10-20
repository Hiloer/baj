(function(win) {
    var PI2 = Math.PI / 2;
    var tempEuler = new Hilo3d.Euler();
    tempEuler.order = 'XYZ';
    var tempQuat = new Hilo3d.Quaternion();
    var tempMatrix = new Hilo3d.Matrix4();
    var tempVector = new Hilo3d.Vector3();
    var MOUSE = {
        LEFT: 0,
        MID: 1,
        RIGHT: 2
    };
    var STATE = {
        NONE: -1,
        MOVE: 0,
        ZOOM: 1,
        PAN: 2
    }

    function SRTControls(stage, opt) {
        if (opt instanceof Hilo3d.Node) {
            opt = {
                model: opt
            };
        } else if (!opt) {
            opt = {};
        }

        var _self = this;
        this.model = opt.model || stage;
        this.stage = stage;
        this.canvas = stage.canvas;
        this.isLockZ = !!opt.isLockZ;
        this.rotationXLimit = opt.rotationXLimit;
        this.isLockScale = !!opt.isLockScale;
        this.isLockRotate = !!opt.isLockRotate;
        this.isLockMove = !!opt.isLockMove;
        if (opt.eulerOrder) {
            tempEuler.order = opt.eulerOrder;
        }

        if (this.isLockZ) {
            tempEuler.x = this.model.rotationX * Math.PI / 180;
            tempEuler.y = this.model.rotationY * Math.PI / 180;
        }

        this.mouseInfo = {
            startX: 0,
            startY: 0,
            isDown: false
        };

        this.container = document.createElement('div');
        var istyle = "display: inline-block; width:30px; height: 30px; line-height: 30px; text-align: center; background: #ccc; margin: 5px;"
        var tstyle = "width: 200px; background: #ccc; margin: 10px; font-size: 14px; word-wrap: break-word"
        this.container.innerHTML = '<div>\
                                        <div style="' + istyle + '">X</div>\
                                        <div style="' + istyle + '">Y</div>\
                                        <div style="' + istyle + '">Z</div>\
                                        <div style="' + istyle + ';background: yellow">-</div>\
                                    </div>\
                                    <div style="' + tstyle +'">\
                                        xxxxx\
                                    </div>';
        this.container.style.cssText = 'position: absolute;right: 5px;top:5px;color:#000;font-size: 12px;z-index: 999999; color:red;';

        this.container.tipEl = this.container.children[1];
        this.container.trOrRo = -1;
        var ss = this.container.children[0];
        ss.children[0].onclick = function(){
            _self.container.trOrRo = 0;
            this.style.background = "yellow";
            ss.children[1].style.background= "#ccc";
            ss.children[2].style.background= "#ccc";
            ss.children[3].style.background= "#ccc";
        }
        ss.children[1].onclick = function(){
            _self.container.trOrRo = 1;
            this.style.background = "yellow";
            ss.children[0].style.background= "#ccc";
            ss.children[2].style.background= "#ccc";
            ss.children[3].style.background= "#ccc";
        }
        ss.children[2].onclick = function(){
            _self.container.trOrRo = 2;
            this.style.background = "yellow";
            ss.children[0].style.background= "#ccc";
            ss.children[1].style.background= "#ccc";
            ss.children[3].style.background= "#ccc";
        }
        ss.children[3].onclick = function(){
            _self.container.trOrRo = -1;
            this.style.background = "yellow";
            ss.children[0].style.background= "#ccc";
            ss.children[1].style.background= "#ccc";
            ss.children[2].style.background= "#ccc";
        }

        this.container.scaleTip = "";
        this.container.transTip = "";
        this.container.rotTip = "";

        document.body.appendChild(this.container);

        this.bindEvent();
    }

    SRTControls.prototype.rotate = function(distanceX, distanceY) {
        if (this.isLockRotate) {
            return;
        }
        var x = distanceY / 200;
        var y = distanceX / 200;
        if (this.isLockZ) {
            tempEuler.x += x;
            tempEuler.y += y;
            if (this.rotationXLimit) {
                if (tempEuler.x > this.rotationXLimit) {
                    tempEuler.x = this.rotationXLimit;
                } else if (tempEuler.x < -this.rotationXLimit) {
                    tempEuler.x = -this.rotationXLimit;
                }
            }
            this.model.quaternion.fromEuler(tempEuler);
        } else {
            tempEuler.set(x, y, 0);
            tempQuat.fromEuler(tempEuler);
            this.model.quaternion.premultiply(tempQuat);
        }


        this.container.rotTip = "<br>rotateX: " + this.model.rotationX + "; rotateY: " + this.model.rotationY;
        this.updateSRT();
    };

    SRTControls.prototype.translate = function(distanceX, distanceY) {
        var delta = 0;
        if(Math.abs(distanceX) > Math.abs(distanceY)){
            delta = distanceX;
        }
        else{
            delta = distanceY;
        }
        
        if(this.container.trOrRo == 0) this.model.x += delta;
        if(this.container.trOrRo == 1) this.model.y += delta;
        if(this.container.trOrRo == 2) this.model.z += delta;

        this.container.transTip= "<br>x:" + this.model.x + ";y:" + this.model.y + ";z:" + this.model.z;

        this.updateSRT();
    };

    SRTControls.prototype.updateSRT = function() {
        this.container.tipEl.innerHTML = this.container.scaleTip + this.container.transTip + this.container.rotTip;
    }

    SRTControls.prototype.scale = function(s) {
        if (this.isLockScale) {
            return;
        }
        this.model.scaleX *= s;
        this.model.scaleY *= s;
        this.model.scaleZ *= s;

        this.container.scaleTip = "<br>scale: " + this.model.scaleX;
        this.updateSRT();
    };

    SRTControls.prototype.move = function(x, y) {
        if (this.isLockMove) {
            return;
        }
        this.model.x += x;
        this.model.y += y;
    };

    SRTControls.prototype.onMouseDown = function(evt) {
        this.mouseInfo.isDown = true;
        if (evt.type === 'touchstart') {

            this.mouseInfo.startX = evt.touches[0].pageX;
            this.mouseInfo.startY = evt.touches[0].pageY;

            switch (evt.touches.length) {
                case 1:
                    this.mouseInfo.state = STATE.MOVE;
                    break;
                case 2:
                    var x = evt.touches[1].pageX - evt.touches[0].pageX;
                    var y = evt.touches[1].pageY - evt.touches[0].pageY;
                    this.mouseInfo.startPointerDistance = Math.sqrt(x * x + y * y);
                    this.mouseInfo.state = STATE.ZOOM;
                    break;
                case 3:
                    this.mouseInfo.state = STATE.PAN;
                    break;
            }
        } else {
            switch (evt.button) {
                case MOUSE.LEFT:
                    this.mouseInfo.startX = evt.pageX;
                    this.mouseInfo.startY = evt.pageY;
                    this.mouseInfo.state = STATE.MOVE;
                    break;
                case MOUSE.RIGHT:
                    this.mouseInfo.startX = evt.pageX;
                    this.mouseInfo.startY = evt.pageY;
                    this.mouseInfo.state = STATE.PAN;
                    break;
            }
        }
    }

    SRTControls.prototype.onMouseMove = function(evt) {
        if (!this.mouseInfo.isDown) {
            return;
        }
        evt.preventDefault();
        evt.stopPropagation();
        var scope = this;
        if (evt.type === 'touchmove') {
            switch (this.mouseInfo.state) {
                case STATE.MOVE:
                    scope.handlerToucheMove(evt);
                    break;
                case STATE.ZOOM:
                    scope.handlerToucheZoom(evt);
                    break;
                case STATE.PAN:
                    scope.handlerTouchePan(evt);
                    break;
            }
        } else {
            switch (this.mouseInfo.state) {
                case STATE.MOVE:
                    scope.handlerMouseMove(evt);
                    break;
                case STATE.PAN:
                    scope.handlerMousePan(evt);
                    break;
            }
        }

    }

    SRTControls.prototype.handlerMousePan = function(evt) {
        var distanceX = evt.pageX - this.mouseInfo.startX;
        var distanceY = evt.pageY - this.mouseInfo.startY;
        this.mouseInfo.startX = evt.pageX;
        this.mouseInfo.startY = evt.pageY;
        this.model.worldMatrix.getScaling(tempVector);
        this.move(distanceX * 2 * tempVector.x, distanceY * 2 * tempVector.y);
    }

    SRTControls.prototype.handlerMouseMove = function(evt) {
        var distanceX = evt.pageX - this.mouseInfo.startX;
        var distanceY = evt.pageY - this.mouseInfo.startY;
        this.mouseInfo.startX = evt.pageX;
        this.mouseInfo.startY = evt.pageY;


        if(this.container.trOrRo != -1){
            this.translate(distanceX, distanceY);
        }
        else{
            this.rotate(distanceX, distanceY);
        }
        
    }

    SRTControls.prototype.handlerToucheZoom = function(evt) {
        var x = evt.touches[1].pageX - evt.touches[0].pageX;
        var y = evt.touches[1].pageY - evt.touches[0].pageY;
        var pointerDistance = Math.sqrt(x * x + y * y);
        var scale = 1
        scale = pointerDistance / this.mouseInfo.startPointerDistance;
        this.mouseInfo.startPointerDistance = pointerDistance;
        if (scale != 1) {
            this.scale(scale);
        }
    }

    SRTControls.prototype.handlerTouchePan = function(evt) {
        evt = evt.touches[0];
        var distanceX = evt.pageX - this.mouseInfo.startX;
        var distanceY = evt.pageY - this.mouseInfo.startY;
        this.mouseInfo.startX = evt.pageX;
        this.mouseInfo.startY = evt.pageY;
        this.move(distanceX * .01, -distanceY * .01);
    }

    SRTControls.prototype.handlerToucheMove = function(evt) {
        var model = this.model;
        evt = evt.touches[0];
        this.handlerMouseMove(evt);
    }

    SRTControls.prototype.onMouseUp = function(evt) {
        this.mouseInfo.isDown = false;
        this.mouseInfo.state = STATE.NONE;
    }

    SRTControls.prototype.onWheel = function(evt) {
        evt.preventDefault();
        var _deltaY = evt.deltaY;
        if (_deltaY < -100) {
            _deltaY = -90
        } else if (_deltaY > 100) {
            _deltaY = 90
        }
        var s = 1 + _deltaY * 0.001;
        this.scale(1 / s);
    }

    SRTControls.prototype.bindEvent = function() {
        var canvas = this.canvas;

        canvas.addEventListener('wheel', this.onWheel.bind(this), false);

        if ('ontouchmove' in window) {
            canvas.addEventListener('touchstart', this.onMouseDown.bind(this), false);
            canvas.addEventListener('touchmove', this.onMouseMove.bind(this), false);
            canvas.addEventListener('touchend', this.onMouseUp.bind(this), false);
        } else {
            document.addEventListener('contextmenu', function(evt) {
                //禁掉鼠标右键菜单
                evt.preventDefault()
            });
            canvas.addEventListener('mousedown', this.onMouseDown.bind(this), false);
            canvas.addEventListener('mousemove', this.onMouseMove.bind(this), false);
            canvas.addEventListener('mouseup', this.onMouseUp.bind(this), false);
        }
    }

    win.SRTControls = SRTControls;
})(this);