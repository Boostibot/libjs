function importListbox(ListboxBase, vision, KEYCODE, _auto_setup)
{
    'use strict';
    if(_auto_setup === undefined) 
        _auto_setup = true;
    else    
        _auto_setup = false;

    const DO_DEBUG = true;

    function Listbox(group, button, limitter, options) {
        const listbox = new ListboxBase(options);
        listbox.button = button;
        listbox.group = group;
        listbox.limitter = limitter;
        listbox.inClick = false;
        listbox.selected = null;
        listbox.events = {};
        
        listbox.addEvent(listbox.button, 'click',     event => showListbox(listbox, event));
        listbox.addEvent(listbox.button, 'keyup',     event => checkShow(listbox, event));
        listbox.addEvent(listbox.button, 'mousedown', () => listbox.inClick = true);
        listbox.addEvent(listbox.button, 'mouseup',   () => listbox.inClick = false);

        //inClick solves a bug that makes listbox lose focus for a split second when clicking on itself while focused on itself
        // This causes the blur event to fire followed by the click event - this closes the dropdown and then opens it again
        // preveneting us implementing behaviour that closes it by clciking on it
        listbox.addEvent(listbox.options, 'blur',   event => {
            if(!listbox.inClick)
                hideListbox(listbox, event); 
        });
        listbox.addEvent(listbox.options, 'keydown', event => checkHide(listbox, event));
        listbox.setHandleFocusChange(               element => onFocusChange(listbox, element));
        listbox.setHandleOptionClicked(             element => onOptionClicked(listbox, element));
        listbox.setHandleItemChange(                (kind, items) => onItemChange(listbox, kind, items));

        return listbox;
    };


    function checkShow(listbox, event) {
        let key = event.which || event.keyCode;

        switch (key) {
            case KEYCODE.UP:
            case KEYCODE.DOWN:
                event.preventDefault();
                showListbox(listbox, event);
                listbox.checkKeyPress(event);
            break;
        }
    };

    function checkHide(listbox, event) {
        let key = event.which || event.keyCode;

        switch (key) {
            case KEYCODE.RETURN:
            case KEYCODE.ESC:
                event.preventDefault();
                hideListbox(listbox);
                listbox.button.focus();
            break;
        }
    };

    function hide_options(listbox)
    {
        const listboxClose = new CustomEvent('listboxClose', {
            detail: {
                listbox: listbox, 
            }, 
            bubbles: true, 
            cancelable: true
        });

        listbox.group.dispatchEvent(listboxClose);

        vision.hide(listbox.limitter);
        listbox.button.removeAttribute('aria-expanded');
        listbox.options.blur();
        listbox.timer = Date.now();
    }

    function show_options(listbox)
    {
        const listboxOpen = new CustomEvent('listboxOpen', {
            detail: {
                listbox: listbox, 
            }, 
            bubbles: true, 
            cancelable: true
        });

        listbox.group.dispatchEvent(listboxOpen);

        vision.show(listbox.limitter);
        listbox.button.setAttribute('aria-expanded', 'true');
        listbox.options.focus();
        listbox.timer = Date.now();
    }

    function showListbox(listbox, event) {
        if(vision.hidden(listbox.limitter))
        {
            show_options(listbox);
            listbox.checkClickItem(event);
        }
        else
        {
            hide_options(listbox);
        }
    };

    function hideListbox(listbox) {
        hide_options(listbox);
    };

    function onOptionClicked(listbox, focusedItem) {
        listbox.button.innerText = focusedItem.innerText;
        listbox.selected = focusedItem;
        
        const listboxOptionSelected = new CustomEvent('listboxOptionSelected', {
            detail: {
                listbox, 
            }, 
            bubbles: true, 
            cancelable: true
        });

        focusedItem.dispatchEvent(listboxOptionSelected);
    };

    
    function onFocusChange(listbox, focusedItem) {
        const listboxFocusChange = new CustomEvent('listboxFocusChange', {
            detail: {
                listbox, 
            }, 
            bubbles: true, 
            cancelable: true
        });

        focusedItem.dispatchEvent(listboxFocusChange);
    };


    function onItemChange(listbox, kind, items) {
        const listboxItemChanged = new CustomEvent('listboxItemChanged', {
            detail: {
                kind,
                items,
                listbox, 
            }, 
            bubbles: true, 
            cancelable: true
        });

        listbox.options.dispatchEvent(listboxItemChanged);
    };

    
    function deinitListbox(listbox)
    {
        listbox.removeEvent(listbox.button, 'click');
        listbox.removeEvent(listbox.button, 'keyup');
        listbox.removeEvent(listbox.button, 'mousedown');
        listbox.removeEvent(listbox.button, 'mouseup');
        listbox.removeEvent(listbox.options, 'blur');
        listbox.removeEvent(listbox.options, 'keydown');
        listbox.deinitEvents();
    }

    const settings = {
        ATTRIBUTE: 'data-type',
        DATA_TYPE_LISTBOX: 'listbox',
        DATA_TYPE_BUTTON: 'listbox_button',
        DATA_TYPE_LIMITTER: 'listbox_limitter',
        DATA_TYPE_OPTIONS: 'listbox_options',
    }

    function initListbox(listbox_group) 
    {
        const get = (value) =>
            listbox_group.querySelector(lib.selector.attribute(settings.ATTRIBUTE, value)); 

        const button = get('listbox_button');
        const limitter = get('listbox_limitter');
        const options = get('listbox_options');

        if(!button || !limitter || !options)
        {
            if(DO_DEBUG) 
                console.log("The following listbox group is lacking some of its members (listbox_button, listbox_limitter, listbox_options)", listbox_group);
            return ({});
        }

        return Listbox(listbox_group, button, limitter, options);
    };

    function defaultSetup() 
    {
        const groupMap = new Map();
        const init = (group) => {
            const listbox = initListbox(group);
            groupMap.set(group, listbox);
        };

        const deinit = (group) => {
            const listbox = groupMap.get(group);
            if(!listbox)
                return;
            deinitListbox(listbox);
        };

        const selector = lib.selector.attribute(settings.ATTRIBUTE, settings.DATA_TYPE_LISTBOX);
        const stable = {
            index: lib.stable.add(init, deinit, selector, {name: 'listbox'}),
            groupMap: groupMap,
            listboxes: Array.from(groupMap.values()),
        };
        return stable;
    }

    if(_auto_setup)
        document.addEventListener('DOMContentLoaded', () => defaultSetup());
 
    return Object.assign(settings, {
        Listbox,
        deinitListbox,
        initListbox,
        defaultSetup,
    });
}