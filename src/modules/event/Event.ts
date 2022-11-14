interface IEventMap {
  [eventName: string]: Function[];
}

/**
 * 事件系统
 */
export class Event {
  private eventMap: IEventMap = {};

  public on(eventName: string, fn: Function) {
    const { eventMap } = this;
    if (eventMap[eventName]) {
      eventMap[eventName].push(fn);
    } else {
      eventMap[eventName] = [fn];
    }
  }

  public once(eventName: string, fn: Function) {
    const callback = (...args) => {
      try {
        fn(...args);
      } catch (error) {}
      this.off(eventName, callback);
    };
    this.on(eventName, callback);
  }

  public emit(eventName: string, ...args) {
    const events = this.eventMap[eventName];
    if (!events) return;

    for (let i = 0; i < events.length; i++) {
      const fn = events[i];
      try {
        fn(...args);
      } catch (error) {}
    }
  }

  public off(eventName: string, fn?: Function) {
    const events = this.eventMap[eventName];
    if (!events) return;

    if (fn) {
      const index = events.findIndex((item) => item === fn);
      if (~index) events.splice(index, 1);
    } else {
      this.eventMap[eventName] = [];
    }
  }
}
