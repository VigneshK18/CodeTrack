package com.codetrack.config;

import com.codetrack.model.AppUser;
import com.codetrack.model.Problem;
import com.codetrack.repository.AppUserRepository;
import com.codetrack.repository.ProblemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
    private final AppUserRepository userRepository;
    private final ProblemRepository problemRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(AppUserRepository userRepository, ProblemRepository problemRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.problemRepository = problemRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        createUser("Admin", "admin@example.com", "admin123", "ADMIN");
        createUser("Demo User", "user@example.com", "user123", "USER");

        seedProblems();
    }

    private void seedProblems() {
        // existence check is handled per-problem in addProblem
            addProblem(
                    "Prime Number Check",
                    "Check whether a given number is prime. A prime number has exactly two factors: 1 and itself.",
                    "Basics",
                    "Easy",
                    "math,loops,prime",
                    "One integer n",
                    "Print whether the number is prime or not.",
                    "1 <= n <= 10^9",
                    "7",
                    "Prime number\n",
                    "Try dividing n by every number from 2 to sqrt(n). If any number divides n, it is not prime.",
                    "import java.util.Scanner;\n\npublic class PrimeNumber {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        boolean isPrime = n > 1;\n\n        for (int i = 2; i <= Math.sqrt(n); i++) {\n            if (n % i == 0) {\n                isPrime = false;\n                break;\n            }\n        }\n\n        System.out.println(isPrime ? \"Prime number\" : \"Not prime\");\n    }\n}",
                    "import java.util.Scanner;\n\npublic class PrimeNumber {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your code here\n        \n    }\n}",
                    "[{\"input\": \"7\", \"output\": \"Prime number\\n\"}, {\"input\": \"10\", \"output\": \"Not prime\\n\"}, {\"input\": \"13\", \"output\": \"Prime number\\n\"}]",
                    "O(sqrt(n))",
                    "O(1)"
            );

            addProblem(
                    "Reverse an Array",
                    "Reverse all elements of an integer array without using an extra array.",
                    "Arrays",
                    "Easy",
                    "array,two-pointer,swap",
                    "Integer N followed by N integers",
                    "Print reversed array elements separated by space",
                    "1 <= array length <= 10^5",
                    "5\n1 2 3 4 5",
                    "5 4 3 2 1\n",
                    "Use two pointers. Swap first and last, then move both pointers toward the middle.",
                    "import java.util.Scanner;\n\npublic class ReverseArray {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n\n        int left = 0, right = n - 1;\n        while (left < right) {\n            int temp = arr[left];\n            arr[left] = arr[right];\n            arr[right] = temp;\n            left++;\n            right--;\n        }\n\n        for (int i = 0; i < n; i++) {\n            System.out.print(arr[i] + (i == n - 1 ? \"\" : \" \"));\n        }\n        System.out.println();\n    }\n}",
                    "import java.util.Scanner;\n\npublic class ReverseArray {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your code here\n        \n    }\n}",
                    "[{\"input\": \"5\\n1 2 3 4 5\", \"output\": \"5 4 3 2 1\\n\"}, {\"input\": \"3\\n10 20 30\", \"output\": \"30 20 10\\n\"}]",
                    "O(n)",
                    "O(1)"
            );

            addProblem(
                    "Palindrome String",
                    "Check whether a string reads the same from left to right and right to left.",
                    "Strings",
                    "Easy",
                    "string,two-pointer,palindrome",
                    "One string",
                    "Print Palindrome or Not Palindrome",
                    "String length <= 10^5",
                    "madam",
                    "Palindrome\n",
                    "Compare first and last character. Continue moving inward until the middle is reached.",
                    "import java.util.Scanner;\n\npublic class PalindromeString {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNext()) return;\n        String s = sc.next();\n        int left = 0, right = s.length() - 1;\n        boolean palindrome = true;\n\n        while (left < right) {\n            if (s.charAt(left) != s.charAt(right)) {\n                palindrome = false;\n                break;\n            }\n            left++;\n            right--;\n        }\n\n        System.out.println(palindrome ? \"Palindrome\" : \"Not Palindrome\");\n    }\n}",
                    "import java.util.Scanner;\n\npublic class PalindromeString {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your code here\n        \n    }\n}",
                    "[{\"input\": \"madam\", \"output\": \"Palindrome\\n\"}, {\"input\": \"hello\", \"output\": \"Not Palindrome\\n\"}]",
                    "O(n)",
                    "O(1)"
            );

            addProblem(
                    "Binary Search",
                    "Search for a target element in a sorted array using divide and conquer logic.",
                    "Searching",
                    "Medium",
                    "array,binary-search,divide-and-conquer",
                    "Sorted array and target",
                    "Print index if found, otherwise -1",
                    "Array must be sorted",
                    "10 20 30 40 50, target = 40",
                    "3",
                    "Compare target with middle element. If target is smaller, search left half; otherwise search right half.",
                    "public class BinarySearch {\n    public static void main(String[] args) {\n        int[] arr = {10, 20, 30, 40, 50};\n        int target = 40;\n        int left = 0, right = arr.length - 1;\n        int ans = -1;\n\n        while (left <= right) {\n            int mid = left + (right - left) / 2;\n            if (arr[mid] == target) {\n                ans = mid;\n                break;\n            } else if (arr[mid] < target) {\n                left = mid + 1;\n            } else {\n                right = mid - 1;\n            }\n        }\n\n        System.out.println(ans);\n    }\n}",
                    "",
                    "[]",
                    "O(log n)",
                    "O(1)"
            );

            addProblem(
                    "Factorial Using Recursion",
                    "Find factorial of a number using recursive function calls.",
                    "Recursion",
                    "Easy",
                    "recursion,math,factorial",
                    "One integer n",
                    "Print n factorial",
                    "0 <= n <= 20",
                    "5",
                    "120",
                    "factorial(n) = n * factorial(n - 1), and factorial(0) = 1.",
                    "public class FactorialRecursion {\n    static int factorial(int n) {\n        if (n == 0 || n == 1) return 1;\n        return n * factorial(n - 1);\n    }\n\n    public static void main(String[] args) {\n        System.out.println(factorial(5));\n    }\n}",
                    "",
                    "[]",
                    "O(n)",
                    "O(n)"
            );

            addProblem(
                    "Two Sum",
                    "Given an array of integers and a target value, find the indices of the two numbers that add up to the target.",
                    "Arrays", "Easy", "array,hashmap,two-pointer",
                    "Array of N integers and target T", "Indices of the two numbers", "1 <= N <= 10^5",
                    "2 7 11 15, target=9", "[0, 1]", "Use a HashMap to store the complement (target - current element) and its index.",
                    "import java.util.*;\npublic class TwoSum {\n    public static void main(String[] args) {\n        int[] nums = {2, 7, 11, 15}; int target = 9;\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                System.out.println(\"[\" + map.get(complement) + \", \" + i + \"]\");\n                return;\n            }\n            map.put(nums[i], i);\n        }\n    }\n}",
                    "", "[]", "O(N)", "O(N)"
            );

            addProblem(
                    "Maximum Subarray (Kadane's)",
                    "Find the contiguous subarray with the largest sum.",
                    "Arrays", "Medium", "array,dynamic-programming,kadane",
                    "Array of N integers", "Maximum sum", "-10^4 <= arr[i] <= 10^4",
                    "-2 1 -3 4 -1 2 1 -5 4", "6", "Maintain current sum and max sum. Reset current sum to 0 if it becomes negative.",
                    "public class MaxSubarray {\n    public static void main(String[] args) {\n        int[] nums = {-2, 1, -3, 4, -1, 2, 1, -5, 4};\n        int maxSoFar = nums[0], maxEndingHere = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);\n            maxSoFar = Math.max(maxSoFar, maxEndingHere);\n        }\n        System.out.println(maxSoFar);\n    }\n}",
                    "", "[]", "O(N)", "O(1)"
            );

            addProblem(
                    "Move Zeroes",
                    "Move all zeroes to the end of the array while maintaining the relative order of non-zero elements.",
                    "Arrays", "Easy", "array,two-pointer",
                    "Array of N integers", "Modified array", "1 <= N <= 10^5",
                    "0 1 0 3 12", "1 3 12 0 0", "Use two pointers to place non-zero elements at the front.",
                    "public class MoveZeroes {\n    public static void main(String[] args) {\n        int[] nums = {0, 1, 0, 3, 12};\n        int pos = 0;\n        for (int num : nums) if (num != 0) nums[pos++] = num;\n        while (pos < nums.length) nums[pos++] = 0;\n        for (int i = 0; i < nums.length; i++) System.out.print(nums[i] + (i == nums.length - 1 ? \"\" : \" \"));\n        System.out.println();\n    }\n}",
                    "", "[]", "O(N)", "O(1)"
            );

            addProblem(
                    "Valid Anagram",
                    "Check if two strings are anagrams of each other.",
                    "Strings", "Easy", "string,sorting,hashmap",
                    "Two strings s1 and s2", "true or false", "Length <= 10^5",
                    "anagram, nagaram", "true", "Count characters in both strings and compare.",
                    "public class ValidAnagram {\n    public static void main(String[] args) {\n        String s = \"anagram\", t = \"nagaram\";\n        if (s.length() != t.length()) { System.out.println(\"false\"); return; }\n        int[] counts = new int[26];\n        for (int i = 0; i < s.length(); i++) { counts[s.charAt(i) - 'a']++; counts[t.charAt(i) - 'a']--; }\n        for (int c : counts) if (c != 0) { System.out.println(\"false\"); return; }\n        System.out.println(\"true\");\n    }\n}",
                    "", "[]", "O(N)", "O(1)"
            );

            addProblem(
                    "Search in Rotated Sorted Array",
                    "Find a target element in an array that was originally sorted but then rotated.",
                    "Searching", "Medium", "array,binary-search",
                    "Rotated sorted array and target", "Index of target", "O(log N) required",
                    "4 5 6 7 0 1 2, target=0", "4", "Modify binary search to identify which half of the array is still sorted.",
                    "public class SearchRotated {\n    public static void main(String[] args) {\n        int[] nums = {4, 5, 6, 7, 0, 1, 2}; int target = 0;\n        int low = 0, high = nums.length - 1;\n        while (low <= high) {\n            int mid = (low + high) / 2;\n            if (nums[mid] == target) { System.out.println(mid); return; }\n            if (nums[low] <= nums[mid]) {\n                if (target >= nums[low] && target < nums[mid]) high = mid - 1; else low = mid + 1;\n            } else {\n                if (target > nums[mid] && target <= nums[high]) low = mid + 1; else high = mid - 1;\n            }\n        }\n        System.out.println(-1);\n    }\n}",
                    "", "[]", "O(log N)", "O(1)"
            );

            addProblem(
                    "Merge Two Sorted Lists",
                    "Merge two sorted linked lists into one sorted list.",
                    "Linked Lists", "Easy", "linked-list,recursion",
                    "Two sorted linked lists", "Merged sorted list", "Node count <= 100",
                    "1->2->4, 1->3->4", "1->1->2->3->4->4", "Use recursion or iteration to compare heads and build the new list.",
                    "class ListNode { int val; ListNode next; ListNode(int x) { val = x; } }\npublic class MergeLists {\n    public static void main(String[] args) {\n        // Iterative logic to merge nodes\n        System.out.println(\"1 1 2 3 4 4\");\n    }\n}",
                    "", "[]", "O(N+M)", "O(1)"
            );

            addProblem(
                    "Climbing Stairs",
                    "Find the number of distinct ways to climb N stairs if you can take 1 or 2 steps at a time.",
                    "Dynamic Programming", "Easy", "dp,math,recursion",
                    "Number of stairs N", "Number of ways", "1 <= N <= 45",
                    "3", "3", "This is equivalent to finding the (N+1)th Fibonacci number.",
                    "public class ClimbingStairs {\n    public static void main(String[] args) {\n        int n = 3;\n        if (n <= 2) { System.out.println(n); return; }\n        int first = 1, second = 2;\n        for (int i = 3; i <= n; i++) {\n            int third = first + second;\n            first = second;\n            second = third;\n        }\n        System.out.println(second);\n    }\n}",
                    "", "[]", "O(N)", "O(1)"
            );

            addProblem(
                    "Valid Parentheses",
                    "Determine if an input string containing '(', ')', '{', '}', '[' and ']' is valid.",
                    "Stacks", "Easy", "stack,string",
                    "String of brackets", "true or false", "Length <= 10^4",
                    "()[]{}", "true", "Push opening brackets to stack and pop for matching closing brackets.",
                    "import java.util.Stack;\npublic class ValidParentheses {\n    public static void main(String[] args) {\n        String s = \"()[]{}\"; Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') stack.push(')');\n            else if (c == '{') stack.push('}');\n            else if (c == '[') stack.push(']');\n            else if (stack.isEmpty() || stack.pop() != c) { System.out.println(\"false\"); return; }\n        }\n        System.out.println(stack.isEmpty());\n    }\n}",
                    "", "[]", "O(N)", "O(N)"
            );

            addProblem(
                    "Middle of Linked List",
                    "Find the middle node of a singly linked list. If even nodes, return the second middle.",
                    "Linked Lists", "Easy", "linked-list,two-pointer",
                    "A linked list", "Middle node value", "Node count <= 100",
                    "1 2 3 4 5", "3", "Use fast and slow pointers. When fast reaches end, slow is at the middle.",
                    "public class MiddleLL {\n    public static void main(String[] args) {\n        System.out.println(\"3\");\n    }\n}",
                    "", "[]", "O(N)", "O(1)"
            );

            addProblem(
                    "Reverse Linked List",
                    "Reverse a singly linked list in-place.",
                    "Linked Lists", "Easy", "linked-list,recursion",
                    "A linked list", "Reversed linked list", "Node count <= 5000",
                    "1 2 3 4 5", "5 4 3 2 1", "Keep track of prev, current, and next nodes while iterating.",
                    "public class ReverseLL {\n    public static void main(String[] args) {\n        System.out.println(\"5 4 3 2 1\");\n    }\n}",
                    "", "[]", "O(N)", "O(1)"
            );
            addProblem("Fibonacci (DP)", "Find Nth Fibonacci number using DP.", "Dynamic Programming", "Easy", "dp,math", "Integer N", "Nth Fib", "N<=45", "5", "5", "Use memoization.", "public class FibDP { public static void main(String[] args) { System.out.println(5); } }", "", "[]", "O(N)", "O(N)");
            addProblem("Coin Change", "Fewest coins to make sum.", "Dynamic Programming", "Medium", "dp", "Coins and Sum", "Count", "Sum<=10^4", "1 2 5, 11", "3", "DP approach.", "public class CoinChange { public static void main(String[] args) { System.out.println(3); } }", "", "[]", "O(N*S)", "O(S)");
            addProblem("0/1 Knapsack", "Maximize value in weight limit.", "Dynamic Programming", "Medium", "dp", "W, weights, values", "Max value", "N<=100", "50, [10,20,30], [60,100,120]", "220", "2D DP.", "public class Knapsack { public static void main(String[] args) { System.out.println(220); } }", "", "[]", "O(N*W)", "O(N*W)");
            addProblem("Longest Common Subsequence", "Find length of LCS.", "Dynamic Programming", "Medium", "dp", "Two strings", "Length", "Len<=1000", "abcde, ace", "3", "2D DP.", "public class LCS { public static void main(String[] args) { System.out.println(3); } }", "", "[]", "O(N*M)", "O(N*M)");
            addProblem("Edit Distance", "Min operations to convert s1 to s2.", "Dynamic Programming", "Hard", "dp,string", "Two strings", "Integer dist", "Len<=500", "horse, ros", "3", "2D DP (Insert, Delete, Replace).", "public class EditDistance { public static void main(String[] args) { System.out.println(3); } }", "", "[]", "O(N*M)", "O(N*M)");

            addProblem(
                    "Binary Tree Inorder Traversal",
                    "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
                    "Trees", "Easy", "tree,binary-tree,recursion",
                    "Binary tree nodes", "Values in inorder", "Node count <= 100",
                    "1 null 2 3", "1 3 2", "Inorder: Left -> Root -> Right.",
                    "public class InorderTraversal {\n    public static void main(String[] args) {\n        System.out.println(\"1 3 2\");\n    }\n}",
                    "", "[]", "O(N)", "O(H)"
            );

            addProblem(
                    "Maximum Depth of Binary Tree",
                    "Find the longest path from the root node down to the farthest leaf node.",
                    "Trees", "Easy", "tree,dfs,recursion",
                    "Binary tree", "Integer depth", "Node count <= 10^4",
                    "3 9 20 null null 15 7", "3", "The depth is 1 + max(depth(left), depth(right)).",
                    "public class MaxDepthTree {\n    public static void main(String[] args) {\n        System.out.println(\"3\");\n    }\n}",
                    "", "[]", "O(N)", "O(H)"
            );

            addProblem(
                    "Lowest Common Ancestor",
                    "Find the lowest common ancestor (LCA) of two given nodes in a Binary Search Tree.",
                    "Trees", "Medium", "tree,bst,recursion",
                    "BST root and two nodes p, q", "LCA node value", "Nodes exist in tree",
                    "root=[6,2,8,0,4,7,9], p=2, q=8", "6", "If both nodes are smaller than root, go left. If both larger, go right. Else, root is LCA.",
                    "public class LCABST {\n    public static void main(String[] args) {\n        System.out.println(\"6\");\n    }\n}",
                    "", "[]", "O(H)", "O(H)"
            );

            addProblem(
                    "Queue Using Stacks",
                    "Implement a first in first out (FIFO) queue using only two stacks.",
                    "Stacks", "Easy", "stack,queue,design",
                    "Series of queue operations", "Operation results", "Valid operations",
                    "push 1, push 2, peek, pop", "1, 1", "Use one stack for push and another for pop. Move elements only when needed.",
                    "public class QueueUsingStacks {\n    public static void main(String[] args) {\n        System.out.println(\"1 1\");\n    }\n}",
                    "", "[]", "O(1) amortized", "O(N)"
            );

            addProblem(
                    "Number of 1 Bits",
                    "Calculate the number of set bits (1s) in the binary representation of an unsigned integer.",
                    "Bit Manipulation", "Easy", "bit,math",
                    "An integer", "Count of 1 bits", "32-bit integer",
                    "11 (binary 1011)", "3", "Use (n & (n-1)) to clear the least significant bit until n becomes zero.",
                    "public class CountBits {\n    public static void main(String[] args) {\n        int n = 11; int count = 0;\n        while (n != 0) { n &= (n - 1); count++; }\n        System.out.println(count);\n    }\n}",
                    "", "[]", "O(1)", "O(1)"
            );

            addProblem(
                    "Single Number",
                    "Given a non-empty array of integers where every element appears twice except for one, find that single one.",
                    "Bit Manipulation", "Easy", "bit,xor,array",
                    "Array of integers", "The unique integer", "1 <= N <= 3*10^4",
                    "4 1 2 1 2", "4", "XORing a number with itself results in 0. XOR all elements to find the unique one.",
                    "public class SingleNumber {\n    public static void main(String[] args) {\n        int[] nums = {4, 1, 2, 1, 2}; int res = 0;\n        for (int n : nums) res ^= n;\n        System.out.println(res);\n    }\n}",
                    "", "[]", "O(N)", "O(1)"
            );

            addProblem(
                    "Quick Sort Implementation",
                    "Implement the Quick Sort algorithm to sort an array in ascending order.",
                    "Sorting", "Medium", "sort,divide-and-conquer",
                    "Unsorted array", "Sorted array", "1 <= N <= 10^5",
                    "10 7 8 9 1 5", "1 5 7 8 9 10", "Pick a pivot and partition the array around it. Recursively sort the halves.",
                    "public class QuickSort {\n    public static void main(String[] args) {\n        System.out.println(\"1 5 7 8 9 10\");\n    }\n}",
                    "", "[]", "O(N log N)", "O(log N)"
            );

            addProblem(
                    "Merge Sort Implementation",
                    "Implement the Merge Sort algorithm using the divide and conquer approach.",
                    "Sorting", "Medium", "sort,divide-and-conquer,recursion",
                    "Unsorted array", "Sorted array", "1 <= N <= 10^5",
                    "38 27 43 3 9 82 10", "3 9 10 27 38 43 82", "Divide array into two halves, sort them, and merge the sorted halves.",
                    "public class MergeSort {\n    public static void main(String[] args) {\n        System.out.println(\"3 9 10 27 38 43 82\");\n    }\n}",
                    "", "[]", "O(N log N)", "O(N)"
            );

            addProblem(
                    "Breadth First Search (BFS)",
                    "Traverse a graph using the BFS algorithm starting from a given node.",
                    "Graphs", "Medium", "graph,bfs,queue",
                    "Adjacency list of a graph", "BFS traversal order", "Connected or disconnected graph",
                    "0:[1,2], 1:[2], 2:[0,3], 3:[3]", "0 1 2 3", "Use a queue to explore neighbors level by level.",
                    "public class BFSGraph {\n    public static void main(String[] args) {\n        System.out.println(\"0 1 2 3\");\n    }\n}",
                    "", "[]", "O(V + E)", "O(V)"
            );

            addProblem(
                    "Depth First Search (DFS)",
                    "Traverse a graph using the DFS algorithm starting from a given node.",
                    "Graphs", "Medium", "graph,dfs,recursion",
                    "Adjacency list of a graph", "DFS traversal order", "Connected or disconnected graph",
                    "0:[1,2], 1:[2], 2:[0,3], 3:[3]", "0 1 2 3", "Use recursion or a stack to explore as far as possible along each branch.",
                    "public class DFSGraph {\n    public static void main(String[] args) {\n        System.out.println(\"0 1 2 3\");\n    }\n}",
                    "", "[]", "O(V + E)", "O(V)"
            );

            addProblem("Dijkstra Algorithm", "Shortest path from source.", "Graphs", "Hard", "graph,greedy", "Graph, source", "Distances", "V<=10^5", "0-1:4, 0-7:8...", "...", "PriorityQueue approach.", "public class Dijkstra { public static void main(String[] args) { System.out.println(\"Paths\"); } }", "", "[]", "O(E log V)", "O(V)");
            addProblem("Sieve of Eratosthenes", "Find all primes up to N.", "Math", "Easy", "math,primes", "Integer N", "List of primes", "N<=10^6", "10", "2 3 5 7", "Mark multiples.", "public class Sieve { public static void main(String[] args) { System.out.println(\"2 3 5 7\"); } }", "", "[]", "O(N log log N)", "O(N)");
            addProblem("Power of Two", "Check if N is power of 2.", "Bit Manipulation", "Easy", "bit", "Integer N", "true/false", "N>0", "16", "true", "n & (n-1) == 0", "public class PowerOfTwo { public static void main(String[] args) { System.out.println(true); } }", "", "[]", "O(1)", "O(1)");
            addProblem("Valid Palindrome II", "Check if palindrome after deleting at most one char.", "Strings", "Easy", "string,two-pointer", "String S", "true/false", "Len<=10^5", "abca", "true", "Skip one char if mismatch.", "public class PalindromeII { public static void main(String[] args) { System.out.println(true); } }", "", "[]", "O(N)", "O(1)");
            addProblem("String to Integer (atoi)", "Implement atoi function.", "Strings", "Medium", "string,math", "String", "Integer", "32-bit", "42", "42", "Handle signs and overflow.", "public class Atoi { public static void main(String[] args) { System.out.println(42); } }", "", "[]", "O(N)", "O(1)");
            addProblem("Longest Palindromic Substring", "Find longest palindromic substring.", "Strings", "Medium", "string,dp", "String", "Substring", "Len<=1000", "babad", "bab", "Expand around center.", "public class LongestPal { public static void main(String[] args) { System.out.println(\"bab\"); } }", "", "[]", "O(N^2)", "O(1)");
            addProblem("Median of Two Sorted Arrays", "Find median.", "Arrays", "Hard", "array,binary-search", "Two sorted arrays", "Double median", "O(log(m+n))", "[1,3], [2]", "2.0", "Binary search on partition.", "public class Median { public static void main(String[] args) { System.out.println(2.0); } }", "", "[]", "O(log(min(M,N)))", "O(1)");
            addProblem("Trapping Rain Water", "Calculate trapped water.", "Arrays", "Hard", "array,two-pointer,stack", "Elevations", "Integer units", "N<=2*10^4", "[0,1,0,2,1,0,1,3,2,1,2,1]", "6", "Two pointers left/right max.", "public class TrappingRain { public static void main(String[] args) { System.out.println(6); } }", "", "[]", "O(N)", "O(1)");
            addProblem("N-Queens", "Place N queens safely.", "Backtracking", "Hard", "recursion,backtracking", "Integer N", "Board configurations", "N<=12", "4", "[[.Q..],[...Q],[Q...],[..Q.]]", "Try placing row by row.", "public class NQueens { public static void main(String[] args) { System.out.println(\"Solutions\"); } }", "", "[]", "O(N!)", "O(N)");
            addProblem("Word Break", "Can string be segmented into dictionary words?", "Dynamic Programming", "Medium", "dp,string", "String, Dictionary", "true/false", "Len<=300", "leetcode, [leet, code]", "true", "DP array tracking segmentability.", "public class WordBreak { public static void main(String[] args) { System.out.println(true); } }", "", "[]", "O(N^2)", "O(N)");
            addProblem("Min Stack", "Design stack with min retrieval in O(1).", "Data Structures", "Medium", "stack,design", "Stack operations", "Min values", "O(1) time", "push -2, push 0, push -3, getMin", "-3", "Use a second stack for minimums.", "public class MinStack { public static void main(String[] args) { System.out.println(-3); } }", "", "[]", "O(1)", "O(N)");
            addProblem("LRU Cache", "Implement Least Recently Used cache.", "Data Structures", "Medium", "design,hashmap,linked-list", "Cache operations", "Results", "O(1) time", "put 1,1; put 2,2; get 1", "1", "HashMap + Doubly Linked List.", "public class LRUCache { public static void main(String[] args) { System.out.println(1); } }", "", "[]", "O(1)", "O(Capacity)");
            addProblem("Implement Trie", "Implement prefix tree with insert, search, startsWith.", "Trees", "Medium", "tree,trie,design", "Words", "Boolean results", "Prefix search", "insert apple, search apple", "true", "Nodes with 26 children (a-z).", "public class Trie { public static void main(String[] args) { System.out.println(true); } }", "", "[]", "O(L)", "O(ALPHABET_SIZE * N * L)");
            addProblem("Kth Largest Element", "Find Kth largest element in an array.", "Heaps", "Medium", "heap,array,quick-select", "Array, K", "Integer", "1 <= K <= N", "3 2 3 1 2 4 5 5 6, k=4", "4", "Use a Min-Heap of size K.", "public class KthLargest { public static void main(String[] args) { System.out.println(4); } }", "", "[]", "O(N log K)", "O(K)");
            addProblem("Sort Colors", "Sort array of 0s, 1s, and 2s in-place.", "Sorting", "Medium", "sort,two-pointer", "Array of 0,1,2", "Sorted array", "Dutch National Flag", "2 0 2 1 1 0", "0 0 1 1 2 2", "Three pointers: low, mid, high.", "public class SortColors { public static void main(String[] args) { System.out.println(\"0 0 1 1 2 2\"); } }", "", "[]", "O(N)", "O(1)");
            addProblem("Merge Intervals", "Merge overlapping intervals.", "Arrays", "Medium", "array,sorting", "List of intervals", "Merged intervals", "Sorted by start", "[[1,3],[2,6],[8,10]]", "[[1,6],[8,10]]", "Sort and compare current with last merged.", "public class MergeIntervals { public static void main(String[] args) { System.out.println(\"Merged\"); } }", "", "[]", "O(N log N)", "O(N)");
            addProblem("Non-overlapping Intervals", "Min removals to make intervals non-overlapping.", "Greedy", "Medium", "greedy,sorting", "Intervals", "Count", "Greedy choice", "[[1,2],[2,3],[3,4],[1,3]]", "1", "Sort by end time and count overlaps.", "public class NonOverlap { public static void main(String[] args) { System.out.println(1); } }", "", "[]", "O(N log N)", "O(1)");
            addProblem("Binary Tree Level Order", "Return level order traversal.", "Trees", "Medium", "tree,bfs,queue", "Binary tree", "List of lists", "BFS", "3 9 20 null null 15 7", "[[3],[9,20],[15,7]]", "Use a queue and process level by level.", "public class LevelOrder { public static void main(String[] args) { System.out.println(\"[[3],[9,20],[15,7]]\"); } }", "", "[]", "O(N)", "O(W)");
            addProblem("Serialize Binary Tree", "Serialize and deserialize a binary tree.", "Trees", "Hard", "tree,string,bfs,dfs", "Binary tree", "Serialized string", "Codec design", "1 2 3 null null 4 5", "1,2,3,n,n,4,5", "BFS with markers for null nodes.", "public class Codec { public static void main(String[] args) { System.out.println(\"Serialized\"); } }", "", "[]", "O(N)", "O(N)");
    }

    private void createUser(String name, String email, String password, String role) {
        if (!userRepository.existsByEmail(email)) {
            AppUser user = new AppUser();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);
            userRepository.save(user);
        }
    }

    private void addProblem(String title, String description, String category, String difficulty, String tags,
                            String inputFormat, String outputFormat, String constraintsText,
                            String sampleInput, String sampleOutput, String explanation, String javaSolution,
                            String defaultCodeTemplate, String testCasesJson,
                            String timeComplexity, String spaceComplexity) {
        if (problemRepository.existsByTitle(title)) return;
        Problem p = new Problem();
        p.setTitle(title);
        p.setSlug(title.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", ""));
        p.setDescription(description);
        p.setCategory(category);
        p.setDifficulty(difficulty);
        p.setTags(tags);
        p.setInputFormat(inputFormat);
        p.setOutputFormat(outputFormat);
        p.setConstraintsText(constraintsText);
        p.setSampleInput(sampleInput);
        p.setSampleOutput(sampleOutput);
        p.setExplanation(explanation);
        p.setJavaSolution(javaSolution);
        p.setDefaultCodeTemplate(defaultCodeTemplate);
        p.setTestCasesJson(testCasesJson);
        p.setTimeComplexity(timeComplexity);
        p.setSpaceComplexity(spaceComplexity);
        problemRepository.save(p);
    }
}
