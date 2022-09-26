function importStableElement(lib, _throttle, _do_debug)
{
    'use strict';

    //TODO: add global map of states used to freeze/unfreeze and as default argument
    // add option to prevent freezing
    // make getState smarter and general

    if(_do_debug === undefined) _do_debug = true;

    requireMember(lib, 'selector');
    
    function idleCall(callback) { 
        return window.requestIdleCallback(callback);
    }

    function makeState(functions = [], selectors = [], names = [], elem_maps = [], observer = null, connected = true)
    {
        return {functions, elem_maps, selectors, observer, names, connected};
    }

    function map_disjoint(from, to, callback)
    {
        from.forEach((i, elem) => {
            if(to.has(elem) === false)
                callback(i, elem);
        });
    }

    function update(state) 
    {
        const to = state.selectors.length;
        const new_maps = new Array(to);
        for(let i = 0; i < to; i++)
        {
            new_maps[i] = new Map();
            const selector = state.selectors[i];
            if(selector === undefined)
                continue;

            const found_elems = document.querySelectorAll(selector);
            for(const found of found_elems)
                new_maps[i].set(found, i);
        }

        for(let i = 0; i < to; i++) 
            map_disjoint(new_maps[i], state.elem_maps[i], (i, elem) => {
                const elem_functions = state.functions[i];
                elem_functions.init(elem);
            });
        
        for(let i = 0; i < to; i++) 
            map_disjoint(state.elem_maps[i], new_maps[i], (i, elem) => {
                const elem_functions = state.functions[i];
                elem_functions.deinit(elem);
            });
        
        if(_do_debug)
        {
            const add = [];
            const remove = [];
            
            for(let i = 0; i < to; i++) 
                map_disjoint(new_maps[i], state.elem_maps[i], 
                    (i, elem) => add.push([state.names[i], elem])
                );
            
            for(let i = 0; i < to; i++) 
                map_disjoint(state.elem_maps[i], new_maps[i], 
                    (i, elem) => remove.push([state.names[i], elem])
                );
            
            if(add.length !== 0)
                console.log('Stable init:', add);
            if(remove.length !== 0)
                console.log('Stable deinit:', remove);
        }

        state.elem_maps = new_maps;
    }

    function createObserver(state, throttle)
    {
        const throttled = throttle(() => update(state));
        const observer = new MutationObserver(() => {
            if(!state.connected)
                return;

            throttled();
        });

        observer.observe(document.body, {
            subtree: true,
            attributes: true,
            childList: true,
        });

        return observer;
    }

    const stable = {
        idleCall, 
        makeState,
        update,
        createObserver,
    };

    function slowBuffering(update)
    {
        if(_throttle === undefined)
            return fastBuffering(update);

        const sleepPast = _throttle.createSleepPast();
        return () => {
            sleepPast(() => {
                idleCall(update);
            });
        };
    }

    function fastBuffering(update)
    {
        return () => idleCall(update);
    }

    stable.slow_state = makeState();
    stable.slow_state.observer = createObserver(stable.slow_state, slowBuffering);

    function getState(options = {}, state = undefined)
    {
        if(state !== undefined)
            return state;
            
        if(options.fast === true || options.slow === false)
        {
            if(stable.fast_state === undefined)
            {
                stable.fast_state = makeState();
                stable.fast_state.observer = createObserver(stable.fast_state, fastBuffering);
            }
            return stable.fast_state;
        }
        else
            return stable.slow_state;
    }

    function add(init, deinit, selector, options = {}, state = undefined)
    {
        state = getState(options, state);

        assert(state.selectors.length === state.functions.length);
        const index = state.selectors.length;

        state.names.push(options.name || null);
        state.selectors.push(selector);
        state.functions.push({init, deinit});
        state.elem_maps.push(new Map());

        update(state);
        return {index, state};
    }

    function remove(group)
    {   
        group.state.selectors[group.index] = undefined;
        update(group.state);
    }

    
    function freeze(state = stable.slow_state)
    {
        state.connected = false;
    }

    function unfreeze(state = stable.slow_state)
    {
        state.connected = true;
    }

    function forget(callback, state = stable.slow_state)
    {
        state = getState(options, state);
        state.connected = false;
        callback();
        state.connected = true;
        return state;
    }

    function pause(callback, state = stable.slow_state)
    {
        forget(callback, state);
        update(state);
        return state;
    }

    stable.add = add;
    stable.remove = remove;
    stable.freeze = freeze;
    stable.unfreeze = unfreeze;
    stable.forget = forget;
    stable.pause = pause;

    return stable;
}
