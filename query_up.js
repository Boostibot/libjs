
function importQueryUp(lib, helpers)
{
    'use strict';
    if(helpers === undefined) helpers = importQueryHelpers(lib);

    function find(check, from, depth_limit = Infinity) 
    {
        for(let depth = 0; depth < depth_limit; depth ++)
        {
            if(!from)
                return null;

            if(check(from, depth, depth_limit))
                return from;
            else
                from = from.parentNode;
        }

        return null;
    }

    function findAll(check, from, depth_limit = Infinity) 
    {
        let found = [];

        //depth = 1; depth <= depth limit
        for(let depth = 0; depth < depth_limit; depth ++)
        {
            if(!from)
                return found;

            if(check(from, depth, depth_limit))
                found.push(from);
            
            from = from.parentNode;
        }

        return found;
    }
    
    return {
        custom: {
            singleIncluding: find,
            allIncluding: findAll,

            single: function(check, from, depth_limit = Infinity) 
            { 
                if(!from)
                    return null;

                return find(check, from.parentNode, depth_limit);
            },
            all: function(check, from, depth_limit = Infinity) 
            {
                if(!from)
                    return [];

                return findAll(check, from.parentNode, depth_limit);
            }
        },
        
        id: function(id, from, state = null) 
        {   
            const selected = find(elem => elem.id === id, from);
            return helpers.optionalAssignState(selected, state, false);
        },

        class: function(class_, from, iter_callback = null) 
        {
            return findAll(elem => elem.className === class_, from);
        },

        tag: function(tag, from, iter_callback = null) 
        {
            return findAll(elem => elem.tagName === tag, from);
        },

        single: function(selector, from, state = null) 
        {
            const selected = find(elem => elem.matches(selector), from);
            return helpers.optionalAssignState(selected, state, false);
        },

        all: function(selector, from, iter_callback = null) 
        {
            return findAll(elem => elem.matches(selector), from);
        }
    };
}