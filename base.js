function importBase()
{ 
    const lib = {};

    lib.obj = importObject();
    lib.fmt = importFormat();
    lib.dbg = importDebug();
    lib.ref = importRef();
    lib.math = importMath();
    lib.iter = importIteratable();
    lib.util = importUtility();
    lib.arr = importArray();
    
    lib.obj.merge(lib, lib.dbg);
    lib.obj.merge(lib, lib.ref);
    lib.obj.merge(lib, lib.math);
    lib.obj.merge(lib, lib.iter);
    lib.obj.merge(lib, lib.util);
    
    lib.obj.addProperty(lib, '@base');

    return lib;
}

function importArray()
{
    'use strict';

    function mapInplace(arr, transf) {
        for(let i = 0; i < arr.length; i++)
            arr[i] = transf(arr[i], i, arr);
    }

    function filterInplace(arr, filter) {
        let filledTo = 0;
        for(let i = 0; i < arr.length; i++)
        {
            if(filter(arr[i], i, arr))
            {
                arr[filledTo] = arr[i];
                filledTo++;
            }
        }

        arr.length = filledTo;
        return arr;
    }

    function concat(to, appended) {
        return [].push.apply(to, appended);
    }
    
    function enforce(val) {
        if(Array.isArray(val))
            return val;
        else
            return [val];
    }

    function make(iteratable, from = 0, to = iteratable.length) {return [].slice.call(iteratable, from, to);}

    return {
        mapInplace,
        filterInplace,
        concat,
        enforce,
        make,
    };
}

function importRef() 
{
    'use strict';

    function Ref(val = undefined)   {return {val: val};}
    function refSet(ref, val)       {ref.val = val; return val;}
    function refGet(ref)            {return ref.val;}
    function isRef(ref)             {return (ref && typeof ref === 'object' && 'val' in ref);}

    return {
        Ref,
        refSet,
        refGet,
        isRef,
    };
}

function importMath() 
{
    'use strict';

    function lerp(min, max, scale)          {return (min - max) * scale + min;}
    function floor(val, toMultipleOf = 1)   {return toMultipleOf * Math.floor(val / toMultipleOf);}
    function ceil(val, toMultipleOf = 1)    {return toMultipleOf * Math.ceil(val / toMultipleOf);}
    function round(val, toMultipleOf = 1)   {return toMultipleOf * Math.round(val / toMultipleOf);}
    function mod(val, range)                {return ((val % range) + range) % range;}
    function clamp(min, max, val)
    {
        if(val < min)
            val = min;
        else if(val > max)
            val = max;
        
        return val;
    }

    return {
        lerp,
        floor,
        ceil,
        round,
        mod,
        clamp,
        min: Math.min,
        max: Math.max,
    };
}

function importIteratable()
{
    'use strict';

    function isIteratable(val) {return typeof(val) === "object" && "length" in val;}

    function makeArray(iteratable, from = 0, to = iteratable.length) {return [].slice.call(iteratable, from, to);}

    function find(iteratable, callbackFn, from = 0, to = iteratable.length, breakAt = true)
    {   
        for(let i = from; i < to; i++)
            if(i in iteratable)
            {
                if(callbackFn(iteratable[i], i, iteratable) === breakAt)
                    return i;
            }

        return -1;
    }

    function foreach(iteratable, callbackFn, from = 0, to = iteratable.length, breakAt = false) 
    {
        for(let i = from; i < to; i++)
            if(i in iteratable)
            {
                if(callbackFn(iteratable[i], i, iteratable) === breakAt)
                    return breakAt;
            }

        return false;
    }

    function foreachReverse(iteratable, callbackFn, from = 0, to = iteratable.length, breakAt = false) 
    {
        for(let i = to; i --> from;)
            if(i in iteratable)
            {
                if(callbackFn(iteratable[i], i, iteratable) === breakAt)
                    return breakAt;
            }

        return false;
    }
    
    function equal(iter1, iter2)
    {
        if(iter1.length != iter2.length)
            return iter1.length - iter2.length;

        for(let i = 0; i < iter1.length; i++)
            if(iter1[i] !== iter2[i])
                return false;

        return 0;
    }

    function compare(iter1, iter2) 
    {
        if(iter1.length != iter2.length)
            return iter1.length - iter2.length;

        for(let i = 0; i < iter1.length; i++)
        {
            const val1 = iter1[i];
            const val2 = iter2[i];

            if(val1 !== val2)
            {
                const type1 = typeof val1;
                const type2 = typeof val2;
                if(type1 !== type2)
                    return type1.localeCompare(type2, 'en');

                if(val1 > val2)
                    return 1;
                else 
                    return -1;
            }
        }

        return 0;
    }

    return {
        isIteratable,
        makeArray,
        find,
        foreach,
        foreachReverse,
        equal,
        compare,
    };
}

function importUtility()
{
    'use strict';

    function isObject(item)     {return item && typeof item === 'object';}
    function isFunction(item)   {return typeof item === 'function';}
    function isArray(item)      {return Array.isArray(item);}
    function isElement(element) {return element instanceof Element || element instanceof Document;}

    function clock() {return new Date().getTime();}
    function counter(initial = 0) {return (counter.i = ++counter.i || initial);}

    return {
        isArray,
        isElement,
        isFunction,
        isObject,
        clock,
        counter,
    };
}

function importObject()
{
    'use strict';

    function isObject(item) 
    {
        return (item && typeof item === 'object');
    }

    function addProperty(obj, name, val = {})
    {
        if(name in obj === false)
            obj[name] = val;

        return obj;
    }

    function addEntry(obj, keyValPairs)
    {
        for(const name in keyValPairs)
            obj[name] = keyValPairs[name];

        return obj;
    }
    
    function generatePairs(associative_data, name_transform, value_transform) 
    {
        let return_val = {};
        let i = 0;
        for(const name in associative_data)
        {
            const value = associative_data[name];
            const transformed_name = name_transform(name, value, associative_data, i);
            const transformed_value = value_transform(name, value, associative_data, i);
            return_val[transformed_name] = transformed_value;

            i++;
        }

        return return_val;
    }

    function exposePrivate(subLib) 
    {
        return merge(subLib, subLib['%private']);
    }

    function assignBody(to, from, from_property) 
    {
        const from_item = from[from_property];
        if(isObject(from_item))
        {
            if(Array.isArray(from_item))
                to[from_property] = new Array(from_item.length);
            else
                to[from_property] = {};
            assign(to[from_property], from_item);
        }
        else
            to[from_property] = from_item;
    }

    function assign(to, from)
    {        
        if(Array.isArray(from))
        {
            for(const from_property in from)
                if(isNaN(from_property) == false)
                    assignBody(to, from, from_property);
        }
        else
        {
            for(const from_property in from)
                assignBody(to, from, from_property);
        }

        return to;
    }

    function mergeBody(to, from, from_property) 
    {
        const from_item = from[from_property];
        if(from_property in to == false)
        {
            if(isObject(from_item))
            {
                if(Array.isArray(from_item))
                    to[from_property] = new Array(from_item.length);
                else
                    to[from_property] = {};
                assign(to[from_property], from_item);
            }
            else
                to[from_property] = from[from_property];
        }
        else
        {
            if(isObject(to[from_property]) && isObject(from_item))
               merge(to[from_property], from_item);
        }
    }

    function merge(to, from) 
    {
        if(Array.isArray(from))
        {
            for(const from_property in from)
                if(isNaN(from_property) == false)
                    mergeBody(to, from, from_property);
        }
        else
        {
            for(const from_property in from)
                mergeBody(to, from, from_property);
        }
        
        return to;
    }

    function copy(object)
    {
        if(Array.isArray(object))
            return assign([], object);
        else
            return assign({}, object);
    }

    
    function change(object, change_by)
    {
        let copied = copy(object);
        return assign(copied, change_by);
    }

    function extend(object, extend_with)
    {
        let copied = copy(object);
        return merge(copied, extend_with);
    }

    return {
        addProperty,
        addEntry,
        generatePairs,
        exposePrivate,

        isObject,
        assign,
        merge,
        
        change,
        extend,
        copy,
    };
}

function importFormat(OFFSET, SEPARATOR, NEWLINE)
{
    'use strict';
    if(OFFSET === undefined)    OFFSET = '   ';
    if(SEPARATOR === undefined) SEPARATOR = ', ';
    if(NEWLINE === undefined)   NEWLINE = '\n';
    
    const fmt = {
        OFFSET,
        SEPARATOR,
        NEWLINE,
        FORMATTER: val => String(val)
    };

    function DEF_AGREGATOR(out, from, to, arr) {
        if(from !== to) 
            out.push(arr.slice(from, to));
    }

    function split(array, identifier, agregator = DEF_AGREGATOR, pastEnd = agregator,  out = []) {
        let lastFrom = 0;
        for(let i = 0; i < array.length; i++)
        {
            if(identifier(array[i], i, array))
            {
                agregator(out, lastFrom, i, array);
                lastFrom = i + 1;
            }
        }

        pastEnd(out, lastFrom, array.length, array);
        return out;
    }

    function toWords(array, identifier = x => x === ' ', agregator = DEF_AGREGATOR, out = []) {
        let lastFrom = -1;
        for(let i = 0; i < array.length; i++)
        {
            if(lastFrom === -1 && identifier(array[i], i, array))
                lastFrom = i;
            else if(!identifier(array[i], i, array))
            {
                agregator(out, lastFrom, i, array);
                lastFrom = -1;
            }
        }

        if(lastFrom !== -1)
            agregator(out, lastFrom, i, array);

        return out;
    }

    function join(collection, separator = fmt.SEPARATOR, formatter = fmt.FORMATTER)
    {
        if(collection.length == 0)
            return  '';

        let accumulated = formatter(collection[0], 0);
        for(let i = 1; i < collection.length; i ++)
            accumulated += separator + formatter(collection[i], i);
        
        return accumulated;
    }

    function offset(text, offsetWith = fmt.OFFSET, newline = fmt.NEWLINE)
    {
        let accumulated = '';
        let i = 0;
        for(;;)
        {
            let newI = text.indexOf(newline, i + 1);
            if(newI === -1)
                break;

            newI ++;
            accumulated += offsetWith + text.slice(i, newI);
            i = newI;
        }

        accumulated += offsetWith + text.slice(i, text.length);
        return accumulated;
    }

    const offsetMany = (text, count, offsetWith = fmt.OFFSET, newline = fmt.NEWLINE) => 
        offset(text, offsetWith.repeat(count), newline);
    
    function stringify(variable, nl = '', sep = fmt.SEPARATOR, off = fmt.OFFSET)
    {
        switch(typeof variable)
        {
            case 'function':
            case 'boolean':
            case 'number':
            case 'bigint':
            case 'symbol':
                return variable.toString();

            case 'string':
                return "'" + variable + "'";

            case 'undefined':
                return 'undefined';

            case 'object':
                if(variable === null)
                    return 'null';
                
                const subStringify = val => stringify(val, nl, sep, off); 
                if(Array.isArray(variable))
                {
                    if(nl === '')
                        return '[' + join(variable, sep, subStringify) + ']';
                    
                    return '[' + nl + 
                        offset(join(variable, sep + nl, subStringify, nl), off, nl) +
                    nl + ']';
                }
                else
                {
                    let first = true;
                    let accumulated = '';
                    const combined = sep + nl;

                    for(let prop_name in variable)
                    {
                        if(first)
                            first = false;
                        else
                            accumulated += combined;

                        accumulated += prop_name + ': ';
                        accumulated += subStringify(variable[prop_name]);
                    }

                    if(nl === '')
                        return '{' + accumulated + '}';
                    else
                        return '{' + nl + offset(accumulated, off, nl) + nl + '}';
                }
        }
    }

    fmt.split = split;
    fmt.toWords = toWords;
    fmt.join = join;
    fmt.offset = offset;
    fmt.offsetMany = offsetMany;
    fmt.stringify = stringify;

    return fmt;
}

function importDebug(IS_DEBUG)
{
    'use strict';
    if(IS_DEBUG === undefined) IS_DEBUG = true;

    function getRawTrace() 
    {
        try { throw new Error(); } 
        catch(e) { return e.stack; }
    }

    function getTrace(linesToRemove = 1) 
    {
        let trace = getRawTrace();

        for(;linesToRemove > 0; linesToRemove--)
            trace = trace.substring(trace.indexOf("\n") + 1); 
            
        trace = trace.replace('\n@', '\nindex() :');
        return trace.replaceAll('@', '() : ');
    }
    
    const debugAssert = (condition, info = "") => {
        if(!condition)
        {
            if(!info)
                throw new Error("Assertion failed: " + getTrace(2));
            else
                throw new Error("Assertion failed with: '" + info + "' : " + getTrace(2));
        }
    };

    const runtimeAssert = (_) => {} ;
    const assert = IS_DEBUG ? debugAssert : runtimeAssert;

    return {
        getRawTrace,
        getTrace,
        debugAssert,
        runtimeAssert,
        assert,
    };
}
