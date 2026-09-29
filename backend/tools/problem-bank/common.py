"""Shared helpers for the CodeTrack problem bank.

Inputs and outputs use LeetCode's notation (compact JSON, one parameter per line).
The Python formatters here mirror CodeTrackIO.fmt(...) in backend/judge/CodeTrackIO.java
so the Python reference answers can be compared byte-for-byte with the Java ones.
"""
import json
import random
from collections import deque

# --------------------------------------------------------------- formatting


def fmt(v):
    """Python value -> LeetCode notation (matches CodeTrackIO.fmtAny)."""
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, int):
        return str(v)
    if isinstance(v, float):
        return "%.5f" % v
    if isinstance(v, str):
        return json.dumps(v, ensure_ascii=False)
    if isinstance(v, (list, tuple)):
        return "[" + ",".join(fmt(x) for x in v) + "]"
    raise TypeError(type(v))


def inp(*values):
    """Build a test-case input: one formatted parameter per line."""
    return "\n".join(fmt(v) for v in values)


def parse(line):
    return json.loads(line)


# -------------------------------------------------------------------- trees


class Node:
    __slots__ = ("val", "left", "right")

    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right


def tree_from_list(vals):
    if not vals or vals[0] is None:
        return None
    root = Node(vals[0])
    q = deque([root])
    i = 1
    while q and i < len(vals):
        node = q.popleft()
        if i < len(vals) and vals[i] is not None:
            node.left = Node(vals[i])
            q.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = Node(vals[i])
            q.append(node.right)
        i += 1
    return root


def tree_to_list(root):
    out, order, idx = [], [root], 0
    while idx < len(order):
        node = order[idx]
        idx += 1
        if node is None:
            out.append(None)
        else:
            out.append(node.val)
            order.append(node.left)
            order.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out


def random_tree(rng, n, lo=-100, hi=100, values=None):
    """Random binary tree shape with n nodes, returned in level-order notation."""
    if n == 0:
        return []
    vals = values if values is not None else [rng.randint(lo, hi) for _ in range(n)]
    root = Node(vals[0])
    slots = [(root, "left"), (root, "right")]
    for v in vals[1:]:
        i = rng.randrange(len(slots))
        parent, side = slots[i]
        slots[i] = slots[-1]
        slots.pop()
        child = Node(v)
        setattr(parent, side, child)
        slots.append((child, "left"))
        slots.append((child, "right"))
    return tree_to_list(root)


def skewed_tree(n, side="left", start=1):
    root = Node(start)
    cur = root
    for v in range(start + 1, start + n):
        nxt = Node(v)
        setattr(cur, side, nxt)
        cur = nxt
    return tree_to_list(root)


def bst_from_values(values):
    root = None
    for v in values:
        if root is None:
            root = Node(v)
            continue
        cur = root
        while True:
            if v < cur.val:
                if cur.left is None:
                    cur.left = Node(v)
                    break
                cur = cur.left
            else:
                if cur.right is None:
                    cur.right = Node(v)
                    break
                cur = cur.right
    return root


# ------------------------------------------------------------- java snippets

LIST_NODE_DOC = """/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
"""

TREE_NODE_DOC = """/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */
"""

PARSERS = {
    "int": "CodeTrackIO.toInt",
    "long": "CodeTrackIO.toLong",
    "boolean": "CodeTrackIO.toBool",
    "String": "CodeTrackIO.toStr",
    "int[]": "CodeTrackIO.toIntArray",
    "int[][]": "CodeTrackIO.toIntMatrix",
    "String[]": "CodeTrackIO.toStrArray",
    "List<String>": "CodeTrackIO.toStrList",
    "ListNode": "CodeTrackIO.toList",
    "TreeNode": "CodeTrackIO.toTree",
}


def driver(params, body):
    """Generate the hidden CodeTrackDriver: parse each input line, then run `body`.

    params: list of (javaType, name). body: Java statements that must end with CodeTrackIO.result(...).
    """
    lines = [
        "import java.util.*;",
        "",
        "public class CodeTrackDriver {",
        "    public static void main(String[] args) throws Exception {",
        "        List<String> in = CodeTrackIO.readLines();",
    ]
    for i, (t, name) in enumerate(params):
        lines.append(f'        {t} {name} = {PARSERS[t]}(CodeTrackIO.line(in, {i}, "{name}"));')
    for stmt in body.strip("\n").split("\n"):
        lines.append("        " + stmt)
    lines += ["    }", "}", ""]
    return "\n".join(lines)


def design_driver(class_name, ctor_args, cases, returns_value):
    """Driver for design problems (LeetCode's ["Op", ...] / [[args], ...] format).

    ctor_args: Java expression list for the constructor given `a` (List<Object> of args).
    cases: dict op -> Java expression evaluating the call (using obj and a) for ops that return a value,
           or statement for void ops; returns_value: set of ops that return a value.
    """
    lines = [
        "import java.util.*;",
        "",
        "public class CodeTrackDriver {",
        "    public static void main(String[] args) throws Exception {",
        "        List<String> in = CodeTrackIO.readLines();",
        '        String[] ops = CodeTrackIO.toStrArray(CodeTrackIO.line(in, 0, "operations"));',
        '        List<?> argList = (List<?>) CodeTrackIO.parseJson(CodeTrackIO.line(in, 1, "arguments"));',
        "        if (ops.length != argList.size()) throw new IllegalArgumentException(\"operations and arguments must have the same length\");",
        "        List<Object> out = new ArrayList<>();",
        f"        {class_name} obj = null;",
        "        for (int i = 0; i < ops.length; i++) {",
        "            List<?> a = (List<?>) argList.get(i);",
        "            switch (ops[i]) {",
        f'                case "{class_name}": obj = new {class_name}({ctor_args}); out.add(null); break;',
    ]
    for op, expr in cases.items():
        if op in returns_value:
            lines.append(f'                case "{op}": out.add({expr}); break;')
        else:
            lines.append(f'                case "{op}": {expr}; out.add(null); break;')
    lines += [
        '                default: throw new IllegalArgumentException("Unknown operation: " + ops[i]);',
        "            }",
        "        }",
        "        CodeTrackIO.result(CodeTrackIO.fmt(out));",
        "    }",
        "}",
        "",
    ]
    return "\n".join(lines)


def num(expr):
    """Java expression converting a parsed JSON number to int."""
    return f"((Number) {expr}).intValue()"
