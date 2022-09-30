function importRanges(ATTRIBUTE_IMG_RESIZE)  
{
    'use strict';
    function decodeRanges(string)
    {   
        const ranges = [];
        const groups = string.split(',');
        for(const group of groups)
        {
            const nums = group.split(' ');
            for(let i = 1; i < nums.length; i++)
                ranges.push([nums[i - 1], nums[i]]);
        }

        return ranges.map(range => [
            range[0] === '_' ? -Infinity : parseInt(range[0]),
            range[1] === '_' ? Infinity : parseInt(range[1]),
        ]);
    }
    
    function encodeRanges(ranges)
    {
        const transf = ranges.map(range => [
            Number.isInteger(range[0]) ? range[0].toString() : '_',
            Number.isInteger(range[1]) ? range[1].toString() : '_',
        ]);

        let out = transf[0][0] + ' ' + transf[0][1];
        for(let i = 1; i < transf.length; i++)
            out += ',' + transf[i][0] + ' ' + transf[i][1];

        return out;
    }

    function findRange(ranges, value)
    {
        return ranges.findIndex(range => range[0] <= value && value < range[1]);
    }

    return {
        decodeRanges,
        encodeRanges,
        findRange,
        ATTRIBUTE_IMG_RESIZE,
    };
}