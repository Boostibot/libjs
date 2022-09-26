
function importCustomQueryDown()
{
    'use strict';
    
    function find(check, from = document, depth_limit = Infinity, depth = 1, index = 0) 
    {
        if(!from || depth > depth_limit)
            return null;

        if(check(from, depth, index, depth_limit))
            return from;

        const childrenlength = from.children.length; 
        for(let i = 0; i < childrenlength; i++)
        {
            const returned = find(check, from.children[i], depth_limit, depth + 1, i);
            if(returned != null)
                return returned;
        }

        return null;
    }

    function findAll(check, from = document, depth_limit = Infinity, depth = 1, index = 0, found = []) 
    {
        if(!from || depth > depth_limit)
            return found;

        if(check(from, depth, index, depth_limit))
            found.push(from);

        const childrenlength = from.children.length; 
        for(let i = 0; i < childrenlength; i++)
            findAll(check, from.children[i], depth_limit, depth + 1, i, found);

        return found;
    }

    function single(check, from = document, depth_limit = Infinity, depth = 1) 
    {
        if(!from)
            return null;

        const childrenlength = from.children.length; 
        for(let i = 0; i < childrenlength; i++)
        {
            const returned = find(check, from.children[i], depth_limit, depth, i);
            if(returned != null)
                return returned;
        }

        return null;
    }

    function all(check, from = document, depth_limit = Infinity, depth = 1, found = []) 
    {
        if(!from)
            return found;

        const childrenlength = from.children.length; 
        for(let i = 0; i < childrenlength; i++)
            findAll(check, from.children[i], depth_limit, depth, i, found);

        return found;
    }

    return {
        find,
        findAll,
        single,
        all,
    };
}
