function assert(condition, info = "") {
    if(condition)
        return;
    
    if(!info)
        throw new Error("Assertion failed");
    else
        throw new Error("Assertion failed with: '" + info + "'");
}

const min = Math.min;
const max = Math.max;

function requireMember(lib)
{
    for (let i = 1; i < arguments.length; i++) 
        assert(arguments[i] in lib, "Required libraries not found: " + String(arguments));
}
