function importBuilder()
{
    'use strict';

    function isElement(element) 
    {
        return element instanceof Element || element instanceof Document;
    }

    function fromHtml(string)
    {
        const dummy = document.createElement('DIV');
        dummy.innerHTML = string;
        return dummy.childNodes;
    }

    const isIterable = x => {
        if(typeof x === 'object')
            return !!x[Symbol.iterator];
        else
            return false;
    };

    function addAttributes(tag, attributes)
    {
        if(typeof attributes === 'string')
            tag.setAttribute('class', attributes);
        else
            for(const key in attributes)
                tag.setAttribute(key, attributes[key]);
        return tag;
    }

    function addChildren(tag, children, optim_after = 5)
    {
        if(typeof children !== 'object')
            tag.appendChild(document.createTextNode(children));
        else if(isIterable(children))
        {
            if(tag.isConnected && optim_after < children.length)
            {
                const add_to = document.createDocumentFragment();
                for(const child of children)
                    addChildren(add_to, child, optim_after);

                tag.appendChild(add_to);
            }
            else
            {
                for(const child of children)
                    addChildren(tag, child, optim_after);
            }
        }
        else if(isElement(children))
            tag.appendChild(children);
        else
            addAttributes(tag, children);
    
        return tag;
    }

    function tag(tagName, args = {}, ...childNodes)
    {
        const out = document.createElement(tagName.toUpperCase());
        addAttributes(out, args);
        return addChildren(out, childNodes);
    }

    function generateTags(name_list, out = {}) 
    {
        for(const name of name_list)
        {
            out[name] = function(args = {}, ...childNodes) {
                const out = document.createElement(name.toUpperCase());
                addAttributes(out, args);
                return addChildren(out, childNodes);
            };
        }

        return out;
    }
    
    const TAG_NAMES = [
        'a',
        'abbr',
        'abbr',
        'address',
        'embed',
        'object',
        'area',
        'article',
        'aside',
        'audio',
        'b',
        'bdi',
        'bdo',
        'blockquote',
        'body',
        'br',
        'button',
        'canvas',
        'caption',
        'cite',
        'code',
        'col',
        'colgroup',
        'colgroup',
        'data',
        'dd',
        'del',
        'details',
        'dfn',
        'dialog',
        'ul',
        'div',
        'dl',
        'dt',
        'em',
        'embed',
        'fieldset',
        'figcaption',
        'figure',
        'figure',
        'footer',
        'form',
        'h1', 
        'h2',
        'h3', 
        'h4',
        'h5',
        'h6',
        'head',
        'header',
        'hr',
        'html',
        'i',
        'iframe',
        'img',
        'input',
        'ins',
        'kbd',
        'label',
        'input',
        'legend',
        'fieldset',
        'li',
        'main',
        'map',
        'mark',
        'meter',
        'nav',
        'noscript',
        'object',
        'ol',
        'optgroup',
        'option',
        'output',
        'p',
        'picture',
        'pre',
        'progress',
        'q',
        'rp',
        'rt',
        'ruby',
        's',
        'samp',
        'section',
        'select',
        'small',
        'video', 
        'audio',
        'span',
        'strike',
        'del', 
        's',
        'strong',
        'sub',
        'summary',
        'details',
        'sup',
        'svg',
        'table',
        'tbody',
        'td',
        'template',
        'textarea',
        'tfoot',
        'th',
        'thead',
        'time',
        'tr',
        'u',
        'ul',
        'var',
        'video'
    ];

    return {
        isElement,
        fromHtml,
        isIterable,
        addChildren,
        addAttributes,
        tag,
        generateTags,
        TAG_NAMES,
        allTags: generateTags(TAG_NAMES),
        selected: generateTags([
            'div',
            'ul',
            'ol',
            'li',
            'p',
            'span',
            'h1', 
            'h2',
            'h3', 
            'h4',
            'h5',
            'h6',
            'img',
            'section',
            'article',
            'header',
            'main',
            'footer',
            'a',
            'input',
            'label',
            'form',
            'button',
        ], {
            isElement,
            fromHtml,
            isIterable,
            addChildren,
            addAttributes,
            tag,
        })
    };
}

/*




*/