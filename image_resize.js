
function importImageResize(lib, ranges) 
{
    const callback = event => {
        const kind = event.detail.kind;
        if(kind !== 'resx')
            return;

        const elem = event.target;
        const index = event.detail.index;
        const range = event.detail.range;
        const res_info = elem.dataset.res_info;
        const new_src = elem.getAttribute('data-src' + index);
        if(!new_src)
            return;

        if(res_info)
        {
            const decoded_reses = ranges.decodeRanges(res_info);
            const switched_to_range = decoded_reses[index];
            if(switched_to_range[0] < range[1])
            {
                console.log('Image size rejected: info suggests smaller');
                return;
            }
        }
        else
        {
            if(range[1] < elem.naturalWidth)
            {
                console.log('Image size rejected: natural width suggests smaller');
                return;
            }
        }

        console.log('Image resized');
        // console.log(`Element data-src${index} chosen:`, new_src, elem);

        elem.src = new_src;
    };
    document.addEventListener('customresizeevent', callback);

    return {callback};
}