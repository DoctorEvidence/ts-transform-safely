/// <reference path="../../typings.d.ts" />
var obj = { foo: 'bar' };
var empty = null;
var func = null;
var maybeArray = null;
var tests = {
    basic: function () {
        console.assert(((safe_1 = (empty == null ? void 0 : empty.b)) == null ? void 0 : safe_1.c) === undefined);
        var safe_1;
    },
    assign: function () {
        ((c_1 = (b_1 = empty || (empty = {})).b || (b_1.b = {})).c || (c_1.c = {})).d = 'hi';
        var b_1, c_1;
    },
    call: function () {
        (safe_2 = ((safe_3 = (empty == null ? void 0 : empty.b)) == null ? void 0 : safe_3.someFunction ? safe_3.someFunction('hi') : void 0)) == null ? void 0 : safe_2.c;
        var safe_3, safe_2;
    },
    computedMember: function () {
        (safe_4 = (empty == null ? void 0 : empty[obj == null ? void 0 : obj.foo])) == null ? void 0 : safe_4.b;
        var safe_4;
    },
    simpleCall: function () {
        func ? func(3) : void 0;
    },
    funcExpr: function () {
        (func_1 = (obj && func)) ? func_1(3) : void 0;
        var func_1;
    },
    numericAssignment: function () {
        (maybeArray || (maybeArray = []))[0] = 'hi';
    },
    push: function () {
        ((subArray_1 = maybeArray || (maybeArray = {})).subArray || (subArray_1.subArray = [])).push('hello');
        var subArray_1;
    },
    combo1: function () {
        (empty || (empty = {})).b = (safe_5 = obj == null ? void 0 : obj.foo) == null ? void 0 : safe_5.bar ? safe_5.bar(func == null ? void 0 : func.c) : void 0;
        var safe_5;
    },
    arrow: function () {
        return {
            get: console == null ? void 0 : console.log ? console.log(1, function (row) { return (safe_6 = (row == null ? void 0 : row.SelectedOutcome)) == null ? void 0 : safe_6.FieldType; var safe_6; }) : void 0
        };
    },
    inForOf: function () {
        var _a = [];
        var _loop_1 = function (i) {
            var b = (safe_7 = (empty == null ? void 0 : empty.b)) == null ? void 0 : safe_7.c;
            (function () {
                b = (safe_8 = (empty == null ? void 0 : empty.b)) == null ? void 0 : safe_8.c;
                var safe_8;
            })();
        };
        for (var _i = 0, _a_1 = _a; _i < _a_1.length; _i++) {
            var i = _a_1[_i];
            _loop_1(i);
        }
        var safe_7;
    },
    thisAssignment: function () {
        ((obj_1 = this).obj || (obj_1.obj = {}))['a'] = 'b';
        var obj_1;
    }
};
var test;
for (var testName in tests) {
    tests[testName]();
}
