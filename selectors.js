function importDataSpecifiers()
{
    'use strict';
    return {
        ID: 'id',
        TYPE: 'type',
        TAG: 'tag',
        SRC: 'src',
        ALT: 'alt',
        
        INDEX: 'index',
        SELECTED: 'selected',
    };
}

function importSelectors(lib, DATA)
{
    'use strict';
    requireMember(lib, '@base');

    if(DATA === undefined) DATA = importDataSpecifiers();
    
    const obj = lib.obj;

    function id(id)             {return '#' + id;}
    function class_s(class_)    {return '.' + class_;}
    function tag(tag)           {return tag;}
    function role(role)         {return attribute('role', role);}
    function type(type)         {return attribute('type', type);}

    function attribute(property, value = undefined)  
    {
        if(value === undefined)
            return "[" + property + "]";
        else
            return "[" + property + "='" + value +"']";
    }

    function specifierName(name) {return 'DATA_' + name;}
    function selectorName(name) {return 'data_' + name.toLowerCase();}

    const s = {
        DATA,
        id,
        tag,
        attribute,
        role,
        type,
        class: class_s,
        meta: {
            specifierName,
            selectorName,
        }
    };

    const dataSpecifiers = obj.generatePairs(DATA, 
        specifierName,
        (_, value) => 'data-' + value
    );

    const dataSelectors = obj.generatePairs(DATA, 
        selectorName,

        name => {
            const transformedName = specifierName(name);
            return function(value) {
                return attribute(dataSpecifiers[transformedName], value);
            };
        }
    );

    obj.merge(s, dataSpecifiers);
    obj.merge(s, dataSelectors);
    return s;
}

function importUnique(PREFIX, SEPARATOR, RANDOM, GENERATOR) 
{
    'use strict';

    function gen() {return (gen.i = ++gen.i || 0);}
    function rand() {return Math.floor(Math.random() * 10000);}

    if(PREFIX === undefined)    PREFIX = '';
    if(SEPARATOR === undefined) SEPARATOR = '_';
    if(RANDOM === undefined)    RANDOM = rand;
    if(GENERATOR === undefined) GENERATOR = gen;

    const o = {
        PREFIX,
        SEPARATOR,
        RANDOM,
        GENERATOR,
    };
    
    function generate(check_function, 
                      prefix = o.PREFIX, separator = o.SEPARATOR, 
                      random = o.RANDOM, generator = o.GENERATOR)
    {   
        let current = prefix;
        if(!current)
            current += generator();
        else
            current += separator + generator();

        while(check_function(current) == false)
            current += separator + random();

        return current;
    }

    function id(prefix = o.PREFIX, separator = o.SEPARATOR, 
                random = o.RANDOM, generator = o.GENERATOR) 
    {
        return generate(id => !document.getElementById(id), prefix, separator, random, generator);
    }
    
    o.generate = generate;
    o.id = id;

    return o;
}

function importUniqueSelectors(lib, unique, selectors) 
{
    'use strict';
    requireMember(lib, '@base');
    
    if(unique === undefined) unique = importUnique();
    if(selectors === undefined) selectors = importSelectors(lib);

    const obj = lib.obj;
    const query = lib.query;
    const DATA = selectors.DATA;

    const pairs = obj.generatePairs(DATA, 
        name => selectors.meta.selectorName(name),

        name => {
            const selectorName = selectors.meta.selectorName(name);
            const selector = selectors[selectorName];
            const uniqueChecker = (checked, inScope) => !query.single(selector(checked), inScope);

            return function(inScope, prefix = o.PREFIX, separator = o.SEPARATOR, 
                            random = o.RANDOM, generator = o.GENERATOR)
            {
                return unique.generate(val => uniqueChecker(val, inScope), prefix, separator, random, generator);
            };
        }
    );

    return pairs;
}
