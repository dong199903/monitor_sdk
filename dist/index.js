(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.tracker = factory());
})(this, (function () { 'use strict';

  //版本号
  var Trackerversion;
  (function (Trackerversion) {
      Trackerversion["version"] = "1.0.0";
  })(Trackerversion || (Trackerversion = {}));

  class Tracker {
      constructor(options) {
          this.eventList = ['click', 'dblclick', 'contextmenu', 'mousedown', 'mouseup', 'mouseenter', 'mouseout', 'mouseover'];
          this.histroryType = ['pushState', 'replaceState'];
          this.data = Object.assign(this.initConfig(), options); //初始化配置对象
          this.installExtra();
      }
      domTracker() {
          this.eventList.forEach(item => {
              window.addEventListener(item, e => {
                  let element = e.target;
                  let isTarget = element.getAttribute('target-key');
                  if (isTarget) {
                      this.sendData({ type: 'dom' });
                  }
              });
          });
      }
      //数据上报
      sendData(data) {
          const params = Object.assign({}, data, { time: Date.now() });
          let headers = {
              type: 'application/x-www-form-urlencoded'
          };
          let blob = new Blob([JSON.stringify(params)], headers);
          console.log('blob', blob);
          navigator.sendBeacon(this.data.requestUrl, blob);
      }
      jsError() {
          //1.脚本错误，资源错误
          window.addEventListener('error', e => {
              e.preventDefault();
              const isErrorEvent = e instanceof ErrorEvent;
              if (!isErrorEvent) { //资源错误
                  this.sendData({ type: 'resource', msg: e.message });
                  return;
              }
              this.sendData({ type: 'js', msg: e.message });
          }, true);
          //2.promise错误
          window.addEventListener('unhandledrejection', (e) => {
              e.preventDefault();
              e.promise.catch((error) => {
                  let msg = (error === null || error === void 0 ? void 0 : error.message) || error;
                  this.sendData({ type: 'promise', msg });
              });
          });
      }
      //定制功能
      installExtra() {
          //history
          if (this.data.historyTracker) {
              this.histroryType.forEach((item) => {
                  let origin = history[item];
                  let eventHistory = new Event(item);
                  window.history[item] = function () {
                      origin.apply(this, arguments);
                      window.dispatchEvent(eventHistory);
                  };
                  window.addEventListener(item, () => {
                      this.sendData({ type: 'history', msg: item });
                  });
              });
          }
          //hash
          if (this.data.hashTracker) {
              window.addEventListener('hashchange', e => {
                  this.sendData({ type: 'hash', msg: e });
              });
          }
          //dom手动上报
          if (this.data.domTracker) {
              this.domTracker();
          }
          //jsError
          if (this.data.jsError) {
              this.jsError();
          }
      }
      //初始化配置项
      initConfig() {
          return {
              sdkVersion: Trackerversion.version,
              historyTracker: false,
              hashTracker: false,
              domTracker: false,
              jsError: false,
          };
      }
  }

  return Tracker;

}));
