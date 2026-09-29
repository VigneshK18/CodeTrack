"""Problems 18-34."""
import heapq
import random
from collections import deque
from common import (TREE_NODE_DOC, bst_from_values, design_driver, driver, fmt, inp, num, parse,
                    random_tree, skewed_tree, tree_from_list, tree_to_list)

rng = random.Random(2002)
P = []


# 18 -----------------------------------------------------------------------
def py_knap(lines):
    w, v, cap = parse(lines[0]), parse(lines[1]), parse(lines[2])
    dp = [0] * (cap + 1)
    for i in range(len(w)):
        for c in range(cap, w[i] - 1, -1):
            dp[c] = max(dp[c], dp[c - w[i]] + v[i])
    return fmt(dp[cap])


def knap_case(n, cap, wmax, vmax):
    return inp([rng.randint(1, wmax) for _ in range(n)], [rng.randint(1, vmax) for _ in range(n)], cap)


P.append(dict(
    title="0/1 Knapsack",
    category="Dynamic Programming", difficulty="Medium", tags="dp,array",
    description="You have `n` items. Item `i` has weight `weights[i]` and value `values[i]`. "
                "Your bag can carry a total weight of at most `capacity`.\n\n"
                "Each item can be taken at most once. Return the maximum total value you can carry.",
    params=["weights", "values", "capacity"],
    constraints=["1 <= n <= 200", "weights.length == values.length == n", "1 <= weights[i] <= 1000",
                 "1 <= values[i] <= 10^4", "0 <= capacity <= 5000"],
    template="""class Solution {
    public int knapsack(int[] weights, int[] values, int capacity) {

    }
}
""",
    solution="""class Solution {
    public int knapsack(int[] weights, int[] values, int capacity) {
        int[] dp = new int[capacity + 1]; // dp[c] = best value with total weight <= c
        for (int i = 0; i < weights.length; i++) {
            // go downwards so each item is used at most once
            for (int c = capacity; c >= weights[i]; c--) {
                dp[c] = Math.max(dp[c], dp[c - weights[i]] + values[i]);
            }
        }
        return dp[capacity];
    }
}
""",
    driver=driver([("int[]", "weights"), ("int[]", "values"), ("int", "capacity")],
                  "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().knapsack(weights, values, capacity)));"),
    explanation="`dp[c]` is the best value achievable with capacity `c` using the items processed so far. "
                "For each item, either skip it or take it: `dp[c] = max(dp[c], dp[c - w] + v)`. Iterating `c` from high to "
                "low makes sure an item is not counted twice.",
    time="O(n x capacity)", space="O(capacity)",
    samples=[dict(input=inp([10, 20, 30], [60, 100, 120], 50), explanation="Take the items with weight 20 and 30: value 100 + 120 = 220."),
             dict(input=inp([1, 3, 4, 5], [1, 4, 5, 7], 7), explanation="Take weights 3 and 4 for a value of 4 + 5 = 9.")],
    hidden=[inp([5], [10], 4), inp([5], [10], 5), inp([4, 4, 4], [5, 5, 5], 0), inp([1, 1, 1], [10, 20, 30], 2),
            knap_case(20, 50, 20, 100), knap_case(100, 1000, 100, 1000), knap_case(200, 5000, 1000, 10**4)],
    py=py_knap,
))


# 19 -----------------------------------------------------------------------
def py_lcs(lines):
    a, b = parse(lines[0]), parse(lines[1])
    prev = [0] * (len(b) + 1)
    for i in range(1, len(a) + 1):
        cur = [0] * (len(b) + 1)
        ai = a[i - 1]
        for j in range(1, len(b) + 1):
            cur[j] = prev[j - 1] + 1 if ai == b[j - 1] else max(prev[j], cur[j - 1])
        prev = cur
    return fmt(prev[len(b)])


def rand_str(n, alphabet="abcdefghijklmnopqrstuvwxyz"):
    return "".join(rng.choice(alphabet) for _ in range(n))


P.append(dict(
    title="Longest Common Subsequence",
    category="Dynamic Programming", difficulty="Medium", tags="dp,string",
    description="Given two strings `text1` and `text2`, return the length of their longest common subsequence, "
                "or `0` if there is none.\n\nA subsequence keeps the relative order of characters but may skip some, "
                "for example `\"ace\"` is a subsequence of `\"abcde\"`.",
    params=["text1", "text2"],
    constraints=["1 <= text1.length, text2.length <= 1000", "Both strings consist of lowercase English letters"],
    template="""class Solution {
    public int longestCommonSubsequence(String text1, String text2) {

    }
}
""",
    solution="""class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        int n = text1.length(), m = text2.length();
        int[][] dp = new int[n + 1][m + 1]; // dp[i][j] = LCS of first i and first j chars
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                if (text1.charAt(i - 1) == text2.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1] + 1;
                else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
        return dp[n][m];
    }
}
""",
    driver=driver([("String", "text1"), ("String", "text2")],
                  "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().longestCommonSubsequence(text1, text2)));"),
    explanation="`dp[i][j]` is the LCS length of the first `i` characters of `text1` and the first `j` of `text2`. "
                "If the last characters match, extend the diagonal: `dp[i-1][j-1] + 1`. Otherwise drop one character "
                "from either string and take the better result.",
    time="O(n x m)", space="O(n x m)",
    samples=[dict(input=inp("abcde", "ace"), explanation="The longest common subsequence is \"ace\"."),
             dict(input=inp("abc", "def"), explanation="There is no common subsequence.")],
    hidden=[inp("abc", "abc"), inp("a", "a"), inp("a", "b"), inp("bsbininm", "jmjkbkjkv"), inp("ezupkr", "ubmrapg"),
            inp(rand_str(300, "abcd"), rand_str(250, "abcd")), inp(rand_str(1000), rand_str(1000))],
    py=py_lcs,
))


# 20 -----------------------------------------------------------------------
def py_edit(lines):
    a, b = parse(lines[0]), parse(lines[1])
    prev = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        cur = [i] + [0] * len(b)
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1]
            else:
                cur[j] = 1 + min(prev[j - 1], prev[j], cur[j - 1])
        prev = cur
    return fmt(prev[len(b)])


P.append(dict(
    title="Edit Distance",
    category="Dynamic Programming", difficulty="Hard", tags="dp,string",
    description="Given two strings `word1` and `word2`, return the minimum number of operations needed to convert "
                "`word1` into `word2`.\n\nYou may insert a character, delete a character, or replace a character.",
    params=["word1", "word2"],
    constraints=["0 <= word1.length, word2.length <= 500", "Both strings consist of lowercase English letters"],
    template="""class Solution {
    public int minDistance(String word1, String word2) {

    }
}
""",
    solution="""class Solution {
    public int minDistance(String word1, String word2) {
        int n = word1.length(), m = word2.length();
        int[][] dp = new int[n + 1][m + 1];
        for (int i = 0; i <= n; i++) dp[i][0] = i; // delete everything
        for (int j = 0; j <= m; j++) dp[0][j] = j; // insert everything
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = 1 + Math.min(dp[i - 1][j - 1],            // replace
                                   Math.min(dp[i - 1][j], dp[i][j - 1])); // delete / insert
                }
            }
        }
        return dp[n][m];
    }
}
""",
    driver=driver([("String", "word1"), ("String", "word2")],
                  "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().minDistance(word1, word2)));"),
    explanation="`dp[i][j]` is the edit distance between the first `i` characters of `word1` and the first `j` of `word2`. "
                "Matching last characters cost nothing extra. Otherwise take 1 plus the cheapest of replace "
                "(`dp[i-1][j-1]`), delete (`dp[i-1][j]`) or insert (`dp[i][j-1]`).",
    time="O(n x m)", space="O(n x m)",
    samples=[dict(input=inp("horse", "ros"), explanation="horse -> rorse (replace h) -> rose (delete r) -> ros (delete e)"),
             dict(input=inp("intention", "execution"), explanation="Five operations are needed.")],
    hidden=[inp("", ""), inp("", "abc"), inp("abc", ""), inp("a", "a"), inp("kitten", "sitting"), inp("abc", "yabd"),
            inp(rand_str(120, "ab"), rand_str(100, "ab")), inp(rand_str(500), rand_str(480))],
    py=py_edit,
))


# 21 -----------------------------------------------------------------------
def inorder(node, out):
    stack = []
    while stack or node:
        while node:
            stack.append(node)
            node = node.left
        node = stack.pop()
        out.append(node.val)
        node = node.right
    return out


def py_inorder(lines):
    return fmt(inorder(tree_from_list(parse(lines[0])), []))


P.append(dict(
    title="Binary Tree Inorder Traversal",
    category="Trees", difficulty="Easy", tags="tree,binary-tree,recursion",
    description="Given the `root` of a binary tree, return the inorder traversal of its nodes' values "
                "(left subtree, then the node, then the right subtree).\n\n"
                "Trees are written in level order, with `null` for a missing child.",
    params=["root"],
    constraints=["The number of nodes in the tree is in the range [0, 1000]", "-10^4 <= Node.val <= 10^4"],
    template=TREE_NODE_DOC + """class Solution {
    public List<Integer> inorderTraversal(TreeNode root) {

    }
}
""",
    solution="""import java.util.*;

class Solution {
    public List<Integer> inorderTraversal(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        Deque<TreeNode> stack = new ArrayDeque<>();
        TreeNode node = root;
        while (node != null || !stack.isEmpty()) {
            while (node != null) {       // go as far left as possible
                stack.push(node);
                node = node.left;
            }
            node = stack.pop();
            result.add(node.val);        // visit
            node = node.right;           // then the right subtree
        }
        return result;
    }
}
""",
    driver=driver([("TreeNode", "root")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().inorderTraversal(root)));"),
    explanation="Recursively: traverse the left subtree, record the node, traverse the right subtree. "
                "The iterative version uses an explicit stack: push nodes while going left, pop one to visit it, "
                "then continue from its right child.",
    time="O(n)", space="O(h) where h is the tree height",
    samples=[dict(input=inp([1, None, 2, 3]), explanation=""),
             dict(input=inp([]), explanation="An empty tree has no nodes.")],
    hidden=[inp([1]), inp([1, 2, 3, 4, 5, None, 8, None, None, 6, 7, 9]), inp(random_tree(rng, 30)),
            inp(random_tree(rng, 300)), inp(skewed_tree(1000, "left")), inp(skewed_tree(500, "right"))],
    py=py_inorder,
))



# 22 -----------------------------------------------------------------------
def depth(root):
    if root is None:
        return 0
    best, q = 0, deque([(root, 1)])
    while q:
        node, d = q.popleft()
        best = max(best, d)
        for child in (node.left, node.right):
            if child:
                q.append((child, d + 1))
    return best


def py_depth(lines):
    return fmt(depth(tree_from_list(parse(lines[0]))))


P.append(dict(
    title="Maximum Depth of Binary Tree",
    category="Trees", difficulty="Easy", tags="tree,dfs,recursion",
    description="Given the `root` of a binary tree, return its maximum depth: the number of nodes along the longest "
                "path from the root down to the farthest leaf.",
    params=["root"],
    constraints=["The number of nodes in the tree is in the range [0, 10^4]", "-10^4 <= Node.val <= 10^4"],
    template=TREE_NODE_DOC + """class Solution {
    public int maxDepth(TreeNode root) {

    }
}
""",
    solution="""class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
    }
}
""",
    driver=driver([("TreeNode", "root")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().maxDepth(root)));"),
    explanation="An empty tree has depth 0. Otherwise the depth is 1 (the root) plus the larger depth of its two subtrees.",
    time="O(n)", space="O(h)",
    samples=[dict(input=inp([3, 9, 20, None, None, 15, 7]), explanation=""),
             dict(input=inp([1, None, 2]), explanation="")],
    hidden=[inp([]), inp([0]), inp(random_tree(rng, 15)), inp(random_tree(rng, 500)), inp(random_tree(rng, 1500)),
            inp(skewed_tree(2000, "right"))],
    py=py_depth,
))


# 23 -----------------------------------------------------------------------
def py_lca(lines):
    root = tree_from_list(parse(lines[0]))
    p, q = parse(lines[1]), parse(lines[2])
    node = root
    while node:
        if p < node.val and q < node.val:
            node = node.left
        elif p > node.val and q > node.val:
            node = node.right
        else:
            return fmt(node.val)
    return fmt(None)


def lca_case(n):
    vals = rng.sample(range(-10**4, 10**4), n)
    tree = tree_to_list(bst_from_values(vals))
    p, q = rng.choice(vals), rng.choice(vals)
    return inp(tree, p, q)


P.append(dict(
    title="Lowest Common Ancestor",
    category="Trees", difficulty="Medium", tags="tree,bst,recursion",
    description="Given a binary search tree (BST) and two of its nodes `p` and `q`, return their lowest common "
                "ancestor: the deepest node that has both `p` and `q` as descendants (a node counts as a descendant "
                "of itself).\n\nThe input gives the tree and the **values** of `p` and `q`; the judge passes you the "
                "matching nodes and prints the value of the node you return.",
    params=["root", "p", "q"],
    constraints=["The number of nodes in the tree is in the range [2, 10^4]", "-10^4 <= Node.val <= 10^4",
                 "All Node.val are unique", "p and q exist in the BST"],
    template=TREE_NODE_DOC + """class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {

    }
}
""",
    solution="""class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        TreeNode node = root;
        while (node != null) {
            if (p.val < node.val && q.val < node.val) node = node.left;        // both on the left
            else if (p.val > node.val && q.val > node.val) node = node.right;  // both on the right
            else return node;                                                  // they split here
        }
        return null;
    }
}
""",
    driver=driver([("TreeNode", "root"), ("int", "p"), ("int", "q")],
                  "TreeNode ans = new Solution().lowestCommonAncestor(root, CodeTrackIO.findNode(root, p), CodeTrackIO.findNode(root, q));\n"
                  "CodeTrackIO.result(ans == null ? \"null\" : CodeTrackIO.fmt(ans.val));"),
    explanation="In a BST, if both values are smaller than the current node they are both in the left subtree, and if "
                "both are larger they are in the right subtree. The first node where they split (or where one of them "
                "is the node itself) is the lowest common ancestor.",
    time="O(h)", space="O(1)",
    samples=[dict(input=inp([6, 2, 8, 0, 4, 7, 9, None, None, 3, 5], 2, 8), explanation="2 is in the left subtree and 8 in the right, so the root 6 is the LCA."),
             dict(input=inp([6, 2, 8, 0, 4, 7, 9, None, None, 3, 5], 2, 4), explanation="A node can be its own ancestor, so the LCA of 2 and 4 is 2.")],
    hidden=[inp([2, 1], 2, 1), inp([2, 1], 1, 1), inp([6, 2, 8, 0, 4, 7, 9, None, None, 3, 5], 3, 5),
            lca_case(10), lca_case(100), lca_case(1000), lca_case(2000)],
    py=py_lca,
))


# 24 -----------------------------------------------------------------------
def py_design(lines, factory):
    ops, args = parse(lines[0]), parse(lines[1])
    obj, out = None, []
    for op, a in zip(ops, args):
        if obj is None:
            obj = factory(*a)
            out.append(None)
        else:
            out.append(getattr(obj, op)(*a))
    return fmt(out)


class PyQueue:
    def __init__(self):
        self.q = deque()

    def push(self, x):
        self.q.append(x)

    def pop(self):
        return self.q.popleft()

    def peek(self):
        return self.q[0]

    def empty(self):
        return not self.q


def queue_ops(n):
    ops, args, size = ["MyQueue"], [[]], 0
    for _ in range(n):
        r = rng.random()
        if size == 0 or r < 0.45:
            ops.append("push")
            args.append([rng.randint(1, 9)])
            size += 1
        elif r < 0.7:
            ops.append("pop")
            args.append([])
            size -= 1
        elif r < 0.9:
            ops.append("peek")
            args.append([])
        else:
            ops.append("empty")
            args.append([])
    return inp(ops, args)


P.append(dict(
    title="Queue Using Stacks",
    category="Stacks", difficulty="Easy", tags="stack,queue,design",
    description="Implement a first-in-first-out (FIFO) queue using only two stacks. The `MyQueue` class supports:\n\n"
                "- `void push(int x)` adds `x` to the back of the queue.\n"
                "- `int pop()` removes and returns the element at the front.\n"
                "- `int peek()` returns the front element without removing it.\n"
                "- `boolean empty()` returns `true` if the queue is empty.\n\n"
                "The input lists the operations and their arguments; the output lists each call's return value "
                "(`null` for `void` methods and the constructor). All `pop` and `peek` calls are valid.",
    params=["operations", "arguments"],
    constraints=["1 <= x <= 9", "At most 1000 calls are made", "pop and peek are only called on a non-empty queue"],
    template="""class MyQueue {

    public MyQueue() {

    }

    public void push(int x) {

    }

    public int pop() {

    }

    public int peek() {

    }

    public boolean empty() {

    }
}
""",
    solution="""import java.util.*;

class MyQueue {
    private final Deque<Integer> in = new ArrayDeque<>();   // receives pushes
    private final Deque<Integer> out = new ArrayDeque<>();  // serves pops in FIFO order

    public MyQueue() {}

    public void push(int x) {
        in.push(x);
    }

    public int pop() {
        peek();
        return out.pop();
    }

    public int peek() {
        if (out.isEmpty()) {
            while (!in.isEmpty()) out.push(in.pop()); // reversing a stack gives queue order
        }
        return out.peek();
    }

    public boolean empty() {
        return in.isEmpty() && out.isEmpty();
    }
}
""",
    driver=design_driver("MyQueue", "", {
        "push": f"obj.push({num('a.get(0)')})",
        "pop": "obj.pop()",
        "peek": "obj.peek()",
        "empty": "obj.empty()",
    }, {"pop", "peek", "empty"}),
    explanation="Push onto an `in` stack. To pop or peek, take from an `out` stack; if `out` is empty, first move every "
                "element from `in` to `out`, which reverses them into queue order. Each element moves at most once, "
                "so every operation is amortized O(1).",
    time="Amortized O(1) per operation", space="O(n)",
    samples=[dict(input=inp(["MyQueue", "push", "push", "peek", "pop", "empty"], [[], [1], [2], [], [], []]),
                  explanation="push 1, push 2, peek returns 1, pop returns 1, and the queue still holds 2 so empty is false."),
             dict(input=inp(["MyQueue", "push", "pop", "empty", "push", "push", "peek"], [[], [5], [], [], [3], [4], []]),
                  explanation="")],
    hidden=[queue_ops(5), queue_ops(30), queue_ops(200), queue_ops(999)],
    py=lambda lines: py_design(lines, PyQueue),
))


# 25 -----------------------------------------------------------------------
def py_hamming(lines):
    return fmt(bin(parse(lines[0])).count("1"))


P.append(dict(
    title="Number of 1 Bits",
    category="Bit Manipulation", difficulty="Easy", tags="bit-manipulation",
    description="Given a positive integer `n`, return the number of `1` bits in its binary representation "
                "(also called its Hamming weight).",
    params=["n"],
    constraints=["1 <= n <= 2^31 - 1"],
    template="""class Solution {
    public int hammingWeight(int n) {

    }
}
""",
    solution="""class Solution {
    public int hammingWeight(int n) {
        int count = 0;
        while (n != 0) {
            n &= (n - 1); // clears the lowest set bit
            count++;
        }
        return count;
    }
}
""",
    driver=driver([("int", "n")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().hammingWeight(n)));"),
    explanation="`n & (n - 1)` removes the lowest set bit of `n`. Repeat until `n` becomes 0 and count the steps; "
                "the loop runs once per `1` bit.",
    time="O(number of set bits)", space="O(1)",
    samples=[dict(input=inp(11), explanation="11 is 1011 in binary, which has three 1 bits."),
             dict(input=inp(128), explanation="128 is 10000000 in binary.")],
    hidden=[inp(x) for x in [1, 2, 7, 255, 1023, 2147483645, 2147483647, rng.randint(1, 2**31 - 1), rng.randint(1, 2**31 - 1)]],
    py=py_hamming,
))


# 26 -----------------------------------------------------------------------
def py_single(lines):
    r = 0
    for x in parse(lines[0]):
        r ^= x
    return fmt(r)


def single_case(pairs):
    vals = rng.sample(range(-30000, 30000), pairs + 1)
    nums = vals[:-1] * 2 + [vals[-1]]
    rng.shuffle(nums)
    return inp(nums)


P.append(dict(
    title="Single Number",
    category="Bit Manipulation", difficulty="Easy", tags="bit-manipulation,array",
    description="Given a non-empty array `nums` where every element appears twice except for one, find that single one.\n\n"
                "Aim for linear time and constant extra space.",
    params=["nums"],
    constraints=["1 <= nums.length <= 3 * 10^4", "-3 * 10^4 <= nums[i] <= 3 * 10^4",
                 "Every element appears twice except one, which appears once"],
    template="""class Solution {
    public int singleNumber(int[] nums) {

    }
}
""",
    solution="""class Solution {
    public int singleNumber(int[] nums) {
        int result = 0;
        for (int x : nums) result ^= x; // pairs cancel out: a ^ a = 0
        return result;
    }
}
""",
    driver=driver([("int[]", "nums")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().singleNumber(nums)));"),
    explanation="XOR has the properties `a ^ a = 0` and `a ^ 0 = a`, and the order does not matter. XOR-ing every "
                "element cancels all the pairs and leaves only the single number.",
    time="O(n)", space="O(1)",
    samples=[dict(input=inp([2, 2, 1]), explanation=""),
             dict(input=inp([4, 1, 2, 1, 2]), explanation="")],
    hidden=[inp([1]), inp([-1, -1, -2]), inp([0, 1, 0]), inp([30000, -30000, 30000]),
            single_case(20), single_case(2000)],
    py=py_single,
))


# 27, 28 --------------------------------------------------------------------
def py_sort(lines):
    return fmt(sorted(parse(lines[0])))


sort_hidden = [inp([1]), inp([2, 2, 2, 2]), inp([3, -1, 0, -1, 3]),
               inp(list(range(2000))), inp(list(range(2000, 0, -1))),
               inp([rng.randint(-5 * 10**4, 5 * 10**4) for _ in range(4000)]),
               inp([rng.randint(0, 3) for _ in range(2000)])]

P.append(dict(
    title="Quick Sort Implementation",
    category="Sorting", difficulty="Medium", tags="array,sorting,divide-and-conquer",
    description="Given an array of integers `nums`, sort it in ascending order **using quick sort** and return the sorted array.\n\n"
                "Do not use built-in sorting functions such as `Arrays.sort`.",
    params=["nums"],
    constraints=["1 <= nums.length <= 10^4", "-5 * 10^4 <= nums[i] <= 5 * 10^4"],
    template="""class Solution {
    public int[] sortArray(int[] nums) {

    }
}
""",
    solution="""import java.util.*;

class Solution {
    private final Random random = new Random(7);

    public int[] sortArray(int[] nums) {
        quickSort(nums, 0, nums.length - 1);
        return nums;
    }

    private void quickSort(int[] a, int lo, int hi) {
        if (lo >= hi) return;
        int pivot = a[lo + random.nextInt(hi - lo + 1)]; // random pivot avoids O(n^2) on sorted input
        // three-way partition: < pivot | == pivot | > pivot (handles many duplicates)
        int lt = lo, i = lo, gt = hi;
        while (i <= gt) {
            if (a[i] < pivot) swap(a, lt++, i++);
            else if (a[i] > pivot) swap(a, i, gt--);
            else i++;
        }
        quickSort(a, lo, lt - 1);
        quickSort(a, gt + 1, hi);
    }

    private void swap(int[] a, int i, int j) {
        int t = a[i]; a[i] = a[j]; a[j] = t;
    }
}
""",
    driver=driver([("int[]", "nums")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().sortArray(nums)));"),
    explanation="Pick a pivot, partition the array into values smaller than, equal to and larger than the pivot, then "
                "recursively sort the smaller and larger parts. A random pivot keeps the expected running time at "
                "O(n log n) even for already-sorted input, and three-way partitioning handles repeated values.",
    time="O(n log n) expected", space="O(log n) expected recursion",
    samples=[dict(input=inp([10, 7, 8, 9, 1, 5]), explanation=""),
             dict(input=inp([5, 2, 3, 1]), explanation="")],
    hidden=sort_hidden,
    py=py_sort,
))

P.append(dict(
    title="Merge Sort Implementation",
    category="Sorting", difficulty="Medium", tags="array,sorting,divide-and-conquer",
    description="Given an array of integers `nums`, sort it in ascending order **using merge sort** and return the sorted array.\n\n"
                "Do not use built-in sorting functions such as `Arrays.sort`.",
    params=["nums"],
    constraints=["1 <= nums.length <= 10^4", "-5 * 10^4 <= nums[i] <= 5 * 10^4"],
    template="""class Solution {
    public int[] sortArray(int[] nums) {

    }
}
""",
    solution="""class Solution {
    public int[] sortArray(int[] nums) {
        int[] buffer = new int[nums.length];
        mergeSort(nums, buffer, 0, nums.length - 1);
        return nums;
    }

    private void mergeSort(int[] a, int[] buf, int lo, int hi) {
        if (lo >= hi) return;
        int mid = (lo + hi) >>> 1;
        mergeSort(a, buf, lo, mid);
        mergeSort(a, buf, mid + 1, hi);
        // merge the two sorted halves
        int i = lo, j = mid + 1, k = lo;
        while (i <= mid && j <= hi) buf[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];
        while (i <= mid) buf[k++] = a[i++];
        while (j <= hi) buf[k++] = a[j++];
        System.arraycopy(buf, lo, a, lo, hi - lo + 1);
    }
}
""",
    driver=driver([("int[]", "nums")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().sortArray(nums)));"),
    explanation="Split the array in half, sort each half recursively, then merge the two sorted halves by repeatedly "
                "taking the smaller front element. The recursion depth is log n and each level does O(n) merging work.",
    time="O(n log n)", space="O(n)",
    samples=[dict(input=inp([38, 27, 43, 3, 9, 82, 10]), explanation=""),
             dict(input=inp([5, 1, 1, 2, 0, 0]), explanation="")],
    hidden=sort_hidden,
    py=py_sort,
))


# 29, 30 --------------------------------------------------------------------
def py_bfs(lines):
    adj = parse(lines[0])
    seen, order, q = {0}, [], deque([0])
    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            if v not in seen:
                seen.add(v)
                q.append(v)
    return fmt(order)


def py_dfs(lines):
    adj = parse(lines[0])
    seen, order = set(), []
    stack = [(0, iter(adj[0]))]
    seen.add(0)
    order.append(0)
    while stack:
        u, it = stack[-1]
        for v in it:
            if v not in seen:
                seen.add(v)
                order.append(v)
                stack.append((v, iter(adj[v])))
                break
        else:
            stack.pop()
    return fmt(order)


def random_graph(n, m):
    adj = [[] for _ in range(n)]
    for _ in range(m):
        u, v = rng.randrange(n), rng.randrange(n)
        if v not in adj[u]:
            adj[u].append(v)
    return adj


def chain_graph(n):
    return [[i + 1] for i in range(n - 1)] + [[]]


graph_hidden = [inp([[]]), inp([[1], [0]]), inp([[1], [2], [0], [0]]), inp([[1, 2], [], [], [0]]),
                inp(random_graph(10, 15)), inp(random_graph(60, 120)), inp(random_graph(500, 1500)),
                inp(chain_graph(2000))]

P.append(dict(
    title="Breadth First Search (BFS)",
    category="Graphs", difficulty="Medium", tags="graph,bfs,queue",
    description="You are given a directed graph with `V` vertices numbered `0` to `V - 1` as an adjacency list "
                "`adj`, where `adj[i]` lists the neighbours of vertex `i` **in the order they should be visited**.\n\n"
                "Return the breadth-first traversal starting from vertex `0`. Only vertices reachable from `0` appear "
                "in the result.",
    params=["adj"],
    constraints=["1 <= V <= 10^4", "0 <= adj[i][j] < V", "adj[i] has no duplicate neighbours"],
    template="""class Solution {
    public List<Integer> bfsOfGraph(int[][] adj) {

    }
}
""",
    solution="""import java.util.*;

class Solution {
    public List<Integer> bfsOfGraph(int[][] adj) {
        List<Integer> order = new ArrayList<>();
        boolean[] visited = new boolean[adj.length];
        Deque<Integer> queue = new ArrayDeque<>();
        visited[0] = true;
        queue.add(0);
        while (!queue.isEmpty()) {
            int u = queue.poll();
            order.add(u);
            for (int v : adj[u]) {
                if (!visited[v]) {       // mark when enqueued so nothing is added twice
                    visited[v] = true;
                    queue.add(v);
                }
            }
        }
        return order;
    }
}
""",
    driver=driver([("int[][]", "adj")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().bfsOfGraph(adj)));"),
    explanation="Use a queue. Start with vertex 0 marked as visited. Repeatedly take the front vertex, record it, and "
                "enqueue each unvisited neighbour (marking it visited as it is enqueued). The queue makes vertices "
                "come out level by level.",
    time="O(V + E)", space="O(V)",
    samples=[dict(input=inp([[1, 2], [2], [0, 3], [3]]), explanation="From 0 visit 1 and 2, then 3 (a neighbour of 2)."),
             dict(input=inp([[1, 2, 3], [], [4], [], []]), explanation="Level 1 is 1, 2, 3; level 2 is 4.")],
    hidden=graph_hidden,
    py=py_bfs,
))

P.append(dict(
    title="Depth First Search (DFS)",
    category="Graphs", difficulty="Medium", tags="graph,dfs,recursion",
    description="You are given a directed graph with `V` vertices numbered `0` to `V - 1` as an adjacency list "
                "`adj`, where `adj[i]` lists the neighbours of vertex `i` **in the order they should be visited**.\n\n"
                "Return the depth-first traversal (preorder) starting from vertex `0`: visit a vertex, then fully "
                "explore its first unvisited neighbour before moving on to the next one.",
    params=["adj"],
    constraints=["1 <= V <= 10^4", "0 <= adj[i][j] < V", "adj[i] has no duplicate neighbours"],
    template="""class Solution {
    public List<Integer> dfsOfGraph(int[][] adj) {

    }
}
""",
    solution="""import java.util.*;

class Solution {
    public List<Integer> dfsOfGraph(int[][] adj) {
        List<Integer> order = new ArrayList<>();
        dfs(0, adj, new boolean[adj.length], order);
        return order;
    }

    private void dfs(int u, int[][] adj, boolean[] visited, List<Integer> order) {
        visited[u] = true;
        order.add(u);
        for (int v : adj[u]) {
            if (!visited[v]) dfs(v, adj, visited, order);
        }
    }
}
""",
    driver=driver([("int[][]", "adj")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().dfsOfGraph(adj)));"),
    explanation="Recursively visit a vertex, mark it, then recurse into each unvisited neighbour in order. "
                "The call stack remembers where to continue after a branch is fully explored.",
    time="O(V + E)", space="O(V) recursion",
    samples=[dict(input=inp([[1, 2], [2], [0, 3], [3]]), explanation="0 -> 1 -> 2 -> 3"),
             dict(input=inp([[2, 3, 1], [0], [0, 4], [0], [2]]), explanation="0 -> 2 -> 4, back to 0 -> 3, then 1.")],
    hidden=graph_hidden,
    py=py_dfs,
))


# 31 -----------------------------------------------------------------------
def py_dijkstra(lines):
    n, edges, src = parse(lines[0]), parse(lines[1]), parse(lines[2])
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
        adj[v].append((u, w))
    dist = [None] * n
    pq = [(0, src)]
    best = {src: 0}
    while pq:
        d, u = heapq.heappop(pq)
        if dist[u] is not None:
            continue
        dist[u] = d
        for v, w in adj[u]:
            nd = d + w
            if dist[v] is None and nd < best.get(v, float("inf")):
                best[v] = nd
                heapq.heappush(pq, (nd, v))
    return fmt([-1 if x is None else x for x in dist])


def weighted_graph(n, m, wmax):
    edges = []
    for _ in range(m):
        u, v = rng.randrange(n), rng.randrange(n)
        if u != v:
            edges.append([u, v, rng.randint(0, wmax)])
    return edges


P.append(dict(
    title="Dijkstra Algorithm",
    category="Graphs", difficulty="Hard", tags="graph,shortest-path,heap",
    description="You are given an undirected weighted graph with `n` vertices (`0` to `n - 1`) and a list of `edges`, "
                "where `edges[i] = [u, v, w]` connects `u` and `v` with a non-negative weight `w`.\n\n"
                "Return an array `dist` where `dist[i]` is the length of the shortest path from `src` to `i`, "
                "or `-1` if `i` cannot be reached.",
    params=["n", "edges", "src"],
    constraints=["1 <= n <= 10^4", "0 <= edges.length <= 2 * 10^4", "0 <= w <= 1000", "0 <= src < n"],
    template="""class Solution {
    public int[] dijkstra(int n, int[][] edges, int src) {

    }
}
""",
    solution="""import java.util.*;

class Solution {
    public int[] dijkstra(int n, int[][] edges, int src) {
        List<List<int[]>> graph = new ArrayList<>();
        for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
        for (int[] e : edges) {
            graph.get(e[0]).add(new int[] { e[1], e[2] });
            graph.get(e[1]).add(new int[] { e[0], e[2] });
        }

        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[src] = 0;
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0])); // {distance, vertex}
        pq.add(new int[] { 0, src });
        while (!pq.isEmpty()) {
            int[] top = pq.poll();
            int d = top[0], u = top[1];
            if (d > dist[u]) continue; // stale entry
            for (int[] edge : graph.get(u)) {
                int v = edge[0], nd = d + edge[1];
                if (nd < dist[v]) {
                    dist[v] = nd;
                    pq.add(new int[] { nd, v });
                }
            }
        }
        for (int i = 0; i < n; i++) if (dist[i] == Integer.MAX_VALUE) dist[i] = -1;
        return dist;
    }
}
""",
    driver=driver([("int", "n"), ("int[][]", "edges"), ("int", "src")],
                  "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().dijkstra(n, edges, src)));"),
    explanation="Keep a min-heap of (distance, vertex). Pop the closest unfinished vertex; its distance is now final "
                "because all weights are non-negative. Relax each neighbour: if going through this vertex is shorter, "
                "update its distance and push it. Skip stale heap entries whose distance is out of date.",
    time="O((V + E) log V)", space="O(V + E)",
    samples=[dict(input=inp(3, [[0, 1, 1], [1, 2, 3], [0, 2, 6]], 2),
                  explanation="From 2: vertex 1 costs 3, and vertex 0 costs 3 + 1 = 4 (shorter than the direct edge of 6)."),
             dict(input=inp(3, [[0, 1, 9]], 0), explanation="Vertex 2 has no edges, so it cannot be reached.")],
    hidden=[inp(1, [], 0), inp(2, [[0, 1, 0]], 1), inp(4, [[0, 1, 5], [0, 1, 2], [1, 2, 1], [2, 3, 7]], 0),
            inp(6, weighted_graph(6, 7, 10), 3), inp(100, weighted_graph(100, 300, 100), 0),
            inp(1000, weighted_graph(1000, 3000, 1000), 17)],
    py=py_dijkstra,
))


# 32 -----------------------------------------------------------------------
def py_sieve(lines):
    n = parse(lines[0])
    if n < 2:
        return fmt([])
    is_p = [True] * (n + 1)
    is_p[0] = is_p[1] = False
    for i in range(2, int(n ** 0.5) + 1):
        if is_p[i]:
            for j in range(i * i, n + 1, i):
                is_p[j] = False
    return fmt([i for i in range(n + 1) if is_p[i]])


P.append(dict(
    title="Sieve of Eratosthenes",
    category="Math", difficulty="Easy", tags="math,array,prime",
    description="Given an integer `n`, return all prime numbers less than or equal to `n`, in ascending order, "
                "using the Sieve of Eratosthenes.",
    params=["n"],
    constraints=["0 <= n <= 10^4"],
    template="""class Solution {
    public List<Integer> sieve(int n) {

    }
}
""",
    solution="""import java.util.*;

class Solution {
    public List<Integer> sieve(int n) {
        boolean[] composite = new boolean[n + 1];
        List<Integer> primes = new ArrayList<>();
        for (int i = 2; i <= n; i++) {
            if (composite[i]) continue;
            primes.add(i);
            // start at i * i: smaller multiples were already crossed out by smaller primes
            for (long j = (long) i * i; j <= n; j += i) composite[(int) j] = true;
        }
        return primes;
    }
}
""",
    driver=driver([("int", "n")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().sieve(n)));"),
    explanation="Assume every number from 2 is prime. For each number that is still marked prime, cross out its "
                "multiples starting from its square. The numbers left unmarked are the primes.",
    time="O(n log log n)", space="O(n)",
    samples=[dict(input=inp(10), explanation=""),
             dict(input=inp(1), explanation="There are no primes below 2.")],
    hidden=[inp(x) for x in [0, 2, 3, 30, 100, 997, 10000]],
    py=py_sieve,
))


# 33 -----------------------------------------------------------------------
def py_pow2(lines):
    n = parse(lines[0])
    return fmt(n > 0 and (n & (n - 1)) == 0)


P.append(dict(
    title="Power of Two",
    category="Bit Manipulation", difficulty="Easy", tags="bit-manipulation,math",
    description="Given an integer `n`, return `true` if it is a power of two, otherwise `false`.\n\n"
                "An integer `n` is a power of two if there is an integer `x` such that `n == 2^x`.",
    params=["n"],
    constraints=["-2^31 <= n <= 2^31 - 1"],
    template="""class Solution {
    public boolean isPowerOfTwo(int n) {

    }
}
""",
    solution="""class Solution {
    public boolean isPowerOfTwo(int n) {
        // a power of two has exactly one set bit, and n & (n - 1) clears it
        return n > 0 && (n & (n - 1)) == 0;
    }
}
""",
    driver=driver([("int", "n")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().isPowerOfTwo(n)));"),
    explanation="Positive powers of two have exactly one `1` bit. `n & (n - 1)` clears the lowest `1` bit, "
                "so the result is 0 only when `n` had a single set bit. Zero and negative numbers are never powers of two.",
    time="O(1)", space="O(1)",
    samples=[dict(input=inp(16), explanation="16 = 2^4"),
             dict(input=inp(3), explanation="")],
    hidden=[inp(x) for x in [1, 0, -16, 1073741824, -2147483648, 2147483647, 6, 1024, 536870913]],
    py=py_pow2,
))


# 34 -----------------------------------------------------------------------
def py_valid_pal2(lines):
    s = parse(lines[0])

    def is_pal(i, j):
        while i < j:
            if s[i] != s[j]:
                return False
            i += 1
            j -= 1
        return True

    i, j = 0, len(s) - 1
    while i < j:
        if s[i] != s[j]:
            return fmt(is_pal(i + 1, j) or is_pal(i, j - 1))
        i += 1
        j -= 1
    return fmt(True)


half = rand_str(3000, "ab")
pal_even = half + half[::-1]
P.append(dict(
    title="Valid Palindrome II",
    category="Strings", difficulty="Easy", tags="string,two-pointer,greedy",
    description="Given a string `s`, return `true` if `s` can be a palindrome after deleting **at most one** character.",
    params=["s"],
    constraints=["1 <= s.length <= 10^5", "s consists of lowercase English letters"],
    template="""class Solution {
    public boolean validPalindrome(String s) {

    }
}
""",
    solution="""class Solution {
    public boolean validPalindrome(String s) {
        int i = 0, j = s.length() - 1;
        while (i < j) {
            if (s.charAt(i) != s.charAt(j)) {
                // skip either the left or the right character, then the rest must be a palindrome
                return isPalindrome(s, i + 1, j) || isPalindrome(s, i, j - 1);
            }
            i++;
            j--;
        }
        return true;
    }

    private boolean isPalindrome(String s, int i, int j) {
        while (i < j) {
            if (s.charAt(i++) != s.charAt(j--)) return false;
        }
        return true;
    }
}
""",
    driver=driver([("String", "s")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().validPalindrome(s)));"),
    explanation="Move two pointers inwards. At the first mismatch you must delete one of the two characters, so check "
                "whether the rest is a palindrome after skipping the left one or after skipping the right one.",
    time="O(n)", space="O(1)",
    samples=[dict(input=inp("abca"), explanation="Delete 'c' (or 'b') to get a palindrome."),
             dict(input=inp("abc"), explanation="")],
    hidden=[inp(x) for x in ["a", "aba", "deeee", "eeccccbebaeeabebccceea", "cbbcc", "ebcbbececabbacecbbcbe",
                             pal_even, pal_even[:1500] + "c" + pal_even[1500:], "c" + pal_even + "dd"]],
    py=py_valid_pal2,
))
