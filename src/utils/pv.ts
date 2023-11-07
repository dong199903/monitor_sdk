export const histroryTracker = function<T extends keyof History>(type:T) {
  const origin = history[type];//获取原始的histrory对象
  origin(arguments);
  const e = new Event(type);
  window.dispatchEvent(e);
  // return function(this:any) {
  //   const res = origin.apply(this,arguments);
  //   const e = new Event(type);
  //   window.dispatchEvent(e);
  //   return res;
  // }
}