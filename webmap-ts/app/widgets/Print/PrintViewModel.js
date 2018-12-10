// COPYRIGHT © 2018 Esri
//
// All rights reserved under the copyright laws of the United States
// and applicable international laws, treaties, and conventions.
//
// This material is licensed for use under the Esri Master License
// Agreement (MLA), and is bound by the terms of that agreement.
// You may redistribute and use this code without modification,
// provided you adhere to the terms of the MLA and include this
// copyright notice.
//
// See use restrictions at http://www.esri.com/legal/pdfs/mla_e204_e300/english
//
// For additional information, contact:
// Environmental Systems Research Institute, Inc.
// Attn: Contracts and Legal Services Department
// 380 New York Street
// Redlands, California, USA 92373
// USA
//
// email: contracts@esri.com
//
// See http://js.arcgis.com/4.9/esri/copyright.txt for details.
define([
        "require",
        "exports", "../../core/tsSupport/declareExtendsHelper",
        "../../core/tsSupport/decorateHelper",
        "../../request",
        "../../Viewpoint",
        "../../core/Accessor", "../../core/Error",
        "../../core/Handles",
        "../../core/Loadable",
        "../../core/promiseUtils",
        "../../core/accessorSupport/decorators",
        "../../geometry/Extent",
        "../../tasks/PrintTask",
        "../../tasks/support/fileFormat",
        "../../tasks/support/layoutTemplate",
        "../../tasks/support/PrintParameters",
        "../../views/2d/viewpointUtils"
    ],
    function(e, t, r, i, n, o, a, s, p, l, u, c, d, f, v, h, y, w) {
        return function(e) {
            function t(t) {
                var r = e.call(this, t) || this;
                return r._handles = new p, r._viewpoint = null, r.view = null, r.printServiceUrl = null, r.updateDelay = 1e3, r.templatesInfo = null, r.scaleEnabled = !1, r.error = null, r.print = r.print.bind(r), r
            }
            return r(t, e), t.prototype.destroy = function() {
                this._handles.destroy(), this._handles = null, this.view = null
            }, Object.defineProperty(t.prototype, "_printTask", {
                get: function() {
                    return new f(this.printServiceUrl, {
                        updateDelay: this.updateDelay
                    })
                },
                enumerable: !0,
                configurable: !0
            }), Object.defineProperty(t.prototype, "state", {
                get: function() {
                    return "loading" === this.loadStatus ? "initializing" : this.error || "failed" === this.loadStatus ? "error" : this.get("view.ready") && "loaded" === this.loadStatus ? "ready" : "disabled"
                },
                enumerable: !0,
                configurable: !0
            }), t.prototype.load = function() {
                return this.addResolvingPromise(this._loadServiceDescription()), this.when()
            }, t.prototype.print = function(e) {
                var t;
                if (!this.view) return u.reject(new s("print:view-required", "view is not set"));
                this.scaleEnabled ? (this._viewpoint || (this._viewpoint = this.view.viewpoint.clone()), t = this._getExtent(this._viewpoint, e.outScale)) : (this._viewpoint = null, t = this._getExtent(this.view.viewpoint));
                var r = new y({
                    view: this.view,
                    template: e,
                    extent: t
                });
                return this._printTask.execute(r).catch(function(e) {
                    return u.reject(new s("print:export-error", "An error occurred while exporting the web map.", {
                        error: e
                    }))
                })
            }, t.prototype._loadServiceDescription = function() {
                var e = this;
                return this._getPrintTemplatesFromService().then(function(t) {
                    e._set("templatesInfo", t)
                })
            }, t.prototype._getPrintTemplatesFromService = function() {
                var e = this;
                return -1 === this.printServiceUrl.toLowerCase().split("/").indexOf("gpserver") ? (this.error = new s("print:invalid-print-service-url", "Can't fetch print templates information from provided URL", {
                    url: this.printServiceUrl
                }), u.reject(this.error)) : n(this.printServiceUrl, {
                    query: {
                        f: "json"
                    },
                    timeout: 6e4
                }).then(function(t) {
                    var r = t && t.data;
                    e._printTask.mode = r.executionType.toLowerCase().indexOf("async") > -1 ? "async" : "sync";
                    var i = r && r.parameters,
                        n = null,
                        o = null;
                    return i.forEach(function(e) {
                        var t, r = e.choiceList && e.choiceList.slice();
                        if (r && r.length && e.defaultValue && (t = r.indexOf(e.defaultValue)), t > -1 && (r.splice(t, 1), r.unshift(e.defaultValue)), "Format" === e.name) n = {
                            defaultValue: v.fromJSON(e.defaultValue),
                            choiceList: r.map(v.fromJSON)
                        };
                        else if ("Layout_Template" === e.name) {
                            r = r.filter(function(e) {
                                return "map_only" !== e.toLowerCase()
                            });
                            var i, a = void 0;
                            r.some(function(e, t) {
                                var r = e.toLowerCase();
                                return r.indexOf("letter") > -1 && r.indexOf("landscape") > -1 ? (i = t, !0) : r.indexOf("a4") > -1 && r.indexOf("landscape") > -1 && (i = t, !1)
                            }), i && (a = r[i], r.splice(i, 1), r.unshift(a)), o = {
                                defaultValue: h.fromJSON(r && r[0] || e.defaultValue),
                                choiceList: r.map(h.fromJSON)
                            }
                        }
                    }), e.error = null, {
                        format: n,
                        layout: o
                    }
                }).catch(function(t) {
                    return e.error = new s("print:unavailable-service-info", "Can't fetch templates info from service", {
                        error: t
                    }), u.reject(e.error)
                })
            }, t.prototype._getExtent = function(e, t) {
                var r = t || this.view.scale,
                    i = this.get("view.size"),
                    n = e ? e.targetGeometry : null;
                return w.getExtent(new d, new o({
                    scale: r,
                    targetGeometry: n
                }), i)
            }, i([c.property()], t.prototype, "view", void 0), i([c.property()], t.prototype, "printServiceUrl", void 0), i([c.property({
                dependsOn: ["printServiceUrl"],
                type: f
            })], t.prototype, "_printTask", null), i([c.property({
                dependsOn: ["view.ready", "error", "loadStatus"],
                readOnly: !0
            })], t.prototype, "state", null), i([c.property()], t.prototype, "updateDelay", void 0), i([c.property({
                readOnly: !0
            })], t.prototype, "templatesInfo", void 0), i([c.property()], t.prototype, "scaleEnabled", void 0), i([c.property()], t.prototype, "error", void 0), t = i([c.subclass("esri.widgets.Print.PrintViewModel")], t)
        }(c.declared(a, l))
    });