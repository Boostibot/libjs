
function importClass(token)
{
    'use strict';
    assert(token);
    const t = token;
    const mt = token.multiple;

    function native()
    {
        function has(elem, classes)    {return elem.classList.contains(classes);}
        function add(elem, classes)    {return elem.classList.add(classes);}
        function remove(elem, classes) {return elem.classList.remove(classes);}
        function toggle(elem, classes) {return elem.classList.toggle(classes);}

        return {
            has,
            add,
            remove,
            toggle,
        };
    }

    function added()
    {
        function has(elem, classes)    {return mt.has(elem.classList, t.tokenize(classes));}
        function add(elem, classes)    {a.className = mt.add(elem.classList, t.tokenize(classes));}
        function remove(elem, classes) {a.className = mt.remove(elem.classList, t.tokenize(classes));}
        function toggle(elem, classes) {a.className = mt.toggle(elem.classList, t.tokenize(classes));}
        
        return {
            has,
            add,
            remove,
            toggle,
        };
    }

    const elem = document.createElement('div');
    if(elem.classList)
        return native();
    else
        return added();
}
