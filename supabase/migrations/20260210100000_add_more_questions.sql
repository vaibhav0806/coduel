-- Add more questions across all languages and topics

-- =====================
-- PYTHON - BASICS (Difficulty 1)
-- =====================
INSERT INTO questions (language, difficulty, category, internal_topic, code_snippet, question_text, options, correct_answer, explanation) VALUES
('python', 1, 'arithmetic', 'basics', E'x = 15\ny = 4\nprint(x % y)', 'What''s the output?', '["3", "4", "3.75", "Error"]'::jsonb, 0, 'The modulo operator % returns the remainder. 15 % 4 = 3.'),
('python', 1, 'arithmetic', 'basics', E'print(10 / 4)', 'What''s the output?', '["2", "2.5", "2.0", "Error"]'::jsonb, 1, 'The / operator always returns a float in Python 3. 10 / 4 = 2.5.'),
('python', 1, 'types', 'basics', E'x = True\nprint(type(x).__name__)', 'What''s the output?', '["bool", "True", "int", "boolean"]'::jsonb, 0, 'True is a boolean value, so type(x) is bool.'),
('python', 1, 'variables', 'basics', E'x = 5\nx *= 2\nprint(x)', 'What''s the output?', '["5", "10", "7", "Error"]'::jsonb, 1, '*= multiplies and assigns. 5 * 2 = 10.'),
('python', 1, 'booleans', 'basics', E'print(True and False)', 'What''s the output?', '["True", "False", "None", "Error"]'::jsonb, 1, 'and returns True only if both operands are True.'),
('python', 1, 'booleans', 'basics', E'print(True or False)', 'What''s the output?', '["True", "False", "None", "Error"]'::jsonb, 0, 'or returns True if at least one operand is True.'),
('python', 1, 'types', 'basics', E'x = None\nprint(type(x).__name__)', 'What''s the output?', '["None", "NoneType", "null", "Error"]'::jsonb, 1, 'None has type NoneType in Python.'),
('python', 1, 'arithmetic', 'basics', E'print(5 + 3 * 2)', 'What''s the output?', '["16", "11", "13", "Error"]'::jsonb, 1, 'Multiplication has higher precedence. 3 * 2 = 6, then 5 + 6 = 11.'),
('python', 1, 'variables', 'basics', E'x = 10\ny = x\nx = 20\nprint(y)', 'What''s the output?', '["10", "20", "Error", "None"]'::jsonb, 0, 'y gets the value 10 when assigned. Changing x later doesn''t affect y.'),
('python', 1, 'booleans', 'basics', E'print(1 == 1 and 2 == 2)', 'What''s the output?', '["True", "False", "1", "Error"]'::jsonb, 0, 'Both comparisons are True, so and returns True.'),

-- =====================
-- PYTHON - STRINGS (Difficulty 1-2)
-- =====================
('python', 1, 'strings', 'strings', E'x = "hello"\nprint(len(x))', 'What''s the output?', '["4", "5", "6", "Error"]'::jsonb, 1, 'len() returns the number of characters. "hello" has 5 characters.'),
('python', 1, 'strings', 'strings', E'x = "Python"\nprint(x[0])', 'What''s the output?', '["P", "y", "p", "Error"]'::jsonb, 0, 'String indexing starts at 0. x[0] is "P".'),
('python', 1, 'strings', 'strings', E'x = "abc"\ny = "def"\nprint(x + y)', 'What''s the output?', '["abcdef", "abc def", "Error", "abcd"]'::jsonb, 0, '+ concatenates strings. "abc" + "def" = "abcdef".'),
('python', 2, 'strings', 'strings', E'x = "hello"\nprint(x.capitalize())', 'What''s the output?', '["Hello", "HELLO", "hello", "hELLO"]'::jsonb, 0, 'capitalize() makes the first character uppercase and the rest lowercase.'),
('python', 2, 'strings', 'strings', E'x = "hello world"\nprint(x.title())', 'What''s the output?', '["Hello World", "Hello world", "HELLO WORLD", "Error"]'::jsonb, 0, 'title() capitalizes the first letter of each word.'),
('python', 2, 'strings', 'strings', E'x = "   hello   "\nprint(x.lstrip())', 'What''s the output?', '["hello   ", "   hello", "hello", "Error"]'::jsonb, 0, 'lstrip() removes leading whitespace only.'),
('python', 2, 'strings', 'strings', E'x = "banana"\nprint(x.startswith("ban"))', 'What''s the output?', '["True", "False", "ban", "Error"]'::jsonb, 0, 'startswith() returns True if the string begins with the specified prefix.'),
('python', 2, 'strings', 'strings', E'x = "hello"\nprint(x.index("l"))', 'What''s the output?', '["2", "3", "1", "Error"]'::jsonb, 0, 'index() returns the first occurrence. First "l" is at index 2.'),

-- =====================
-- PYTHON - CONTROL FLOW (Difficulty 2)
-- =====================
('python', 2, 'loops', 'control-flow', E'x = 0\nwhile x < 3:\n    x += 1\nprint(x)', 'What''s the output?', '["2", "3", "4", "Error"]'::jsonb, 1, 'Loop runs while x < 3. After 3 iterations, x becomes 3 and loop exits.'),
('python', 2, 'loops', 'control-flow', E'for i in range(3, 6):\n    print(i, end=" ")', 'What''s the output?', '["3 4 5 ", "3 4 5 6 ", "0 1 2 ", "Error"]'::jsonb, 0, 'range(3, 6) produces 3, 4, 5.'),
('python', 2, 'loops', 'control-flow', E'for i in range(5):\n    if i == 3:\n        break\n    print(i, end=" ")', 'What''s the output?', '["0 1 2 ", "0 1 2 3 ", "0 1 2 3 4 ", "Error"]'::jsonb, 0, 'break exits the loop when i == 3, so only 0, 1, 2 are printed.'),
('python', 2, 'loops', 'control-flow', E'for i in range(5):\n    if i == 2:\n        continue\n    print(i, end=" ")', 'What''s the output?', '["0 1 3 4 ", "0 1 2 3 4 ", "0 1 ", "Error"]'::jsonb, 0, 'continue skips the rest of the loop body for i == 2.'),
('python', 2, 'comprehensions', 'control-flow', E'x = [i * 2 for i in range(4)]\nprint(x)', 'What''s the output?', '["[0, 2, 4, 6]", "[2, 4, 6, 8]", "[0, 1, 2, 3]", "Error"]'::jsonb, 0, 'List comprehension: 0*2=0, 1*2=2, 2*2=4, 3*2=6.'),
('python', 2, 'comprehensions', 'control-flow', E'x = [c.upper() for c in "abc"]\nprint(x)', 'What''s the output?', '["[\"A\", \"B\", \"C\"]", "[\"a\", \"b\", \"c\"]", "ABC", "Error"]'::jsonb, 0, 'List comprehension iterates over each character and uppercases it.'),

-- =====================
-- PYTHON - COLLECTIONS (Difficulty 2)
-- =====================
('python', 2, 'lists', 'collections', E'x = [1, 2, 3]\nx.append(4)\nprint(x)', 'What''s the output?', '["[1, 2, 3, 4]", "[4, 1, 2, 3]", "[1, 2, 3]", "Error"]'::jsonb, 0, 'append() adds an element to the end of the list.'),
('python', 2, 'lists', 'collections', E'x = [1, 2, 3]\nx.insert(1, 10)\nprint(x)', 'What''s the output?', '["[1, 10, 2, 3]", "[10, 1, 2, 3]", "[1, 2, 10, 3]", "Error"]'::jsonb, 0, 'insert(1, 10) inserts 10 at index 1.'),
('python', 2, 'lists', 'collections', E'x = [3, 1, 4, 1, 5]\nprint(x.count(1))', 'What''s the output?', '["1", "2", "3", "Error"]'::jsonb, 1, 'count() returns the number of occurrences. 1 appears twice.'),
('python', 2, 'lists', 'collections', E'x = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)', 'What''s the output?', '["[1, 2, 3]", "[1, 2, 3, 4]", "[4]", "Error"]'::jsonb, 1, 'y is a reference to the same list as x. Modifying y also modifies x.'),
('python', 2, 'dictionaries', 'collections', E'x = {"a": 1, "b": 2}\nprint(x.get("c", 0))', 'What''s the output?', '["None", "0", "Error", "c"]'::jsonb, 1, 'get() returns the default value (0) if the key doesn''t exist.'),
('python', 2, 'dictionaries', 'collections', E'x = {"a": 1, "b": 2}\nprint("a" in x)', 'What''s the output?', '["True", "False", "1", "Error"]'::jsonb, 0, 'in checks if a key exists in the dictionary.'),
('python', 2, 'dictionaries', 'collections', E'x = {"a": 1}\nx.update({"b": 2})\nprint(x)', 'What''s the output?', $$["{'a': 1, 'b': 2}", "{'a': 1}", "{'b': 2}", "Error"]$$::jsonb, 0, 'update() merges another dictionary into the current one.'),
('python', 2, 'sets', 'collections', E'x = {1, 2, 3}\nx.add(2)\nprint(len(x))', 'What''s the output?', '["3", "4", "2", "Error"]'::jsonb, 0, 'Sets don''t allow duplicates. Adding 2 again has no effect.'),
('python', 2, 'tuples', 'collections', E'x = (1, 2, 3)\nprint(x.count(2))', 'What''s the output?', '["1", "2", "0", "Error"]'::jsonb, 0, 'count() works on tuples too. 2 appears once.'),

-- =====================
-- PYTHON - FUNCTIONS (Difficulty 2-3)
-- =====================
('python', 2, 'functions', 'functions', E'def foo():\n    return 5\nprint(foo() + 10)', 'What''s the output?', '["15", "5", "510", "Error"]'::jsonb, 0, 'foo() returns 5, then 5 + 10 = 15.'),
('python', 2, 'functions', 'functions', E'def foo(x, y=10):\n    return x + y\nprint(foo(5))', 'What''s the output?', '["15", "5", "10", "Error"]'::jsonb, 0, 'y has a default value of 10. 5 + 10 = 15.'),
('python', 3, 'functions', 'functions', E'def foo(x):\n    x = 10\nx = 5\nfoo(x)\nprint(x)', 'What''s the output?', '["5", "10", "None", "Error"]'::jsonb, 0, 'Integers are immutable. Reassigning x inside foo() doesn''t affect the outer x.'),
('python', 3, 'lambda', 'functions', E'f = lambda x, y: x * y\nprint(f(3, 4))', 'What''s the output?', '["12", "7", "34", "Error"]'::jsonb, 0, 'Lambda function multiplies x and y. 3 * 4 = 12.'),
('python', 3, 'lambda', 'functions', E'nums = [1, 2, 3, 4]\nresult = list(filter(lambda x: x % 2 == 0, nums))\nprint(result)', 'What''s the output?', '["[2, 4]", "[1, 3]", "[1, 2, 3, 4]", "Error"]'::jsonb, 0, 'filter() keeps elements where the lambda returns True (even numbers).'),
('python', 3, 'lambda', 'functions', E'nums = [1, 2, 3]\nresult = list(map(lambda x: x ** 2, nums))\nprint(result)', 'What''s the output?', '["[1, 4, 9]", "[2, 4, 6]", "[1, 2, 3]", "Error"]'::jsonb, 0, 'map() applies the lambda to each element. 1, 4, 9 are the squares.'),
('python', 3, 'scope', 'functions', E'x = 10\ndef foo():\n    x = 20\n    return x\nprint(foo(), x)', 'What''s the output?', '["20 10", "20 20", "10 10", "Error"]'::jsonb, 0, 'The inner x shadows the outer x. foo() returns 20, outer x is still 10.'),

-- =====================
-- PYTHON - OOP (Difficulty 3)
-- =====================
('python', 3, 'classes', 'oop', E'class Dog:\n    def __init__(self, name):\n        self.name = name\nd = Dog("Buddy")\nprint(d.name)', 'What''s the output?', '["Buddy", "name", "Dog", "Error"]'::jsonb, 0, '__init__ sets self.name to "Buddy".'),
('python', 3, 'classes', 'oop', E'class Counter:\n    def __init__(self):\n        self.count = 0\n    def inc(self):\n        self.count += 1\nc = Counter()\nc.inc()\nc.inc()\nprint(c.count)', 'What''s the output?', '["2", "1", "0", "Error"]'::jsonb, 0, 'inc() is called twice, incrementing count to 2.'),
('python', 3, 'classes', 'oop', E'class A:\n    x = 10\nclass B(A):\n    pass\nprint(B.x)', 'What''s the output?', '["10", "Error", "None", "0"]'::jsonb, 0, 'B inherits class variable x from A.'),
('python', 3, 'classes', 'oop', E'class A:\n    def greet(self):\n        return "A"\nclass B(A):\n    def greet(self):\n        return "B"\nprint(B().greet())', 'What''s the output?', '["B", "A", "AB", "Error"]'::jsonb, 0, 'B overrides the greet method from A.'),

-- =====================
-- PYTHON - ERRORS (Difficulty 3)
-- =====================
('python', 3, 'exceptions', 'errors', E'try:\n    x = int("abc")\nexcept ValueError:\n    x = 0\nprint(x)', 'What''s the output?', '["0", "abc", "Error", "None"]'::jsonb, 0, 'int("abc") raises ValueError, which is caught and x is set to 0.'),
('python', 3, 'exceptions', 'errors', E'def foo():\n    try:\n        return 1\n    except:\n        return 2\nprint(foo())', 'What''s the output?', '["1", "2", "None", "Error"]'::jsonb, 0, 'No exception is raised, so the try block returns 1.'),
('python', 3, 'exceptions', 'errors', E'try:\n    x = [1, 2][10]\nexcept IndexError:\n    print("caught")', 'What''s the output?', '["caught", "Error", "None", "10"]'::jsonb, 0, 'Accessing index 10 on a 2-element list raises IndexError.'),

-- =====================
-- PYTHON - ITERATORS (Difficulty 3-4)
-- =====================
('python', 3, 'generators', 'iterators', E'def gen():\n    yield 1\n    yield 2\n    yield 3\nprint(list(gen()))', 'What''s the output?', '["[1, 2, 3]", "[1]", "1", "Error"]'::jsonb, 0, 'list() consumes the generator, collecting all yielded values.'),
('python', 3, 'generators', 'iterators', E'def gen():\n    for i in range(3):\n        yield i * 2\ng = gen()\nprint(next(g), next(g))', 'What''s the output?', '["0 2", "0 0", "2 4", "Error"]'::jsonb, 0, 'First next() yields 0*2=0, second yields 1*2=2.'),
('python', 3, 'itertools', 'iterators', E'from itertools import repeat\nprint(list(repeat(5, 3)))', 'What''s the output?', '["[5, 5, 5]", "[5, 3]", "[3, 3, 3, 3, 3]", "Error"]'::jsonb, 0, 'repeat(5, 3) yields 5 three times.'),
('python', 3, 'itertools', 'iterators', E'from itertools import count\nc = count(10)\nprint(next(c), next(c), next(c))', 'What''s the output?', '["10 11 12", "0 1 2", "10 10 10", "Error"]'::jsonb, 0, 'count(10) starts at 10 and increments by 1 each time.'),

-- =====================
-- PYTHON - DECORATORS (Difficulty 3-4)
-- =====================
('python', 3, 'decorators', 'decorators', E'def upper(func):\n    def wrapper():\n        return func().upper()\n    return wrapper\n\n@upper\ndef greet():\n    return "hello"\n\nprint(greet())', 'What''s the output?', '["HELLO", "hello", "Hello", "Error"]'::jsonb, 0, 'The decorator wraps greet() and uppercases its result.'),
('python', 4, 'context', 'decorators', E'from contextlib import contextmanager\n\n@contextmanager\ndef tag(name):\n    print(f"<{name}>", end="")\n    yield\n    print(f"</{name}>", end="")\n\nwith tag("b"):\n    print("hi", end="")', 'What''s the output?', '["<b>hi</b>", "hi", "<b></b>hi", "Error"]'::jsonb, 0, 'contextmanager allows creating context managers with yield.'),

-- =====================
-- PYTHON - MODERN (Difficulty 3-4)
-- =====================
('python', 3, 'unpacking', 'modern', E'a, b, *c = [1, 2, 3, 4, 5]\nprint(c)', 'What''s the output?', '["[3, 4, 5]", "[1, 2]", "[2, 3, 4]", "Error"]'::jsonb, 0, '*c captures all remaining elements after a and b.'),
('python', 3, 'unpacking', 'modern', E'x = [1, 2]\ny = [3, 4]\nz = [*x, *y]\nprint(z)', 'What''s the output?', '["[1, 2, 3, 4]", "[[1, 2], [3, 4]]", "[1, 2, [3, 4]]", "Error"]'::jsonb, 0, '* unpacks the lists into a new combined list.'),
('python', 4, 'async', 'modern', E'import asyncio\n\nasync def foo():\n    await asyncio.sleep(0)\n    return "done"\n\nprint(type(foo()).__name__)', 'What''s the output?', '["coroutine", "str", "function", "Error"]'::jsonb, 0, 'Calling an async function returns a coroutine object.'),
('python', 4, 'dataclasses', 'modern', E'from dataclasses import dataclass\n\n@dataclass\nclass Point:\n    x: int\n    y: int\n\np = Point(3, 4)\nprint(p.x + p.y)', 'What''s the output?', '["7", "34", "(3, 4)", "Error"]'::jsonb, 0, 'Dataclass creates a class with x and y attributes. 3 + 4 = 7.'),
('python', 4, 'typing', 'modern', E'from typing import List\n\ndef foo(x: List[int]) -> int:\n    return sum(x)\n\nprint(foo([1, 2, 3]))', 'What''s the output?', '["6", "[1, 2, 3]", "Error", "None"]'::jsonb, 0, 'Type hints don''t affect runtime. sum([1,2,3]) = 6.'),

-- =====================
-- JAVASCRIPT - BASICS (Difficulty 1)
-- =====================
('javascript', 1, 'arithmetic', 'basics', E'console.log(10 % 3)', 'What''s the output?', '["1", "3", "3.33", "Error"]'::jsonb, 0, 'The modulo operator % returns the remainder. 10 % 3 = 1.'),
('javascript', 1, 'arithmetic', 'basics', E'console.log(5 + "3")', 'What''s the output?', '["53", "8", "Error", "NaN"]'::jsonb, 0, 'JavaScript coerces 5 to a string and concatenates: "53".'),
('javascript', 1, 'arithmetic', 'basics', E'console.log("5" - 3)', 'What''s the output?', '["2", "53", "Error", "NaN"]'::jsonb, 0, 'The - operator coerces "5" to a number: 5 - 3 = 2.'),
('javascript', 1, 'types', 'basics', E'console.log(typeof null)', 'What''s the output?', '["object", "null", "undefined", "Error"]'::jsonb, 0, 'This is a famous JavaScript quirk: typeof null returns "object".'),
('javascript', 1, 'types', 'basics', E'console.log(typeof undefined)', 'What''s the output?', '["undefined", "null", "object", "Error"]'::jsonb, 0, 'typeof undefined correctly returns "undefined".'),
('javascript', 1, 'types', 'basics', E'console.log(typeof [])', 'What''s the output?', '["object", "array", "Array", "Error"]'::jsonb, 0, 'Arrays are objects in JavaScript. typeof [] returns "object".'),
('javascript', 1, 'booleans', 'basics', E'console.log(Boolean(""))', 'What''s the output?', '["false", "true", "Error", "\"\""]'::jsonb, 0, 'Empty string is falsy in JavaScript.'),
('javascript', 1, 'booleans', 'basics', E'console.log(Boolean(0))', 'What''s the output?', '["false", "true", "0", "Error"]'::jsonb, 0, '0 is falsy in JavaScript.'),
('javascript', 1, 'booleans', 'basics', E'console.log(1 == "1")', 'What''s the output?', '["true", "false", "Error", "1"]'::jsonb, 0, '== performs type coercion. 1 equals "1" after coercion.'),
('javascript', 1, 'booleans', 'basics', E'console.log(1 === "1")', 'What''s the output?', '["false", "true", "Error", "1"]'::jsonb, 0, '=== checks type and value. Number 1 is not strictly equal to string "1".'),
('javascript', 1, 'variables', 'basics', E'let x = 5;\nx += 3;\nconsole.log(x)', 'What''s the output?', '["8", "5", "53", "Error"]'::jsonb, 0, '+= adds and assigns. 5 + 3 = 8.'),
('javascript', 1, 'variables', 'basics', E'const x = 10;\nconsole.log(x)', 'What''s the output?', '["10", "undefined", "Error", "null"]'::jsonb, 0, 'const declares a constant. x is 10.'),

-- =====================
-- JAVASCRIPT - STRINGS (Difficulty 1-2)
-- =====================
('javascript', 1, 'strings', 'strings', E'console.log("hello".length)', 'What''s the output?', '["5", "4", "6", "Error"]'::jsonb, 1, 'length property returns the number of characters.'),
('javascript', 1, 'strings', 'strings', E'console.log("hello"[0])', 'What''s the output?', '["h", "e", "hello", "Error"]'::jsonb, 0, 'String indexing starts at 0. "hello"[0] is "h".'),
('javascript', 1, 'strings', 'strings', E'console.log("hello".toUpperCase())', 'What''s the output?', '["HELLO", "Hello", "hello", "Error"]'::jsonb, 0, 'toUpperCase() converts all characters to uppercase.'),
('javascript', 2, 'strings', 'strings', E'console.log("hello world".split(" "))', 'What''s the output?', '["[\"hello\", \"world\"]", "\"hello world\"", "[\"h\",\"e\",\"l\",\"l\",\"o\"]", "Error"]'::jsonb, 0, 'split(" ") splits the string by spaces.'),
('javascript', 2, 'strings', 'strings', E'console.log("  hello  ".trim())', 'What''s the output?', '["hello", "  hello  ", "hello  ", "Error"]'::jsonb, 0, 'trim() removes leading and trailing whitespace.'),
('javascript', 2, 'strings', 'strings', E'console.log("abc".repeat(3))', 'What''s the output?', '["abcabcabc", "abc3", "abc", "Error"]'::jsonb, 0, 'repeat(3) repeats the string 3 times.'),
('javascript', 2, 'strings', 'strings', E'console.log("hello".includes("ell"))', 'What''s the output?', '["true", "false", "2", "Error"]'::jsonb, 0, 'includes() returns true if the substring is found.'),
('javascript', 2, 'strings', 'strings', E'const name = "World";\nconsole.log(`Hello, ${name}!`)', 'What''s the output?', '["Hello, World!", "Hello, ${name}!", "Hello, name!", "Error"]'::jsonb, 0, 'Template literals with ${} allow string interpolation.'),

-- =====================
-- JAVASCRIPT - COLLECTIONS (Difficulty 2)
-- =====================
('javascript', 2, 'lists', 'collections', E'const arr = [1, 2, 3];\narr.push(4);\nconsole.log(arr)', 'What''s the output?', '["[1, 2, 3, 4]", "[4, 1, 2, 3]", "[1, 2, 3]", "Error"]'::jsonb, 0, 'push() adds an element to the end of the array.'),
('javascript', 2, 'lists', 'collections', E'const arr = [1, 2, 3];\nconsole.log(arr.pop())', 'What''s the output?', '["3", "[1, 2]", "1", "Error"]'::jsonb, 0, 'pop() removes and returns the last element.'),
('javascript', 2, 'lists', 'collections', E'const arr = [3, 1, 4, 1, 5];\nconsole.log(arr.indexOf(1))', 'What''s the output?', '["1", "2", "3", "-1"]'::jsonb, 0, 'indexOf() returns the first occurrence. First 1 is at index 1.'),
('javascript', 2, 'lists', 'collections', E'const arr = [1, 2, 3];\nconsole.log(arr.reverse())', 'What''s the output?', '["[3, 2, 1]", "[1, 2, 3]", "3", "Error"]'::jsonb, 0, 'reverse() reverses the array in place.'),
('javascript', 2, 'lists', 'collections', E'const arr = [1, 2, 3];\nconst doubled = arr.map(x => x * 2);\nconsole.log(doubled)', 'What''s the output?', '["[2, 4, 6]", "[1, 2, 3]", "[1, 4, 9]", "Error"]'::jsonb, 0, 'map() applies the function to each element.'),
('javascript', 2, 'lists', 'collections', E'const arr = [1, 2, 3, 4];\nconst even = arr.filter(x => x % 2 === 0);\nconsole.log(even)', 'What''s the output?', '["[2, 4]", "[1, 3]", "[1, 2, 3, 4]", "Error"]'::jsonb, 0, 'filter() keeps elements where the callback returns true.'),
('javascript', 2, 'lists', 'collections', E'const arr = [1, 2, 3];\nconst sum = arr.reduce((a, b) => a + b, 0);\nconsole.log(sum)', 'What''s the output?', '["6", "0", "[1, 2, 3]", "Error"]'::jsonb, 0, 'reduce() accumulates values. 0 + 1 + 2 + 3 = 6.'),
('javascript', 2, 'dictionaries', 'collections', E'const obj = {a: 1, b: 2};\nconsole.log(Object.keys(obj))', 'What''s the output?', '["[\"a\", \"b\"]", "[1, 2]", "{a: 1, b: 2}", "Error"]'::jsonb, 0, 'Object.keys() returns an array of the object''s keys.'),
('javascript', 2, 'dictionaries', 'collections', E'const obj = {a: 1, b: 2};\nconsole.log(Object.values(obj))', 'What''s the output?', '["[1, 2]", "[\"a\", \"b\"]", "{a: 1, b: 2}", "Error"]'::jsonb, 0, 'Object.values() returns an array of the object''s values.'),
('javascript', 2, 'dictionaries', 'collections', E'const obj = {a: 1};\nconsole.log(obj.b ?? "default")', 'What''s the output?', '["default", "undefined", "null", "Error"]'::jsonb, 0, '?? returns the right side if left side is null or undefined.'),

-- =====================
-- JAVASCRIPT - FUNCTIONS (Difficulty 2-3)
-- =====================
('javascript', 2, 'functions', 'functions', E'function greet(name = "World") {\n  return `Hello, ${name}!`;\n}\nconsole.log(greet())', 'What''s the output?', '["Hello, World!", "Hello, undefined!", "Hello, !", "Error"]'::jsonb, 0, 'Default parameter is used when no argument is passed.'),
('javascript', 2, 'functions', 'functions', E'const add = (a, b) => a + b;\nconsole.log(add(3, 4))', 'What''s the output?', '["7", "34", "Error", "undefined"]'::jsonb, 0, 'Arrow function adds the two numbers.'),
('javascript', 3, 'functions', 'functions', E'function outer() {\n  let x = 10;\n  return function inner() {\n    return x;\n  };\n}\nconsole.log(outer()())', 'What''s the output?', '["10", "undefined", "Error", "null"]'::jsonb, 0, 'Closure: inner function has access to outer function''s variables.'),
('javascript', 3, 'scope', 'functions', E'var x = 1;\nfunction foo() {\n  console.log(x);\n  var x = 2;\n}\nfoo()', 'What''s the output?', '["undefined", "1", "2", "Error"]'::jsonb, 0, 'var is hoisted but not initialized. x is undefined before assignment.'),
('javascript', 3, 'scope', 'functions', E'let x = 1;\nif (true) {\n  let x = 2;\n  console.log(x);\n}\nconsole.log(x)', 'What''s the output?', '["2\\n1", "2\\n2", "1\\n1", "Error"]'::jsonb, 0, 'let has block scope. Inner x is 2, outer x is still 1.'),

-- =====================
-- JAVASCRIPT - OOP (Difficulty 3)
-- =====================
('javascript', 3, 'classes', 'oop', E'class Dog {\n  constructor(name) {\n    this.name = name;\n  }\n}\nconst d = new Dog("Buddy");\nconsole.log(d.name)', 'What''s the output?', '["Buddy", "undefined", "Dog", "Error"]'::jsonb, 0, 'Constructor sets this.name to "Buddy".'),
('javascript', 3, 'classes', 'oop', E'class Animal {\n  speak() { return "..."; }\n}\nclass Dog extends Animal {\n  speak() { return "Woof!"; }\n}\nconsole.log(new Dog().speak())', 'What''s the output?', '["Woof!", "...", "undefined", "Error"]'::jsonb, 0, 'Dog overrides the speak method from Animal.'),
('javascript', 3, 'classes', 'oop', E'class Counter {\n  #count = 0;\n  inc() { this.#count++; }\n  get() { return this.#count; }\n}\nconst c = new Counter();\nc.inc();\nc.inc();\nconsole.log(c.get())', 'What''s the output?', '["2", "0", "undefined", "Error"]'::jsonb, 0, 'Private field #count is incremented twice.'),

-- =====================
-- JAVASCRIPT - ERRORS (Difficulty 3)
-- =====================
('javascript', 3, 'exceptions', 'errors', E'try {\n  throw new Error("oops");\n} catch (e) {\n  console.log("caught");\n}', 'What''s the output?', '["caught", "oops", "Error", "undefined"]'::jsonb, 0, 'The thrown error is caught by the catch block.'),
('javascript', 3, 'exceptions', 'errors', E'try {\n  JSON.parse("invalid");\n} catch (e) {\n  console.log("error");\n}', 'What''s the output?', '["error", "invalid", "undefined", "null"]'::jsonb, 0, 'Invalid JSON throws a SyntaxError which is caught.'),

-- =====================
-- JAVASCRIPT - MODERN (Difficulty 3-4)
-- =====================
('javascript', 3, 'unpacking', 'modern', E'const [a, b, ...rest] = [1, 2, 3, 4, 5];\nconsole.log(rest)', 'What''s the output?', '["[3, 4, 5]", "[1, 2]", "3", "Error"]'::jsonb, 0, 'Rest operator captures remaining elements.'),
('javascript', 3, 'unpacking', 'modern', E'const {x, y} = {x: 1, y: 2, z: 3};\nconsole.log(x, y)', 'What''s the output?', '["1 2", "1 2 3", "{x: 1, y: 2}", "Error"]'::jsonb, 0, 'Object destructuring extracts x and y.'),
('javascript', 3, 'unpacking', 'modern', E'const obj1 = {a: 1};\nconst obj2 = {b: 2};\nconst merged = {...obj1, ...obj2};\nconsole.log(merged)', 'What''s the output?', $$["{a: 1, b: 2}", "{a: 1}", "{b: 2}", "Error"]$$::jsonb, 0, 'Spread operator merges objects.'),
('javascript', 4, 'async', 'modern', E'async function foo() {\n  return 42;\n}\nfoo().then(x => console.log(x))', 'What''s the output?', '["42", "Promise", "undefined", "Error"]'::jsonb, 0, 'async function returns a Promise. then() gets the resolved value.'),
('javascript', 4, 'async', 'modern', E'const p = Promise.resolve(5);\np.then(x => x * 2).then(x => console.log(x))', 'What''s the output?', '["10", "5", "Promise", "Error"]'::jsonb, 0, 'Promise chains: 5 * 2 = 10.'),

-- =====================
-- TYPESCRIPT - BASICS (Difficulty 1-2)
-- =====================
('typescript', 1, 'types', 'basics', E'let x: number = 5;\nconsole.log(typeof x)', 'What''s the output?', '["number", "Number", "int", "Error"]'::jsonb, 0, 'TypeScript types are erased at runtime. typeof returns "number".'),
('typescript', 1, 'types', 'basics', E'let x: string = "hello";\nconsole.log(x.length)', 'What''s the output?', '["5", "hello", "string", "Error"]'::jsonb, 0, 'String length is 5.'),
('typescript', 2, 'types', 'basics', E'let x: number | string = "hello";\nconsole.log(typeof x)', 'What''s the output?', '["string", "number | string", "object", "Error"]'::jsonb, 0, 'Union type allows string or number. At runtime, it''s a string.'),
('typescript', 2, 'types', 'basics', E'type Point = { x: number; y: number };\nconst p: Point = { x: 3, y: 4 };\nconsole.log(p.x + p.y)', 'What''s the output?', '["7", "34", "Point", "Error"]'::jsonb, 0, 'Type alias defines the shape. 3 + 4 = 7.'),
('typescript', 2, 'types', 'basics', E'interface User {\n  name: string;\n  age?: number;\n}\nconst u: User = { name: "Bob" };\nconsole.log(u.age)', 'What''s the output?', '["undefined", "null", "0", "Error"]'::jsonb, 0, 'Optional property age is undefined when not provided.'),

-- =====================
-- TYPESCRIPT - FUNCTIONS (Difficulty 2-3)
-- =====================
('typescript', 2, 'functions', 'functions', E'function add(a: number, b: number): number {\n  return a + b;\n}\nconsole.log(add(3, 4))', 'What''s the output?', '["7", "34", "Error", "NaN"]'::jsonb, 0, 'Function with type annotations. 3 + 4 = 7.'),
('typescript', 2, 'functions', 'functions', E'const greet = (name: string = "World"): string => {\n  return `Hello, ${name}!`;\n};\nconsole.log(greet())', 'What''s the output?', '["Hello, World!", "Hello, undefined!", "Error", "Hello, !"]'::jsonb, 0, 'Default parameter with type annotation.'),
('typescript', 3, 'functions', 'functions', E'function identity<T>(arg: T): T {\n  return arg;\n}\nconsole.log(identity<string>("hello"))', 'What''s the output?', '["hello", "T", "string", "Error"]'::jsonb, 0, 'Generic function preserves the type. Returns "hello".'),
('typescript', 3, 'functions', 'functions', E'function first<T>(arr: T[]): T | undefined {\n  return arr[0];\n}\nconsole.log(first([1, 2, 3]))', 'What''s the output?', '["1", "[1, 2, 3]", "undefined", "Error"]'::jsonb, 0, 'Generic function returns the first element.'),

-- =====================
-- TYPESCRIPT - ADVANCED TYPES (Difficulty 3-4)
-- =====================
('typescript', 3, 'types', 'modern', E'type Status = "pending" | "success" | "error";\nconst s: Status = "success";\nconsole.log(s)', 'What''s the output?', '["success", "Status", "string", "Error"]'::jsonb, 0, 'Literal type union. s is "success".'),
('typescript', 3, 'types', 'modern', E'const arr = [1, 2, 3] as const;\nconsole.log(arr.length)', 'What''s the output?', '["3", "readonly", "Error", "undefined"]'::jsonb, 0, 'as const makes a readonly tuple. length is 3.'),
('typescript', 4, 'types', 'modern', E'type Keys = keyof { a: 1; b: 2 };\nconst k: Keys = "a";\nconsole.log(k)', 'What''s the output?', '["a", "Keys", "a | b", "Error"]'::jsonb, 0, 'keyof extracts keys as a union type.'),
('typescript', 4, 'types', 'modern', E'type Partial<T> = { [P in keyof T]?: T[P] };\ntype User = { name: string; age: number };\nconst u: Partial<User> = {};\nconsole.log(Object.keys(u).length)', 'What''s the output?', '["0", "2", "undefined", "Error"]'::jsonb, 0, 'Partial makes all properties optional. Empty object is valid.'),

-- =====================
-- MORE JAVASCRIPT TRICKY QUESTIONS (Difficulty 3-4)
-- =====================
('javascript', 3, 'booleans', 'basics', E'console.log([] == false)', 'What''s the output?', '["true", "false", "Error", "undefined"]'::jsonb, 0, 'Empty array coerces to empty string, which coerces to 0, which equals false.'),
('javascript', 3, 'booleans', 'basics', E'console.log([] == ![])', 'What''s the output?', '["true", "false", "Error", "undefined"]'::jsonb, 0, '![] is false. [] coerces to 0, false coerces to 0. 0 == 0 is true.'),
('javascript', 3, 'types', 'basics', E'console.log(typeof NaN)', 'What''s the output?', '["number", "NaN", "undefined", "Error"]'::jsonb, 0, 'NaN (Not a Number) is paradoxically of type "number".'),
('javascript', 3, 'types', 'basics', E'console.log(NaN === NaN)', 'What''s the output?', '["false", "true", "NaN", "Error"]'::jsonb, 0, 'NaN is the only value in JavaScript not equal to itself.'),
('javascript', 4, 'functions', 'functions', E'const obj = {\n  x: 10,\n  getX: function() { return this.x; },\n  getXArrow: () => this.x\n};\nconsole.log(obj.getX())', 'What''s the output?', '["10", "undefined", "Error", "null"]'::jsonb, 0, 'Regular function: this refers to obj.'),
('javascript', 4, 'functions', 'functions', E'const obj = {\n  x: 10,\n  getX: function() { return this.x; },\n  getXArrow: () => this.x\n};\nconsole.log(obj.getXArrow())', 'What''s the output?', '["undefined", "10", "Error", "null"]'::jsonb, 0, 'Arrow function: this is lexically bound (global scope), so x is undefined.'),
('javascript', 4, 'async', 'modern', E'console.log("1");\nsetTimeout(() => console.log("2"), 0);\nPromise.resolve().then(() => console.log("3"));\nconsole.log("4")', 'What''s the output?', '["1\\n4\\n3\\n2", "1\\n2\\n3\\n4", "1\\n4\\n2\\n3", "1\\n3\\n4\\n2"]'::jsonb, 0, 'Microtasks (Promise) run before macrotasks (setTimeout).'),

-- =====================
-- MORE PYTHON TRICKY QUESTIONS (Difficulty 4)
-- =====================
('python', 4, 'types', 'basics', E'print(0.1 + 0.2 == 0.3)', 'What''s the output?', '["False", "True", "0.3", "Error"]'::jsonb, 0, 'Floating point precision issue. 0.1 + 0.2 is slightly more than 0.3.'),
('python', 4, 'lists', 'collections', E'x = [1, 2, 3]\ny = x\nx = x + [4]\nprint(y)', 'What''s the output?', '["[1, 2, 3]", "[1, 2, 3, 4]", "[4]", "Error"]'::jsonb, 0, 'x + [4] creates a new list. y still references the original.'),
('python', 4, 'lists', 'collections', E'x = [1, 2, 3]\ny = x\nx += [4]\nprint(y)', 'What''s the output?', '["[1, 2, 3, 4]", "[1, 2, 3]", "[4]", "Error"]'::jsonb, 0, '+= modifies the list in place. y sees the change.'),
('python', 4, 'functions', 'functions', E'def foo(x=[]):\n    x.append(1)\n    return x\nprint(foo())\nprint(foo())', 'What''s the output?', '["[1]\\n[1, 1]", "[1]\\n[1]", "[1, 1]\\n[1, 1]", "Error"]'::jsonb, 0, 'Mutable default argument is shared across calls!'),
('python', 4, 'booleans', 'basics', E'print(True + True + True)', 'What''s the output?', '["3", "True", "1", "Error"]'::jsonb, 0, 'True is treated as 1 in arithmetic. 1 + 1 + 1 = 3.'),
('python', 4, 'strings', 'strings', E'print("hello" is "hello")', 'What''s the output?', '["True", "False", "Error", "hello"]'::jsonb, 0, 'Python interns short strings. Same object identity.'),
('python', 4, 'strings', 'strings', E's = "hello"\ns2 = "".join(["h","e","l","l","o"])\nprint(s is s2)', 'What''s the output?', '["False", "True", "Error", "hello"]'::jsonb, 0, 'Dynamically created strings may not be interned.'),
('python', 4, 'dictionaries', 'collections', E'd = {}\nd[1] = "a"\nd[1.0] = "b"\nprint(d)', 'What''s the output?', $$["{1: 'b'}", "{1: 'a', 1.0: 'b'}", "{1.0: 'b'}", "Error"]$$::jsonb, 0, '1 == 1.0 and hash(1) == hash(1.0), so they are the same key.');
