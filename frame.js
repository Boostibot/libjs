function importFrame(lib, builder, CONTENTS, _auto_setup)
{
    'use strict';

    const {span, div, img, button} = builder.selected;
    // Object.assign(this, builder.selected);

    if(_auto_setup === undefined) _auto_setup = true;
    
    function showOverlay(overlay)
    {
        lib.vision.show(overlay.wrapper);
    }
    
    function hideOverlay(overlay)
    {
        lib.vision.hide(overlay.wrapper);
    }

    function loadElements(group)
    {
        if(group.tagName === 'TEMPLATE')
            return Array.from(group.contents.cloneNode(true).children);
        else
            return [group.cloneNode(true)];
    }

    function loadImages(src_string, alt_string)
    {
        const srcs = src_string.split(' ').filter(val => !!val);
        const alts = alt_string.split(' ').filter(val => !!val);
        const imgs = srcs.map(src => img({src}));

        const to = min(imgs.length, alts.length);
        for(let i = 0; i < to; i++)
            imgs[i].setAttribute('alt', alts[i]);

        return imgs;
    }

    function getLoaded(from_element)
    {
        const frame_src = from_element.getAttribute('data-frame_src');
        const frame_alt = from_element.getAttribute('data-alt_src') || "";
        const frame_group = from_element.getAttribute('data-frame_group');

        const loaded = [];
        if(frame_src)
            lib.arr.concat(loaded, loadImages(frame_src, frame_alt));
        if(frame_group)
        {
            const elem = document.getElementById(frame_group);
            if(elem)
                lib.arr.concat(loaded, loadElements(frame_src, frame_alt));
        }
        
        return loaded;
    }

    
    function loadFrom(from_element)
    {
        return {
            frame: from_element,
            loaded: getLoaded(from_element),
            selected: from_element.getAttribute('data-frame_from_index') || 0,
        };
    }

    function getSelected(collection) {return collection.loaded[collection.selected];}

    function displayLoaded(overlay, collection)
    {
        overlay.display.textContent = '';
        for(const item of collection.loaded)
            overlay.display.appendChild(item);
    }

    function updateShown(overlay, collection, index)
    {
        const leave_task = (elem) => {
            elem.classList.add('leave');
            elem.classList.remove('enter');
            setTimeout(() => elem.classList.remove('leave'), 400);
        };

        const enter_task = (elem) => {
            elem.classList.add('enter');
            elem.classList.remove('leave');
        };

        const previous = getSelected(collection);
        const actual_index = lib.mod(index, collection.loaded.length);
        collection.selected = actual_index;
        const current = getSelected(collection);

        leave_task(previous);
        enter_task(current);

        
        prepareNextSlides(overlay, collection);
    }

    // function OverlayState(focused_index)
    // {
    //     return {focused_index};
    // }

    function makeOverlay(texts)
    {
        const close = button("frame_overlay__close",
            img("frame_overlay__close_icon", {src: texts.close_icon, 'aria-hidden': true}),
            span("sr_only", texts.close_label)
        );

        const prev = button("frame_overlay__prev",
            img("frame_overlay__prev_icon", {src: texts.prev_icon, 'aria-hidden': true}),
            span("sr_only", texts.prev_label)
        );

        const next = button("frame_overlay__next",
            img("frame_overlay__next_icon", {src: texts.next_icon, 'aria-hidden': true}),
            span("sr_only", texts.next_label)
        );
        
        const display = div("frame_overlay__display");

        const image_area = div("frame_overlay__image_area", 
            close,
            div('frame_overlay__display_padding', 
                display
            ),
        );

        const wrapper = 
            div("frame_overlay__wrapper",
                div("frame_overlay__centered", 
                    image_area,
                    prev,
                    next
                )
            );

        const overlay = {
            close, prev, next, image_area, wrapper, display, 
            focused_index: 0, controls: [close, prev, next],
        };

        hideOverlay(overlay);
        return overlay;
    }


    function offsetControlFocus(overlay, offset)
    {
        const max = overlay.controls.length;
        for(let i = 0; i < max; i++)
        {
            overlay.focused_index = lib.mod(overlay.focused_index + offset, max);
            const focused = overlay.controls[overlay.focused_index];
            if(lib.vision.visible(focused))
            {
                focused.focus();
                return true;
            }
        }

        return false;
    }

    function focusControl(overlay, control)
    {
        overlay.focused_index = overlay.controls.indexOf(curr => curr === control);
        control.focus();
    }

    function focusOpenButton(collection)
    {
        collection.frame.focus();
    }

    function showIf(elem, show)
    {
        if(show)
            lib.vision.show(elem);
        else
            lib.vision.hide(elem);
    }
    
    function prepareNextSlides(overlay, collection)
    {
        showIf(overlay.prev, collection.selected !== 0);
        showIf(overlay.next, collection.selected !== collection.loaded.length - 1);
    }

    function openOverlay(overlay, collection)
    {
        if(collection.loaded.length === 0)
            return;

        displayLoaded(overlay, collection);
        updateShown(overlay, collection, collection.selected);
        showOverlay(overlay);
        focusControl(overlay, overlay.close);
    }

    function closeOverlay(overlay, collection)
    {
        hideOverlay(overlay);
        focusOpenButton(collection);
    }

    function initFrame(overlay, frameElem, collection_ref)
    {
        const activate = (event) => {
            
            if(event.code && event.key !== 'Enter')
                return;
            
            collection_ref.collection = loadFrom(event.target);
            openOverlay(overlay, collection_ref.collection);
        };

        frameElem.addEventListener('click', activate);
        frameElem.addEventListener('keydown', activate);
        return activate;
    }

    function deinitFrame(activate, frameElem)
    {
        frameElem.removeEventListener('click', activate);
        frameElem.addEventListener('keydown', activate);
    }

    function addOverlayControls(overlay, collection_ref)
    {
        const ref = collection_ref;
        const close = () => closeOverlay(overlay, ref.collection);

        const prev = (event) => {
            const collection = ref.collection;
            updateShown(overlay, collection, collection.selected - 1);
            event.preventDefault();
            event.stopPropagation();
        };
        const next = (event) => {
            const collection = ref.collection;
            updateShown(overlay, collection, collection.selected + 1);
            event.preventDefault();
            event.stopPropagation();
        };

        overlay.wrapper.addEventListener('click', close);
        overlay.close.addEventListener('click', close);

        overlay.prev.addEventListener('click', prev);
        overlay.next.addEventListener('click', next);

        overlay.wrapper.addEventListener('keyup', function(event)
        {
            switch(event.code)
            {
                case "Esc":
                case "Escape":      close(event); break;

                case "Left":
                case "ArrowLeft":   prev(event); break;
                
                case "Right":
                case "ArrowRight":  next(event); break;
            }
        });

        overlay.wrapper.addEventListener('keydown', function(event)
        {
            if(event.key !== 'Tab')
                return;

            const offset = event.shiftKey ? -1 : 1;
            offsetControlFocus(overlay, offset);
            
            event.preventDefault();
        });
    }

    function defaultSetup()
    {
        const overlay = makeOverlay(CONTENTS);
        const collection_ref = {collection: null};

        addOverlayControls(overlay, collection_ref);
        document.body.appendChild(overlay.wrapper);

        const frameMap = new Map();
        const init = frame => {
            const frame_event = initFrame(overlay, frame, collection_ref);
            frameMap.set(frame, frame_event);
        };

        const deinit = frame => {
            const frame_event = frameMap.get(frame);
            if(!frame_event)
                return;
            deinitFrame(frame_event, frame);
        };
        
        const selector = lib.selector.attribute('data-frame');
        const stable = {
            overlay, 
            collection: collection_ref.collection,
            index: lib.stable.add(init, deinit, selector, {name: 'frame'}),
            frameMap: frameMap,
            listboxes: Array.from(frameMap.values()),
        };
        return stable;
    }

    
    if(_auto_setup)
        document.addEventListener('DOMContentLoaded', defaultSetup);

    return {
        
    };
}

