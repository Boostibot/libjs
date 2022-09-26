function importMenuLogic(lib) 
{
    requireMember(lib, 'vision', 'selector', 'query', 'viewport', 'throttle', 'unique');

    const viewport = lib.viewport;
    const selector = lib.selector;
    const query = lib.query;
    const unique = lib.unique;
    const throttle = lib.throttle;

    const menuLogic = {
        AUTO_POLICY: 'data-noopen',
        EXPLICIT_POLICY: 'data-explicit',
        EXPLICIT_CLASS: 'explicit_opened',
        VERTICAL_SNAP_WIDTH: 750,
        SLUMBER_DURATION: 500,
        MIN_INACTIVE_TIME: 500,
        EVENT_OPTIONS: {
            bubbles: true, 
            cancelable: true
        }
    };

    function isMenubar(elem) 
    {
        if(!elem)
            return false;
        
        const role = elem.getAttribute('role');
        return role == 'menu' || role == 'menubar';
    }

    function isOpener(elem)
    {
        if(!elem)
            return false;

        return elem.hasAttribute('aria-haspopup');
    }

    function isOpenerIcon(elem)
    {
        if(!elem)
            return false;

        return elem.tagName === 'IMG';
    }

    function isItemText(elem)
    {
        if(!elem)
            return false;

        const selector_ = selector.data_type('menu_item_text');
        return elem.matches(selector_);
    }

    function getItemText(from)
    {
        if(!from)
            return false;
            
        const selector_ = selector.data_type('menu_item_text');
        return query.single(selector_, from);
    }

    function getMenubars(from)
    {
        if(!from)
            return false;
            
        const selector_ = selector.attribute('role', 'menubar');
        const querried = query.all(selector_, from);

        let return_arr = Array(querried.length);
        lib.foreach(querried, (menubar, i) => {
            return_arr[i] = menubar.parentNode;
        });

        return return_arr;
    }
    
    function isSubMenu(entry)
    {
        if(!entry)
            return false;
           
        return entry.hasAttribute('data-menu') && entry.hasAttribute('data-opener');
    }
    
    function prepareMenu(item, level, index)
    {
        item.setAttribute('data-level', level);
        item.setAttribute('data-index', index);

        const children = lib.makeArray(item.children);
        const opener = children.find(isOpener);
        const menu = children.find(isMenubar);

        if(menu && opener)
        {
            if(!menu.id)
                menu.id = unique.id("menu");
            
            if(!opener.id)
                opener.id = unique.id("opener");    

            item.setAttribute('data-menu', menu.id);
            item.setAttribute('data-opener', opener.id);
            
            const opener_icon = lib.find(opener.children, isOpenerIcon);
            if(opener_icon)
            {
                if(!opener_icon.id)
                    opener_icon.id = unique.id("opener_icon");  
                
                item.setAttribute('data-opener_icon', opener_icon.id);
            }
        }
    }

    function getMenu(entry)
    {
        const id = entry.getAttribute('data-menu');
        return document.getElementById(id);
    }

    function getOpener(entry)
    {
        const id = entry.getAttribute('data-opener');
        return document.getElementById(id);
    }

    function getOpenerIcon(entry)
    {
        const id = entry.getAttribute('data-opener_icon');
        return document.getElementById(id);
    }

    function is_focusable(elem) 
    {
        if(elem.tabIndex < 0)
            return false;

        if(element.isContentEditable === true)
            return true;

        switch(elem.tagName)
        {
            case 'A':
            case 'AREA':
            case 'INPUT':
            case 'SELECT':
            case 'TEXTAREA':
            case 'FRAME':
            case 'RADIO':
                return true;

            case 'BUTTON':
                if(elem.disabled == false)
                    return true;
        }    

        return false;
    }

    function getFocusable(entry) 
    {
        if(is_focusable(entry))
            return entry;

        let found = null;
        lib.foreach(entry.children, (child) => {
            found = getFocusable(child);
            if(found)
                return false;
        });

        return found;
    }

    menuLogic.implementation = {
        isMenubar,
        isOpenerIcon,
        isItemText,
        isOpener,
        isSubMenu,
        getMenu,
        getOpener,
        getOpenerIcon,
        getMenubars,
        getItemText,
        getFocusable,
        prepareMenu,
    };

    const implementation = menuLogic.implementation;

    /*
    <nav> [0] (0)
        <button> [0] (0)
        <ul> //menu [0] (0)
            <li> //menu entry [0] (1)
                <button> //menu item [0] (1)
                    <img>
                </button> [0] (1)
                <ul> //menu - submenu
                    <li>
                        ...Link and content...
                    </li>
                    <li>
                        ...Link and content...
                    </li>
                    <li>
                        ...Link and content...
                    </li>
                </ul>
            </li>

            <li> //menu entry [1] (1)
                ...Link and content...
            </li> 
            <li> //menu entry [2] (1)
                ...Link and content...
            </li> 
            <li> //menu entry [3] (1)
                ...Link and content...
            </li> 
        </ul>
    </nav>
    */

    function dispatch_default(element, name, settings = menuLogic.EVENT_OPTIONS) 
    {
        const event = new CustomEvent(name, settings);
        element.dispatchEvent(event);
    }

    function is_horizontal()
    {
        return viewport.width() >= menuLogic.VERTICAL_SNAP_WIDTH;
    }

    function swap_attributes(element)
    {
        let dataset_keys = Object.keys(element.dataset);

        lib.foreach(dataset_keys, (key) => 
        {
            let attribute = element.getAttribute(key);
            if(attribute !== undefined)
            {
                element.setAttribute(key, element.dataset[key]);
                element.dataset[key] = attribute;
            }
        });
    }

    function stop_propagation(event)
    {
        event.preventDefault();
        event.stopPropagation();
    }

    function is_letter_or_number(string)
    {
        if(string.length !== 1)
            return false;

        if (string >= '0' && string <= '9')
            return true;
        else if (string >= 'a' && string <= 'z')
            return true;
        else if (string >= 'A' && string <= 'Z') 
            return true;
        
        return false;
    }

    function get_branch(item)
    {
        const entry = item.parentElement;
        const menu = entry.parentElement;
        const level = Number(item.dataset.level);
        const index = Number(item.dataset.index);

        const branch = {
            item: item,
            entry: entry,
            menu: menu,
            level: level,
            index: index,
        };

        return branch;
    }

    function is_branch_invalid(branch)
    {
        return isNaN(branch.level) || isNaN(branch.index);
    }
    
    function menu_recursion(menu_entry, callback, index = 0, level = 0)
    {
        callback(menu_entry, level, index);

        lib.foreach(menu_entry.children, (item) => 
        {
            callback(item, level, index);
        });
        
        if(implementation.isSubMenu(menu_entry) == false)
            return;

        const next_level = level + 1;
        const menu = implementation.getMenu(menu_entry);
        lib.foreach(menu.children, (item, i) => 
        {
            menu_recursion(item, callback, i, next_level);
        });
    }

    function show_menu(button, menu)
    {
        menu.setAttribute('style', 'display: block');
        button.setAttribute('aria-expanded', 'true');
    }

    function hide_menu(button, menu)
    {
        menu.setAttribute('style', 'display: none');
        button.setAttribute('aria-expanded', 'false');
    }

    function show_menu_if_possible(item)
    {
        const entry = item.parentElement;
        if(implementation.isSubMenu(entry) === false)
            return;

        const opener = implementation.getOpener(entry);
        const menu = implementation.getMenu(entry);
        show_menu(opener, menu);
    }

    function hide_menu_if_possible(item)
    {
        const entry = item.parentElement;
        if(implementation.isSubMenu(entry) === false)
            return;

        const opener = implementation.getOpener(entry);
        const menu = implementation.getMenu(entry);
        hide_menu(opener, menu);
    }

    function bubble_show(branch)
    {
        while(branch.level > 0)
        {
            branch = get_branch(branch.menu);
            show_menu_if_possible(branch.item);
        }
    }

    function bubble_hide(branch)
    {
        while(branch.level > 0)
        {
            branch = get_branch(branch.menu);
            hide_menu_if_possible(branch.item);
        }
    }

    function first_child(element)
    {
        if(!element)
            return undefined;

        return element.children[0];
    }

    function set_no_auto_open_policy(item)      {item.setAttribute(menuLogic.AUTO_POLICY, '');}
    function clear_no_auto_open_policy(item)    {item.removeAttribute(menuLogic.AUTO_POLICY);}
    function has_no_auto_open_policy(item)      {return item.hasAttribute(menuLogic.AUTO_POLICY);}

    function set_explicit_open_policy(item)     {item.setAttribute(menuLogic.EXPLICIT_POLICY, '');}
    function clear_explicit_open_policy(item)   {item.removeAttribute(menuLogic.EXPLICIT_POLICY);}
    function has_explicit_open_policy(item)     {return item.hasAttribute(menuLogic.EXPLICIT_POLICY);}

    function set_explicit_open_indicator(item)  {item.classList.add(menuLogic.EXPLICIT_CLASS);}
    function clear_explicit_open_indicator(item) {item.classList.remove(menuLogic.EXPLICIT_CLASS);}

    function explit_show_menu(button, menu) 
    { 
        set_explicit_open_policy(button);
        set_explicit_open_indicator(button);
        show_menu(button, menu);
        
        dispatch_default(button, 'menu_explicit_show');
    }

    function explit_hide_menu(button, menu) 
    {
        clear_explicit_open_policy(button);
        clear_explicit_open_indicator(button);
        hide_menu(button, menu);
        
        dispatch_default(button, 'menu_explicit_hide');
    }

    function explicit_toggle_menu(button, menu)
    {
        if(has_explicit_open_policy(button))
            explit_hide_menu(button, menu);
        else
            explit_show_menu(button, menu);
    }

    function is_shown(elem) 
    {
        const style = getComputedStyle(elem);
        return style.display != "none";
    }

    function change_menu_focus(item)
    {
        document.activeElement.blur();
        bubble_show(get_branch(item));
        item.focus();
        
        dispatch_default(item, 'menu_item_focused');
    }

    function no_open_change_pos(pos)
    {
        if(pos !== undefined)
        {
            set_no_auto_open_policy(pos);
            change_menu_focus(pos);
        }
    }

    //===================================
    //              MOVES
    //===================================
    function move_in(branch)
    {   
        if(implementation.isSubMenu(branch.entry) === false)
            return undefined;

        const sub_menu = implementation.getMenu(branch.entry);
        const sub_menu_size = sub_menu.children.length;
        if(sub_menu === undefined)
            return undefined;

        for(let i = 0; i < sub_menu_size; i ++)
        {
            const first_sub_entry = sub_menu.children[i];
            if(is_shown(first_sub_entry))
                return first_child(first_sub_entry);
        }
        return undefined;
    }

    function move_out(branch)
    {   
        if(branch.level === 0) //menu tray
            return undefined;

        const above_menu = branch.menu.parentElement;
        if(above_menu === undefined)
            return undefined;
        
        if(implementation.isSubMenu(above_menu) === false)
            return undefined;

        return implementation.getOpener(above_menu);
    }

    function move_to_next(branch)
    {
        const menu_size = branch.menu.children.length;
        for(let i = branch.index + 1; i < menu_size; i ++)
        {
            const next_entry = branch.menu.children[i];
            if(is_shown(next_entry))
                return first_child(next_entry);
        }

        return undefined;
    }

    function move_to_prev(branch)
    {
        for(let i = branch.index; i-- > 0;)
        {
            const prev_entry = branch.menu.children[i];
            if(is_shown(prev_entry))
                return first_child(prev_entry);
        }

        return undefined;
    }

    function move_to_first(branch)
    {
        const menu_size = branch.menu.children.length;
        for(let i = 0; i < menu_size; i ++)
        {
            const first_entry = branch.menu.children[i];
            if(is_shown(first_entry))
                return first_child(first_entry);
        }

        return undefined;
    }

    function move_to_last(branch)
    {
        const menu_size = branch.menu.children.length;
        for(let i = menu_size; i-- > 0;)
        {
            const first_entry = branch.menu.children[i];
            if(is_shown(first_entry))
                return first_child(first_entry);
        }

        return undefined;
    }

    function move_to_key(branch, key)
    {
        function find_in_range(from, to, branch, key)
        {
            for(let i = from; i < to; i++)
            {
                const entry = branch.menu.children[i];
                if(is_shown(entry) == false)
                    continue;

                let text = implementation.getItemText(entry);

                if(!text)
                    text = first_child(entry);
                
                if(text)
                {
                    const normalized_text = text.innerText.trim().toLowerCase();
                    const index = normalized_text.indexOf(key);
                    if(index == 0)
                        return implementation.getFocusable(entry);
                }
            }

            return undefined;
        }

        key = key.toLowerCase();
        let pos = find_in_range(branch.index + 1, branch.menu.children.length, branch, key);

        if(pos === undefined)
            pos = find_in_range(0, branch.index, branch, key);

        return pos;
    }

    //============================================
    //              PRESSES
    //=============================================
    function pressed_up(event)
    {
        stop_propagation(event);
        
        let branch = get_branch(document.activeElement);
        if(is_branch_invalid(branch))
            return;

        let pos;
        if(is_horizontal())
        {
            if(branch.level > 1)
            {
                if(branch.index === 0)
                    pos = move_out(branch);
                else
                    pos = move_to_prev(branch);
            }
        }
        
        else
        {
            if(branch.index === 0)
                pos = move_out(branch);
            else
            {
                pos = move_to_prev(branch);

                while(true)
                {
                    if(pos === undefined)
                        break;

                    branch = get_branch(pos);
        
                    if(implementation.isSubMenu(branch.entry) &&
                       has_explicit_open_policy(branch.item))
                    {
                        pos = move_in(branch);
                        if(pos === undefined)
                            break;
                        
                        branch = get_branch(pos);
                        pos = move_to_last(branch);
                    }
                    else
                        break;
                }
            } 
        }

        no_open_change_pos(pos);
    }

    function pressed_down(event)
    {
        stop_propagation(event);
        
        let branch = get_branch(document.activeElement);
        if(is_branch_invalid(branch))
            return;

        let pos;
        if(is_horizontal())
        {
            if(branch.level === 1)
                pos = move_in(branch);
            else
                pos = move_to_next(branch);
        }
        else
        {
            if(implementation.isSubMenu(branch.entry) &&
            has_explicit_open_policy(branch.item))
            {
                pos = move_in(branch);
            }
            else
            {
                while(true)
                {
                    pos = move_to_next(branch);
                    if(pos !== undefined || branch.level <= 1)
                        break;

                    pos = move_out(branch);
                    if(pos === undefined) //if moving out fails break
                        break;

                    branch = get_branch(pos);
                }
            }
        }

        no_open_change_pos(pos);
    }

    function pressed_left(event)
    {
        // stop_propagation(event);
        
        let branch = get_branch(document.activeElement);
        if(is_branch_invalid(branch))
            return;

        if(is_horizontal())
        {
            while(branch.level > 1)
            {
                const out = move_out(branch);
                if(out === undefined)
                    return;
                branch = get_branch(out);
            }

            const pos = move_to_prev(branch);
            no_open_change_pos(pos);
        }
    }

    function pressed_right(event)
    {
        // stop_propagation(event);
        
        let branch = get_branch(document.activeElement);
        if(is_branch_invalid(branch))
            return;

        if(is_horizontal())
        {
            while(branch.level > 1)
            {
                const out = move_out(branch);
                if(out === undefined)
                    return;
                branch = get_branch(out);
            }

            const pos = move_to_next(branch);
            no_open_change_pos(pos);
        }
    }

    function pressed_home(event)
    {
        stop_propagation(event);
        
        const branch = get_branch(document.activeElement);
        if(is_branch_invalid(branch))
            return;

        const pos = move_to_first(branch);
        no_open_change_pos(pos);
    }

    function pressed_end(event)
    {
        stop_propagation(event);

        const branch = get_branch(document.activeElement);
        if(is_branch_invalid(branch))
            return;

        const pos = move_to_last(branch);
        no_open_change_pos(pos);
    }

    function pressed_tab(event)
    {
        let branch = get_branch(document.activeElement);
        if(is_branch_invalid(branch))
            return;

        let pos;
        if(event.shiftKey)
        {
            pos = move_to_prev(branch);

            if(pos === undefined)
                return;

            branch = get_branch(pos);

            let entered;
            while(true)
            {   
                entered = move_in(branch);
                if(entered === undefined)
                    break;

                branch = get_branch(entered);
                entered = move_to_last(branch);
                if(entered === undefined)
                    break;

                pos = entered;
                branch = get_branch(entered);
            }
            
            if(pos !== undefined)
                change_menu_focus(pos);
        }
        else
        {
            let attempt_to_enter = true;
            while(true)
            {
                if(attempt_to_enter)
                {
                    pos = move_in(branch);
                    if(pos !== undefined)
                    {
                        change_menu_focus(pos);
                        break;
                    }
                }
        
                attempt_to_enter = true;
                pos = move_to_next(branch);
                if(pos !== undefined)
                {
                    change_menu_focus(pos);
                    break;
                }
        
                if(branch.level <= 1)
                    return;
        
                pos = move_out(branch);
                if(pos === undefined)
                    return;
                
                branch = get_branch(pos);
                attempt_to_enter = false;
            }
        }

        stop_propagation(event);
    }

    function pressed_escape(event)
    {
        // stop_propagation(event);

        const branch = get_branch(document.activeElement);
        if(is_branch_invalid(branch))
            return;

        const pos = move_out(branch);
        no_open_change_pos(pos);
    }

    function pressed_character(key, event)
    {
        // stop_propagation(event);

        const branch = get_branch(document.activeElement);
        if(is_branch_invalid(branch))
            return;

        const pos = move_to_key(branch, key);
        no_open_change_pos(pos);
    }

    function add_entry_focus_bubbling(entry)
    {
        if(implementation.isSubMenu(entry))
        {
            const opener = implementation.getOpener(entry);
            const menu = implementation.getMenu(entry);

            entry.addEventListener('focusout', () => {
                if(has_explicit_open_policy(opener))
                    return;

                hide_menu(opener, menu);
            });
        }
    }

    function add_menu_hover_events(entry, level)
    {
        if(implementation.isSubMenu(entry) == false ||
           level == 0)
           return;

        const opener = implementation.getOpener(entry);
        const menu = implementation.getMenu(entry);

        entry.addEventListener('mouseenter', ()=>{
            if(is_horizontal() == false)
                return;

            show_menu(opener, menu);
        });
        
        entry.addEventListener('mouseleave', ()=>{
            if(is_horizontal() == false)
                return;

            if(has_explicit_open_policy(opener))
                return;

            if(entry.contains(document.activeElement))
                return;

            hide_menu(opener, menu);
        });
    }

    function add_opener_events(opener)
    {
        if(implementation.isOpener(opener) == false)
            return;

        const entry = opener.parentElement;
        if(implementation.isSubMenu(entry) === false)
            return;

        const menu = implementation.getMenu(entry);
        const opener_icon = implementation.getOpenerIcon(entry);

        opener.addEventListener('focus', (event) => {
            if(has_no_auto_open_policy(opener))
                return clear_no_auto_open_policy(opener);

            show_menu_if_possible(opener);
        });

        if(opener_icon)
        {
            opener.addEventListener('click', ()=>{
                explicit_toggle_menu(opener, menu);
                swap_attributes(opener_icon);

            });
            opener.addEventListener('keydown', (event)=>{
                if(event.key === 'Space')
                {
                    explicit_toggle_menu(opener, menu);
                    swap_attributes(opener_icon);
                    event.preventDefault();
                }
            });
        }
        else
        {
            opener.addEventListener('click', ()=>{
                explicit_toggle_menu(opener, menu);
            });
            opener.addEventListener('keydown', (event)=>{
                if(event.key === 'Space')
                {
                    explicit_toggle_menu(opener, menu);
                    event.preventDefault();
                }
            });
        }
    }

    function add_menu_events(menu)
    {
        if(implementation.isSubMenu(menu) === false)
            return;

        function manage_keypress(event) 
        {
            switch(event.key)
            {
                case 'Down':
                case 'ArrowDown':   pressed_down(event); break;

                case 'Up':
                case 'ArrowUp':     pressed_up(event); break;

                case 'Left':
                case 'ArrowLeft':   pressed_left(event); break;

                case 'Right':
                case 'ArrowRight':  pressed_right(event); break;

                case 'Home':        pressed_home(event); break;

                case 'End':         pressed_end(event); break;

                case 'Tab':         pressed_tab(event); break;

                case 'Esc':
                case 'Escape':      pressed_escape(event); break;

                default:
                    if(is_letter_or_number(event.key))
                        pressed_character(event.key, event);
                    break;
            }
        }

        menu.addEventListener('keydown', manage_keypress);
    }

    function set_menu_initial_state(entry, level)
    {
        if(implementation.isSubMenu(entry) === false)
            return;

        function set_state() 
        {
            const opener = implementation.getOpener(entry);
            const menu = implementation.getMenu(entry);

            if(level === 0 && is_horizontal())
            {
                const opener_icon = implementation.getOpenerIcon(entry);
                if(opener_icon)
                    swap_attributes(opener_icon);

                explit_show_menu(opener, menu);
            }
            else
                explit_hide_menu(opener, menu);    
            // hide_menu(opener, menu);
        }
        
        const sleepPast = throttle.createSleepPast();
        
        let last_width = viewport.width();
        window.addEventListener('resize', () => {
            sleepPast(() => {
                const old_pos = last_width - menuLogic.VERTICAL_SNAP_WIDTH;
                const new_pos = viewport.width() - menuLogic.VERTICAL_SNAP_WIDTH;

                if(old_pos < 0 && new_pos >= 0)
                    set_state();
                else if(old_pos >= 0 && new_pos < 0)
                    set_state();

                last_width = viewport.width();
            });
        });

        set_state(); 
    }

    function add_events(menu)
    {
        if(!menu)
            return;

        function apply_events(item, level, index)
        {
            implementation.prepareMenu(item, level, index);
            set_menu_initial_state(item, level);
            add_entry_focus_bubbling(item);
            add_menu_hover_events(item, level);
            add_opener_events(item);
            add_menu_events(item);
        }

        menu_recursion(menu, apply_events);
    }

    function setup(_implementation = implementation)
    {
        menuLogic.implementation = _implementation;
        document.addEventListener('DOMContentLoaded', () => 
        {
            const menus = implementation.getMenubars(document);

            lib.foreach(menus, (menu) => {
                add_events(menu);
            });
        });
    }

    menuLogic.addEvents = add_events;
    menuLogic.setup = setup;

    return menuLogic;
}