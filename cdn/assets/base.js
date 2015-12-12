function injectBigpipeResult(target, result) {
    if (typeof result === 'string') {
        document.getElementById(target).innerHTML = result;
        return ;
    }

    var head = document.getElementsByTagName('head')[0]

    if (result.styles && result.styles.length) {
        for (var i = 0; i < result.styles.length; i++) {
            var link = document.createElement('link');
            link.type = 'text/css';
            link.href = result.styles[i];
            link.rel = 'stylesheet';

            head.appendChild(link);
        }
    }

    if (result.scripts && result.scripts.length) {
        for (var i = 0; i < result.styles.length; i++) {
            var script = document.createElement('script');
            script.src = result.scripts[i];

            head.appendChild(script);
        }
    }

    document.getElementById(target).innerHTML = result.html;
}