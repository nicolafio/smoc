/*
    
    Deviser.js 001
    Copyright (c) 2015 Nicola Fiori

    All rights reserved.

*/
// TODO finish documentation
// TODO use 3 spaces for tabs
/* jshint esnext: true */

(function () {
    // chromium version 42
    // NodeList prototype doesn't have the Symbol.iterator property
    //
    var prototype = NodeList.prototype,
        iterator = Symbol.iterator;
    if (!prototype[iterator]) prototype[iterator] = function* () {
        for (var ind = 0, max = this.length; ind < max; ind++) yield this[ind];
    };
})();

var dev = (function () {
    /* jshint validthis: true */
    "use strict";
    
    var dev = {},
        utils = dev.utils = {},
        createFactory = dev.createFactory = (function () {
            function factory(arg1, arg2) {
                var behaviour,
                    properties,
                    output;
                if (typeof arg1 === 'function') {
                    behaviour = arg1;
                    properties = arg2;
                }
                else {
                    properties = arg1;
                    behaviour = arg2;
                }
                output = new this(properties);
                if (behaviour) output.applyBehaviour(behaviour);
                return output;
            }
            return function createFactory(constructor, prototype) {
                var output = factory.bind(constructor);
                output.constructor = constructor;
                defineProp(
                    output.prototype = constructor.prototype = prototype || {},
                    'constructor',
                    prop(constructor, 1)
                );
                output.constructor = constructor;
                return output;
            };
        })(),

/* -- core utils ------------------------------------------------------------ */
    
        // win  core utils
        //
        win = window,

        // Obj  core utils
        //      
        Obj = Object,

        // doc  core utils
        //      
        doc = document,

        // weakmap  core utils
        //          
        weakmap = function () { return new WeakMap(); },

        // math core utils
        //
        math = Math,

        // max      core utils
        //          
        // using:
        // - math   core utils
        //
        max = math.max,

        // min      core utils
        //          
        // using:
        // - math   core utils
        //
        min = math.min,

        // round    core utils
        //          
        // using:
        // - math   core utils
        //
        round = math.round,

        // set  core utils
        //      
        set = function (iterable) {
            return new Set(iterable);
        },

        // arr  core utils
        //      
        arr = Array,

        // freeze   core utils
        //
        // using:
        // - Obj
        //           
        freeze = Obj.freeze,

        // parseInt core utils
        //          
        // using:
        // - win    core utils
        //
        parseInt = win.parseInt,

/* -- utils ----------------------------------------------------------------- */

        // createObj    utils
        //              
        // using:   
        // - Obj        core utils
        //
        createObj = utils.createObj = Obj.create,

        // prop utils
        //      
        prop = utils.prop = function (value, notEnum, notWrit, notConf) {
            return {
                value: value,
                configurable: !notConf,
                enumerable: !notEnum,
                writable: !notWrit
            };
        },

        // propWithGetAndSet    utils
        // 
        propWithGetAndSet = utils.propWithGetAndSet = function (
            getter,
            setter,
            notEnum,
            notConf
        ) {
            return {
                set: setter,
                get: getter,
                enumerable: !notEnum,
                configurable: !notConf
            };
        },

        // propsWithGetAndSet   utils
        //
        // using:
        // - propWithGetAndSet  utils
        //                      
        propsWithGetAndSet = utils.propsWithGetAndSet = function (
            props,
            notEnum,
            notConf
        ) {
            var output = {};
            for (var key in props) output[key] = propWithGetAndSet(
                props[key][0],
                props[key][1],
                notEnum,
                notConf
            );
            return output;
        },

        // propWithGet
        //
        propWithGet = utils.propWithGet = function (getter, notEnum, notConf) {
            return propWithGetAndSet(getter, undefined, notEnum, notConf);
        },

        // propsWithGet
        //
        propsWithGet = utils.propsWithGet = function (props, notEnum, notConf) {
            var output = {};
            for (var key in props)
                output[key] = propWithGet(props[key], notEnum, notConf);
            return output;
        },

        // props    utils
        //          
        // using:
        // - prop   utils
        //          
        props = utils.props = function (props, notEnum, notWrit, notConf) {
            var output = {};
            for (var key in props)
                output[key] = prop(props[key], notEnum, notWrit, notConf);
            return output;
        },

        // keys
        //              
        // using:
        // - Obj        core utils
        //
        keys = utils.keys = Obj.getOwnPropertyNames,

        // getProp  utils
        //                
        // using:
        // - Obj    core utils
        //
        getProp = utils.getProp = Obj.getOwnPropertyDescriptor,

        // getProps         utils
        //                  
        // using:
        // - getProps       utils
        // - keys           utils
        //
        getProps = utils.getProps = function (object) {
            var output = {};
            keys(object).forEach(function (key) {
                output[key] = getProp(object, key);
            });
            return output;
        },

        // getProto
        //
        getProto = utils.getProto = Obj.getPrototypeOf,

        // defineProp
        //
        defineProp = utils.defineProp = Obj.defineProperty,

        // defineProps
        //
        defineProps = utils.defineProps = Obj.defineProperties,

        // merge
        //
        // using:
        // - defineProps
        // - getProps
        //
        merge = utils.merge = function (obj1) {
            for (var ind = 1; ind < arguments.length; ind++)
                defineProps(obj1, getProps(arguments[ind]));
            return obj1;
        },

        // dynamicMethod    utils
        //                  
        // using:
        // - weakmap        core utils
        //
        dynamicMethod = utils.dynamicMethod = function (executor) {
            var listenersMap = weakmap(),
                notProcessing = true,
                iolrdp; // Indices Of Listeners Removed During Processing
            function dynamicMethod(listener, removeListener) {
                var listeners;
                // loop trough listeners
                if (typeof listener !== 'function') {
                    var executor = dynamicMethod.executor;
                    if (!executor || executor.apply(this, arguments) !== false) 
                        if (listeners = listenersMap.get(this)) {
                            notProcessing = false;
                            for (
                                var ind = 0,
                                    item;
                                ind < listeners.length;
                                ind++
                            ) if (item = listeners[ind])
                                if (item.apply(this, arguments) === false) 
                                    break;
                            if (iolrdp) {
                                ind = iolrdp.sort().length;
                                while (ind--) listeners.splice(iolrdp[ind], 1);
                                iolrdp = null;
                            }
                            notProcessing = true;
                        }
                }
                // add listener
                else if (!removeListener) {
                    listeners = listenersMap.get(this);
                    if (!listeners) listenersMap.set(this, listeners = []);
                    if (!~listeners.indexOf(listener)) listeners.push(listener);
                }
                // remove listener
                else if (listeners = listenersMap.get(this)) {
                    var index = listeners.indexOf(listener);
                    if (~index) {
                        if (notProcessing) listeners.splice(index, 1);
                        else {
                            if (!iolrdp) iolrdp = [];
                            iolrdp.push(index);
                            listeners[index] = null;
                        }
                    }
                }
                return this;
            }
            dynamicMethod.executor = executor;
            dynamicMethod.getListenersOf = function (object) {
                return listenersMap.get(object);
            };
            return dynamicMethod;
        },

        // dynamicProperty
        // 
        // using:
        // - dynamicMethod 
        //
        dynamicProperty = utils.dynamicProperty = function (defaultValue) {
            var method = dynamicMethod(),
                valueMap = weakmap();
            function property(newValue) {
                if (newValue !== undefined) {
                    if (typeof newValue !== 'function') {
                        if (newValue !== valueMap.get(this)) {
                            valueMap.set(this, newValue);
                            method.call(this, newValue);
                        }
                    }
                    else method.apply(this, arguments);
                    return this;
                }
                var value = valueMap.get(this);
                return value === undefined ? property.defaultValue : value;
            }
            property.defaultValue = defaultValue;
            return property;
        },

        // property
        //
        property = utils.property = function (defaultValue) {
            var valueMap = weakmap();
            function property(newValue) {
                if (newValue !== undefined) {
                    valueMap.set(this, newValue);
                    return this;
                }
                return valueMap.get(this) || property.defaultValue;
            }
            property.defaultValue = defaultValue;
            return property;
        },

        // getTime
        //
        getTime  = utils.getTime = Date.now,

        // createEl utils
        //          
        // using:
        // - doc    core utils
        //
        createEl = doc.createElement.bind(doc),

/* -- factories ------------------------------------------------------------- */

        // root factories
        //      
        root = dev.root = createFactory(
            function DeviserRoot() { },
            createObj(Obj.prototype, props({
                applyBehaviour: function (behaviour) {
                    behaviour.call(this);
                    return this;
                },
                setProperties: function (properties) {
                    defineProps(this, getProps(properties));
                    return this;
                },
                applyProperties: function (properties) {
                    for (var key in properties) {
                        console.log(key);
                        this[key](properties[key]);
                    }
                    return this;
                }
            }))
        ),

        // collection           factories
        // inherits from root   factories
        //
        collection = dev.collection = (function () {
            var collection = createFactory(
                    function DeviserCollection(items) {
                        root.constructor.call(this);
                        if (items) this.add.apply(this, items);
                    },
                    createObj(root.prototype, props({
                        // TODO make length a method
                        length: 0,
                        indexOf: function (item) {
                            var ind = this.length;
                            while (ind--) if (item === this[ind]) break;
                            return ind;
                        },
                        remove: function (item) {
                            var self = this,
                                index = self.indexOf(item);
                            if (index >= 0) {
                                var ind = index,
                                    max = self.length;
                                while (ind < max) self[ind++] = self[ind];
                                delete self[--self.length];
                            }
                            return self;
                        },
                        insert: function (item, index) {
                            var self = this,
                                ind = self.length;
                            self.remove(item);
                            while (ind > index) self[ind] = self[--ind];
                            self[ind] = item;
                            self.length++;
                            return self;
                        },
                        prepend: function (item) {
                            return this.insert(item, 0);
                        },
                        append: function (item) {
                            return this.insert(item, this.length);
                        },
                        insertBefore: function (item1, itme2) {
                            var self = this,
                                index = self.indexOf(item2);
                            if (index >= 0) self.insert(item1, index);
                            return self;
                        },
                        insertAfter: function (item1, item2) {
                            var self = this,
                                index = self.indexOf(item2);
                            if (index++ >= 0) self.insert(item1, index);
                            return self;
                        },
                        clear: function () {
                            var ind = this.length;
                            while (ind--) this.remove(this[ind]);
                            return this;
                        },
                        forEach: function (callback) {
                            var self = this,
                                ind = 0,
                                max = self.length;
                            while (ind < max) callback(self[ind], ind++, self);
                            return self;
                        },
                        some: function (callback) {
                            for (var ind = 0; ind < this.length; ind++)
                                if (callback(this[ind], ind)) return true;
                            return false;
                        },
                        every: function (callback) {
                            for (var ind = 0; ind < this.length; ind++)
                                if (!callback(this[ind], ind)) return false;
                            return true;
                        },
                        add: function () {
                            var ind = 0,
                                args = arguments,
                                max = args.length;
                            while (ind < max) this.append(args[ind++]);
                            return this;
                        },
                        has: function (item) { return this.indexOf(item) >= 0; }
                    }))
                );
            // TODO do it using computed property keys when chrome will support
            // them
            collection.prototype[Symbol.iterator] = function (collection) {
                var ind = 0;
                return {
                    next: (function () {
                        return (
                            ind < this.length ?
                            {
                                value: this[ind++],
                                done: false
                            } :
                            { done: true }
                        );
                    }).bind(this)
                };
            };
            return collection;
        })(),


        // color                factories
        // inherits from root   factories
        //
        color = dev.color = (function () {
            function setString(self, type, string) {
                for (var key in colorTypes) colorTypes[key].map.delete(self);
                rgbValsMap.delete(self);
                hslValsMap.delete(self);
                colorTypes[type].map.set(self, string);
            }
            function hexToRgb(match) {
                var rgbVals = [],
                    ind = 3,
                    multiplier = match[1].length - 1 ? 1 : 17;
                while (ind--) rgbVals[ind] = (
                    parseInt(match[ind + 1], 16) * multiplier / 255
                );
                return rgbVals;
            }
            function hslToRgb(hslVals) {
                var rgbVals,
                    s = hslVals[1],
                    l = hslVals[2];
                if (s === 0) rgbVals = [l, l, l];
                else {
                    rgbVals = [];
                    for (
                        var ind = 3,
                            h = hslVals[0],
                            q = (
                                l < 0.5 ?
                                l * (1 + s) :
                                l + s - l * s
                            ),
                            p = 2 * l - q,
                            t;
                        ind--;
                    ) {
                        t = h + (1 - ind) / 3;
                        if (t < 0) t += 1;
                        if (t > 1) t -= 1;
                        rgbVals[ind] = (
                            t < 1 / 6 ? p + (q - p) * 6 * t :
                            t < 1 / 2 ? q :
                            t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 :
                            p
                        );
                    }
                }
                return rgbVals;
            }
            function rgbToHsl(rgbVals) {
                var m = min.apply(null, rgbVals),
                    M = max.apply(null, rgbVals),
                    l = (M + m) / 2;
                if (M === m) return [0, 0, l];
                var r = rgbVals[0],
                    g = rgbVals[1],
                    b = rgbVals[2],
                    d = M - m;
                return [
                    (
                        r === M ? (g - b) / d + (g < b ? 6 : 0) :
                        g === M ? (b - r) / d + 2 :
                        (r - g) / d + 4
                    ) / 6,
                    l > 0.5 ? d / (2 - M - m) : d / (M + m),
                    l
                ];
            }
            var colorTypes = {
                    hex: {
                        regex: /^\s*#(?=(?:[0-9a-z]{3}|[0-9a-z]{6})\s*$)([a-z0-9]{1,2})([a-z0-9]{1,2})([a-z0-9]{1,2})/i,
                        map: weakmap()
                    },
                    rgb: {
                        regex: /^\s*rgb\(\s*(-?[0-9])+\s*,\s*(-?[0-9])+\s*,\s*(-?[0-9])+\s*\)\s*$/i,
                        map: weakmap()
                    },
                    rgba: {
                        regex: /^\s*rgba\(\s*(-?[0-9])+\s*,\s*(-?[0-9])+\s*,\s*(-?[0-9])+\s*,\s*(-?[0-9]*(?:\.[0-9]+)?)\s*\)\s*$/i,
                        map: weakmap()
                    },
                    hsl: {
                        regex: /^\s*hsl\(\s*(-?[0-9]*(?:\.[0-9]+)?)\s*,\s*(-?[0-9]*(?:\.[0-9]+)?)%\s*,\s*(-?[0-9]*(?:\.[0-9]+)?)%\s*\)\s*$/i,
                        map: weakmap()
                    },
                    hsla: {
                        regex: /^\s*hsla\(\s*(-?[0-9]*(?:\.[0-9]+)?)\s*,\s*(-?[0-9]*(?:\.[0-9]+)?)%\s*,\s*(-?[0-9]*(?:\.[0-9]+)?)%\s*,\s*(-?[0-9]*(?:\.[0-9]+)?)\s*\)\s*$/i,
                        map: weakmap()
                    }
                },
                rgbValsMap = weakmap(),
                hslValsMap = weakmap(),
                alphaMap = weakmap();
            return createFactory(
                function DeviserColor(color) {
                    root.constructor.call(this);
                    if (color)
                        if (typeof color === 'string')
                            for (var key in colorTypes)  {
                                if (colorTypes[key].regex.test(color)) {
                                    this[key](color);
                                    break;
                                }
                            }
                        else if (color instanceof Array) this.rgbVals(color);
                        else if (color instanceof DeviserColor)
                            this.rgbVals(color.rgbVals());
                        // TODO else throw error
                },
                createObj(root.prototype, props({
                    rgbVals: function (newRgbVals) {
                        var key;
                        if (newRgbVals) {
                            for (key in colorTypes)
                                colorTypes[key].map.delete(this);
                            hslValsMap.delete(this);
                            rgbValsMap.set(
                                this,
                                freeze(newRgbVals.slice(0, 3))
                            );
                            return this;
                        }
                        if (rgbValsMap.has(this)) return rgbValsMap.get(this);
                        var outputVals;
                        if (hslValsMap.has(this))
                            outputVals = hslToRgb(hslValsMap.get(this));
                        else {
                            var colorType, match, map;
                            for (key in colorTypes) {
                                colorType = colorTypes[key];
                                map = colorType.map;
                                if (map.has(this)) {
                                    match = (
                                        map.get(this).match(colorType.regex)
                                    );
                                    switch (key) {
                                        case 'rgba':
                                            alphaMap.set(this, match[4]);
                                        case 'rgb':
                                            outputVals = [
                                                match[1] / 255,
                                                match[2] / 255,
                                                match[3] / 255
                                            ];
                                            break;
                                        case 'hex':
                                            outputVals = hexToRgb(match);
                                            break;
                                        case 'hsla':
                                            alphaMap.set(this, match[4]);
                                        case 'hsl':
                                            var arr = freeze([
                                                    match[1] / 360,
                                                    match[2] / 100,
                                                    match[3] / 100
                                                ]);
                                            map.set(this, arr);
                                            outputVals = hslToRgb(arr);
                                    }
                                }
                            }
                        }
                        if (!outputVals) outputVals = [0, 0, 0];
                        freeze(outputVals);
                        rgbValsMap.set(this, outputVals);
                        return outputVals;
                    },
                    hslVals: function (newHslVals) {
                        var key;
                        if (newHslVals) {
                            for (key in colorTypes)
                                colorTypes[key].map.delete(this);
                            rgbValsMap.delete(this);
                            hslValsMap.set(
                                this,
                                freeze(newHslVals.slice(0, 3))
                            );
                            return this;
                        }
                        if (hslValsMap.has(this)) return hslValsMap.get(this);
                        var outputVals;
                        if (rgbValsMap.has(this))
                            outputVals = rgbToHsl(rgbValsMap.get(this));
                        else {
                            var colorType, match, map, ind, arr;
                            for (key in colorTypes) {
                                colorType = colorTypes[key];
                                map = colorType.map;
                                if (map.has(this)) {
                                    match = (
                                        map.get(this).match(colorType.regex)
                                    );
                                    switch (key) {
                                        case 'hsla':
                                            alphaMap.set(this, match[4]);
                                        case 'hsl':
                                            outputVals = [
                                                match[1] / 360,
                                                match[2] / 100,
                                                match[3] / 100
                                            ];
                                            break;
                                        case 'rgba':
                                            alphaMap.set(this, match[4]);
                                        case 'rgb':
                                            arr = freeze([
                                                match[1] / 255,
                                                match[2] / 255,
                                                match[3] / 255
                                            ]);
                                            break;
                                        case 'hex':
                                            arr = freeze(hexToRgb(match));
                                        case 'rgb':
                                        case 'rgba':
                                            rgbValsMap.set(this, arr);
                                            outputVals = rgbToHsl(arr);
                                    }
                                }
                            }
                        }
                        if (!outputVals) outputVals = [0, 0, 0];
                        freeze(outputVals);
                        hslValsMap.set(this, outputVals);
                        return outputVals;
                    },
                    a: (function () {
                        var types = ['rgba', 'hsla'];
                        return function (newAlpha) {
                            if (newAlpha !== undefined) {
                                if (newAlpha !== alphaMap.get(this)) {
                                    colorTypes.rgba.map.delete(this);
                                    colorTypes.hsla.map.delete(this);
                                    alphaMap.set(this, newAlpha);
                                }
                                return this;
                            }
                            if (alphaMap.has(this)) return alphaMap.get(this);
                            var colorType, map;
                            for (var key of types) {
                                colorType = colorTypes[key];
                                map = colorType.map;
                                if (map.has(this)) {
                                    var alpha = map.get(this).match(
                                            colorType.regex
                                        );
                                    alphaMap.set(this, alpha);
                                    return alpha;
                                }
                            }
                            return 1;
                        };
                    })(),
                    r: function (newRed) {
                        var vals = this.rgbVals(),
                            red = vals[0];
                        if (newRed !== undefined) {
                            if (newRed !== red) 
                                this.rgbVals([newRed, vals[1], vals[2]]);
                            return this;
                        }
                        return red;
                    },
                    g: function (newGreen) {
                        if (newGreen !== undefined) {
                            var vals = this.rgbVals();
                            return this.rgbVals([vals[0], newGreen, vals[2]]);
                        }
                        return this.rgbVals()[1];
                    },
                    b: function (newBlue) {
                        if (newBlue !== undefined) {
                            var vals = this.rgbVals();
                            return this.rgbVals([vals[0], vals[1], newBlue]);
                        }
                        return this.rgbVals()[2];
                    },
                    h: function (newHue) {
                        if (newHue !== undefined) {
                            var vals = this.hslVals();
                            return this.hslVals([newHue, vals[1], vals[2]]);
                        }
                        return this.hslVals()[0];
                    },
                    s: function (newSaturation) {
                        if (newSaturation !== undefined) {
                            var vals = this.hslVals();
                            return this.hslVals([
                                vals[0],
                                newSaturation,
                                vals[2]
                            ]);
                        }
                        return this.hslVals()[0];
                    },
                    l: function (newLightness) {
                        if (newLightness !== undefined) {
                            var vals = this.hslVals();
                            return this.hslVals([
                                vals[0],
                                vals[1],
                                newLightness
                            ]);
                        }
                        return this.hslVals()[2];
                    },
                    hex: function (newHex) {
                        if (newHex) {
                            // TODO throw error if the string doesn't match
                            setString(this, 'hex', newHex);
                            return this;
                        }
                        var string = colorTypes.hex.map.get(this);
                        if (string) return string;
                        var hex = '#',
                            rgbVals = this.rgbVals(),
                            hexVals = [],
                            hexVal,
                            numOfCollapsableVals = 0,
                            ind = 3;
                        while (ind--) {
                            hexVal = round(rgbVals[ind] * 255).toString(16);
                            if (hexVal.length === 1) hexVal = 0 + hexVal;
                            if (hexVal[0] === hexVal[1]) numOfCollapsableVals++;
                            hexVals[ind] = hexVal;
                        }
                        if (numOfCollapsableVals !== 3) hex += hexVals.join('');
                        else while (++ind < 3) hex += hexVals[ind][0];
                        colorTypes.hex.map.set(this, hex);
                        return hex;
                    },
                    rgb: function (newRgb) {
                        if (newRgb) {
                            // TODO throw error if the string doesn't match
                            setString(this, 'rgb', newRgb);
                            return this;
                        }
                        var string = colorTypes.rgb.map.get(this);
                        if (string) return string;
                        for (
                            var ind = 3,
                                inputVals = this.rgbVals(),
                                outputVals = [];
                            ind--;
                        ) outputVals[ind] = round(inputVals[ind] * 255);
                        string = 'rgb(' + outputVals + ')';
                        colorTypes.rgb.map.set(this, string);
                        return string;
                    },
                    hsl: function (newHsl) {
                        if (newHsl) {
                            // TODO throw error if the string doesm't match
                            setString(this, 'hsl', newHsl);
                            return this;
                        }
                        var string = colorTypes.hsl.map.get(this);
                        if (string) return string;
                        var inputVals = this.hslVals();
                        string = (
                            'hsl(' +
                            [
                                inputVals[0] * 360,
                                inputVals[1] * 100 + '%',
                                inputVals[2] * 100 + '%'
                            ] +
                            ')'
                        );
                        colorTypes.hsl.map.set(this, string);
                        return string;
                    },
                    rgba: function (newRgba) {
                        if (newRgba) {
                            // TODO throw error if the string doesm't match
                            alphaMap.delete(this);
                            setString(this, 'rgba', newRgba);
                            return this;
                        }
                        var string = colorTypes.rgba.map.get(this);
                        if (string) return string;
                        for (
                            var ind = 3,
                                inputVals = this.rgbVals(),
                                outputVals = [];
                            ind--;
                        ) outputVals[ind] = round(inputVals[ind] * 255);
                        string = 'rgba(' + [outputVals, this.a()] + ')';
                        colorTypes.rgba.map.set(this, string);
                        return string;
                    },
                    hsla: function (newHsla) {
                        if (newHsla) {
                            // TODO throw error if the string doesm't match
                            alphaMap.delete(this);
                            setString(this, 'hsla', newHsla);
                            return this;
                        }
                        var string = colorTypes.rgba.map.get(this);
                        if (string) return string;
                        var inputVals = this.hslVals();
                        string = (
                            'hsla(' +
                            [
                                inputVals[0] * 360,
                                inputVals[1] * 100 + '%',
                                inputVals[2] * 100 + '%',
                                this.a()
                            ] +
                            ')'
                        );
                        colorTypes.hsla.map.set(this, string);
                        return string;
                    },
                    toString: function () {
                        var map;
                        for (var key in colorTypes) {
                            map = colorTypes[key].map;
                            if (map.has(this)) return map.get(this);
                        }
                        return this.rgba();
                    },
                    clone: function () { return color(this); }
                }))
            );
        })(),

        // dynamicObject    factories
        //                  
        dynamicObject = dev.dynamicObject = (function () {
            var listenersMap = weakmap();
            return createFactory(
                function DeviserDynamicObject(listeners) {
                    if (listeners) for (var listener of listeners)
                        this.addListener(listeners);
                },
                createObj(Obj.prototype, props({
                    addListener: function (listener, prioritize) {
                        var listeners = listenersMap.get(this);
                        if (!listeners)
                            listeners = listenersMap.set(this, collection());
                        listeners[prioritize ? 'append' : 'prepend'](listener);
                        return this;
                    },
                    removeListener: function (listener) {
                        listenersMap.get(this).remove(listener);
                        return this;
                    },
                    dispatchChange: function (change) {
                        var listeners = listenersMap.get(this);
                        if (listeners) for (var listener of listeners)
                            if (listener.call(this, change) === false) break;
                        return this;
                    }
                }))
            );
        })(),

        // dynamicValue
        // inherits from root
        //
        dynamicValue = dev.dynamicValue = createFactory(
            function DeviserDynamicValue(value) {
                root.constructor.call(this);
                if (value !== undefined) this.value(value);
            },
            createObj(root.prototype, props({
                value: dynamicProperty()
            }))
        ),

        // animatedNumber
        // inherits from dynamicValue
        //
        animatedNumber = dev.animatedNumber = (function () {
            var animationMap = weakmap(),
                targetMap = weakmap();
            function updateListener(deltaTime) {
                var currValue = this.value(),
                    target = this.target(),
                    valueDelta = this.delta() * deltaTime,
                    nextValue;
                if (target > currValue) {
                    nextValue = currValue + valueDelta;
                    if (nextValue > target) nextValue = target;
                }
                else {
                    nextValue = currValue - valueDelta;
                    if (target > nextValue) nextValue = target;
                }
                if (target === nextValue) {
                    animationMap.get(this).stop();
                    animationMap.delete(this);
                }
                this.value(nextValue);
            }
            return createFactory(
                function DeviserAnimatedNumber(number) {
                    dynamicValue.constructor.call(this, number || 0);
                    this.target(number || 0);
                },
                createObj(dynamicValue.prototype, props({
                    delta: property(1),
                    value: dynamicProperty(0),
                    target: function (newTarget) {
                        var target = targetMap.get(this);
                        if (newTarget !== undefined) {
                            if (newTarget !== target) {
                                if (!animationMap.get(this)) animationMap.set(
                                    this,
                                    animationFrameLoop()
                                        .update(updateListener.bind(this))
                                        .start()
                                );
                                targetMap.set(this, newTarget);
                            }
                            return this;
                        }
                        return target;
                    },
                    jumpTo: function (number) {
                        return this.target(number).value(number);
                    }
                }))
            );
        })(),

        // runnable
        // inherits from root
        //
        runnable = dev.runnable = (function () {
            var runningMap = weakmap();
            return createFactory(
                function DeviserRunnable() { root.constructor.call(this); },
                createObj(root.prototype, props({
                    // TODO fix start bug
                    start: dynamicMethod(function () {
                        if (!runningMap.get(this)) runningMap.set(this, true);
                        else return false;
                    }),
                    stop: dynamicMethod(function () {
                        if (runningMap.get(this)) runningMap.set(this, false);
                        else return false;
                    }),
                    running: function (newRunning) {
                        // TODO if newRunning exist throw error
                        return runningMap.get(this);
                    }
                }))
            );
        })(),

        // animationFrameLoop
        // inherits from runnable
        //
        animationFrameLoop = dev.animationFrameLoop = (function () {
            var lastTimeMap = weakmap();
            function loop() {
                if (this.running()) {
                    var time = getTime();
                    this.update(time - lastTimeMap.get(this));
                    lastTimeMap.set(this, time);
                    requestAnimationFrame(loop.bind(this));
                }
            }
            return createFactory(
                function DeviserAnimationFrameLoop() {
                    runnable.constructor.call(this);
                },
                createObj(runnable.prototype, props({
                    start: dynamicMethod(function () {
                        if (
                            runnable.prototype.start.executor.call(this) !==
                            false
                        ) {
                            lastTimeMap.set(this, getTime());
                            requestAnimationFrame(loop.bind(this));
                        }
                        else return false;
                    }),
                    update: dynamicMethod()
                }))
            );
        })(),

        // loadingTarget
        // inherits from runnable
        //
        loadingTarget = dev.loadingTarget = (function () {
            function stop() { this.stop(); }
            return createFactory(
                function DeviserLoadingTarget() {
                    runnable.constructor.call(this);
                },
                createObj(runnable.prototype, props({
                    resolve: dynamicMethod(stop),
                    reject: dynamicMethod(stop),
                    complete: function (listener, remove) {
                        // TODO throw error if there is no listener
                        return (
                            this.resolve(listener, remove)
                                .reject(listener, remove)
                        );
                    },
                    start: dynamicMethod(function () {
                        if (
                            runnable.prototype.start.executor.call(this) ===
                            false
                        ) return false;
                        this.completion(0);
                    }),
                    completion: dynamicProperty(0)
                }))
            );
        })(),

        // loadingList
        // inherits from loadingTarget
        //
        loadingList = dev.loadingList = (function () {
            var loadingList = createFactory(
                    function DeviserLoadingList(list) {
                        loadingTarget.call(this);
                        if (list) this.list(list);
                    },
                    createObj(loadingTarget.prototype, props({
                        start: dynamicMethod(function () {
                            if (
                                loadingTarget.prototype.start.executor.call(
                                    this
                                ) ===
                                false
                            ) return false;
                            var list = this.list(),
                                pending = list.length,
                                delta = 1 / pending,
                                completeListener = function () {
                                    this.resolve(resolveListener, true)
                                        .reject(rejectListener, true)
                                        .complete(completeListener, true)
                                        .completion(completionListener, true);
                                },
                                resolveListener = (function () {
                                    if (!--pending) this.resolve();
                                }).bind(this),
                                rejectListener = (function (message) {
                                    this.reject(message);
                                }).bind(this),
                                completionListener = (function () {
                                    var completion = 0;
                                    for (var item of list)
                                        completion += item.completion() * delta;
                                    this.completion(completion);
                                }).bind(this);
                            this.stop(function stop() {
                                for (var item of list) 
                                    completeListener.call(item.stop());
                                this.stop(stop, true);
                            });
                            for (var item of list)
                                item.resolve(resolveListener)
                                    .reject(rejectListener)
                                    .complete(completeListener)
                                    .completion(completionListener);
                            completionListener();
                        }),
                        list: property()
                    }))
                );
            // TODO do it using computed property keys when chrome will support
            // them
            loadingList.prototype[Symbol.iterator] = function* () {
                yield* this.list();
            };
            return loadingList;
        })(),

        // simultaneousLoading
        // inherits from loadingList
        //
        simultaneousLoading = dev.simultaneousLoading = createFactory(
            function DeviserSimultaneousLoading(list) {
                loadingList.constructor.call(this, list);
            },
            createObj(loadingList.prototype, props({
                start: dynamicMethod(function () {
                    if (
                        loadingList.prototype.start.executor.call(this) ===
                        false
                    ) return false;
                    // TODO fix list ambiguity
                    for (var item of this) setTimeout(item.start.bind(item));
                })
            }))
        ),

        // queue
        // inherits from loadingList
        //
        queue = dev.queue = createFactory(
            function DeviserQueue(list) {
                loadingList.constructor.call(this, list);
            },
            createObj(loadingList.prototype, props({
                start: dynamicMethod(function () {
                    if (
                        loadingList.prototype.start.executor.call(this) ===
                        false
                    ) return false;
                    var list = this.list(),
                        completeListener = function () {
                            this.resolve(resolveListener, true)
                                .complete(completeListener, true);
                        },
                        resolveListener = function () {
                            var nextItem = list[list.indexOf(this) + 1];
                            if (nextItem) nextItem.start();
                        };
                    this.stop(function stop() {
                        for (var item of list) completeListener.call(item);
                        this.stop(stop, true);
                    });
                    for (var item of list)
                        item.resolve(resolveListener)
                            .complete(completeListener);
                    var first = list[0];
                    setTimeout(first.start.bind(first));
                })
            }))
        ),

        // animationCurve
        // inherits from root
        //
        animationCurve = dev.animationCurve = (function () {
            var coordsMap = weakmap(),
                sdMap = weakmap();
            return createFactory(
                function DeviserAnimationCurve(coords) {
                    root.constructor.call(this);
                    if (coords) this.coords(coords);
                },
                createObj(root.prototype, props({
                    coords: function (newCoords) {
                        if (newCoords) {
                            coordsMap.set(this, newCoords);
                            var n = coords.length / 2,
                                matrix = new Array(n),
                                result = new Float64Array(n),
                                sd = new Float64Array(n);
                            matrix[0] = matrix[n - 1] = [0, 1, 0];
                            for (
                                var halfInd = 1,
                                    m = n - 1,
                                    a, b, p1, p2, p3, ind;
                                halfInd < m;
                                halfInd++
                            ) {
                                ind = halfInd * 2;
                                p1 = coords[ind];
                                p2 = coords[ind - 2];
                                p3 = coords[ind + 2];
                                a = p3 - p1;
                                b = p1 - p2;
                                matrix[halfInd] = [b / 6, (p3 - p2) / 3, a / 6];
                                p1 = coords[ind + 1];
                                result[halfInd] = (
                                    (coords[ind + 3] - p1) / a -
                                    (p1 - coords[ind - 1]) / b
                                );
                            }
                            ind = 1;
                            for (var k; ind < n; ind++) {
                                a = matrix[ind];
                                b = matrix[ind - 1];
                                k = a[0] / b[1];
                                a[1] -= k * b[2];
                                a[0] = 0;
                                result[ind] -= k * result[ind - 1];
                            }
                            for (ind = n - 2; ind >= 0; ind--) {
                                a = matrix[ind];
                                b = matrix[ind + 1];
                                k = a[2] / b[1];
                                a[1] -= k * b[0];
                                a[2] = 0;
                                result[ind] -= k * result[ind + 1];
                            }
                            for (ind = 0; ind < n; ind++)
                                sd[ind] = result[ind] / matrix[ind][1];
                            sdMap.set(this, sd);
                        }
                        return coordsMap.get(this);
                    },
                    y: function (x) {
                        var coords = coordsMap.get(this),
                            sd = sdMap.get(this);
                        for (
                            var ind = 0,
                                cx, cy, nx, ny, a, b, h;
                            ind< coords.length;
                            ind += 2
                        ) if (x < coords[ind]) {
                            cx = coords[ind - 2];
                            cy = coords[ind - 1];
                            nx = coords[ind];
                            ny = coords[ind + 1];
                            break;
                        }
                        h = nx - cx;
                        b = (x - cx) / h;
                        a = 1 - b;
                        return (
                            a * cy + b * ny +
                            (h * h / 6) * (
                                (a * a * a - a) * sd[ind / 2 - 1] +
                                (b * b * b - b) * sd[ind / 2]
                            )
                        );
                    }
                }))
            );
        })(),

        // animation
        // inherits from loadingTarget
        //
        animation = dev.animation = (function () {
            var timeMap = weakmap();
            function updater(delta) {
                var lastCompletion = this.completion(),
                    completion = delta / this.time() + lastCompletion,
                    curve = this.curve();
                if (completion > 1) completion = 1;
                this.update(curve ? curve.y(completion) : completion)
                    .completion(completion);
                if (completion === 1) this.resolve();
            }
            return createFactory(
                function DeviserAnimation(time) {
                    loadingTarget.constructor.call(this);
                    if (time) this.time(time);
                },
                createObj(loadingTarget.prototype, props({
                    time: property(),
                    curve: property(),
                    start: dynamicMethod(function () {
                        if (
                            loadingTarget.prototype.start.executor.call(
                                this
                            ) ===
                            false
                        ) return false;
                        var animation = animationFrameLoop().update(
                                updater.bind(this)
                            );
                        this.stop(function stop() {
                            animation.stop();
                            this.stop(stop, true);
                        });
                        animation.start();
                    }),
                    update: dynamicMethod(),
                }))
            );
        })(),

        // wait
        // inherits from loadingTarget
        //
        wait = dev.wait = createFactory(
            function DeviserWait(time) {
                loadingTarget.constructor.call(this);
                if (time) this.time(time);
            },
            createObj(loadingTarget.prototype, props({
                time: property(),
                start: dynamicMethod(function () {
                    if (
                        loadingTarget.prototype.start.executor.call(this) ===
                        false
                    ) return false;
                    var canstop = true;
                    this.stop(function stop() {
                        canstop = false;
                        this.stop(stop, true);
                    });
                    // TODO use st instead of setTimeout
                    setTimeout(this.resolve.bind(this), this.time());
                })
            }))
        ),

        // element      factories
        //              
        // using:
        // - createEl   utils
        //
        element = dev.element = (function () {
            function styleSetter(key, value) {
                // this refers to the style property of the DOM element
                if (this[key] !== undefined) this[key] = (
                    value instanceof color.constructor ? value.rgba() : value
                );
                else {
                    var Key = (
                            key.substr(0, 1).toUpperCase() +
                            key.substring(1, key.length)
                        ),
                        currKey;
                    for (var prefix of prefixes) {
                        currKey = prefix + Key;
                        if (this[currKey] !== undefined) {
                            this[currKey] = value;
                            break;
                        }
                    }
                }
            }
            var dynamicStyleListenersMap = weakmap(),
                listenersMap = weakmap(),
                domElementsMap = weakmap(),
                devElementsMap = weakmap(),
                prefixes = ['webkit', 'Moz'],
                element = createFactory(
                    function DeviserElement(element) {
                        root.constructor.call(this);
                        if (element) {
                            // TODO throw error if the element is not a string
                            var domElement = doc.createElement(element);
                            devElementsMap.set(domElement, this);
                            domElementsMap.set(this, domElement);
                        }
                    },
                    createObj(root.prototype, props({
                        element: function (newElement) {
                            // TODO throw error if newElement exist
                            return domElementsMap.get(this);
                        },
                        setClasses: function (classes) {
                            this.element().className = classes;
                            return this;
                        },
                        addClass: function (className) {
                            this.element().classList.add(className);
                            return this;
                        },
                        removeClass: function (className) {
                            this.element().classList.remove(className);
                            return this;
                        },
                        hasClass: function (className) {
                            return this.element().classList.contains(className);
                        },
                        css: function (arg) {
                            var listeners, listener, style;
                            if (typeof arg === 'string') {
                                if (arguments.length > 1) {
                                    // TODO do it properly with computed 
                                    // property names when chrome will support
                                    // them
                                    style = {};
                                    style[arg] = arguments[1];
                                    return this.css(style);
                                }
                                listeners = dynamicStyleListenersMap.get(this);
                                if (listeners) {
                                    listener = listeners[arg];
                                    if (listener) return listener;
                                }
                                style = this.element().style[arg];
                                if (style !== null) return style;
                                // TODO save getComputedStyle as a variable
                                return getComputedStyle(
                                    this.element()
                                ).getPropetyValue(arg);
                            }
                            if (arg instanceof Array) {
                                var output = {};
                                for (var item of arg) 
                                    // TODO save String as a variable
                                    output[item] = this.arg(String(item));
                                return output;
                            }
                            var prevStyle,
                                domElementStyle = this.element().style;
                            listeners = dynamicStyleListenersMap.get(this);
                            for (var key in arg) {
                                if (listeners) {
                                    // remove dynamic value
                                    listener = listeners[key];
                                    if (listener) {
                                        listener[0].value(listener[1], true);
                                        delete listeners[key];
                                    }
                                }
                                style = arg[key];
                                if (style instanceof dynamicValue.constructor) {
                                    // add dynamic value
                                    if (!listeners) 
                                        dynamicStyleListenersMap.set(
                                            this,
                                            listeners = {}
                                        );
                                    listener = styleSetter.bind(
                                        domElementStyle,
                                        key
                                    );
                                    listeners[key] = [
                                        style.value(listener),
                                        listener
                                    ];
                                    listener(style.value());
                                }
                                else styleSetter.call(
                                    domElementStyle,
                                    key,
                                    style
                                );
                            }
                            return this;
                        },
                        cssWidth: function (newCssWidth) {
                            if (newCssWidth)
                                return this.css({ width: newCssWidth });
                            return this.css('width');
                        },
                        cssHeight: function (newCssHeight) {
                            if (newCssHeight)
                                return this.css({ height: newCssHeight });
                            return this.css('height');
                        },
                        add: function () {
                            var domElement = this.element();
                            for (
                                var ind = 0, item;
                                ind < arguments.length;
                                ind++
                            ) {
                                item = arguments[ind];
                                if (typeof item === 'string')
                                    domElement.appendChild(
                                        doc.createTextNode(item)
                                    );
                                else if (item instanceof element.constructor)
                                    domElement.appendChild(item.element());
                                else if (item[Symbol.iterator])
                                    // TODO store Symbol.iterator property value
                                    // as variable
                                    this.add.apply(this, item);
                                // TODO
                                // else throw error
                            }
                            return this;
                        },
                        remove: function () {
                            var domElement = this.element();
                            if (arguments.length)
                                for (var ind = 0; ind < arguments.length; ind++)
                                    domElement.removeChild(
                                        arguments[ind].element()
                                    );
                            else domElement.remove();
                            return this;
                        },
                        html: function (newHTML) {
                            if (newHTML !== undefined) {
                                this.element().innerHTML = newHTML;
                                return this;
                            }
                            return this.element().innerHTML;
                        },
                        text: function (newText) {
                            if (newText !== undefined) {
                                this.element().textContent = newText;
                                return this;
                            }
                            return this.element().textContent;
                        },
                        appendTo: function (element) {
                            element.element().appendChild(this.element());
                            return this;
                        },
                        replaceWith: function (element) {
                            var domElement = this.element(),
                                parent = domElement.parentNode;
                            if (parent) {
                                parent.removeChild(domElement);
                                parent.appendChild(element.element());
                            }
                            return this;
                        },
                        parent: function (newParent) {
                            if (newParent) {
                                newParent.add(this);
                                return this;
                            }
                            return element.get(this.element().parent);
                        },
                        children: function (newChildren) {
                            if (newChildren) {
                                this.clear().add(newChildren);
                                return this;
                            }
                            var coll = collection();
                            for (var child of this.element().children)
                                coll.append(element.get(child));
                            return coll;
                        },
                        insert: function (element, index) {
                            var thisElement = this.element(),
                                elemElement = element.element();
                            if (elemElement.parent === thisElement)
                                thisElement.removeChild(elemElement);
                            var children =  thisElement.children;
                            if (index < children.length) {
                                thisElement.insertBefore(
                                    element.element,
                                    children[index]
                                );
                            }
                            else thisElement.appendChild(elemElement);
                            return this;
                        },
                        index: function (newIndex) {
                            var domElement = this.element(),
                                parent = element.parent;
                            if (newIndex !== undefined) {
                                if (parent)
                                    element.get(parent).insert(this, newIndex);
                                return this;
                            }
                            if (parent)
                                return parent.children.indexOf(domElement);
                            return null;
                        },
                        siblings: function (newSiblings) {
                            var parent = this.parent();
                            if (newSiblings) {
                                if (parent) parent.children(
                                    collection(newSiblings)
                                        .insert(this, this.index())
                                );
                                return this;
                            }
                            return parent.children().remove(this);
                        },
                        on: function (eventType, listener) {
                            var listeners = listenersMap.get(this);
                            if (!listeners)
                                listenersMap.set(this, listeners = {});
                            var typeListeners = listeners[eventType];
                            if (!typeListeners)
                                typeListeners = listeners[eventType] = {};
                            this.element().addEventListener(
                                eventType,
                                typeListeners[listener] = (
                                    typeof listener === 'function' ?
                                    listener.bind(this) :
                                    listener instanceof runnable.constructor ?
                                    listener.start.bind(listener) :
                                    (function () {
                                        this.css(listener);
                                    }).bind(this)
                                )
                            );
                            return this;
                        },
                        off: function (eventType, listener) {
                            var listeners = listenersMap.get(this);
                            if (listeners) {
                                var typeListeners = listeners[eventType];
                                if (typeListeners && typeListeners[listener]) {
                                    this.element().removeEventListener(
                                        eventType,
                                        typeListeners[listener]
                                    );
                                    delete typeListeners[listener];
                                }
                            }
                            return this;
                        },
                        trigger: function(eventType) {
                            this.element().dispatchEvent(new Event(eventType));
                            return this;
                        },
                        clear: function () {
                            for (var child of this.element().children)
                                child.remove();
                            return this;
                        },
                        id: function (newId) {
                            if (newId) {
                                this.element().id = newId;
                                return this;
                            }
                            return this.element().id;
                        },
                        click: function (listener, remove) {
                            return this[remove ? 'off' : 'on'](
                                'click',
                                listener
                            );
                        },
                        hover: function (mouseenter, mouseleave, remove) {
                            var prop = remove ? 'off' : 'on';
                            if (mouseenter)
                                this[prop]('mouseenter', mouseenter);
                            if (mouseleave)
                                this[prop]('mouseleave', mouseleave);
                            return this;
                        },
                        insertBefore: function (elem1, elem2) {
                            var elem1element = elem1.element();
                            if (elem2) this.element().insertBefore(
                                elem1element,
                                elem2.element
                            );
                            else {
                                var parent = elem1element.parentNode;
                                if (parent) parent.insertBefore(
                                    this.element(),
                                    elem1element
                                );
                            }
                            return this;
                        },
                        insertAfter: function (elem1, elem2) {
                            var elem1element = elem1.element(),
                                nextSibling;
                            if (elem2) {
                                // TODO if elem2.element.parent is not
                                // this.element throw error
                                nextSibling = elem2.element().nextSibling;
                                if (nextSibling) this.element().insertBefore(
                                    elem1element,
                                    nextSibling
                                );
                                else this.element().appendChild(elem1element);
                            }
                            else {
                                var parent = elem1element.parentNode;
                                if (parent) {
                                    nextSibling = elem1element.nextSibling;
                                    if (nextSibling) parent.insertBefore(
                                        this.element(),
                                        nextSibling
                                    );
                                    else parent.appendChild(this.element());
                                }
                            }
                        },
                        show: function () {
                            return this.css({ display: null });
                        },
                        hide: function () {
                            return this.css({ display: 'none' });
                        },
                        rect: function () {
                            return this.element().getBoundingClientRect();
                        },
                        width: function () {
                            return this.rect().width;
                        },
                        height: function () {
                            return this.rect().height;
                        },
                        get: function (selector, onlyOne) {
                            if (onlyOne) return (
                                element.get(
                                    this.element().querySelector(selector)
                                ) ||
                                null
                            );
                            var coll = collection();
                            for (
                                var domElement
                                of this.element().querySelectorAll(selector)
                            ) coll.append(element.get(domElement));
                            return coll;
                        }
                    }))
                );
            element.get = function (domElement) {
                if (!domElement) return null;
                var devElement = devElementsMap.get(domElement);
                if (devElement) return devElement;
                devElement = element();
                devElementsMap.set(domElement, devElement);
                domElementsMap.set(devElement, domElement);
                return devElement;
            };
            return element;
        })(),

        // div                      factories
        // inherits from element    factories
        //
        // using:
        // - createObj
        //
        div = dev.div = createFactory(
            function DeviserDivElement(content) {
                element.constructor.call(this, 'div');
                if (content !== undefined) this.add(content);
            },
            createObj(element.prototype)
        ),

        // tableDiv             factories
        // inherits from div    factories
        //
        // using:
        // - createObj
        //
        tableDiv = dev.tableDiv = createFactory(
            function DeviserTableDivElement(content) { 
                div.constructor.call(this, content); 
                this.css({ display: 'table' });
            },
            createObj(div.prototype)
        ),

        // wrappedTableDiv          factories
        // inherits from tableDiv   factories
        //                          
        // using:
        // - createObj
        //
        wrappedTableDiv = dev.wrappedTableDiv = createFactory(
            function DeviserWrappedTableDivElement(content) { 
                tableDiv.constructor.call(this, content); 
                this.css({ width: '100%', height: '100%' });
            },
            createObj(tableDiv.prototype)
        ),


        // trDiv                factories
        // inherits from div    factories
        //                      
        // using:
        // - createObj
        //
        trDiv = dev.trDiv = createFactory(
            function DeviserTableRowDivElement(content) { 
                div.constructor.call(this, content); 
                this.css({ display: 'table-row' });
            },
            createObj(div.prototype)
        ),

        // tdDiv                factories
        // inherits from div    factories
        //                      
        // using:
        // - createObj
        //
        tdDiv = dev.tdDiv = createFactory(
            function DeviserTableCellDivElement(content) { 
                div.constructor.call(this, content); 
                this.css({ display: 'table-cell' });
            },
            createObj(div.prototype)
        ),

        // center               factories
        // inherits from div    factories
        //                      
        // using:
        // - createObj
        //
        center = dev.center = createFactory(
            function DeviserCenterElement(content) { 
                div.constructor.call(this, content); 
                this.css({ textAlign: 'center' });
            },
            createObj(div.prototype)
        ),

        // left                 factories
        // inherits from div    factories
        //                      
        // using:
        // - createObj
        //
        left = dev.left = createFactory(
            function DeviserLeftElement(content) { 
                div.constructor.call(this, content); 
                this.css({ textAlign: 'left' });
            },
            createObj(div.prototype)
        ),

        // right                factories
        // inherits from div    factories
        //                      
        // using:
        // - createObj
        //
        right = dev.right = createFactory(
            function DeviserRightElement(content) { 
                div.constructor.call(this, content); 
                this.css({ textAlign: 'right' });
            },
            createObj(div.prototype)
        ),

        // inline               factories
        // inherits from div    factories
        //
        inline = dev.inline = createFactory(
            function DeviserInlineBlockDiv(content) {
                div.constructor.call(this, content);
                this.css({ display: 'inline-block' });
            },
            createObj(div.prototype)
        ),

        // yCentered            factories
        // inherits from div    factories
        //
        yCentered = dev.yCentered = createFactory(
            function DeviserVerticallyCenteredDiv(content) {
                div.constructor.call(this, content);
                this.css({
                    position: 'relative',
                    top: '50%',
                    transform: 'translateY(-50%)'
                });
            },
            createObj(div.prototype)
        ),

        // xCentered            factories
        // inherits from div    factories
        //
        xCentered = dev.xCentered = createFactory(
            function DeviserHorizontallyCenteredDiv(content) {
                div.constructor.call(this, content);
                this.css({
                    position: 'relative',
                    left: '50%',
                    transform: 'translateX(-50%)'
                });
            },
            createObj(div.prototype)
        ),

        // cnetered             factories
        // inherits from div    factories
        //
        centered = dev.centered = createFactory(
            function DeviserCenteredDiv(content) {
                div.constructor.call(this, content);
                this.css({
                    position: 'relative',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                });
            },
            createObj(div.prototype)
        ),

        // wrapped                  factories
        // inherits from div        factories
        //
        // using:
        // - createObj
        //
        wrapped = dev.wrapped = createFactory(
            function DeviserWrappedElement(content) {
                div.constructor.call(this, content);
                this.css({
                    width: '100%',
                    height: '100%'
                });
            },
            createObj(div.prototype)
        ),

        // canvas                   factories
        // inherits from element    factories
        //
        // using:
        // - createObj
        //
        canvas = dev.canvas = createFactory(
            function DeviserCanvasElement() {
                element.constructor.call(this, 'canvas');
            },
            createObj(element.prototype)
        ),

        // canvas2D             factories
        // inherits from canvas factories
        //                      
        // using:
        // - createObj
        //
        canvas2D = dev.canvas2D = createFactory(
            function DeviserCanvas2DElement() {
                canvas.constructor.call(this);
            },
            createObj(canvas.prototype, props({
                context: function () {
                    return this.element().getContext('2d');
                }
            }))
        ),

        // span                     factories
        // inherits from element    factories
        //
        // using:
        // - createObj
        //
        span = dev.span = createFactory(
            function DeviserSpanElement(content) {
                element.constructor.call(this, 'span');
                if (content !== undefined) this.add(content);
            },
            createObj(element.prototype)
        ),

        // b                        factories
        // inherits from element    factories
        //
        // using:
        // - createObj
        //
        b = dev.b = createFactory(
            function DeviserBoldTextElement(content) {
                element.constructor.call(this, 'b');
                if (content !== undefined) this.add(content);
            },
            createObj(element.prototype)
        ),

        // i                        factories
        // inherits from element    factories
        //
        // using:
        // - createObj
        //
        i = dev.i = createFactory(
            function DeviserItalicTextElement(content) {
                element.constructor.call(this, 'i');
                if (content !== undefined) this.add(content);
            },
            createObj(element.prototype)
        ),

        // a                        factories
        // inherits from element    factories
        //
        // using:
        // - createObj
        //
        a = dev.a = createFactory(
            function DeviserAnchorElement(content) {
                element.constructor.call(this, 'a');
                if (content !== undefined) this.add(content);
            },
            createObj(element.prototype, props({
                href: function (newHref) {
                    if (newHref) {
                        this.element().href = newHref;
                        return this;
                    }
                    return this.element().href;
                }
            }))
        ),

        // input                    factories
        // inherits from element    factories
        //                          
        // using:
        // - createObj
        //
        input = dev.input = createFactory(
            function DeviserInputElement(type) {
                element.constructor.call(this, 'input');
                if (type !== undefined) this.type(type);
            },
            createObj(element.prototype, props({
                type: function (newType) {
                    if (newType !== undefined) {
                        this.element().type = newType;
                        return this;
                    }
                    return this.element().type;
                },
                value: function (newValue) {
                    if (newValue !== undefined) {
                        this.element().value = newValue;
                        return this;
                    }
                    return this.element().value;
                }
            }))
        ),

        // textInput            factories
        // inherits from input  factories
        //                      
        // using:
        // - createObj
        //
        textInput = dev.textInput = createFactory(
            function DeviserTextInputElement(value) {
                input.constructor.call(this, 'text');
                if (value !== undefined) this.value(value);
            },
            createObj(input.prototype)
        ),

        // link             factories
        // inherits from a  factories
        //                  
        // using:
        // - createObj
        //
        link = dev.link = createFactory(
            function DeviserLinkElement(url) {
                a.constructor.call(this, url);
                if (url !== undefined) this.href(url);
            },
            createObj(a.prototype)
        );

/* -------------------------------------------------------------------------- */

    return dev;

})();