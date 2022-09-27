/*

<script src="<?= $PATH_TO_JS . 'lib.js' ?>"></script>
<script src="<?= $PATH_TO_JS . 'base.js' ?>"></script>
<script src="<?= $PATH_TO_JS . 'vision.js' ?>"></script>
<script src="<?= $PATH_TO_JS . 'query.js' ?>"></script>
<script src="<?= $PATH_TO_JS . 'selectors.js' ?>"></script>
<script src="<?= $PATH_TO_JS . 'stable_element.js' ?>"></script>
<script src="<?= $PATH_TO_JS . 'simple_observer.js' ?>"></script>
<script src="<?= $PATH_TO_JS . 'viewport.js' ?>"></script>
<script src="<?= $PATH_TO_JS . 'throttle.js' ?>"></script>
<script src="<?= $PATH_TO_JS . 'builder.js' ?>"></script>
<script src="<?= $PATH_TO_JS . 'common.js' ?>"></script>

*/

function importCommon(lib)
{
    if(!lib)
        lib = importBase();
    lib.query = importQuery(lib);
    lib.vision = importVision();
    lib.data = importDataSpecifiers();
    lib.selector = importSelectors(lib, lib.data);
    lib.viewport = importViewport();
    lib.throttle = importThrottle(lib);
    lib.observer = importSimpleObserver();
    lib.activeObserver = new lib.observer.IntersectionObserver();
    lib.stable = importStableElement(lib, lib.throttle);
    lib.unique = importUnique();
    lib.uniqueSelectors = importUniqueSelectors(lib, lib.unique, lib.selectors);
    lib.builder = importBuilder();
    
    lib.obj.merge(lib.unique, lib.uniqueSelectors);
    lib.copy = lib.obj.copy;

    return lib;
}