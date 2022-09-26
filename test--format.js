function import_formatTest(lib)
{
    if(!areImported(lib, 'format', 'test'))
        return importError(lib);
        
    lib.test(lib, ['format'], ['string'], "'string'");
    lib.test(lib, ['format'], [1234], "1234");
    lib.test(lib, ['format'], [undefined], "undefined");
    lib.test(lib, ['format'], [null], "null");
    lib.test(lib, ['format'], [true], "true");
    lib.test(lib, ['format'], [false], "false");
    lib.test(lib, ['format'], [Symbol('hello')], "Symbol(hello)");
    lib.test(lib, ['format'], [[1, 2, 3]], "[1, 2, 3]");
    lib.test(lib, ['format'], [{var1: 1, var2: 'string'}], "{var1: 1, var2: 'string'}");
    lib.test(lib, ['format'], [{}], "{}");
    lib.test(lib, ['format'], [{obj1: {var1: 1, var2: 'string'}, obj2: {var2: 'string'}, var3: true}], "{obj1: {var1: 1, var2: 'string'}, obj2: {var2: 'string'}, var3: true}");

}