var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.createTemplateTagFirstArg = function(d) {
    return d.raw = d
}
;
$jscomp.createTemplateTagFirstArgWithRaw = function(d, c) {
    d.raw = c;
    return d
}
;
$jscomp.arrayIteratorImpl = function(d) {
    var c = 0;
    return function() {
        return c < d.length ? {
            done: !1,
            value: d[c++]
        } : {
            done: !0
        }
    }
}
;
$jscomp.arrayIterator = function(d) {
    return {
        next: $jscomp.arrayIteratorImpl(d)
    }
}
;
$jscomp.makeIterator = function(d) {
    var c = "undefined" != typeof Symbol && Symbol.iterator && d[Symbol.iterator];
    return c ? c.call(d) : $jscomp.arrayIterator(d)
}
;
$jscomp.getGlobal = function(d) {
    d = ["object" == typeof window && window, "object" == typeof self && self, "object" == typeof global && global, d];
    for (var c = 0; c < d.length; ++c) {
        var l = d[c];
        if (l && l.Math == Math)
            return l
    }
    throw Error("Cannot find global object");
}
;
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.defineProperty = $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties ? Object.defineProperty : function(d, c, l) {
    d != Array.prototype && d != Object.prototype && (d[c] = l.value)
}
;
$jscomp.polyfill = function(d, c, l, w) {
    if (c) {
        l = $jscomp.global;
        d = d.split(".");
        for (w = 0; w < d.length - 1; w++) {
            var p = d[w];
            p in l || (l[p] = {});
            l = l[p]
        }
        d = d[d.length - 1];
        w = l[d];
        c = c(w);
        c != w && null != c && $jscomp.defineProperty(l, d, {
            configurable: !0,
            writable: !0,
            value: c
        })
    }
}
;
$jscomp.FORCE_POLYFILL_PROMISE = !1;
$jscomp.polyfill("Promise", function(d) {
    function c() {
        this.batch_ = null
    }
    function l(c) {
        return c instanceof p ? c : new p(function(d, S) {
            d(c)
        }
        )
    }
    if (d && !$jscomp.FORCE_POLYFILL_PROMISE)
        return d;
    c.prototype.asyncExecute = function(c) {
        if (null == this.batch_) {
            this.batch_ = [];
            var d = this;
            this.asyncExecuteFunction(function() {
                d.executeBatch_()
            })
        }
        this.batch_.push(c)
    }
    ;
    var w = $jscomp.global.setTimeout;
    c.prototype.asyncExecuteFunction = function(c) {
        w(c, 0)
    }
    ;
    c.prototype.executeBatch_ = function() {
        for (; this.batch_ && this.batch_.length; ) {
            var c = this.batch_;
            this.batch_ = [];
            for (var d = 0; d < c.length; ++d) {
                var n = c[d];
                c[d] = null;
                try {
                    n()
                } catch (K) {
                    this.asyncThrow_(K)
                }
            }
        }
        this.batch_ = null
    }
    ;
    c.prototype.asyncThrow_ = function(c) {
        this.asyncExecuteFunction(function() {
            throw c;
        })
    }
    ;
    var p = function(c) {
        this.state_ = 0;
        this.result_ = void 0;
        this.onSettledCallbacks_ = [];
        var d = this.createResolveAndReject_();
        try {
            c(d.resolve, d.reject)
        } catch (n) {
            d.reject(n)
        }
    };
    p.prototype.createResolveAndReject_ = function() {
        function c(c) {
            return function(k) {
                n || (n = !0,
                c.call(d, k))
            }
        }
        var d = this
          , n = !1;
        return {
            resolve: c(this.resolveTo_),
            reject: c(this.reject_)
        }
    }
    ;
    p.prototype.resolveTo_ = function(c) {
        if (c === this)
            this.reject_(new TypeError("A Promise cannot resolve to itself"));
        else if (c instanceof p)
            this.settleSameAsPromise_(c);
        else {
            a: switch (typeof c) {
            case "object":
                var d = null != c;
                break a;
            case "function":
                d = !0;
                break a;
            default:
                d = !1
            }
            d ? this.resolveToNonPromiseObj_(c) : this.fulfill_(c)
        }
    }
    ;
    p.prototype.resolveToNonPromiseObj_ = function(c) {
        var d = void 0;
        try {
            d = c.then
        } catch (n) {
            this.reject_(n);
            return
        }
        "function" == typeof d ? this.settleSameAsThenable_(d, c) : this.fulfill_(c)
    }
    ;
    p.prototype.reject_ = function(c) {
        this.settle_(2, c)
    }
    ;
    p.prototype.fulfill_ = function(c) {
        this.settle_(1, c)
    }
    ;
    p.prototype.settle_ = function(c, d) {
        if (0 != this.state_)
            throw Error("Cannot settle(" + c + ", " + d + "): Promise already settled in state" + this.state_);
        this.state_ = c;
        this.result_ = d;
        this.executeOnSettledCallbacks_()
    }
    ;
    p.prototype.executeOnSettledCallbacks_ = function() {
        if (null != this.onSettledCallbacks_) {
            for (var c = 0; c < this.onSettledCallbacks_.length; ++c)
                v.asyncExecute(this.onSettledCallbacks_[c]);
            this.onSettledCallbacks_ = null
        }
    }
    ;
    var v = new c;
    p.prototype.settleSameAsPromise_ = function(c) {
        var d = this.createResolveAndReject_();
        c.callWhenSettled_(d.resolve, d.reject)
    }
    ;
    p.prototype.settleSameAsThenable_ = function(c, d) {
        var k = this.createResolveAndReject_();
        try {
            c.call(d, k.resolve, k.reject)
        } catch (K) {
            k.reject(K)
        }
    }
    ;
    p.prototype.then = function(c, d) {
        function k(c, d) {
            return "function" == typeof c ? function(d) {
                try {
                    l(c(d))
                } catch (H) {
                    w(H)
                }
            }
            : d
        }
        var l, w, v = new p(function(c, d) {
            l = c;
            w = d
        }
        );
        this.callWhenSettled_(k(c, l), k(d, w));
        return v
    }
    ;
    p.prototype.catch = function(c) {
        return this.then(void 0, c)
    }
    ;
    p.prototype.callWhenSettled_ = function(c, d) {
        function k() {
            switch (l.state_) {
            case 1:
                c(l.result_);
                break;
            case 2:
                d(l.result_);
                break;
            default:
                throw Error("Unexpected state: " + l.state_);
            }
        }
        var l = this;
        null == this.onSettledCallbacks_ ? v.asyncExecute(k) : this.onSettledCallbacks_.push(k)
    }
    ;
    p.resolve = l;
    p.reject = function(c) {
        return new p(function(d, l) {
            l(c)
        }
        )
    }
    ;
    p.race = function(c) {
        return new p(function(d, p) {
            for (var k = $jscomp.makeIterator(c), n = k.next(); !n.done; n = k.next())
                l(n.value).callWhenSettled_(d, p)
        }
        )
    }
    ;
    p.all = function(c) {
        var d = $jscomp.makeIterator(c)
          , n = d.next();
        return n.done ? l([]) : new p(function(c, k) {
            function p(d) {
                return function(l) {
                    w[d] = l;
                    v--;
                    0 == v && c(w)
                }
            }
            var w = []
              , v = 0;
            do
                w.push(void 0),
                v++,
                l(n.value).callWhenSettled_(p(w.length - 1), k),
                n = d.next();
            while (!n.done)
        }
        )
    }
    ;
    return p
}, "es6", "es3");
$jscomp.SYMBOL_PREFIX = "jscomp_symbol_";
$jscomp.initSymbol = function() {
    $jscomp.initSymbol = function() {}
    ;
    $jscomp.global.Symbol || ($jscomp.global.Symbol = $jscomp.Symbol)
}
;
$jscomp.SymbolClass = function(d, c) {
    this.$jscomp$symbol$id_ = d;
    $jscomp.defineProperty(this, "description", {
        configurable: !0,
        writable: !0,
        value: c
    })
}
;
$jscomp.SymbolClass.prototype.toString = function() {
    return this.$jscomp$symbol$id_
}
;
$jscomp.Symbol = function() {
    function d(l) {
        if (this instanceof d)
            throw new TypeError("Symbol is not a constructor");
        return new $jscomp.SymbolClass($jscomp.SYMBOL_PREFIX + (l || "") + "_" + c++,l)
    }
    var c = 0;
    return d
}();
$jscomp.initSymbolIterator = function() {
    $jscomp.initSymbol();
    var d = $jscomp.global.Symbol.iterator;
    d || (d = $jscomp.global.Symbol.iterator = $jscomp.global.Symbol("Symbol.iterator"));
    "function" != typeof Array.prototype[d] && $jscomp.defineProperty(Array.prototype, d, {
        configurable: !0,
        writable: !0,
        value: function() {
            return $jscomp.iteratorPrototype($jscomp.arrayIteratorImpl(this))
        }
    });
    $jscomp.initSymbolIterator = function() {}
}
;
$jscomp.initSymbolAsyncIterator = function() {
    $jscomp.initSymbol();
    var d = $jscomp.global.Symbol.asyncIterator;
    d || (d = $jscomp.global.Symbol.asyncIterator = $jscomp.global.Symbol("Symbol.asyncIterator"));
    $jscomp.initSymbolAsyncIterator = function() {}
}
;
$jscomp.iteratorPrototype = function(d) {
    $jscomp.initSymbolIterator();
    d = {
        next: d
    };
    d[$jscomp.global.Symbol.iterator] = function() {
        return this
    }
    ;
    return d
}
;
$jscomp.underscoreProtoCanBeSet = function() {
    var d = {
        a: !0
    }
      , c = {};
    try {
        return c.__proto__ = d,
        c.a
    } catch (l) {}
    return !1
}
;
$jscomp.setPrototypeOf = "function" == typeof Object.setPrototypeOf ? Object.setPrototypeOf : $jscomp.underscoreProtoCanBeSet() ? function(d, c) {
    d.__proto__ = c;
    if (d.__proto__ !== c)
        throw new TypeError(d + " is not extensible");
    return d
}
: null;
$jscomp.generator = {};
$jscomp.generator.ensureIteratorResultIsObject_ = function(d) {
    if (!(d instanceof Object))
        throw new TypeError("Iterator result " + d + " is not an object");
}
;
$jscomp.generator.Context = function() {
    this.isRunning_ = !1;
    this.yieldAllIterator_ = null;
    this.yieldResult = void 0;
    this.nextAddress = 1;
    this.finallyAddress_ = this.catchAddress_ = 0;
    this.finallyContexts_ = this.abruptCompletion_ = null
}
;
$jscomp.generator.Context.prototype.start_ = function() {
    if (this.isRunning_)
        throw new TypeError("Generator is already running");
    this.isRunning_ = !0
}
;
$jscomp.generator.Context.prototype.stop_ = function() {
    this.isRunning_ = !1
}
;
$jscomp.generator.Context.prototype.jumpToErrorHandler_ = function() {
    this.nextAddress = this.catchAddress_ || this.finallyAddress_
}
;
$jscomp.generator.Context.prototype.next_ = function(d) {
    this.yieldResult = d
}
;
$jscomp.generator.Context.prototype.throw_ = function(d) {
    this.abruptCompletion_ = {
        exception: d,
        isException: !0
    };
    this.jumpToErrorHandler_()
}
;
$jscomp.generator.Context.prototype.return = function(d) {
    this.abruptCompletion_ = {
        return: d
    };
    this.nextAddress = this.finallyAddress_
}
;
$jscomp.generator.Context.prototype.jumpThroughFinallyBlocks = function(d) {
    this.abruptCompletion_ = {
        jumpTo: d
    };
    this.nextAddress = this.finallyAddress_
}
;
$jscomp.generator.Context.prototype.yield = function(d, c) {
    this.nextAddress = c;
    return {
        value: d
    }
}
;
$jscomp.generator.Context.prototype.yieldAll = function(d, c) {
    d = $jscomp.makeIterator(d);
    var l = d.next();
    $jscomp.generator.ensureIteratorResultIsObject_(l);
    if (l.done)
        this.yieldResult = l.value,
        this.nextAddress = c;
    else
        return this.yieldAllIterator_ = d,
        this.yield(l.value, c)
}
;
$jscomp.generator.Context.prototype.jumpTo = function(d) {
    this.nextAddress = d
}
;
$jscomp.generator.Context.prototype.jumpToEnd = function() {
    this.nextAddress = 0
}
;
$jscomp.generator.Context.prototype.setCatchFinallyBlocks = function(d, c) {
    this.catchAddress_ = d;
    void 0 != c && (this.finallyAddress_ = c)
}
;
$jscomp.generator.Context.prototype.setFinallyBlock = function(d) {
    this.catchAddress_ = 0;
    this.finallyAddress_ = d || 0
}
;
$jscomp.generator.Context.prototype.leaveTryBlock = function(d, c) {
    this.nextAddress = d;
    this.catchAddress_ = c || 0
}
;
$jscomp.generator.Context.prototype.enterCatchBlock = function(d) {
    this.catchAddress_ = d || 0;
    d = this.abruptCompletion_.exception;
    this.abruptCompletion_ = null;
    return d
}
;
$jscomp.generator.Context.prototype.enterFinallyBlock = function(d, c, l) {
    l ? this.finallyContexts_[l] = this.abruptCompletion_ : this.finallyContexts_ = [this.abruptCompletion_];
    this.catchAddress_ = d || 0;
    this.finallyAddress_ = c || 0
}
;
$jscomp.generator.Context.prototype.leaveFinallyBlock = function(d, c) {
    c = this.finallyContexts_.splice(c || 0)[0];
    if (c = this.abruptCompletion_ = this.abruptCompletion_ || c) {
        if (c.isException)
            return this.jumpToErrorHandler_();
        void 0 != c.jumpTo && this.finallyAddress_ < c.jumpTo ? (this.nextAddress = c.jumpTo,
        this.abruptCompletion_ = null) : this.nextAddress = this.finallyAddress_
    } else
        this.nextAddress = d
}
;
$jscomp.generator.Context.prototype.forIn = function(d) {
    return new $jscomp.generator.Context.PropertyIterator(d)
}
;
$jscomp.generator.Context.PropertyIterator = function(d) {
    this.object_ = d;
    this.properties_ = [];
    for (var c in d)
        this.properties_.push(c);
    this.properties_.reverse()
}
;
$jscomp.generator.Context.PropertyIterator.prototype.getNext = function() {
    for (; 0 < this.properties_.length; ) {
        var d = this.properties_.pop();
        if (d in this.object_)
            return d
    }
    return null
}
;
$jscomp.generator.Engine_ = function(d) {
    this.context_ = new $jscomp.generator.Context;
    this.program_ = d
}
;
$jscomp.generator.Engine_.prototype.next_ = function(d) {
    this.context_.start_();
    if (this.context_.yieldAllIterator_)
        return this.yieldAllStep_(this.context_.yieldAllIterator_.next, d, this.context_.next_);
    this.context_.next_(d);
    return this.nextStep_()
}
;
$jscomp.generator.Engine_.prototype.return_ = function(d) {
    this.context_.start_();
    var c = this.context_.yieldAllIterator_;
    if (c)
        return this.yieldAllStep_("return"in c ? c["return"] : function(c) {
            return {
                value: c,
                done: !0
            }
        }
        , d, this.context_.return);
    this.context_.return(d);
    return this.nextStep_()
}
;
$jscomp.generator.Engine_.prototype.throw_ = function(d) {
    this.context_.start_();
    if (this.context_.yieldAllIterator_)
        return this.yieldAllStep_(this.context_.yieldAllIterator_["throw"], d, this.context_.next_);
    this.context_.throw_(d);
    return this.nextStep_()
}
;
$jscomp.generator.Engine_.prototype.yieldAllStep_ = function(d, c, l) {
    try {
        var w = d.call(this.context_.yieldAllIterator_, c);
        $jscomp.generator.ensureIteratorResultIsObject_(w);
        if (!w.done)
            return this.context_.stop_(),
            w;
        var p = w.value
    } catch (v) {
        return this.context_.yieldAllIterator_ = null,
        this.context_.throw_(v),
        this.nextStep_()
    }
    this.context_.yieldAllIterator_ = null;
    l.call(this.context_, p);
    return this.nextStep_()
}
;
$jscomp.generator.Engine_.prototype.nextStep_ = function() {
    for (; this.context_.nextAddress; )
        try {
            var d = this.program_(this.context_);
            if (d)
                return this.context_.stop_(),
                {
                    value: d.value,
                    done: !1
                }
        } catch (c) {
            this.context_.yieldResult = void 0,
            this.context_.throw_(c)
        }
    this.context_.stop_();
    if (this.context_.abruptCompletion_) {
        d = this.context_.abruptCompletion_;
        this.context_.abruptCompletion_ = null;
        if (d.isException)
            throw d.exception;
        return {
            value: d.return,
            done: !0
        }
    }
    return {
        value: void 0,
        done: !0
    }
}
;
$jscomp.generator.Generator_ = function(d) {
    this.next = function(c) {
        return d.next_(c)
    }
    ;
    this.throw = function(c) {
        return d.throw_(c)
    }
    ;
    this.return = function(c) {
        return d.return_(c)
    }
    ;
    $jscomp.initSymbolIterator();
    this[Symbol.iterator] = function() {
        return this
    }
}
;
$jscomp.generator.createGenerator = function(d, c) {
    c = new $jscomp.generator.Generator_(new $jscomp.generator.Engine_(c));
    $jscomp.setPrototypeOf && $jscomp.setPrototypeOf(c, d.prototype);
    return c
}
;
$jscomp.asyncExecutePromiseGenerator = function(d) {
    function c(c) {
        return d.next(c)
    }
    function l(c) {
        return d.throw(c)
    }
    return new Promise(function(w, p) {
        function v(d) {
            d.done ? w(d.value) : Promise.resolve(d.value).then(c, l).then(v, p)
        }
        v(d.next())
    }
    )
}
;
$jscomp.asyncExecutePromiseGeneratorFunction = function(d) {
    return $jscomp.asyncExecutePromiseGenerator(d())
}
;
$jscomp.asyncExecutePromiseGeneratorProgram = function(d) {
    return $jscomp.asyncExecutePromiseGenerator(new $jscomp.generator.Generator_(new $jscomp.generator.Engine_(d)))
}
;
(function(d, c) {
    "object" === typeof exports && "undefined" !== typeof module ? c(exports, require("three")) : "function" === typeof define && define.amd ? define(["exports", "three"], c) : (d = d || self,
    c(d.PANOLENS = {}, d.THREE))
}
)(this, function(d, c) {
    function l(a) {
        this.constraints = Object.assign({
            video: {
                width: {
                    ideal: 1920
                },
                height: {
                    ideal: 1080
                },
                facingMode: {
                    exact: "environment"
                }
            },
            audio: !1
        }, a);
        this.element = this.scene = this.container = null;
        this.devices = [];
        this.stream = null;
        this.ratioScalar = 1;
        this.videoDeviceIndex = 0
    }
    function w(a) {
        this.format = null;
        this.eyeSep = void 0 === a ? .064 : a;
        this.loffset = new c.Vector2;
        this.roffset = new c.Vector2
    }
    function p(a, b, e) {
        a = void 0 === a ? 16777215 : a;
        b = void 0 === b ? !0 : b;
        e = void 0 === e ? 1500 : e;
        this.dpr = window.devicePixelRatio;
        var f = this.createCanvas()
          , m = f.canvas;
        f = f.context;
        var d = new c.SpriteMaterial({
            color: a,
            map: this.createCanvasTexture(m)
        });
        c.Sprite.call(this, d);
        this.canvasWidth = m.width;
        this.canvasHeight = m.height;
        this.context = f;
        this.color = a instanceof c.Color ? a : new c.Color(a);
        this.autoSelect = b;
        this.dwellTime = e;
        this.rippleDuration = 500;
        this.position.z = -10;
        this.center.set(.5, .5);
        this.scale.set(.5, .5, 1);
        this.callback = this.timerId = this.startTimestamp = null;
        this.frustumCulled = !1;
        this.updateCanvasArcByProgress(0)
    }
    function v(a, b, e) {
        a = void 0 === a ? 300 : a;
        b = b || C.Info;
        c.Sprite.call(this);
        this.type = "infospot";
        this.animated = void 0 !== e ? e : !0;
        this.frustumCulled = this.isHovering = !1;
        this.cursorStyle = this.toPanorama = this.element = null;
        this.mode = z.NORMAL;
        this.scale.set(a, a, 1);
        this.rotation.y = Math.PI;
        this.container = null;
        this.originalRaycast = this.raycast;
        this.HANDLER_FOCUS = null;
        this.material.side = c.DoubleSide;
        this.material.depthTest = !1;
        this.material.transparent = !0;
        this.material.opacity = 0;
        this.scaleUpAnimation = new q.Tween;
        this.scaleDownAnimation = new q.Tween;
        e = function(b) {
            if (this.material) {
                var f = b.image.width / b.image.height
                  , e = new c.Vector3;
                b.image.width = b.image.naturalWidth || 64;
                b.image.height = b.image.naturalHeight || 64;
                this.scale.set(f * a, a, 1);
                e.copy(this.scale);
                this.scaleUpAnimation = (new q.Tween(this.scale)).to({
                    x: 1.3 * e.x,
                    y: 1.3 * e.y
                }, 500).easing(q.Easing.Elastic.Out);
                this.scaleDownAnimation = (new q.Tween(this.scale)).to({
                    x: e.x,
                    y: e.y
                }, 500).easing(q.Easing.Elastic.Out);
                this.material.map = b;
                this.material.needsUpdate = !0
            }
        }
        .bind(this);
        this.showAnimation = (new q.Tween(this.material)).to({
            opacity: 1
        }, 500).onStart(this.enableRaycast.bind(this, !0)).easing(q.Easing.Quartic.Out);
        this.hideAnimation = (new q.Tween(this.material)).to({
            opacity: 0
        }, 500).onStart(this.enableRaycast.bind(this, !1)).easing(q.Easing.Quartic.Out);
        this.addEventListener("click", this.onClick);
        this.addEventListener("hover", this.onHover);
        this.addEventListener("hoverenter", this.onHoverStart);
        this.addEventListener("hoverleave", this.onHoverEnd);
        this.addEventListener("panolens-dual-eye-effect", this.onDualEyeEffect);
        this.addEventListener(g.CONTAINER, this.setContainer.bind(this));
        this.addEventListener("panorama-leave", this.onDismiss);
        this.addEventListener("dismiss", this.onDismiss);
        this.addEventListener("panolens-infospot-focus", this.setFocusMethod);
        Z.load(b, e)
    }
    function S(a) {
        a || console.warn("PANOLENS.Widget: No container specified");
        c.EventDispatcher.call(this);
        this.DEFAULT_TRANSITION = "all 0.27s ease";
        this.TOUCH_ENABLED = !!("ontouchstart"in window || window.DocumentTouch && document instanceof DocumentTouch);
        this.PREVENT_EVENT_HANDLER = function(a) {
            a.preventDefault();
            a.stopPropagation()
        }
        ;
        this.container = a;
        this.mask = this.activeSubMenu = this.activeMainItem = this.mainMenu = this.settingElement = this.videoElement = this.fullscreenElement = this.barElement = null
    }
    function k() {
        this.edgeLength = 1E4;
        c.Mesh.call(this, this.createGeometry(this.edgeLength), this.createMaterial());
        this.type = "panorama";
        this.ImageQualityLow = 1;
        this.ImageQualityFair = 2;
        this.ImageQualityMedium = 3;
        this.ImageQualityHigh = 4;
        this.ImageQualitySuperHigh = 5;
        this.animationDuration = 1E3;
        this.defaultInfospotSize = 350;
        this.container = void 0;
        this.loaded = !1;
        this.linkedSpots = [];
        this.isInfospotVisible = !1;
        this.linkingImageScale = this.linkingImageURL = void 0;
        this.renderOrder = -1;
        this.active = this.visible = !1;
        this.infospotAnimation = (new q.Tween(this)).to({}, this.animationDuration / 2);
        this.addEventListener(g.CONTAINER, this.setContainer.bind(this));
        this.addEventListener("click", this.onClick.bind(this));
        this.setupTransitions()
    }
    function n(a) {
        k.call(this);
        this.src = a;
        this.type = "image_panorama"
    }
    function K() {
        k.call(this);
        this.type = "empty_panorama"
    }
    function U(a) {
        a = void 0 === a ? [] : a;
        k.call(this);
        this.geometry.deleteAttribute("normal");
        this.geometry.deleteAttribute("uv");
        this.images = a;
        this.type = "cube_panorama"
    }
    function fa() {
        for (var a = [], b = 0; 6 > b; b++)
            a.push(C.WhiteTile);
        U.call(this, a);
        this.type = "basic_panorama"
    }
    function D(a, b) {
        b = void 0 === b ? {} : b;
        k.call(this);
        this.src = a;
        this.options = Object.assign({
            videoElement: document.createElement("video"),
            loop: !0,
            muted: !0,
            autoplay: !1,
            playsinline: !0,
            crossOrigin: "anonymous"
        }, b);
        this.videoElement = this.options.videoElement;
        this.videoProgress = 0;
        this.type = "video_panorama";
        this.addEventListener(g.LEAVE, this.pauseVideo.bind(this));
        this.addEventListener(g.ENTER_FADE_START, this.resumeVideoProgress.bind(this));
        this.addEventListener("video-toggle", this.toggleVideo.bind(this));
        this.addEventListener("video-time", this.setVideoCurrentTime.bind(this))
    }
    function T(a) {
        this._parameters = a = void 0 === a ? {} : a;
        this._panoId = this._zoom = null;
        this._panoClient = new google.maps.StreetViewService;
        this._total = this._count = 0;
        this._canvas = [];
        this._ctx = [];
        this._hc = this._wc = 0;
        this.result = null;
        this.rotation = 0;
        this.copyright = "";
        this.onPanoramaLoad = this.onSizeChange = null;
        this.levelsW = [1, 2, 4, 7, 13, 26];
        this.levelsH = [1, 1, 2, 4, 7, 13];
        this.widths = [416, 832, 1664, 3328, 6656, 13312];
        this.heights = [416, 416, 832, 1664, 3328, 6656];
        this.maxH = this.maxW = 6656;
        var b;
        try {
            var e = document.createElement("canvas");
            (b = e.getContext("experimental-webgl")) || (b = e.getContext("webgl"))
        } catch (f) {}
        this.maxW = Math.max(b.getParameter(b.MAX_TEXTURE_SIZE), this.maxW);
        this.maxH = Math.max(b.getParameter(b.MAX_TEXTURE_SIZE), this.maxH)
    }
    function ea(a, b) {
        n.call(this);
        this.panoId = a;
        this.gsvLoader = null;
        this.loadRequested = !1;
        this.setupGoogleMapAPI(b);
        this.type = "google_streetview_panorama"
    }
    function H(a, b) {
        "image" === (void 0 === a ? "image" : a) && n.call(this, b);
        this.EPS = 1E-6;
        this.frameId = null;
        this.dragging = !1;
        this.userMouse = new c.Vector2;
        this.quatA = new c.Quaternion;
        this.quatB = new c.Quaternion;
        this.quatCur = new c.Quaternion;
        this.quatSlerp = new c.Quaternion;
        this.vectorX = new c.Vector3(1,0,0);
        this.vectorY = new c.Vector3(0,1,0);
        this.type = "little_planet";
        this.addEventListener(g.WIDNOW_RESIZE, this.onWindowResize)
    }
    function aa(a) {
        H.call(this, "image", a);
        this.type = "image_little_planet"
    }
    function X(a) {
        k.call(this);
        this.media = new l(a);
        this.type = "camera_panorama";
        this.addEventListener(g.ENTER, this.start.bind(this));
        this.addEventListener(g.LEAVE, this.stop.bind(this));
        this.addEventListener(g.CONTAINER, this.onPanolensContainer.bind(this));
        this.addEventListener("panolens-scene", this.onPanolensScene.bind(this))
    }
    function O(a, b) {
        b = void 0 === b ? new w : b;
        n.call(this, a);
        this.stereo = b;
        this.type = "stereo_image_panorama"
    }
    function P(a, b, e) {
        b = void 0 === b ? {} : b;
        e = void 0 === e ? new w : e;
        D.call(this, a, b);
        this.stereo = e;
        this.type = "stereo_video_panorama"
    }
    function wa(a, b, e, f) {
        function c() {
            n = P.addSourceBuffer('video/mp4; codecs="avc1.640033"');
            n.mode = "sequence"
        }
        function d() {
            L(N, {
                responseType: "text",
                onreadystatechange: function(a) {
                    if ((a = a.target) && a.readyState == a.DONE) {
                        a = (new DOMParser).parseFromString(a.response, "text/xml", 0);
                        try {
                            a.querySelectorAll("Representation"),
                            q = 1,
                            w = a.querySelectorAll("SegmentURL"),
                            ha = a.querySelectorAll("Initialization"),
                            A.frameCount = w.length
                        } catch (xa) {
                            console.log(xa)
                        }
                        z = F.allow_streaming ? Math.min(60, A.frameCount) : A.frameCount;
                        Z(V)
                    }
                }
            })
        }
        function x(a, b) {
            D = ia.length;
            H = la = 0;
            var c = 8;
            B && (c = 4);
            for (b = 0; b < c; b++)
                t(a, z, function() {
                    ba || (e(r, F),
                    ba = !0);
                    for (var b = 0; b < c; b++)
                        t(a, D, function() {
                            f(r, F)
                        })
                })
        }
        function t(a, b, f) {
            setTimeout(g, 0, a, b, f)
        }
        function g(a, b, f) {
            var e, c, m, d, u, h, x;
            return $jscomp.asyncExecutePromiseGeneratorProgram(function(t) {
                switch (t.nextAddress) {
                case 1:
                    if (!(E < b)) {
                        t.jumpTo(3);
                        break
                    }
                    e = 0;
                    c = !1;
                    m = ia[la++];
                    E++;
                case 4:
                    if (!(3 > e) || c) {
                        t.jumpTo(1);
                        break
                    }
                    d = new Headers;
                    d.append("Range", m.content);
                    d.append("cache-control", "no-store");
                    d.append("pragma", "no-cache");
                    d.append("cache-control", "no-cache");
                    t.setCatchFinallyBlocks(6, 7);
                    return t.yield(fetch(a, {
                        headers: d,
                        method: "GET"
                    }), 9);
                case 9:
                    return u = t.yieldResult,
                    t.yield(u.arrayBuffer(), 10);
                case 10:
                    h = t.yieldResult,
                    y[m.index] = h,
                    H++,
                    c = !0;
                case 7:
                    t.enterFinallyBlock();
                    t.leaveFinallyBlock(4);
                    break;
                case 6:
                    x = t.enterCatchBlock();
                    console.log("exception during chunk download, retrying", ++e, x);
                    e++;
                    t.jumpTo(7);
                    break;
                case 3:
                    H === b && f(),
                    t.jumpToEnd()
                }
            })
        }
        function ca() {
            r.removeEventListener("canplay", R, !1);
            r.currentTime = A.currentIndex
        }
        function R() {
            r.removeEventListener("loadeddata", ca, !1);
            r.currentTime = A.currentIndex
        }
        function h() {
            r.currentTime = A.currentIndex;
            da = ba = !0;
            e(r, F);
            f(r, F);
            r.removeEventListener("loadeddata", ca, !1);
            r.removeEventListener("canplay", R, !1);
            r.removeEventListener("timeupdate", h, !1)
        }
        function L(a, b) {
            if (null != a && "" !== a) {
                var f = new XMLHttpRequest;
                f.open("GET", a, !0);
                b && (f.responseType = b.responseType,
                b.onreadystatechange && (f.onreadystatechange = b.onreadystatechange.bind(f)),
                b.onload && (f.onload = b.onload));
                f.addEventListener("error", function(a) {
                    console.log("Error: " + a + " Could not load url.")
                }, !1);
                f.send();
                return f
            }
        }
        function l(a, b, f, e, c) {
            return {
                header: "Range",
                content: "bytes=" + a.getAttribute("mediaRange").toString(),
                index: b,
                countPosition: f,
                firstPass: e,
                firstPassCompleteIndex: c
            }
        }
        function k(a, b, f, e) {
            var c = []
              , m = 0;
            if (void 0 === e ? 0 : e) {
                for (b = 0; b < a.length; b++)
                    c.push(l(a[b], b, !1));
                return c
            }
            e = parseInt(Math.round(a.length / b), 10);
            var d = Math.ceil(a.length / b);
            d = b + d;
            for (b = 0; b < d; b++)
                a[b * e] && (c.push(l(a[b * e], b * e, m++, !0, d)),
                f.push(b * e));
            d = c.length;
            for (b = 0; b < c.length; b++)
                c[b].firstPassCompleteIndex = d;
            f = e;
            m = 0;
            for (e = Math.floor(e / 2); 1 < e; e = Math.floor(e / 2)) {
                for (b = 0; b < a.length / f; b++)
                    a[e + b * f] && c.push(l(a[e + b * f], e + b * f, m++, !1, d));
                f = Math.floor(e / 2)
            }
            f = [];
            for (b = 0; b < c.length; b++)
                f[c[b].index] = c[b].index;
            for (b = 0; b < a.length; b++)
                f[b] || c.push(l(a[b], b, m++, !1, d));
            a = function(a, b) {
                return a.filter(function(a, f, e) {
                    return e.map(function(a) {
                        return a[b]
                    }).indexOf(a[b]) === f
                })
            }(c, "index");
            c = [];
            f = [];
            return a
        }
        function p(a) {
            return new Uint8Array([(a & 4278190080) >> 24, (a & 16711680) >> 16, (a & 65280) >> 8, a & 255])
        }
        var A = this, n, q, w = [], r = document.createElement("video"), v = [], z, C, B, D, la, H, ha = [], M = -1, ia, y = [], E = 0, K = 0, ba, F = {}, N, V, I, G, ja, ma, J, S = [112, 97, 115, 112], U = [116, 107, 104, 100], da;
        navigator.userAgent.match(/Android/i) ? B = !0 : navigator.userAgent.match(/iPhone|iPad|iPod/i) && (C = !0);
        if (/Chrome/i.test(navigator.userAgent.toLowerCase()) || /Chrome WebView/i.test(navigator.userAgent.toLowerCase()) || /Chromium/i.test(navigator.userAgent.toLowerCase()))
            var W = !0;
        else if (/Firefox/i.test(navigator.userAgent.toLowerCase()) || /Supermedium/i.test(navigator.userAgent.toLowerCase())) {
            var O = !0;
            B || (W = !0)
        } else
            /Safari/i.test(navigator.userAgent.toLowerCase()) && /Chrome/i.test(navigator.userAgent.toLowerCase());
        if (W) {
            var P = new MediaSource;
            r.src = window.URL.createObjectURL(P);
            r.preload = "auto";
            P.addEventListener("sourceopen", c)
        } else
            r.setAttribute("playsinline", ""),
            r.muted = !0,
            r.autoplay = !0;
        fetch("https://my.panomoments.com/sdk/moment", {
            method: "POST",
            body: "private_api_key=" + a.private_api_key + "&public_api_key=" + a.public_api_key + "&moment_id=" + a.moment_id + "&variation=" + a.variation + "&sdk_client_type=web",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then(function(a) {
            return a.json()
        }).then(function(a) {
            F = a;
            N = F.web_mpd_url;
            V = F.web_video_url;
            d()
        });
        this.frameCount = this.currentIndex = 0;
        this.render = function(a) {
            if (ba) {
                G = a / A.frameCount * 360;
                ja = 360 / A.frameCount;
                F.clockwise ? 0 > G && (G = 360 + G) : (G = -G,
                G = 540 + G);
                G %= 360;
                I = parseInt(Math.round(G / ja), 10);
                if (I == A.frameCount && F.moment_type)
                    I = A.frameCount - 1;
                else if (I == A.frameCount && !F.moment_type || !I)
                    I = 0;
                if (A.textureReady() && M != I) {
                    if (W) {
                        if (0 == ia.length || y[I])
                            var f = I;
                        else {
                            var e = !1
                              , c = !1;
                            for (a = I; !e && a < A.frameCount; )
                                y[a] ? (e = !0,
                                f = a) : a++;
                            for (a = I; !c && 0 <= a; )
                                if (y[a]) {
                                    c = !0;
                                    var m = a
                                } else
                                    a--;
                            f || (f = A.frameCount);
                            f = Math.abs(I - f) <= Math.abs(I - m) && f == A.frameCount ? 0 : Math.abs(I - f) <= Math.abs(I - m) ? f : m
                        }
                        f || (f = 0)
                    } else
                        f = I;
                    A.currentIndex = f;
                    f = A.currentIndex;
                    ma != f && ((ma = f,
                    W) ? y[f] && n && !n.updating && ba && (f < A.frameCount ? (r.currentTime += 1 / q,
                    n.timestampOffset = r.currentTime,
                    F.aligned ? n.appendBuffer(y[f]) : n.appendBuffer(y[(f + framePadding) % A.frameCount])) : console.log("Invalid Index")) : C || O ? F.aligned ? r.fastSeek(1 * f / q) : r.fastSeek((f + framePadding) % A.frameCount / q) : r.currentTime = 1 * f / q);
                    M = I
                }
                b(r, F)
            } else
                console.log("Render called before download is ready. Wait for Ready callback before calling Render.")
        }
        ;
        this.dispose = function() {
            r.src = "";
            q = n = f = e = b = r = null;
            w = [];
            P = null;
            v.splice(0, v.length);
            H = la = D = O = W = B = C = z = null;
            ha = [];
            ha.splice(0, ha.length);
            ia = M = null;
            y.splice(0, y.length);
            O = ba = K = E = null;
            F = {};
            da = J = ma = ja = G = I = V = N = null;
            console.log("PanoMoment Web SDK Disposed")
        }
        ;
        this.textureReady = function() {
            return !W && 1 == da && r.readyState === r.HAVE_ENOUGH_DATA || W && (O && 3 <= r.readyState || r.readyState === r.HAVE_ENOUGH_DATA) ? !0 : !1
        }
        ;
        var Z = function(a) {
            var b, f, e, c, m, d, u, h, x, t, g, G, Q, L, r, l, R, ca;
            return $jscomp.asyncExecutePromiseGeneratorProgram(function(k) {
                switch (k.nextAddress) {
                case 1:
                    b = new Headers,
                    f = "bytes=" + ha[0].getAttribute("range").toString(),
                    -1 < a.indexOf("https://data.panomoments.com/") ? a = a.replace(/data.panomoments.com/i, "s3.amazonaws.com/data.panomoments.com") : -1 < a.indexOf("https://staging-data.panomoments.com/") && (a = a.replace(/staging-data.panomoments.com/i, "s3.amazonaws.com/staging-data.panomoments.com")),
                    b.append("Range", f),
                    e = 0,
                    c = !1;
                case 2:
                    if (!(5 > e) || c) {
                        k.jumpTo(0);
                        break
                    }
                    k.setCatchFinallyBlocks(4);
                    return k.yield(fetch(a, {
                        headers: b,
                        method: "GET"
                    }), 6);
                case 6:
                    return m = k.yieldResult,
                    k.yield(m.arrayBuffer(), 7);
                case 7:
                    d = k.yieldResult;
                    J = new Uint8Array(d);
                    u = ka(J, S);
                    h = ka(J, U);
                    0 < h && 0 < u && (x = new ArrayBuffer(2),
                    t = new DataView(x),
                    t.setInt8(0, J[h + 80]),
                    t.setInt8(1, J[h + 81]),
                    g = t.getUint16(0),
                    g = g.toString(),
                    G = new ArrayBuffer(2),
                    Q = new DataView(G),
                    Q.setInt8(0, J[h + 82]),
                    Q.setInt8(1, J[h + 83]),
                    L = parseFloat(Q.getUint16(0)) / Math.pow(2, 16),
                    L = L.toString().substr(1),
                    r = g.toString() + L.toString(),
                    l = parseFloat(J[u + 7]) / parseFloat(J[u + 11]),
                    R = Math.round(parseFloat(r) / l),
                    new Uint8Array([p(R)[2], p(R)[3]]),
                    J[h + 80] = p(R)[2],
                    J[h + 81] = p(R)[3],
                    J[h + 82] = [0],
                    J[u + 7] = [1],
                    J[u + 11] = [1]);
                    ea(V);
                    c = !0;
                    k.leaveTryBlock(2);
                    break;
                case 4:
                    ca = k.enterCatchBlock(),
                    console.log("failure during init", e, ca),
                    e++,
                    k.jumpTo(2)
                }
            })
        }
          , T = function(a) {
            (!n || n && n.updating) && 0 == K ? (console.log("Buffer not ready. Retrying in 1 second."),
            setTimeout(function() {
                T(a)
            }, 1E3)) : a && n && !n.updating && 0 == K && (r.currentTime += 1 / q,
            n.timestampOffset = r.currentTime,
            n.appendBuffer(a),
            K++,
            setTimeout(function() {
                T(a)
            }, 500))
        }
          , ea = function(a) {
            var f, e, c, m, d, u, h, x, t, g;
            return $jscomp.asyncExecutePromiseGeneratorProgram(function(G) {
                switch (G.nextAddress) {
                case 1:
                    f = new Headers,
                    e = F.start_frame + 90,
                    ja = 360 / A.frameCount,
                    F.clockwise || (e = -e),
                    0 > e && (e = 360 + e),
                    A.currentIndex = parseInt(Math.round(e / ja), 10),
                    c = "bytes=" + w[A.currentIndex].getAttribute("mediaRange").toString(),
                    f.append("Range", c),
                    -1 < a.indexOf("https://data.panomoments.com/") ? a = a.replace(/data.panomoments.com/i, "s3.amazonaws.com/data.panomoments.com") : -1 < a.indexOf("https://staging-data.panomoments.com/") && (a = a.replace(/staging-data.panomoments.com/i, "s3.amazonaws.com/staging-data.panomoments.com")),
                    m = 0,
                    d = !1;
                case 2:
                    if (!(5 > m) || d) {
                        G.jumpTo(0);
                        break
                    }
                    G.setCatchFinallyBlocks(4);
                    return G.yield(fetch(a, {
                        headers: f,
                        method: "GET"
                    }), 6);
                case 6:
                    return u = G.yieldResult,
                    G.yield(u.arrayBuffer(), 7);
                case 7:
                    h = G.yieldResult;
                    x = new Uint8Array(h);
                    t = new Int8Array(J.length + x.length);
                    t.set(J);
                    t.set(x, J.length);
                    W ? (y[A.currentIndex] = h,
                    T(t),
                    b(r, F),
                    ia = k(w, z, v, !1)) : (r.addEventListener("loadeddata", X),
                    r.addEventListener("canplay", Y),
                    r.src = window.URL.createObjectURL(new Blob([t],{
                        type: "video/mp4"
                    })),
                    r.pause());
                    window.self !== window.top ? fa(a) : aa(a);
                    d = !0;
                    G.leaveTryBlock(2);
                    break;
                case 4:
                    g = G.enterCatchBlock(),
                    console.log("failure during first frame download", m, g),
                    m++,
                    G.jumpTo(2)
                }
            })
        }
          , fa = function(a) {
            var b = document.createElement("div");
            b.style.margin = "1px";
            b.style.height = "100%";
            b.style.width = "100%";
            b.style.pointerEvents = "none";
            b.style.zIndex = -1;
            b.style.position = "fixed";
            b.style.top = 0;
            document.body.appendChild(b);
            var f = new IntersectionObserver(function(a) {
                a[0].isIntersecting && (f.disconnect(),
                document.body.removeChild(b),
                aa())
            }
            );
            f.observe(b)
        }
          , aa = function(a) {
            W ? x(V) : fetch(V).then(function(a) {
                a.arrayBuffer().then(function(a) {
                    da = !1;
                    r.addEventListener("loadeddata", ca, !1);
                    r.addEventListener("canplay", R, !1);
                    r.addEventListener("timeupdate", h, !1);
                    a = new Uint8Array(a);
                    var b = ka(J, S)
                      , f = ka(J, U);
                    if (0 < f && 0 < b) {
                        var e = new ArrayBuffer(2);
                        e = new DataView(e);
                        e.setInt8(0, a[f + 80]);
                        e.setInt8(1, a[f + 81]);
                        e = e.getUint16(0);
                        e = e.toString();
                        var c = new ArrayBuffer(2);
                        c = new DataView(c);
                        c.setInt8(0, a[f + 82]);
                        c.setInt8(1, a[f + 83]);
                        c = parseFloat(c.getUint16(0)) / Math.pow(2, 16);
                        c = c.toString().substr(1);
                        e = e.toString() + c.toString();
                        c = parseFloat(a[b + 7]) / parseFloat(a[b + 11]);
                        e = Math.round(parseFloat(e) / c);
                        a[f + 80] = p(e)[2];
                        a[f + 81] = p(e)[3];
                        a[f + 82] = [0];
                        a[b + 7] = [1];
                        a[b + 11] = [1]
                    }
                    r.src = window.URL.createObjectURL(new Blob([a],{
                        type: "video/mp4"
                    }));
                    r.pause()
                })
            })
        }
          , X = function() {
            da = !0;
            r.removeEventListener("loadeddata", X);
            r.removeEventListener("canplay", Y);
            b(r, F)
        }
          , Y = function() {
            da = !0;
            r.removeEventListener("canplay", Y);
            r.removeEventListener("loadeddata", X);
            b(r, F)
        }
          , ka = function(a, b, f) {
            f = a.indexOf(b[0], f || 0);
            if (1 === b.length || -1 === f)
                return f;
            for (var e = f, c = 0; c < b.length && e < a.length; e++,
            c++)
                if (a[e] !== b[c])
                    return ka(J, b, f + 1);
            return e === f + b.length ? f : -1
        }
    }
    function B(a) {
        var b = this;
        k.call(this);
        this.identifier = a;
        this.momentData = this.PanoMoments = null;
        this.status = g.PANOMOMENT.NONE;
        this.controls = this.camera = this.container = null;
        this.defaults = {};
        this.setupDispatcher();
        this.handlerUpdateCallback = function() {
            return b.updateCallback()
        }
        ;
        this.handlerWindowResize = function() {
            return b.onWindowResize()
        }
        ;
        this.addEventListener(g.CONTAINER, function(a) {
            return b.onPanolensContainer(a.container)
        });
        this.addEventListener(g.CAMERA, function(a) {
            return b.onPanolensCamera(a.camera)
        });
        this.addEventListener(g.CONTROLS, function(a) {
            return b.onPanolensControls(a.controls)
        });
        this.addEventListener(g.FADE_IN, function() {
            return b.enter()
        });
        this.addEventListener(g.LEAVE_COMPLETE, function() {
            return b.leave()
        });
        this.addEventListener(g.LOAD_START, function() {
            return b.disableControl()
        });
        this.addEventListener(g.PANOMOMENT.READY, function() {
            return b.enableControl()
        })
    }
    function Y(a) {
        var b = this;
        B.call(this, a);
        this.viewerResetControlLimits = function() {
            return b.resetControlLimits(!1)
        }
    }
    function na(a) {
        B.call(this, a);
        this.scale2D = new c.Vector2(1,1)
    }
    function oa(a, b) {
        function e(a) {
            if (!1 !== h.enabled) {
                a.preventDefault();
                if (a.button === h.mouseButtons.ORBIT) {
                    if (!0 === h.noRotate)
                        return;
                    E = y.ROTATE;
                    L.set(a.clientX, a.clientY)
                } else if (a.button === h.mouseButtons.ZOOM) {
                    if (!0 === h.noZoom)
                        return;
                    E = y.DOLLY;
                    r.set(a.clientX, a.clientY)
                } else if (a.button === h.mouseButtons.PAN) {
                    if (!0 === h.noPan)
                        return;
                    E = y.PAN;
                    p.set(a.clientX, a.clientY)
                }
                E !== y.NONE && (document.addEventListener("mousemove", f, !1),
                document.addEventListener("mouseup", m, !1),
                h.dispatchEvent(T))
            }
        }
        function f(a) {
            if (!1 !== h.enabled) {
                a.preventDefault();
                var b = h.domElement === document ? h.domElement.body : h.domElement;
                E === y.ROTATE ? !0 !== h.noRotate && (l.set(a.clientX, a.clientY),
                n.subVectors(l, L),
                0 == L.x && 0 == L.y ? (L.set(l.x, l.y),
                n.subVectors(l, L)) : (h.rotateLeft(2 * Math.PI * n.x / b.clientHeight * h.rotateSpeed),
                h.rotateUp(2 * Math.PI * n.y / b.clientHeight * h.rotateSpeed),
                L.copy(l))) : E === y.DOLLY ? !0 !== h.noZoom && (z.set(a.clientX, a.clientY),
                C.subVectors(z, r),
                0 < C.y ? h.dollyIn() : 0 > C.y && h.dollyOut(),
                r.copy(z)) : E === y.PAN && !0 !== h.noPan && (A.set(a.clientX, a.clientY),
                q.subVectors(A, p),
                h.pan(q.x, q.y),
                p.copy(A))
            }
        }
        function m() {
            !1 !== h.enabled && (document.removeEventListener("mousemove", f, !1),
            document.removeEventListener("mouseup", m, !1),
            h.dispatchEvent(V),
            E = y.NONE)
        }
        function d(a) {
            if (!1 !== h.enabled && !0 !== h.noZoom && E === y.NONE) {
                a.preventDefault();
                a.stopPropagation();
                var b = 0;
                void 0 !== a.wheelDelta ? b = a.wheelDelta : void 0 !== a.detail && (b = -a.detail);
                0 < b ? (h.object.fov = h.object.fov < h.maxFov ? h.object.fov + 1 : h.maxFov,
                h.object.updateProjectionMatrix()) : 0 > b && (h.object.fov = h.object.fov > h.minFov ? h.object.fov - 1 : h.minFov,
                h.object.updateProjectionMatrix());
                h.dispatchEvent(F);
                h.dispatchEvent(T);
                h.dispatchEvent(V);
                h.dispatchEvent(I)
            }
        }
        function x(a) {}
        function t(a) {
            if (!1 !== h.enabled && !0 !== h.noKeys && !0 !== h.noRotate && !h.autoRotate) {
                var b = h.momentum && !h.autoRotate ? h.momentumKeydownFactor * h.momentumFactor : h.momentumKeydownFactor;
                switch (a.keyCode) {
                case h.keys.UP:
                    h.rotateUp(h.rotateSpeed * b);
                    break;
                case h.keys.BOTTOM:
                    h.rotateUp(-h.rotateSpeed * b);
                    break;
                case h.keys.LEFT:
                    h.rotateLeft(h.rotateSpeed * b);
                    break;
                case h.keys.RIGHT:
                    h.rotateLeft(-h.rotateSpeed * b)
                }
            }
        }
        function g(a) {
            if (!1 !== h.enabled) {
                switch (a.touches.length) {
                case 1:
                    if (!0 === h.noRotate)
                        return;
                    E = y.TOUCH_ROTATE;
                    L.set(a.touches[0].pageX, a.touches[0].pageY);
                    break;
                case 2:
                    if (!0 === h.noZoom)
                        return;
                    E = y.TOUCH_DOLLY;
                    var b = a.touches[0].pageX - a.touches[1].pageX;
                    a = a.touches[0].pageY - a.touches[1].pageY;
                    r.set(0, Math.sqrt(b * b + a * a));
                    break;
                case 3:
                    if (!0 === h.noPan)
                        return;
                    E = y.TOUCH_PAN;
                    p.set(a.touches[0].pageX, a.touches[0].pageY);
                    break;
                default:
                    E = y.NONE
                }
                E !== y.NONE && h.dispatchEvent(T)
            }
        }
        function k(a) {
            if (!1 !== h.enabled) {
                a.preventDefault();
                a.stopPropagation();
                var b = h.domElement === document ? h.domElement.body : h.domElement;
                switch (a.touches.length) {
                case 1:
                    if (!0 === h.noRotate)
                        break;
                    if (E !== y.TOUCH_ROTATE)
                        break;
                    l.set(a.touches[0].pageX, a.touches[0].pageY);
                    n.subVectors(l, L);
                    h.rotateLeft(2 * Math.PI * n.x / b.clientHeight * h.rotateSpeed);
                    h.rotateUp(2 * Math.PI * n.y / b.clientHeight * h.rotateSpeed);
                    L.copy(l);
                    break;
                case 2:
                    if (!0 === h.noZoom)
                        break;
                    if (E !== y.TOUCH_DOLLY)
                        break;
                    b = a.touches[0].pageX - a.touches[1].pageX;
                    a = a.touches[0].pageY - a.touches[1].pageY;
                    z.set(0, Math.sqrt(b * b + a * a));
                    C.subVectors(z, r);
                    0 > C.y ? (h.object.fov = h.object.fov < h.maxFov ? h.object.fov + 1 : h.maxFov,
                    h.object.updateProjectionMatrix()) : 0 < C.y && (h.object.fov = h.object.fov > h.minFov ? h.object.fov - 1 : h.minFov,
                    h.object.updateProjectionMatrix());
                    r.copy(z);
                    h.dispatchEvent(F);
                    h.dispatchEvent(I);
                    break;
                case 3:
                    if (!0 === h.noPan)
                        break;
                    if (E !== y.TOUCH_PAN)
                        break;
                    A.set(a.touches[0].pageX, a.touches[0].pageY);
                    q.subVectors(A, p);
                    h.pan(q.x, q.y);
                    p.copy(A);
                    break;
                default:
                    E = y.NONE
                }
            }
        }
        function R() {
            !1 !== h.enabled && (h.dispatchEvent(V),
            E = y.NONE)
        }
        this.object = a;
        this.domElement = void 0 !== b ? b : document;
        this.frameId = null;
        this.enabled = !0;
        this.center = this.target = new c.Vector3;
        this.noZoom = !1;
        this.zoomSpeed = 1;
        this.minDistance = 0;
        this.maxDistance = Infinity;
        this.minZoom = 0;
        this.maxZoom = Infinity;
        this.noRotate = !1;
        this.rotateSpeed = -.15;
        this.noPan = !0;
        this.keyPanSpeed = 7;
        this.autoRotate = !1;
        this.autoRotateSpeed = 2;
        this.minPolarAngle = 0;
        this.maxPolarAngle = Math.PI;
        this.spherical = new c.Spherical;
        this.momentumKeydownFactor = .05;
        this.momentum = !0;
        this.momentumFactor = 7.5;
        this.dampingFactor = .9;
        this.speedLimit = Number.MAX_VALUE;
        this.enableDamping = !0;
        this.minFov = 30;
        this.maxFov = 120;
        this.minAzimuthAngle = -Infinity;
        this.maxAzimuthAngle = Infinity;
        this.noKeys = !1;
        this.keys = {
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            BOTTOM: 40
        };
        this.mouseButtons = {
            ORBIT: c.MOUSE.LEFT,
            ZOOM: c.MOUSE.MIDDLE,
            PAN: c.MOUSE.RIGHT
        };
        var h = this
          , L = new c.Vector2
          , l = new c.Vector2
          , n = new c.Vector2
          , p = new c.Vector2
          , A = new c.Vector2
          , q = new c.Vector2
          , w = new c.Vector3
          , v = new c.Vector3
          , r = new c.Vector2
          , z = new c.Vector2
          , C = new c.Vector2
          , B = 0
          , D = 0
          , H = 0
          , K = 0
          , M = 1
          , N = new c.Vector3
          , O = new c.Vector3
          , P = new c.Quaternion
          , y = {
            NONE: -1,
            ROTATE: 0,
            DOLLY: 1,
            PAN: 2,
            TOUCH_ROTATE: 3,
            TOUCH_DOLLY: 4,
            TOUCH_PAN: 5
        }
          , E = y.NONE;
        this.target0 = this.target.clone();
        this.position0 = this.object.position.clone();
        this.zoom0 = this.object.zoom;
        var S = (new c.Quaternion).setFromUnitVectors(a.up, new c.Vector3(0,1,0))
          , U = S.clone().inverse()
          , F = {
            type: "change"
        }
          , T = {
            type: "start"
        }
          , V = {
            type: "end"
        }
          , I = {
            type: "fov"
        };
        this.setLastQuaternion = function(a) {
            P.copy(a);
            h.object.quaternion.copy(a)
        }
        ;
        this.getLastPosition = function() {
            return O
        }
        ;
        this.rotateLeft = function(a) {
            void 0 === a && (a = 2 * Math.PI / 60 / 60 * h.autoRotateSpeed);
            a = this.momentum && !this.autoRotate ? a /= this.momentumFactor : a;
            K -= a
        }
        ;
        this.rotateUp = function(a) {
            void 0 === a && (a = 2 * Math.PI / 60 / 60 * h.autoRotateSpeed);
            a = this.momentum && !this.autoRotate ? a /= this.momentumFactor : a;
            H -= a
        }
        ;
        this.rotateLeftStatic = function(a) {
            this.enableDamping = !1;
            K -= a;
            this.update();
            this.enableDamping = !0
        }
        ;
        this.rotateUpStatic = function(a) {
            this.enableDamping = !1;
            H -= a;
            this.update();
            this.enableDamping = !0
        }
        ;
        this.panLeft = function(a) {
            var b = this.object.matrix.elements;
            w.set(b[0], b[1], b[2]);
            w.multiplyScalar(-a);
            N.add(w)
        }
        ;
        this.panUp = function(a) {
            var b = this.object.matrix.elements;
            w.set(b[4], b[5], b[6]);
            w.multiplyScalar(a);
            N.add(w)
        }
        ;
        this.pan = function(a, b) {
            var f = h.domElement === document ? h.domElement.body : h.domElement;
            if (h.object instanceof c.PerspectiveCamera) {
                var e = h.object.position.clone().sub(h.target).length();
                e *= Math.tan(h.object.fov / 2 * Math.PI / 180);
                h.panLeft(2 * a * e / f.clientHeight);
                h.panUp(2 * b * e / f.clientHeight)
            } else
                h.object instanceof c.OrthographicCamera ? (h.panLeft(a * (h.object.right - h.object.left) / f.clientWidth),
                h.panUp(b * (h.object.top - h.object.bottom) / f.clientHeight)) : console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.")
        }
        ;
        this.dollyIn = function(a) {
            void 0 === a && (a = Math.pow(.95, h.zoomSpeed));
            h.object instanceof c.PerspectiveCamera ? M /= a : h.object instanceof c.OrthographicCamera ? (h.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom * a)),
            h.object.updateProjectionMatrix(),
            h.dispatchEvent(F)) : console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.")
        }
        ;
        this.dollyOut = function(a) {
            void 0 === a && (a = Math.pow(.95, h.zoomSpeed));
            h.object instanceof c.PerspectiveCamera ? M *= a : h.object instanceof c.OrthographicCamera ? (h.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / a)),
            h.object.updateProjectionMatrix(),
            h.dispatchEvent(F)) : console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.")
        }
        ;
        this.update = function(a) {
            var b = this.object.position;
            v.copy(b).sub(this.target);
            v.applyQuaternion(S);
            B = Math.atan2(v.x, v.z);
            D = Math.atan2(Math.sqrt(v.x * v.x + v.z * v.z), v.y);
            this.autoRotate && E === y.NONE && this.rotateLeft(2 * Math.PI / 60 / 60 * h.autoRotateSpeed);
            !0 === this.enableDamping && this.speedLimit !== Number.MAX_VALUE && (K = c.Math.clamp(K, -this.speedLimit, this.speedLimit),
            H = c.Math.clamp(H, -this.speedLimit, this.speedLimit));
            B += K;
            D += H;
            B = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, B));
            D = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, D));
            D = Math.max(1E-7, Math.min(Math.PI - 1E-7, D));
            var f = v.length() * M;
            f = Math.max(this.minDistance, Math.min(this.maxDistance, f));
            this.target.add(N);
            v.x = f * Math.sin(D) * Math.sin(B);
            v.y = f * Math.cos(D);
            v.z = f * Math.sin(D) * Math.cos(B);
            v.applyQuaternion(U);
            b.copy(this.target).add(v);
            this.object.lookAt(this.target);
            h.spherical.set(f, D, B);
            this.autoRotate || !0 !== this.enableDamping || (!this.momentum || E !== y.ROTATE && E !== y.TOUCH_ROTATE) && E !== y.NONE ? H = K = 0 : (K *= this.dampingFactor,
            H *= this.dampingFactor);
            M = 1;
            N.set(0, 0, 0);
            if (1E-7 < O.distanceToSquared(this.object.position) || 1E-7 < 8 * (1 - P.dot(this.object.quaternion)))
                !0 !== a && this.dispatchEvent(F),
                O.copy(this.object.position),
                P.copy(this.object.quaternion)
        }
        ;
        this.reset = function() {
            E = y.NONE;
            this.target.copy(this.target0);
            this.object.position.copy(this.position0);
            this.object.zoom = this.zoom0;
            this.object.updateProjectionMatrix();
            this.dispatchEvent(F);
            this.update()
        }
        ;
        this.getPolarAngle = function() {
            return D
        }
        ;
        this.getAzimuthalAngle = function() {
            return B
        }
        ;
        this.dispose = function() {
            this.domElement.removeEventListener("mousedown", e);
            this.domElement.removeEventListener("mousewheel", d);
            this.domElement.removeEventListener("DOMMouseScroll", d);
            this.domElement.removeEventListener("touchstart", g);
            this.domElement.removeEventListener("touchend", R);
            this.domElement.removeEventListener("touchmove", k);
            window.removeEventListener("keyup", x);
            window.removeEventListener("keydown", t)
        }
        ;
        this.domElement.addEventListener("mousedown", e, {
            passive: !1
        });
        this.domElement.addEventListener("mousewheel", d, {
            passive: !1
        });
        this.domElement.addEventListener("DOMMouseScroll", d, {
            passive: !1
        });
        this.domElement.addEventListener("touchstart", g, {
            passive: !1
        });
        this.domElement.addEventListener("touchend", R, {
            passive: !1
        });
        this.domElement.addEventListener("touchmove", k, {
            passive: !1
        });
        window.addEventListener("keyup", x, {
            passive: !1
        });
        window.addEventListener("keydown", t, {
            passive: !1
        });
        this.update()
    }
    function pa(a) {
        var b = this;
        this.object = a;
        this.object.rotation.reorder("YXZ");
        this.enabled = !0;
        this.deviceOrientation = null;
        this.alphaOffset = this.screenOrientation = 0;
        this.initialOffset = null;
        var e = function(a) {
            var f = a.alpha
              , e = a.beta;
            a = a.gamma;
            null === b.initialOffset && (b.initialOffset = f);
            f -= b.initialOffset;
            0 > f && (f += 360);
            b.deviceOrientation = {
                alpha: f,
                beta: e,
                gamma: a
            }
        }
          , f = function() {
            b.screenOrientation = window.orientation || 0
        }
          , m = function() {
            window.addEventListener("orientationchange", f, !1);
            window.addEventListener("deviceorientation", e, !1)
        }
        .bind(this)
          , d = function() {
            var a = new c.Vector3(0,0,1)
              , b = new c.Euler
              , f = new c.Quaternion
              , e = new c.Quaternion(-Math.sqrt(.5),0,0,Math.sqrt(.5));
            return function(c, m, d, u, x) {
                b.set(d, m, -u, "YXZ");
                c.setFromEuler(b);
                c.multiply(e);
                c.multiply(f.setFromAxisAngle(a, -x))
            }
        }();
        this.connect = function() {
            f();
            void 0 !== window.DeviceOrientationEvent && "function" === typeof window.DeviceOrientationEvent.requestPermission ? window.DeviceOrientationEvent.requestPermission().then(function(a) {
                "granted" == a && m()
            }).catch(function(a) {
                console.error("THREE.DeviceOrientationControls: Unable to use DeviceOrientation API:", a)
            }) : m();
            b.enabled = !0
        }
        ;
        this.disconnect = function() {
            window.removeEventListener("orientationchange", f, !1);
            window.removeEventListener("deviceorientation", e, !1);
            b.enabled = !1;
            b.deviceOrientation = null;
            b.initialOffset = null
        }
        ;
        this.update = function(a) {
            a = void 0 === a ? {
                theta: 0
            } : a;
            a = void 0 === a.theta ? 0 : a.theta;
            if (!1 !== b.enabled) {
                var f = b.deviceOrientation;
                if (f) {
                    var e = f.alpha ? c.Math.degToRad(f.alpha) + b.alphaOffset : 0
                      , m = f.beta ? c.Math.degToRad(f.beta) : 0;
                    f = f.gamma ? c.Math.degToRad(f.gamma) : 0;
                    var u = b.screenOrientation ? c.Math.degToRad(b.screenOrientation) : 0;
                    d(b.object.quaternion, e + a, m, f, u)
                }
            }
        }
        ;
        this.dispose = function() {
            b.disconnect()
        }
        ;
        this.getAlpha = function() {
            var a = b.deviceOrientation;
            return a && a.alpha ? c.Math.degToRad(a.alpha) + b.alphaOffset : 0
        }
        ;
        this.getBeta = function() {
            var a = b.deviceOrientation;
            return a && a.beta ? c.Math.degToRad(a.beta) : 0
        }
    }
    function ya(a) {
        var b = new c.OrthographicCamera(-1,1,1,-1,0,1)
          , e = new c.Scene
          , f = new c.StereoCamera;
        f.aspect = .5;
        var m = new c.WebGLRenderTarget(512,512,{
            minFilter: c.LinearFilter,
            magFilter: c.NearestFilter,
            format: c.RGBAFormat
        });
        m.scissorTest = !0;
        m.texture.generateMipmaps = !1;
        var d = new c.Vector2(.441,.156)
          , x = (new c.PlaneBufferGeometry(1,1,10,20)).deleteAttribute("normal").toNonIndexed()
          , t = x.attributes.position.array
          , g = x.attributes.uv.array;
        x.attributes.position.count *= 2;
        x.attributes.uv.count *= 2;
        var l = new Float32Array(2 * t.length);
        l.set(t);
        l.set(t, t.length);
        var k = new Float32Array(2 * g.length);
        k.set(g);
        k.set(g, g.length);
        g = new c.Vector2;
        t = t.length / 3;
        for (var h = 0, L = l.length / 3; h < L; h++) {
            g.x = l[3 * h];
            g.y = l[3 * h + 1];
            var n = g.dot(g);
            n = 1.5 + (d.x + d.y * n) * n;
            var p = h < t ? 0 : 1;
            l[3 * h] = g.x / n * 1.5 - .5 + p;
            l[3 * h + 1] = g.y / n * 3;
            k[2 * h] = .5 * (k[2 * h] + p)
        }
        x.attributes.position.array = l;
        x.attributes.uv.array = k;
        d = new c.MeshBasicMaterial({
            map: m.texture
        });
        x = new c.Mesh(x,d);
        e.add(x);
        this.setEyeSeparation = function(a) {
            f.eyeSep = a
        }
        ;
        this.setSize = function(b, f) {
            a.setSize(b, f);
            var e = a.getPixelRatio();
            m.setSize(b * e, f * e)
        }
        ;
        this.render = function(c, d, u) {
            var h = u instanceof O || u instanceof P;
            c.updateMatrixWorld();
            h && this.setEyeSeparation(u.stereo.eyeSep);
            null === d.parent && d.updateMatrixWorld();
            f.update(d);
            d = m.width / 2;
            var x = m.height;
            a.autoClear && a.clear();
            h && u.updateTextureToLeft();
            m.scissor.set(0, 0, d, x);
            m.viewport.set(0, 0, d, x);
            a.setRenderTarget(m);
            a.render(c, f.cameraL);
            a.clearDepth();
            h && u.updateTextureToRight();
            m.scissor.set(d, 0, d, x);
            m.viewport.set(d, 0, d, x);
            a.setRenderTarget(m);
            a.render(c, f.cameraR);
            a.clearDepth();
            a.setRenderTarget(null);
            a.render(e, b)
        }
    }
    function qa(a) {
        a = void 0 === a ? {} : a;
        var b = this.options = Object.assign({
            container: this.setupContainer(a.container),
            controlBar: !0,
            controlButtons: ["fullscreen", "setting", "video"],
            autoHideControlBar: !1,
            autoHideInfospot: !0,
            horizontalView: !1,
            clickTolerance: 10,
            cameraFov: 60,
            reverseDragging: !1,
            enableReticle: !1,
            dwellTime: 1500,
            autoReticleSelect: !0,
            viewIndicator: !1,
            indicatorSize: 30,
            output: null,
            autoRotate: !1,
            autoRotateSpeed: 2,
            autoRotateActivationDuration: 5E3,
            initialLookAt: new c.Vector3(0,0,-Number.MAX_SAFE_INTEGER),
            momentum: !0,
            rotateSpeed: -1,
            dampingFactor: .9,
            speedLimit: Number.MAX_VALUE
        }, a);
        a = b.container;
        var e = b.cameraFov
          , f = b.controlBar
          , m = b.controlButtons
          , d = b.viewIndicator
          , x = b.indicatorSize
          , g = b.enableReticle
          , Q = b.reverseDragging
          , l = b.output
          , k = b.scene
          , h = b.camera;
        b = b.renderer;
        var n = a.clientWidth
          , p = a.clientHeight;
        this.container = a;
        this.scene = this.setupScene(k);
        this.sceneReticle = new c.Scene;
        this.camera = this.setupCamera(e, n / p, h);
        this.renderer = this.setupRenderer(b, a);
        this.reticle = this.addReticle(this.camera, this.sceneReticle);
        this.control = this.setupControls(this.camera, a);
        this.effect = this.setupEffects(this.renderer, a);
        this.mode = z.NORMAL;
        this.pressObject = this.pressEntityObject = this.infospot = this.hoverObject = this.widget = this.panorama = null;
        this.raycaster = new c.Raycaster;
        this.raycasterPoint = new c.Vector2;
        this.userMouse = new c.Vector2;
        this.updateCallbacks = [];
        this.requestAnimationId = null;
        this.cameraFrustum = new c.Frustum;
        this.cameraViewProjectionMatrix = new c.Matrix4;
        this.outputDivElement = this.autoRotateRequestId = null;
        this.touchSupported = "ontouchstart"in window || window.DocumentTouch && document instanceof DocumentTouch;
        this.tweenLeftAnimation = new q.Tween;
        this.tweenUpAnimation = new q.Tween;
        this.tweenCanvasOpacityOut = new q.Tween;
        this.tweenCanvasOpacityIn = new q.Tween;
        this.outputEnabled = !1;
        this.viewIndicatorSize = x;
        this.tempEnableReticle = g;
        this.setupTween();
        this.handlerMouseUp = this.onMouseUp.bind(this);
        this.handlerMouseDown = this.onMouseDown.bind(this);
        this.handlerMouseMove = this.onMouseMove.bind(this);
        this.handlerWindowResize = this.onWindowResize.bind(this);
        this.handlerKeyDown = this.onKeyDown.bind(this);
        this.handlerKeyUp = this.onKeyUp.bind(this);
        this.handlerTap = this.onTap.bind(this, {
            clientX: n / 2,
            clientY: p / 2
        });
        f && this.addDefaultControlBar(m);
        d && this.addViewIndicator();
        Q && this.reverseDraggingDirection();
        g ? this.enableReticleControl() : this.registerMouseAndTouchEvents();
        "overlay" === l && this.addOutputElement();
        this.registerEventListeners();
        this.animate.call(this)
    }
    var za = "^0.117.0".replace(/[^0-9.]/g, "")
      , M = {
        ORBIT: 0,
        DEVICEORIENTATION: 1
    }
      , z = {
        UNKNOWN: 0,
        NORMAL: 1,
        CARDBOARD: 2,
        STEREO: 3
    }
      , N = {
        TAB: 0,
        SBS: 1
    }
      , g = {
        CONTAINER: "panolens-container",
        CAMERA: "panolens-camera",
        CONTROLS: "panolens-controls",
        LOAD_START: "load-start",
        LOAD: "load",
        LOADED: "loaded",
        READY: "ready",
        ERROR: "error",
        ENTER: "enter",
        ENTER_START: "enter-start",
        ENTER_FADE_START: "enter-fade-start",
        ENTER_FADE_COMPLETE: "enter-fade-complete",
        ENTER_COMPLETE: "enter-complete",
        FADE_IN: "fade-in",
        FADE_OUT: "fade-out",
        PROGRESS: "progress",
        LEAVE: "leave",
        LEAVE_START: "leave-start",
        LEAVE_COMPLETE: "leave-complete",
        INFOSPOT_ANIMATION_COMPLETE: "infospot-animation-complete",
        VIEWER_HANDLER: "panolens-viewer-handler",
        MODE_CHANGE: "mode-change",
        WIDNOW_RESIZE: "window-resize",
        MEDIA: {
            PLAY: "play",
            PAUSE: "pause",
            VOLUME_CHANGE: "volumechange"
        },
        RETICLE: {
            RETICLE_RIPPLE_START: "reticle-ripple-start",
            RETICLE_RIPPLE_END: "reticle-ripple-end",
            RETICLE_START: "reticle-start",
            RETICLE_END: "reticle-end",
            RETICLE_UPDATE: "reticle-update"
        },
        PANOMOMENT: {
            NONE: "panomoments.none",
            FIRST_FRAME_DECODED: "panomoments.first_frame_decoded",
            READY: "panomoments.ready",
            COMPLETED: "panomoments.completed"
        }
    }
      , C = {
        Info: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAABAAAAAQADq8/hgAAADBklEQVR42u2bP08UQRiHnzFaSYCI/xoksdBIqGwIiYWRUBISExpCQ0ej38FWOmlIKKhoMPEbaCxsrrHiYrQgOSlQEaICrT+LHSPZzNzt3s3c3Hn7lHvLzvv82L2dm30XKioqKgYY062BJF0HpoA7wARwBbhsPz4DjoEG8AnYNcZ8Sx1Op8IXJM1KWpdUV3nq9m9nJV1I7VNGfEzSM0mNNqR9NOwxx1L7NRMflbQm6SSgeJ4TO8Zoat+8/LKkg4jieQ4kLaf2RtKwpJ0uiufZkTScSn5S0l5C+b/sSZrstvyMpKPU5uc4kjTTjkvpeYCkaeA1/+7hvcIZMGuMqUULQNIU8Aa4ltrWwyHwyBizGzwASSPAe+B2assW7AH3jTE/i+xcZoa12Qfy2Bo3i+5cKABl99zF1GYlWFTBeULLS0DZrOsDcDNggTXgc27bLWA64BhfgHvGmB8dHUXZ1DM0S45xliKMs9bKr+klIOkqsBrwv9JtVq1DewEAT4Ch1BYdMGQdygeg7Df4SmqDAKyoyXpCszPgITCeuvoAjFuX0gE8jljUdv7bCtiOOJ7XpdUZ8L/gdXHOA5QtYH5NXXVgbrgWWn1nwFTqaiPgdPIFcDd1tRFwOl307DwRuZgXwLvctgfA04hjOp18AcReZ6sZY16e3yDpUuQxnU6+S2AkcjEpcDr1zxOXSPgCKLSa0mc4nXwB/EpdbQScTr4AGqmrjYDTyRfAx9TVRsDp5Aug8LJyH+F0cgZg58z11BUHpO5ruGh2G3ybuuqAeF2aBfAqddUB8bq0OgP2U1cegH3aOQOMMb+BrdTVB2DLupQLwLIOnKY26IBT6+ClaQDGmO/ARmqLDtiwDn7HVkcY+EdjNoTlCI+tYhO2iUppm6HKslPUq2qQKHpUe8AFsjaUXuUQWCgqXyoAG8IuME/WkNRrnAHzZfqDSgdgQ6gBc2Td3b3CMTBXtkOsIzTIjZLnQhjcVtlcEIPZLJ0LoVvt8s/Va+3yuSAG84UJRxB98cpM9dJURUVFxSDzBxKde4Lk3/h2AAAAAElFTkSuQmCC",
        Arrow: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAABAAAAAQADq8/hgAAADPklEQVR42u2bMUscQRiG30/SRaJEI1ZKUiRErNIELRUbQYSAnX8hpVUgkDYp0wgWVjYW+QcJaQzYpLojJIXhtDDEKBpj65ti58ixmdmb2ZvZ7+T2AUHudmfmeXf2bnb3O6CmpqZmgJGqOiI5AWAWwEMA0wDuArht3r4CcAagBeAbgIaI/NQOp1fhIZKLJN+SbDKcptl3keSQtk+I+BjJVyRbJaRdtEybY9p+ReKjJN+QvIwonufS9DGq7ZuXXyd5nFA8zzHJdW1vkLxDcrdC8Ty7JO9oyc+QPFCUb3NAcqZq+TmSp9rmHZySnCvjErwOIPkUwHv8+w7vF64ALIrIfrIASM4C+ADgnratgxMACyLSiB4AyREAnwE80LbswgGAJyJy4bNxyApr6wbIw4xxy3djrwCYfeeuaZsFsEbPdULXU4DZqusLgMkEA21P05EEbf8A8FhEzos28pkBLxLKL5s/r/M1kEkz9vKQHGeatf05yfmOfubNa7G5JDle5NhtBjwHMBz5yFwAWBaRT+0XzP8pZsKwcQiH2fX8Ycojb+kzxUw4ZJn7CSQXqpRPHMKCq7+iZJ71Mvdy/DftXSQ6HcJdSDaqPPKW/mPOBO+lcbvzCU35RCFM2PpwnQKzZQfdgfe0dxH5dLA6uQJ4pC2fIASrkyuA6X6QjxyC1ckVQNn7bNHlI4ZgdXIFUObiJJl8pBCsTjGfuIwA2Cv4FN7xbYjkjqsRAHuIePXoCiDF1Zk2VidXAL+1R5sAq5MrgJb2aBNgdXIF8FV7tAmwOrkCCFs73wysTtYATHFCU3vEEWm6Ci6KvgY/ao86Ik6XogDeaY86Ik6XbjPgSHvkEThCwQy45XpDRK5JbgN4GWkgUyR9H65MRQxgW0SunZ5FezK7pfwd8e8MV8UfAPdF5Jdrg8JrAbPjprZFD2wWyQP6j8ZSEufRmGlgQ9umBBvd5IOgbjFUKLu+XnWBhG+rpsFVZGUo/coJgFVf+aAATAgNACvICpL6jSsAKyH1QcEBmBD2ASwhq+7uF84ALIVWiPUEB7lQsiOEwS2VzQUxmMXSuRCqKpd/zX4rl88FMZg/mLAEcSN+MlP/aKqmpqZmkPkL0hSjwOpNKxwAAAAASUVORK5CYII=",
        FullscreenEnter: "data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz4KICAgIDxwYXRoIGQ9Ik03IDE0SDV2NWg1di0ySDd2LTN6bS0yLTRoMlY3aDNWNUg1djV6bTEyIDdoLTN2Mmg1di01aC0ydjN6TTE0IDV2MmgzdjNoMlY1aC01eiIvPgo8L3N2Zz4=",
        FullscreenLeave: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggc3R5bGU9ImZpbGw6I2ZmZiIgZD0iTTE0LDE0SDE5VjE2SDE2VjE5SDE0VjE0TTUsMTRIMTBWMTlIOFYxNkg1VjE0TTgsNUgxMFYxMEg1VjhIOFY1TTE5LDhWMTBIMTRWNUgxNlY4SDE5WiIgLz48L3N2Zz4=",
        VideoPlay: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggc3R5bGU9ImZpbGw6I2ZmZiIgZD0iTTgsNS4xNFYxOS4xNEwxOSwxMi4xNEw4LDUuMTRaIiAvPjwvc3ZnPg==",
        VideoPause: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggc3R5bGU9ImZpbGw6I2ZmZiIgZD0iTTE0LDE5LjE0SDE4VjUuMTRIMTRNNiwxOS4xNEgxMFY1LjE0SDZWMTkuMTRaIiAvPjwvc3ZnPg==",
        WhiteTile: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIABAMAAAAGVsnJAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAB1WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOkNvbXByZXNzaW9uPjE8L3RpZmY6Q29tcHJlc3Npb24+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDx0aWZmOlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb24+MjwvdGlmZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KAtiABQAAACRQTFRFAAAAAAAABgYGBwcHHh4eKysrx8fHy8vLzMzM7OzsAAAABgYG+q7SZgAAAAp0Uk5TAP7+/v7+/v7+/iJx/a8AAAOwSURBVHja7d0hbsNAEAVQo6SFI6XEcALDcgNLvUBvEBQVhpkWVYWlhSsVFS7t5QIshRt695lEASZP+8c7a1kzDL1fz+/zyuvzp6FbvoddrL6uDd1yGZ5eXldeb18N3fIx7A+58prmhm65DfvDcd0952lu6JabFbD/zVprZj1lzcys+fj9z8xTZtbT8rv8yWlu6BYAIgAAAAAAAAAAAABAM6QXEAEAAAAAAAAAgJ2gnaAIiIA3Q2qAGgAAAAAAAAAAAAAAAAAAAAAAAAAAQJsADkVFAAAAAAA8Bj0GRUAEREAEREAEREAEREAEAAAAAAAAAAB2gnaCIiACPplRA9QANUAERAAAAEVQERQBERCBVlfAcZ3aeZobusUKMGBhV6KUElHGKBERJR6/fxExRkQZl9/lT8S1oVsuhqyYMmPKjCkzvfcCpsxohrwY0Q06EAEAAAAAAAAAAACgGdILiAAAAAAAAAAAwE7QTlAERMCbITVADQAAAAAAAAAAAAAAAAAAAAAAAAAAwKmwQ1ERAAAAAACPQY9BERABERABERABERABERABAAAAAAAAAICdoJ2gCIiAT2bUADVADRABEQAAQBFUBEVABERgEyvAlJm+V4ApM6bMmDJjyowpM6bMdN0LmDKjGfJiRDfoQAQAAAAAAAAAAACAZkgvIAIAAAAAAAAAADtBO0EREAFvhtQANQAAAAAAAAAAAAAAAAAAAAAAAAAAAKfCDkVFAAAAAAA8Bj0GRUAEREAEREAEREAEREAEAAAAAAAAAAB2gnaCIiACPplRA9QANUAERAAAAEVQERQBERCBTawAU2b6XgGmzJgyY8qMKTOmzJgy03UvYMqMZsiLEd2gAxEAAAAAAAAAAAAAmiG9gAgAAAAAAAAAAOwE7QRFQAS8GVID1AAAAAAAAAAAAAAAAAAAAAAAAAAAAJwKOxQVAQAAAADwGPQYFAEREAEREAEREAEREAERAAAAAAAAAADYCdoJioAI+GRGDVAD1AAREAEAABRBRVAEREAENrECTJnpewWYMmPKjCkzpsyYMmPKTNe9gCkzmiEvRnSDDkQAAAAAAAAAAAAAaIb0AiIAAAAAAAAAALATtBMUARHwZkgNUAMAAAAAAAAAAAAAAAAAAAAAAAAAAHAq7FBUBAAAAADAY9BjUAREQAREQAREQAREQAREAAAAAAAAAABgJ2gnKAIi4JMZNUANUANEQAQAAFAEFUEREAER2MQKMGWm7xVgyowpM50PWen9ugNGXz1XaocAFgAAAABJRU5ErkJggg==",
        Setting: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAABAAAAAQADq8/hgAAADn0lEQVR42u2bzUsVURjGnyO6CPzAMnTjppAo3LTwH1CqTfaxbeOiRS37A0wXtROFVi1aRBs3LWohSIGbQAQXViBGRhG0UIRKUCpK7q/FnOB2uc6cOXNmRnGe3eW+H8/7zLln3vNxpQoVKlQ4wjBFJAFOSRqX1O7osivpvjHmU1nChBZglvSYLYJbS0EanCvIJzWK+gnsyH34/8OuMaYjb265jwCgz6N4SWq3vodbAEmnS/KtBDgoAgyU5BteAOAkMAPcBroc7PskDWfgN+wyDwBdltMMcDI3tYBnde/pHeARMNTErgd4APzweP834oeN1dMkz5DlsFNn/yyv4kdiSK4At4AO4CqwGaDwRmza2B0210qM7YhrXU59ANAq6bWkwQTTn5KO5fIE0uVYlXTeGLOXFMx1DrjlULwKKN41x6DlnIjEEQCckPRe0okCiguJr5LOGGO+xhm5jICJQ1i8LOeJJKPYEQAMKvrtt5ZdjSf2FM0Fq/sZJI2A6UNcvCz36TiDfUcAcE1SPu/U6Mm8k/TFfu6XdFb5iX3dGPM8lQfwNod3+TowBnQ3yddtv1vPIe+b1JIBiwEJ1IAJ208k5W21trWA+V/5CHAcmAtU/A2P/DcCiTAHHE8tgCVhgLvAXgYCk17Jo/yTGfLuWe7Zd72AC8CWB4n3OAz7mLytNkZabAEXMhfeQKYfWEpJZCxA3rGUOZeA/qDF15FpAz47EvlNk9neI2e3jeWCz0BbmvipNkSMMX8kuSZYM8Z8zyqAjbHmaN5mOeYjgIXrU93MWrxHrNQjrqiDkQMLHwG+OdqF3NN3jeXKzU8AoF1SzdH8XKhJUO7HZDXLMbwAwICkJUULFxe0SbqSVQAbw3Xi7Ze0ZLmGAzAKbHs0JGU1QtvAaIjCW4B7ZOvJy2qFa5a730RPtBiaz0CgnkiZi6F5fBZDVMvho7EhcuS3xJJ2hV9IupgTqaLw0hhzab8vq23xOG/r+LDsKjLgYVzxUnU0ltwK2wDezUyJmEwqXgp/PL4rvxthaeCSI+zxuA10J8ZkWdJNSb2SLkvayKHwDRu71+ZajrG941J8agALDQ3GU/a/IvMkYCPzmCbtLNEVmacNtgs5iP9fYVNEV1Q6Hez7yNZSL+J2SarTcpqiyV2iUkG0IvPFvbz5FbEn+KEk3wMjwMeSfCsBXFBdly9CAPk9ydyffpECuB5tZfVJjaKWueOSfinln6YK4lahQoUKRxd/AcRPGTcQCAUQAAAAAElFTkSuQmCC",
        ChevronRight: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTguNTksMTYuNThMMTMuMTcsMTJMOC41OSw3LjQxTDEwLDZMMTYsMTJMMTAsMThMOC41OSwxNi41OFoiIC8+PC9zdmc+",
        Check: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTIxLDdMOSwxOUwzLjUsMTMuNUw0LjkxLDEyLjA5TDksMTYuMTdMMTkuNTksNS41OUwyMSw3WiIgLz48L3N2Zz4=",
        ViewIndicator: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBpZD0idmlldy1pbmRpY2F0b3IiIGhlaWdodD0iMzAiIHdpZHRoPSIzMCIgdmlld0JveD0iLTIuNSAtMSAzMCAzMCI+Cgk8c3R5bGUgdHlwZT0idGV4dC9jc3MiPi5zdDB7c3Ryb2tlLXdpZHRoOjI7c3Ryb2tlLW1pdGVybGltaXQ6MTA7ZmlsbDpub25lO30uc3Qxe3N0cm9rZS13aWR0aDo2O3N0cm9rZS1taXRlcmxpbWl0OjEwO30KCTwvc3R5bGU+Cgk8Zz4KCQk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNIDEyLjUgMCBBIDEyLjUgMTIuNSAwIDAgMCAtMTIuNSAwIEEgMTIuNSAxMi41IDAgMCAwIDEyLjUgMCIgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwxMywxNS41KSI+PC9wYXRoPgoJCTxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik0gMTMgMCBMIDEwIDIgTCAxNiAyIFoiPjwvcGF0aD4KCQk8cGF0aCBjbGFzcz0ic3QyIiBkPSJNIDIgMCBBIDIgMiAwIDAgMCAtMiAwIEEgMiAyIDAgMCAwIDIgMCIgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwxMywxNS41KSI+PC9wYXRoPgoJCTxwYXRoIGNsYXNzPSJzdDEiIGlkPSJpbmRpY2F0b3IiIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMTMsMTUuNSkiPjwvcGF0aD4KCTwvZz4KPC9zdmc+"
    }
      , ra = {
        load: function(a, b, e, f) {
            b = void 0 === b ? function() {}
            : b;
            e = void 0 === e ? function() {}
            : e;
            f = void 0 === f ? function() {}
            : f;
            c.Cache.enabled = !0;
            var m, d, x, g;
            for (g in C)
                C.hasOwnProperty(g) && a === C[g] && (m = g);
            var Q = c.Cache.get(m ? m : a);
            if (void 0 !== Q)
                return b && requestAnimationFrame(function() {
                    e({
                        loaded: 1,
                        total: 1
                    });
                    b(Q)
                }),
                Q;
            var l = window.URL || window.webkitURL;
            var k = document.createElementNS("http://www.w3.org/1999/xhtml", "img");
            c.Cache.add(m ? m : a, k);
            var h = function() {
                l.revokeObjectURL(k.src);
                b(k)
            };
            if (0 === a.indexOf("data:"))
                return k.addEventListener("load", h, !1),
                k.src = a,
                k;
            k.crossOrigin = void 0 !== this.crossOrigin ? this.crossOrigin : "";
            m = new window.XMLHttpRequest;
            m.open("GET", a, !0);
            m.responseType = "arraybuffer";
            m.addEventListener("error", f);
            m.addEventListener("progress", function(a) {
                if (a) {
                    var b = a.loaded
                      , f = a.total;
                    a.lengthComputable && e({
                        loaded: b,
                        total: f
                    })
                }
            });
            m.addEventListener("loadend", function(a) {
                a && (d = new Uint8Array(a.currentTarget.response),
                x = new window.Blob([d]),
                k.addEventListener("load", h, !1),
                k.src = l.createObjectURL(x))
            });
            m.send(null)
        }
    }
      , Z = {
        load: function(a, b, e, f) {
            b = void 0 === b ? function() {}
            : b;
            var m = new c.Texture;
            ra.load(a, function(f) {
                m.image = f;
                f = 0 < a.search(/\.(jpg|jpeg)$/) || 0 === a.search(/^data:image\/jpeg/);
                m.format = f ? c.RGBFormat : c.RGBAFormat;
                m.needsUpdate = !0;
                b(m)
            }, e, f);
            return m
        }
    }
      , ta = {
        load: function(a, b, e, f) {
            b = void 0 === b ? function() {}
            : b;
            e = void 0 === e ? function() {}
            : e;
            var m;
            var d = new c.CubeTexture([]);
            var g = 0;
            var t = {};
            var k = {};
            a.map(function(a, c) {
                ra.load(a, function(a) {
                    d.images[c] = a;
                    g++;
                    6 === g && (d.needsUpdate = !0,
                    e({
                        loaded: g,
                        total: 6
                    }),
                    b(d))
                }, function(a) {
                    t[c] = {
                        loaded: a.loaded,
                        total: a.total
                    };
                    k.loaded = 0;
                    m = k.total = 0;
                    for (var b in t)
                        m++,
                        k.loaded += t[b].loaded,
                        k.total += t[b].total;
                    6 > m && (k.total = k.total / m * 6);
                    e(k)
                }, f)
            });
            return d
        }
    };
    l.prototype = Object.assign(Object.create(c.EventDispatcher.prototype), {
        setContainer: function(a) {
            this.container = a
        },
        setScene: function(a) {
            this.scene = a
        },
        enumerateDevices: function() {
            var a = this.devices
              , b = new Promise(function(b) {
                b(a)
            }
            );
            return 0 < a.length ? b : window.navigator.mediaDevices.enumerateDevices()
        },
        switchNextVideoDevice: function() {
            var a = this.stop.bind(this)
              , b = this.start.bind(this)
              , e = this.setVideDeviceIndex.bind(this)
              , f = this.videoDeviceIndex;
            this.getDevices("video").then(function(c) {
                a();
                f++;
                f >= c.length ? (e(0),
                f--) : e(f);
                b(c[f])
            })
        },
        getDevices: function(a) {
            a = void 0 === a ? "video" : a;
            var b = this.devices;
            return this.enumerateDevices().then(function(a) {
                return a.map(function(a) {
                    b.includes(a) || b.push(a);
                    return a
                })
            }).then(function(b) {
                var f = new RegExp(a,"i");
                return b.filter(function(a) {
                    return f.test(a.kind)
                })
            })
        },
        getUserMedia: function(a) {
            var b = this.setMediaStream.bind(this)
              , e = this.playVideo.bind(this);
            return window.navigator.mediaDevices.getUserMedia(a).then(b).then(e).catch(function(a) {
                console.warn("PANOLENS.Media: " + a)
            })
        },
        setVideDeviceIndex: function(a) {
            this.videoDeviceIndex = a
        },
        start: function(a) {
            var b = this.constraints
              , e = this.getUserMedia.bind(this);
            this.element = this.createVideoElement();
            return this.getDevices().then(function(f) {
                if (!f || 0 === f.length)
                    throw Error("no video device found");
                b.video.deviceId = (a || f[0]).deviceId;
                return e(b)
            })
        },
        stop: function() {
            var a = this.stream;
            a && a.active && (a.getTracks()[0].stop(),
            window.removeEventListener("resize", this.onWindowResize.bind(this)),
            this.stream = this.element = null)
        },
        setMediaStream: function(a) {
            this.stream = a;
            this.element.srcObject = a;
            this.scene && (this.scene.background = this.createVideoTexture());
            window.addEventListener("resize", this.onWindowResize.bind(this))
        },
        playVideo: function() {
            var a = this.element;
            a && (a.play(),
            this.dispatchEvent({
                type: g.MEDIA.PLAY
            }))
        },
        pauseVideo: function() {
            var a = this.element;
            a && (a.pause(),
            this.dispatchEvent({
                type: g.MEDIA.PAUSE
            }))
        },
        createVideoTexture: function() {
            var a = this.element
              , b = new c.VideoTexture(a);
            b.generateMipmaps = !1;
            b.minFilter = c.LinearFilter;
            b.magFilter = c.LinearFilter;
            b.format = c.RGBFormat;
            b.center.set(.5, .5);
            a.addEventListener("canplay", this.onWindowResize.bind(this));
            return b
        },
        createVideoElement: function() {
            var a = this.dispatchEvent.bind(this)
              , b = document.createElement("video");
            b.setAttribute("autoplay", "");
            b.setAttribute("muted", "");
            b.setAttribute("playsinline", "");
            b.style.position = "absolute";
            b.style.top = "0";
            b.style.left = "0";
            b.style.width = "100%";
            b.style.height = "100%";
            b.style.objectPosition = "center";
            b.style.objectFit = "cover";
            b.style.display = this.scene ? "none" : "";
            b.addEventListener("canplay", function() {
                return a({
                    type: "canplay"
                })
            });
            return b
        },
        onWindowResize: function() {
            if (this.element && this.element.videoWidth && this.element.videoHeight && this.scene) {
                var a = this.container
                  , b = a.clientWidth;
                a = a.clientHeight;
                var e = this.scene.background
                  , f = this.element;
                f = f.videoHeight / f.videoWidth * (this.container ? b / a : 1) * this.ratioScalar;
                b > a ? e.repeat.set(f, 1) : e.repeat.set(1, 1 / f)
            }
        }
    });
    Object.assign(w.prototype, {
        constructor: w,
        updateUniformByFormat: function(a, b) {
            this.format = a;
            var e = b.repeat.value;
            b = b.offset.value;
            var f = this.loffset
              , c = this.roffset;
            switch (a) {
            case N.TAB:
                e.set(1, .5);
                b.set(0, .5);
                f.set(0, .5);
                c.set(0, 0);
                break;
            case N.SBS:
                e.set(.5, 1),
                b.set(0, 0),
                f.set(0, 0),
                c.set(.5, 0)
            }
        },
        updateTextureToLeft: function(a) {
            a.copy(this.loffset)
        },
        updateTextureToRight: function(a) {
            a.copy(this.roffset)
        }
    });
    p.prototype = Object.assign(Object.create(c.Sprite.prototype), {
        constructor: p,
        setColor: function(a) {
            this.material.color.copy(a instanceof c.Color ? a : new c.Color(a))
        },
        createCanvasTexture: function(a) {
            a = new c.CanvasTexture(a);
            a.minFilter = c.LinearFilter;
            a.magFilter = c.LinearFilter;
            a.generateMipmaps = !1;
            return a
        },
        createCanvas: function() {
            var a = document.createElement("canvas")
              , b = a.getContext("2d")
              , e = this.dpr;
            a.width = 32 * e;
            a.height = 32 * e;
            b.scale(e, e);
            b.shadowBlur = 5;
            b.shadowColor = "rgba(200,200,200,0.9)";
            return {
                canvas: a,
                context: b
            }
        },
        updateCanvasArcByProgress: function(a) {
            var b = this.context
              , e = this.canvasWidth
              , f = this.canvasHeight
              , c = this.material
              , d = this.dpr
              , g = a * Math.PI * 2
              , t = this.color.getStyle()
              , k = .5 * e / d;
            d = .5 * f / d;
            b.clearRect(0, 0, e, f);
            b.beginPath();
            0 === a ? (b.arc(k, d, e / 16, 0, 2 * Math.PI),
            b.fillStyle = t,
            b.fill()) : (b.arc(k, d, e / 4 - 3, -Math.PI / 2, -Math.PI / 2 + g),
            b.strokeStyle = t,
            b.lineWidth = 3,
            b.stroke());
            b.closePath();
            c.map.needsUpdate = !0
        },
        ripple: function() {
            var a = this
              , b = this.context
              , e = this.canvasWidth
              , f = this.canvasHeight
              , c = this.material
              , d = this.rippleDuration
              , x = performance.now()
              , t = this.color
              , k = this.dpr
              , l = .5 * e / k
              , n = .5 * f / k
              , h = function() {
                var m = window.requestAnimationFrame(h)
                  , u = (performance.now() - x) / d
                  , Q = 0 < 1 - u ? 1 - u : 0
                  , p = u * e * .5 / k;
                b.clearRect(0, 0, e, f);
                b.beginPath();
                b.arc(l, n, p, 0, 2 * Math.PI);
                b.fillStyle = "rgba(" + 255 * t.r + ", " + 255 * t.g + ", " + 255 * t.b + ", " + Q + ")";
                b.fill();
                b.closePath();
                1 <= u && (window.cancelAnimationFrame(m),
                a.updateCanvasArcByProgress(0),
                a.dispatchEvent({
                    type: g.RETICLE.RETICLE_RIPPLE_END
                }));
                c.map.needsUpdate = !0
            };
            this.dispatchEvent({
                type: g.RETICLE.RETICLE_RIPPLE_START
            });
            h()
        },
        show: function() {
            this.visible = !0
        },
        hide: function() {
            this.visible = !1
        },
        start: function(a) {
            this.autoSelect && (this.dispatchEvent({
                type: g.RETICLE.RETICLE_START
            }),
            this.startTimestamp = performance.now(),
            this.callback = a,
            this.update())
        },
        end: function() {
            this.startTimestamp && (window.cancelAnimationFrame(this.timerId),
            this.updateCanvasArcByProgress(0),
            this.startTimestamp = this.timerId = this.callback = null,
            this.dispatchEvent({
                type: g.RETICLE.RETICLE_END
            }))
        },
        update: function() {
            this.timerId = window.requestAnimationFrame(this.update.bind(this));
            var a = (performance.now() - this.startTimestamp) / this.dwellTime;
            this.updateCanvasArcByProgress(a);
            this.dispatchEvent({
                type: g.RETICLE.RETICLE_UPDATE,
                progress: a
            });
            1 <= a && (window.cancelAnimationFrame(this.timerId),
            this.callback && this.callback(),
            this.end(),
            this.ripple())
        }
    });
    var q = function(a, b) {
        return b = {
            exports: {}
        },
        a(b, b.exports),
        b.exports
    }(function(a, b) {
        b = function() {
            this._tweens = {};
            this._tweensAddedDuringUpdate = {}
        }
        ;
        b.prototype = {
            getAll: function() {
                return Object.keys(this._tweens).map(function(a) {
                    return this._tweens[a]
                }
                .bind(this))
            },
            removeAll: function() {
                this._tweens = {}
            },
            add: function(a) {
                this._tweens[a.getId()] = a;
                this._tweensAddedDuringUpdate[a.getId()] = a
            },
            remove: function(a) {
                delete this._tweens[a.getId()];
                delete this._tweensAddedDuringUpdate[a.getId()]
            },
            update: function(a, b) {
                var f = Object.keys(this._tweens);
                if (0 === f.length)
                    return !1;
                for (a = void 0 !== a ? a : e.now(); 0 < f.length; ) {
                    this._tweensAddedDuringUpdate = {};
                    for (var c = 0; c < f.length; c++) {
                        var m = this._tweens[f[c]];
                        m && !1 === m.update(a) && (m._isPlaying = !1,
                        b || delete this._tweens[f[c]])
                    }
                    f = Object.keys(this._tweensAddedDuringUpdate)
                }
                return !0
            }
        };
        var e = new b;
        e.Group = b;
        e._nextId = 0;
        e.nextId = function() {
            return e._nextId++
        }
        ;
        e.now = "undefined" === typeof self && "undefined" !== typeof process && process.hrtime ? function() {
            var a = process.hrtime();
            return 1E3 * a[0] + a[1] / 1E6
        }
        : "undefined" !== typeof self && void 0 !== self.performance && void 0 !== self.performance.now ? self.performance.now.bind(self.performance) : void 0 !== Date.now ? Date.now : function() {
            return (new Date).getTime()
        }
        ;
        e.Tween = function(a, b) {
            this._object = a;
            this._valuesStart = {};
            this._valuesEnd = {};
            this._valuesStartRepeat = {};
            this._duration = 1E3;
            this._repeat = 0;
            this._repeatDelayTime = void 0;
            this._reversed = this._isPlaying = this._yoyo = !1;
            this._delayTime = 0;
            this._startTime = null;
            this._easingFunction = e.Easing.Linear.None;
            this._interpolationFunction = e.Interpolation.Linear;
            this._chainedTweens = [];
            this._onStartCallback = null;
            this._onStartCallbackFired = !1;
            this._onStopCallback = this._onCompleteCallback = this._onRepeatCallback = this._onUpdateCallback = null;
            this._group = b || e;
            this._id = e.nextId()
        }
        ;
        e.Tween.prototype = {
            getId: function() {
                return this._id
            },
            isPlaying: function() {
                return this._isPlaying
            },
            to: function(a, b) {
                this._valuesEnd = Object.create(a);
                void 0 !== b && (this._duration = b);
                return this
            },
            duration: function(a) {
                this._duration = a;
                return this
            },
            start: function(a) {
                this._group.add(this);
                this._isPlaying = !0;
                this._onStartCallbackFired = !1;
                this._startTime = void 0 !== a ? "string" === typeof a ? e.now() + parseFloat(a) : a : e.now();
                this._startTime += this._delayTime;
                for (var b in this._valuesEnd) {
                    if (this._valuesEnd[b]instanceof Array) {
                        if (0 === this._valuesEnd[b].length)
                            continue;
                        this._valuesEnd[b] = [this._object[b]].concat(this._valuesEnd[b])
                    }
                    void 0 !== this._object[b] && (this._valuesStart[b] = this._object[b],
                    !1 === this._valuesStart[b]instanceof Array && (this._valuesStart[b] *= 1),
                    this._valuesStartRepeat[b] = this._valuesStart[b] || 0)
                }
                return this
            },
            stop: function() {
                if (!this._isPlaying)
                    return this;
                this._group.remove(this);
                this._isPlaying = !1;
                null !== this._onStopCallback && this._onStopCallback(this._object);
                this.stopChainedTweens();
                return this
            },
            end: function() {
                this.update(Infinity);
                return this
            },
            stopChainedTweens: function() {
                for (var a = 0, b = this._chainedTweens.length; a < b; a++)
                    this._chainedTweens[a].stop()
            },
            group: function(a) {
                this._group = a;
                return this
            },
            delay: function(a) {
                this._delayTime = a;
                return this
            },
            repeat: function(a) {
                this._repeat = a;
                return this
            },
            repeatDelay: function(a) {
                this._repeatDelayTime = a;
                return this
            },
            yoyo: function(a) {
                this._yoyo = a;
                return this
            },
            easing: function(a) {
                this._easingFunction = a;
                return this
            },
            interpolation: function(a) {
                this._interpolationFunction = a;
                return this
            },
            chain: function() {
                this._chainedTweens = arguments;
                return this
            },
            onStart: function(a) {
                this._onStartCallback = a;
                return this
            },
            onUpdate: function(a) {
                this._onUpdateCallback = a;
                return this
            },
            onRepeat: function(a) {
                this._onRepeatCallback = a;
                return this
            },
            onComplete: function(a) {
                this._onCompleteCallback = a;
                return this
            },
            onStop: function(a) {
                this._onStopCallback = a;
                return this
            },
            update: function(a) {
                var b;
                if (a < this._startTime)
                    return !0;
                !1 === this._onStartCallbackFired && (null !== this._onStartCallback && this._onStartCallback(this._object),
                this._onStartCallbackFired = !0);
                var f = (a - this._startTime) / this._duration;
                f = 0 === this._duration || 1 < f ? 1 : f;
                var e = this._easingFunction(f);
                for (b in this._valuesEnd)
                    if (void 0 !== this._valuesStart[b]) {
                        var c = this._valuesStart[b] || 0
                          , d = this._valuesEnd[b];
                        d instanceof Array ? this._object[b] = this._interpolationFunction(d, e) : ("string" === typeof d && (d = "+" === d.charAt(0) || "-" === d.charAt(0) ? c + parseFloat(d) : parseFloat(d)),
                        "number" === typeof d && (this._object[b] = c + (d - c) * e))
                    }
                null !== this._onUpdateCallback && this._onUpdateCallback(this._object, f);
                if (1 === f)
                    if (0 < this._repeat) {
                        isFinite(this._repeat) && this._repeat--;
                        for (b in this._valuesStartRepeat)
                            "string" === typeof this._valuesEnd[b] && (this._valuesStartRepeat[b] += parseFloat(this._valuesEnd[b])),
                            this._yoyo && (f = this._valuesStartRepeat[b],
                            this._valuesStartRepeat[b] = this._valuesEnd[b],
                            this._valuesEnd[b] = f),
                            this._valuesStart[b] = this._valuesStartRepeat[b];
                        this._yoyo && (this._reversed = !this._reversed);
                        this._startTime = void 0 !== this._repeatDelayTime ? a + this._repeatDelayTime : a + this._delayTime;
                        null !== this._onRepeatCallback && this._onRepeatCallback(this._object)
                    } else {
                        null !== this._onCompleteCallback && this._onCompleteCallback(this._object);
                        a = 0;
                        for (b = this._chainedTweens.length; a < b; a++)
                            this._chainedTweens[a].start(this._startTime + this._duration);
                        return !1
                    }
                return !0
            }
        };
        e.Easing = {
            Linear: {
                None: function(a) {
                    return a
                }
            },
            Quadratic: {
                In: function(a) {
                    return a * a
                },
                Out: function(a) {
                    return a * (2 - a)
                },
                InOut: function(a) {
                    return 1 > (a *= 2) ? .5 * a * a : -.5 * (--a * (a - 2) - 1)
                }
            },
            Cubic: {
                In: function(a) {
                    return a * a * a
                },
                Out: function(a) {
                    return --a * a * a + 1
                },
                InOut: function(a) {
                    return 1 > (a *= 2) ? .5 * a * a * a : .5 * ((a -= 2) * a * a + 2)
                }
            },
            Quartic: {
                In: function(a) {
                    return a * a * a * a
                },
                Out: function(a) {
                    return 1 - --a * a * a * a
                },
                InOut: function(a) {
                    return 1 > (a *= 2) ? .5 * a * a * a * a : -.5 * ((a -= 2) * a * a * a - 2)
                }
            },
            Quintic: {
                In: function(a) {
                    return a * a * a * a * a
                },
                Out: function(a) {
                    return --a * a * a * a * a + 1
                },
                InOut: function(a) {
                    return 1 > (a *= 2) ? .5 * a * a * a * a * a : .5 * ((a -= 2) * a * a * a * a + 2)
                }
            },
            Sinusoidal: {
                In: function(a) {
                    return 1 - Math.cos(a * Math.PI / 2)
                },
                Out: function(a) {
                    return Math.sin(a * Math.PI / 2)
                },
                InOut: function(a) {
                    return .5 * (1 - Math.cos(Math.PI * a))
                }
            },
            Exponential: {
                In: function(a) {
                    return 0 === a ? 0 : Math.pow(1024, a - 1)
                },
                Out: function(a) {
                    return 1 === a ? 1 : 1 - Math.pow(2, -10 * a)
                },
                InOut: function(a) {
                    return 0 === a ? 0 : 1 === a ? 1 : 1 > (a *= 2) ? .5 * Math.pow(1024, a - 1) : .5 * (-Math.pow(2, -10 * (a - 1)) + 2)
                }
            },
            Circular: {
                In: function(a) {
                    return 1 - Math.sqrt(1 - a * a)
                },
                Out: function(a) {
                    return Math.sqrt(1 - --a * a)
                },
                InOut: function(a) {
                    return 1 > (a *= 2) ? -.5 * (Math.sqrt(1 - a * a) - 1) : .5 * (Math.sqrt(1 - (a -= 2) * a) + 1)
                }
            },
            Elastic: {
                In: function(a) {
                    return 0 === a ? 0 : 1 === a ? 1 : -Math.pow(2, 10 * (a - 1)) * Math.sin(5 * (a - 1.1) * Math.PI)
                },
                Out: function(a) {
                    return 0 === a ? 0 : 1 === a ? 1 : Math.pow(2, -10 * a) * Math.sin(5 * (a - .1) * Math.PI) + 1
                },
                InOut: function(a) {
                    if (0 === a)
                        return 0;
                    if (1 === a)
                        return 1;
                    a *= 2;
                    return 1 > a ? -.5 * Math.pow(2, 10 * (a - 1)) * Math.sin(5 * (a - 1.1) * Math.PI) : .5 * Math.pow(2, -10 * (a - 1)) * Math.sin(5 * (a - 1.1) * Math.PI) + 1
                }
            },
            Back: {
                In: function(a) {
                    return a * a * (2.70158 * a - 1.70158)
                },
                Out: function(a) {
                    return --a * a * (2.70158 * a + 1.70158) + 1
                },
                InOut: function(a) {
                    return 1 > (a *= 2) ? .5 * a * a * (3.5949095 * a - 2.5949095) : .5 * ((a -= 2) * a * (3.5949095 * a + 2.5949095) + 2)
                }
            },
            Bounce: {
                In: function(a) {
                    return 1 - e.Easing.Bounce.Out(1 - a)
                },
                Out: function(a) {
                    return a < 1 / 2.75 ? 7.5625 * a * a : a < 2 / 2.75 ? 7.5625 * (a -= 1.5 / 2.75) * a + .75 : a < 2.5 / 2.75 ? 7.5625 * (a -= 2.25 / 2.75) * a + .9375 : 7.5625 * (a -= 2.625 / 2.75) * a + .984375
                },
                InOut: function(a) {
                    return .5 > a ? .5 * e.Easing.Bounce.In(2 * a) : .5 * e.Easing.Bounce.Out(2 * a - 1) + .5
                }
            }
        };
        e.Interpolation = {
            Linear: function(a, b) {
                var f = a.length - 1
                  , c = f * b
                  , d = Math.floor(c)
                  , m = e.Interpolation.Utils.Linear;
                return 0 > b ? m(a[0], a[1], c) : 1 < b ? m(a[f], a[f - 1], f - c) : m(a[d], a[d + 1 > f ? f : d + 1], c - d)
            },
            Bezier: function(a, b) {
                for (var f = 0, c = a.length - 1, d = Math.pow, m = e.Interpolation.Utils.Bernstein, g = 0; g <= c; g++)
                    f += d(1 - b, c - g) * d(b, g) * a[g] * m(c, g);
                return f
            },
            CatmullRom: function(a, b) {
                var f = a.length - 1
                  , c = f * b
                  , d = Math.floor(c)
                  , m = e.Interpolation.Utils.CatmullRom;
                return a[0] === a[f] ? (0 > b && (d = Math.floor(c = f * (1 + b))),
                m(a[(d - 1 + f) % f], a[d], a[(d + 1) % f], a[(d + 2) % f], c - d)) : 0 > b ? a[0] - (m(a[0], a[0], a[1], a[1], -c) - a[0]) : 1 < b ? a[f] - (m(a[f], a[f], a[f - 1], a[f - 1], c - f) - a[f]) : m(a[d ? d - 1 : 0], a[d], a[f < d + 1 ? f : d + 1], a[f < d + 2 ? f : d + 2], c - d)
            },
            Utils: {
                Linear: function(a, b, e) {
                    return (b - a) * e + a
                },
                Bernstein: function(a, b) {
                    var f = e.Interpolation.Utils.Factorial;
                    return f(a) / f(b) / f(a - b)
                },
                Factorial: function() {
                    var a = [1];
                    return function(b) {
                        var e = 1;
                        if (a[b])
                            return a[b];
                        for (var f = b; 1 < f; f--)
                            e *= f;
                        return a[b] = e
                    }
                }(),
                CatmullRom: function(a, b, e, c, d) {
                    a = .5 * (e - a);
                    c = .5 * (c - b);
                    var f = d * d;
                    return (2 * b - 2 * e + a + c) * d * f + (-3 * b + 3 * e - 2 * a - c) * f + a * d + b
                }
            }
        };
        a.exports = e
    });
    v.prototype = Object.assign(Object.create(c.Sprite.prototype), {
        constructor: v,
        setContainer: function(a) {
            if (a instanceof HTMLElement)
                var b = a;
            else
                a && a.container && (b = a.container);
            b && this.element && b.appendChild(this.element);
            this.container = b
        },
        getContainer: function() {
            return this.container
        },
        onClick: function(a) {
            this.element && this.getContainer() && (this.onHoverStart(a),
            this.lockHoverElement())
        },
        onDismiss: function() {
            this.element && (this.unlockHoverElement(),
            this.onHoverEnd())
        },
        onHover: function() {},
        onHoverStart: function(a) {
            if (this.getContainer()) {
                var b = this.cursorStyle || (this.mode === z.NORMAL ? "pointer" : "default")
                  , e = this.scaleDownAnimation
                  , f = this.scaleUpAnimation
                  , c = this.element;
                this.isHovering = !0;
                this.container.style.cursor = b;
                this.animated && (e.stop(),
                f.start());
                c && 0 <= a.mouseEvent.clientX && 0 <= a.mouseEvent.clientY && (a = c.left,
                b = c.right,
                e = c.style,
                this.mode === z.CARDBOARD || this.mode === z.STEREO ? (e.display = "none",
                a.style.display = "block",
                b.style.display = "block",
                c._width = a.clientWidth,
                c._height = a.clientHeight) : (e.display = "block",
                a && (a.style.display = "none"),
                b && (b.style.display = "none"),
                c._width = c.clientWidth,
                c._height = c.clientHeight))
            }
        },
        onHoverEnd: function() {
            if (this.getContainer()) {
                var a = this.scaleDownAnimation
                  , b = this.scaleUpAnimation
                  , e = this.element;
                this.isHovering = !1;
                this.container.style.cursor = "default";
                this.animated && (b.stop(),
                a.start());
                e && !this.element.locked && (a = e.left,
                b = e.right,
                e.style.display = "none",
                a && (a.style.display = "none"),
                b && (b.style.display = "none"),
                this.unlockHoverElement())
            }
        },
        onDualEyeEffect: function(a) {
            if (this.getContainer()) {
                this.mode = a.mode;
                a = this.element;
                var b = this.container.clientWidth / 2;
                var e = this.container.clientHeight / 2;
                a && (a.left || a.right || (a.left = a.cloneNode(!0),
                a.right = a.cloneNode(!0)),
                this.mode === z.CARDBOARD || this.mode === z.STEREO ? (a.left.style.display = a.style.display,
                a.right.style.display = a.style.display,
                a.style.display = "none") : (a.style.display = a.left.style.display,
                a.left.style.display = "none",
                a.right.style.display = "none"),
                this.translateElement(b, e),
                this.container.appendChild(a.left),
                this.container.appendChild(a.right))
            }
        },
        translateElement: function(a, b) {
            if (this.element._width && this.element._height && this.getContainer()) {
                var e = this.container;
                var f = this.element;
                var c = f._width / 2;
                var d = f._height / 2;
                var g = void 0 !== f.verticalDelta ? f.verticalDelta : 40;
                var k = a - c;
                var l = b - d - g;
                this.mode !== z.CARDBOARD && this.mode !== z.STEREO || !f.left || !f.right || a === e.clientWidth / 2 && b === e.clientHeight / 2 ? this.setElementStyle("transform", f, "translate(" + k + "px, " + l + "px)") : (k = e.clientWidth / 4 - c + (a - e.clientWidth / 2),
                l = e.clientHeight / 2 - d - g + (b - e.clientHeight / 2),
                this.setElementStyle("transform", f.left, "translate(" + k + "px, " + l + "px)"),
                k += e.clientWidth / 2,
                this.setElementStyle("transform", f.right, "translate(" + k + "px, " + l + "px)"))
            }
        },
        setElementStyle: function(a, b, e) {
            b = b.style;
            "transform" === a && (b.webkitTransform = b.msTransform = b.transform = e)
        },
        setText: function(a) {
            this.element && (this.element.textContent = a)
        },
        setCursorHoverStyle: function(a) {
            this.cursorStyle = a
        },
        addHoverText: function(a, b) {
            b = void 0 === b ? 40 : b;
            this.element || (this.element = document.createElement("div"),
            this.element.style.display = "none",
            this.element.style.color = "#fff",
            this.element.style.top = 0,
            this.element.style.maxWidth = "50%",
            this.element.style.maxHeight = "50%",
            this.element.style.textShadow = "0 0 3px #000000",
            this.element.style.fontFamily = '"Trebuchet MS", Helvetica, sans-serif',
            this.element.style.position = "absolute",
            this.element.classList.add("panolens-infospot"),
            this.element.verticalDelta = b);
            this.setText(a)
        },
        addHoverElement: function(a, b) {
            b = void 0 === b ? 40 : b;
            this.element || (this.element = a.cloneNode(!0),
            this.element.style.display = "none",
            this.element.style.top = 0,
            this.element.style.position = "absolute",
            this.element.classList.add("panolens-infospot"),
            this.element.verticalDelta = b)
        },
        removeHoverElement: function() {
            this.element && (this.element.left && (this.container.removeChild(this.element.left),
            this.element.left = null),
            this.element.right && (this.container.removeChild(this.element.right),
            this.element.right = null),
            this.container.removeChild(this.element),
            this.element = null)
        },
        lockHoverElement: function() {
            this.element && (this.element.locked = !0)
        },
        unlockHoverElement: function() {
            this.element && (this.element.locked = !1)
        },
        enableRaycast: function(a) {
            this.raycast = void 0 === a || a ? this.originalRaycast : function() {}
        },
        show: function(a) {
            a = void 0 === a ? 0 : a;
            var b = this.hideAnimation
              , e = this.showAnimation
              , f = this.material;
            this.animated ? (b.stop(),
            e.delay(a).start()) : (this.enableRaycast(!0),
            f.opacity = 1)
        },
        hide: function(a) {
            a = void 0 === a ? 0 : a;
            var b = this.hideAnimation
              , e = this.showAnimation
              , f = this.material;
            this.animated ? (e.stop(),
            b.delay(a).start()) : (this.enableRaycast(!1),
            f.opacity = 0)
        },
        setFocusMethod: function(a) {
            a && (this.HANDLER_FOCUS = a.method)
        },
        focus: function(a, b) {
            this.HANDLER_FOCUS && (this.HANDLER_FOCUS(this.position, a, b),
            this.onDismiss())
        },
        dispose: function() {
            var a = this.geometry
              , b = this.material
              , e = b.map;
            this.removeHoverElement();
            this.parent && this.parent.remove(this);
            e && (e.dispose(),
            b.map = null);
            a && (a.dispose(),
            this.geometry = null);
            b && (b.dispose(),
            this.material = null)
        }
    });
    S.prototype = Object.assign(Object.create(c.EventDispatcher.prototype), {
        constructor: S,
        addControlBar: function() {
            if (this.container) {
                var a = this
                  , b = document.createElement("div");
                b.style.width = "100%";
                b.style.height = "44px";
                b.style.float = "left";
                b.style.transform = b.style.webkitTransform = b.style.msTransform = "translateY(-100%)";
                b.style.background = "-webkit-linear-gradient(bottom, rgba(0,0,0,0.2), rgba(0,0,0,0))";
                b.style.background = "-moz-linear-gradient(bottom, rgba(0,0,0,0.2), rgba(0,0,0,0))";
                b.style.background = "-o-linear-gradient(bottom, rgba(0,0,0,0.2), rgba(0,0,0,0))";
                b.style.background = "-ms-linear-gradient(bottom, rgba(0,0,0,0.2), rgba(0,0,0,0))";
                b.style.background = "linear-gradient(bottom, rgba(0,0,0,0.2), rgba(0,0,0,0))";
                b.style.transition = this.DEFAULT_TRANSITION;
                b.style.pointerEvents = "none";
                b.isHidden = !1;
                b.toggle = function() {
                    b.isHidden = !b.isHidden;
                    var a = b.isHidden ? 0 : 1;
                    b.style.transform = b.style.webkitTransform = b.style.msTransform = b.isHidden ? "translateY(0)" : "translateY(-100%)";
                    b.style.opacity = a
                }
                ;
                var e = this.createDefaultMenu();
                this.mainMenu = this.createMainMenu(e);
                b.appendChild(this.mainMenu);
                this.mask = e = this.createMask();
                this.container.appendChild(e);
                b.dispose = function() {
                    a.fullscreenElement && (b.removeChild(a.fullscreenElement),
                    a.fullscreenElement.dispose(),
                    a.fullscreenElement = null);
                    a.settingElement && (b.removeChild(a.settingElement),
                    a.settingElement.dispose(),
                    a.settingElement = null);
                    a.videoElement && (b.removeChild(a.videoElement),
                    a.videoElement.dispose(),
                    a.videoElement = null)
                }
                ;
                this.container.appendChild(b);
                this.mask.addEventListener("mousemove", this.PREVENT_EVENT_HANDLER, !0);
                this.mask.addEventListener("mouseup", this.PREVENT_EVENT_HANDLER, !0);
                this.mask.addEventListener("mousedown", this.PREVENT_EVENT_HANDLER, !0);
                this.mask.addEventListener(a.TOUCH_ENABLED ? "touchend" : "click", function(b) {
                    b.preventDefault();
                    b.stopPropagation();
                    a.mask.hide();
                    a.settingElement.deactivate()
                }, !1);
                this.addEventListener("control-bar-toggle", b.toggle);
                this.barElement = b
            } else
                console.warn("Widget container not set")
        },
        createDefaultMenu: function() {
            var a = this
              , b = function(b, f) {
                return function() {
                    a.dispatchEvent({
                        type: g.VIEWER_HANDLER,
                        method: b,
                        data: f
                    })
                }
            };
            return [{
                title: "Control",
                subMenu: [{
                    title: this.TOUCH_ENABLED ? "Touch" : "Mouse",
                    handler: b("enableControl", M.ORBIT)
                }, {
                    title: "Sensor",
                    handler: b("enableControl", M.DEVICEORIENTATION)
                }]
            }, {
                title: "Mode",
                subMenu: [{
                    title: "Normal",
                    handler: b("disableEffect")
                }, {
                    title: "Cardboard",
                    handler: b("enableEffect", z.CARDBOARD)
                }, {
                    title: "Stereoscopic",
                    handler: b("enableEffect", z.STEREO)
                }]
            }]
        },
        addControlButton: function(a) {
            switch (a) {
            case "fullscreen":
                this.fullscreenElement = a = this.createFullscreenButton();
                break;
            case "setting":
                this.settingElement = a = this.createSettingButton();
                break;
            case "video":
                this.videoElement = a = this.createVideoControl();
                break;
            default:
                return
            }
            a && this.barElement.appendChild(a)
        },
        createMask: function() {
            var a = document.createElement("div");
            a.style.position = "absolute";
            a.style.top = 0;
            a.style.left = 0;
            a.style.width = "100%";
            a.style.height = "100%";
            a.style.background = "transparent";
            a.style.display = "none";
            a.show = function() {
                this.style.display = "block"
            }
            ;
            a.hide = function() {
                this.style.display = "none"
            }
            ;
            return a
        },
        createSettingButton: function() {
            var a = this;
            var b = this.createCustomItem({
                style: {
                    backgroundImage: 'url("' + C.Setting + '")',
                    webkitTransition: this.DEFAULT_TRANSITION,
                    transition: this.DEFAULT_TRANSITION
                },
                onTap: function(b) {
                    b.preventDefault();
                    b.stopPropagation();
                    a.mainMenu.toggle();
                    this.activated ? this.deactivate() : this.activate()
                }
            });
            b.activate = function() {
                this.style.transform = "rotate3d(0,0,1,90deg)";
                this.activated = !0;
                a.mask.show()
            }
            ;
            b.deactivate = function() {
                this.style.transform = "rotate3d(0,0,0,0)";
                this.activated = !1;
                a.mask.hide();
                a.mainMenu && a.mainMenu.visible && a.mainMenu.hide();
                a.activeSubMenu && a.activeSubMenu.visible && a.activeSubMenu.hide();
                a.mainMenu && a.mainMenu._width && (a.mainMenu.changeSize(a.mainMenu._width),
                a.mainMenu.unslideAll())
            }
            ;
            b.activated = !1;
            return b
        },
        createFullscreenButton: function() {
            function a() {
                f && (e = !e,
                d.style.backgroundImage = e ? 'url("' + C.FullscreenLeave + '")' : 'url("' + C.FullscreenEnter + '")');
                b.dispatchEvent({
                    type: g.VIEWER_HANDLER,
                    method: "onWindowResize"
                });
                f = !0
            }
            var b = this
              , e = !1
              , f = !0
              , c = this.container;
            if (document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled) {
                document.addEventListener("fullscreenchange", a, !1);
                document.addEventListener("webkitfullscreenchange", a, !1);
                document.addEventListener("mozfullscreenchange", a, !1);
                document.addEventListener("MSFullscreenChange", a, !1);
                var d = this.createCustomItem({
                    style: {
                        backgroundImage: 'url("' + C.FullscreenEnter + '")'
                    },
                    onTap: function(a) {
                        a.preventDefault();
                        a.stopPropagation();
                        f = !1;
                        e ? (document.exitFullscreen && document.exitFullscreen(),
                        document.msExitFullscreen && document.msExitFullscreen(),
                        document.mozCancelFullScreen && document.mozCancelFullScreen(),
                        document.webkitExitFullscreen && document.webkitExitFullscreen(),
                        e = !1) : (c.requestFullscreen && c.requestFullscreen(),
                        c.msRequestFullscreen && c.msRequestFullscreen(),
                        c.mozRequestFullScreen && c.mozRequestFullScreen(),
                        c.webkitRequestFullscreen && c.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT),
                        e = !0);
                        this.style.backgroundImage = e ? 'url("' + C.FullscreenLeave + '")' : 'url("' + C.FullscreenEnter + '")'
                    }
                });
                if (!document.querySelector("panolens-style-addon")) {
                    var k = document.createElement("style");
                    k.id = "panolens-style-addon";
                    k.innerHTML = ":-webkit-full-screen { width: 100% !important; height: 100% !important }";
                    document.head.appendChild(k)
                }
                return d
            }
        },
        createVideoControl: function() {
            var a = document.createElement("span");
            a.style.display = "none";
            a.show = function() {
                a.style.display = ""
            }
            ;
            a.hide = function() {
                a.style.display = "none";
                a.controlButton.paused = !0;
                a.controlButton.update()
            }
            ;
            a.controlButton = this.createVideoControlButton();
            a.seekBar = this.createVideoControlSeekbar();
            a.appendChild(a.controlButton);
            a.appendChild(a.seekBar);
            a.dispose = function() {
                a.removeChild(a.controlButton);
                a.removeChild(a.seekBar);
                a.controlButton.dispose();
                a.controlButton = null;
                a.seekBar.dispose();
                a.seekBar = null
            }
            ;
            this.addEventListener("video-control-show", a.show);
            this.addEventListener("video-control-hide", a.hide);
            return a
        },
        createVideoControlButton: function() {
            var a = this
              , b = this.createCustomItem({
                style: {
                    float: "left",
                    backgroundImage: 'url("' + C.VideoPlay + '")'
                },
                onTap: function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    a.dispatchEvent({
                        type: g.VIEWER_HANDLER,
                        method: "toggleVideoPlay",
                        data: !this.paused
                    });
                    this.paused = !this.paused;
                    b.update()
                }
            });
            b.paused = !0;
            b.update = function(a) {
                this.paused = void 0 !== a ? a : this.paused;
                this.style.backgroundImage = 'url("' + (this.paused ? C.VideoPlay : C.VideoPause) + '")'
            }
            ;
            return b
        },
        createVideoControlSeekbar: function() {
            function a(a) {
                a.stopPropagation();
                d = !0;
                k = a.clientX || a.changedTouches && a.changedTouches[0].clientX;
                l = parseInt(p.style.width) / 100;
                c.container.addEventListener("mousemove", b, {
                    passive: !0
                });
                c.container.addEventListener("mouseup", e, {
                    passive: !0
                });
                c.container.addEventListener("touchmove", b, {
                    passive: !0
                });
                c.container.addEventListener("touchend", e, {
                    passive: !0
                })
            }
            function b(a) {
                d && (n = ((a.clientX || a.changedTouches && a.changedTouches[0].clientX) - k) / h.clientWidth,
                n = l + n,
                n = 1 < n ? 1 : 0 > n ? 0 : n,
                h.setProgress(n),
                c.dispatchEvent({
                    type: g.VIEWER_HANDLER,
                    method: "setVideoCurrentTime",
                    data: n
                }))
            }
            function e(a) {
                a.stopPropagation();
                d = !1;
                f()
            }
            function f() {
                c.container.removeEventListener("mousemove", b, !1);
                c.container.removeEventListener("mouseup", e, !1);
                c.container.removeEventListener("touchmove", b, !1);
                c.container.removeEventListener("touchend", e, !1)
            }
            var c = this, d = !1, k, l, n;
            var p = document.createElement("div");
            p.style.width = "0%";
            p.style.height = "100%";
            p.style.backgroundColor = "#fff";
            var q = document.createElement("div");
            q.style.float = "right";
            q.style.width = "14px";
            q.style.height = "14px";
            q.style.transform = "translate(7px, -5px)";
            q.style.borderRadius = "50%";
            q.style.backgroundColor = "#ddd";
            q.addEventListener("mousedown", a, {
                passive: !0
            });
            q.addEventListener("touchstart", a, {
                passive: !0
            });
            p.appendChild(q);
            var h = this.createCustomItem({
                style: {
                    float: "left",
                    width: "30%",
                    height: "4px",
                    marginTop: "20px",
                    backgroundColor: "rgba(188,188,188,0.8)"
                },
                onTap: function(a) {
                    a.preventDefault();
                    a.stopPropagation();
                    if (a.target !== q) {
                        var b = a.changedTouches && 0 < a.changedTouches.length ? (a.changedTouches[0].pageX - a.target.getBoundingClientRect().left) / this.clientWidth : a.offsetX / this.clientWidth;
                        c.dispatchEvent({
                            type: g.VIEWER_HANDLER,
                            method: "setVideoCurrentTime",
                            data: b
                        });
                        h.setProgress(a.offsetX / this.clientWidth)
                    }
                },
                onDispose: function() {
                    f();
                    q = p = null
                }
            });
            h.appendChild(p);
            h.setProgress = function(a) {
                p.style.width = 100 * a + "%"
            }
            ;
            this.addEventListener("video-update", function(a) {
                h.setProgress(a.percentage)
            });
            h.progressElement = p;
            h.progressElementControl = q;
            return h
        },
        createMenuItem: function(a) {
            var b = this
              , e = document.createElement("a");
            e.textContent = a;
            e.style.display = "block";
            e.style.padding = "10px";
            e.style.textDecoration = "none";
            e.style.cursor = "pointer";
            e.style.pointerEvents = "auto";
            e.style.transition = this.DEFAULT_TRANSITION;
            e.slide = function(a) {
                this.style.transform = "translateX(" + (a ? "" : "-") + "100%)"
            }
            ;
            e.unslide = function() {
                this.style.transform = "translateX(0)"
            }
            ;
            e.setIcon = function(a) {
                this.icon && (this.icon.style.backgroundImage = "url(" + a + ")")
            }
            ;
            e.setSelectionTitle = function(a) {
                this.selection && (this.selection.textContent = a)
            }
            ;
            e.addSelection = function(a) {
                var b = document.createElement("span");
                b.style.fontSize = "13px";
                b.style.fontWeight = "300";
                b.style.float = "right";
                this.selection = b;
                this.setSelectionTitle(a);
                this.appendChild(b);
                return this
            }
            ;
            e.addIcon = function(a, b, e) {
                a = void 0 === a ? C.ChevronRight : a;
                b = void 0 === b ? !1 : b;
                e = void 0 === e ? !1 : e;
                var c = document.createElement("span");
                c.style.float = b ? "left" : "right";
                c.style.width = "17px";
                c.style.height = "17px";
                c.style["margin" + (b ? "Right" : "Left")] = "12px";
                c.style.backgroundSize = "cover";
                e && (c.style.transform = "rotateZ(180deg)");
                this.icon = c;
                this.setIcon(a);
                this.appendChild(c);
                return this
            }
            ;
            e.addSubMenu = function(a, e) {
                this.subMenu = b.createSubMenu(a, e);
                return this
            }
            ;
            e.addEventListener("mouseenter", function() {
                this.style.backgroundColor = "#e0e0e0"
            }, !1);
            e.addEventListener("mouseleave", function() {
                this.style.backgroundColor = "#fafafa"
            }, !1);
            return e
        },
        createMenuItemHeader: function(a) {
            a = this.createMenuItem(a);
            a.style.borderBottom = "1px solid #333";
            a.style.paddingBottom = "15px";
            return a
        },
        createMainMenu: function(a) {
            function b(a) {
                a.preventDefault();
                a.stopPropagation();
                var b = e.mainMenu
                  , c = this.subMenu;
                b.hide();
                b.slideAll();
                b.parentElement.appendChild(c);
                e.activeMainItem = this;
                e.activeSubMenu = c;
                window.requestAnimationFrame(function() {
                    b.changeSize(c.clientWidth);
                    c.show();
                    c.unslideAll()
                })
            }
            var e = this
              , c = this.createMenu();
            c._width = 200;
            c.changeSize(c._width);
            for (var d = 0; d < a.length; d++) {
                var g = c.addItem(a[d].title);
                g.style.paddingLeft = "20px";
                g.addIcon().addEventListener(e.TOUCH_ENABLED ? "touchend" : "click", b, !1);
                a[d].subMenu && 0 < a[d].subMenu.length && g.addSelection(a[d].subMenu[0].title).addSubMenu(a[d].title, a[d].subMenu)
            }
            return c
        },
        createSubMenu: function(a, b) {
            function e(a) {
                a.preventDefault();
                a.stopPropagation();
                d = c.mainMenu;
                d.changeSize(d._width);
                d.unslideAll();
                d.show();
                g.slideAll(!0);
                g.hide();
                "header" !== this.type && (g.setActiveItem(this),
                c.activeMainItem.setSelectionTitle(this.textContent),
                this.handler && this.handler())
            }
            var c = this, d, g = this.createMenu();
            g.items = b;
            g.activeItem = null;
            g.addHeader(a).addIcon(void 0, !0, !0).addEventListener(c.TOUCH_ENABLED ? "touchend" : "click", e, !1);
            for (a = 0; a < b.length; a++) {
                var k = g.addItem(b[a].title);
                k.style.fontWeight = 300;
                k.handler = b[a].handler;
                k.addIcon(" ", !0);
                k.addEventListener(c.TOUCH_ENABLED ? "touchend" : "click", e, !1);
                g.activeItem || g.setActiveItem(k)
            }
            g.slideAll(!0);
            return g
        },
        createMenu: function() {
            var a = this
              , b = document.createElement("span")
              , e = b.style;
            e.padding = "5px 0";
            e.position = "fixed";
            e.bottom = "100%";
            e.right = "14px";
            e.backgroundColor = "#fafafa";
            e.fontFamily = "Helvetica Neue";
            e.fontSize = "14px";
            e.visibility = "hidden";
            e.opacity = 0;
            e.boxShadow = "0 0 12pt rgba(0,0,0,0.25)";
            e.borderRadius = "2px";
            e.overflow = "hidden";
            e.willChange = "width, height, opacity";
            e.pointerEvents = "auto";
            e.transition = this.DEFAULT_TRANSITION;
            b.visible = !1;
            b.changeSize = function(a, b) {
                a && (this.style.width = a + "px");
                b && (this.style.height = b + "px")
            }
            ;
            b.show = function() {
                this.style.opacity = 1;
                this.style.visibility = "visible";
                this.visible = !0
            }
            ;
            b.hide = function() {
                this.style.opacity = 0;
                this.style.visibility = "hidden";
                this.visible = !1
            }
            ;
            b.toggle = function() {
                this.visible ? this.hide() : this.show()
            }
            ;
            b.slideAll = function(a) {
                for (var e = 0; e < b.children.length; e++)
                    b.children[e].slide && b.children[e].slide(a)
            }
            ;
            b.unslideAll = function() {
                for (var a = 0; a < b.children.length; a++)
                    b.children[a].unslide && b.children[a].unslide()
            }
            ;
            b.addHeader = function(b) {
                b = a.createMenuItemHeader(b);
                b.type = "header";
                this.appendChild(b);
                return b
            }
            ;
            b.addItem = function(b) {
                b = a.createMenuItem(b);
                b.type = "item";
                this.appendChild(b);
                return b
            }
            ;
            b.setActiveItem = function(a) {
                this.activeItem && this.activeItem.setIcon(" ");
                a.setIcon(C.Check);
                this.activeItem = a
            }
            ;
            b.addEventListener("mousemove", this.PREVENT_EVENT_HANDLER, !0);
            b.addEventListener("mouseup", this.PREVENT_EVENT_HANDLER, !0);
            b.addEventListener("mousedown", this.PREVENT_EVENT_HANDLER, !0);
            return b
        },
        createCustomItem: function(a) {
            a = void 0 === a ? {} : a;
            var b = this
              , e = a.element || document.createElement("span")
              , c = a.onDispose;
            e.style.cursor = "pointer";
            e.style.float = "right";
            e.style.width = "44px";
            e.style.height = "100%";
            e.style.backgroundSize = "60%";
            e.style.backgroundRepeat = "no-repeat";
            e.style.backgroundPosition = "center";
            e.style.webkitUserSelect = e.style.MozUserSelect = e.style.userSelect = "none";
            e.style.position = "relative";
            e.style.pointerEvents = "auto";
            e.addEventListener(b.TOUCH_ENABLED ? "touchstart" : "mouseenter", function() {
                e.style.filter = e.style.webkitFilter = "drop-shadow(0 0 5px rgba(255,255,255,1))"
            }, {
                passive: !0
            });
            e.addEventListener(b.TOUCH_ENABLED ? "touchend" : "mouseleave", function() {
                e.style.filter = e.style.webkitFilter = ""
            }, {
                passive: !0
            });
            this.mergeStyleOptions(e, a.style);
            a.onTap && e.addEventListener(b.TOUCH_ENABLED ? "touchend" : "click", a.onTap, !1);
            e.dispose = function() {
                e.removeEventListener(b.TOUCH_ENABLED ? "touchend" : "click", a.onTap, !1);
                if (c)
                    a.onDispose()
            }
            ;
            return e
        },
        mergeStyleOptions: function(a, b) {
            b = void 0 === b ? {} : b;
            for (var e in b)
                b.hasOwnProperty(e) && (a.style[e] = b[e]);
            return a
        },
        dispose: function() {
            this.barElement && (this.container.removeChild(this.barElement),
            this.barElement.dispose(),
            this.barElement = null)
        }
    });
    var Aa = {
        texture: {
            value: new c.Texture
        },
        repeat: {
            value: new c.Vector2(1,1)
        },
        offset: {
            value: new c.Vector2(0,0)
        },
        opacity: {
            value: 1
        }
    };
    k.prototype = Object.assign(Object.create(c.Mesh.prototype), {
        constructor: k,
        createGeometry: function(a) {
            return new c.BoxBufferGeometry(a,a,a)
        },
        createMaterial: function(a, b) {
            a = void 0 === a ? new c.Vector2(1,1) : a;
            b = void 0 === b ? new c.Vector2(0,0) : b;
            var e = c.UniformsUtils.clone(Aa);
            e.repeat.value.copy(a);
            e.offset.value.copy(b);
            e.opacity.value = 0;
            return new c.ShaderMaterial({
                fragmentShader: "\n        uniform sampler2D texture;\n        uniform vec2 repeat;\n        uniform vec2 offset;\n        uniform float opacity;\n        varying vec3 vWorldDirection;\n        #include <common>\n        void main() {\n            vec3 direction = normalize( vWorldDirection );\n            vec2 sampleUV;\n            sampleUV.y = asin( clamp( direction.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;\n            sampleUV.x = atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.5;\n            sampleUV *= repeat;\n            sampleUV += offset;\n            sampleUV.x = fract(sampleUV.x);\n            sampleUV.y = fract(sampleUV.y);\n            gl_FragColor = vec4(texture2D( texture, sampleUV ).rgb, opacity);\n        }\n    ",
                vertexShader: "\n        varying vec3 vWorldDirection;\n        #include <common>\n        void main() {\n            vWorldDirection = transformDirection( position, modelMatrix );\n            #include <begin_vertex>\n            #include <project_vertex>\n        }\n    ",
                uniforms: e,
                side: c.BackSide,
                transparent: !0
            })
        },
        add: function(a) {
            if (1 < arguments.length) {
                for (var b = 0; b < arguments.length; b++)
                    this.add(arguments[b]);
                return this
            }
            a instanceof v && ((b = this.container) && a.dispatchEvent({
                type: g.CONTAINER,
                container: b
            }),
            a.dispatchEvent({
                type: "panolens-infospot-focus",
                method: function(a, b, c) {
                    this.dispatchEvent({
                        type: g.VIEWER_HANDLER,
                        method: "tweenControlCenter",
                        data: [a, b, c]
                    })
                }
                .bind(this)
            }));
            c.Object3D.prototype.add.call(this, a)
        },
        getTexture: function() {
            return this.material.uniforms.texture.value
        },
        load: function(a) {
            a = void 0 === a ? !0 : a;
            this.dispatchEvent({
                type: g.LOAD_START
            });
            if (a)
                this.onLoad()
        },
        onClick: function(a) {
            a.intersects && 0 === a.intersects.length && this.traverse(function(a) {
                a.dispatchEvent({
                    type: "dismiss"
                })
            })
        },
        setContainer: function(a) {
            if (a instanceof HTMLElement)
                var b = a;
            else
                a && a.container && (b = a.container);
            b && (this.children.forEach(function(a) {
                a instanceof v && a.dispatchEvent && a.dispatchEvent({
                    type: g.CONTAINER,
                    container: b
                })
            }),
            this.container = b)
        },
        onLoad: function() {
            this.loaded = !0;
            this.dispatchEvent({
                type: g.LOADED
            });
            this.dispatchEvent({
                type: g.LOAD
            });
            this.dispatchEvent({
                type: g.READY
            })
        },
        onProgress: function(a) {
            this.dispatchEvent({
                type: g.PROGRESS,
                progress: a
            })
        },
        onError: function() {
            this.dispatchEvent({
                type: g.READY
            })
        },
        getZoomLevel: function() {
            return 800 >= window.innerWidth ? this.ImageQualityFair : 800 < window.innerWidth && 1280 >= window.innerWidth ? this.ImageQualityMedium : 1280 < window.innerWidth && 1920 >= window.innerWidth ? this.ImageQualityHigh : 1920 < window.innerWidth ? this.ImageQualitySuperHigh : this.ImageQualityLow
        },
        updateTexture: function(a) {
            this.material.uniforms.texture.value = a
        },
        toggleInfospotVisibility: function(a, b) {
            b = void 0 !== b ? b : 0;
            var e = void 0 !== a ? a : this.isInfospotVisible ? !1 : !0;
            this.traverse(function(a) {
                a instanceof v && (e ? a.show(b) : a.hide(b))
            });
            this.isInfospotVisible = e;
            this.infospotAnimation.onComplete(function() {
                this.dispatchEvent({
                    type: g.INFOSPOT_ANIMATION_COMPLETE,
                    visible: e
                })
            }
            .bind(this)).delay(b).start()
        },
        setLinkingImage: function(a, b) {
            this.linkingImageURL = a;
            this.linkingImageScale = b
        },
        link: function(a, b, e, c) {
            this.visible = !0;
            b ? (e = void 0 !== e ? e : void 0 !== a.linkingImageScale ? a.linkingImageScale : 300,
            c = c ? c : a.linkingImageURL ? a.linkingImageURL : C.Arrow,
            c = new v(e,c),
            c.position.copy(b),
            c.toPanorama = a,
            c.addEventListener("click", function() {
                this.dispatchEvent({
                    type: g.VIEWER_HANDLER,
                    method: "setPanorama",
                    data: a
                })
            }
            .bind(this)),
            this.linkedSpots.push(c),
            this.add(c),
            this.visible = !1) : console.warn("Please specify infospot position for linking")
        },
        reset: function() {
            this.children.length = 0
        },
        setupTransitions: function() {
            this.fadeInAnimation = new q.Tween;
            this.fadeOutAnimation = new q.Tween;
            this.enterTransition = (new q.Tween(this)).easing(q.Easing.Quartic.Out).onComplete(function() {
                this.dispatchEvent({
                    type: g.ENTER_COMPLETE
                })
            }
            .bind(this)).start();
            this.leaveTransition = (new q.Tween(this)).easing(q.Easing.Quartic.Out)
        },
        fadeIn: function(a) {
            a = void 0 === a ? this.animationDuration : a;
            this.dispatchEvent({
                type: g.FADE_IN
            });
            var b = (this.material.uniforms ? this.material.uniforms : {
                opacity: this.material.opacity
            }).opacity
              , e = function() {
                this.visible = !0;
                this.dispatchEvent({
                    type: g.ENTER_FADE_START
                })
            }
            .bind(this)
              , c = function() {
                this.toggleInfospotVisibility(!0, a / 2);
                this.dispatchEvent({
                    type: g.ENTER_FADE_COMPLETE
                })
            }
            .bind(this);
            this.fadeOutAnimation.stop();
            this.fadeInAnimation = (new q.Tween(b)).to({
                value: 1
            }, a).easing(q.Easing.Quartic.Out).onStart(e).onComplete(c).start()
        },
        fadeOut: function(a) {
            a = void 0 === a ? this.animationDuration : a;
            this.dispatchEvent({
                type: g.FADE_OUT
            });
            var b = (this.material.uniforms ? this.material.uniforms : {
                opacity: this.material.opacity
            }).opacity
              , e = function() {
                this.visible = !1;
                this.dispatchEvent({
                    type: g.LEAVE_COMPLETE
                })
            }
            .bind(this);
            this.fadeInAnimation.stop();
            this.fadeOutAnimation = (new q.Tween(b)).to({
                value: 0
            }, a).easing(q.Easing.Quartic.Out).onComplete(e).start()
        },
        onEnter: function() {
            var a = this.animationDuration;
            this.dispatchEvent({
                type: g.ENTER
            });
            this.leaveTransition.stop();
            this.enterTransition.to({}, a).onStart(function() {
                this.dispatchEvent({
                    type: g.ENTER_START
                });
                this.loaded ? this.dispatchEvent({
                    type: g.READY
                }) : this.load()
            }
            .bind(this)).start();
            this.children.forEach(function(a) {
                a.dispatchEvent({
                    type: "panorama-enter"
                })
            });
            this.active = !0
        },
        onLeave: function() {
            var a = this.animationDuration;
            this.enterTransition.stop();
            this.leaveTransition.to({}, a).onStart(function() {
                this.dispatchEvent({
                    type: g.LEAVE_START
                });
                this.fadeOut(a);
                this.toggleInfospotVisibility(!1)
            }
            .bind(this)).start();
            this.dispatchEvent({
                type: g.LEAVE
            });
            this.traverse(function(a) {
                return a.dispatchEvent({
                    type: "panorama-leave"
                })
            });
            this.active = !1
        },
        dispose: function() {
            function a(b) {
                for (var e = b.geometry, c = b.material, d = b.children.length - 1; 0 <= d; d--)
                    a(b.children[d]),
                    b.remove(b.children[d]);
                b instanceof v && b.dispose();
                e && (e.dispose(),
                b.geometry = null);
                c && (c.dispose(),
                b.material = null)
            }
            var b = this.material;
            b && b.uniforms && b.uniforms.texture && b.uniforms.texture.value.dispose();
            this.infospotAnimation.stop();
            this.fadeInAnimation.stop();
            this.fadeOutAnimation.stop();
            this.enterTransition.stop();
            this.leaveTransition.stop();
            this.dispatchEvent({
                type: g.VIEWER_HANDLER,
                method: "onPanoramaDispose",
                data: this
            });
            a(this);
            this.parent && this.parent.remove(this)
        }
    });
    n.prototype = Object.assign(Object.create(k.prototype), {
        constructor: n,
        load: function(a) {
            k.prototype.load.call(this, !1);
            a = a || this.src;
            if (!a)
                console.warn("Image source undefined");
            else if ("string" === typeof a)
                Z.load(a, this.onLoad.bind(this), this.onProgress.bind(this), this.onError.bind(this));
            else if (a instanceof HTMLImageElement)
                this.onLoad(new c.Texture(a))
        },
        onLoad: function(a) {
            a.minFilter = a.magFilter = c.LinearFilter;
            a.generateMipmaps = !1;
            a.format = c.RGBFormat;
            a.needsUpdate = !0;
            this.updateTexture(a);
            window.requestAnimationFrame(k.prototype.onLoad.bind(this))
        },
        reset: function() {
            k.prototype.reset.call(this)
        },
        dispose: function() {
            c.Cache.remove(this.src);
            k.prototype.dispose.call(this)
        }
    });
    K.prototype = Object.assign(Object.create(k.prototype), {
        constructor: K,
        createGeometry: function() {
            var a = new c.BufferGeometry;
            a.setAttribute("position", new c.BufferAttribute(new Float32Array,1));
            return a
        },
        createMaterial: function() {
            return new c.MeshBasicMaterial({
                color: 0,
                opacity: 0,
                transparent: !0
            })
        },
        getTexture: function() {
            return null
        }
    });
    U.prototype = Object.assign(Object.create(k.prototype), {
        constructor: U,
        createMaterial: function() {
            var a = c.ShaderLib.cube
              , b = a.fragmentShader
              , e = a.vertexShader;
            a = c.UniformsUtils.clone(a.uniforms);
            a.opacity.value = 0;
            a.envMap.value = new c.CubeTexture;
            b = new c.ShaderMaterial({
                fragmentShader: b,
                vertexShader: e,
                uniforms: a,
                side: c.BackSide,
                opacity: 0,
                transparent: !0
            });
            Object.defineProperty(b, "envMap", {
                get: function() {
                    return this.uniforms.envMap.value
                }
            });
            return b
        },
        load: function() {
            k.prototype.load.call(this, !1);
            ta.load(this.images, this.onLoad.bind(this), this.onProgress.bind(this), this.onError.bind(this))
        },
        onLoad: function(a) {
            this.material.uniforms.envMap.value = a;
            k.prototype.onLoad.call(this)
        },
        getTexture: function() {
            return this.material.uniforms.envMap.value
        },
        dispose: function() {
            var a = this.material.uniforms.envMap.value;
            this.images.forEach(function(a) {
                c.Cache.remove(a)
            });
            a instanceof c.CubeTexture && a.dispose();
            k.prototype.dispose.call(this)
        }
    });
    fa.prototype = Object.assign(Object.create(U.prototype), {
        constructor: fa
    });
    var sa = window.navigator.userAgent || window.navigator.vendor || window.opera
      , ua = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(sa) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(sa.substr(0, 4))
      , va = /(android)/i.test(sa);
    D.prototype = Object.assign(Object.create(k.prototype), {
        constructor: D,
        load: function() {
            k.prototype.load.call(this, !1);
            var a = this.options
              , b = a.muted
              , e = a.loop
              , c = a.autoplay
              , d = a.playsinline;
            a = a.crossOrigin;
            var u = this.videoElement
              , l = this.onProgress.bind(this)
              , n = this.onLoad.bind(this);
            u.loop = e;
            u.autoplay = c;
            u.playsinline = d;
            u.crossOrigin = a;
            u.muted = b;
            d && (u.setAttribute("playsinline", ""),
            u.setAttribute("webkit-playsinline", ""));
            d = function() {
                var a = this.setVideoTexture(u);
                c && this.dispatchEvent({
                    type: g.VIEWER_HANDLER,
                    method: "updateVideoPlayButton",
                    data: !1
                });
                ua && (u.pause(),
                c && b ? this.dispatchEvent({
                    type: g.VIEWER_HANDLER,
                    method: "updateVideoPlayButton",
                    data: !1
                }) : this.dispatchEvent({
                    type: g.VIEWER_HANDLER,
                    method: "updateVideoPlayButton",
                    data: !0
                }));
                window.requestAnimationFrame(function() {
                    l({
                        loaded: 1,
                        total: 1
                    });
                    n(a)
                })
            }
            ;
            2 < u.readyState ? d.call(this) : (0 === u.querySelectorAll("source").length && (a = document.createElement("source"),
            a.src = this.src,
            u.appendChild(a)),
            u.load());
            u.addEventListener("loadeddata", d.bind(this));
            u.addEventListener("timeupdate", function() {
                this.videoProgress = 0 <= u.duration ? u.currentTime / u.duration : 0;
                this.dispatchEvent({
                    type: g.VIEWER_HANDLER,
                    method: "onVideoUpdate",
                    data: this.videoProgress
                })
            }
            .bind(this));
            u.addEventListener("ended", function() {
                e || (this.resetVideo(),
                this.dispatchEvent({
                    type: g.VIEWER_HANDLER,
                    method: "updateVideoPlayButton",
                    data: !0
                }))
            }
            .bind(this), !1)
        },
        onLoad: function() {
            k.prototype.onLoad.call(this)
        },
        setVideoTexture: function(a) {
            if (a)
                return a = new c.VideoTexture(a),
                a.minFilter = c.LinearFilter,
                a.magFilter = c.LinearFilter,
                a.format = c.RGBFormat,
                a.generateMipmaps = !1,
                this.updateTexture(a),
                a
        },
        reset: function() {
            this.videoElement = void 0;
            k.prototype.reset.call(this)
        },
        isVideoPaused: function() {
            return this.videoElement.paused
        },
        toggleVideo: function() {
            var a = this.videoElement;
            if (a)
                a[a.paused ? "play" : "pause"]()
        },
        setVideoCurrentTime: function(a) {
            a = a.percentage;
            var b = this.videoElement;
            b && !Number.isNaN(a) && 1 !== a && (b.currentTime = b.duration * a,
            this.dispatchEvent({
                type: g.VIEWER_HANDLER,
                method: "onVideoUpdate",
                data: a
            }))
        },
        playVideo: function() {
            var a = this.videoElement
              , b = this.playVideo.bind(this)
              , e = this.dispatchEvent.bind(this)
              , c = function() {
                e({
                    type: g.MEDIA.PLAY
                })
            }
              , d = function(a) {
                window.requestAnimationFrame(b);
                e({
                    type: "play-error",
                    error: a
                })
            };
            a && a.paused && a.play().then(c).catch(d)
        },
        pauseVideo: function() {
            var a = this.videoElement;
            a && !a.paused && a.pause();
            this.dispatchEvent({
                type: g.MEDIA.PAUSE
            })
        },
        resumeVideoProgress: function() {
            var a = this.videoElement;
            4 <= a.readyState && a.autoplay && !ua ? (this.playVideo(),
            this.dispatchEvent({
                type: g.VIEWER_HANDLER,
                method: "updateVideoPlayButton",
                data: !1
            })) : (this.pauseVideo(),
            this.dispatchEvent({
                type: g.VIEWER_HANDLER,
                method: "updateVideoPlayButton",
                data: !0
            }));
            this.setVideoCurrentTime({
                percentage: this.videoProgress
            })
        },
        resetVideo: function() {
            this.videoElement && this.setVideoCurrentTime({
                percentage: 0
            })
        },
        isVideoMuted: function() {
            return this.videoElement.muted
        },
        muteVideo: function() {
            var a = this.videoElement;
            a && !a.muted && (a.muted = !0);
            this.dispatchEvent({
                type: g.MEDIA.VOLUME_CHANGE
            })
        },
        unmuteVideo: function() {
            var a = this.videoElement;
            a && this.isVideoMuted() && (a.muted = !1);
            this.dispatchEvent({
                type: g.MEDIA.VOLUME_CHANGE
            })
        },
        getVideoElement: function() {
            return this.videoElement
        },
        dispose: function() {
            this.pauseVideo();
            this.removeEventListener(g.LEAVE, this.pauseVideo.bind(this));
            this.removeEventListener(g.ENTER_FADE_START, this.resumeVideoProgress.bind(this));
            this.removeEventListener("video-toggle", this.toggleVideo.bind(this));
            this.removeEventListener("video-time", this.setVideoCurrentTime.bind(this));
            k.prototype.dispose.call(this)
        }
    });
    Object.assign(T.prototype, {
        constructor: T,
        setProgress: function(a, b) {
            if (this.onProgress)
                this.onProgress({
                    loaded: a,
                    total: b
                })
        },
        adaptTextureToZoom: function() {
            var a = this.widths[this._zoom]
              , b = this.heights[this._zoom]
              , e = this.maxW
              , c = this.maxH;
            this._wc = Math.ceil(a / e);
            this._hc = Math.ceil(b / c);
            for (var d = 0; d < this._hc; d++)
                for (var g = 0; g < this._wc; g++) {
                    var k = document.createElement("canvas");
                    k.width = g < this._wc - 1 ? e : a - e * g;
                    k.height = d < this._hc - 1 ? c : b - c * d;
                    this._canvas.push(k);
                    this._ctx.push(k.getContext("2d"))
                }
        },
        composeFromTile: function(a, b, e) {
            var c = this.maxW
              , d = this.maxH;
            a *= 512;
            b *= 512;
            var g = Math.floor(a / c)
              , k = Math.floor(b / d);
            this._ctx[k * this._wc + g].drawImage(e, 0, 0, e.width, e.height, a - g * c, b - k * d, 512, 512);
            this.progress()
        },
        progress: function() {
            this._count++;
            this.setProgress(this._count, this._total);
            if (this._count === this._total && (this.canvas = this._canvas,
            this.panoId = this._panoId,
            this.zoom = this._zoom,
            this.onPanoramaLoad))
                this.onPanoramaLoad(this._canvas[0])
        },
        composePanorama: function() {
            this.setProgress(0, 1);
            var a = this.levelsW[this._zoom]
              , b = this.levelsH[this._zoom]
              , e = this;
            this._count = 0;
            this._total = a * b;
            for (var c = this._parameters.useWebGL, d = 0; d < b; d++)
                for (var g = {}, k = 0; k < a; g = {
                    $jscomp$loop$prop$url$2: g.$jscomp$loop$prop$url$2
                },
                k++)
                    g.$jscomp$loop$prop$url$2 = "https://geo0.ggpht.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&output=tile&zoom=" + this._zoom + "&x=" + k + "&y=" + d + "&panoid=" + this._panoId + "&nbt&fover=2",
                    function(a) {
                        return function(b, d) {
                            if (c)
                                var f = Z.load(a.$jscomp$loop$prop$url$2, null, function() {
                                    e.composeFromTile(b, d, f)
                                });
                            else {
                                var h = new Image;
                                h.addEventListener("load", function() {
                                    e.composeFromTile(b, d, this)
                                });
                                h.crossOrigin = "";
                                h.src = a.$jscomp$loop$prop$url$2
                            }
                        }
                    }(g)(k, d)
        },
        load: function(a) {
            this.loadPano(a)
        },
        loadPano: function(a) {
            var b = this;
            this._panoClient.getPanoramaById(a, function(a, c) {
                c === google.maps.StreetViewStatus.OK && (b.result = a,
                b.copyright = a.copyright,
                b._panoId = a.location.pano,
                b.composePanorama())
            })
        },
        setZoom: function(a) {
            this._zoom = a;
            this.adaptTextureToZoom()
        }
    });
    ea.prototype = Object.assign(Object.create(n.prototype), {
        constructor: ea,
        load: function(a) {
            k.prototype.load.call(this, !1);
            this.loadRequested = !0;
            (a = a || this.panoId || {},
            this.gsvLoader) && this.loadGSVLoader(a)
        },
        setupGoogleMapAPI: function(a) {
            var b = this.setGSVLoader.bind(this);
            if (document.querySelector("#panolens-gmapscript"))
                b();
            else {
                var e = document.createElement("script");
                e.id = "panolens-gmapscript";
                e.src = "https://maps.googleapis.com/maps/api/js?";
                e.src += a ? "key=" + a : "";
                e.readyState ? e.onreadystatechange = function() {
                    if (e.readyState === g.LOADED || "complete" === e.readyState)
                        e.onreadystatechange = null,
                        b()
                }
                : e.onload = b;
                document.querySelector("head").appendChild(e)
            }
        },
        setGSVLoader: function() {
            this.gsvLoader = new T;
            this.loadRequested && this.load()
        },
        getGSVLoader: function() {
            return this.gsvLoader
        },
        loadGSVLoader: function(a) {
            this.loadRequested = !1;
            this.gsvLoader.onProgress = this.onProgress.bind(this);
            this.gsvLoader.onPanoramaLoad = this.onLoad.bind(this);
            this.gsvLoader.setZoom(this.getZoomLevel());
            this.gsvLoader.load(a);
            this.gsvLoader.loaded = !0
        },
        onLoad: function(a) {
            n.prototype.onLoad.call(this, new c.Texture(a))
        },
        reset: function() {
            this.gsvLoader = void 0;
            n.prototype.reset.call(this)
        }
    });
    var Ba = {
        tDiffuse: {
            value: new c.Texture
        },
        resolution: {
            value: 1
        },
        transform: {
            value: new c.Matrix4
        },
        zoom: {
            value: 1
        },
        opacity: {
            value: 1
        }
    };
    H.prototype = Object.assign(Object.create(n.prototype), {
        constructor: H,
        add: function(a) {
            if (1 < arguments.length) {
                for (var b = 0; b < arguments.length; b++)
                    this.add(arguments[b]);
                return this
            }
            a instanceof v && (a.material.depthTest = !1);
            n.prototype.add.call(this, a)
        },
        createGeometry: function(a) {
            return new c.PlaneBufferGeometry(a,.5 * a)
        },
        createMaterial: function(a) {
            a = void 0 === a ? this.edgeLength : a;
            var b = c.UniformsUtils.clone(Ba);
            b.zoom.value = a;
            b.opacity.value = 0;
            return new c.ShaderMaterial({
                vertexShader: "\n\n        varying vec2 vUv;\n\n        void main() {\n\n            vUv = uv;\n            gl_Position = vec4( position, 1.0 );\n\n        }\n\n    ",
                fragmentShader: "\n\n        uniform sampler2D tDiffuse;\n        uniform float resolution;\n        uniform mat4 transform;\n        uniform float zoom;\n        uniform float opacity;\n\n        varying vec2 vUv;\n\n        const float PI = 3.141592653589793;\n\n        void main(){\n\n            vec2 position = -1.0 +  2.0 * vUv;\n\n            position *= vec2( zoom * resolution, zoom * 0.5 );\n\n            float x2y2 = position.x * position.x + position.y * position.y;\n            vec3 sphere_pnt = vec3( 2. * position, x2y2 - 1. ) / ( x2y2 + 1. );\n\n            sphere_pnt = vec3( transform * vec4( sphere_pnt, 1.0 ) );\n\n            vec2 sampleUV = vec2(\n                (atan(sphere_pnt.y, sphere_pnt.x) / PI + 1.0) * 0.5,\n                (asin(sphere_pnt.z) / PI + 0.5)\n            );\n\n            gl_FragColor = texture2D( tDiffuse, sampleUV );\n            gl_FragColor.a *= opacity;\n\n        }\n    ",
                uniforms: b,
                transparent: !0,
                opacity: 0
            })
        },
        registerMouseEvents: function() {
            this.container.addEventListener("mousedown", this.onMouseDown.bind(this), {
                passive: !0
            });
            this.container.addEventListener("mousemove", this.onMouseMove.bind(this), {
                passive: !0
            });
            this.container.addEventListener("mouseup", this.onMouseUp.bind(this), {
                passive: !0
            });
            this.container.addEventListener("touchstart", this.onMouseDown.bind(this), {
                passive: !0
            });
            this.container.addEventListener("touchmove", this.onMouseMove.bind(this), {
                passive: !0
            });
            this.container.addEventListener("touchend", this.onMouseUp.bind(this), {
                passive: !0
            });
            this.container.addEventListener("mousewheel", this.onMouseWheel.bind(this), {
                passive: !1
            });
            this.container.addEventListener("DOMMouseScroll", this.onMouseWheel.bind(this), {
                passive: !1
            });
            this.container.addEventListener("contextmenu", this.onContextMenu.bind(this), {
                passive: !0
            })
        },
        unregisterMouseEvents: function() {
            this.container.removeEventListener("mousedown", this.onMouseDown.bind(this), !1);
            this.container.removeEventListener("mousemove", this.onMouseMove.bind(this), !1);
            this.container.removeEventListener("mouseup", this.onMouseUp.bind(this), !1);
            this.container.removeEventListener("touchstart", this.onMouseDown.bind(this), !1);
            this.container.removeEventListener("touchmove", this.onMouseMove.bind(this), !1);
            this.container.removeEventListener("touchend", this.onMouseUp.bind(this), !1);
            this.container.removeEventListener("mousewheel", this.onMouseWheel.bind(this), !1);
            this.container.removeEventListener("DOMMouseScroll", this.onMouseWheel.bind(this), !1);
            this.container.removeEventListener("contextmenu", this.onContextMenu.bind(this), !1)
        },
        onMouseDown: function(a) {
            switch (a.touches && a.touches.length || 1) {
            case 1:
                var b = 0 <= a.clientX ? a.clientX : a.touches[0].clientX;
                a = 0 <= a.clientY ? a.clientY : a.touches[0].clientY;
                this.dragging = !0;
                this.userMouse.set(b, a);
                break;
            case 2:
                b = a.touches[0].pageX - a.touches[1].pageX,
                a = a.touches[0].pageY - a.touches[1].pageY,
                this.userMouse.pinchDistance = Math.sqrt(b * b + a * a)
            }
            this.onUpdateCallback()
        },
        onMouseMove: function(a) {
            switch (a.touches && a.touches.length || 1) {
            case 1:
                var b = 0 <= a.clientX ? a.clientX : a.touches[0].clientX;
                a = 0 <= a.clientY ? a.clientY : a.touches[0].clientY;
                var e = .4 * c.Math.degToRad(b - this.userMouse.x)
                  , d = .4 * c.Math.degToRad(a - this.userMouse.y);
                this.dragging && (this.quatA.setFromAxisAngle(this.vectorY, e),
                this.quatB.setFromAxisAngle(this.vectorX, d),
                this.quatCur.multiply(this.quatA).multiply(this.quatB),
                this.userMouse.set(b, a));
                break;
            case 2:
                b = a.touches[0].pageX - a.touches[1].pageX,
                a = a.touches[0].pageY - a.touches[1].pageY,
                this.addZoomDelta(this.userMouse.pinchDistance - Math.sqrt(b * b + a * a))
            }
        },
        onMouseUp: function() {
            this.dragging = !1
        },
        onMouseWheel: function(a) {
            a.preventDefault();
            a.stopPropagation();
            var b = 0;
            void 0 !== a.wheelDelta ? b = a.wheelDelta : void 0 !== a.detail && (b = -a.detail);
            this.addZoomDelta(b);
            this.onUpdateCallback()
        },
        addZoomDelta: function(a) {
            var b = this.material.uniforms
              , e = .1 * this.size
              , c = 10 * this.size;
            b.zoom.value += a;
            b.zoom.value <= e ? b.zoom.value = e : b.zoom.value >= c && (b.zoom.value = c)
        },
        onUpdateCallback: function() {
            this.frameId = window.requestAnimationFrame(this.onUpdateCallback.bind(this));
            this.quatSlerp.slerp(this.quatCur, .1);
            this.material && this.material.uniforms.transform.value.makeRotationFromQuaternion(this.quatSlerp);
            !this.dragging && 1 - this.quatSlerp.clone().dot(this.quatCur) < this.EPS && window.cancelAnimationFrame(this.frameId)
        },
        reset: function() {
            this.quatCur.set(0, 0, 0, 1);
            this.quatSlerp.set(0, 0, 0, 1);
            this.onUpdateCallback()
        },
        updateTexture: function(a) {
            this.material.uniforms.tDiffuse.value = a
        },
        getTexture: function() {
            return this.material.uniforms.tDiffuse.value
        },
        onLoad: function(a) {
            this.material.uniforms.resolution.value = this.container.clientWidth / this.container.clientHeight;
            this.registerMouseEvents();
            this.onUpdateCallback();
            this.dispatchEvent({
                type: g.VIEWER_HANDLER,
                method: "disableControl"
            });
            n.prototype.onLoad.call(this, a)
        },
        onLeave: function() {
            this.unregisterMouseEvents();
            this.dispatchEvent({
                type: g.VIEWER_HANDLER,
                method: "enableControl",
                data: M.ORBIT
            });
            window.cancelAnimationFrame(this.frameId);
            n.prototype.onLeave.call(this)
        },
        onWindowResize: function() {
            this.material.uniforms.resolution.value = this.container.clientWidth / this.container.clientHeight
        },
        onContextMenu: function() {
            this.dragging = !1
        },
        dispose: function() {
            this.unregisterMouseEvents();
            n.prototype.dispose.call(this)
        }
    });
    aa.prototype = Object.assign(Object.create(H.prototype), {
        constructor: aa,
        onLoad: function(a) {
            this.updateTexture(a);
            H.prototype.onLoad.call(this, a)
        },
        updateTexture: function(a) {
            a.minFilter = a.magFilter = c.LinearFilter;
            this.material.uniforms.tDiffuse.value = a
        },
        dispose: function() {
            var a = this.material.uniforms.tDiffuse;
            a && a.value && a.value.dispose();
            H.prototype.dispose.call(this)
        }
    });
    X.prototype = Object.assign(Object.create(k.prototype), {
        constructor: X,
        onPanolensContainer: function(a) {
            this.media.setContainer(a.container)
        },
        onPanolensScene: function(a) {
            this.media.setScene(a.scene)
        },
        start: function() {
            return this.media.start()
        },
        stop: function() {
            this.media.stop()
        }
    });
    O.prototype = Object.assign(Object.create(n.prototype), {
        constructor: O,
        onLoad: function(a) {
            var b = a.image;
            this.stereo.updateUniformByFormat(4 === b.width / b.height ? N.SBS : N.TAB, this.material.uniforms);
            this.material.uniforms.texture.value = a;
            n.prototype.onLoad.call(this, a)
        },
        updateTextureToLeft: function() {
            this.stereo.updateTextureToLeft(this.material.uniforms.offset.value)
        },
        updateTextureToRight: function() {
            this.stereo.updateTextureToRight(this.material.uniforms.offset.value)
        },
        dispose: function() {
            var a = this.material.uniforms.texture.value;
            a instanceof c.Texture && a.dispose();
            n.prototype.dispose.call(this)
        }
    });
    P.prototype = Object.assign(Object.create(D.prototype), {
        constructor: P,
        onLoad: function(a) {
            var b = a.image;
            this.stereo.updateUniformByFormat(4 === b.videoWidth / b.videoHeight ? N.SBS : N.TAB, this.material.uniforms);
            this.material.uniforms.texture.value = a;
            D.prototype.onLoad.call(this)
        },
        updateTextureToLeft: function() {
            this.stereo.updateTextureToLeft(this.material.uniforms.offset.value)
        },
        updateTextureToRight: function() {
            this.stereo.updateTextureToRight(this.material.uniforms.offset.value)
        },
        dispose: function() {
            var a = this.material.uniforms.texture.value;
            a instanceof c.Texture && a.dispose();
            D.prototype.dispose.call(this)
        }
    });
    B.prototype = Object.assign(Object.create(k.prototype), {
        constructor: B,
        onWindowResize: function() {},
        onPanolensContainer: function(a) {
            this.container = a
        },
        onPanolensCamera: function(a) {
            Object.assign(this.defaults, {
                fov: a.fov
            });
            this.camera = a
        },
        onPanolensControls: function(a) {
            var b = $jscomp.makeIterator(a).next().value;
            Object.assign(this.defaults, {
                minPolarAngle: b.minPolarAngle,
                maxPolarAngle: b.maxPolarAngle
            });
            this.controls = a
        },
        setupDispatcher: function() {
            var a = this.dispatchEvent.bind(this)
              , b = Object.values(g.PANOMOMENT);
            this.dispatchEvent = function(e) {
                b.includes(e.type) && (this.status = e.type);
                a(e)
            }
        },
        enableControl: function() {
            this.active && ($jscomp.makeIterator(this.controls).next().value.enabled = !0)
        },
        disableControl: function() {
            this.active && ($jscomp.makeIterator(this.controls).next().value.enabled = !1)
        },
        load: function() {
            k.prototype.load.call(this, !1);
            var a = this.readyCallback
              , b = this.loadedCallback;
            this.PanoMoments = new wa(this.identifier,this.renderCallback.bind(this),a.bind(this),b.bind(this))
        },
        updateHeading: function() {
            if (this.momentData) {
                var a = (this.momentData.start_frame + 180) / 180 * Math.PI;
                this.dispatchEvent({
                    type: g.VIEWER_HANDLER,
                    method: "setControlCenter"
                });
                this.dispatchEvent({
                    type: g.VIEWER_HANDLER,
                    method: "rotateControlLeft",
                    data: a
                })
            }
        },
        getYaw: function() {
            var a = this.momentData.clockwise
              , b = c.Math.radToDeg(this.camera.rotation.y) + 180;
            return ((a ? 90 : -90) - b) % 360
        },
        updateCallback: function() {
            this.momentData && this.status !== g.PANOMOMENT.NONE && this.setPanoMomentYaw(this.getYaw())
        },
        renderCallback: function(a, b) {
            this.momentData || (this.momentData = b,
            a = new c.Texture(a),
            a.minFilter = a.magFilter = c.LinearFilter,
            a.generateMipmaps = !1,
            a.format = c.RGBFormat,
            this.updateTexture(a),
            this.dispatchEvent({
                type: g.PANOMOMENT.FIRST_FRAME_DECODED
            }),
            k.prototype.onLoad.call(this))
        },
        readyCallback: function() {
            this.dispatchEvent({
                type: g.PANOMOMENT.READY
            })
        },
        loadedCallback: function() {
            this.dispatchEvent({
                type: g.PANOMOMENT.COMPLETED
            })
        },
        setPanoMomentYaw: function(a) {
            var b = this.status
              , e = this.momentData
              , c = this.PanoMoments
              , d = c.render
              , k = c.frameCount;
            c = c.textureReady;
            c() && (this.getTexture().needsUpdate = !0);
            b !== g.PANOMOMENT.READY && b !== g.PANOMOMENT.COMPLETED || !e || d(a / 360 * k)
        },
        enter: function() {
            this.updateHeading();
            this.addEventListener(g.WIDNOW_RESIZE, this.handlerWindowResize);
            this.dispatchEvent({
                type: g.VIEWER_HANDLER,
                method: "addUpdateCallback",
                data: this.handlerUpdateCallback
            })
        },
        leave: function() {
            var a = this.camera
              , b = $jscomp.makeIterator(this.controls).next().value
              , c = this.defaults
              , d = c.fov;
            Object.assign(b, {
                minPolarAngle: c.minPolarAngle,
                maxPolarAngle: c.maxPolarAngle
            });
            a.fov = d;
            a.updateProjectionMatrix();
            this.removeEventListener(g.WIDNOW_RESIZE, this.handlerWindowResize);
            this.dispatchEvent({
                type: g.VIEWER_HANDLER,
                method: "removeUpdateCallback",
                data: this.handlerUpdateCallback
            })
        },
        dispose: function() {
            this.leave();
            this.PanoMoments.dispose();
            this.defaults = this.controls = this.camera = this.container = this.momentData = this.PanoMoments = null;
            k.prototype.dispose.call(this)
        }
    });
    Y.prototype = Object.assign(Object.create(B.prototype), {
        constructor: Y,
        onWindowResize: function() {
            this.resetControlLimits(!1)
        },
        attachFOVListener: function(a) {
            a = void 0 === a ? !0 : a;
            var b = $jscomp.makeIterator(this.controls).next().value;
            a ? b.addEventListener("fov", this.viewerResetControlLimits) : b.removeEventListener("fov", this.viewerResetControlLimits)
        },
        updateHeading: function() {
            this.momentData && (this.material.uniforms.offset.value.x = (this.momentData.max_horizontal_fov / 360 + .25) % 1,
            this.resetControlLimits(!1),
            B.prototype.updateHeading.call(this))
        },
        resetAzimuthAngleLimits: function(a) {
            a = void 0 === a ? !1 : a;
            var b = $jscomp.makeIterator(this.controls).next().value
              , e = this.momentData
              , d = this.defaults
              , g = d.minPolarAngle;
            d = d.maxPolarAngle;
            if (e.contains_parallax || a)
                e = c.Math.degToRad((.95 * e.min_vertical_fov - this.camera.fov) / 2),
                e = {
                    minPolarAngle: Math.PI / 2 - e,
                    maxPolarAngle: Math.PI / 2 + e
                },
                Object.assign(b, a ? {
                    minPolarAngle: g,
                    maxPolarAngle: d
                } : e)
        },
        calculateFOV: function(a, b) {
            var c = this.camera.aspect;
            return 2 * Math.atan(Math.tan(a * Math.PI / 360) * (b ? c : 1 / c)) / Math.PI * 180
        },
        resetFOVLimits: function(a) {
            a = void 0 === a ? !1 : a;
            var b = this.momentData
              , c = this.camera
              , d = $jscomp.makeIterator(this.controls).next().value
              , g = this.defaults.fov
              , k = this.calculateFOV(c.fov, !0);
            k > .95 * b.min_horizontal_fov ? c.fov = this.calculateFOV(.95 * b.min_horizontal_fov, !1) : k < d.minFov && (c.fov = this.calculateFOV(d.minFov, !1));
            c.fov = a ? g : c.fov;
            c.updateProjectionMatrix()
        },
        resetControlLimits: function(a) {
            a = void 0 === a ? !1 : a;
            this.momentData && (this.resetFOVLimits(a),
            this.resetAzimuthAngleLimits(a))
        },
        enter: function() {
            this.attachFOVListener(!0);
            this.resetControlLimits(!1);
            B.prototype.enter.call(this)
        },
        leave: function() {
            this.attachFOVListener(!1);
            this.resetControlLimits(!0);
            B.prototype.leave.call(this)
        }
    });
    var Ca = {
        texture: {
            value: new c.Texture
        },
        repeat: {
            value: new c.Vector2(1,1)
        },
        offset: {
            value: new c.Vector2(0,0)
        },
        opacity: {
            value: 1
        }
    };
    na.prototype = Object.assign(Object.create(B.prototype), {
        constructor: na,
        onWindowResize: function() {
            this.update2DGeometryScale(!1)
        },
        createGeometry: function() {
            return new c.PlaneBufferGeometry(1,1)
        },
        createMaterial: function(a, b) {
            a = void 0 === a ? new c.Vector2(1,1) : a;
            b = void 0 === b ? new c.Vector2(0,0) : b;
            var e = c.UniformsUtils.clone(Ca);
            e.repeat.value.copy(a);
            e.offset.value.copy(b);
            e.opacity.value = 0;
            return new c.ShaderMaterial({
                fragmentShader: "\n        uniform sampler2D texture;\n        uniform vec2 repeat;\n        uniform vec2 offset;\n        uniform float opacity;\n        varying vec2 vUv;\n        \n        void main() {\n\n            vec2 sampleUV = vUv;\n            sampleUV = sampleUV * repeat + offset;\n        \n            gl_FragColor = texture2D( texture, sampleUV );\n            gl_FragColor.a *= opacity;\n        \n        }\n    ",
                vertexShader: "\n        varying vec2 vUv;\n        #include <common>\n        \n        void main() {\n        \n            vUv = uv;\n            gl_Position = vec4( position, 1.0 );\n            #include <begin_vertex>\n            #include <project_vertex>\n        \n        }\n    ",
                uniforms: e,
                transparent: !0
            })
        },
        update2DGeometryScale: function(a) {
            a = void 0 === a ? !1 : a;
            if (this.momentData)
                if (this.geometry.scale(1 / this.scale2D.x, 1 / this.scale2D.y, 1),
                a)
                    this.scale2D.set(1, 1);
                else {
                    a = this.momentData.aspect_ratio;
                    var b = this.camera;
                    b = 2 * Math.tan(b.fov * Math.PI / 360) * Math.min(a, b.aspect);
                    this.scale2D.set(b, b / a);
                    this.geometry.scale(this.scale2D.x, this.scale2D.y, 1)
                }
        },
        enter: function() {
            this.position.set(0, 0, -1);
            this._parent = this.parent;
            this.camera.add(this);
            this.update2DGeometryScale();
            B.prototype.enter.call(this)
        },
        leave: function() {
            this.position.set(0, 0, 0);
            this._parent.add(this);
            delete this._parent;
            B.prototype.leave.call(this)
        }
    });
    oa.prototype = Object.assign(Object.create(c.EventDispatcher.prototype), {
        constructor: oa
    });
    pa.prototype = Object.assign(Object.create(c.EventDispatcher.prototype), {
        constructor: pa
    });
    var Da = function(a) {
        var b = new c.StereoCamera;
        b.aspect = .5;
        var e = new c.Vector2;
        this.setEyeSeparation = function(a) {
            b.eyeSep = a
        }
        ;
        this.setSize = function(b, c) {
            a.setSize(b, c)
        }
        ;
        this.render = function(c, d, g) {
            var f = g instanceof O || g instanceof P;
            c.updateMatrixWorld();
            null === d.parent && d.updateMatrixWorld();
            f && this.setEyeSeparation(g.stereo.eyeSep);
            b.update(d);
            a.getSize(e);
            a.autoClear && a.clear();
            a.setScissorTest(!0);
            f && g.updateTextureToLeft();
            a.setScissor(0, 0, e.width / 2, e.height);
            a.setViewport(0, 0, e.width / 2, e.height);
            a.render(c, b.cameraL);
            f && g.updateTextureToRight();
            a.setScissor(e.width / 2, 0, e.width / 2, e.height);
            a.setViewport(e.width / 2, 0, e.width / 2, e.height);
            a.render(c, b.cameraR);
            a.setScissorTest(!1);
            f && g.updateTextureToLeft()
        }
    };
    qa.prototype = Object.assign(Object.create(c.EventDispatcher.prototype), {
        constructor: qa,
        setupScene: function(a) {
            return a = void 0 === a ? new c.Scene : a
        },
        setupCamera: function(a, b, e) {
            e = void 0 === e ? new c.PerspectiveCamera(a,b,1,1E4) : e;
            e.position.set(0, 0, 1);
            return e
        },
        setupRenderer: function(a, b) {
            a = void 0 === a ? new c.WebGLRenderer({
                alpha: !0,
                antialias: !1
            }) : a;
            var e = b.clientWidth
              , d = b.clientHeight;
            a.setPixelRatio(window.devicePixelRatio);
            a.setSize(e, d);
            a.setClearColor(0, 0);
            a.autoClear = !1;
            a.domElement.classList.add("panolens-canvas");
            a.domElement.style.display = "block";
            a.domElement.style.transition = "opacity 0.5s ease";
            b.style.backgroundColor = "#000";
            b.appendChild(a.domElement);
            return a
        },
        setupControls: function(a, b) {
            var c = this.options
              , d = c.autoRotate
              , g = c.autoRotateSpeed
              , k = c.momentum
              , l = c.rotateSpeed
              , n = c.dampingFactor
              , p = c.speedLimit;
            c = c.horizontalView;
            b = Object.assign(new oa(a,b), {
                id: "orbit",
                index: M.ORBIT,
                noPan: !0,
                minDistance: 1,
                autoRotate: d,
                autoRotateSpeed: g,
                momentum: k,
                rotateSpeed: l,
                dampingFactor: n,
                speedLimit: p
            });
            c && (b.minPolarAngle = Math.PI / 2,
            b.maxPolarAngle = Math.PI / 2);
            a = Object.assign(new pa(a), {
                id: "device-orientation",
                index: M.DEVICEORIENTATION,
                enabled: !1
            });
            this.controls = [b, a];
            this.OrbitControls = b;
            this.DeviceOrientationControls = a;
            return b
        },
        setupEffects: function(a, b) {
            var c = b.clientWidth;
            b = b.clientHeight;
            var d = new ya(a);
            d.setSize(c, b);
            a = new Da(a);
            a.setSize(c, b);
            this.CardboardEffect = d;
            this.StereoEffect = a;
            return d
        },
        setupContainer: function(a) {
            if (a)
                return a._width = a.clientWidth,
                a._height = a.clientHeight,
                a;
            a = document.createElement("div");
            a.classList.add(g.CONTAINER);
            a.style.width = "100%";
            a.style.height = "100%";
            document.body.appendChild(a);
            return a
        },
        setupTween: function() {
            this.tweenCanvasOpacityOut.to({}, 500).easing(q.Easing.Exponential.Out);
            this.tweenCanvasOpacityIn.to({}, 500).easing(q.Easing.Exponential.Out);
            this.tweenCanvasOpacityOut.chain(this.tweenCanvasOpacityIn)
        },
        add: function(a) {
            var b = this.container
              , c = this.scene
              , d = this.camera
              , m = this.controls
              , l = this.options.initialLookAt;
            if (1 < arguments.length) {
                for (b = 0; b < arguments.length; b++)
                    this.add(arguments[b]);
                return this
            }
            c.add(a);
            a.addEventListener && a.addEventListener(g.VIEWER_HANDLER, this.eventHandler.bind(this));
            a instanceof k && (a.dispatchEvent({
                type: g.CONTAINER,
                container: b
            }),
            a.dispatchEvent({
                type: "panolens-scene",
                scene: c
            }),
            a.dispatchEvent({
                type: g.CAMERA,
                camera: d
            }),
            a.dispatchEvent({
                type: g.CONTROLS,
                controls: m
            }),
            this.addPanoramaEventListener(a),
            this.panorama || (this.setPanorama(a),
            this.setControlCenter(l)))
        },
        remove: function(a) {
            a.removeEventListener && a.removeEventListener(g.VIEWER_HANDLER, this.eventHandler.bind(this));
            this.scene.remove(a)
        },
        addDefaultControlBar: function(a) {
            if (this.widget)
                console.warn("Default control bar exists");
            else {
                var b = new S(this.container);
                b.addEventListener(g.VIEWER_HANDLER, this.eventHandler.bind(this));
                b.addControlBar();
                a.forEach(function(a) {
                    b.addControlButton(a)
                });
                this.widget = b
            }
        },
        setPanorama: function(a) {
            var b = this.panorama;
            if (a instanceof k && b !== a) {
                this.hideInfospot();
                if (b) {
                    if (a instanceof B) {
                        var c = function() {
                            b.removeEventListener(g.LEAVE_COMPLETE, c);
                            delete b._onLeaveComplete;
                            a.active && a.loaded && a.fadeIn()
                        };
                        b._onLeaveComplete = c;
                        b.addEventListener(g.LEAVE_COMPLETE, c);
                        if (b instanceof B)
                            b.onLeave()
                    }
                    b._onReady && (b.removeEventListener(g.READY, b._onReady),
                    delete b._onReady);
                    b._onEnterFadeStart && (b.removeEventListener(g.ENTER_FADE_START, b._onEnterFadeStart),
                    delete b._onEnterFadeStart)
                }
                a._onLeaveComplete && (a.removeEventListener(g.LEAVE_COMPLETE, a._onLeaveComplete),
                delete a._onLeaveComplete);
                var d = function() {
                    a.removeEventListener(g.READY, d);
                    delete a._onReady;
                    a.active && (a instanceof B && (!(a instanceof B) || b instanceof B && b._onLeaveComplete) || a.fadeIn())
                }
                  , m = function() {
                    if (b && b.active)
                        b.onLeave();
                    a.removeEventListener(g.ENTER_FADE_START, m);
                    delete a._onEnterFadeStart
                };
                a.addEventListener(g.READY, d);
                a.addEventListener(g.ENTER_FADE_START, m);
                a._onReady = d;
                a._onEnterFadeStart = m;
                this.panorama = a;
                requestAnimationFrame(function() {
                    return a.onEnter()
                })
            }
        },
        eventHandler: function(a) {
            if (a.method && this[a.method])
                this[a.method](a.data)
        },
        dispatchEventToChildren: function(a) {
            this.scene.traverse(function(b) {
                b.dispatchEvent && b.dispatchEvent(a)
            })
        },
        activateWidgetItem: function(a, b) {
            var c = this.widget.mainMenu
              , d = c.children[0];
            c = c.children[1];
            if (void 0 !== a) {
                switch (a) {
                case 0:
                    a = d.subMenu.children[1];
                    break;
                case 1:
                    a = d.subMenu.children[2];
                    break;
                default:
                    a = d.subMenu.children[1]
                }
                d.subMenu.setActiveItem(a);
                d.setSelectionTitle(a.textContent)
            }
            if (void 0 !== b) {
                switch (b) {
                case z.CARDBOARD:
                    a = c.subMenu.children[2];
                    break;
                case z.STEREO:
                    a = c.subMenu.children[3];
                    break;
                default:
                    a = c.subMenu.children[1]
                }
                c.subMenu.setActiveItem(a);
                c.setSelectionTitle(a.textContent)
            }
        },
        enableEffect: function(a) {
            if (this.mode !== a)
                if (a === z.NORMAL)
                    this.disableEffect();
                else {
                    this.mode = a;
                    var b = this.camera.fov;
                    switch (a) {
                    case z.CARDBOARD:
                        this.effect = this.CardboardEffect;
                        this.enableReticleControl();
                        break;
                    case z.STEREO:
                        this.effect = this.StereoEffect;
                        this.enableReticleControl();
                        break;
                    default:
                        this.effect = null,
                        this.disableReticleControl()
                    }
                    this.activateWidgetItem(void 0, this.mode);
                    this.dispatchEventToChildren({
                        type: "panolens-dual-eye-effect",
                        mode: this.mode
                    });
                    this.camera.fov = b + .01;
                    this.effect.setSize(this.container.clientWidth, this.container.clientHeight);
                    this.render();
                    this.camera.fov = b;
                    this.dispatchEvent({
                        type: g.MODE_CHANGE,
                        mode: this.mode
                    })
                }
        },
        disableEffect: function() {
            this.mode !== z.NORMAL && (this.mode = z.NORMAL,
            this.disableReticleControl(),
            this.activateWidgetItem(void 0, this.mode),
            this.dispatchEventToChildren({
                type: "panolens-dual-eye-effect",
                mode: this.mode
            }),
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight),
            this.render(),
            this.dispatchEvent({
                type: g.MODE_CHANGE,
                mode: this.mode
            }))
        },
        enableReticleControl: function() {
            this.reticle.visible || (this.tempEnableReticle = !0,
            this.unregisterMouseAndTouchEvents(),
            this.reticle.show(),
            this.registerReticleEvent(),
            this.updateReticleEvent())
        },
        disableReticleControl: function() {
            this.tempEnableReticle = !1;
            this.options.enableReticle ? this.updateReticleEvent() : (this.reticle.hide(),
            this.unregisterReticleEvent(),
            this.registerMouseAndTouchEvents())
        },
        enableAutoRate: function() {
            this.options.autoRotate = !0;
            this.OrbitControls.autoRotate = !0
        },
        disableAutoRate: function() {
            clearTimeout(this.autoRotateRequestId);
            this.options.autoRotate = !1;
            this.OrbitControls.autoRotate = !1
        },
        toggleVideoPlay: function(a) {
            this.panorama instanceof D && this.panorama.dispatchEvent({
                type: "video-toggle",
                pause: a
            })
        },
        setVideoCurrentTime: function(a) {
            this.panorama instanceof D && this.panorama.dispatchEvent({
                type: "video-time",
                percentage: a
            })
        },
        onVideoUpdate: function(a) {
            var b = this.widget;
            b && b.dispatchEvent({
                type: "video-update",
                percentage: a
            })
        },
        addUpdateCallback: function(a) {
            a && this.updateCallbacks.push(a)
        },
        removeUpdateCallback: function(a) {
            var b = this.updateCallbacks.indexOf(a);
            a && 0 <= b && this.updateCallbacks.splice(b, 1)
        },
        showVideoWidget: function() {
            var a = this.widget;
            a && a.dispatchEvent({
                type: "video-control-show"
            })
        },
        hideVideoWidget: function() {
            var a = this.widget;
            a && a.dispatchEvent({
                type: "video-control-hide"
            })
        },
        updateVideoPlayButton: function(a) {
            var b = this.widget;
            b && b.videoElement && b.videoElement.controlButton && b.videoElement.controlButton.update(a)
        },
        addPanoramaEventListener: function(a) {
            a.addEventListener(g.ENTER, this.setCameraControl.bind(this));
            a instanceof D && (a.addEventListener(g.ENTER_FADE_START, this.showVideoWidget.bind(this)),
            a.addEventListener(g.LEAVE_START, function() {
                this.panorama instanceof D || this.hideVideoWidget.call(this)
            }
            .bind(this)))
        },
        setCameraControl: function() {
            this.panorama && this.OrbitControls.target.copy(this.panorama.position)
        },
        getControl: function() {
            return this.control
        },
        getScene: function() {
            return this.scene
        },
        getCamera: function() {
            return this.camera
        },
        getRenderer: function() {
            return this.renderer
        },
        getContainer: function() {
            return this.container
        },
        getControlId: function() {
            return this.control.id
        },
        getNextControlId: function() {
            return this.controls[this.getNextControlIndex()].id
        },
        getNextControlIndex: function() {
            var a = this.controls
              , b = a.indexOf(this.control) + 1;
            return b >= a.length ? 0 : b
        },
        setCameraFov: function(a) {
            this.camera.fov = a;
            this.camera.updateProjectionMatrix()
        },
        getRaycastViewCenter: function() {
            var a = new c.Raycaster;
            a.setFromCamera(new c.Vector2(0,0), this.camera);
            a = a.intersectObject(this.panorama);
            return 0 < a.length ? a[0].point : new c.Vector3(0,0,-1)
        },
        enableControl: function(a) {
            a = void 0 === a ? M.ORBIT : a;
            var b = this.control.index
              , c = this.OrbitControls
              , d = this.DeviceOrientationControls
              , g = this.container.querySelector("canvas");
            if (a !== b) {
                if (a === M.DEVICEORIENTATION)
                    this.tweenCanvasOpacityOut.onStart(function() {
                        c.enabled = !1;
                        d.enabled = !1;
                        g.style.opacity = 0
                    }),
                    this.tweenCanvasOpacityIn.onStart(function() {
                        c.enabled = !0;
                        d.connect();
                        g.style.opacity = 1
                    });
                else {
                    b = d.getAlpha;
                    var k = d.getBeta
                      , l = -b()
                      , n = Math.PI / 2 - k()
                      , p = this.getRaycastViewCenter();
                    this.tweenCanvasOpacityOut.onStart(function() {
                        c.enabled = !1;
                        d.disconnect();
                        g.style.opacity = 0
                    });
                    this.tweenCanvasOpacityIn.onStart(function() {
                        c.enabled = !0;
                        this.rotateControlLeft(l);
                        this.rotateControlUp(n);
                        this.setControlCenter(p);
                        g.style.opacity = 1
                    }
                    .bind(this))
                }
                this.tweenCanvasOpacityOut.start();
                this.control = this.controls[a];
                this.activateWidgetItem(a, void 0)
            }
        },
        disableControl: function() {
            this.control.enabled = !1
        },
        toggleNextControl: function() {
            this.enableControl(this.getNextControlIndex())
        },
        getScreenVector: function(a) {
            a = a.clone();
            var b = this.container.clientWidth / 2
              , c = this.container.clientHeight / 2;
            a.project(this.camera);
            a.x = a.x * b + b;
            a.y = -(a.y * c) + c;
            a.z = 0;
            return a
        },
        checkSpriteInViewport: function(a) {
            this.camera.matrixWorldInverse.getInverse(this.camera.matrixWorld);
            this.cameraViewProjectionMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
            this.cameraFrustum.setFromProjectionMatrix(this.cameraViewProjectionMatrix);
            return a.visible && this.cameraFrustum.intersectsSprite(a)
        },
        reverseDraggingDirection: function() {
            console.warn("reverseDragging option is deprecated. Please use rotateSpeed to indicate strength and direction");
            this.OrbitControls.rotateSpeed *= -1
        },
        addReticle: function(a, b) {
            var c = new p(16777215,!0,this.options.dwellTime);
            c.hide();
            a.add(c);
            b.add(a);
            return c
        },
        rotateControlLeft: function(a) {
            this.OrbitControls.rotateLeftStatic(a)
        },
        rotateControlUp: function(a) {
            this.OrbitControls.rotateUpStatic(a)
        },
        rotateOrbitControl: function(a, b) {
            this.rotateControlLeft(a);
            this.rotateControlUp(b)
        },
        calculateCameraDirectionDelta: function(a) {
            var b = this.camera.getWorldDirection(new c.Vector3);
            var e = b.clone();
            var d = this.panorama.getWorldPosition(new c.Vector3).sub(this.camera.getWorldPosition(new c.Vector3));
            a = a.clone();
            a.add(d).normalize();
            var g = a.clone();
            b.y = 0;
            a.y = 0;
            d = Math.atan2(a.z, a.x) - Math.atan2(b.z, b.x);
            d = d > Math.PI ? d - 2 * Math.PI : d;
            d = d < -Math.PI ? d + 2 * Math.PI : d;
            b = Math.abs(e.angleTo(b) + (0 >= e.y * g.y ? g.angleTo(a) : -g.angleTo(a)));
            b *= g.y < e.y ? 1 : -1;
            return {
                left: d,
                up: b
            }
        },
        setControlCenter: function(a) {
            a = void 0 === a ? this.options.initialLookAt : a;
            a = this.calculateCameraDirectionDelta(a);
            this.rotateOrbitControl(a.left, a.up)
        },
        tweenControlCenter: function(a, b, c) {
            a instanceof Array && (c = a[2],
            b = a[1],
            a = a[0]);
            b = void 0 !== b ? b : 1E3;
            c = c || q.Easing.Exponential.Out;
            var e = this.calculateCameraDirectionDelta(a);
            a = e.left;
            e = e.up;
            var d = this.rotateControlLeft.bind(this)
              , g = this.rotateControlUp.bind(this)
              , k = {
                left: 0,
                up: 0
            }
              , l = 0
              , n = 0;
            this.tweenLeftAnimation.stop();
            this.tweenUpAnimation.stop();
            this.tweenLeftAnimation = (new q.Tween(k)).to({
                left: a
            }, b).easing(c).onUpdate(function(a) {
                var b = a.left - l;
                1E-4 > Math.abs(b) && this.tweenLeftAnimation.stop();
                d(b);
                l = a.left
            }
            .bind(this)).start();
            this.tweenUpAnimation = (new q.Tween(k)).to({
                up: e
            }, b).easing(c).onUpdate(function(a) {
                var b = a.up - n;
                1E-4 > Math.abs(b) && this.tweenUpAnimation.stop();
                g(b);
                n = a.up
            }
            .bind(this)).start()
        },
        tweenControlCenterByObject: function(a, b, e) {
            this.tweenControlCenter(a.getWorldPosition(new c.Vector3), b, e)
        },
        onWindowResize: function(a, b) {
            var c = this.container.classList.contains(g.CONTAINER) || this.container.isFullscreen;
            if (void 0 !== a && void 0 !== b) {
                var d = a;
                var k = b;
                this.container._width = a;
                this.container._height = b
            } else
                a = va ? Math.min(document.documentElement.clientWidth, window.innerWidth || 0) : Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
                b = va ? Math.min(document.documentElement.clientHeight, window.innerHeight || 0) : Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
                d = c ? a : this.container.clientWidth,
                k = c ? b : this.container.clientHeight,
                this.container._width = d,
                this.container._height = k;
            this.camera.aspect = d / k;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(d, k);
            (this.options.enableReticle || this.tempEnableReticle) && this.updateReticleEvent();
            this.dispatchEvent({
                type: g.WIDNOW_RESIZE,
                width: d,
                height: k
            });
            this.scene.traverse(function(a) {
                a.dispatchEvent && a.dispatchEvent({
                    type: g.WIDNOW_RESIZE,
                    width: d,
                    height: k
                })
            })
        },
        addOutputElement: function() {
            var a = document.createElement("div");
            a.style.position = "absolute";
            a.style.right = "10px";
            a.style.top = "10px";
            a.style.color = "#fff";
            this.container.appendChild(a);
            this.outputDivElement = a
        },
        outputPosition: function() {
            var a = this.raycaster.intersectObject(this.panorama, !0);
            if (0 < a.length) {
                a = a[0].point.clone();
                var b = this.panorama.getWorldPosition(new c.Vector3);
                a.sub(b);
                b = a.x.toFixed(2) + ", " + a.y.toFixed(2) + ", " + a.z.toFixed(2);
                if (0 !== a.length())
                    switch (this.options.output) {
                    case "console":
                        console.info(b);
                        break;
                    case "overlay":
                        this.outputDivElement.textContent = b
                    }
            }
        },
        onMouseDown: function(a) {
            a.preventDefault();
            this.userMouse.x = 0 <= a.clientX ? a.clientX : a.touches[0].clientX;
            this.userMouse.y = 0 <= a.clientY ? a.clientY : a.touches[0].clientY;
            this.userMouse.type = "mousedown";
            this.onTap(a)
        },
        onMouseMove: function(a) {
            a.preventDefault();
            this.userMouse.type = "mousemove";
            this.onTap(a)
        },
        onMouseUp: function(a) {
            this.userMouse.type = "mouseup";
            var b = this.userMouse.x >= a.clientX - this.options.clickTolerance && this.userMouse.x <= a.clientX + this.options.clickTolerance && this.userMouse.y >= a.clientY - this.options.clickTolerance && this.userMouse.y <= a.clientY + this.options.clickTolerance || a.changedTouches && this.userMouse.x >= a.changedTouches[0].clientX - this.options.clickTolerance && this.userMouse.x <= a.changedTouches[0].clientX + this.options.clickTolerance && this.userMouse.y >= a.changedTouches[0].clientY - this.options.clickTolerance && this.userMouse.y <= a.changedTouches[0].clientY + this.options.clickTolerance ? "click" : void 0;
            if (!a || !a.target || a.target.classList.contains("panolens-canvas"))
                if (a.preventDefault(),
                a = a.changedTouches && 1 === a.changedTouches.length ? this.onTap({
                    clientX: a.changedTouches[0].clientX,
                    clientY: a.changedTouches[0].clientY
                }, b) : this.onTap(a, b),
                this.userMouse.type = "none",
                !a && "click" === b) {
                    b = this.options;
                    a = b.autoHideControlBar;
                    var c = this.panorama
                      , d = this.toggleControlBar;
                    b.autoHideInfospot && c && c.toggleInfospotVisibility();
                    a && d()
                }
        },
        onTap: function(a, b) {
            var c = this.container.getBoundingClientRect()
              , d = c.top
              , g = this.container
              , k = g.clientHeight;
            this.raycasterPoint.x = (a.clientX - c.left) / g.clientWidth * 2 - 1;
            this.raycasterPoint.y = 2 * -((a.clientY - d) / k) + 1;
            this.raycaster.setFromCamera(this.raycasterPoint, this.camera);
            if (this.panorama) {
                ("mousedown" !== a.type && this.touchSupported || this.outputEnabled) && this.outputPosition();
                c = this.raycaster.intersectObjects(this.panorama.children, !0);
                d = this.getConvertedIntersect(c);
                g = 0 < c.length ? c[0].object : void 0;
                "mouseup" === this.userMouse.type && (d && this.pressEntityObject === d && this.pressEntityObject.dispatchEvent && this.pressEntityObject.dispatchEvent({
                    type: "pressstop-entity",
                    mouseEvent: a
                }),
                this.pressEntityObject = void 0);
                "mouseup" === this.userMouse.type && (g && this.pressObject === g && this.pressObject.dispatchEvent && this.pressObject.dispatchEvent({
                    type: "pressstop",
                    mouseEvent: a
                }),
                this.pressObject = void 0);
                if ("click" === b)
                    this.panorama.dispatchEvent({
                        type: "click",
                        intersects: c,
                        mouseEvent: a
                    }),
                    d && d.dispatchEvent && d.dispatchEvent({
                        type: "click-entity",
                        mouseEvent: a
                    }),
                    g && g.dispatchEvent && g.dispatchEvent({
                        type: "click",
                        mouseEvent: a
                    });
                else {
                    this.panorama.dispatchEvent({
                        type: "hover",
                        intersects: c,
                        mouseEvent: a
                    });
                    if (this.hoverObject && 0 < c.length && this.hoverObject !== d || this.hoverObject && 0 === c.length)
                        this.hoverObject.dispatchEvent && (this.hoverObject.dispatchEvent({
                            type: "hoverleave",
                            mouseEvent: a
                        }),
                        this.reticle.end()),
                        this.hoverObject = void 0;
                    d && 0 < c.length && (this.hoverObject !== d && (this.hoverObject = d,
                    this.hoverObject.dispatchEvent && (this.hoverObject.dispatchEvent({
                        type: "hoverenter",
                        mouseEvent: a
                    }),
                    (this.options.autoReticleSelect && this.options.enableReticle || this.tempEnableReticle) && this.reticle.start(this.onTap.bind(this, a, "click")))),
                    "mousedown" === this.userMouse.type && this.pressEntityObject != d && (this.pressEntityObject = d,
                    this.pressEntityObject.dispatchEvent && this.pressEntityObject.dispatchEvent({
                        type: "pressstart-entity",
                        mouseEvent: a
                    })),
                    "mousedown" === this.userMouse.type && this.pressObject != g && (this.pressObject = g,
                    this.pressObject.dispatchEvent && this.pressObject.dispatchEvent({
                        type: "pressstart",
                        mouseEvent: a
                    })),
                    "mousemove" === this.userMouse.type || this.options.enableReticle) && (g && g.dispatchEvent && g.dispatchEvent({
                        type: "hover",
                        mouseEvent: a
                    }),
                    this.pressEntityObject && this.pressEntityObject.dispatchEvent && this.pressEntityObject.dispatchEvent({
                        type: "pressmove-entity",
                        mouseEvent: a
                    }),
                    this.pressObject && this.pressObject.dispatchEvent && this.pressObject.dispatchEvent({
                        type: "pressmove",
                        mouseEvent: a
                    }));
                    !d && this.pressEntityObject && this.pressEntityObject.dispatchEvent && (this.pressEntityObject.dispatchEvent({
                        type: "pressstop-entity",
                        mouseEvent: a
                    }),
                    this.pressEntityObject = void 0);
                    !g && this.pressObject && this.pressObject.dispatchEvent && (this.pressObject.dispatchEvent({
                        type: "pressstop",
                        mouseEvent: a
                    }),
                    this.pressObject = void 0)
                }
                if (g && g instanceof v) {
                    if (this.infospot = g,
                    "click" === b)
                        return !0
                } else
                    this.infospot && this.hideInfospot();
                this.options.autoRotate && "mousemove" !== this.userMouse.type && (clearTimeout(this.autoRotateRequestId),
                this.control === this.OrbitControls && (this.OrbitControls.autoRotate = !1,
                this.autoRotateRequestId = window.setTimeout(this.enableAutoRate.bind(this), this.options.autoRotateActivationDuration)))
            }
        },
        getConvertedIntersect: function(a) {
            for (var b, c = 0; c < a.length; c++)
                if (0 <= a[c].distance && a[c].object && !a[c].object.passThrough && (!a[c].object.entity || !a[c].object.entity.passThrough)) {
                    b = a[c].object.entity && !a[c].object.entity.passThrough ? a[c].object.entity : a[c].object;
                    break
                }
            return b
        },
        hideInfospot: function() {
            this.infospot && (this.infospot.onHoverEnd(),
            this.infospot = void 0)
        },
        toggleControlBar: function() {
            var a = this.widget;
            a && a.dispatchEvent({
                type: "control-bar-toggle"
            })
        },
        onKeyDown: function(a) {
            this.options.output && "none" !== this.options.output && "Control" === a.key && (this.outputEnabled = !0)
        },
        onKeyUp: function() {
            this.outputEnabled = !1
        },
        update: function() {
            var a = this.scene
              , b = this.control
              , d = this.OrbitControls
              , f = this.DeviceOrientationControls;
            q.update();
            this.updateCallbacks.forEach(function(a) {
                return a()
            });
            d.enabled && d.update();
            b === f && f.update(d.spherical.theta);
            var g = new c.Vector3;
            a.traverse(function(a) {
                if (a instanceof v && a.element && (this.hoverObject === a || "none" !== a.element.style.display || a.element.left && "none" !== a.element.left.style.display || a.element.right && "none" !== a.element.right.style.display))
                    if (this.checkSpriteInViewport(a)) {
                        var b = this.getScreenVector(a.getWorldPosition(g));
                        a.translateElement(b.x, b.y)
                    } else
                        a.onDismiss()
            }
            .bind(this))
        },
        render: function() {
            this.mode === z.CARDBOARD || this.mode === z.STEREO ? (this.renderer.clear(),
            this.effect.render(this.scene, this.camera, this.panorama),
            this.effect.render(this.sceneReticle, this.camera)) : (this.renderer.clear(),
            this.renderer.render(this.scene, this.camera),
            this.renderer.clearDepth(),
            this.renderer.render(this.sceneReticle, this.camera))
        },
        animate: function() {
            this.requestAnimationId = window.requestAnimationFrame(this.animate.bind(this));
            this.onChange()
        },
        onChange: function() {
            this.update();
            this.render()
        },
        registerMouseAndTouchEvents: function() {
            var a = {
                passive: !1
            };
            this.container.addEventListener("mousedown", this.handlerMouseDown, a);
            this.container.addEventListener("mousemove", this.handlerMouseMove, a);
            this.container.addEventListener("mouseup", this.handlerMouseUp, a);
            this.container.addEventListener("touchstart", this.handlerMouseDown, a);
            this.container.addEventListener("touchend", this.handlerMouseUp, a)
        },
        unregisterMouseAndTouchEvents: function() {
            this.container.removeEventListener("mousedown", this.handlerMouseDown, !1);
            this.container.removeEventListener("mousemove", this.handlerMouseMove, !1);
            this.container.removeEventListener("mouseup", this.handlerMouseUp, !1);
            this.container.removeEventListener("touchstart", this.handlerMouseDown, !1);
            this.container.removeEventListener("touchend", this.handlerMouseUp, !1)
        },
        registerReticleEvent: function() {
            this.addUpdateCallback(this.handlerTap)
        },
        unregisterReticleEvent: function() {
            this.removeUpdateCallback(this.handlerTap)
        },
        updateReticleEvent: function() {
            var a = this.container.clientWidth / 2 + this.container.offsetLeft
              , b = this.container.clientHeight / 2;
            this.removeUpdateCallback(this.handlerTap);
            this.handlerTap = this.onTap.bind(this, {
                clientX: a,
                clientY: b
            });
            this.addUpdateCallback(this.handlerTap)
        },
        registerEventListeners: function() {
            window.addEventListener("resize", this.handlerWindowResize, !0);
            window.addEventListener("keydown", this.handlerKeyDown, !0);
            window.addEventListener("keyup", this.handlerKeyUp, !0)
        },
        unregisterEventListeners: function() {
            window.removeEventListener("resize", this.handlerWindowResize, !0);
            window.removeEventListener("keydown", this.handlerKeyDown, !0);
            window.removeEventListener("keyup", this.handlerKeyUp, !0)
        },
        dispose: function() {
            function a(b) {
                for (var c = b.children.length - 1; 0 <= c; c--)
                    a(b.children[c]),
                    b.remove(b.children[c]);
                b instanceof k || b instanceof v ? b.dispose() : b.dispatchEvent && b.dispatchEvent("dispose")
            }
            this.disableAutoRate();
            this.tweenLeftAnimation.stop();
            this.tweenUpAnimation.stop();
            this.unregisterEventListeners();
            a(this.scene);
            this.widget && (this.widget.dispose(),
            this.widget = null);
            c.Cache && c.Cache.enabled && c.Cache.clear()
        },
        destroy: function() {
            this.dispose();
            this.render();
            window.cancelAnimationFrame(this.requestAnimationId)
        },
        onPanoramaDispose: function(a) {
            var b = this.scene
              , c = function(b) {
                return b.toPanorama !== a ? b : b.dispose()
            };
            a instanceof D && this.hideVideoWidget();
            b.traverse(function(a) {
                a instanceof k && (a.linkedSpots = a.linkedSpots.map(c).filter(function(a) {
                    return !!a
                }))
            });
            a === this.panorama && (this.panorama = null)
        },
        loadAsyncRequest: function(a, b) {
            b = void 0 === b ? function() {}
            : b;
            var c = new window.XMLHttpRequest;
            c.onloadend = function(a) {
                b(a)
            }
            ;
            c.open("GET", a, !0);
            c.send(null)
        },
        addViewIndicator: function() {
            var a = this;
            this.loadAsyncRequest(C.ViewIndicator, function(b) {
                if (0 !== b.loaded) {
                    b = b.target.responseXML.documentElement;
                    b.style.width = a.viewIndicatorSize + "px";
                    b.style.height = a.viewIndicatorSize + "px";
                    b.style.position = "absolute";
                    b.style.top = "10px";
                    b.style.left = "10px";
                    b.style.opacity = "0.5";
                    b.style.cursor = "pointer";
                    b.id = "panolens-view-indicator-container";
                    a.container.appendChild(b);
                    var d = b.querySelector("#indicator");
                    a.addUpdateCallback(function() {
                        a.radius = .225 * a.viewIndicatorSize;
                        a.currentPanoAngle = a.camera.rotation.y - c.Math.degToRad(90);
                        a.fovAngle = c.Math.degToRad(a.camera.fov);
                        a.leftAngle = -a.currentPanoAngle - a.fovAngle / 2;
                        a.rightAngle = -a.currentPanoAngle + a.fovAngle / 2;
                        a.leftX = a.radius * Math.cos(a.leftAngle);
                        a.leftY = a.radius * Math.sin(a.leftAngle);
                        a.rightX = a.radius * Math.cos(a.rightAngle);
                        a.rightY = a.radius * Math.sin(a.rightAngle);
                        a.indicatorD = "M " + a.leftX + " " + a.leftY + " A " + a.radius + " " + a.radius + " 0 0 1 " + a.rightX + " " + a.rightY;
                        a.leftX && a.leftY && a.rightX && a.rightY && a.radius && d.setAttribute("d", a.indicatorD)
                    });
                    b.addEventListener("mouseenter", function() {
                        this.style.opacity = "1"
                    });
                    b.addEventListener("mouseleave", function() {
                        this.style.opacity = "0.5"
                    })
                }
            })
        },
        appendControlItem: function(a) {
            var b = this.widget.createCustomItem(a);
            "video" === a.group ? this.widget.videoElement.appendChild(b) : this.widget.barElement.appendChild(b);
            return b
        },
        removeControlItem: function(a) {
            var b = this.widget
              , c = b.barElement;
            b = b.videoElement;
            var d = Array.prototype.slice.call(c.children)
              , g = Array.prototype.slice.call(b.children);
            d.includes(a) && c.removeChild(a);
            g.includes(a) && b.removeChild(a)
        },
        clearAllCache: function() {
            c.Cache.clear()
        }
    });
    "117" != c.REVISION && console.warn("three.js version is not matched. Please consider use the target revision 117");
    window.TWEEN = q;
    d.BasicPanorama = fa;
    d.CONTROLS = M;
    d.CameraPanorama = X;
    d.CubePanorama = U;
    d.CubeTextureLoader = ta;
    d.DataImage = C;
    d.EVENTS = g;
    d.EmptyPanorama = K;
    d.GoogleStreetviewPanorama = ea;
    d.ImageLittlePlanet = aa;
    d.ImageLoader = ra;
    d.ImagePanorama = n;
    d.Infospot = v;
    d.LittlePlanet = H;
    d.MODES = z;
    d.Media = l;
    d.PanoMoment = B;
    d.PanoMomentPanorama = Y;
    d.PanoMomentRegular = na;
    d.Panorama = k;
    d.REVISION = "12";
    d.Reticle = p;
    d.STEREOFORMAT = N;
    d.Stereo = w;
    d.StereoImagePanorama = O;
    d.StereoVideoPanorama = P;
    d.THREE_REVISION = "117";
    d.THREE_VERSION = za;
    d.TextureLoader = Z;
    d.VERSION = "0.12.0";
    d.VideoPanorama = D;
    d.Viewer = qa;
    d.Widget = S;
    Object.defineProperty(d, "__esModule", {
        value: !0
    })
});
