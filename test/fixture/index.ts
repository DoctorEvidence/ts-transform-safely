/// <reference path="../../typings.d.ts" />

var obj = {foo: 'bar'}
var empty: string = null
var func = null
var maybeArray = null
export default (num: string) => {
  safely(obj.foo)
}
var tests = {
  basic: function() {
    console.assert(safely(empty.b.c) === undefined)
  },
  assign: function() {
    safely(empty.b.c.d = 'hi')
  },
  call: function() {
    safely(empty.b.someFunction('hi').c)
  },
  computedMember: function() {
    safely(empty[obj.foo].b)
  },
  simpleCall: function(test: string) {
    safely(func(3))
  },
  funcExpr: function() {
    safely((obj && func)(3))
  },
  numericAssignment: function() {
    safely(maybeArray[0] = 'hi')
  },
  push: function() {
    safely(maybeArray.subArray.push('hello'))
  },
  combo1: function() {
    safely(empty.b = (obj.foo as any).bar(func.c))
  },
  arrow: function() {
    return {
      get: safely(console.log(1, (row) => row.SelectedOutcome.FieldType))
    }
  },
  inForOf: function () {
    let _a = []
    for (let i of _a) {
      let b = safely(empty.b.c);
      (function() {
        b = safely(empty.b.c)
      })()
    }
  },
  thisAssignment: function() {
    safely(this.obj['a'] ='b')
  }
}
var test
for (var testName in tests) {
  tests[testName]()
}

