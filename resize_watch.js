function importResizeWatch(lib, ranges, simpleObserver, throttle, viewport, DO_DEFAULT) 
{
    'use strict';

    if(DO_DEFAULT === undefined) DO_DEFAULT = true;

    const resize = {
        RES_X: 'resx', //format: data-resx="100 400" (from to) or "100 _" or "_ 100";
        RES_Y: 'resy',
        RES: 'res',
        RES_X_RELATIVE: 'resx_rel', //img width pixels / elem width pixels
        RES_Y_RELATIVE: 'resx_rel',
        RES_RELATIVE: 'res_rel', //total pixels / total viewing pixels
        DPI: 'res_dpi',
        
        EVENT_TYPE: 'customresizeevent',
        DO_LOG: false
    };
    
    function idleCall(callback)          { return window.requestIdleCallback(callback);}

    function ResizeState(absObserver, relObserver) {return {absObserver, relObserver}; }

    function bufferedObserver(callback)
    {
        const sleepPast = throttle.createSleepPast();
        return new ResizeObserver((entries, observer) => sleepPast(
            () => {
                for (let entry of entries) 
                    idleCall(() => callback(entry, observer));
            })
        );
    }

    function getDimsLegacy(entry)
    {
        return entry.contentRect;
    }

    function getDimsNew(entry)
    {
        return {
            width: entry.contentBoxSize[0].inlineSize, 
            height: entry.contentBoxSize[0].blockSize
        };
    }

    const getDims = entry => (entry.contentBoxSize) ? getDimsNew(entry) : getDimsLegacy(entry);
    

    const createEvent = (kind, index, range) => new CustomEvent(resize.EVENT_TYPE, {
        detail: {kind, index, range}, 
        bubbles: true, 
        cancelable: true
    });

    function dispetchEvents(elem, prop, value) 
    {
        const ranges_string = elem.dataset[prop];
        if(ranges_string === undefined)
            return false;

        const split = ranges.decodeRanges(ranges_string);
        const index = ranges.findRange(split, value);
        if(index === -1)
            return false;

        const event = createEvent(prop, index, split[index]);
        if(resize.DO_LOG)
        {
            const [from, to] = split[index]; 
            console.log(`Element selected for "${prop}" with ${value} in ${from}..${to} : `, elem);
        }

        simpleObserver.observe(elem, () => {elem.dispatchEvent(event);});
        return true;
    }

    function absObserverCallback(elem, dims)
    {
        const area = dims.width * dims.height;

        dispetchEvents(elem, resize.RES_X, dims.width);
        dispetchEvents(elem, resize.RES_Y, dims.height);
        dispetchEvents(elem, resize.RES, area);
    }

    const PIX_TO_SQR_INCHES = viewport.PIXEL_INCH_RATIO * viewport.PIXEL_INCH_RATIO;
    function relativeObserverCallback(elem, dims)
    {
        const rel_x = elem.naturalWidth / dims.width;
        const rel_y = elem.naturalHeight / dims.height;
        const rel_area = rel_x * rel_y;
        const dpi = rel_area / PIX_TO_SQR_INCHES;

        dispetchEvents(elem, resize.RES_RELATIVE, rel_area);
        dispetchEvents(elem, resize.DPI, dpi);
        dispetchEvents(elem, resize.RES_X_RELATIVE, rel_x);
        dispetchEvents(elem, resize.RES_Y_RELATIVE, rel_y);
    }

    function addProperObserver(elem, relative_observer, absolute_observer)
    {
        const is_abs = 
            elem.dataset[resize.RES_X] !== undefined ||
            elem.dataset[resize.RES_Y] !== undefined ||
            elem.dataset[resize.RES] !== undefined;
            
        const is_rel = 
            elem.dataset[resize.RES_X_RELATIVE] !== undefined ||
            elem.dataset[resize.RES_Y_RELATIVE] !== undefined ||
            elem.dataset[resize.RES_RELATIVE] !== undefined ||
            elem.dataset[resize.DPI] !== undefined;

        if(is_abs)
            absolute_observer.observe(elem);
            
        if(is_rel)
            relative_observer.observe(elem);

        if(resize.DO_LOG)
        {
            if(!is_abs && !is_rel)
                console.log('Element doesnt meet any resize criteria: ', elem);
            else
                console.log('Element added to resize: ', elem);
        }
    }

    function createState(elems = []) 
    {
        const state = ResizeState(
            bufferedObserver(entry => absObserverCallback(entry.target, getDims(entry))),
            bufferedObserver(entry => relativeObserverCallback(entry.target, getDims(entry)))
        );

        for(const elem of elems)
            observe(state, elem);
        return state;
    }

    function observe(state, elem)
    {
        addProperObserver(elem, state.relObserver, state.absObserver);
        
        const dims = {
            width: elem.clientWidth,
            height: elem.clientHeight
        };
        idleCall(() => absObserverCallback(elem, dims));
        idleCall(() => relativeObserverCallback(elem, dims));
    }

    function unobserve(state, elem) 
    { 
        state.relObserver.unobserve(elem); 
        state.absObserver.unobserve(elem);  

        if(resize.DO_LOG) 
            console.log('Element removed from resize: ', elem);
    }

    function disconect(state)       
    { 
        state.relObserver.disconect(); state.absObserver.disconect(); 
    }
    // [role="option"]

    function defaultSetup()
    {
        const state = createState();
        const init = (elem) => observe(state, elem);
        const deinit = (elem) => unobserve(state, elem);
        const selector = lib.selector.attribute(ranges.ATTRIBUTE_IMG_RESIZE);

        state.stable_index = lib.stable.add(init, deinit, selector, {name: 'resize'});
        return state;
    }

    if(DO_DEFAULT)
        document.addEventListener('DOMContentLoaded', () => defaultSetup());

    return Object.assign(resize, {
        ResizeState,
        bufferedObserver,
        getDimsLegacy,
        getDimsNew,
        getDims,
        createEvent,
        dispetchEvents,
        absObserverCallback,
        relativeObserverCallback,
        addProperObserver,
        createState,
        observe,
        unobserve,
        disconect,
        defaultSetup,
    });
}
