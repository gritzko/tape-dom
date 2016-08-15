# DOM output formatter for tape tests

Convert tape's TAP output to nicely formatted DOM.

![UI](https://raw.githubusercontent.com/gritzko/tape-dom/master/tape-dom.png)

Tape is an [NPM package](https://www.npmjs.com/package/tape) for
making [Test Anything Protocol](https://testanything.org/) tests in node.js.
Tape nicely runs in a browser using browserify or in a browser-based
debugger like [IronNode](https://github.com/s-a/iron-node).

Isomorphic use:

    var tape = require('tape');
    // If DOM tree is available (browser, IronNode) then render
    // results to DOM. Otherwise, do nothing.
    require('tape-dom')(tape);

Then `browserify my_js_test.js -o browserified_test.js`

The HTML side:

    <html>
    <head>
        <title>tape-dom example</title>
    </head>
    <body>
        <div id="tests"/>
        <script src="browserified_test.js"></script>
    </body>
    </html>
