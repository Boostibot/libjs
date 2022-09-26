function import_tokenTest(lib)
{
    if(!areImported(lib, 'token', 'test'))
        return importError(lib);
        
    function test_is_separated(prefix, search_string, postfix, separator, result) 
    {
        const text = prefix + search_string + postfix;
        const from = prefix.length;
        const to = from + search_string.length;
        lib.test(lib, ['token', 'isSeparated'], [text, from, to, separator], result);
    }

    test_is_separated('', 'class', '', '|/|', true);
    test_is_separated('|/|', 'class', '', '|/|', true);
    test_is_separated('O', 'class', '', '|/|', false);
    test_is_separated('|/|', 'class', '|/', '|/|', false);
    test_is_separated('|/|', 'class', '|/|', '|/|', true);
    test_is_separated('|/|', 'class', '|O|', '|/|', false);
    test_is_separated('|O|', 'class', '|/|', '|/|', false);
    test_is_separated('a |/|', 'class', '|/|', '|/|', true);
    test_is_separated('a |/|', 'class', '|/| xxxxxx', '|/|', true);
    
    lib.test(lib, ['token', 'toTokens'], ['  abc xyz class '], ['', '', 'abc', 'xyz', 'class', '']);
    lib.test(lib, ['token', 'filterJoin'], [['', '', 'abc', 'xyz', 'class', '']], 'abc xyz class');
    lib.test(lib, ['token', 'clean'], ['  abc xyz class '], 'abc xyz class');

    lib.test(lib, ['token', 'has'], ['', 'class'], false);
    lib.test(lib, ['token', 'has'], ['clax', 'class'], false);
    lib.test(lib, ['token', 'has'], ['', ''], true);
    lib.test(lib, ['token', 'has'], [' class', ''], true);
    lib.test(lib, ['token', 'has'], [' class', 'class'], true);
    lib.test(lib, ['token', 'has'], ['class ', 'class'], true);
    lib.test(lib, ['token', 'has'], [' class ', 'class'], true);
    lib.test(lib, ['token', 'has'], [' class class ', 'class'], true);
    lib.test(lib, ['token', 'has'], ['  classes class classx  ', 'class'], true);
    
    lib.test(lib, ['token', 'add'], ['', 'class'], 'class');
    lib.test(lib, ['token', 'add'], ['x', 'class'], 'x class');
    lib.test(lib, ['token', 'add'], ['x ', ' class'], 'x   class');
    lib.test(lib, ['token', 'add'], ['x ', ''], 'x  ');
    lib.test(lib, ['token', 'add'], ['', ''], '');

    lib.test(lib, ['token', 'remove'], ['', 'class'], '');
    lib.test(lib, ['token', 'remove'], ['clax', 'class'], 'clax');
    lib.test(lib, ['token', 'remove'], ['', ''], '');
    lib.test(lib, ['token', 'remove'], [' class', ''], 'class');
    lib.test(lib, ['token', 'remove'], [' class', 'class'], '');
    lib.test(lib, ['token', 'remove'], ['class ', 'class'], '');
    lib.test(lib, ['token', 'remove'], [' class ', 'class'], '');
    lib.test(lib, ['token', 'remove'], [' class class ', 'class'], '');
    lib.test(lib, ['token', 'remove'], ['  classes class classx  ', 'class'], 'classes classx');

    lib.test(lib, ['token', 'toggle'], ['', 'class'], 'class');
    lib.test(lib, ['token', 'toggle'], ['clax', 'class'], 'clax class');
    lib.test(lib, ['token', 'toggle'], ['', ''], '');
    lib.test(lib, ['token', 'toggle'], ['class', ''], 'class');
    lib.test(lib, ['token', 'toggle'], [' class', 'class'], '');
    lib.test(lib, ['token', 'toggle'], ['class ', 'class'], '');
    lib.test(lib, ['token', 'toggle'], [' class ', 'class'], '');
    lib.test(lib, ['token', 'toggle'], [' class class ', 'class'], '');
    lib.test(lib, ['token', 'toggle'], ['  classes class classx  ', 'class'], 'classes classx');
}