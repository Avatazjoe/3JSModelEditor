/* global define, document, window */
define(function (require) {
    'use strict';

    var THREE = require('THREE'),

        SceneManager = require('module/manager/SceneManager'),
        CameraManager = require('module/manager/CameraManager'),
        TransformTool = require('module/component/TransformTool'),

        GlobalVar = require('module/GlobalVar');

    require('thirdLib/threejs/OrbitControls');

    var self = null;

    function SceneController(domElement) {

        this._domElement = domElement;
        this._sceneManager = new SceneManager();
        this._cameraManager = new CameraManager(window.innerWidth, window.innerHeight, domElement);
        this._transformTool = null;
        this._orbitControl = null;
        this._isTouchSensorDown = false;
        this._isTransformStatus = false;

        this._init();
    }

    SceneController.prototype._init = function () {

        self = this;
        GlobalVar.sceneController = this;

        this._initTransformControl();
        this._initOrbitControl();

        this._bindRenderDomEvent();
    };

    SceneController.prototype._initTransformControl = function () {
        this._transformTool = new TransformTool(this._domElement);

        GlobalVar.transformTool = this._transformTool;
    };

    SceneController.prototype._initOrbitControl = function () {

        this._orbitControl = new THREE.OrbitControls(this._cameraManager.get(), this._domElement);
        this._orbitControl.enableDamping = true;
        this._orbitControl.dampingFactor = 0.25;
    };

    SceneController.prototype._bindRenderDomEvent = function () {

        this._domElement.addEventListener("mousedown", this.onMouseDown, false);
        this._domElement.addEventListener("mousemove", this.onMouseMove, false);
        this._domElement.addEventListener("mouseup", this.onMouseUp, false);
        this._domElement.addEventListener("mouseout", this.onMouseUp, false);

        this._domElement.addEventListener("mousewheel", this.onMouseWheel, false);
        this._domElement.addEventListener('DOMMouseScroll', this.onMouseWheel, false); // firefox

        this._domElement.addEventListener("touchstart", this.onTouchStart, false);
        this._domElement.addEventListener("touchmove", this.onTouchMove, false);
        this._domElement.addEventListener("touchend", this.onTouchEnd, false);

        this._domElement.addEventListener("touchcancel", this.onMouseUp, false);
        this._domElement.addEventListener("touchleave", this.onMouseUp, false);
    };

    SceneController.prototype.spawnModel = function (model) {
        this._sceneManager.addMesh(model);
    };

    SceneController.prototype.spawnMesh = function (mesh) {
        this._sceneManager.addStaticMesh(mesh);
    };

    SceneController.prototype.setCameraLookAt = function (position) {
        this._cameraManager.lookAt(position);
    };

    SceneController.prototype.attachTransformControl = function (mesh) {
        this._transformTool.attach(mesh);
    };

    SceneController.prototype.onMouseMove = function (event) {
        if (!self._isTouchSensorDown) {
            return;
        }

        if (self._isTransformStatus) {
            self._transformTool.onPointerMove(event);
        } else {
            self._orbitControl.onMouseMove(event);
        }
    };

    SceneController.prototype.onMouseUp = function (event) {
        self._isTouchSensorDown = false;
        self._transformTool.onPointerUp(event);
        self._orbitControl.onMouseUp(event);
    };

    SceneController.prototype.onMouseDown = function (event) {

        self._isTouchSensorDown = true;

        self._isTransformStatus = self._isHitModifyMeshObject(event);

        if (!self._isTransformStatus) {
            self._orbitControl.onMouseDown(event);
        }
    };

    SceneController.prototype.onTouchStart = function (event) {
        self._isTouchSensorDown = true;

        self._isTransformStatus = self._isHitModifyMeshObject(event);

        if (!self._isTransformStatus) {
            self._orbitControl.onTouchStart(event);
        }
    };

    SceneController.prototype._isHitModifyMeshObject = function (event) {
        var hitResult = this._sceneManager.getHitResultBy(event, this._sceneManager.HIT_RESULT_CHANNEL.MESH);

        if (0 < hitResult.length) {

            this._transformTool.attach(hitResult[0].object);
        }

        this._isTransformStatus = this._transformTool.onPointerDown(event, (0 < hitResult.length) ? hitResult[0].point : null);

        return this._isTransformStatus;
    };

    SceneController.prototype.onTouchMove = function (event) {
        if (!self._isTouchSensorDown) {
            return;
        }

        if (self._isTransformStatus) {
            self._transformTool.onPointerMove(event);
        } else {
            self._orbitControl.onTouchMove(event);
        }

    };

    SceneController.prototype.onTouchEnd = function (event) {
        self._isTouchSensorDown = false;
        self._transformTool.onPointerUp(event);
        self._orbitControl.onTouchEnd(event);
    };

    SceneController.prototype.onMouseWheel = function (event) {
        self._orbitControl.onMouseWheel(event);
    };

    SceneController.prototype.update = function () {
        this._transformTool.update();
        this._orbitControl.update();
    };

    SceneController.prototype.getCameraManager = function () {
        return this._cameraManager;
    };

    SceneController.prototype.getRenderTarget = function () {
        return {
            scene: this._sceneManager.get(),
            camera: this._cameraManager.get()
        };
    };

    SceneController.prototype.onWindowResize = function () {
        this._cameraManager.get().aspect = window.innerWidth / window.innerHeight;
        this._cameraManager.get().updateProjectionMatrix();
    };

    return SceneController;

});