function importQuery(lib)
{
    const helpers = importQueryHelpers(lib);
    const query = importQueryDown(lib, helpers);
    query.helpers = helpers;

    return query;
}

function importQueryHelpers(lib)
{
    'use strict';
    requireMember(lib, '@base');
    function optionalAssignState(collection, state, value)
    {
        if(!collection && lib.isRef(state))
            lib.refSet(state, value);

        return collection;
    }

    return {
        optionalAssignState,
    };
}

function importQueryDown(lib, helpers)
{
    'use strict';
    requireMember(lib, '@base');
    if(helpers === undefined) helpers = importQueryHelpers(lib);

    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.msMatchesSelector ||
                                    Element.prototype.webkitMatchesSelector;
    }

    function id(id, state = null) 
    {
        const selected = document.getElementById(id);
        return helpers.optionalAssignState(selected, state, false);
    }

    function _class(class_, from = document) 
    {
        if(!lib.isElement(from))
            return [];

        return lib.makeArray(from.getElementsByClassName(class_));
    }

    function tag(class_, from = document) 
    {
        if(!lib.isElement(from))
            return [];

        return lib.makeArray(from.getElementsByTagName(class_));
    }

    function single(selector, from = document, state = null) 
    {
        if(!lib.isElement(from))
            return null;

        const selected = from.querySelector(selector);
        return helpers.optionalAssignState(selected, state, false);
    }

    function all(selector, from = document) 
    {
        if(!lib.isElement(from))
            return [];

        return lib.makeArray(from.querySelectorAll(selector));
    }

    return {
        id,
        class: _class,
        tag,
        single,
        all,
    };
}
