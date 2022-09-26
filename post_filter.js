function importPostFilter(lib, PAGE) 
{
    'use strict';
    requireMember(lib, '@base');
    requireMember(lib, 'selector');

    const Category = (index, length) => ({index, length});
    const View = (map, linker, find, get) => ({map, linker, find, get});


    PAGE.FULL_BITFIELD = ~0;
    PAGE.NONE_BITFIELD = 0;
    
    PAGE.INDEX = new Uint32Array(PAGE.index);
    PAGE.DATA = PAGE.data;
    PAGE.INDEX_SETTINGS = PAGE.index_settings;
    PAGE.DATA_SETTINGS = PAGE.data_settings;
    PAGE.DO_DEBUG = PAGE.do_debug;
    PAGE.CARDS_PER_PAGE = PAGE.cards_per_page;
    PAGE.GROUP_SIZE = PAGE.INDEX_SETTINGS.length;

    assert(PAGE.DATA.length === PAGE.INDEX.length / PAGE.GROUP_SIZE);

    function createBaseGroup(settings)
    {
        const out = {};
        for(const setting of settings)
            out[setting.name] = null; 

        return out;
    }

    PAGE.BASE_INDEX_GROUP = createBaseGroup(PAGE.INDEX_SETTINGS);
    PAGE.BASE_DATA_GROUP = createBaseGroup(PAGE.DATA_SETTINGS);

    function genLinkerMap(linker, getProperty)
    {
        const out = {};
        if(linker.length === 0)
            return out;
        
        const first_key = getProperty(linker[0]);
        out[first_key] = Category(0, 0);
        let last_key = first_key;
        let last_index = 0;

        for(let i = 1; i < linker.length; i++)
        {
            const key = getProperty(linker[i]);
            if(last_key != key)
            {
                out[key] = Category(i, 0);
                out[last_key].length = i - last_index;
                last_key = key;
                last_index = i;
            }
        }

        out[last_key].length = linker.length - last_index;
        return out;
    }

    function createArrayView(baseLinker, getProperty)
    {
        baseLinker.sort((a, b) => getProperty(a) - getProperty(b));
        const map = genLinkerMap(baseLinker, getProperty);


        const view = View(map, baseLinker, null, null);
        view.find = val => {
            return view.map[val] || Category(0, 0);
        };

        view.get = i => baseLinker[i];

        return view;    
    }

    function iota(from, to, map = i => i)
    {
        const len = to - from;
        const out = new Array(len);
        for(let i = 0; i < len; i++)
            out[i] = map(from + i);

        return out;
    }

    PAGE.BASE_VIEW = View({}, [], _ => Category(0, PAGE.DATA.length), i => PAGE.GROUP_SIZE * i);

    function createViews()
    {
        const INDEX = PAGE.INDEX;
        const GROUP_SIZE = PAGE.GROUP_SIZE;

        const base = iota(0, PAGE.DATA.length, i => GROUP_SIZE * i);

        const views = new Array(GROUP_SIZE);
        for(let i = 0; i < GROUP_SIZE; i++)
        {
            const setting = PAGE.INDEX_SETTINGS[i];
            if(setting.do_index)
                views[i] = createArrayView(lib.makeArray(base), index => INDEX[index + i]);
            else
                views[i] = PAGE.BASE_VIEW;
        }
        return views;    
    }

    PAGE.VIEWS = createViews();



    function getMostSpecificView(searched, views, base_view)
    {
        let maxView = base_view;
        let maxCategory = maxView.find(null);

        for(let i = 0; i < searched.length; i++)
        {
            if(searched[i] == -1)
                continue;

            const view = views[i];
            const category = view.find(searched[i])
            if(category.length < maxCategory.length)
            {
                maxView = view;
                maxCategory = category;
            }
        }

        return [maxView, maxCategory];
    }

    function indexesToBitfield(indexes)
    {   
        let out = 0;
        for(let i = 0; i < indexes.length; i++)
            out = out | (1 << indexes[i]);

        return out;
    }

    function bitfieldToIndexes(bitfield)
    {
        const out = [];
        for(let i = 0; i < 32; i++)
        {
            const mask = 1 << i;
            if((bitfield & mask) > 0)
                out.push(i);
        }

        return out;
    }

    //func = (push) => {}
    function batchPush(array, linearGrowth, func, baseLength = linearGrowth)
    {
        array.length = baseLength;

        let length = 0;
        const push = (item) => {
            if(length >= array.length)
                array.length = length + linearGrowth;

            array[length] = item;            
            length ++;

            return length;
        }

        func(push);

        array.length = length;
        return array;
    }
    
    function getListboxSelected(listboxes)
    {
        const selected = new Array(listboxes.length).fill(-1);
        for(let i = 0; i < listboxes.length; i++)
        {
            const listbox = listboxes[i];
            if(listbox.selected !== null)
            {
                const text = listbox.selected.dataset.search;
                if(text && text !== 'null')
                    selected[i] = parseInt(text);
            }
        }

        return selected;
    }
    
    function getCheckboxSelected(checkboxes)
    {
        const selected = batchPush([], checkboxes.length, push => {
            for(const checkbox of checkboxes)
            {
                if(checkbox.checked)
                {
                    const text = checkbox.dataset.search;
                    push(parseInt(text));
                }
            }
        });

        return selected;
    }

    function decodeSingle(value, replacements)
    {
        let out = value;
        for(let i = replacements.length; i-- > 0;)
            out = out.replace(replacements[i][1], replacements[i][0]);

        return out;
    }

    function decodeData(dataGroup)
    {   
        const out = {};
        for(let i = 0; i < dataGroup.length; i++)
        {
            const setting = PAGE.DATA_SETTINGS[i];
            out[setting.name] = decodeSingle(dataGroup[i], setting.replace);
        }

        return out;
    }

    function getInfo(index)
    {
        const GROUP_SIZE = PAGE.GROUP_SIZE;
        const INDEX = PAGE.INDEX;
        const SETTINGS = PAGE.INDEX_SETTINGS;
        const baseIndex = index * GROUP_SIZE;

        const info = {};
        for(let i = 0; i < GROUP_SIZE; i++)
        {
            const setting = SETTINGS[i];
            const member_value = INDEX[baseIndex + i];

            if(setting.is_bitfield)
            {
                const member_values = bitfieldToIndexes(member_value);
                info[setting.name] = member_values.map(index => setting.value_info[index]);
            }
            else
                info[setting.name] = setting.value_info[member_value];
        }

        return info;
    }

    function populateInitialDebug(state)
    {
        for(let i = 0; i < state.cards_visible; i++)
            PAGE.populateCardDebug(state.cards[i], i);
    }

    function makeCard(template)
    {
        const node = template.content.cloneNode(true);
        return PAGE.findMembers(node.children[0]);
    }

    function reserveCards(state, count)
    {
        if(state.cards.length < count)
        {
            const old_length = state.cards.length;
            state.cards.length = count;
            for(let i = old_length ; i < count; i++)
                state.cards[i] = makeCard(state.card_template);
        }
    }

    function setCardData(state, cardIndexes)
    {
        state.card_indexes = cardIndexes;
    }

    function hideCards(state)
    {
        state.card_list.textContent = '';
        state.cards_visible = 0;
    }

    function updateShowMoreButtonVisibility(state)
    {
        if(state.card_indexes.length > state.cards_visible)
            state.show_more.style.display = 'block';
        else
            state.show_more.style.display = 'none';
    }

    function updateCardsDisplay(state, count)
    {
        reserveCards(state, count);

        const fragment = document.createDocumentFragment();
        hideCards(state);
        for(let i = 0; i < count; i++)
        {
            PAGE.populateCard(state.cards[i], state.card_indexes[i]);
            fragment.appendChild(state.cards[i].box);
        }

        fragment.appendChild(state.padding_template.content.cloneNode(true));

        state.cards_visible = count;
        state.card_list.appendChild(fragment);
        updateShowMoreButtonVisibility(state);
        
        
        if(PAGE.DO_DEBUG)
            state.debug_num_showing.textContent = 'NUM SHOWING: ' + state.cards_visible;
    }

    return {
        genLinkerMap,
        createArrayView,
        iota,
        createViews,
        getMostSpecificView,
        indexesToBitfield,
        bitfieldToIndexes,
        batchPush,
        getListboxSelected,
        getCheckboxSelected,
        decodeSingle,
        decodeData,
        getInfo,
        populateInitialDebug,
        makeCard,
        reserveCards,
        setCardData,
        hideCards,
        updateShowMoreButtonVisibility,
        updateCardsDisplay,
    };
}