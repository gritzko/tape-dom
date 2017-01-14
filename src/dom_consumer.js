"use strict";
var DiffMatchPatch = require('diff-match-patch');
var dmp = new DiffMatchPatch();
//var tape = require('tape');
var tape_css = require('./tape_css');


function html_diff (a, b) {
	var diff = dmp.diff_main(b, a);
    dmp.diff_cleanupSemantic(diff);
	var ret = '', tag;
	diff.forEach(function(chunk){
		switch (chunk[0]) {
		case 0: tag = 'span'; break;
		case 1: tag = 'ins'; break;
		case -1: tag = 'del'; break;
		}
		ret += '<'+tag+'>' + chunk[1] + '</'+tag+'>';
	});
	return ret;
}


function startTestDiv (row) {
    var test_div = document.createElement('DIV');
    test_div.id = row.id;
    test_div.setAttribute('class', 'test');

    var name = document.createElement('P');
    name.setAttribute('class', 'name');
    name.appendChild(document.createTextNode(row.name));
    test_div.appendChild(name);

    current_test = test_div;
    test_root.appendChild(test_div);

    return test_div;
}


function assertDiv (row, root) {
    var p = document.createElement('P');
    p.setAttribute('class', 'assert '+(row.ok?'ok':'fail'));

    var ok = document.createElement('SPAN');
    ok.setAttribute('class', 'ok');
    ok.appendChild(document.createTextNode(row.ok ? 'OK' : 'FAIL'));
    p.appendChild(ok);

    if (row.name) {
        var nam = document.createElement('SPAN');
        nam.setAttribute('class', 'name');
        nam.appendChild(document.createTextNode(row.name));
        p.appendChild(nam);
    }
    root.appendChild(p);
    p.scrollIntoView({block: "end", behavior: "smooth"});
    return p;
}

function commentDiv (row, root) {
    var p = document.createElement('P');
    p.setAttribute('class', 'comment');
    p.appendChild(document.createTextNode(row));
    root.appendChild(p);
    return p;
}

function endDiv(row, current_test) {
    var p = document.createElement('P');
    p.setAttribute('class', 'end');
    current_test.appendChild(p);
    return p;
}

function assertFailDiv (row, assert_element) {
    var actual = row.actual;
    var expected = row.expected;
    if (actual && expected &&
        typeof(actual)=='object' &&
        typeof(expected)=='object') {
            actual = JSON.stringify(actual);
            expected = JSON.stringify(expected);
        }

    var actual_span = document.createElement('SPAN');
    actual_span.setAttribute('class', 'actual');
    actual_span.appendChild(document.createTextNode(actual));
    assert_element.appendChild(actual_span);

    var expected_span = document.createElement('SPAN');
    expected_span.setAttribute('class', 'expected');
    expected_span.appendChild(document.createTextNode(expected));
    assert_element.appendChild(expected_span);

    if (row.file) {
        var line = document.createElement('SPAN');
        line.setAttribute('class', 'line');
        var m = /\/([^\/]+)$/.exec(row.file);
        var file_line = m[1];
        line.appendChild(document.createTextNode(file_line));
        assert_element.appendChild(line);
        // this way the user may meaningfully navigate the code
        console.warn(row.error.stack);
    }

    if (actual && expected &&
        actual.constructor==String &&
        expected.constructor==String)
    {
        var diff = document.createElement('P');
        diff.setAttribute('class', 'diff');
        diff.innerHTML = html_diff(actual, expected);
        assert_element.appendChild(diff);
    }

}

var test_root, current_test;
if (typeof(document)==='object') {
    test_root = document.getElementById('tests');
    if (!test_root) {
        test_root = document.createElement('div');
        test_root.setAttribute('id','tests');
        document.body.appendChild(test_root);
    }
    current_test = test_root;
}

function add_some_dom (row) {
    if (row.type==='test') {
        current_test = startTestDiv(row, current_test);
    } else if (row.type==='assert') {
        var assert_element = assertDiv(row, current_test);

        if (!row.ok) {
            assertFailDiv(row, assert_element);
        }
    } else if (row.type==='end') {
        endDiv(row, current_test);
        current_test = current_test.parentNode;
    } else if (row.constructor===String) {
        commentDiv(row, current_test);
    } else {
        console.warn('tape-dom row', row.type, row);
    }
}

function stream (tape) {
    var stream = tape.createStream({ objectMode: true });
    stream.on('data', add_some_dom);
}

function installCSS () {
    var link = document.createElement('style');
    link.setAttribute("type", "text/css");
    var css_body = document.createTextNode(tape_css);
    link.appendChild(css_body);
    document.head.appendChild(link);
}

function init (tape) {
    if (typeof(window)==='object') {
        installCSS();
        stream(tape);
    }
    return init;
}

init.installCSS = installCSS;
init.stream = stream;

module.exports = init;
