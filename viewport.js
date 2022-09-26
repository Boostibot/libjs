function importViewport() 
{       
    'use strict';
    function width() {return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);}
    function height() {return Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);}

    function getPixelCmRatio() {
        const elemDiv = document.createElement('div');
        elemDiv.style.cssText = 
            'position: absolute; top: -100cm; left: -100cm, height: 100cm, width: 100cm';
        
        document.body.appendChild(elemDiv);
        const px_per_cm = elemDiv.clientWidth / 100;
        document.body.removeChild(elemDiv);

        return px_per_cm;
    }

    const PIXEL_CM_RATIO = getPixelCmRatio();
    const PIXEL_INCH_RATIO = PIXEL_CM_RATIO * 0.393701;

    return {
        width,
        height,
        PIXEL_CM_RATIO,
        PIXEL_INCH_RATIO
    };
}
