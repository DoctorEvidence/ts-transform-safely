import * as ts from 'typescript'

function getObjectReference(ctx: ts.TransformationContext, name?: string): ts.Identifier {

    const temp = name
        ? ts.createUniqueName(name)
        : ts.createTempVariable(/*recordTempVariable*/ undefined)
    ctx.hoistVariableDeclaration(temp)

    /*if (!path.objectRefId) {
        path.objectRefId = path.scope.generateDeclaredUidIdentifier(name || 'object')
    }
    return path.objectRefId*/
    return temp
}

function markAsSafe(node) {
    node.isSafe = node
    return node
}

function ensureObject(node: ts.Node, ctx: ts.TransformationContext, isArray?: boolean) {
    if (ts.isIdentifier(node)) {
        // (object || (object = {})).property = right
        return ts.createBinary(node, ts.SyntaxKind.BarBarToken, ts.createBinary(node, ts.SyntaxKind.EqualsToken, isArray ? ts.createArrayLiteral() : ts.createObjectLiteral()))
    } else if (ts.isPropertyAccessExpression(node)) {
        let ensuredObject = ensureObject(node.expression, ctx)
        let objectRef = getObjectReference(ctx, node.name.text)
        return ts.createBinary(
            markAsSafe(ts.createPropertyAccess(ts.createBinary(objectRef, ts.SyntaxKind.EqualsToken, ensuredObject), node.name)),
            ts.SyntaxKind.BarBarToken,
            markAsSafe(ts.createBinary(
                markAsSafe(ts.createPropertyAccess(objectRef, node.name)),
                ts.SyntaxKind.EqualsToken,
                isArray ? ts.createArrayLiteral() : ts.createObjectLiteral())))
    } else if (ts.isElementAccessExpression(node)) {
        let ensuredObject = ensureObject(node.expression, ctx, ts.isNumericLiteral(node.argumentExpression))
        let objectRef = getObjectReference(ctx)
        return ts.createBinary(
            markAsSafe(ts.createElementAccess(ts.createBinary(objectRef, ts.SyntaxKind.EqualsToken, ensuredObject), node.argumentExpression)),
            ts.SyntaxKind.BarBarToken,
            markAsSafe(ts.createBinary(
                markAsSafe(ts.createElementAccess(objectRef, node.argumentExpression)),
                ts.SyntaxKind.EqualsToken,
                isArray ? ts.createArrayLiteral() : ts.createObjectLiteral())))
    }
    // else can't be ensured, just used the referenced expression
    return node
}
function visitor(ctx: ts.TransformationContext, sf: ts.SourceFile) {

    const safelyVisitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
        if (ts.isBinaryExpression(node) && node.operatorToken.kind == ts.SyntaxKind.EqualsToken) {
            let { left, operatorToken, right } = node
            if ((<any> node).isSafe) {
                return node
            }
            if (ts.isPropertyAccessExpression(left)) {
                node = ts.updateBinary(node, ts.updatePropertyAccess(left, ensureObject(left.expression, ctx, ts.isNumericLiteral(left.name)), left.name),
                    safelyVisitor(right) as ts.Expression,
                    operatorToken)
                markAsSafe(left)
//                else
                    // expr == null ? void 0 : expr.property = right
            } else if (ts.isElementAccessExpression(left)) {
                node = ts.updateBinary(node, ts.updateElementAccess(left, ensureObject(left.expression, ctx, ts.isNumericLiteral(left.argumentExpression)), left.argumentExpression),
                    safelyVisitor(right) as ts.Expression,
                    operatorToken)
                markAsSafe(left)
//                else
                    // expr == null ? void 0 : expr.property = right
            }
            return node
        }
        if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) {
            node = ts.visitEachChild(node, safelyVisitor, ctx) || node
            if ((<any> node).isSafe) {
                return node
            }
            let propertyAccess = node as ts.PropertyAccessExpression
            let object = propertyAccess.expression
            let objectRef = object
            if (!ts.isIdentifier(object)) {
                objectRef = getObjectReference(ctx)
                object = markAsSafe(ts.createBinary(objectRef, ts.SyntaxKind.EqualsToken, object))
            }
            // object == null ? void 0 : objects.property
            let safeMember = ts.createConditional(
                ts.createBinary(object, ts.SyntaxKind.EqualsEqualsToken, ts.createNull()),
                ts.createVoidZero(),
                markAsSafe(
                    ts.isPropertyAccessExpression(node) ?
                        ts.createPropertyAccess(objectRef, propertyAccess.name) :
                        ts.createElementAccess(objectRef, (node as ts.ElementAccessExpression).argumentExpression)));
            (<any> safeMember).isSafeMember = true
            return safeMember
        }
        if (ts.isCallExpression(node)) {
            if ((<any> node).isSafe) {
                return node
            }
            let callee = node.expression
            if (ts.isPropertyAccessExpression(callee) && (callee.name.text === 'push' || callee.name.text === 'unshift')) {
                // for push or unshift, we ensure an array rather than doing existence checks
                (<any> callee).isSafe = true;
                (<any> node).isSafe = true
                return ts.updateCall(node,
                    ts.updatePropertyAccess(callee, ensureObject(callee.expression, ctx, true), callee.name), [], node.arguments)
            }
            node = ts.visitEachChild(node, safelyVisitor, ctx) || node
            if ((<any> node).isSafe) {
                return node
            }
            callee = (<ts.CallExpression> node).expression
            if ((<any> callee).isSafeMember) {
                // objectExpr.method == null ? void 0 : objectExpr.method ? objectExpr.method(args) : void 0
                let calleeConditional = <ts.ConditionalExpression> (<any> node)
                let member = calleeConditional.whenFalse
                calleeConditional.whenFalse = ts.createConditional(
                        member,
                        markAsSafe(ts.createCall(member, [], (<ts.CallExpression> node).arguments)),
                        ts.createVoidZero())
                return callee
            } else {
                // func == null ? void 0 : func()
                if (ts.isIdentifier(callee)) {
                    return ts.createConditional(
                        callee,
                        markAsSafe(ts.createCall(callee, [], (<ts.CallExpression> node).arguments)),
                        ts.createVoidZero())
                } else {
                    let funcRef = getObjectReference(ctx, 'func')
                    return ts.createConditional(
                        ts.createBinary(funcRef, ts.SyntaxKind.EqualsToken, callee),
                        markAsSafe(ts.createCall(funcRef, [], (<ts.CallExpression> node).arguments)),
                        ts.createVoidZero())

                }
            }
        }
        return ts.visitEachChild(node, safelyVisitor, ctx)
    }
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
        if (ts.isCallExpression(node)) {
            if (node.expression.getText(sf) == 'safely') {
                return safelyVisitor(node.arguments[0])
            }
        }
        return ts.visitEachChild(node, visitor, ctx)
    }
    return visitor
}

export default function(/*opts?: Opts*/) {
    return (ctx: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
        return (sf: ts.SourceFile) => ts.visitNode(sf, visitor(ctx, sf))
    }
}
