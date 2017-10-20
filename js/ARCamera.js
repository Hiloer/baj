var ARCamera = Hilo3d.Class.create({
    Extends: Hilo3d.Camera,
    className: 'ARCamera',
    isARCamera: true,
    constructor: function(params) {
        // console.log(ARCamera.superclass,ARCamera.superclass.constructor)
        ARCamera.superclass.constructor.call(this, params);
        this.updateProjectionMatrix();
    },
    updateViewMatrix: function(){
        // this.updateMatrixWorld(true);
        // this.viewMatrix.invert(this.worldMatrix);
    },
    updateViewProjectionMatrix: function(){
        this.viewProjectionMatrix.multiply(this.projectionMatrix, this.viewMatrix);
    },
    updateARMatrix: function(viewMatrix, projectionMatrix) {
        if(viewMatrix.className) this.viewMatrix = viewMatrix;
        else this.viewMatrix.fromArray(viewMatrix);

        if(projectionMatrix.className) this.projectionMatrix = projectionMatrix;
        else this.projectionMatrix.fromArray(projectionMatrix);
    },
    updateProjectionMatrix:function() {

    },
});
