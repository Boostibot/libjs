function importSimpleObserver()
{
    class Observer
    {
        map;
        observer;
    
        constructor(ObserverType, options = undefined, pairs = undefined)
        {
            this.map = new Map(pairs);
            this.observer = new ObserverType((entries, observer) => {
                
                for(const entry of entries)
                {
                    const elem = entry.target;
                    const callback = this.map.get(elem);
                    if(callback(elem, entry, observer, this) !== true)
                        this.unobserve(elem);
                };
            }, options);
    
            this.map.forEach(value => this.observer.observe(value));
        }
    
        observe(element, callback, options = undefined) {
            this.map.set(element, callback);
            return this.observer.observe(element, options);
        }
        
        unobserve(element) {
            this.observer.unobserve(element);
            return this.map.delete(element);
        }
    
        disconect() {
            this.map.clear();
            return this.observer.disconect();
        }

        takeRecords() {
            return this.observer.takeRecords();
        }
    }
    
    const transformToIntersectionCallback = (callback) => (elem, entry, observer, simpleObserver) => {
        if(!entry.isIntersecting)
            return true;
    
        return callback(elem, entry, observer, simpleObserver);
    };
    
    class SimpleIntersectionObserver extends Observer
    {
        constructor(options = undefined, pairs = [])
        {
            pairs.map(val => {
                const ret = [val[0], transformToIntersectionCallback(val[1])]
                return ret;
            });
            super(IntersectionObserver, options, pairs);
        }
    
        observe(element, callback) {
            this.map.set(element, transformToIntersectionCallback(callback));
            this.observer.observe(element);
        }
    }

    return {
        Observer,
        IntersectionObserver: SimpleIntersectionObserver
    }
}
