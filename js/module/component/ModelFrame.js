/* global define */
define(function (require) {
    'use strict';

    var CommonUtil = require('lib/CommonUtil'),

        THREE = require('THREE'),

        GlobalVar = require('module/GlobalVar');

    function ModelFrame(modelDetail) {

        this._model = new THREE.Mesh(modelDetail.geometry, new THREE.MeshLambertMaterial({
            color: 0xc8c8c8
        }));

        this._boundingBox = null;

        this._init(modelDetail);
    }

    ModelFrame.prototype._init = function (modelDetail) {

        this._initModel();

        this._initBox();

    };

    ModelFrame.prototype._initModel = function () {

        this._model.geometry.center();

        this._model.material.side = THREE.DoubleSide;

        this._model.castShadow = true;

        this._model.position.set(0, 0, 0);
    };

    ModelFrame.prototype._initBox = function () {
        this._boundingBox = new THREE.BoundingBoxHelper(this._model, 0xffff00);
        this._boundingBox.update();
    };

    ModelFrame.prototype.checkOverlap = function (otherModelFrame) {

        otherModelFrame.get().model.updateMatrix();
        this._model.updateMatrix();

        var otherBoundingBox = otherModelFrame.get().box;

        otherBoundingBox.box.setFromObject(otherModelFrame.get().model);
        this._boundingBox.box.setFromObject(this._model);

        if (this._boundingBox.box.isIntersectionBox(otherBoundingBox.box)) {

            return this._boundingBox.box.intersect(otherBoundingBox.box);
        }

        return null;

    };

    ModelFrame.prototype.mirrorX = function () {
        if (!CommonUtil.isDefined(this._model)) {
            return;
        }

        this._mirror(-1, 1, 1);
    };

    ModelFrame.prototype.mirrorY = function () {
        if (!CommonUtil.isDefined(this._model)) {
            return;
        }

        this._mirror(1, -1, 1);
    };

    ModelFrame.prototype.mirrorZ = function () {
        if (!CommonUtil.isDefined(this._model)) {
            return;
        }

        this._mirror(1, 1, -1);
    };

    ModelFrame.prototype._mirror = function (x, y, z) {

        this._model.geometry.applyMatrix(new THREE.Matrix4().makeScale(x, y, z));

        this.update();
    };

    ModelFrame.prototype.getSize = function () {

        this.update();

        return this._boundingBox.box.size();
    };

    ModelFrame.prototype.update = function () {

        this._model.updateMatrix();
        this._boundingBox.update();
    };

    ModelFrame.prototype.dispose = function () {
        this._model.geometry.dispose();
        this._model.material.dispose();
        this._boundingBox.geometry.dispose();
        this._boundingBox.material.dispose();
    };

    ModelFrame.prototype.get = function () {

        return {
            model: this._model,
            box: this._boundingBox
        };
    };

    return ModelFrame;
});