function importVision(ARRIA_HIDDEN, CLASS_HIDDEN)
{
    'use strict';
        
    if(ARRIA_HIDDEN === undefined) ARRIA_HIDDEN = 'aria-hidden';
    if(CLASS_HIDDEN === undefined) CLASS_HIDDEN = 'hidden';

    const v = {
        ARRIA_HIDDEN,
        CLASS_HIDDEN,
    };

    const sr = {
        hide: function(elem) { elem.setAttribute(v.ARRIA_HIDDEN, 'true'); },
        show: function(elem) { elem.removeAttribute(v.ARRIA_HIDDEN); },    
        visible: function(elem, _class = v.CLASS_HIDDEN) { return !elem.hasAttribute(v.ARRIA_HIDDEN); },
        hidden:  function(elem, _class = v.CLASS_HIDDEN) { return elem.hasAttribute(v.ARRIA_HIDDEN); }
    };

    const vis = {
        hide: function(elem, _class = v.CLASS_HIDDEN) { elem.classList.add(_class); },
        show: function(elem, _class = v.CLASS_HIDDEN) { elem.classList.remove(_class); },
        visible: function(elem, _class = v.CLASS_HIDDEN) { return !elem.classList.contains(_class); },
        hidden:  function(elem, _class = v.CLASS_HIDDEN) { return elem.classList.contains(_class); }
    };
    
    function hide(elem, _class = v.CLASS_HIDDEN) {
        sr.hide(elem, _class);
        vis.hide(elem, _class);
    }

    function show(elem, _class = v.CLASS_HIDDEN) {
        sr.show(elem, _class);
        vis.show(elem, _class);
    }

    function visible(elem, _class = v.CLASS_HIDDEN) {
        return sr.visible(elem, _class) || 
            vis.visible(elem, _class);
    }

    function hidden(elem, _class = v.CLASS_HIDDEN) {
        return sr.hidden(elem, _class) && 
            vis.hidden(elem, _class);
    }

    v.sr = sr;
    v.vis = vis;
    v.hide = hide;
    v.show = show;
    v.visible = visible;
    v.hidden = hidden;
    
    return v;
}