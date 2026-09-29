"""Problems 1-17."""
import random
from common import LIST_NODE_DOC, driver, fmt, inp, parse

rng = random.Random(1001)
P = []


# 1 ------------------------------------------------------------------------
def py_is_prime(lines):
    n = parse(lines[0])
    if n < 2:
        return fmt(False)
    i = 2
    while i * i <= n:
        if n % i == 0:
            return fmt(False)
        i += 1
    return fmt(True)


P.append(dict(
    title="Prime Number Check",
    category="Basics", difficulty="Easy", tags="math,loops,prime",
    description="Given an integer `n`, return `true` if `n` is a prime number, otherwise return `false`.\n\n"
                "A prime number is greater than 1 and has exactly two divisors: 1 and itself.",
    params=["n"],
    constraints=["0 <= n <= 2^31 - 1"],
    template="""class Solution {
    public boolean isPrime(int n) {

    }
}
""",
    solution="""class Solution {
    public boolean isPrime(int n) {
        if (n < 2) return false;
        // Only divisors up to sqrt(n) need to be checked; use long to avoid overflow in i * i
        for (long i = 2; i * i <= n; i++) {
            if (n % i == 0) return false;
        }
        return true;
    }
}
""",
    driver=driver([("int", "n")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().isPrime(n)));"),
    explanation="If `n` has a divisor other than 1 and itself, one of them is at most `sqrt(n)`. "
                "So try every `i` from 2 while `i * i <= n`; if any divides `n`, it is not prime. "
                "Numbers below 2 are never prime. Use a `long` loop variable so `i * i` cannot overflow.",
    time="O(sqrt(n))", space="O(1)",
    samples=[dict(input=inp(7), explanation="7 is only divisible by 1 and 7."),
             dict(input=inp(10), explanation="10 = 2 x 5, so it has more than two divisors.")],
    hidden=[inp(x) for x in [0, 1, 2, 3, 49, 97, 1000000000, 999999937, 2147483647, 2147483646]],
    py=py_is_prime,
))


# 2 ------------------------------------------------------------------------
def py_reverse(lines):
    return fmt(list(reversed(parse(lines[0]))))


P.append(dict(
    title="Reverse an Array",
    category="Arrays", difficulty="Easy", tags="array,two-pointer,swap",
    description="Given an integer array `nums`, reverse it **in place** (do not return a new array).\n\n"
                "The judge prints `nums` after your method returns.",
    params=["nums"],
    constraints=["1 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"],
    template="""class Solution {
    public void reverse(int[] nums) {

    }
}
""",
    solution="""class Solution {
    public void reverse(int[] nums) {
        int left = 0, right = nums.length - 1;
        while (left < right) {
            int tmp = nums[left];
            nums[left++] = nums[right];
            nums[right--] = tmp;
        }
    }
}
""",
    driver=driver([("int[]", "nums")], "new Solution().reverse(nums);\nCodeTrackIO.result(CodeTrackIO.fmt(nums));"),
    explanation="Use two pointers, one at each end. Swap the two values, then move both pointers towards the middle "
                "until they meet. Every element is swapped at most once.",
    time="O(n)", space="O(1)",
    samples=[dict(input=inp([1, 2, 3, 4, 5]), explanation=""),
             dict(input=inp([10, -3]), explanation="")],
    hidden=[inp([7]), inp([1, 2]), inp([0, 0, 1]), inp([-5, 3, 3, -5]), inp([1000000000, -1000000000, 0]),
            inp([rng.randint(-10**9, 10**9) for _ in range(500)]),
            inp([rng.randint(-100, 100) for _ in range(3000)])],
    py=py_reverse,
))


# 3 ------------------------------------------------------------------------
def py_is_pal(lines):
    s = parse(lines[0])
    return fmt(s == s[::-1])


pal_long = "".join(rng.choice("abc") for _ in range(2500))
P.append(dict(
    title="Palindrome String",
    category="Strings", difficulty="Easy", tags="string,two-pointer,palindrome",
    description="Given a string `s`, return `true` if it reads the same forwards and backwards, otherwise `false`.\n\n"
                "The comparison is case-sensitive, so `\"Abba\"` is **not** a palindrome.",
    params=["s"],
    constraints=["1 <= s.length <= 10^5", "s consists of English letters"],
    template="""class Solution {
    public boolean isPalindrome(String s) {

    }
}
""",
    solution="""class Solution {
    public boolean isPalindrome(String s) {
        int i = 0, j = s.length() - 1;
        while (i < j) {
            if (s.charAt(i++) != s.charAt(j--)) return false;
        }
        return true;
    }
}
""",
    driver=driver([("String", "s")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().isPalindrome(s)));"),
    explanation="Compare characters from both ends moving inwards. The first mismatch proves it is not a palindrome; "
                "if the pointers meet without a mismatch, it is.",
    time="O(n)", space="O(1)",
    samples=[dict(input=inp("madam"), explanation="\"madam\" reversed is \"madam\"."),
             dict(input=inp("hello"), explanation="\"hello\" reversed is \"olleh\".")],
    hidden=[inp(x) for x in ["a", "ab", "aa", "Abba", "racecar", "abcdedcba", "abca",
                             pal_long + pal_long[::-1], pal_long + "x" + pal_long[::-1][1:]]],
    py=py_is_pal,
))


# 4 ------------------------------------------------------------------------
def py_bsearch(lines):
    nums, target = parse(lines[0]), parse(lines[1])
    return fmt(nums.index(target) if target in nums else -1)


big_sorted = sorted(rng.sample(range(-10**6, 10**6), 3000))
P.append(dict(
    title="Binary Search",
    category="Searching", difficulty="Medium", tags="array,binary-search,divide-and-conquer",
    description="Given an array of integers `nums` sorted in ascending order and an integer `target`, "
                "return the index of `target` in `nums`. If it is not present, return `-1`.\n\n"
                "Your algorithm must run in `O(log n)` time.",
    params=["nums", "target"],
    constraints=["1 <= nums.length <= 10^4", "-10^6 <= nums[i], target <= 10^6",
                 "All values in nums are unique", "nums is sorted in ascending order"],
    template="""class Solution {
    public int search(int[] nums, int target) {

    }
}
""",
    solution="""class Solution {
    public int search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2; // avoids overflow of (lo + hi)
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }
}
""",
    driver=driver([("int[]", "nums"), ("int", "target")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().search(nums, target)));"),
    explanation="Keep a window `[lo, hi]` that must contain the target if it exists. Look at the middle element: "
                "if it is too small, discard the left half; if too large, discard the right half. "
                "Each step halves the window.",
    time="O(log n)", space="O(1)",
    samples=[dict(input=inp([-1, 0, 3, 5, 9, 12], 9), explanation="9 exists in nums and its index is 4."),
             dict(input=inp([-1, 0, 3, 5, 9, 12], 2), explanation="2 does not exist in nums, so return -1.")],
    hidden=[inp([5], 5), inp([5], -5), inp([1, 3], 3), inp([1, 3], 1), inp([2, 4, 6, 8, 10], 7),
            inp(big_sorted, big_sorted[-1]), inp(big_sorted[:1000], big_sorted[0]), inp(big_sorted[:1500], big_sorted[1234]),
            inp(big_sorted[:500], 10**6)],
    py=py_bsearch,
))


# 5 ------------------------------------------------------------------------
def py_fact(lines):
    n = parse(lines[0])
    r = 1
    for i in range(2, n + 1):
        r *= i
    return fmt(r)


P.append(dict(
    title="Factorial Using Recursion",
    category="Recursion", difficulty="Easy", tags="recursion,math,factorial",
    description="Given a non-negative integer `n`, return `n!` (n factorial) using recursion.\n\n"
                "`n! = n x (n - 1) x ... x 1`, and `0! = 1`. The answer fits in a `long`.",
    params=["n"],
    constraints=["0 <= n <= 20"],
    template="""class Solution {
    public long factorial(int n) {

    }
}
""",
    solution="""class Solution {
    public long factorial(int n) {
        if (n <= 1) return 1;          // base case: 0! = 1! = 1
        return n * factorial(n - 1);   // recursive case
    }
}
""",
    driver=driver([("int", "n")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().factorial(n)));"),
    explanation="The base case is `n <= 1`, which returns 1. Otherwise `n! = n * (n - 1)!`, so return "
                "`n * factorial(n - 1)`. `20!` is about 2.4 x 10^18, which still fits in a `long`.",
    time="O(n)", space="O(n) recursion stack",
    samples=[dict(input=inp(5), explanation="5! = 5 x 4 x 3 x 2 x 1 = 120"),
             dict(input=inp(0), explanation="By definition, 0! = 1.")],
    hidden=[inp(x) for x in [1, 2, 3, 10, 13, 19, 20]],
    py=py_fact,
))


# 6 ------------------------------------------------------------------------
def py_two_sum(lines):
    nums, target = parse(lines[0]), parse(lines[1])
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return fmt(sorted([seen[target - x], i]))
        seen[x] = i
    return fmt([])


def two_sum_case(n):
    evens = rng.sample(range(-10**8, 10**8, 2), n - 1)
    a = evens[rng.randrange(len(evens))]
    b = rng.randrange(-10**8 + 1, 10**8, 2)  # the only odd number
    nums = evens[:]
    nums.insert(rng.randrange(len(nums) + 1), b)
    return inp(nums, a + b)


P.append(dict(
    title="Two Sum",
    category="Arrays", difficulty="Easy", tags="array,hashmap",
    description="Given an array of integers `nums` and an integer `target`, return the indices of the two numbers "
                "that add up to `target`.\n\n"
                "Each input has **exactly one** solution, and you may not use the same element twice. "
                "You can return the two indices in any order.",
    params=["nums", "target"],
    constraints=["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9",
                 "Only one valid answer exists"],
    template="""class Solution {
    public int[] twoSum(int[] nums, int target) {

    }
}
""",
    solution="""import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>(); // value -> index
        for (int i = 0; i < nums.length; i++) {
            Integer j = seen.get(target - nums[i]);
            if (j != null) return new int[] { j, i };
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}
""",
    driver=driver([("int[]", "nums"), ("int", "target")],
                  "int[] result = new Solution().twoSum(nums, target);\n"
                  "if (result != null) Arrays.sort(result); // any order is accepted\n"
                  "CodeTrackIO.result(CodeTrackIO.fmt(result));"),
    explanation="Scan the array once while remembering every value you have seen in a hash map (value to index). "
                "For each `nums[i]`, the partner you need is `target - nums[i]`; if it is already in the map, "
                "you have the answer. This replaces the O(n^2) pair check with O(1) lookups.",
    time="O(n)", space="O(n)",
    samples=[dict(input=inp([2, 7, 11, 15], 9), explanation="nums[0] + nums[1] = 2 + 7 = 9, so return [0,1]."),
             dict(input=inp([3, 2, 4], 6), explanation="nums[1] + nums[2] = 2 + 4 = 6.")],
    hidden=[inp([3, 3], 6), inp([-1, -2, -3, -4, -5], -8), inp([0, 4, 3, 0], 0),
            inp([1, 5, 1000000000, -1000000000], 0), inp([5, 75, 25], 100),
            two_sum_case(50), two_sum_case(500), two_sum_case(3000)],
    py=py_two_sum,
))


# 7 ------------------------------------------------------------------------
def py_max_sub(lines):
    nums = parse(lines[0])
    best = cur = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return fmt(best)


P.append(dict(
    title="Maximum Subarray (Kadane's)",
    category="Arrays", difficulty="Medium", tags="array,dynamic-programming,kadane",
    description="Given an integer array `nums`, find the contiguous subarray (containing at least one number) "
                "with the largest sum, and return that sum.",
    params=["nums"],
    constraints=["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    template="""class Solution {
    public int maxSubArray(int[] nums) {

    }
}
""",
    solution="""class Solution {
    public int maxSubArray(int[] nums) {
        int best = nums[0], current = nums[0];
        for (int i = 1; i < nums.length; i++) {
            // either extend the previous subarray or start fresh at nums[i]
            current = Math.max(nums[i], current + nums[i]);
            best = Math.max(best, current);
        }
        return best;
    }
}
""",
    driver=driver([("int[]", "nums")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().maxSubArray(nums)));"),
    explanation="Kadane's algorithm: `current` is the best sum of a subarray ending at index `i`. "
                "At each step either extend the previous subarray (`current + nums[i]`) or start again at `nums[i]`, "
                "whichever is larger. The answer is the largest `current` seen.",
    time="O(n)", space="O(1)",
    samples=[dict(input=inp([-2, 1, -3, 4, -1, 2, 1, -5, 4]), explanation="The subarray [4,-1,2,1] has the largest sum, 6."),
             dict(input=inp([1]), explanation="The only subarray is [1].")],
    hidden=[inp([5, 4, -1, 7, 8]), inp([-3, -1, -2]), inp([-1]), inp([0, 0, 0]),
            inp([rng.randint(-10**4, 10**4) for _ in range(3000)]),
            inp([rng.randint(1, 10**4) for _ in range(1000)]),
            inp([(-1) ** i * rng.randint(1, 50) for i in range(1000)])],
    py=py_max_sub,
))


# 8 ------------------------------------------------------------------------
def py_move_zeroes(lines):
    nums = parse(lines[0])
    nz = [x for x in nums if x != 0]
    return fmt(nz + [0] * (len(nums) - len(nz)))


P.append(dict(
    title="Move Zeroes",
    category="Arrays", difficulty="Easy", tags="array,two-pointer",
    description="Given an integer array `nums`, move all `0`s to the end while keeping the relative order of the "
                "non-zero elements.\n\nDo this **in place** without making a copy of the array. "
                "The judge prints `nums` after your method returns.",
    params=["nums"],
    constraints=["1 <= nums.length <= 10^4", "-2^31 <= nums[i] <= 2^31 - 1"],
    template="""class Solution {
    public void moveZeroes(int[] nums) {

    }
}
""",
    solution="""class Solution {
    public void moveZeroes(int[] nums) {
        int write = 0; // next position for a non-zero value
        for (int x : nums) {
            if (x != 0) nums[write++] = x;
        }
        while (write < nums.length) nums[write++] = 0;
    }
}
""",
    driver=driver([("int[]", "nums")], "new Solution().moveZeroes(nums);\nCodeTrackIO.result(CodeTrackIO.fmt(nums));"),
    explanation="Keep a `write` pointer. Walk through the array and copy every non-zero value to `nums[write]`, "
                "advancing `write`. Non-zero values keep their order. Finally fill the rest of the array with zeros.",
    time="O(n)", space="O(1)",
    samples=[dict(input=inp([0, 1, 0, 3, 12]), explanation=""),
             dict(input=inp([0]), explanation="")],
    hidden=[inp([1, 2, 3]), inp([0, 0, 1]), inp([4, 0, 5, 0, 0, 6]), inp([-1, 0, -2]),
            inp([2147483647, 0, -2147483648]),
            inp([rng.choice([0, 0, 0, rng.randint(-50, 50)]) for _ in range(2000)])],
    py=py_move_zeroes,
))


# 9 ------------------------------------------------------------------------
def py_anagram(lines):
    s, t = parse(lines[0]), parse(lines[1])
    return fmt(sorted(s) == sorted(t))


ana = "".join(rng.choice("abcdefghijklmnopqrstuvwxyz") for _ in range(5000))
ana_perm = list(ana)
rng.shuffle(ana_perm)
ana_perm = "".join(ana_perm)
P.append(dict(
    title="Valid Anagram",
    category="Strings", difficulty="Easy", tags="string,sorting,hashmap",
    description="Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.\n\n"
                "An anagram uses exactly the same letters the same number of times, in any order.",
    params=["s", "t"],
    constraints=["1 <= s.length, t.length <= 5 * 10^4", "s and t consist of lowercase English letters"],
    template="""class Solution {
    public boolean isAnagram(String s, String t) {

    }
}
""",
    solution="""class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] count = new int[26];
        for (int i = 0; i < s.length(); i++) {
            count[s.charAt(i) - 'a']++;
            count[t.charAt(i) - 'a']--;
        }
        for (int c : count) if (c != 0) return false;
        return true;
    }
}
""",
    driver=driver([("String", "s"), ("String", "t")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().isAnagram(s, t)));"),
    explanation="Different lengths can never be anagrams. Otherwise count letters: add 1 for each letter of `s` and "
                "subtract 1 for each letter of `t` in a 26-slot array. They are anagrams exactly when every count ends at 0.",
    time="O(n)", space="O(1)",
    samples=[dict(input=inp("anagram", "nagaram"), explanation=""),
             dict(input=inp("rat", "car"), explanation="")],
    hidden=[inp("a", "a"), inp("a", "ab"), inp("ab", "ba"), inp("aacc", "ccac"), inp("listen", "silent"),
            inp(ana, ana_perm), inp(ana, ana_perm[:-1] + ("a" if ana_perm[-1] != "a" else "b"))],
    py=py_anagram,
))


# 10 -----------------------------------------------------------------------
def py_rot_search(lines):
    nums, target = parse(lines[0]), parse(lines[1])
    return fmt(nums.index(target) if target in nums else -1)


def rotated(n, k):
    base = sorted(rng.sample(range(-10**4, 10**4), n))
    return base[k:] + base[:k]


rot1 = rotated(2000, 777)
P.append(dict(
    title="Search in Rotated Sorted Array",
    category="Searching", difficulty="Medium", tags="array,binary-search",
    description="An ascending array of distinct integers was rotated at an unknown pivot, for example "
                "`[0,1,2,4,5,6,7]` might become `[4,5,6,7,0,1,2]`.\n\n"
                "Given the rotated array `nums` and an integer `target`, return the index of `target`, or `-1` if it "
                "is not in `nums`. Your algorithm must run in `O(log n)` time.",
    params=["nums", "target"],
    constraints=["1 <= nums.length <= 5000", "-10^4 <= nums[i], target <= 10^4", "All values of nums are unique"],
    template="""class Solution {
    public int search(int[] nums, int target) {

    }
}
""",
    solution="""class Solution {
    public int search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int mid = (lo + hi) >>> 1;
            if (nums[mid] == target) return mid;
            if (nums[lo] <= nums[mid]) {             // left half is sorted
                if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
                else lo = mid + 1;
            } else {                                  // right half is sorted
                if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
                else hi = mid - 1;
            }
        }
        return -1;
    }
}
""",
    driver=driver([("int[]", "nums"), ("int", "target")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().search(nums, target)));"),
    explanation="In a rotated sorted array, at least one half around `mid` is always sorted. Check which half is sorted, "
                "then check whether the target lies inside that sorted half's range. If it does, search there; "
                "otherwise search the other half.",
    time="O(log n)", space="O(1)",
    samples=[dict(input=inp([4, 5, 6, 7, 0, 1, 2], 0), explanation=""),
             dict(input=inp([4, 5, 6, 7, 0, 1, 2], 3), explanation="")],
    hidden=[inp([1], 0), inp([1], 1), inp([3, 1], 1), inp([5, 1, 3], 5), inp([1, 2, 3, 4, 5], 4),
            inp(rot1, rot1[0]), inp(rot1, rot1[-1]), inp(rot1, rot1[1500]), inp(rot1, 10**4),
            inp(rotated(500, 499), 17)],
    py=py_rot_search,
))


# 11 -----------------------------------------------------------------------
def py_merge_lists(lines):
    return fmt(sorted(parse(lines[0]) + parse(lines[1])))


P.append(dict(
    title="Merge Two Sorted Lists",
    category="Linked Lists", difficulty="Easy", tags="linked-list,recursion",
    description="You are given the heads of two sorted linked lists `list1` and `list2`.\n\n"
                "Merge them into one sorted list by splicing together the nodes of the two lists, and return the "
                "head of the merged list.",
    params=["list1", "list2"],
    constraints=["The number of nodes in both lists is in the range [0, 50]", "-100 <= Node.val <= 100",
                 "Both list1 and list2 are sorted in non-decreasing order"],
    template=LIST_NODE_DOC + """class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {

    }
}
""",
    solution="""class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        ListNode dummy = new ListNode(0), tail = dummy;
        while (list1 != null && list2 != null) {
            if (list1.val <= list2.val) {
                tail.next = list1;
                list1 = list1.next;
            } else {
                tail.next = list2;
                list2 = list2.next;
            }
            tail = tail.next;
        }
        tail.next = (list1 != null) ? list1 : list2; // attach whatever is left
        return dummy.next;
    }
}
""",
    driver=driver([("ListNode", "list1"), ("ListNode", "list2")],
                  "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().mergeTwoLists(list1, list2)));"),
    explanation="Use a dummy head and a `tail` pointer. Repeatedly attach the smaller of the two front nodes to `tail`. "
                "When one list runs out, attach the rest of the other list in one step.",
    time="O(n + m)", space="O(1)",
    samples=[dict(input=inp([1, 2, 4], [1, 3, 4]), explanation=""),
             dict(input=inp([], [0]), explanation="")],
    hidden=[inp([], []), inp([5], [1, 2, 3]), inp([-10, -5, 0], [-7, 8]), inp([1, 1, 1], [1, 1]),
            inp(sorted(rng.randint(-100, 100) for _ in range(50)), sorted(rng.randint(-100, 100) for _ in range(50))),
            inp(sorted(rng.randint(-100, 100) for _ in range(7)), sorted(rng.randint(-100, 100) for _ in range(40)))],
    py=py_merge_lists,
))


# 12 -----------------------------------------------------------------------
def py_climb(lines):
    n = parse(lines[0])
    a, b = 1, 1
    for _ in range(n):
        a, b = b, a + b
    return fmt(a)


P.append(dict(
    title="Climbing Stairs",
    category="Dynamic Programming", difficulty="Easy", tags="dp,math,recursion",
    description="You are climbing a staircase with `n` steps. Each time you can climb either 1 or 2 steps.\n\n"
                "In how many distinct ways can you climb to the top?",
    params=["n"],
    constraints=["1 <= n <= 45"],
    template="""class Solution {
    public int climbStairs(int n) {

    }
}
""",
    solution="""class Solution {
    public int climbStairs(int n) {
        int prev = 1, curr = 1; // ways to reach step 0 and step 1
        for (int i = 2; i <= n; i++) {
            int next = prev + curr;   // arrive from one step below or two steps below
            prev = curr;
            curr = next;
        }
        return curr;
    }
}
""",
    driver=driver([("int", "n")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().climbStairs(n)));"),
    explanation="To stand on step `i` your last move came from step `i - 1` or `i - 2`, so "
                "`ways(i) = ways(i - 1) + ways(i - 2)`, the Fibonacci recurrence. Keep only the last two values.",
    time="O(n)", space="O(1)",
    samples=[dict(input=inp(2), explanation="There are two ways: 1 + 1 and 2."),
             dict(input=inp(3), explanation="There are three ways: 1 + 1 + 1, 1 + 2 and 2 + 1.")],
    hidden=[inp(x) for x in [1, 4, 5, 10, 30, 44, 45]],
    py=py_climb,
))


# 13 -----------------------------------------------------------------------
def py_valid_paren(lines):
    s = parse(lines[0])
    pairs = {")": "(", "]": "[", "}": "{"}
    st = []
    for c in s:
        if c in "([{":
            st.append(c)
        elif not st or st.pop() != pairs[c]:
            return fmt(False)
    return fmt(not st)


def balanced(n):
    out, st = [], []
    opens = "([{"
    close = {"(": ")", "[": "]", "{": "}"}
    while len(out) + len(st) < n:
        if st and (rng.random() < 0.5 or len(out) + 2 * len(st) >= n):
            out.append(close[st.pop()])
        else:
            c = rng.choice(opens)
            st.append(c)
            out.append(c)
    while st:
        out.append(close[st.pop()])
    return "".join(out)


bal = balanced(2000)
P.append(dict(
    title="Valid Parentheses",
    category="Stacks", difficulty="Easy", tags="stack,string",
    description="Given a string `s` containing only the characters `(`, `)`, `{`, `}`, `[` and `]`, decide whether it "
                "is valid.\n\nA string is valid when every opening bracket is closed by the same type of bracket, "
                "in the correct order, and every closing bracket has a matching opening bracket.",
    params=["s"],
    constraints=["1 <= s.length <= 10^4", "s consists only of the characters ()[]{}"],
    template="""class Solution {
    public boolean isValid(String s) {

    }
}
""",
    solution="""import java.util.*;

class Solution {
    public boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '[') stack.push(']');
            else if (c == '{') stack.push('}');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}
""",
    driver=driver([("String", "s")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().isValid(s)));"),
    explanation="Use a stack. For each opening bracket push the closing bracket you expect. For each closing bracket, "
                "the top of the stack must be exactly that bracket. At the end the stack must be empty.",
    time="O(n)", space="O(n)",
    samples=[dict(input=inp("()[]{}"), explanation=""),
             dict(input=inp("(]"), explanation="( is closed by ], which is the wrong type.")],
    hidden=[inp(x) for x in ["()", "([])", "([)]", "{[]}", "(", "]", "((()))[]{}", "){", bal, bal + "(", bal[:-1]]],
    py=py_valid_paren,
))


# 14 -----------------------------------------------------------------------
def py_middle(lines):
    vals = parse(lines[0])
    return fmt(vals[len(vals) // 2:])


P.append(dict(
    title="Middle of Linked List",
    category="Linked Lists", difficulty="Easy", tags="linked-list,two-pointer",
    description="Given the `head` of a singly linked list, return the middle node of the list.\n\n"
                "If there are two middle nodes, return the **second** one. The judge prints the list starting "
                "from the node you return.",
    params=["head"],
    constraints=["The number of nodes in the list is in the range [1, 100]", "1 <= Node.val <= 100"],
    template=LIST_NODE_DOC + """class Solution {
    public ListNode middleNode(ListNode head) {

    }
}
""",
    solution="""class Solution {
    public ListNode middleNode(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;       // one step
            fast = fast.next.next;  // two steps
        }
        return slow;
    }
}
""",
    driver=driver([("ListNode", "head")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().middleNode(head)));"),
    explanation="Move a `slow` pointer one node at a time and a `fast` pointer two nodes at a time. "
                "When `fast` reaches the end, `slow` is in the middle (the second middle for even lengths).",
    time="O(n)", space="O(1)",
    samples=[dict(input=inp([1, 2, 3, 4, 5]), explanation="The middle node has value 3."),
             dict(input=inp([1, 2, 3, 4, 5, 6]), explanation="There are two middle nodes, 3 and 4; return the second one.")],
    hidden=[inp([1]), inp([1, 2]), inp([7, 8, 9]), inp(list(range(1, 101))), inp([rng.randint(1, 100) for _ in range(99)])],
    py=py_middle,
))


# 15 -----------------------------------------------------------------------
def py_rev_list(lines):
    return fmt(list(reversed(parse(lines[0]))))


P.append(dict(
    title="Reverse Linked List",
    category="Linked Lists", difficulty="Easy", tags="linked-list,recursion",
    description="Given the `head` of a singly linked list, reverse the list and return the new head.",
    params=["head"],
    constraints=["The number of nodes in the list is in the range [0, 5000]", "-5000 <= Node.val <= 5000"],
    template=LIST_NODE_DOC + """class Solution {
    public ListNode reverseList(ListNode head) {

    }
}
""",
    solution="""class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        while (head != null) {
            ListNode next = head.next; // remember the rest of the list
            head.next = prev;          // flip the pointer
            prev = head;
            head = next;
        }
        return prev;
    }
}
""",
    driver=driver([("ListNode", "head")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().reverseList(head)));"),
    explanation="Walk the list once, pointing each node's `next` back at the previous node. "
                "Save `head.next` before overwriting it. When the walk ends, `prev` is the new head.",
    time="O(n)", space="O(1)",
    samples=[dict(input=inp([1, 2, 3, 4, 5]), explanation=""),
             dict(input=inp([1, 2]), explanation="")],
    hidden=[inp([]), inp([1]), inp([0, -1, 0]), inp([rng.randint(-5000, 5000) for _ in range(2000)])],
    py=py_rev_list,
))


# 16 -----------------------------------------------------------------------
def py_fib(lines):
    n = parse(lines[0])
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return fmt(a)


P.append(dict(
    title="Fibonacci (DP)",
    category="Dynamic Programming", difficulty="Easy", tags="dp,math",
    description="The Fibonacci numbers are defined as `F(0) = 0`, `F(1) = 1` and `F(n) = F(n - 1) + F(n - 2)` for `n > 1`.\n\n"
                "Given `n`, return `F(n)`. A plain recursive solution is exponential; use dynamic programming.",
    params=["n"],
    constraints=["0 <= n <= 45"],
    template="""class Solution {
    public int fib(int n) {

    }
}
""",
    solution="""class Solution {
    public int fib(int n) {
        if (n < 2) return n;
        int prev = 0, curr = 1;
        for (int i = 2; i <= n; i++) {
            int next = prev + curr;
            prev = curr;
            curr = next;
        }
        return curr;
    }
}
""",
    driver=driver([("int", "n")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().fib(n)));"),
    explanation="Build the sequence bottom-up, keeping only the previous two values. Each value is computed once, "
                "unlike naive recursion which recomputes the same subproblems exponentially many times.",
    time="O(n)", space="O(1)",
    samples=[dict(input=inp(4), explanation="F(4) = F(3) + F(2) = 2 + 1 = 3"),
             dict(input=inp(10), explanation="The sequence is 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55.")],
    hidden=[inp(x) for x in [0, 1, 2, 20, 30, 40, 45]],
    py=py_fib,
))


# 17 -----------------------------------------------------------------------
def py_coin(lines):
    coins, amount = parse(lines[0]), parse(lines[1])
    INF = float("inf")
    dp = [0] + [INF] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
    return fmt(dp[amount] if dp[amount] != INF else -1)


P.append(dict(
    title="Coin Change",
    category="Dynamic Programming", difficulty="Medium", tags="dp,array",
    description="You are given coin denominations `coins` and a total `amount`. Return the fewest number of coins "
                "needed to make up that amount, using as many of each coin as you like.\n\n"
                "If the amount cannot be made with the given coins, return `-1`.",
    params=["coins", "amount"],
    constraints=["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"],
    template="""class Solution {
    public int coinChange(int[] coins, int amount) {

    }
}
""",
    solution="""import java.util.*;

class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];       // dp[a] = fewest coins for amount a
        Arrays.fill(dp, Integer.MAX_VALUE);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++) {
            for (int c : coins) {
                if (c <= a && dp[a - c] != Integer.MAX_VALUE) {
                    dp[a] = Math.min(dp[a], dp[a - c] + 1);
                }
            }
        }
        return dp[amount] == Integer.MAX_VALUE ? -1 : dp[amount];
    }
}
""",
    driver=driver([("int[]", "coins"), ("int", "amount")], "CodeTrackIO.result(CodeTrackIO.fmt(new Solution().coinChange(coins, amount)));"),
    explanation="Let `dp[a]` be the fewest coins that make amount `a`, with `dp[0] = 0`. For every amount, try each coin "
                "`c` as the last coin: `dp[a] = min(dp[a], dp[a - c] + 1)`. Amounts that cannot be reached stay at "
                "infinity, which becomes `-1`. Greedy (always take the largest coin) does not work in general.",
    time="O(amount x coins)", space="O(amount)",
    samples=[dict(input=inp([1, 2, 5], 11), explanation="11 = 5 + 5 + 1"),
             dict(input=inp([2], 3), explanation="An odd amount cannot be made with only 2s.")],
    hidden=[inp([1], 0), inp([1], 7), inp([186, 419, 83, 408], 6249), inp([2, 5, 10, 1], 27), inp([5, 11], 3),
            inp([3, 7, 405, 436], 8839), inp([1, 3, 4], 6), inp([2147483647], 2),
            inp(sorted(rng.sample(range(1, 500), 8)), 9973)],
    py=py_coin,
))
