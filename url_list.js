//<img src="" alt="" data-resx="_ 100 200 450 1000 _" data-src="%%a:http://primanakupy.kinet.cz/hlavni-stranka/%% %a %a-300 %a-400 %a-1000"
function decodeUrlList(list_string, patterns = {})
{ 
    if(list_string.startsWith('%%'))
    {
        let lasti = 2;
        for(let i = 2;; i += 2)
        {
            lasti = i;
            i = list_string.indexOf('%%', lasti);
            if(i === -1)
                break;

            const fragment = list_string.slice(lasti, i);
            const separator = fragment.indexOf(':');
            if(separator === -1)
                continue;

            const pattern = fragment.slice(0, separator);
            const replacement = fragment.slice(separator + 1);
            patterns[pattern] = replacement;
        }

        let rest = list_string.slice(lasti);
        if(rest.startsWith(' '))
            rest = rest.slice(1);

        for(const pattern in patterns)
        {
            const replacement = patterns[pattern];
            rest = rest.replaceAll('%' + pattern, replacement);
        }

        list_string = rest;
    }

    return list_string.split(' ');
}

function encodeUrlList(list, patterns = {})
{ 
    let is_first = true;
    let pattern_string = '';
    let list_string = list.join(' ');
    for(const pattern in patterns)
    {
        if(is_first)
        {
            pattern_string += '%%';
            is_first = false;
        } 

        const replacement = patterns[pattern];
        pattern_string += pattern + ':' + replacement + '%%';
        list_string = list_string.replaceAll(replacement, '%' + pattern);
    }

    return pattern_string + list_string;
}