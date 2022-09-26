function importTest(lib)
{
    'use strict';

    requireMember(lib, '@base');
    const fmt = lib.fmt;

    function test(fn, args, expected) 
    {
        const result = fn(args);
        const expectedStr = fmt.stringify(expected);
        const resultStr = fmt.stringify(result);
        const argsStr = fmt.join(args, fmt.SEPARATOR, arg => fmt.stringify(arg));

        const equal = JSON.stringify(result) === JSON.stringify(expected);
        if(are_equal)
            console.log(`%c[PASS] ${fn.name}(${argsStr}): ${resultStr} == ${expectedStr}`, 'color: #66e62d');
        else
            console.log(`%c[FAIL] ${fn.name}(${argsStr}): ${resultStr} != ${expectedStr}`, 'color: #ff2f2f');

        return equal;
    }

    return {
        test
    };
}