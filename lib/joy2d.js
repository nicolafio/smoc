/*

    Joy2D 003
    Copyright (c) 2014-2018 Nicola Fiori

    All rights reserved.

*/

'use strict';

// requires:
// - Deviser.js 003

const joy = {};

(() => {

const
    utils = joy.utils = {},
    $constructor = dev.$constructor,
    $prototype = dev.$prototype,
    devUtils = dev.utils,
    createFactory = dev.createFactory;

/* -- core utils ------------------------------------------------------------ */

const
    // math core utils
    //
    math = Math,

    // sqrt     core utils
    //
    // using:
    // - math   core utils
    //
    sqrt = math.sqrt,

    // sin      core utils
    //
    // using:
    // - math   core utils
    //
    sin = math.sin,

    // cos      core utils
    //
    // using:
    // - math   core utils
    //
    cos = math.cos,

    // pi       core utils
    //
    // using:
    // - math   core utils
    //
    pi = math.PI,

    // atan2    core utils
    //
    // using:
    // - math   core utils
    //
    atan2 = math.atan2,

    // Str   core utils
    //
    Str = String,

    // st   core utils
    //
    st = setTimeout,

    // dynamicMethod    core utils
    // from Deviser.js  utils
    //
    dynamicMethod = devUtils.dynamicMethod,

    // keys             core utils
    // from Deviser.js  utils
    //
    keys = devUtils.keys,

    // createEl         core utils
    // from Deviser.js  utils
    //
    // createEl = devUtils.createEl,

    // weakmap  core utils
    //
    weakmap = (iterable) => new WeakMap(iterable),

    // set  core utils
    //
    set = (iterable) => new Set(iterable),

    // boundingRadiusMap    core utils
    //
    // using:
    // - weakmap            core utils
    //
    boundingRadiusMap = weakmap(),

    // transformationMap    core utils
    //
    // using:
    // - weakmap            core utils
    //
    transformationMap = weakmap(),

    // zIndexMap    core utils
    //
    // using:
    // - weakmap    core utils
    //
    zIndexMap = weakmap(),

    // componentTargetsMap  core utils
    //
    // using:
    // - weakmap            core utils
    //
    componentTargetsMap = weakmap(),

    // refreshBoundingRadiusOf  core utils
    //
    // using:
    // - refresh                core utils
    // - boundingRadiusMap      core utils
    //
    refreshBoundingRadiusOf = (node) => {
        var boundingRadius = boundingRadiusMap.get(node);
        if (boundingRadius.refreshed) {
            var parent = node.parent();
            boundingRadius.refreshed = false;
            if (parent) refreshBoundingRadiusOf(parent);
        }
    },

    // refreshAbsoluteTransformationOf  core utils
    //
    // using:
    // - transformationMap              core utils
    //
    refreshAbsoluteTransformationOf = (node) => {
        var transformation = transformationMap.get(node);
        if (transformation.refreshed) {
            transformation.refreshed = false;
            var children = node.children(),
                ind = children.length;
            while (ind--) refreshAbsoluteTransformationOf(children[ind]);
        }
    },

    // refreshAbsoluteZIndexOf  core utils
    //
    // using:
    // - zIndexMap              core utils
    //
    refreshAbsoluteZIndexOf = (node) => {
        var zIndex = zIndexMap.get(node);
        if (zIndex.refreshed) {
            zIndex.refreshed = false;
            var children = node.children(),
                ind = children.length;
            while (ind--) refreshAbsoluteZIndexOf(children[ind]);
        }
    };

/* -- core factories -------------------------------------------------------- */

const
    // devRoot
    // from Deviser.js
    devRoot = dev.root,

    // collection       core factories
    // from Deviser.js  factories
    //
    collection = dev.collection,

    // canvas2D         core factories
    // from Deviser.js  factories
    //
    canvas2D = dev.canvas2D,

    // error        core factories
    //
    // using:
    // - createObj  core utils
    //
    error = createFactory({

        [$prototype]: Error.prototype,

        [$constructor]: function Joy2DError(data) {
            var obj = data[0];
            this.message = (
                'Failed to execute "' +
                data[1] +
                '"" on a ' +
                obj.constructor.name +
                (
                    obj instanceof object.constructor ?
                        ' called "' + obj.name() + '"'
                        : ''
                ) +
                ': ' +
                data[2] +
                '.'
            );
        }

    }),

    // cannotBeSetError     core factories
    // inherits from error  core factories
    //
    // using:
    // - createObj          core utils
    //
    cannotBeSetError = createFactory({

        [$prototype]: error.prototype,

        [$constructor]: function Joy2DCannotBeSetError(data) {
            error.constructor.call(
                this,
                [
                    data[0],
                    data[1],
                    'the ' + data[2] + ' cannot be set directly'
                ]
            );
        }

    }),

    // boudingRadiusError               core factories
    // inherits from cannotBeSetError   core factories
    //
    // using:
    // - createObj                      core utils
    //
    boudingRadiusError = createFactory({

        [$prototype]: cannotBeSetError.prototype,

        [$constructor]: function Joy2DBoundingRadiusSetError(object) {
            cannotBeSetError.constructor.call(
                this,
                [object, 'boundingRadius', 'bounding radius of an object']
            );
        }

    }),

    // insertError          core factories
    // inherits from error  core factories
    //
    // using:
    // - createObj          core utils
    //
    insertError = createFactory({

        [$prototype]: error.prototype,

        [$constructor]: function Joy2DInsertError(data) {
            error.constructor.call(this, [data[0], 'insert', data[1]]);
        }

    });

/* -- utils ----------------------------------------------------------------- */

const
    // pyth     utils
    //
    // using:
    // - sqrt   core utils
    //
    pyth = utils.pyth = (a, b) => sqrt(a * a + b * b),

    tT = utils.tT = (t, T) => {
        var t0 = t[0], t1 = t[1],
            t2 = t[2], t3 = t[3],
            T0 = T[0], T1 = T[1],
            T2 = T[2], T3 = T[3];
        return [
            T0 + t0 * T2 - t1 * T3,
            T1 + t0 * T3 + t1 * T2,
            t2 * T2 - t3 * T3,
            t2 * T3 + t3 * T2
        ];
    },

    t = utils.t = (tT, T) => {
        var tT0 = tT[0], tT1 = tT[1],
            tT2 = tT[2], tT3 = tT[3],
            T0 = T[0], T1 = T[1],
            T2 = T[2], T3 = T[3],
            T3T3plusT2T2 = T3 * T3 + T2 * T2,
            t1 = (T2 * (tT1 - T1) - T3 * (tT0 - T0)) / T3T3plusT2T2,
            t3 = (T2 * tT3 - T3 * tT2) / T3T3plusT2T2;
        return [
            (tT0 - T0 + t1 * T3) / T2,
            t1,
            (tT2 + t3 * T3) / T2,
            t3
        ];
    },

    // setMaps  utils
    //
    setMaps = utils.setMaps = (key, arr) => {
        var ind = 0;
        while (ind < arr.length) arr[ind++].set(key, arr[ind++]);
    },

    // sqr
    //
    sqr = (x) => x * x,

    // pointPointDistanceSqr
    //
    pointPointDistanceSqr =
        (pointA, pointB) =>
            sqr(pointA[0] - pointB[0]) + sqr(pointA[1] - pointB[1]),

    // pointSegmentDistanceSqr
    //
    pointSegmentDistanceSqr = utils.pointSegmentDistanceSqr =
        (point, segment) => {
            var pointA = segment[0],
                pointB = segment[1],
                l2 = pointPointDistanceSqr(pointA, pointB);
            if (l2 === 0) return pointPointDistanceSqr(point, pointA);
            var xA = pointA[0],
                yA = pointA[1],
                xBxAdiff = pointB[0] - xA,
                yByAdiff = pointB[1] - yA,
                t = ((point[0] - xA) * xBxAdiff + (point[1] - yA) * yByAdiff) /
                    l2;
            return pointPointDistanceSqr(
                point,
                t < 0 ?
                    pointA :
                    t > 1 ?
                        pointB :
                        [
                            xA + t * xBxAdiff,
                            yA + t * yByAdiff
                        ]
            );
        },

    // pointSegmentDistance
    //
    pointSegmentDistance = utils.pointSegmentDistance =
        (point, segment) => sqrt(pointSegmentDistanceSqr(point, segment)),

    // segmentInCircle
    //
    segmentInCircle = utils.segmentInCircle =
        (segment, circle) =>
            circle[1] > pointSegmentDistance(circle[0], segment),

    /*

    // segmentInCircle
    //
    segmentInCircle = utils.segmentInCircle = function (segment, circle) {
        var O = circle[0],
            A = segment[0],
            B = segment[1],
            xA = A[0],
            yA = A[1],
            xB = B[0],
            yB = B[1],
            xa = O[0] - xA,
            ya = O[1] - yA,
            xb = xB - xA,
            yb = yB - yA,
            bLength = pyth(xb, yb),
            n = xa * xb + ya * yb;
        return (
            circle[1] >
            (
                n <= 0 ?
                    pyth(xa, ya)
                    : n >= bLength ?
                        pyth(xb - xa, yb - ya)
                        : pyth(n * xb / bLength - xa, n * yb / bLength - ya)
            )
        );
    },*/


    // pointInRect
    //
    pointInRect = utils.pointInRect = (point, rect) => {
        var xP = point[0], yP = point[1],
            A = rect[0],
            w = rect[1],
            h = rect[2],
            xA = A[0], yA = A[1];
        return (
            (w > 0 ? xP >= xA && xP <= xA + w : xP >= xA + w && xP <= xA) &&
            (h > 0 ? yP >= yA && yP <= yA + h : yP >= yA + h && yP <= yA)
        );
    },

    // circleInRect
    //
    circleInRect = utils.circleInRect = (circle, rect) => {
        if (pointInRect(circle[0], rect)) return true;
        var A = rect[0],
            B = [A[0] + rect[1], A[1] + rect[2]],
            C = [B[0], A[1]],
            D = [A[0], B[1]],
            output = (
                segmentInCircle([A, C], circle) ||
                segmentInCircle([C, B], circle) ||
                segmentInCircle([B, D], circle) ||
                segmentInCircle([D, A], circle)
            );
        return output;
    },

    // rotation
    //
    // eslint-disable-next-line no-unused-vars
    rotation = utils.rotation = (transformation) => {
        return [transformation[1], transformation[2]];
    },

    // theta
    //
    // eslint-disable-next-line no-unused-vars
    theta = utils.thetaOf = (rotation) => atan2(rotation[1], rotation[0]),

    // deg
    //
    // eslint-disable-next-line no-unused-vars
    deg = utils.deg = (rad) => rad * 180 / pi,

    // rad
    //
    // eslint-disable-next-line no-unused-vars
    rad = utils.rad = (deg) => deg * pi / 180;

/* -- factories ------------------------------------------------------------- */

const
    // object                   factories
    // inherits from collection core factories
    //
    // using:
    // - parentChildError       core factories
    // - notAChildError         core factories
    // - Str                    core utils
    // - dynamicMethod          core utils
    // - pyth                   utils
    // - weakmap                utils
    // - setMaps                utils
    // - tToTAbsolute           utils
    //
    object = joy.object = (() => {

        function getItems(collection, factory) {
            var arr = [],
                ind = 0,
                max = collection.length,
                currItem;
            while (ind < max) {
                currItem = collection[ind++];
                if (currItem instanceof factory.constructor)
                    arr.push(currItem);
            }
            return arr;
        }

        var parentMap = weakmap(),
            rootParentMap = weakmap(),
            nameMap = weakmap(),
            visibleMap = weakmap(),
            collisionRadiusMap = weakmap();

        return createFactory({

            [$prototype]: collection.prototype,

            [$constructor]: function Joy2DObject(name) {
                collection.call(this);
                setMaps(this, [
                    nameMap, name || 'unnamed object',
                    parentMap, null,
                    rootParentMap, null,
                    visibleMap, true,
                    zIndexMap, {
                        relative: 0,
                        absolute: null,
                        refreshed: false
                    },
                    transformationMap, {
                        relative: [0, 0, 1, 0],
                        absolute: null,
                        refreshed: false
                    },
                    boundingRadiusMap, {
                        value: 0,
                        refreshed: true
                    }
                ]);
            },

            parent(newParent) {
                if (newParent === null) return this.remove();
                if (newParent instanceof object.constructor)
                    return this.appendTo(newParent);
                if (newParent !== undefined) return this;
                return parentMap.get(this);
            },

            rootParent(newRootParent) {
                if (newRootParent) throw cannotBeSetError([
                    this,
                    'rootParent',
                    'root parent of an object'
                ]);
                return rootParentMap.get(this);
            },

            boundingRadius(newBoundingRadius) {
                if (newBoundingRadius) throw boudingRadiusError(this);
                var boundingRadius = boundingRadiusMap.get(this);
                if (boundingRadius.refreshed) return boundingRadius.value;
                var maxRadius = 0,
                    currNode,
                    radius,
                    tr,
                    ind = this.length;
                while (ind--)
                    // TODO fix bug
                    // var obj1 = joy.object(),
                    //     obj2 = joy.object().appendTo(obj1);
                    // obj1.add(obj2);
                    if ((currNode = this[ind]).visible()) {
                        if (currNode instanceof object.constructor) {
                            tr = currNode.transformation();
                            radius = (
                                pyth(tr[0], tr[1]) +
                                currNode.boundingRadius()
                            );
                        }
                        else radius = currNode.boundingRadius();
                        if (radius > maxRadius) maxRadius = radius;
                    }
                boundingRadius.refreshed = true;
                return boundingRadius.value = maxRadius;
            },

            collisionRadius(newCollisionRadius) {
                if (newCollisionRadius !== undefined) {
                    collisionRadiusMap.set(this, newCollisionRadius);
                    return this;
                }
                if (collisionRadiusMap.has(this))
                    return collisionRadiusMap.get(this);
                return this.boundingRadius();
            },

            name(newName) {
                if (newName !== undefined) {
                    nameMap.set(this, Str(newName));
                    return this;
                }
                return nameMap.get(this);
            },

            visible(newVisibile) {
                var visible = visibleMap.get(this);
                if (newVisibile !== undefined) {
                    var value = !!newVisibile;
                    if (value !== visible) {
                        visibleMap.set(this, value);
                        var parent = this.parent();
                        if (parent) refreshBoundingRadiusOf(parent);
                    }
                    return this;
                }
                return visible && this.boundingRadius() !== 0;
            },

            zIndex(newZIndex) {
                if (typeof newZIndex === 'number') {
                    zIndexMap.get(this).relative = newZIndex;
                    refreshAbsoluteZIndexOf(this);
                    return this;
                }
                return zIndexMap.get(this).relative;
            },

            absoluteZIndex(newAbsoluteZIndex) {
                var parent;
                if (newAbsoluteZIndex !== undefined) {
                    parent = this.parent();
                    return this.zIndex(
                        parent ?
                            newAbsoluteZIndex - parent.absoluteZIndex()
                            : newAbsoluteZIndex
                    );
                }
                var zIndex = zIndexMap.get(this);
                if (zIndex.refreshed) return zIndex.absolute;
                parent = this.parent();
                zIndex.refreshed = true;
                return zIndex.absolute = (
                    parent ?
                        parent.absoluteZIndex() + zIndex.relative
                        : zIndex.relative
                );
            },

            transformation(newTransformation) {
                var transformation = transformationMap.get(this),
                    rel = transformation.relative;
                if (newTransformation !== undefined) {
                    if (
                        newTransformation[0] !== rel[0] ||
                        newTransformation[1] !== rel[1]
                    ) {
                        var parent = this.parent();
                        if (parent) refreshBoundingRadiusOf(parent);
                    }
                    transformation.relative = [
                        newTransformation[0], newTransformation[1],
                        newTransformation[2], newTransformation[3]
                    ];
                    refreshAbsoluteTransformationOf(this);
                    return this;
                }
                return [rel[0], rel[1], rel[2], rel[3]];
            },

            absoluteTransformation(newAbsoluteTransformation) {
                var parent = this.parent();
                if (parent) {
                    if (newAbsoluteTransformation !== undefined)
                        return this.transformation(t(
                            newAbsoluteTransformation,
                            parent.absoluteTransformation()
                        ));
                    var transformation = transformationMap.get(this),
                        out;
                    if (!transformation.refreshed) {
                        transformation.refreshed = true;
                        transformation.absolute = tT(
                            transformation.relative,
                            parent.absoluteTransformation()
                        );
                    }
                    out = transformation.absolute;
                    return [out[0], out[1], out[2], out[3]];
                }
                return this.transformation(newAbsoluteTransformation);
            },

            position(newPosition) {
                var rel = this.transformation();
                if (newPosition !== undefined) return this.transformation([
                    newPosition[0], newPosition[1],
                    rel[2], rel[3]
                ]);
                return [rel[0], rel[1]];
            },

            xPosition(newXPosition) {
                if (newXPosition !== undefined)
                    return this.position([
                        newXPosition,
                        this.yPosition()
                    ]);
                return this.position()[0];
            },

            yPosition(newYPosition) {
                if (newYPosition !== undefined)
                    return this.position([
                        this.xPosition(),
                        newYPosition
                    ]);
                return this.position()[1];
            },

            absolutePosition(newAbsolutePosition) {
                var abs = this.absoluteTransformation();
                if (newAbsolutePosition !== undefined)
                    return this.absoluteTransformation([
                        newAbsolutePosition[0], newAbsolutePosition[1],
                        abs[2], abs[3]
                    ]);
                return [abs[0], abs[1]];
            },

            xAbsolutePosition(newXAbsolutePosition) {
                if (newXAbsolutePosition !== undefined)
                    return this.absolutePosition([
                        newXAbsolutePosition,
                        this.yAbsolutePosition()
                    ]);
                return this.absolutePosition()[0];
            },

            yAbsolutePosition(newYAbsolutePosition) {
                if (newYAbsolutePosition !== undefined)
                    return this.absolutePosition([
                        this.xAbsolutePosition(),
                        newYAbsolutePosition
                    ]);
                return this.absolutePosition()[1];
            },

            rotation(newRotation) {
                var rel = this.transformation();
                if (newRotation !== undefined) return this.transformation([
                    rel[0], rel[1],
                    newRotation[0], newRotation[1]
                ]);
                return [rel[2], rel[3]];
            },

            absoluteRotation(newAbsoluteRotation) {
                var abs = this.absoluteTransformation();
                if (newAbsoluteRotation !== undefined)
                    return this.absoluteTransformation([
                        abs[0], abs[1],
                        newAbsoluteRotation[0], newAbsoluteRotation[1]
                    ]);
                return [abs[2], abs[3]];
            },

            transform(transformation) {
                return this.transformation(tT(
                    transformation,
                    this.transformation()
                ));
            },

            translate(position) {
                return this.transform([position[0], position[1], 1, 0]);
            },

            forward(x) {
                return this.translate([x, 0]);
            },

            backward(x) {
                return this.translate([-x, 0]);
            },

            leftward(x) {
                return this.translate([0, x]);
            },

            rightward(x) {
                return this.translate([0, -x]);
            },

            rotate(theta) {
                return this.transform([0, 0, cos(theta), sin(theta)]);
            },

            aim(position) {
                var transformation = this.absoluteTransformation(),
                    t0 = transformation[0],
                    t1 = transformation[1],
                    x = position[0] - t0,
                    y = position[1] - t1,
                    length = pyth(x, y);
                return this.absoluteTransformation([
                    t0, t1,
                    x / length, y / length
                ]);
            },

            insert(item, index) {
                if (item instanceof object.constructor) {
                    // insert node
                    var currNode = this,
                        parent;
                    while (true) {
                        parent = parentMap.get(currNode);
                        if (!parent) break;
                        if ((currNode = parent) === item)
                            throw insertError([
                                this,
                                'a Joy2D object can\'t be both parent ' +
                                'and child of another Joy2D object'
                            ]);
                    }
                    item.remove();
                    collection.prototype.insert.call(this, item, index);
                    parentMap.set(item, this);
                    rootParentMap.set(item, currNode);
                    // var components = item.components();
                    refreshAbsoluteTransformationOf(item);
                }
                else if (item instanceof component.constructor) {
                    // insert component
                    componentTargetsMap.get(item).add(this);
                    collection.prototype.insert.call(this, item, index);
                }
                else throw insertError([
                    this,
                    'only Joy2D objects and components can be inserted ' +
                    'to a Joy2D object'
                ]);
                refreshBoundingRadiusOf(this);
                return this;
            },

            remove(item) {
                if (item !== undefined) {
                    if (this.has(item)) {
                        if (item instanceof object.constructor) {
                            // remove node
                            parentMap.set(item, null);
                            rootParentMap.set(item, null);
                            var components = item.components(),
                                ind = components.length;
                            while (ind--)
                                componentTargetsMap.get(components[ind])
                                    .delete(item);
                            refreshAbsoluteTransformationOf(item);
                        }
                        // remove component
                        else componentTargetsMap.get(item).delete(this);
                        refreshBoundingRadiusOf(this);
                        collection.prototype.remove.call(this, item);
                    }
                }
                else {
                    var parent = this.parent();
                    if (parent) parent.remove(this);
                }
                return this;
            },

            destroy: dynamicMethod(function (time) {
                if (time) {
                    st(this.destroy.bind(this), time);
                    return false;
                }
                else {
                    this.remove();
                    var children = this.children(),
                        ind = children.length;
                    while (ind--) children[ind].destroy();
                    this.clear();
                }
            }),

            children(newChildren) {
                var children = getItems(this, object);
                if (newChildren) {
                    children.forEach(this.remove.bind(this));
                    return this.add(...newChildren);
                }
                return children;
            },

            components(newComponents) {
                var components = getItems(this, component);
                if (newComponents) {
                    components.forEach(this.remove.bind(this));
                    return this.add(...newComponents);
                }
                return components;
            },

            forEachParent(callback) {
                var currNode = this;
                while (true) {
                    currNode = currNode.parent;
                    if (!currNode) break;
                    callback(currNode);
                }
                return this;
            },

            isInRect(rect) {
                return circleInRect(
                    [this.absolutePosition(), this.boundingRadius],
                    rect
                );
            },

            relativeTo(object) {
                return t(
                    this.absoluteTransformation(),
                    object.absoluteTransformation()
                );
            },

            appendTo(object) {
                object.append(this);
                return this;
            },

            distanceTo(object) {
                var currPosition = this.absolutePosition(),
                    objectPosition = object.absolutePosition();
                return pyth(
                    currPosition[0] - objectPosition[0],
                    currPosition[1] - objectPosition[1]
                );
            },

            collidesWith(object) {
                return (
                    this.collisionRadius() + object.collisionRadius() >
                    this.distanceTo(object)
                );
            },

            /*
            // TODO debug this, it's not working
            clone() {
                return (
                    object(this.name())
                        .parent(this.parent())
                        .zIndex(this.zIndex())
                        .transformation(this.transformation())
                        .components(this.components())
                        .children(this.children().map(c => c.clone()))
                );
            },

            repeat(count, translation, rotation) {
                var i = count;
                var sample = this;
                const arr = [];
                while (i--) {
                    const obj = sample.clone();
                    if (translation) obj.translate(translation);
                    if (rotation) obj.rotate(rotation);
                    arr.push(obj);
                }
                return arr;
            },

            circularRepeat(count, radius) {
                const k = count + 1;
                const translation = [2 * radius * sin(pi / k), 0];
                const rotation = pi * (1 / k - 1 / 4);
                return this.repeat(count, translation, rotation);
            }
            */

        });

    })(),

    // dynamicObject        factories
    // inherits from object factories
    //
    dynamicObject = joy.dynamicObject = createFactory({

        [$prototype]: object.prototype,

        [$constructor]: function Joy2DDynamicObject() {
            object.constructor.call(this);
        },

        update: dynamicMethod(function (deltaTime) {
            for (var child of this.children())
                if (child instanceof dynamicObject.constructor)
                    child.update(deltaTime);
        }),

        /*
        // TODO debug this, it's not working
        clone() {
            return (
                dynamicObject(this.name())
                    .zIndex(this.zIndex())
                    .transformation(this.transformation())
                    .components(this.components())
                    .parent(this.parent())
                    .children(this.children().map(c => c.clone()))
            );
        }
        */

    }),

    // camera                       factories
    // inherits from dynamicObject  factories
    //
    // eslint-disable-next-line no-unused-vars
    camera = joy.camera = (() => {

        var viewMap = weakmap();

        return createFactory({

            [$prototype]: dynamicObject.prototype,

            [$constructor]: function Joy2DCamera(name) {
                dynamicObject.constructor.call(this, name);
                viewMap.set(this, canvas2D());
            },

            view(newView) {
                if (newView) throw cannotBeSetError([
                    this,
                    'view',
                    'view of a camera'
                ]);
                return viewMap.get(this);
            },

            pointInSpace(pointInView) {
                var view = this.view(),
                    transformation = tT(
                        [
                            pointInView[0] - view.width() / 2,
                            pointInView[1] - view.height() / 2,
                            1,
                            0
                        ],
                        this.absoluteTransformation()
                    );
                return [transformation[0], transformation[1]];
            },

            pointInView(pointInSpace) {
                var view = this.view(),
                    transformation = t(
                        [
                            pointInSpace[0],
                            pointInSpace[1],
                            1,
                            0
                        ],
                        this.absoluteTransformation()
                    );
                return [
                    transformation[0] + view.width() / 2,
                    transformation[1] + view.height() / 2
                ];
            },

            width(val) {
                if (val !== undefined) {
                    this.view().element().width = val;
                    return this;
                }
                return this.view().element().width;
            },

            height(val) {
                if (val !== undefined) {
                    this.view().element().height = val;
                    return this;
                }
                return this.view().element().height;
            },

            drawView(objects = [...this.rootParent().children()]) {

                // define rendering area rectangle
                var viewWidth = this.width(),
                    viewHeight = this.height(),
                    renderingAreaRect = [
                        [- viewWidth / 2, - viewHeight / 2],
                        viewWidth,
                        viewHeight
                    ],
                    // get visible objects
                    visibleObjects = [],
                    ind = 0,
                    currObj;
                for (; ind < objects.length; ind++) {
                    currObj = objects[ind];
                    if (
                        currObj.visible() &&
                        circleInRect(
                            [
                                currObj.relativeTo(this),
                                currObj.boundingRadius()
                            ],
                            renderingAreaRect
                        )
                    ) visibleObjects.push(currObj);
                }
                // get levels
                var levels = {};

                visibleObjects.forEach(function loop(object) {
                    // get components
                    for (
                        var ind = 0,
                            components = object.components(),
                            component, handler, levelIndex;
                        ind < components.length;
                        ind++
                    ) {
                        component = components[ind];
                        levelIndex = null;
                        handler = (
                            component instanceof renderer.constructor ?
                                1 :
                                0
                        );
                        if (handler) (
                            levels[
                                levelIndex ||
                                (levelIndex = object.absoluteZIndex())
                            ] ||
                            (levels[levelIndex] = [[]])
                        )[handler - 1].push([object, component]);
                    }
                    object.children().forEach(loop);
                });

                // initialize canvas
                var context = this.view().context();
                context.clearRect(0, 0, viewWidth, viewHeight);
                context.save();
                // draw levels
                for (
                    var ind1 = 0,
                        levelIndices = keys(levels).sort(),
                        level, components, ind2, component, transformation,
                        sinTheta, cosTheta, targetAndComponent,
                        // componentTarget,
                        componentCanvas, componentElement,
                        componentContext, componentRadius;
                    ind1 < levelIndices.length;
                    ind1++
                ) {
                    level = levels[levelIndices[ind1]];
                    // call renderers
                    components = level[0];
                    for (ind2 = 0; ind2 < components.length; ind2++) {
                        targetAndComponent = components[ind2];
                        component = targetAndComponent[1];
                        componentCanvas = component.canvas;
                        componentElement = componentCanvas.element();
                        transformation = targetAndComponent[0].relativeTo(
                            this
                        );
                        cosTheta = transformation[2];
                        sinTheta = transformation[3];
                        context.setTransform(
                            cosTheta,
                            sinTheta,
                            -sinTheta,
                            cosTheta,
                            transformation[0] + viewWidth / 2,
                            transformation[1] + viewHeight / 2
                        );
                        if (!component.refreshed()) {
                            componentContext = componentCanvas.context();
                            componentRadius =
                            ~~(component.boundingRadius()) + 1;
                            componentElement.width =
                            componentElement.height =
                            componentRadius * 2;
                            componentContext.setTransform(
                                1,
                                0,
                                0,
                                1,
                                componentRadius,
                                componentRadius
                            );
                            component.draw(componentContext);
                        }
                        else componentRadius = componentElement.width / 2;
                        context.drawImage(
                            componentElement,
                            -componentRadius,
                            -componentRadius
                        );
                    }
                }
                context.restore();
                return this;

            }

        });

    })(),

    // component    factories
    // inherits from devRoot
    //
    component = joy.component = (() => {

        function removeComponentFrom(target) {
            target.remove(this);
        }

        function insertComponentIn(target) {
            target.insert(this);
        }

        var visibleMap = weakmap(),
            refreshedMap = weakmap();

        return createFactory({

            [$prototype]: devRoot.prototype,

            [$constructor]: function Joy2DComponent() {
                devRoot.constructor.call(this);
                componentTargetsMap.set(this, set());
                boundingRadiusMap.set(this, 0);
                visibleMap.set(this, true);
            },

            boundingRadius(newBoundingRadius) {
                if (newBoundingRadius) throw boudingRadiusError(this);
                return boundingRadiusMap.get(this);
            },

            targets(newTargets) {
                var targets = componentTargetsMap.get(this);
                if (newTargets) {
                    targets.forEach(removeComponentFrom.bind(this));
                    newTargets.forEach(insertComponentIn.bind(this));
                    return this;
                }
                return targets;
            },

            appendTo(object) {
                object.append(this);
                return this;
            },

            visible(newVisibile) {
                var visible = visibleMap.get(this);
                if (newVisibile !== undefined) {
                    var value = !!newVisibile;
                    if (value !== visible) {
                        visibleMap.set(this, value);
                        this.refreshed(false)
                            .targets().forEach(refreshBoundingRadiusOf);
                    }
                    return this;
                }
                return visible && this.boundingRadius() !== 0;
            },

            refreshed(newRefreshed) {
                if (newRefreshed !== undefined) {
                    refreshedMap.set(this, newRefreshed);
                    return this;
                }
                return refreshedMap.get(this);
            }

        });

    })(),

    // renderer                 factories
    // inherits from component  factories
    //
    renderer = joy.renderer = (() => {

        var backgroundMap = weakmap(),
            strokeMap = weakmap();

        return createFactory({

            [$prototype]: component.prototype,

            [$constructor]: function Joy2DRenderer(/* drawer */) {
                component.constructor.call(this);
                this.refreshed(false).canvas = canvas2D();
            },

            draw() {
                throw error([
                    this,
                    'draw',
                    'this renderer has no draw method assigned to it'
                ]);
            },

            radius(newRadius) {
                var radius = this.boundingRadius();
                if (newRadius !== undefined) {
                    if (newRadius !== radius) {
                        boundingRadiusMap.set(this, newRadius);
                        this.targets().forEach(refreshBoundingRadiusOf);
                    }
                    return this.refreshed(false);
                }
                return radius;
            },

            background(newBackground) {
                if (newBackground) {
                    backgroundMap.set(this, newBackground);
                    return this.refreshed(false);
                }
                return backgroundMap.get(this);
            },

            stroke(newStroke) {
                if (newStroke) {
                    strokeMap.set(this, newStroke);
                    return this.refreshed(false);
                }
                return strokeMap.get(this);
            }

        });

    })(),

    // circle                   factories
    // inherits from renderer   factories
    //
    // eslint-disable-next-line no-unused-vars
    circle = joy.circle = createFactory({

        [$prototype]: renderer.prototype,

        [$constructor]: function Joy2DCircle(radius) {
            renderer.constructor.call(this);
            if (radius) this.radius(radius);
        },

        draw(context) {
            if (this.visible()) {
                var background = this.background(),
                    stroke = this.stroke(),
                    radius = this.radius();
                if ((background || stroke) && radius) {
                    context.beginPath();
                    context.arc(0, 0, radius, 0, pi * 2);
                    if (background) {
                        context.fillStyle = background;
                        context.fill();
                    }
                    if (stroke) {
                        context.strokeStyle = stroke;
                        context.stroke();
                    }
                    context.closePath();
                }
            }
            return this.refreshed(true);
        }

    }),

    // shape                    factories
    // inherits from renderer   factories
    //
    shape = joy.shape = (() => {

        var pathMap = weakmap();

        return createFactory({

            [$prototype]: renderer.prototype,

            [$constructor]: function Joy2DShape(path) {
                renderer.constructor.call(this);
                if (path) this.path(path);
            },

            path(newPath) {
                if (newPath) {
                    var maxRadius = 0,
                        ind1 = newPath.length,
                        ind2, points, radius;
                    while (ind1--) {
                        points = newPath[ind1];
                        ind2 = 0;
                        while (ind2 < points.length) {
                            radius = pyth(points[ind2++], points[ind2++]);
                            if (radius > maxRadius) maxRadius = radius;
                        }
                    }
                    renderer.prototype.radius.call(this, maxRadius);
                    pathMap.set(this, newPath);
                    return this;
                }
                return pathMap.get(this);
            },

            draw(context) {
                var background = this.background(),
                    stroke = this.stroke(),
                    path = this.path();
                if (path && (background || stroke)) {
                    context.beginPath();
                    for (
                        var ind1 = 0,
                            ind2, points;
                        ind1 < path.length;
                        ind1++
                    ) {
                        points = path[ind1];
                        context.moveTo(points[0], points[1]);
                        ind2 = 0;
                        while (ind2 < points.length)
                            context.lineTo(points[ind2++], points[ind2++]);
                    }
                    if (background) {
                        context.fillStyle = background;
                        context.fill();
                    }
                    if (stroke) {
                        context.strokeStyle = stroke;
                        context.stroke();
                    }
                    context.closePath();
                }
                return this.refreshed(true);
            },

            radius(newRadius) {
                if (newRadius)
                    throw cannotBeSetError([
                        this,
                        'radius',
                        'radius of a shape'
                    ]);
                return renderer.prototype.radius.call(this);
            }

        });

    })(),

    // polygon              factories
    // inherits from shape  factories
    //
    polygon = joy.polygon = createFactory({

        [$prototype]: shape.prototype,

        [$constructor]: function Joy2DPolygon(points) {
            shape.constructor.call(this);
            if (points) this.points(points);
        },

        points(newPoints) {
            if (newPoints) {
                shape.prototype.path.call(
                    this,
                    [newPoints.concat(newPoints[0], newPoints[1])]
                );
                return this;
            }
            var points = this.path()[0];
            return points.slice(0, points.length - 2);
        },

        path(newPath) {
            if (newPath) throw cannotBeSetError([
                this,
                'path',
                'path of a polygon'
            ]);
            return shape.prototype.path.call(this);
        }

    }),

    // rectangle                factories
    // inherits from polygon    factories
    //
    // eslint-disable-next-line no-unused-vars
    rectangle = joy.rectangle = (() => {

        const $width = Symbol('Joy2DRectangle Width');
        const $height = Symbol('Joy2DRectangle Height');

        return createFactory({

            [$prototype]: polygon.prototype,

            [$constructor]: function Joy2DRectangle([w, h] = [1, 1]) {
                polygon.constructor.call(this);
                this.size([w, h]);
            },

            points(newPoints) {
                if (newPoints) throw cannotBeSetError([
                    this,
                    'points',
                    'points of a rectangle'
                ]);
                return polygon.prototype.points.call(this);
            },

            size(newSize) {
                if (newSize === undefined) return [this[$width], this[$height]];
                if (newSize && Symbol.iterator in newSize) {
                    const [w, h] = newSize;
                    if (typeof w !== 'number') return this;
                    if (typeof h !== 'number') return this;
                    this[$width] = w;
                    this[$height] = h;
                    const wHalf = w / 2;
                    const hHalf = h / 2;
                    polygon.prototype.points.call(this, [
                        -wHalf, -hHalf,
                        wHalf, -hHalf,
                        wHalf, hHalf,
                        -wHalf, hHalf
                    ]);
                }
                return this;
            },

            w(newW) {
                if (newW === undefined) return this[$width];
                if (typeof newW === 'number')
                    return this.size([newW, this[$height]]);
                return this;
            },

            h(newH) {
                if (newH === undefined) return this[$height];
                if (typeof newH === 'number')
                    return this.size([this[$width], newH]);
                return this;
            }

        });

    })(),

    // text                     factories
    // inherits from renderer   factories
    //
    // eslint-disable-next-line no-unused-vars
    text = joy.text = (() => {

        // var contentMap = weakmap(),
        //     colorMap = weakmap(),
        //     strokeMap = weakmap;
        return createFactory({

            [$prototype]: renderer.prototype,

            [$constructor]: function Joy2DText(content) {
                renderer.constructor.call(this);
                this.content(content);
            },

            radius(newRadius) {
                if (newRadius)
                    throw cannotBeSetError([
                        this,
                        'radius',
                        'radius of a text'
                    ]);
                return renderer.prototype.radius.call(this);
            }

        });

    })();

/* -------------------------------------------------------------------------- */

})();