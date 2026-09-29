"""Problems 35-49."""
import itertools
import random
from collections import OrderedDict, deque
from common import TREE_NODE_DOC, design_driver, driver, fmt, inp, num, parse, random_tree, skewed_tree, tree_from_list, tree_to_list
from bank2 import py_design

rng = random.Random(3003)
P = []


def rand_str(n, alphabet="abcdefghijklmnopqrstuvwxyz"):
    return "".join(rng.choice(alphabet) for _ in range(n))


# 35 -----------------------------------------------------------------------
def py_atoi(lines):
    s = parse(lines[0])
    i, n = 0, len(s)
    while i < n and s[i] == " ":
        i += 1
    sign = 1
    if i < n and s[i] in "+-":
        sign = -1 if s[i] == "-" else 1
        i += 1
    r = 0
    while i < n and "0" <= s[i] <= "9":
        r = r * 10 + (ord(s[i]) - 48)
        i += 1
    r *= sign
    return fmt(max(-2**31, min(2**31 - 1, r)))


P.append(dict(
    title="String to Integer (atoi)",
    category="Strings", difficulty="Medium", tags="string,parsing",
    description="Implement `myAtoi(String s)`, which converts a string to a 32-bit signed integer:\n\n"
                "1. Ignore leading spaces `' '`.\n"
                "2. Read an optional sign, `'-'` or `'+'` (positive if absent).\n"
                "3. Read digits until a non-digit character or the end of the string. If no digits were read, the result is 0.\n"
                "4. Clamp the result to the range `[-2^31, 2^31 - 1]`.\n\n"
                "Return the resulting integer.",
    params=["s"],
    constraints=["0 <= s.length <= 200", "s consists of English letters, digits, ' ', '+', '-' and '.'"],
    template="""class Solution {
    public int myAtoi(String s) {

    }
}
""",
    solution="""class Solution {
    public int myAtoi(String s) {
        int i = 0, n = s.length();
        while (i < n && s.charAt(i) == ' ') i++;
        int sign = 1;
        if (i < n && (s.charAt(i) == '+' || s.charAt(i) == '-')) {
            sign = s.charAt(i) == '-' ? -1 : 1;
            i++;
        }
        long result = 0;
        while (i < n && Character.isDigit(s.charAt(i))) {
            result = result * 10 + (s.charAt(i) - '0');
            if (sign * result > Integer.MAX_VALUE) return Integer.MAX_VALUE; // clamp early to avoid overflow
            if (sign * result < Integer.MIN_VALUE) return Integer.MIN_VALUE;
            i++;
        }
        return (int) (sign * result);
    }
}
""",
    driver=driver([("String", "s")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().myAtoi(s)));"),
    explanation="Follow the steps literally with an index: skip spaces, read the sign, then accumulate digits in a "
                "`long`. Clamp as soon as the value leaves the 32-bit range, so even very long digit strings cannot overflow.",
    time="O(n)", space="O(1)",
    samples=[dict(input=inp("42"), explanation=""),
             dict(input=inp("   -042"), explanation="Leading spaces are skipped, the sign is '-', and the digits \"042\" give 42.")],
    hidden=[inp(x) for x in ["1337c0d3", "0-1", "words and 987", "-91283472332", "91283472332", "", "+-12",
                             "  +0 123", "2147483648", "-2147483648", "2147483647", ".1", "   ", "-", "00000000000012345678",
                             "9" * 150]],
    py=py_atoi,
))


# 36 -----------------------------------------------------------------------
def py_longest_pal(lines):
    s = parse(lines[0])
    best_start, best_len = 0, 0
    for center in range(2 * len(s) - 1):
        lo, hi = center // 2, center // 2 + center % 2
        while lo >= 0 and hi < len(s) and s[lo] == s[hi]:
            lo -= 1
            hi += 1
        start, length = lo + 1, hi - lo - 1
        if length > best_len or (length == best_len and start < best_start):
            best_start, best_len = start, length
    return fmt(s[best_start:best_start + best_len])


P.append(dict(
    title="Longest Palindromic Substring",
    category="Strings", difficulty="Medium", tags="string,dp,two-pointer",
    description="Given a string `s`, return the longest palindromic substring in `s`.\n\n"
                "If several palindromes have the maximum length, return the one that starts **first** (leftmost).",
    params=["s"],
    constraints=["1 <= s.length <= 1000", "s consists of lowercase English letters"],
    template="""class Solution {
    public String longestPalindrome(String s) {

    }
}
""",
    solution="""class Solution {
    public String longestPalindrome(String s) {
        int bestStart = 0, bestLen = 0;
        for (int center = 0; center < 2 * s.length() - 1; center++) {
            int lo = center / 2, hi = lo + center % 2; // odd and even centres
            while (lo >= 0 && hi < s.length() && s.charAt(lo) == s.charAt(hi)) {
                lo--;
                hi++;
            }
            int start = lo + 1, len = hi - lo - 1;
            if (len > bestLen || (len == bestLen && start < bestStart)) {
                bestStart = start;
                bestLen = len;
            }
        }
        return s.substring(bestStart, bestStart + bestLen);
    }
}
""",
    driver=driver([("String", "s")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().longestPalindrome(s)));"),
    explanation="Every palindrome mirrors around a centre, which is either a character (odd length) or the gap between "
                "two characters (even length). There are `2n - 1` centres; expand outwards from each while the ends match, "
                "and keep the longest (earliest on ties).",
    time="O(n^2)", space="O(1)",
    samples=[dict(input=inp("babad"), explanation="\"bab\" and \"aba\" are both length 3; \"bab\" starts first."),
             dict(input=inp("cbbd"), explanation="")],
    hidden=[inp(x) for x in ["a", "ac", "racecar", "forgeeksskeegfor", "abacdfgdcaba", "aaaa", "abcd",
                             rand_str(1000, "abc"), rand_str(600, "ab")]],
    py=py_longest_pal,
))


# 37 -----------------------------------------------------------------------
def py_median(lines):
    a = sorted(parse(lines[0]) + parse(lines[1]))
    n = len(a)
    m = a[n // 2] if n % 2 else (a[n // 2 - 1] + a[n // 2]) / 2
    return fmt(float(m))


P.append(dict(
    title="Median of Two Sorted Arrays",
    category="Arrays", difficulty="Hard", tags="array,binary-search,divide-and-conquer",
    description="Given two sorted arrays `nums1` and `nums2` of sizes `m` and `n`, return the median of the two arrays combined.\n\n"
                "The overall run time should be `O(log (m + n))`. The judge prints your answer with 5 decimal places.",
    params=["nums1", "nums2"],
    constraints=["0 <= m, n <= 1000", "1 <= m + n <= 2000", "-10^6 <= nums1[i], nums2[i] <= 10^6"],
    template="""class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {

    }
}
""",
    solution="""class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        if (nums1.length > nums2.length) return findMedianSortedArrays(nums2, nums1); // binary search the shorter one
        int m = nums1.length, n = nums2.length, half = (m + n + 1) / 2;
        int lo = 0, hi = m;
        while (lo <= hi) {
            int i = (lo + hi) >>> 1;   // elements taken from nums1 for the left half
            int j = half - i;          // elements taken from nums2
            int left1 = i == 0 ? Integer.MIN_VALUE : nums1[i - 1];
            int right1 = i == m ? Integer.MAX_VALUE : nums1[i];
            int left2 = j == 0 ? Integer.MIN_VALUE : nums2[j - 1];
            int right2 = j == n ? Integer.MAX_VALUE : nums2[j];
            if (left1 <= right2 && left2 <= right1) {
                int leftMax = Math.max(left1, left2);
                if ((m + n) % 2 == 1) return leftMax;
                return (leftMax + (double) Math.min(right1, right2)) / 2.0;
            } else if (left1 > right2) {
                hi = i - 1;
            } else {
                lo = i + 1;
            }
        }
        throw new IllegalArgumentException("Input arrays are not sorted");
    }
}
""",
    driver=driver([("int[]", "nums1"), ("int[]", "nums2")],
                  "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().findMedianSortedArrays(nums1, nums2)));"),
    explanation="Binary search how many elements the left half takes from the shorter array (`i`); the rest (`j`) come "
                "from the other array. The split is correct when every left element is at most every right element, "
                "i.e. `nums1[i-1] <= nums2[j]` and `nums2[j-1] <= nums1[i]`. The median is then the largest left value "
                "(odd total) or the average of the largest left and smallest right values (even total).",
    time="O(log min(m, n))", space="O(1)",
    samples=[dict(input=inp([1, 3], [2]), explanation="The merged array is [1,2,3] and its median is 2."),
             dict(input=inp([1, 2], [3, 4]), explanation="The merged array is [1,2,3,4]; the median is (2 + 3) / 2 = 2.5.")],
    hidden=[inp([], [1]), inp([2], []), inp([0, 0], [0, 0]), inp([-5, 3, 6, 12, 15], [-12, -10, -6, -3, 4, 10]),
            inp([1, 2], [-1, 3]), inp([1000000], [-1000000]),
            inp(sorted(rng.randint(-10**6, 10**6) for _ in range(1000)), sorted(rng.randint(-10**6, 10**6) for _ in range(999))),
            inp(sorted(rng.randint(-100, 100) for _ in range(3)), sorted(rng.randint(-100, 100) for _ in range(1000)))],
    py=py_median,
))


# 38 -----------------------------------------------------------------------
def py_trap(lines):
    h = parse(lines[0])
    n = len(h)
    if n == 0:
        return fmt(0)
    left, right = [0] * n, [0] * n
    left[0] = h[0]
    for i in range(1, n):
        left[i] = max(left[i - 1], h[i])
    right[-1] = h[-1]
    for i in range(n - 2, -1, -1):
        right[i] = max(right[i + 1], h[i])
    return fmt(sum(min(left[i], right[i]) - h[i] for i in range(n)))


P.append(dict(
    title="Trapping Rain Water",
    category="Arrays", difficulty="Hard", tags="array,two-pointer,stack",
    description="Given `n` non-negative integers representing an elevation map where each bar has width 1, compute how "
                "much water it can trap after raining.",
    params=["height"],
    constraints=["1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"],
    template="""class Solution {
    public int trap(int[] height) {

    }
}
""",
    solution="""class Solution {
    public int trap(int[] height) {
        int left = 0, right = height.length - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                // the right side has a wall at least as tall, so leftMax limits the water here
                leftMax = Math.max(leftMax, height[left]);
                water += leftMax - height[left++];
            } else {
                rightMax = Math.max(rightMax, height[right]);
                water += rightMax - height[right--];
            }
        }
        return water;
    }
}
""",
    driver=driver([("int[]", "height")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().trap(height)));"),
    explanation="Water above a bar is `min(tallest bar to its left, tallest bar to its right) - height`. With two "
                "pointers, always move the side with the lower bar: that side's running maximum is guaranteed to be the "
                "limiting wall, so its water can be added immediately.",
    time="O(n)", space="O(1)",
    samples=[dict(input=inp([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]), explanation="6 units of water are trapped between the bars."),
             dict(input=inp([4, 2, 0, 3, 2, 5]), explanation="")],
    hidden=[inp([1]), inp([2, 0, 2]), inp([5, 4, 3, 2, 1]), inp([1, 2, 3, 4, 5]), inp([0, 0, 0]), inp([5, 0, 0, 0, 5]),
            inp([rng.randint(0, 10**5) for _ in range(5000)]), inp([rng.randint(0, 10) for _ in range(500)])],
    py=py_trap,
))


# 39 -----------------------------------------------------------------------
def py_nqueens(lines):
    n = parse(lines[0])
    boards = []
    for perm in itertools.permutations(range(n)):
        if len({r + c for r, c in enumerate(perm)}) == n and len({r - c for r, c in enumerate(perm)}) == n:
            boards.append(["." * c + "Q" + "." * (n - c - 1) for c in perm])
    boards.sort(key=lambda b: ",".join(b))
    return fmt(boards)


P.append(dict(
    title="N-Queens",
    category="Backtracking", difficulty="Hard", tags="recursion,backtracking",
    description="Place `n` queens on an `n x n` chessboard so that no two queens attack each other "
                "(no two share a row, column or diagonal).\n\n"
                "Return all distinct solutions. Each solution is a list of `n` strings where `'Q'` is a queen and `'.'` "
                "is an empty square. You may return the solutions in any order.",
    params=["n"],
    constraints=["1 <= n <= 8"],
    template="""class Solution {
    public List<List<String>> solveNQueens(int n) {

    }
}
""",
    solution="""import java.util.*;

class Solution {
    public List<List<String>> solveNQueens(int n) {
        List<List<String>> result = new ArrayList<>();
        place(0, n, new int[n], new boolean[n], new boolean[2 * n], new boolean[2 * n], result);
        return result;
    }

    // queens[r] = column of the queen in row r
    private void place(int row, int n, int[] queens, boolean[] cols, boolean[] diag, boolean[] anti, List<List<String>> result) {
        if (row == n) {
            List<String> board = new ArrayList<>();
            for (int r = 0; r < n; r++) {
                char[] line = new char[n];
                Arrays.fill(line, '.');
                line[queens[r]] = 'Q';
                board.add(new String(line));
            }
            result.add(board);
            return;
        }
        for (int c = 0; c < n; c++) {
            if (cols[c] || diag[row + c] || anti[row - c + n]) continue;
            queens[row] = c;
            cols[c] = diag[row + c] = anti[row - c + n] = true;
            place(row + 1, n, queens, cols, diag, anti, result);
            cols[c] = diag[row + c] = anti[row - c + n] = false; // backtrack
        }
    }
}
""",
    driver=driver([("int", "n")],
                  "List<List<String>> result = new Solution().solveNQueens(n);\n"
                  "if (result != null) {\n"
                  "    result = new ArrayList<>(result);\n"
                  "    result.sort(Comparator.comparing(b -> String.join(\",\", b))); // any order is accepted\n"
                  "}\n"
                  "CodeTrackIO.result(CodeTrackIO.fmt(result));"),
    explanation="Place one queen per row with backtracking. For each column in the current row, skip it if the column, "
                "the diagonal (`row + col`) or the anti-diagonal (`row - col`) is already used; otherwise place the "
                "queen, recurse into the next row, and undo the placement afterwards.",
    time="O(n!)", space="O(n)",
    samples=[dict(input=inp(4), explanation="There are two ways to place 4 queens."),
             dict(input=inp(1), explanation="")],
    hidden=[inp(x) for x in [2, 3, 5, 6, 7, 8]],
    py=py_nqueens,
))


# 40 -----------------------------------------------------------------------
def py_word_break(lines):
    s, words = parse(lines[0]), set(parse(lines[1]))
    dp = [True] + [False] * len(s)
    for i in range(1, len(s) + 1):
        for j in range(i):
            if dp[j] and s[j:i] in words:
                dp[i] = True
                break
    return fmt(dp[len(s)])


def word_break_case(ok):
    words = list({rand_str(rng.randint(2, 5), "abc") for _ in range(12)})
    s = "".join(rng.choice(words) for _ in range(40))
    if not ok:
        s += "d"
    return inp(s, words)


P.append(dict(
    title="Word Break",
    category="Dynamic Programming", difficulty="Medium", tags="dp,string",
    description="Given a string `s` and a dictionary of strings `wordDict`, return `true` if `s` can be split into a "
                "space-separated sequence of one or more dictionary words.\n\nThe same word may be reused any number of times.",
    params=["s", "wordDict"],
    constraints=["1 <= s.length <= 300", "1 <= wordDict.length <= 1000", "1 <= wordDict[i].length <= 20",
                 "All strings consist of lowercase English letters", "All words in wordDict are unique"],
    template="""class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {

    }
}
""",
    solution="""import java.util.*;

class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        Set<String> words = new HashSet<>(wordDict);
        boolean[] dp = new boolean[s.length() + 1]; // dp[i] = first i characters can be segmented
        dp[0] = true;
        for (int i = 1; i <= s.length(); i++) {
            for (int j = 0; j < i; j++) {
                if (dp[j] && words.contains(s.substring(j, i))) {
                    dp[i] = true;
                    break;
                }
            }
        }
        return dp[s.length()];
    }
}
""",
    driver=driver([("String", "s"), ("List<String>", "wordDict")],
                  "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().wordBreak(s, wordDict)));"),
    explanation="`dp[i]` says whether the first `i` characters can be split into words. `dp[i]` is true if some earlier "
                "split point `j` is valid (`dp[j]`) and `s[j..i)` is a dictionary word. Memoising prefixes avoids the "
                "exponential blow-up of plain backtracking on inputs like \"aaaa...ab\".",
    time="O(n^2) substring checks", space="O(n)",
    samples=[dict(input=inp("leetcode", ["leet", "code"]), explanation="\"leetcode\" = \"leet\" + \"code\"."),
             dict(input=inp("catsandog", ["cats", "dog", "sand", "and", "cat"]), explanation="No split uses only dictionary words.")],
    hidden=[inp("applepenapple", ["apple", "pen"]), inp("a", ["b"]), inp("aaaaaaa", ["aaaa", "aaa"]),
            inp("a" * 150 + "b", ["a" * k for k in range(1, 11)]), inp("a" * 150, ["a" * k for k in range(2, 11, 2)]),
            word_break_case(True), word_break_case(False), inp("cars", ["car", "ca", "rs"])],
    py=py_word_break,
))


# 41 -----------------------------------------------------------------------
class PyMinStack:
    def __init__(self):
        self.s = []

    def push(self, v):
        self.s.append(v)

    def pop(self):
        self.s.pop()

    def top(self):
        return self.s[-1]

    def getMin(self):
        return min(self.s)


def min_stack_ops(n):
    ops, args, size = ["MinStack"], [[]], 0
    for _ in range(n):
        r = rng.random()
        if size == 0 or r < 0.4:
            ops.append("push")
            args.append([rng.randint(-10**5, 10**5)])
            size += 1
        elif r < 0.6:
            ops.append("pop")
            args.append([])
            size -= 1
        elif r < 0.8:
            ops.append("top")
            args.append([])
        else:
            ops.append("getMin")
            args.append([])
    return inp(ops, args)


P.append(dict(
    title="Min Stack",
    category="Data Structures", difficulty="Medium", tags="stack,design",
    description="Design a stack that supports push, pop, top, and retrieving the minimum element, all in constant time.\n\n"
                "- `MinStack()` initialises the stack.\n"
                "- `void push(int val)` pushes `val` onto the stack.\n"
                "- `void pop()` removes the top element.\n"
                "- `int top()` returns the top element.\n"
                "- `int getMin()` returns the minimum element in the stack.\n\n"
                "The output lists each call's return value (`null` for `void` methods and the constructor).",
    params=["operations", "arguments"],
    constraints=["-2^31 <= val <= 2^31 - 1", "pop, top and getMin are only called on a non-empty stack",
                 "At most 3 * 10^4 calls are made"],
    template="""class MinStack {

    public MinStack() {

    }

    public void push(int val) {

    }

    public void pop() {

    }

    public int top() {

    }

    public int getMin() {

    }
}
""",
    solution="""import java.util.*;

class MinStack {
    // each entry stores {value, minimum of the stack up to and including this entry}
    private final Deque<int[]> stack = new ArrayDeque<>();

    public MinStack() {}

    public void push(int val) {
        int min = stack.isEmpty() ? val : Math.min(val, stack.peek()[1]);
        stack.push(new int[] { val, min });
    }

    public void pop() {
        stack.pop();
    }

    public int top() {
        return stack.peek()[0];
    }

    public int getMin() {
        return stack.peek()[1];
    }
}
""",
    driver=design_driver("MinStack", "", {
        "push": f"obj.push({num('a.get(0)')})",
        "pop": "obj.pop()",
        "top": "obj.top()",
        "getMin": "obj.getMin()",
    }, {"top", "getMin"}),
    explanation="Store, next to every value, the minimum of the stack at the moment it was pushed. The current minimum "
                "is then always stored in the top entry, and popping automatically restores the previous minimum.",
    time="O(1) per operation", space="O(n)",
    samples=[dict(input=inp(["MinStack", "push", "push", "push", "getMin", "pop", "top", "getMin"],
                             [[], [-2], [0], [-3], [], [], [], []]),
                  explanation="getMin returns -3; after pop the top is 0 and the minimum is -2."),
             dict(input=inp(["MinStack", "push", "push", "getMin", "push", "getMin", "pop", "getMin"],
                             [[], [5], [7], [], [1], [], [], []]), explanation="")],
    hidden=[min_stack_ops(10), min_stack_ops(100), min_stack_ops(1000), min_stack_ops(2000),
            inp(["MinStack", "push", "push", "getMin", "pop", "getMin"], [[], [-2147483648], [2147483647], [], [], []])],
    py=lambda lines: py_design(lines, PyMinStack),
))


# 42 -----------------------------------------------------------------------
class PyLRU:
    def __init__(self, capacity):
        self.cap, self.d = capacity, OrderedDict()

    def get(self, key):
        if key not in self.d:
            return -1
        self.d.move_to_end(key)
        return self.d[key]

    def put(self, key, value):
        if key in self.d:
            self.d.move_to_end(key)
        self.d[key] = value
        if len(self.d) > self.cap:
            self.d.popitem(last=False)


def lru_ops(cap, n, keys):
    ops, args = ["LRUCache"], [[cap]]
    for _ in range(n):
        if rng.random() < 0.5:
            ops.append("get")
            args.append([rng.randint(0, keys)])
        else:
            ops.append("put")
            args.append([rng.randint(0, keys), rng.randint(0, 10**5)])
    return inp(ops, args)


P.append(dict(
    title="LRU Cache",
    category="Data Structures", difficulty="Medium", tags="design,hashmap,linked-list",
    description="Design a Least Recently Used (LRU) cache.\n\n"
                "- `LRUCache(int capacity)` creates a cache holding at most `capacity` keys.\n"
                "- `int get(int key)` returns the key's value, or `-1` if it is not present.\n"
                "- `void put(int key, int value)` inserts or updates the key. If this makes the cache exceed its "
                "capacity, evict the least recently used key.\n\n"
                "Both `get` and `put` count as a use of the key, and both must run in `O(1)` average time.",
    params=["operations", "arguments"],
    constraints=["1 <= capacity <= 3000", "0 <= key <= 10^4", "0 <= value <= 10^5", "At most 2 * 10^5 calls are made"],
    template="""class LRUCache {

    public LRUCache(int capacity) {

    }

    public int get(int key) {

    }

    public void put(int key, int value) {

    }
}
""",
    solution="""import java.util.*;

class LRUCache {
    private final int capacity;
    // accessOrder = true keeps entries ordered from least to most recently used
    private final LinkedHashMap<Integer, Integer> map;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.map = new LinkedHashMap<>(16, 0.75f, true);
    }

    public int get(int key) {
        return map.getOrDefault(key, -1);
    }

    public void put(int key, int value) {
        map.put(key, value);
        if (map.size() > capacity) {
            int eldest = map.keySet().iterator().next();
            map.remove(eldest);
        }
    }
}
""",
    driver=design_driver("LRUCache", num("a.get(0)"), {
        "get": f"obj.get({num('a.get(0)')})",
        "put": f"obj.put({num('a.get(0)')}, {num('a.get(1)')})",
    }, {"get"}),
    explanation="Combine a hash map (O(1) lookup) with a doubly linked list ordered by recency. On every get or put, move "
                "the key to the most-recent end; when over capacity, remove the node at the least-recent end. "
                "Java's `LinkedHashMap` with access order does exactly this.",
    time="O(1) per operation", space="O(capacity)",
    samples=[dict(input=inp(["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"],
                             [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]),
                  explanation="put 3 evicts key 2 (least recently used), and put 4 evicts key 1."),
             dict(input=inp(["LRUCache", "put", "get", "put", "get", "get"], [[1], [2, 1], [2], [3, 2], [2], [3]]),
                  explanation="With capacity 1, putting key 3 evicts key 2.")],
    hidden=[lru_ops(1, 30, 3), lru_ops(2, 100, 5), lru_ops(10, 800, 30), lru_ops(50, 1500, 200), lru_ops(1000, 1500, 10**4)],
    py=lambda lines: py_design(lines, PyLRU),
))


# 43 -----------------------------------------------------------------------
class PyTrie:
    def __init__(self):
        self.words = set()

    def insert(self, w):
        self.words.add(w)

    def search(self, w):
        return w in self.words

    def startsWith(self, p):
        return any(w.startswith(p) for w in self.words)


def trie_ops(n):
    pool = [rand_str(rng.randint(1, 6), "abcd") for _ in range(max(5, n // 4))]
    ops, args = ["Trie"], [[]]
    for _ in range(n):
        r = rng.random()
        w = rng.choice(pool)
        if r < 0.4:
            ops.append("insert")
            args.append([w])
        elif r < 0.7:
            ops.append("search")
            args.append([w])
        else:
            ops.append("startsWith")
            args.append([w[: rng.randint(1, len(w))]])
    return inp(ops, args)


P.append(dict(
    title="Implement Trie",
    category="Trees", difficulty="Medium", tags="tree,trie,design",
    description="A trie (prefix tree) stores strings so that prefixes can be looked up quickly. Implement the `Trie` class:\n\n"
                "- `Trie()` initialises the trie.\n"
                "- `void insert(String word)` inserts `word`.\n"
                "- `boolean search(String word)` returns `true` if `word` was inserted before.\n"
                "- `boolean startsWith(String prefix)` returns `true` if any inserted word starts with `prefix`.",
    params=["operations", "arguments"],
    constraints=["1 <= word.length, prefix.length <= 2000", "Words and prefixes consist of lowercase English letters",
                 "At most 3 * 10^4 calls are made"],
    template="""class Trie {

    public Trie() {

    }

    public void insert(String word) {

    }

    public boolean search(String word) {

    }

    public boolean startsWith(String prefix) {

    }
}
""",
    solution="""class Trie {
    private static final class Node {
        Node[] next = new Node[26];
        boolean isWord;
    }

    private final Node root = new Node();

    public Trie() {}

    public void insert(String word) {
        Node node = root;
        for (char c : word.toCharArray()) {
            int i = c - 'a';
            if (node.next[i] == null) node.next[i] = new Node();
            node = node.next[i];
        }
        node.isWord = true;
    }

    public boolean search(String word) {
        Node node = find(word);
        return node != null && node.isWord;
    }

    public boolean startsWith(String prefix) {
        return find(prefix) != null;
    }

    private Node find(String s) {
        Node node = root;
        for (char c : s.toCharArray()) {
            node = node.next[c - 'a'];
            if (node == null) return null;
        }
        return node;
    }
}
""",
    driver=design_driver("Trie", "", {
        "insert": "obj.insert((String) a.get(0))",
        "search": "obj.search((String) a.get(0))",
        "startsWith": "obj.startsWith((String) a.get(0))",
    }, {"search", "startsWith"}),
    explanation="Each node has up to 26 children, one per letter, plus a flag marking the end of a word. Insert walks "
                "down, creating missing children. Search and startsWith walk the same path; search additionally "
                "requires the final node to be marked as a word end.",
    time="O(length) per operation", space="O(total characters inserted)",
    samples=[dict(input=inp(["Trie", "insert", "search", "search", "startsWith", "insert", "search"],
                             [[], ["apple"], ["apple"], ["app"], ["app"], ["app"], ["app"]]),
                  explanation="\"app\" is only a prefix until it is inserted as a word."),
             dict(input=inp(["Trie", "insert", "startsWith", "search"], [[], ["code"], ["cot"], ["code"]]), explanation="")],
    hidden=[trie_ops(10), trie_ops(60), trie_ops(400), trie_ops(1200),
            inp(["Trie", "insert", "search", "startsWith"], [[], ["a" * 2000], ["a" * 1999], ["a" * 2000]])],
    py=lambda lines: py_design(lines, PyTrie),
))


# 44 -----------------------------------------------------------------------
def py_kth(lines):
    nums, k = parse(lines[0]), parse(lines[1])
    return fmt(sorted(nums, reverse=True)[k - 1])


kth_nums = [rng.randint(-10**4, 10**4) for _ in range(3000)]
P.append(dict(
    title="Kth Largest Element",
    category="Heaps", difficulty="Medium", tags="heap,array,quick-select",
    description="Given an integer array `nums` and an integer `k`, return the `k`th largest element in the array.\n\n"
                "Note that it is the `k`th largest in sorted order, not the `k`th distinct element.",
    params=["nums", "k"],
    constraints=["1 <= k <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    template="""class Solution {
    public int findKthLargest(int[] nums, int k) {

    }
}
""",
    solution="""import java.util.*;

class Solution {
    public int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> heap = new PriorityQueue<>(); // min-heap of the k largest seen so far
        for (int x : nums) {
            heap.offer(x);
            if (heap.size() > k) heap.poll();
        }
        return heap.peek();
    }
}
""",
    driver=driver([("int[]", "nums"), ("int", "k")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().findKthLargest(nums, k)));"),
    explanation="Keep a min-heap of the `k` largest values seen so far. After adding each value, drop the smallest if the "
                "heap grows beyond `k`. At the end the heap's minimum is the `k`th largest overall.",
    time="O(n log k)", space="O(k)",
    samples=[dict(input=inp([3, 2, 1, 5, 6, 4], 2), explanation=""),
             dict(input=inp([3, 2, 3, 1, 2, 4, 5, 5, 6], 4), explanation="Sorted descending: 6, 5, 5, 4, ... so the 4th largest is 4.")],
    hidden=[inp([1], 1), inp([2, 1], 2), inp([7, 7, 7, 7], 3), inp([-1, -2, -3], 1),
            inp(kth_nums, 1), inp(kth_nums, 3000), inp(kth_nums[:1500], 700), inp(kth_nums[:777], 123)],
    py=py_kth,
))


# 45 -----------------------------------------------------------------------
def py_sort_colors(lines):
    return fmt(sorted(parse(lines[0])))


P.append(dict(
    title="Sort Colors",
    category="Sorting", difficulty="Medium", tags="sort,two-pointer",
    description="Given an array `nums` of red, white and blue objects encoded as `0`, `1` and `2`, sort it **in place** "
                "so that equal colours are adjacent, in the order 0, 1, 2.\n\n"
                "Solve it without a library sort, ideally in one pass. The judge prints `nums` after your method returns.",
    params=["nums"],
    constraints=["1 <= nums.length <= 300", "nums[i] is 0, 1 or 2"],
    template="""class Solution {
    public void sortColors(int[] nums) {

    }
}
""",
    solution="""class Solution {
    public void sortColors(int[] nums) {
        // Dutch national flag: [0, low) are 0s, [low, mid) are 1s, (high, end] are 2s
        int low = 0, mid = 0, high = nums.length - 1;
        while (mid <= high) {
            if (nums[mid] == 0) swap(nums, low++, mid++);
            else if (nums[mid] == 1) mid++;
            else swap(nums, mid, high--);
        }
    }

    private void swap(int[] a, int i, int j) {
        int t = a[i]; a[i] = a[j]; a[j] = t;
    }
}
""",
    driver=driver([("int[]", "nums")], "new Solution().sortColors(nums);\nCodeTrackIO.result(CodeTrackIO.fmt(nums));"),
    explanation="Dutch national flag algorithm: keep three regions with pointers `low`, `mid` and `high`. A 0 at `mid` "
                "is swapped to the `low` region, a 2 is swapped to the `high` region, and a 1 just advances `mid`.",
    time="O(n)", space="O(1)",
    samples=[dict(input=inp([2, 0, 2, 1, 1, 0]), explanation=""),
             dict(input=inp([2, 0, 1]), explanation="")],
    hidden=[inp([0]), inp([1]), inp([2, 2]), inp([1, 0]), inp([2, 1, 0, 0, 1, 2]),
            inp([rng.randint(0, 2) for _ in range(300)]), inp([2] * 150 + [0] * 150)],
    py=py_sort_colors,
))


# 46 -----------------------------------------------------------------------
def py_merge_intervals(lines):
    iv = sorted(parse(lines[0]))
    out = []
    for s, e in iv:
        if out and s <= out[-1][1]:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return fmt(out)


def rand_intervals(n, span, maxlen):
    res = []
    for _ in range(n):
        s = rng.randint(0, span)
        res.append([s, s + rng.randint(0, maxlen)])
    return res


P.append(dict(
    title="Merge Intervals",
    category="Arrays", difficulty="Medium", tags="array,sorting",
    description="Given an array of `intervals` where `intervals[i] = [start, end]`, merge all overlapping intervals and "
                "return the non-overlapping intervals that cover all the input intervals.\n\n"
                "Intervals that touch, such as `[1,4]` and `[4,5]`, also overlap. You may return the intervals in any order.",
    params=["intervals"],
    constraints=["1 <= intervals.length <= 10^4", "0 <= start <= end <= 10^4"],
    template="""class Solution {
    public int[][] merge(int[][] intervals) {

    }
}
""",
    solution="""import java.util.*;

class Solution {
    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0])); // by start
        List<int[]> merged = new ArrayList<>();
        for (int[] cur : intervals) {
            if (!merged.isEmpty() && cur[0] <= merged.get(merged.size() - 1)[1]) {
                int[] last = merged.get(merged.size() - 1);
                last[1] = Math.max(last[1], cur[1]); // overlap: extend the last interval
            } else {
                merged.add(new int[] { cur[0], cur[1] });
            }
        }
        return merged.toArray(new int[0][]);
    }
}
""",
    driver=driver([("int[][]", "intervals")],
                  "int[][] result = new Solution().merge(intervals);\n"
                  "if (result != null) {\n"
                  "    result = result.clone();\n"
                  "    Arrays.sort(result, (a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(a[a.length - 1], b[b.length - 1])); // any order is accepted\n"
                  "}\n"
                  "CodeTrackIO.result(CodeTrackIO.fmt(result));"),
    explanation="Sort the intervals by start. Walk through them keeping the last merged interval: if the current one "
                "starts before (or exactly when) the last one ends, extend the last interval's end; otherwise start a new "
                "merged interval.",
    time="O(n log n)", space="O(n)",
    samples=[dict(input=inp([[1, 3], [2, 6], [8, 10], [15, 18]]), explanation="[1,3] and [2,6] overlap, so they merge into [1,6]."),
             dict(input=inp([[1, 4], [4, 5]]), explanation="[1,4] and [4,5] touch, so they merge.")],
    hidden=[inp([[1, 4]]), inp([[1, 4], [0, 4]]), inp([[1, 4], [2, 3]]), inp([[1, 4], [0, 0]]), inp([[2, 3], [4, 5], [6, 7], [8, 9], [1, 10]]),
            inp(rand_intervals(50, 100, 5)), inp(rand_intervals(2000, 10000, 3)), inp(rand_intervals(500, 9000, 400))],
    py=py_merge_intervals,
))


# 47 -----------------------------------------------------------------------
def py_erase(lines):
    iv = sorted(parse(lines[0]), key=lambda x: x[1])
    removed, end = 0, float("-inf")
    for s, e in iv:
        if s >= end:
            end = e
        else:
            removed += 1
    return fmt(removed)


def rand_open_intervals(n, span, maxlen):
    res = []
    for _ in range(n):
        s = rng.randint(-span, span)
        res.append([s, s + rng.randint(1, maxlen)])
    return res


P.append(dict(
    title="Non-overlapping Intervals",
    category="Greedy", difficulty="Medium", tags="greedy,sorting",
    description="Given an array of `intervals` where `intervals[i] = [start, end]`, return the minimum number of "
                "intervals you need to remove so that the rest do not overlap.\n\n"
                "Intervals that only touch, such as `[1,2]` and `[2,3]`, do **not** overlap.",
    params=["intervals"],
    constraints=["1 <= intervals.length <= 10^5", "-5 * 10^4 <= start < end <= 5 * 10^4"],
    template="""class Solution {
    public int eraseOverlapIntervals(int[][] intervals) {

    }
}
""",
    solution="""import java.util.*;

class Solution {
    public int eraseOverlapIntervals(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1])); // by end
        int removed = 0;
        long end = Long.MIN_VALUE;
        for (int[] cur : intervals) {
            if (cur[0] >= end) end = cur[1]; // keep it: it ends earliest and does not overlap
            else removed++;                  // overlaps the interval we kept
        }
        return removed;
    }
}
""",
    driver=driver([("int[][]", "intervals")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().eraseOverlapIntervals(intervals)));"),
    explanation="Greedy: sort by end time and keep an interval whenever it starts at or after the end of the last kept "
                "interval. Choosing the interval that ends earliest always leaves the most room for the rest, so this "
                "keeps the maximum number of intervals; everything else must be removed.",
    time="O(n log n)", space="O(1) extra (besides sorting)",
    samples=[dict(input=inp([[1, 2], [2, 3], [3, 4], [1, 3]]), explanation="Remove [1,3] and the rest do not overlap."),
             dict(input=inp([[1, 2], [1, 2], [1, 2]]), explanation="Remove two copies of [1,2].")],
    hidden=[inp([[1, 2], [2, 3]]), inp([[0, 2], [1, 3], [2, 4], [3, 5], [4, 6]]), inp([[1, 100], [11, 22], [1, 11], [2, 12]]),
            inp([[-50000, 50000]]), inp(rand_open_intervals(100, 200, 30)), inp(rand_open_intervals(2000, 50000, 200))],
    py=py_erase,
))


# 48 -----------------------------------------------------------------------
def py_level(lines):
    root = tree_from_list(parse(lines[0]))
    out = []
    q = deque([root] if root else [])
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        out.append(level)
    return fmt(out)


P.append(dict(
    title="Binary Tree Level Order",
    category="Trees", difficulty="Medium", tags="tree,bfs,queue",
    description="Given the `root` of a binary tree, return the level order traversal of its nodes' values: "
                "left to right, one list per level.",
    params=["root"],
    constraints=["The number of nodes in the tree is in the range [0, 2000]", "-1000 <= Node.val <= 1000"],
    template=TREE_NODE_DOC + """class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {

    }
}
""",
    solution="""import java.util.*;

class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;
        Deque<TreeNode> queue = new ArrayDeque<>();
        queue.add(root);
        while (!queue.isEmpty()) {
            int size = queue.size(); // nodes on the current level
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                level.add(node.val);
                if (node.left != null) queue.add(node.left);
                if (node.right != null) queue.add(node.right);
            }
            result.add(level);
        }
        return result;
    }
}
""",
    driver=driver([("TreeNode", "root")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().levelOrder(root)));"),
    explanation="Breadth-first search with a queue. At the start of each level the queue holds exactly that level's "
                "nodes, so process `queue.size()` nodes into one list while enqueueing their children for the next level.",
    time="O(n)", space="O(n)",
    samples=[dict(input=inp([3, 9, 20, None, None, 15, 7]), explanation=""),
             dict(input=inp([1]), explanation="")],
    hidden=[inp([]), inp([1, 2, 3, 4, None, None, 5]), inp(random_tree(rng, 20, -1000, 1000)),
            inp(random_tree(rng, 700, -1000, 1000)), inp(skewed_tree(300, "left"))],
    py=py_level,
))


# 49 -----------------------------------------------------------------------
def py_codec(lines):
    return fmt(tree_to_list(tree_from_list(parse(lines[0]))))


P.append(dict(
    title="Serialize Binary Tree",
    category="Trees", difficulty="Hard", tags="tree,string,bfs,dfs,design",
    description="Design an algorithm to serialize a binary tree to a string and deserialize that string back to the "
                "original tree. You can use any format you like.\n\n"
                "The judge runs `new Codec().deserialize(new Codec().serialize(root))` and prints the resulting tree, "
                "which must be identical to the input tree.",
    params=["root"],
    constraints=["The number of nodes in the tree is in the range [0, 10^4]", "-1000 <= Node.val <= 1000"],
    template=TREE_NODE_DOC + """public class Codec {

    // Encodes a tree to a single string.
    public String serialize(TreeNode root) {

    }

    // Decodes your encoded data to tree.
    public TreeNode deserialize(String data) {

    }
}
""",
    solution="""import java.util.*;

public class Codec {
    // Preorder with "#" for null children, e.g. "1,2,#,#,3,4,#,#,5,#,#"
    public String serialize(TreeNode root) {
        StringBuilder sb = new StringBuilder();
        Deque<TreeNode> stack = new ArrayDeque<>();
        List<TreeNode> order = new ArrayList<>();
        // iterative preorder so deep trees do not overflow the stack
        stack.push(root == null ? NULL : root);
        while (!stack.isEmpty()) {
            TreeNode node = stack.pop();
            if (sb.length() > 0) sb.append(',');
            if (node == NULL) {
                sb.append('#');
                continue;
            }
            sb.append(node.val);
            stack.push(node.right == null ? NULL : node.right);
            stack.push(node.left == null ? NULL : node.left);
        }
        return sb.toString();
    }

    public TreeNode deserialize(String data) {
        String[] tokens = data.split(",");
        int[] pos = { 0 };
        TreeNode dummy = new TreeNode();
        // iterative rebuild: each frame is a parent waiting for its left (0) or right (1) child
        Deque<Object[]> stack = new ArrayDeque<>();
        stack.push(new Object[] { dummy, 1 });
        while (pos[0] < tokens.length && !stack.isEmpty()) {
            Object[] frame = stack.pop();
            TreeNode parent = (TreeNode) frame[0];
            int side = (int) frame[1];
            String t = tokens[pos[0]++];
            if (t.equals("#")) continue;
            TreeNode node = new TreeNode(Integer.parseInt(t));
            if (side == 0) parent.left = node; else parent.right = node;
            stack.push(new Object[] { node, 1 });
            stack.push(new Object[] { node, 0 });
        }
        return dummy.right;
    }

    private static final TreeNode NULL = new TreeNode();
}
""",
    driver=driver([("TreeNode", "root")],
                  "Codec ser = new Codec(), deser = new Codec();\n"
                  "TreeNode ans = deser.deserialize(ser.serialize(root));\n"
                  "CodeTrackIO.result(CodeTrackIO.fmt(ans));"),
    explanation="Write the tree in preorder, using a marker such as `#` for every missing child. Preorder with null "
                "markers is unambiguous: when reading it back, each token is either a null marker or a node whose left "
                "subtree comes next, followed by its right subtree. The reference solution uses explicit stacks so very "
                "deep trees do not overflow the call stack.",
    time="O(n)", space="O(n)",
    samples=[dict(input=inp([1, 2, 3, None, None, 4, 5]), explanation=""),
             dict(input=inp([]), explanation="")],
    hidden=[inp([1]), inp([1, None, 2, None, 3]), inp([-1000, 1000, 0]), inp(random_tree(rng, 50, -1000, 1000)),
            inp(random_tree(rng, 2000, -1000, 1000)), inp(skewed_tree(1500, "left", -500))],
    py=py_codec,
))
