function importToken(SEPARATOR)
{
    'use strict';

    if(SEPARATOR === undefined) SEPARATOR = ' ';
    const t = {
        SEPARATOR
    };

    function isSeparated(in_string, from, to, sep = t.SEPARATOR)
    {
        if(from >= sep.length)
        {
            if(in_string.slice(from - sep.length, from) !== sep)
                return false;
        }
        else if(from != 0)
            return false;
           
        if(to + sep.length <= in_string.length)
        {
            if(in_string.slice(to, to + sep.length) !== sep)
                return false;
        }
        else if(to != in_string.length)
            return false;

        return true;
    }

    function tokenize(list, sep = t.SEPARATOR) {return list.split(sep);}

    function filterJoin(tokens, sep = t.SEPARATOR)
    {
        let return_str = '';
        let i = 0;
        for(; i < tokens.length; i++)
        {
            if(tokens[i])
            {
                return_str = tokens[i];
                break;
            }
        }   
        
        i++;
        for(; i < tokens.length; i++)
        {
            if(tokens[i])
                return_str += sep + tokens[i];
        }

        return return_str;
    }

    function has(list, token, sep = t.SEPARATOR) 
    {
        const list_tokens = tokenize(list, sep);
        for(let i = 0; i < list_tokens.length; i++)
            if(list_tokens[i] === token)
                return true;
        
        return false;
    }

    function add(list, token, sep = t.SEPARATOR)
    {
        if(!list)
            return token;
        else
            return list + sep + token;
    }

    function remove(list, token, sep = t.SEPARATOR)
    {   
        let list_tokens = tokenize(list, sep);
        for(let i = 0; i < list_tokens.length; i++)
        {
            if(list_tokens[i] === token)
                list_tokens[i] = null;
        }

        return filterJoin(list_tokens, sep);
    }

    function toggle(list, token, sep = t.SEPARATOR)
    {
        let list_tokens = tokenize(list, sep);
        let found = false;
        for(let i = 0; i < list_tokens.length; i++)
        {
            if(list_tokens[i] === token)
            {
                list_tokens[i] = null;
                found = true;
            }
        }

        if(found == false)
            list_tokens.push(token);
        
        return filterJoin(list_tokens, sep);
    }

    function has_multiple(list, tokens, sep = t.SEPARATOR)
    {
        if(tokens.length == 0)
            return false;

        const list_tokens = tokenize(list, sep);
        for(let j = 0; j < tokens.length; j++)
            if(list_tokens.indexOf(tokens[i]) !== -1)
                return false;
        
        return true;
    }

    function add_multiple(list, tokens, sep = t.SEPARATOR)
    {
        if(tokens.length == 0)
            return list;

        if(list)
            list += sep;

        list += tokens[0];
        for(let i = 1; i < tokens.length; i++)
            list += sep + tokens[i];

        return list;
    }

    function remove_multiple(list, tokens, sep = t.SEPARATOR)
    {   
        let list_tokens = tokenize(list, sep);
        for(let j = 0; j < tokens.length; j++)
        {
            for(let i = 0; i < list_tokens.length; i++)
            {
                if(list_tokens[i] === tokens[j])
                    list_tokens[i] = null;
            }
        }

        return filterJoin(list_tokens, sep);
    }
    
    function toggle_multiple(list, tokens, sep = t.SEPARATOR)
    {
        let list_tokens = tokenize(list, sep);
        
        for(let j = 0; j < tokens.length; j++)
        {
            let found = false;
            for(let i = 0; i < list_tokens.length; i++)
            {
                if(list_tokens[i] === tokens[j])
                {
                    list_tokens[i] = null;
                    found = true;
                }
            }

            if(found == false)
                list_tokens.push(tokens[j]);
        }
        
        return filterJoin(list_tokens, sep);
    }

    function clean(list, sep = t.SEPARATOR)
    {
        const list_tokens = tokenize(list, sep);
        return filterJoin(list_tokens, sep);
    }
    
    t.tokenize = tokenize;
    t.filterJoin = filterJoin;
    t.isSeparated = isSeparated;
    t.has = has;
    t.add = add;
    t.remove = remove;
    t.toggle = toggle;
    t.clean = clean;
    t.multiple = {
        has: has_multiple,
        add: add_multiple,
        remove: remove_multiple,
        toggle: toggle_multiple
    };

    return t;
}