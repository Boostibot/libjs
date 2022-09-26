/*
*   This software or document includes material copied from or derived from:
*   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
*/

function importListboxBase(KEYCODE)
{
    'use strict';
    const ListboxBase = function (options) {
        this.options = options;
        this.activeDescendantId = this.options.getAttribute('aria-activedescendant');
        this.activeDescendant = null;
        this.multiselectable = this.options.hasAttribute('aria-multiselectable');
        this.moveUpDownEnabled = false;
        this.siblingList = null;
        this.upButton = null;
        this.downButton = null;
        this.moveButton = null;
        this.keysSoFar = '';
        this.events = {};

        if (this.activeDescendantId)
            this.activeDescendant = document.getElementById(this.activeDescendantId);

        this.handleFocusChange = function (element) {};
        this.handleOptionClick = function (element) {};
        this.handleItemChange = function (event, items) {};
        this.initEvents();
    };

    ListboxBase.prototype.addEvent = function(elem, name, callback)
    {
        const pair = {elem, callback};
        if(this.events[name] === undefined)
            this.events[name] = [pair];
        else
            this.events[name].push(pair);

        elem.addEventListener(name, callback);
    }
    
    ListboxBase.prototype.removeEvent = function(elem, name)
    {
        const pairs = this.events[name];
        if(pairs === undefined)
            return;

        const found = pairs.find(pair => pair.elem === elem);
        if(found === undefined)
            return;

        elem.removeEventListener(name, found.callback);
    }

    ListboxBase.prototype.initEvents = function () {
        this.addEvent(this.options, 'focus', this.setupFocus.bind(this));
        this.addEvent(this.options, 'keydown', this.checkKeyPress.bind(this));
        this.addEvent(this.options, 'click', this.checkClickItem.bind(this));
    }
    
    ListboxBase.prototype.deinitEvents = function () {
        
        this.removeEvent(this.options, 'focus');
        this.removeEvent(this.options, 'keydown');
        this.removeEvent(this.options, 'click');
    };

    ListboxBase.prototype.setupFocus = function () {
        if (this.activeDescendant)
            return;

        this.focusFirstItem();
    };

    ListboxBase.prototype.focusFirstItem = function () {
        let firstItem = this.options.querySelector('[role="option"]');

        if (firstItem) 
            this.focusItem(firstItem);
    };

    ListboxBase.prototype.focusLastItem = function () {
        let itemList = this.options.querySelectorAll('[role="option"]');

        if (itemList.length) 
            this.focusItem(itemList[itemList.length - 1]);
    };

    ListboxBase.prototype.checkKeyPress = function (evt) 
    {
        const key = evt.which || evt.keyCode;
        const active = this.activeDescendant;

        if (!active) {
            return;
        }

        switch (key) {
            case KEYCODE.PAGE_UP:
            case KEYCODE.PAGE_DOWN:
                if (this.moveUpDownEnabled) {
                    evt.preventDefault();

                    if (key === KEYCODE.PAGE_UP)
                        this.moveUpItems();
                    else 
                        this.moveDownItems();
                }

            break;
            case KEYCODE.UP:
            case KEYCODE.DOWN:
                evt.preventDefault();

                if (this.moveUpDownEnabled && evt.altKey) {
                    if (key === KEYCODE.UP) 
                        this.moveUpItems();
                    else 
                        this.moveDownItems();
                    
                    return;
                }

                let next;
                if (key === KEYCODE.UP)
                    next = active.previousElementSibling;
                else
                    next = active.nextElementSibling;

                if (next) 
                    this.focusItem(next);
                

            break;
            case KEYCODE.HOME:
                evt.preventDefault();
                this.focusFirstItem();
                break;

            case KEYCODE.END:
                evt.preventDefault();
                this.focusLastItem();
                break;

            case KEYCODE.SPACE:
            case KEYCODE.RETURN:
                evt.preventDefault();
                this.clickItem(active);
                break;


            case KEYCODE.BACKSPACE:
            case KEYCODE.DELETE:
                if (!this.moveButton) 
                    return;

                let keyshortcuts = this.moveButton.getAttribute('aria-keyshortcuts');
                if (key === KEYCODE.RETURN && keyshortcuts.indexOf('Enter') === -1)
                    return;
                if (
                    (key === KEYCODE.BACKSPACE || key === KEYCODE.DELETE) &&
                    keyshortcuts.indexOf('Delete') === -1
                ) 
                return;
                

                evt.preventDefault();

                let nextUnselected = active.nextElementSibling;
                while (nextUnselected) {
                    if (nextUnselected.getAttribute('aria-selected') != 'true') 
                        break;
                    
                    nextUnselected = nextUnselected.nextElementSibling;
                }

                if (!nextUnselected) {
                    nextUnselected = active.previousElementSibling;
                
                    while (nextUnselected) {
                        if (nextUnselected.getAttribute('aria-selected') != 'true') 
                            break;

                        nextUnselected = nextUnselected.previousElementSibling;
                    }
                }

                this.moveItems();
                if (!this.activeDescendant && nextUnselected) {
                    this.focusItem(nextUnselected);
                }
                break;

            default:
                let itemToFocus = this.findItemToFocus(key);
                if (itemToFocus) {
                    this.focusItem(itemToFocus);
                }
                break;
        }
    };

    ListboxBase.prototype.findItemToFocus = function (key) 
    {
        let itemList = this.options.querySelectorAll('[role="option"]');
        let character = String.fromCharCode(key);

        if (!this.keysSoFar) {
            for (let i = 0; i < itemList.length; i++) {
                if (itemList[i].getAttribute('id') == this.activeDescendantId)
                this.searchIndex = i;
            }
        }
        this.keysSoFar += character;
        this.clearKeysSoFarAfterDelay();

        let nextMatch = this.findMatchInRange(
            itemList,
            this.searchIndex + 1,
            itemList.length
        );
        if (!nextMatch) {
            nextMatch = this.findMatchInRange(
                itemList,
                0,
                this.searchIndex
            );
        }
        return nextMatch;
    };

    ListboxBase.prototype.clearKeysSoFarAfterDelay = function () 
    {
        if (this.keyClear) {
            clearTimeout(this.keyClear);
            this.keyClear = null;
        }

        this.keyClear = setTimeout((function () {
            this.keysSoFar = '';
            this.keyClear = null;
        }).bind(this), 500);
    };

    ListboxBase.prototype.findMatchInRange = function (list, startIndex, endIndex) 
    {
        // Find the first item starting with the keysSoFar substring, searching in
        // the specified range of items
        for (let n = startIndex; n < endIndex; n++) {
            let label = list[n].innerText;
            if (label && label.toUpperCase().indexOf(this.keysSoFar) === 0) 
                return list[n];
        }

        return null;
    };

    ListboxBase.prototype.clickItem = function (item) 
    {
        this.focusItem(item);
        this.toggleSelectItem(item);
        this.handleOptionClick(item);
    };

    ListboxBase.prototype.checkClickItem = function (evt) 
    {
        if (evt.target.getAttribute('role') === 'option')
            this.clickItem(evt.target);
    };

    ListboxBase.prototype.toggleSelectItem = function (element) 
    {
        if (this.multiselectable) {
            element.setAttribute(
                'aria-selected',
                element.getAttribute('aria-selected') === 'true' ? 'false' : 'true'
            );

            if (this.moveButton) {
                if (this.options.querySelector('[aria-selected="true"]'))
                    this.moveButton.setAttribute('aria-disabled', 'false');
                else 
                    this.moveButton.setAttribute('aria-disabled', 'true');
            }
        }
    };

    ListboxBase.prototype.defocusItem = function (element) 
    {
        if (!element) 
            return false;
        
        if (!this.multiselectable) 
            element.removeAttribute('aria-selected');
        
        element.classList.remove('focused');
        return true;
    };

    ListboxBase.prototype.focusItem = function (element) 
    {
        this.defocusItem(this.activeDescendant);
        if (!this.multiselectable) 
            element.setAttribute('aria-selected', 'true');

        element.classList.add('focused');
        this.options.setAttribute('aria-activedescendant', element.id);

        this.activeDescendantId = element.id;
        this.activeDescendant = element;

        if (this.options.scrollHeight > this.options.clientHeight) {
            let scrollBottom = this.options.clientHeight + this.options.scrollTop;
            let elementBottom = element.offsetTop + element.offsetHeight;

            if (elementBottom > scrollBottom) 
                this.options.scrollTop = elementBottom - this.options.clientHeight;
            else if (element.offsetTop < this.options.scrollTop)
                this.options.scrollTop = element.offsetTop;
        }

        if (!this.multiselectable && this.moveButton) 
            this.moveButton.setAttribute('aria-disabled', false);

        this.checkUpDownButtons();
        this.handleFocusChange(element);
    };

    ListboxBase.prototype.checkUpDownButtons = function () 
    {
        let activeElement = this.activeDescendant;

        if (!this.moveUpDownEnabled) {
            return false;
        }

        if (!activeElement) {
            this.upButton.setAttribute('aria-disabled', 'true');
            this.downButton.setAttribute('aria-disabled', 'true');
            return;
        }

        if (this.upButton) {
            if (activeElement.previousElementSibling)
                this.upButton.setAttribute('aria-disabled', false);
            else 
                this.upButton.setAttribute('aria-disabled', 'true');
        }

        if (this.downButton) {
            if (activeElement.nextElementSibling) 
                this.downButton.setAttribute('aria-disabled', false);
            else 
                this.downButton.setAttribute('aria-disabled', 'true');
        }
    };

    ListboxBase.prototype.addItems = function (items) 
    {
        if (!items || !items.length)
            return false;

        items.forEach((function (item) {
            this.defocusItem(item);
            this.toggleSelectItem(item);
            this.options.append(item);
        }).bind(this));

        if (!this.activeDescendant)
            this.focusItem(items[0]);

        this.handleItemChange('added', items);
    };

    ListboxBase.prototype.deleteItems = function () 
    {
        let itemsToDelete;

        if (this.multiselectable) 
            itemsToDelete = this.options.querySelectorAll('[aria-selected="true"]');
        else if (this.activeDescendant) 
            itemsToDelete = [ this.activeDescendant ];

        if (!itemsToDelete || !itemsToDelete.length) 
            return [];

        itemsToDelete.forEach((function (item) {
            item.remove();

            if (item.id === this.activeDescendantId) 
                this.clearActiveDescendant();
        }).bind(this));

        this.handleItemChange('removed', itemsToDelete);

        return itemsToDelete;
    };

    ListboxBase.prototype.clearActiveDescendant = function () 
    {
        this.activeDescendantId = null;
        this.activeDescendant = null;

        this.options.setAttribute('aria-activedescendant', null);

        if (this.moveButton) 
            this.moveButton.setAttribute('aria-disabled', 'true');

        this.checkUpDownButtons();
    };

    ListboxBase.prototype.moveUpItems = function () 
    {
        let previousItem;

        if (!this.activeDescendant)
            return;

        currentItem = this.activeDescendant;
        previousItem = currentItem.previousElementSibling;

        if (previousItem) {
            this.options.insertBefore(currentItem, previousItem);
            this.handleItemChange('moved_up', [ currentItem ]);
        }

        this.checkUpDownButtons();
    };

    ListboxBase.prototype.moveDownItems = function () 
    {
        let nextItem;

        if (!this.activeDescendant) 
            return;

        currentItem = this.activeDescendant;
        nextItem = currentItem.nextElementSibling;

        if (nextItem) {
            this.options.insertBefore(nextItem, currentItem);
            this.handleItemChange('moved_down', [ currentItem ]);
        }
        
        this.checkUpDownButtons();
    };

    ListboxBase.prototype.moveItems = function () 
    {
        if (!this.siblingList) 
            return;

        let itemsToMove = this.deleteItems();
        this.siblingList.addItems(itemsToMove);
    };

    ListboxBase.prototype.enableMoveUpDown = function (upButton, downButton) 
    {
        this.moveUpDownEnabled = true;
        this.upButton = upButton;
        this.downButton = downButton;
        upButton.addEventListener('click', this.moveUpItems.bind(this));
        downButton.addEventListener('click', this.moveDownItems.bind(this));
    };

    ListboxBase.prototype.setupMove = function (button, siblingList) 
    {
        this.siblingList = siblingList;
        this.moveButton = button;
        button.addEventListener('click', this.moveItems.bind(this));
    };

    ListboxBase.prototype.setHandleItemChange = function (handlerFn) 
    {
        this.handleItemChange = handlerFn;
    };

    ListboxBase.prototype.setHandleOptionClicked = function (handlerFn) 
    {
        this.handleOptionClick = handlerFn;
    };


    ListboxBase.prototype.setHandleFocusChange = function (focusChangeHandler)
    {
        this.handleFocusChange = focusChangeHandler;
    };

    return ListboxBase;
}