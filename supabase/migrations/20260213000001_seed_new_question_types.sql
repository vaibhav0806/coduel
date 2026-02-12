-- Seed questions for new question types (Python)

-- TRUE/FALSE questions
INSERT INTO questions (language, difficulty, question_type, code_snippet, question_text, options, correct_answer, explanation) VALUES
('python', 1, 'true_false',
 'x = [1, 2, 3]
y = x
y.append(4)',
 'After running this code, x equals [1, 2, 3]',
 '["True", "False"]', '1',
 'Lists are mutable and assigned by reference. y and x point to the same list, so appending to y also modifies x. x is [1, 2, 3, 4].'),

('python', 1, 'true_false',
 'x = "hello"
y = x.upper()',
 'After running this code, x equals "HELLO"',
 '["True", "False"]', '1',
 'Strings are immutable in Python. upper() returns a new string; x remains "hello".'),

('python', 2, 'true_false',
 'a = (1, 2, 3)
b = (1, 2, 3)',
 'a is b evaluates to True',
 '["True", "False"]', '1',
 'While a == b is True (same values), a is b checks identity. Python may or may not intern tuples, so this is implementation-dependent but generally False.'),

('python', 1, 'true_false',
 'x = 10
y = 10',
 'x is y evaluates to True',
 '["True", "False"]', '0',
 'Python interns small integers (-5 to 256). Since 10 is in this range, x and y reference the same object, so x is y is True.'),

('python', 2, 'true_false',
 'def foo(x=[]):
    x.append(1)
    return x',
 'Calling foo() twice returns [1] both times',
 '["True", "False"]', '1',
 'Default mutable arguments are shared across calls. The first call returns [1], the second returns [1, 1].'),

-- SPOT THE BUG questions
('python', 2, 'spot_the_bug',
 '',
 'Which line contains the bug?',
 '["def factorial(n):", "    if n == 0:", "        return 1", "    return n * factorial(n)", "    # should be factorial(n-1)"]',
 '3',
 'Line 4 calls factorial(n) instead of factorial(n-1), causing infinite recursion. It should be return n * factorial(n - 1).'),

('python', 1, 'spot_the_bug',
 '',
 'Which line contains the bug?',
 '["numbers = [1, 2, 3, 4, 5]", "total = 0", "for i in range(len(numbers)):", "    total += numbers[i + 1]", "print(total)"]',
 '3',
 'Line 4 accesses numbers[i + 1] which causes an IndexError on the last iteration. Should be numbers[i].'),

('python', 2, 'spot_the_bug',
 '',
 'Which line contains the bug?',
 '["def is_even(n):", "    return n % 2 == 1", "print(is_even(4))"]',
 '1',
 'Line 2 checks n % 2 == 1, which returns True for odd numbers. Should be n % 2 == 0 to check for even.'),

('python', 1, 'spot_the_bug',
 '',
 'Which line contains the bug?',
 '["x = \"hello\"", "y = x.replace(\"h\", \"j\")", "print(x)  # prints jello", "# x is unchanged because strings are immutable"]',
 '2',
 'Line 3 is wrong — it claims print(x) prints "jello", but x is unchanged because strings are immutable. x still equals "hello".'),

('python', 3, 'spot_the_bug',
 '',
 'Which line contains the bug?',
 '["class Counter:", "    count = 0", "    def increment(self):", "        count += 1", "    def get(self): return self.count"]',
 '3',
 'Line 4 references count without self. It should be self.count += 1 (or Counter.count += 1 for the class variable).'),

-- MULTI-SELECT questions
('python', 2, 'multi_select',
 'x = [1, "hello", 3.14, True, None]',
 'Which of these are valid types in the list x?',
 '["int", "str", "float", "bool", "NoneType"]',
 '[0, 1, 2, 3, 4]',
 'Python lists can hold any mix of types. All five types (int, str, float, bool, NoneType) are present in x.'),

('python', 2, 'multi_select',
 'x = {"a": 1, "b": 2, "c": 3}',
 'Which of these are valid ways to access dictionary values?',
 '["x[\"a\"]", "x.get(\"b\")", "x.a", "x[\"d\"] with KeyError"]',
 '[0, 1, 3]',
 'x["a"] and x.get("b") are valid access methods. x.a is not valid for dictionaries (that''s attribute access). x["d"] raises KeyError since "d" is not a key.'),

('python', 1, 'multi_select',
 '',
 'Which of these are immutable types in Python?',
 '["str", "list", "tuple", "dict", "int"]',
 '[0, 2, 4]',
 'Strings (str), tuples, and integers (int) are immutable. Lists and dicts are mutable.'),

('python', 3, 'multi_select',
 'def foo():
    yield 1
    yield 2
    yield 3',
 'Which statements are true about foo()?',
 '["It returns a generator", "It returns a list [1,2,3]", "list(foo()) equals [1,2,3]", "It executes all yields immediately"]',
 '[0, 2]',
 'foo() returns a generator object (lazy evaluation). list(foo()) collects all yielded values into [1,2,3]. It does not return a list directly, and yields are lazy, not immediate.'),

('python', 2, 'multi_select',
 'x = {1, 2, 3, 2, 1}',
 'Which are true about x?',
 '["len(x) == 5", "len(x) == 3", "x is a set", "x preserves insertion order"]',
 '[1, 2]',
 'Sets remove duplicates, so x = {1, 2, 3} and len(x) == 3. Sets are unordered and do not preserve insertion order.'),

-- REORDER questions
('python', 2, 'reorder',
 '',
 'Put these lines in the correct order to define a function that returns the square of a number:',
 '["def square(n):", "    result = n ** 2", "    return result", "print(square(5))"]',
 '[0, 1, 2, 3]',
 'First define the function with def, then compute the result, return it, and finally call the function.'),

('python', 2, 'reorder',
 '',
 'Order these lines to read a file and print its contents:',
 '["with open(\"file.txt\") as f:", "    content = f.read()", "    print(content)", "# file is auto-closed here"]',
 '[0, 1, 2, 3]',
 'Use a with statement to open the file, read its contents, print them. The file is auto-closed when the with block exits.'),

('python', 3, 'reorder',
 '',
 'Order these lines to implement a simple class:',
 '["class Dog:", "    def __init__(self, name):", "        self.name = name", "    def bark(self):", "        print(f\"{self.name} says woof!\")"]',
 '[0, 1, 2, 3, 4]',
 'First the class definition, then __init__ with self and name parameters, assign self.name, then define the bark method, and implement it.'),

('python', 1, 'reorder',
 '',
 'Order these steps to create and use a list:',
 '["numbers = []", "numbers.append(1)", "numbers.append(2)", "print(sum(numbers))"]',
 '[0, 1, 2, 3]',
 'Create an empty list, append elements to it, then print the sum.'),

('python', 2, 'reorder',
 '',
 'Order these lines to implement a try/except block:',
 '["try:", "    result = 10 / 0", "except ZeroDivisionError:", "    print(\"Cannot divide by zero\")"]',
 '[0, 1, 2, 3]',
 'The try block wraps the risky operation, followed by the except clause that handles the specific error.'),

-- FILL IN THE BLANK questions
('python', 1, 'fill_blank',
 'def greet(name):
    return ___ + name + ___',
 'Fill in the blanks to make greet("World") return "Hello, World!"',
 '["\"Hello, \"", "\"!\"", "\"Hi \"", "\"?\""]',
 '[0, 1]',
 'The function concatenates "Hello, " + name + "!" to produce "Hello, World!".'),

('python', 2, 'fill_blank',
 'numbers = [1, 2, 3, 4, 5]
evens = [x for x in numbers if x ___ 2 ___ 0]',
 'Fill in the blanks to filter even numbers using list comprehension.',
 '["%", "==", "//", "!="]',
 '[0, 1]',
 'x % 2 == 0 checks if a number is even. The modulo operator % gives the remainder, and we check if it equals 0.'),

('python', 2, 'fill_blank',
 'def fibonacci(n):
    a, b = 0, 1
    for ___ in range(n):
        a, b = ___, a + b
    return a',
 'Fill in the blanks to complete the Fibonacci function.',
 '["_", "b", "i", "a"]',
 '[0, 1]',
 'We use _ as a throwaway loop variable (since we don''t use it), and in the swap, a gets the value of b while b gets a + b.'),

('python', 1, 'fill_blank',
 'fruits = ["apple", "banana", "cherry"]
for ___ in ___:
    print(fruit)',
 'Fill in the blanks to iterate over the fruits list.',
 '["fruit", "fruits", "i", "range(3)"]',
 '[0, 1]',
 'The for loop uses "fruit" as the iterator variable and "fruits" as the iterable to loop through.'),

('python', 3, 'fill_blank',
 'import functools

def memoize(func):
    @functools.___
    def wrapper(*args, ___):
        return func(*args, **kwargs)
    return wrapper',
 'Fill in the blanks to complete the memoize decorator.',
 '["wraps(func)", "**kwargs", "args", "lru_cache"]',
 '[0, 1]',
 'functools.wraps(func) preserves the original function''s metadata, and **kwargs captures keyword arguments.');

-- JavaScript questions for variety

-- TRUE/FALSE (JS)
INSERT INTO questions (language, difficulty, question_type, code_snippet, question_text, options, correct_answer, explanation) VALUES
('javascript', 1, 'true_false',
 'console.log(typeof null)',
 'typeof null returns "null"',
 '["True", "False"]', '1',
 'This is a famous JavaScript quirk. typeof null returns "object", not "null". This is a long-standing bug in JS.'),

('javascript', 2, 'true_false',
 'console.log(0.1 + 0.2 === 0.3)',
 '0.1 + 0.2 === 0.3 evaluates to true',
 '["True", "False"]', '1',
 'Due to floating point precision, 0.1 + 0.2 equals 0.30000000000000004, not exactly 0.3.'),

-- SPOT THE BUG (JS)
('javascript', 2, 'spot_the_bug',
 '',
 'Which line contains the bug?',
 '["function sum(arr) {", "  let total = 0;", "  for (let i = 0; i <= arr.length; i++) {", "    total += arr[i];", "  }", "  return total;", "}"]',
 '2',
 'Line 3 uses <= instead of <. When i equals arr.length, arr[i] is undefined, and adding undefined to a number gives NaN.'),

-- MULTI-SELECT (JS)
('javascript', 2, 'multi_select',
 '',
 'Which values are falsy in JavaScript?',
 '["0", "\"\"", "null", "\"false\"", "[]"]',
 '[0, 1, 2]',
 '0, "" (empty string), and null are falsy. "false" (non-empty string) and [] (empty array) are truthy in JavaScript.'),

-- REORDER (JS)
('javascript', 2, 'reorder',
 '',
 'Order these lines to fetch data from an API:',
 '["async function getData() {", "  const response = await fetch(url);", "  const data = await response.json();", "  return data;", "}"]',
 '[0, 1, 2, 3, 4]',
 'Define an async function, await the fetch call, parse the JSON response, return the data, and close the function.');
