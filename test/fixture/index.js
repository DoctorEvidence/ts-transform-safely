/// <reference path="../../typings.d.ts" />
var obj = { foo: 'bar' };
var empty = null;
var func = null;
var maybeArray = null;
var tests = {
    basic: function () {
        console.assert(((_a = (empty == null ? void 0 : empty.b)) == null ? void 0 : _a.c) === undefined);
        var _a;
    },
    assign: function () {
        ((c_1 = (b_1 = empty || (empty = {})).b || (b_1.b = {})).c || (c_1.c = {})).d = 'hi';
        var b_1, c_1;
    },
    call: function () {
        (_a = ((func_1 = ((_b = (empty == null ? void 0 : empty.b)) == null ? void 0 : _b.someFunction)) ? func_1('hi') : void 0)) == null ? void 0 : _a.c;
        var _b, func_1, _a;
    },
    computedMember: function () {
        (_a = (empty == null ? void 0 : empty[obj == null ? void 0 : obj.foo])) == null ? void 0 : _a.b;
        var _a;
    },
    simpleCall: function () {
        func ? func(3) : void 0;
    },
    funcExpr: function () {
        (func_2 = (obj && func)) ? func_2(3) : void 0;
        var func_2;
    },
    numericAssignment: function () {
        (maybeArray || (maybeArray = []))[0] = 'hi';
    },
    push: function () {
        ((subArray_1 = maybeArray || (maybeArray = {})).subArray || (subArray_1.subArray = [])).push('hello');
        var subArray_1;
    },
    combo1: function () {
        (empty || (empty = {})).b = (func_3 = ((_a = obj == null ? void 0 : obj.foo) == null ? void 0 : _a.bar)) ? func_3(func == null ? void 0 : func.c) : void 0;
        var _a, func_3;
    },
    arrow: function () {
        return {
            get: (row) => { return (_a = (row == null ? void 0 : row.SelectedOutcome)) == null ? void 0 : _a.FieldType; var _a; }
        };
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
