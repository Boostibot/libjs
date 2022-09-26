
function importObject()
{
    'use strict';

    function isObject(item) 
    {
        return (item && typeof item === 'object');
    }

    function assignDepthBody(to, from, from_property, depth_limit = Infinity, depth = 1) 
    {
        const from_item = from[from_property];
        if(isObject(from_item))
        {
            if(Array.isArray(from_item))
                to[from_property] = Array(from_item.length);
            else
                to[from_property] = {};
            assignDepth(to[from_property], from_item, depth_limit, depth + 1);
        }
        else
            to[from_property] = from_item;
    }

    function assignDepth(to, from, depth_limit = Infinity, depth = 1)
    {        
        if(depth > depth_limit)
            return;

        if(Array.isArray(from))
        {
            for(const from_property in from)
                if(isNaN(from_property) == false)
                    assignDepthBody(to, from, from_property, depth_limit, depth);
        }
        else
        {
            for(const from_property in from)
                assignDepthBody(to, from, from_property, depth_limit, depth);
        }

        return to;
    }

    function mergeDepthBody(to, from, from_property, depth_limit = Infinity, depth = 1) 
    {
        const from_item = from[from_property];
        if(from_property in to == false)
        {
            if(isObject(from_item))
            {
                if(Array.isArray(from_item))
                    to[from_property] = Array(from_item.length);
                else
                    to[from_property] = {};
                    assignDepth(to[from_property], from_item, depth_limit, depth + 1);
            }
            else
                to[from_property] = from[from_property];
        }
        else
        {
            if(isObject(to[from_property]) && isObject(from_item))
                mergeDepth(to[from_property], from_item, depth_limit, depth + 1);
        }
    }

    function mergeDepth(to, from, depth_limit = Infinity, depth = 1) 
    {
        if(depth > depth_limit)
            return;

        if(Array.isArray(from))
        {
            for(const from_property in from)
                if(isNaN(from_property) == false)
                    mergeDepthBody(to, from, from_property, depth_limit, depth);
        }
        else
        {
            for(const from_property in from)
                mergeDepthBody(to, from, from_property, depth_limit, depth);
        }
        
        return to;
    }

    
    function getProperty(object, path, from_depth = 0, depth_limit = path.length) 
    {
        let property = object;
        for(let i = from_depth; i < depth_limit; i++)
        {
            if(isObject(property) == false)
                return undefined;

            const path_fragment = path[i]; 
            property = property[path_fragment];
        }

        return property;
    }

    function addPath(object, path, from_depth = 0, depth_limit = path.length)
    {
        let current = object;
        for(let i = from_depth; i < depth_limit; i++)
        {
            const path_fragment = path[i]; 
            if(path_fragment in current == false)
                current[path_fragment] = {};
            
            current = current[path_fragment];
        }

        return current;
    }

    function setProperty(object, path, value, from_depth = 0, depth_limit = path.length)
    {
        if(depth_limit < 1)
            return null;

        let second_last = addPath(object, path, from_depth, depth_limit - 1);
        second_last[path[depth_limit - 1]] = value;
        return second_last;
    }

    function copy(object)
    {
        if(Array.isArray(object))
            return assignDepth([], object);
        else
            return assignDepth({}, object);
    }

    function changeToDepth(object, change_by, depth_limit = Infinity, depth = 1)
    {
        let copied = copy(object);
        return assignDepth(copied, change_by, depth_limit, depth);
    }
    
    function extendToDepth(object, extend_with, depth_limit = Infinity, depth = 1)
    {
        let copied = copy(object);
        return mergeDepth(copied, extend_with, depth_limit, depth);
    }

    return {
        isObject,
        assignDepthBody,
        assignDepth,
        mergeDepthBody,
        mergeDepth,
        copy,
        changeToDepth,
        extendToDepth,
        getProperty,
        addPath,
        setProperty,

        firstPair,
    };
}