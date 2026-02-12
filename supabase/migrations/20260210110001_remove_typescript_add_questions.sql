-- Remove all TypeScript questions
DELETE FROM questions WHERE language = 'typescript';

-- =====================
-- MORE PYTHON QUESTIONS
-- =====================
INSERT INTO questions (language, difficulty, category, internal_topic, code_snippet, question_text, options, correct_answer, explanation) VALUES

-- PYTHON BASICS (Difficulty 1)
('python', 1, 'arithmetic', 'basics', E'print(9 // 2)', 'What''s the output?', '["4", "4.5", "5", "Error"]'::jsonb, 0, 'Floor division // rounds down. 9 // 2 = 4.'),
('python', 1, 'arithmetic', 'basics', E'print(-7 // 2)', 'What''s the output?', '["−4", "−3", "3", "Error"]'::jsonb, 0, 'Floor division rounds towards negative infinity. -7 // 2 = -4.'),
('python', 1, 'arithmetic', 'basics', E'print(2 ** 4)', 'What''s the output?', '["8", "16", "6", "Error"]'::jsonb, 1, '** is exponentiation. 2^4 = 16.'),
('python', 1, 'types', 'basics', E'print(type([]))', 'What''s the output?', $$["<class 'list'>", "<class 'array'>", "list", "Error"]$$::jsonb, 0, 'Empty brackets create a list.'),
('python', 1, 'types', 'basics', E'print(type({}))', 'What''s the output?', $$["<class 'dict'>", "<class 'set'>", "dict", "Error"]$$::jsonb, 0, 'Empty braces create a dict, not a set.'),
('python', 1, 'types', 'basics', E'print(type(()))', 'What''s the output?', $$["<class 'tuple'>", "<class 'list'>", "tuple", "Error"]$$::jsonb, 0, 'Empty parentheses create a tuple.'),
('python', 1, 'booleans', 'basics', E'print(bool([]))', 'What''s the output?', '["False", "True", "[]", "Error"]'::jsonb, 0, 'Empty list is falsy.'),
('python', 1, 'booleans', 'basics', E'print(bool("0"))', 'What''s the output?', '["True", "False", "0", "Error"]'::jsonb, 0, 'Non-empty string is truthy, even if it contains "0".'),
('python', 1, 'booleans', 'basics', E'print(bool({}))', 'What''s the output?', '["False", "True", "{}", "Error"]'::jsonb, 0, 'Empty dict is falsy.'),
('python', 1, 'variables', 'basics', E'x, y, z = 1, 2, 3\nprint(y)', 'What''s the output?', '["2", "1", "3", "Error"]'::jsonb, 0, 'Multiple assignment: x=1, y=2, z=3.'),
('python', 1, 'variables', 'basics', E'x = y = z = 5\nprint(x + y + z)', 'What''s the output?', '["15", "5", "555", "Error"]'::jsonb, 0, 'Chained assignment sets all to 5. 5+5+5=15.'),

-- PYTHON STRINGS (Difficulty 1-2)
('python', 1, 'strings', 'strings', E'print("hello"[1:4])', 'What''s the output?', '["ell", "ello", "hel", "Error"]'::jsonb, 0, 'Slicing [1:4] gets indices 1, 2, 3: "ell".'),
('python', 1, 'strings', 'strings', E'print("hello"[1:])', 'What''s the output?', '["ello", "hell", "hello", "Error"]'::jsonb, 0, 'Slicing [1:] gets from index 1 to end: "ello".'),
('python', 1, 'strings', 'strings', E'print("hello"[:3])', 'What''s the output?', '["hel", "ell", "hello", "Error"]'::jsonb, 0, 'Slicing [:3] gets indices 0, 1, 2: "hel".'),
('python', 2, 'strings', 'strings', E'print("hello".ljust(10, "-"))', 'What''s the output?', '["hello-----", "-----hello", "hello", "Error"]'::jsonb, 0, 'ljust pads on the right with dashes.'),
('python', 2, 'strings', 'strings', E'print("hello".rjust(10, "*"))', 'What''s the output?', '["*****hello", "hello*****", "hello", "Error"]'::jsonb, 0, 'rjust pads on the left with asterisks.'),
('python', 2, 'strings', 'strings', E'print("hello".zfill(10))', 'What''s the output?', '["00000hello", "hello00000", "hello", "Error"]'::jsonb, 0, 'zfill pads with zeros on the left.'),
('python', 2, 'strings', 'strings', E'print("a,b,c".split(","))', 'What''s the output?', $$["['a', 'b', 'c']", "['a,b,c']", "a b c", "Error"]$$::jsonb, 0, 'split(",") splits on commas.'),
('python', 2, 'strings', 'strings', E'print("-".join(["a", "b", "c"]))', 'What''s the output?', '["a-b-c", "abc", "-a-b-c-", "Error"]'::jsonb, 0, 'join connects list elements with the separator.'),
('python', 2, 'strings', 'strings', E'print("HELLO".swapcase())', 'What''s the output?', '["hello", "HELLO", "Hello", "Error"]'::jsonb, 0, 'swapcase swaps upper to lower and vice versa.'),
('python', 2, 'strings', 'strings', E'print("abc123".isalnum())', 'What''s the output?', '["True", "False", "abc123", "Error"]'::jsonb, 0, 'isalnum returns True if all characters are alphanumeric.'),
('python', 2, 'strings', 'strings', E'print("abc".isalpha())', 'What''s the output?', '["True", "False", "abc", "Error"]'::jsonb, 0, 'isalpha returns True if all characters are letters.'),
('python', 2, 'strings', 'strings', E'print("123".isdigit())', 'What''s the output?', '["True", "False", "123", "Error"]'::jsonb, 0, 'isdigit returns True if all characters are digits.'),

-- PYTHON CONTROL FLOW (Difficulty 2)
('python', 2, 'loops', 'control-flow', E'for i in range(2, 10, 3):\n    print(i, end=" ")', 'What''s the output?', '["2 5 8 ", "2 5 8 11 ", "2 3 4 ", "Error"]'::jsonb, 0, 'range(2, 10, 3) gives 2, 5, 8 (step of 3).'),
('python', 2, 'loops', 'control-flow', E'for i in range(5, 0, -1):\n    print(i, end=" ")', 'What''s the output?', '["5 4 3 2 1 ", "5 4 3 2 1 0 ", "1 2 3 4 5 ", "Error"]'::jsonb, 0, 'Negative step counts down: 5, 4, 3, 2, 1.'),
('python', 2, 'loops', 'control-flow', E'x = 10\nwhile x > 0:\n    x -= 3\nprint(x)', 'What''s the output?', '["-2", "0", "1", "Error"]'::jsonb, 0, '10→7→4→1→-2. Loop exits when x=-2.'),
('python', 2, 'comprehensions', 'control-flow', E'x = [i**2 for i in range(5)]\nprint(x)', 'What''s the output?', '["[0, 1, 4, 9, 16]", "[1, 4, 9, 16, 25]", "[0, 2, 4, 6, 8]", "Error"]'::jsonb, 0, 'Squares of 0-4: 0, 1, 4, 9, 16.'),
('python', 2, 'comprehensions', 'control-flow', E'x = {i for i in [1, 2, 2, 3, 3, 3]}\nprint(len(x))', 'What''s the output?', '["3", "6", "1", "Error"]'::jsonb, 0, 'Set comprehension removes duplicates: {1, 2, 3}.'),
('python', 2, 'comprehensions', 'control-flow', E'x = [i for i in range(10) if i % 2 == 1]\nprint(x)', 'What''s the output?', '["[1, 3, 5, 7, 9]", "[0, 2, 4, 6, 8]", "[1, 2, 3, 4, 5]", "Error"]'::jsonb, 0, 'Filters odd numbers from 0-9.'),
('python', 3, 'comprehensions', 'control-flow', E'x = [[j for j in range(3)] for i in range(2)]\nprint(x)', 'What''s the output?', '["[[0, 1, 2], [0, 1, 2]]", "[[0, 1], [0, 1], [0, 1]]", "[0, 1, 2, 0, 1, 2]", "Error"]'::jsonb, 0, 'Nested comprehension creates 2x3 matrix.'),

-- PYTHON COLLECTIONS (Difficulty 2-3)
('python', 2, 'lists', 'collections', E'x = [1, 2, 3]\nx.extend([4, 5])\nprint(x)', 'What''s the output?', '["[1, 2, 3, 4, 5]", "[1, 2, 3, [4, 5]]", "[[1, 2, 3], [4, 5]]", "Error"]'::jsonb, 0, 'extend adds each element, not the list itself.'),
('python', 2, 'lists', 'collections', E'x = [1, 2, 3]\nx.remove(2)\nprint(x)', 'What''s the output?', '["[1, 3]", "[1, 2]", "[2, 3]", "Error"]'::jsonb, 0, 'remove() deletes the first occurrence of the value.'),
('python', 2, 'lists', 'collections', E'x = [1, 2, 3, 4, 5]\nprint(x[1:4])', 'What''s the output?', '["[2, 3, 4]", "[1, 2, 3]", "[2, 3, 4, 5]", "Error"]'::jsonb, 0, 'Slice [1:4] gets indices 1, 2, 3.'),
('python', 2, 'lists', 'collections', E'x = [1, 2, 3]\nprint(x * 2)', 'What''s the output?', '["[1, 2, 3, 1, 2, 3]", "[2, 4, 6]", "[[1, 2, 3], [1, 2, 3]]", "Error"]'::jsonb, 0, 'Multiplying a list repeats it.'),
('python', 2, 'lists', 'collections', E'x = [3, 1, 4, 1, 5]\nx.sort()\nprint(x)', 'What''s the output?', '["[1, 1, 3, 4, 5]", "[5, 4, 3, 1, 1]", "[3, 1, 4, 1, 5]", "Error"]'::jsonb, 0, 'sort() modifies the list in place.'),
('python', 2, 'lists', 'collections', E'x = [3, 1, 4]\nprint(min(x), max(x))', 'What''s the output?', '["1 4", "3 4", "1 3", "Error"]'::jsonb, 0, 'min is 1, max is 4.'),
('python', 2, 'dictionaries', 'collections', E'x = {"a": 1, "b": 2}\nprint(x.keys())', 'What''s the output?', $$["dict_keys(['a', 'b'])", "['a', 'b']", "('a', 'b')", "Error"]$$::jsonb, 0, 'keys() returns a dict_keys view object.'),
('python', 2, 'dictionaries', 'collections', E'x = {"a": 1, "b": 2}\nx.pop("a")\nprint(x)', 'What''s the output?', $$["{'b': 2}", "{'a': 1}", "{'a': 1, 'b': 2}", "Error"]$$::jsonb, 0, 'pop removes and returns the value for key "a".'),
('python', 2, 'dictionaries', 'collections', E'x = {"a": 1}\ny = {"b": 2}\nx.update(y)\nprint(len(x))', 'What''s the output?', '["2", "1", "3", "Error"]'::jsonb, 0, 'update merges y into x. x now has 2 keys.'),
('python', 3, 'dictionaries', 'collections', E'x = dict.fromkeys(["a", "b", "c"], 0)\nprint(x)', 'What''s the output?', $$["{'a': 0, 'b': 0, 'c': 0}", "{'a': 'b': 'c': 0}", "[('a', 0), ('b', 0)]", "Error"]$$::jsonb, 0, 'fromkeys creates a dict with given keys and same value.'),
('python', 2, 'sets', 'collections', E'x = {1, 2, 3}\ny = {2, 3, 4}\nprint(x | y)', 'What''s the output?', '["{1, 2, 3, 4}", "{2, 3}", "{1, 4}", "Error"]'::jsonb, 0, '| is set union: all elements from both sets.'),
('python', 2, 'sets', 'collections', E'x = {1, 2, 3}\ny = {2, 3, 4}\nprint(x - y)', 'What''s the output?', '["{1}", "{4}", "{1, 2, 3}", "Error"]'::jsonb, 0, '- is set difference: elements in x but not in y.'),
('python', 2, 'sets', 'collections', E'x = {1, 2, 3}\ny = {2, 3, 4}\nprint(x ^ y)', 'What''s the output?', '["{1, 4}", "{2, 3}", "{1, 2, 3, 4}", "Error"]'::jsonb, 0, '^ is symmetric difference: elements in either but not both.'),
('python', 2, 'tuples', 'collections', E'x = (1, 2, 3)\ny = (4, 5)\nprint(x + y)', 'What''s the output?', '["(1, 2, 3, 4, 5)", "((1, 2, 3), (4, 5))", "[1, 2, 3, 4, 5]", "Error"]'::jsonb, 0, '+ concatenates tuples.'),
('python', 2, 'tuples', 'collections', E'x = (1, 2) * 3\nprint(x)', 'What''s the output?', '["(1, 2, 1, 2, 1, 2)", "(3, 6)", "(1, 2, 3)", "Error"]'::jsonb, 0, 'Multiplying a tuple repeats it.'),

-- PYTHON FUNCTIONS (Difficulty 2-3)
('python', 2, 'functions', 'functions', E'def foo(a, b, c):\n    return a + b + c\nprint(foo(1, 2, 3))', 'What''s the output?', '["6", "123", "Error", "None"]'::jsonb, 0, '1 + 2 + 3 = 6.'),
('python', 3, 'functions', 'functions', E'def foo(*args):\n    return sum(args)\nprint(foo(1, 2, 3, 4))', 'What''s the output?', '["10", "[1, 2, 3, 4]", "Error", "None"]'::jsonb, 0, '*args collects arguments into a tuple. sum = 10.'),
('python', 3, 'functions', 'functions', E'def foo(**kwargs):\n    return len(kwargs)\nprint(foo(a=1, b=2, c=3))', 'What''s the output?', '["3", "6", "Error", "None"]'::jsonb, 0, '**kwargs collects keyword arguments into a dict with 3 keys.'),
('python', 3, 'lambda', 'functions', E'f = lambda *args: sum(args)\nprint(f(1, 2, 3, 4, 5))', 'What''s the output?', '["15", "[1, 2, 3, 4, 5]", "Error", "None"]'::jsonb, 0, 'Lambda with *args. sum(1,2,3,4,5) = 15.'),
('python', 3, 'lambda', 'functions', E'nums = [3, 1, 4, 1, 5]\nprint(sorted(nums, key=lambda x: -x))', 'What''s the output?', '["[5, 4, 3, 1, 1]", "[1, 1, 3, 4, 5]", "[3, 1, 4, 1, 5]", "Error"]'::jsonb, 0, 'Sorting by negative value gives descending order.'),
('python', 3, 'scope', 'functions', E'def foo():\n    global x\n    x = 100\nx = 50\nfoo()\nprint(x)', 'What''s the output?', '["100", "50", "Error", "None"]'::jsonb, 0, 'global keyword allows modifying outer x.'),
('python', 3, 'closures', 'functions', E'def make_mult(n):\n    def mult(x):\n        return x * n\n    return mult\ndouble = make_mult(2)\nprint(double(5))', 'What''s the output?', '["10", "5", "2", "Error"]'::jsonb, 0, 'Closure captures n=2. double(5) = 5 * 2 = 10.'),

-- PYTHON OOP (Difficulty 3)
('python', 3, 'classes', 'oop', E'class Dog:\n    species = "Canine"\nd1 = Dog()\nd2 = Dog()\nprint(d1.species == d2.species)', 'What''s the output?', '["True", "False", "Canine", "Error"]'::jsonb, 0, 'Class variable is shared across all instances.'),
('python', 3, 'classes', 'oop', E'class A:\n    def __init__(self):\n        self.x = 1\nclass B(A):\n    def __init__(self):\n        super().__init__()\n        self.y = 2\nb = B()\nprint(b.x, b.y)', 'What''s the output?', '["1 2", "Error", "None None", "2 1"]'::jsonb, 0, 'super().__init__() calls parent constructor.'),
('python', 3, 'classes', 'oop', E'class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    def __str__(self):\n        return f"({self.x}, {self.y})"\np = Point(3, 4)\nprint(p)', 'What''s the output?', '["(3, 4)", "Point(3, 4)", "<Point object>", "Error"]'::jsonb, 0, '__str__ defines the string representation.'),
('python', 3, 'classes', 'oop', E'class A:\n    pass\nclass B(A):\n    pass\nb = B()\nprint(isinstance(b, A))', 'What''s the output?', '["True", "False", "B", "Error"]'::jsonb, 0, 'B inherits from A, so b is an instance of A.'),
('python', 4, 'dunder', 'oop', E'class Num:\n    def __init__(self, n):\n        self.n = n\n    def __eq__(self, other):\n        return self.n == other.n\nprint(Num(5) == Num(5))', 'What''s the output?', '["True", "False", "5", "Error"]'::jsonb, 0, '__eq__ defines equality comparison.'),
('python', 4, 'dunder', 'oop', E'class Box:\n    def __init__(self, items):\n        self.items = items\n    def __len__(self):\n        return len(self.items)\nprint(len(Box([1, 2, 3])))', 'What''s the output?', '["3", "[1, 2, 3]", "Error", "None"]'::jsonb, 0, '__len__ allows using len() on the object.'),
('python', 4, 'dunder', 'oop', E'class Bag:\n    def __init__(self):\n        self.items = []\n    def __contains__(self, item):\n        return item in self.items\nb = Bag()\nb.items = [1, 2, 3]\nprint(2 in b)', 'What''s the output?', '["True", "False", "[1, 2, 3]", "Error"]'::jsonb, 0, '__contains__ defines the "in" operator.'),

-- PYTHON ERRORS (Difficulty 3)
('python', 3, 'exceptions', 'errors', E'try:\n    x = {"a": 1}["b"]\nexcept KeyError:\n    x = "missing"\nprint(x)', 'What''s the output?', '["missing", "Error", "None", "b"]'::jsonb, 0, 'Accessing missing key raises KeyError.'),
('python', 3, 'exceptions', 'errors', E'def divide(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return "inf"\nprint(divide(10, 0))', 'What''s the output?', '["inf", "Error", "0", "None"]'::jsonb, 0, 'Division by zero is caught and returns "inf".'),
('python', 3, 'exceptions', 'errors', E'try:\n    raise ValueError("oops")\nexcept ValueError as e:\n    print(e)', 'What''s the output?', '["oops", "ValueError", "Error", "None"]'::jsonb, 0, 'The error message "oops" is printed.'),
('python', 3, 'exceptions', 'errors', E'def foo():\n    try:\n        return "try"\n    finally:\n        print("finally")\nfoo()', 'What''s the output?', '["finally", "try", "tryfinally", "Error"]'::jsonb, 0, 'finally block always executes, even with return.'),

-- PYTHON ITERATORS (Difficulty 3-4)
('python', 3, 'generators', 'iterators', E'def countdown(n):\n    while n > 0:\n        yield n\n        n -= 1\nprint(list(countdown(3)))', 'What''s the output?', '["[3, 2, 1]", "[1, 2, 3]", "[3, 2, 1, 0]", "Error"]'::jsonb, 0, 'Generator yields 3, 2, 1 before n becomes 0.'),
('python', 3, 'generators', 'iterators', E'g = (x**2 for x in range(4))\nprint(list(g))', 'What''s the output?', '["[0, 1, 4, 9]", "(0, 1, 4, 9)", "[1, 4, 9, 16]", "Error"]'::jsonb, 0, 'Generator expression for squares: 0, 1, 4, 9.'),
('python', 3, 'itertools', 'iterators', E'from itertools import cycle\nc = cycle([1, 2])\nprint([next(c) for _ in range(5)])', 'What''s the output?', '["[1, 2, 1, 2, 1]", "[1, 1, 1, 1, 1]", "[1, 2, 3, 4, 5]", "Error"]'::jsonb, 0, 'cycle repeats the sequence infinitely.'),
('python', 3, 'itertools', 'iterators', E'from itertools import zip_longest\na = [1, 2, 3]\nb = [4, 5]\nprint(list(zip_longest(a, b, fillvalue=0)))', 'What''s the output?', '["[(1,4), (2,5), (3,0)]", "[(1,4), (2,5)]", "[(1,2,3), (4,5)]", "Error"]'::jsonb, 0, 'zip_longest fills missing values with fillvalue.'),
('python', 4, 'itertools', 'iterators', E'from itertools import permutations\nprint(list(permutations([1, 2], 2)))', 'What''s the output?', '["[(1,2), (2,1)]", "[(1,1), (2,2)]", "[[1,2], [2,1]]", "Error"]'::jsonb, 0, 'permutations gives all orderings.'),
('python', 4, 'itertools', 'iterators', E'from itertools import combinations\nprint(list(combinations([1, 2, 3], 2)))', 'What''s the output?', '["[(1,2), (1,3), (2,3)]", "[(1,2), (2,1), (1,3)]", "[[1,2], [2,3]]", "Error"]'::jsonb, 0, 'combinations gives unordered pairs.'),

-- PYTHON DECORATORS (Difficulty 3-4)
('python', 3, 'decorators', 'decorators', E'def log(func):\n    def wrapper(*args):\n        print("calling")\n        return func(*args)\n    return wrapper\n\n@log\ndef add(a, b):\n    return a + b\n\nprint(add(2, 3))', 'What''s the output?', '["calling\\n5", "5", "calling", "Error"]'::jsonb, 0, 'Decorator prints "calling" then returns 5.'),
('python', 4, 'decorators', 'decorators', E'def cache(func):\n    memo = {}\n    def wrapper(n):\n        if n not in memo:\n            memo[n] = func(n)\n        return memo[n]\n    return wrapper\n\n@cache\ndef fib(n):\n    if n < 2: return n\n    return fib(n-1) + fib(n-2)\n\nprint(fib(6))', 'What''s the output?', '["8", "13", "5", "Error"]'::jsonb, 0, 'Memoized fibonacci: fib(6) = 8.'),
('python', 4, 'context', 'decorators', E'class Timer:\n    def __enter__(self):\n        print("start")\n        return self\n    def __exit__(self, *args):\n        print("end")\n\nwith Timer():\n    print("middle")', 'What''s the output?', '["start\\nmiddle\\nend", "middle", "start\\nend", "Error"]'::jsonb, 0, '__enter__ runs first, __exit__ runs last.'),

-- PYTHON MODERN (Difficulty 3-4)
('python', 3, 'walrus', 'modern', E'if (n := 10) > 5:\n    print(n)', 'What''s the output?', '["10", "True", "5", "Error"]'::jsonb, 0, 'Walrus operator assigns n=10 and checks if > 5.'),
('python', 3, 'unpacking', 'modern', E'def foo(a, b, c):\n    return a + b + c\nargs = [1, 2, 3]\nprint(foo(*args))', 'What''s the output?', '["6", "[1, 2, 3]", "Error", "None"]'::jsonb, 0, '*args unpacks the list as positional arguments.'),
('python', 3, 'unpacking', 'modern', E'def foo(a, b, c):\n    return a + b + c\nkwargs = {"a": 1, "b": 2, "c": 3}\nprint(foo(**kwargs))', 'What''s the output?', '["6", "Error", "None", "abc"]'::jsonb, 0, '**kwargs unpacks the dict as keyword arguments.'),
('python', 4, 'dataclasses', 'modern', E'from dataclasses import dataclass\n\n@dataclass\nclass User:\n    name: str\n    age: int = 0\n\nprint(User("Bob"))', 'What''s the output?', $$["User(name='Bob', age=0)", "User('Bob', 0)", "Bob", "Error"]$$::jsonb, 0, 'Dataclass auto-generates __repr__.'),
('python', 4, 'typing', 'modern', E'def greet(name: str) -> str:\n    return f"Hello, {name}"\nprint(greet(123))', 'What''s the output?', '["Hello, 123", "Error", "Hello, name", "None"]'::jsonb, 0, 'Type hints are not enforced at runtime!'),

-- =====================
-- MORE JAVASCRIPT QUESTIONS
-- =====================

-- JAVASCRIPT BASICS (Difficulty 1)
('javascript', 1, 'arithmetic', 'basics', E'console.log(5 ** 2)', 'What''s the output?', '["25", "10", "7", "Error"]'::jsonb, 0, '** is exponentiation. 5^2 = 25.'),
('javascript', 1, 'arithmetic', 'basics', E'console.log(10 / 0)', 'What''s the output?', '["Infinity", "Error", "NaN", "0"]'::jsonb, 0, 'Division by zero returns Infinity in JavaScript.'),
('javascript', 1, 'arithmetic', 'basics', E'console.log(0 / 0)', 'What''s the output?', '["NaN", "0", "Infinity", "Error"]'::jsonb, 0, '0/0 is undefined, returns NaN.'),
('javascript', 1, 'types', 'basics', E'console.log(typeof function(){})', 'What''s the output?', '["function", "object", "undefined", "Error"]'::jsonb, 0, 'Functions have their own type in JavaScript.'),
('javascript', 1, 'types', 'basics', E'console.log(Array.isArray([1, 2, 3]))', 'What''s the output?', '["true", "false", "object", "Error"]'::jsonb, 0, 'Array.isArray() correctly identifies arrays.'),
('javascript', 1, 'types', 'basics', E'console.log(typeof Symbol())', 'What''s the output?', '["symbol", "object", "undefined", "Error"]'::jsonb, 0, 'Symbols are a primitive type.'),
('javascript', 1, 'booleans', 'basics', E'console.log(!!"hello")', 'What''s the output?', '["true", "false", "hello", "Error"]'::jsonb, 0, 'Double negation converts to boolean. Non-empty string is truthy.'),
('javascript', 1, 'booleans', 'basics', E'console.log(!!0)', 'What''s the output?', '["false", "true", "0", "Error"]'::jsonb, 0, 'Double negation converts to boolean. 0 is falsy.'),
('javascript', 1, 'booleans', 'basics', E'console.log(null == undefined)', 'What''s the output?', '["true", "false", "null", "Error"]'::jsonb, 0, 'null and undefined are loosely equal.'),
('javascript', 1, 'booleans', 'basics', E'console.log(null === undefined)', 'What''s the output?', '["false", "true", "null", "Error"]'::jsonb, 0, 'Strict equality: null and undefined are different types.'),
('javascript', 1, 'variables', 'basics', E'let x = 1, y = 2, z = 3;\nconsole.log(x + y + z)', 'What''s the output?', '["6", "123", "Error", "undefined"]'::jsonb, 0, 'Multiple declarations in one let statement.'),
('javascript', 1, 'variables', 'basics', E'var x = 10;\nvar x = 20;\nconsole.log(x)', 'What''s the output?', '["20", "10", "Error", "undefined"]'::jsonb, 0, 'var allows redeclaration. x becomes 20.'),

-- JAVASCRIPT STRINGS (Difficulty 1-2)
('javascript', 1, 'strings', 'strings', E'console.log("hello".charAt(1))', 'What''s the output?', '["e", "h", "l", "Error"]'::jsonb, 0, 'charAt(1) gets character at index 1.'),
('javascript', 1, 'strings', 'strings', E'console.log("hello".slice(1, 4))', 'What''s the output?', '["ell", "ello", "hel", "Error"]'::jsonb, 0, 'slice(1, 4) gets characters at indices 1, 2, 3.'),
('javascript', 1, 'strings', 'strings', E'console.log("hello".slice(-2))', 'What''s the output?', '["lo", "he", "hello", "Error"]'::jsonb, 0, 'Negative index counts from end. Last 2 chars.'),
('javascript', 2, 'strings', 'strings', E'console.log("  hello  ".trimStart())', 'What''s the output?', '["hello  ", "  hello", "hello", "Error"]'::jsonb, 0, 'trimStart removes leading whitespace only.'),
('javascript', 2, 'strings', 'strings', E'console.log("hello".padStart(10, "0"))', 'What''s the output?', '["00000hello", "hello00000", "hello", "Error"]'::jsonb, 0, 'padStart pads with zeros on the left.'),
('javascript', 2, 'strings', 'strings', E'console.log("hello".padEnd(10, "!"))', 'What''s the output?', '["hello!!!!!", "!!!!!hello", "hello", "Error"]'::jsonb, 0, 'padEnd pads with ! on the right.'),
('javascript', 2, 'strings', 'strings', E'console.log("a-b-c".split("-").join("_"))', 'What''s the output?', '["a_b_c", "a-b-c", "abc", "Error"]'::jsonb, 0, 'Split on -, join with _. Result: a_b_c.'),
('javascript', 2, 'strings', 'strings', E'console.log("hello".replace("l", "L"))', 'What''s the output?', '["heLlo", "heLLo", "HELLO", "Error"]'::jsonb, 0, 'replace only replaces first occurrence.'),
('javascript', 2, 'strings', 'strings', E'console.log("hello".replaceAll("l", "L"))', 'What''s the output?', '["heLLo", "heLlo", "HELLO", "Error"]'::jsonb, 0, 'replaceAll replaces all occurrences.'),

-- JAVASCRIPT COLLECTIONS (Difficulty 2)
('javascript', 2, 'lists', 'collections', E'const arr = [1, 2, 3];\narr.unshift(0);\nconsole.log(arr)', 'What''s the output?', '["[0, 1, 2, 3]", "[1, 2, 3, 0]", "[0]", "Error"]'::jsonb, 0, 'unshift adds to the beginning.'),
('javascript', 2, 'lists', 'collections', E'const arr = [1, 2, 3];\nconsole.log(arr.shift())', 'What''s the output?', '["1", "[2, 3]", "3", "Error"]'::jsonb, 0, 'shift removes and returns the first element.'),
('javascript', 2, 'lists', 'collections', E'const arr = [1, 2, 3, 4, 5];\nconsole.log(arr.slice(1, 4))', 'What''s the output?', '["[2, 3, 4]", "[1, 2, 3]", "[2, 3, 4, 5]", "Error"]'::jsonb, 0, 'slice(1, 4) gets elements at indices 1, 2, 3.'),
('javascript', 2, 'lists', 'collections', E'const arr = [1, 2, 3];\narr.splice(1, 1, 10, 20);\nconsole.log(arr)', 'What''s the output?', '["[1, 10, 20, 3]", "[1, 2, 3]", "[10, 20]", "Error"]'::jsonb, 0, 'splice removes 1 element at index 1, inserts 10 and 20.'),
('javascript', 2, 'lists', 'collections', E'const arr = [1, 2, 3];\nconsole.log(arr.includes(2))', 'What''s the output?', '["true", "false", "1", "Error"]'::jsonb, 0, 'includes checks if element exists.'),
('javascript', 2, 'lists', 'collections', E'const arr = [1, 2, 3];\nconsole.log(arr.find(x => x > 1))', 'What''s the output?', '["2", "[2, 3]", "1", "Error"]'::jsonb, 0, 'find returns first element matching condition.'),
('javascript', 2, 'lists', 'collections', E'const arr = [1, 2, 3];\nconsole.log(arr.every(x => x > 0))', 'What''s the output?', '["true", "false", "[1, 2, 3]", "Error"]'::jsonb, 0, 'every checks if all elements match condition.'),
('javascript', 2, 'lists', 'collections', E'const arr = [1, 2, 3];\nconsole.log(arr.some(x => x > 2))', 'What''s the output?', '["true", "false", "3", "Error"]'::jsonb, 0, 'some checks if any element matches condition.'),
('javascript', 2, 'lists', 'collections', E'console.log([1, 2].concat([3, 4]))', 'What''s the output?', '["[1, 2, 3, 4]", "[[1, 2], [3, 4]]", "[1, 2, [3, 4]]", "Error"]'::jsonb, 0, 'concat merges arrays.'),
('javascript', 2, 'lists', 'collections', E'console.log([1, [2, [3]]].flat())', 'What''s the output?', '["[1, 2, [3]]", "[1, 2, 3]", "[[1], [2], [3]]", "Error"]'::jsonb, 0, 'flat() flattens one level deep by default.'),
('javascript', 2, 'lists', 'collections', E'console.log([1, [2, [3]]].flat(2))', 'What''s the output?', '["[1, 2, 3]", "[1, 2, [3]]", "[[1, 2, 3]]", "Error"]'::jsonb, 0, 'flat(2) flattens two levels deep.'),
('javascript', 2, 'dictionaries', 'collections', E'const obj = {a: 1, b: 2};\nconsole.log(Object.entries(obj))', 'What''s the output?', $$["[['a', 1], ['b', 2]]", "['a', 'b']", "[1, 2]", "Error"]$$::jsonb, 0, 'Object.entries returns key-value pairs.'),
('javascript', 2, 'dictionaries', 'collections', E'const obj = {a: 1};\nconsole.log("a" in obj)', 'What''s the output?', '["true", "false", "1", "Error"]'::jsonb, 0, 'in operator checks if property exists.'),
('javascript', 2, 'dictionaries', 'collections', E'const obj = {a: 1};\ndelete obj.a;\nconsole.log(obj)', 'What''s the output?', '["{}",  "{a: undefined}", "{a: 1}", "Error"]'::jsonb, 0, 'delete removes the property.'),

-- JAVASCRIPT FUNCTIONS (Difficulty 2-3)
('javascript', 2, 'functions', 'functions', E'const add = (a, b) => a + b;\nconsole.log(add.length)', 'What''s the output?', '["2", "0", "undefined", "Error"]'::jsonb, 0, 'Function.length returns number of expected parameters.'),
('javascript', 2, 'functions', 'functions', E'function foo(a, b = 10) {\n  return a + b;\n}\nconsole.log(foo(5))', 'What''s the output?', '["15", "5", "NaN", "Error"]'::jsonb, 0, 'Default parameter b=10 is used.'),
('javascript', 3, 'functions', 'functions', E'function foo(...nums) {\n  return nums.reduce((a, b) => a + b);\n}\nconsole.log(foo(1, 2, 3))', 'What''s the output?', '["6", "[1, 2, 3]", "123", "Error"]'::jsonb, 0, 'Rest parameter collects all args into array.'),
('javascript', 3, 'functions', 'functions', E'const obj = {\n  name: "test",\n  getName() {\n    return this.name;\n  }\n};\nconsole.log(obj.getName())', 'What''s the output?', '["test", "undefined", "Error", "null"]'::jsonb, 0, 'this refers to obj when called as method.'),
('javascript', 3, 'scope', 'functions', E'for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}', 'What''s the output?', '["3 3 3", "0 1 2", "0 0 0", "Error"]'::jsonb, 0, 'var is function-scoped. All timeouts see i=3.'),
('javascript', 3, 'scope', 'functions', E'for (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}', 'What''s the output?', '["0 1 2", "3 3 3", "0 0 0", "Error"]'::jsonb, 0, 'let is block-scoped. Each iteration has its own i.'),
('javascript', 3, 'closures', 'functions', E'function counter() {\n  let count = 0;\n  return () => ++count;\n}\nconst inc = counter();\nconsole.log(inc(), inc(), inc())', 'What''s the output?', '["1 2 3", "1 1 1", "0 1 2", "Error"]'::jsonb, 0, 'Closure maintains count across calls.'),

-- JAVASCRIPT OOP (Difficulty 3)
('javascript', 3, 'classes', 'oop', E'class A {\n  static greet() {\n    return "hello";\n  }\n}\nconsole.log(A.greet())', 'What''s the output?', '["hello", "undefined", "Error", "null"]'::jsonb, 0, 'Static methods are called on the class, not instances.'),
('javascript', 3, 'classes', 'oop', E'class A {\n  constructor() {\n    this.x = 1;\n  }\n}\nclass B extends A {\n  constructor() {\n    super();\n    this.y = 2;\n  }\n}\nconst b = new B();\nconsole.log(b.x, b.y)', 'What''s the output?', '["1 2", "undefined 2", "Error", "1 undefined"]'::jsonb, 0, 'super() calls parent constructor.'),
('javascript', 3, 'classes', 'oop', E'class Box {\n  get value() {\n    return this._value * 2;\n  }\n  set value(v) {\n    this._value = v;\n  }\n}\nconst b = new Box();\nb.value = 5;\nconsole.log(b.value)', 'What''s the output?', '["10", "5", "undefined", "Error"]'::jsonb, 0, 'Getter returns _value * 2. 5 * 2 = 10.'),

-- JAVASCRIPT ERRORS (Difficulty 3)
('javascript', 3, 'exceptions', 'errors', E'try {\n  throw "error";\n} catch (e) {\n  console.log(typeof e);\n}', 'What''s the output?', '["string", "object", "Error", "undefined"]'::jsonb, 0, 'You can throw any value. "error" is a string.'),
('javascript', 3, 'exceptions', 'errors', E'try {\n  throw new Error("oops");\n} catch (e) {\n  console.log(e.message);\n}', 'What''s the output?', '["oops", "Error: oops", "Error", "undefined"]'::jsonb, 0, 'Error.message contains the error message.'),
('javascript', 3, 'exceptions', 'errors', E'function foo() {\n  try {\n    return "try";\n  } finally {\n    return "finally";\n  }\n}\nconsole.log(foo())', 'What''s the output?', '["finally", "try", "tryfinally", "Error"]'::jsonb, 0, 'finally block return overrides try block return.'),

-- JAVASCRIPT MODERN (Difficulty 3-4)
('javascript', 3, 'unpacking', 'modern', E'const {a, b = 10} = {a: 5};\nconsole.log(a, b)', 'What''s the output?', '["5 10", "5 undefined", "Error", "undefined 10"]'::jsonb, 0, 'Default value b=10 is used when property missing.'),
('javascript', 3, 'unpacking', 'modern', E'const [a, , b] = [1, 2, 3];\nconsole.log(a, b)', 'What''s the output?', '["1 3", "1 2", "1 undefined", "Error"]'::jsonb, 0, 'Skipping element with empty slot.'),
('javascript', 3, 'unpacking', 'modern', E'const arr = [1, 2, 3];\nconst copy = [...arr];\narr.push(4);\nconsole.log(copy.length)', 'What''s the output?', '["3", "4", "0", "Error"]'::jsonb, 0, 'Spread creates a shallow copy. Original change does not affect copy.'),
('javascript', 4, 'async', 'modern', E'async function foo() {\n  return await Promise.resolve(42);\n}\nfoo().then(console.log)', 'What''s the output?', '["42", "Promise", "undefined", "Error"]'::jsonb, 0, 'await unwraps the promise. Returns 42.'),
('javascript', 4, 'async', 'modern', E'Promise.all([Promise.resolve(1), Promise.resolve(2)]).then(console.log)', 'What''s the output?', '["[1, 2]", "1", "3", "Error"]'::jsonb, 0, 'Promise.all resolves when all promises resolve.'),
('javascript', 4, 'async', 'modern', E'Promise.race([Promise.resolve(1), Promise.resolve(2)]).then(console.log)', 'What''s the output?', '["1", "[1, 2]", "2", "Error"]'::jsonb, 0, 'Promise.race resolves with the first resolved promise.'),

-- JAVASCRIPT TRICKY (Difficulty 3-4)
('javascript', 3, 'types', 'basics', E'console.log(+"42")', 'What''s the output?', '["42", "\"42\"", "NaN", "Error"]'::jsonb, 0, 'Unary + converts string to number.'),
('javascript', 3, 'types', 'basics', E'console.log(+"hello")', 'What''s the output?', '["NaN", "0", "hello", "Error"]'::jsonb, 0, 'Cannot convert "hello" to number, returns NaN.'),
('javascript', 3, 'types', 'basics', E'console.log([] + [])', 'What''s the output?', '["\"\"", "[]", "0", "Error"]'::jsonb, 0, 'Arrays convert to empty strings, concatenation is "".'),
('javascript', 3, 'types', 'basics', E'console.log([] + {})', 'What''s the output?', '["[object Object]", "{}", "[]", "Error"]'::jsonb, 0, 'Array becomes "", object becomes "[object Object]".'),
('javascript', 4, 'types', 'basics', E'console.log({} + [])', 'What''s the output?', '["[object Object]", "0", "{}", "Error"]'::jsonb, 0, 'Object + array. {} becomes "[object Object]", [] becomes "".'),
('javascript', 4, 'booleans', 'basics', E'console.log([] ? "yes" : "no")', 'What''s the output?', '["yes", "no", "[]", "Error"]'::jsonb, 0, 'Empty array is truthy (objects are truthy).'),
('javascript', 4, 'booleans', 'basics', E'console.log("" ? "yes" : "no")', 'What''s the output?', '["no", "yes", "\"\"", "Error"]'::jsonb, 0, 'Empty string is falsy.');
