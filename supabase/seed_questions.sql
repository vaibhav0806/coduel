INSERT INTO questions (language, difficulty, category, code_snippet, question_text, options, correct_answer, explanation) VALUES
('python', 1, 'arithmetic', E'x = 10
y = 3
print(x % y)', 'What''s the output?', $$["0", "1", "3", "Error"]$$::jsonb, 1, E'The modulo operator % returns the remainder of 10 / 3, which is 1.'),
('python', 1, 'strings', E'x = "world"
print(x.upper())', 'What''s the output?', $$["World", "WORLD", "world", "Error"]$$::jsonb, 1, E'upper() converts every character in the string to uppercase.'),
('python', 1, 'types', E'x = 3
print(type(x).__name__)', 'What''s the output?', $$["float", "int", "number", "str"]$$::jsonb, 1, E'3 is an integer literal, so type(x) is int.'),
('python', 1, 'variables', E'x = 7
x += 3
print(x)', 'What''s the output?', $$["7", "3", "10", "73"]$$::jsonb, 2, E'+= adds to the existing value. 7 + 3 = 10.'),
('python', 1, 'strings', E'x = "abc"
print(x * 2)', 'What''s the output?', $$["abc2", "abcabc", "2abc", "Error"]$$::jsonb, 1, E'Multiplying a string by an integer repeats it. "abc" * 2 = "abcabc".'),
('python', 1, 'booleans', E'x = 5
print(x > 3)', 'What''s the output?', $$["True", "False", "5", "Error"]$$::jsonb, 0, E'5 is greater than 3, so the comparison returns True.'),
('python', 1, 'arithmetic', E'x = 7
y = 2
print(x // y)', 'What''s the output?', $$["3", "3.5", "4", "Error"]$$::jsonb, 0, E'// is integer (floor) division. 7 // 2 = 3.'),
('python', 1, 'strings', E'x = "hello world"
print(x.count("o"))', 'What''s the output?', $$["1", "2", "3", "0"]$$::jsonb, 1, E'count() returns the number of occurrences. "o" appears twice in "hello world".'),
('python', 1, 'types', E'x = "42"
print(type(x).__name__)', 'What''s the output?', $$["int", "str", "float", "number"]$$::jsonb, 1, E'Even though it looks like a number, "42" is wrapped in quotes so it''s a string.'),
('python', 1, 'variables', E'a = 1
b = 2
a, b = b, a
print(a, b)', 'What''s the output?', $$["1 2", "2 1", "1 1", "Error"]$$::jsonb, 1, E'Python supports tuple unpacking for swaps. a becomes 2, b becomes 1.'),
('python', 1, 'booleans', E'print(not False)', 'What''s the output?', $$["True", "False", "None", "Error"]$$::jsonb, 0, E'not inverts the boolean value. not False = True.'),
('python', 1, 'strings', E'x = "Python"
print(x[-1])', 'What''s the output?', $$["P", "n", "o", "Error"]$$::jsonb, 1, E'Negative indexing starts from the end. x[-1] is the last character "n".'),
('python', 1, 'arithmetic', E'print(2 ** 3)', 'What''s the output?', $$["6", "8", "9", "Error"]$$::jsonb, 1, E'** is the exponent operator. 2 ** 3 = 2 * 2 * 2 = 8.'),
('python', 1, 'types', E'x = 5.0
print(type(x).__name__)', 'What''s the output?', $$["int", "float", "double", "number"]$$::jsonb, 1, E'5.0 has a decimal point, making it a float.'),
('python', 1, 'strings', E'x = "hello"
print(x.replace("l", "r"))', 'What''s the output?', $$["herro", "herlo", "hello", "Error"]$$::jsonb, 0, E'replace() replaces all occurrences of "l" with "r": "herro".'),
('python', 1, 'booleans', E'x = 0
print(bool(x))', 'What''s the output?', $$["True", "False", "0", "None"]$$::jsonb, 1, E'0 is falsy in Python, so bool(0) returns False.'),
('python', 1, 'variables', E'x = "3"
y = 4
print(int(x) + y)', 'What''s the output?', $$["34", "7", "Error", "None"]$$::jsonb, 1, E'int("3") converts the string to integer 3, then 3 + 4 = 7.'),
('python', 1, 'strings', E'x = " hello "
print(x.strip())', 'What''s the output?', $$["hello", " hello", "hello ", "Error"]$$::jsonb, 0, E'strip() removes leading and trailing whitespace.'),
('python', 1, 'arithmetic', E'print(abs(-7))', 'What''s the output?', $$["7", "-7", "0", "Error"]$$::jsonb, 0, E'abs() returns the absolute value. abs(-7) = 7.'),
('python', 1, 'booleans', E'print(10 == 10.0)', 'What''s the output?', $$["True", "False", "Error", "None"]$$::jsonb, 0, E'Python considers 10 and 10.0 equal when using ==.'),
('python', 2, 'lists', E'x = [3, 1, 4, 1, 5]
print(sorted(x))', 'What''s the output?', $$["[1, 1, 3, 4, 5]", "[5, 4, 3, 1, 1]", "[3, 1, 4, 1, 5]", "Error"]$$::jsonb, 0, E'sorted() returns a new list sorted in ascending order.'),
('python', 2, 'strings', E'x = "abcdef"
print(x[::2])', 'What''s the output?', $$["ace", "bdf", "abc", "Error"]$$::jsonb, 0, E'x[::2] takes every 2nd character starting from index 0: a, c, e.'),
('python', 2, 'dictionaries', E'x = {"a": 1, "b": 2, "c": 3}
print(list(x.values()))', 'What''s the output?', $$["[1, 2, 3]", "[\"a\", \"b\", \"c\"]", "[(\"a\",1),(\"b\",2)]", "Error"]$$::jsonb, 0, E'values() returns dict values. As a list: [1, 2, 3].'),
('python', 2, 'loops', E'result = []
for i in range(5):
    if i % 2 == 0:
        result.append(i)
print(result)', 'What''s the output?', $$["[0, 2, 4]", "[1, 3]", "[0, 1, 2, 3, 4]", "[2, 4]"]$$::jsonb, 0, E'range(5) gives 0-4. Even numbers (i%2==0) are 0, 2, 4.'),
('python', 2, 'strings', E'x = "hello"
print(x.find("ll"))', 'What''s the output?', $$["2", "3", "1", "Error"]$$::jsonb, 0, E'find() returns the index of the first occurrence. "ll" starts at index 2.'),
('python', 2, 'lists', E'x = [1, 2, 3]
y = [4, 5]
print(x + y)', 'What''s the output?', $$["[1, 2, 3, 4, 5]", "[5, 7, 3]", "Error", "[1, 2, 3, [4, 5]]"]$$::jsonb, 0, E'+ concatenates two lists into a new list.'),
('python', 2, 'functions', E'def greet(name="World"):
    return f"Hello, {name}!"
print(greet())', 'What''s the output?', $$["Hello, World!", "Hello, name!", "Hello, !", "Error"]$$::jsonb, 0, E'No argument passed, so the default parameter "World" is used.'),
('python', 2, 'loops', E'x = 0
for i in range(1, 5):
    x += i
print(x)', 'What''s the output?', $$["10", "15", "6", "Error"]$$::jsonb, 0, E'range(1,5) gives 1,2,3,4. Sum = 1+2+3+4 = 10.'),
('python', 2, 'sets', E'x = {1, 2, 3}
y = {2, 3, 4}
print(x & y)', 'What''s the output?', $$["{2, 3}", "{1, 4}", "{1, 2, 3, 4}", "Error"]$$::jsonb, 0, E'& is the set intersection operator. Common elements are 2 and 3.'),
('python', 2, 'strings', E'x = "Python"
print(x[::-1])', 'What''s the output?', $$["nohtyP", "Python", "nohty", "Error"]$$::jsonb, 0, E'[::-1] reverses the string. "Python" becomes "nohtyP".'),
('python', 2, 'lists', E'x = [1, 2, 3, 4, 5]
print(x.pop(2))', 'What''s the output?', $$["3", "2", "4", "Error"]$$::jsonb, 0, E'pop(2) removes and returns the element at index 2, which is 3.'),
('python', 2, 'dictionaries', E'x = {}
x["a"] = 1
x["b"] = 2
x["a"] = 3
print(x)', 'What''s the output?', $$["{'a': 3, 'b': 2}", "{'a': 1, 'b': 2}", "{'a': 1, 'a': 3, 'b': 2}", "Error"]$$::jsonb, 0, E'Dict keys are unique. Setting x["a"] = 3 overwrites the previous value 1.'),
('python', 2, 'functions', E'def add(a, b):
    return a + b
result = add(b=3, a=7)
print(result)', 'What''s the output?', $$["10", "37", "73", "Error"]$$::jsonb, 0, E'Keyword arguments can be passed in any order. a=7, b=3, so 7+3=10.'),
('python', 2, 'lists', E'x = [[1, 2], [3, 4]]
print(x[1][0])', 'What''s the output?', $$["3", "1", "2", "4"]$$::jsonb, 0, E'x[1] is [3,4], then [0] gets the first element: 3.'),
('python', 2, 'strings', E'x = "hello world"
print(x.split())', 'What''s the output?', $$["[\"hello\", \"world\"]", "[\"h\",\"e\",\"l\",\"l\",\"o\"]", "hello world", "Error"]$$::jsonb, 0, E'split() without args splits on whitespace, returning a list of words.'),
('python', 2, 'loops', E'x = "abcd"
result = ""
for c in x:
    result = c + result
print(result)', 'What''s the output?', $$["dcba", "abcd", "abcdabcd", "Error"]$$::jsonb, 0, E'Each character is prepended to result, effectively reversing the string.'),
('python', 2, 'tuples', E'x = (1, 2, 3)
print(x[1], len(x))', 'What''s the output?', $$["2 3", "1 3", "2 2", "Error"]$$::jsonb, 0, E'x[1] is 2 (0-indexed). len(x) is 3. Output: "2 3".'),
('python', 2, 'sets', E'x = [1, 2, 2, 3, 3, 3]
print(len(set(x)))', 'What''s the output?', $$["3", "6", "4", "Error"]$$::jsonb, 0, E'set removes duplicates: {1, 2, 3}. Length is 3.'),
('python', 2, 'comprehensions', E'x = {i: i*2 for i in range(3)}
print(x)', 'What''s the output?', $$["{0: 0, 1: 2, 2: 4}", "{1: 2, 2: 4, 3: 6}", "[0, 2, 4]", "Error"]$$::jsonb, 0, E'Dict comprehension: keys 0,1,2 with values 0,2,4.'),
('python', 2, 'functions', E'def multiply(*args):
    result = 1
    for a in args:
        result *= a
    return result
print(multiply(2, 3, 4))', 'What''s the output?', $$["24", "9", "234", "Error"]$$::jsonb, 0, E'*args collects all positional args as a tuple. 2 * 3 * 4 = 24.'),
('python', 3, 'scope', E'x = 5
def foo():
    global x
    x = 10
foo()
print(x)', 'What''s the output?', $$["5", "10", "Error", "None"]$$::jsonb, 1, E'The global keyword allows foo() to modify the outer x. After foo(), x is 10.'),
('python', 3, 'closures', E'def outer():
    x = 10
    def inner():
        return x
    x = 20
    return inner
print(outer()())', 'What''s the output?', $$["10", "20", "None", "Error"]$$::jsonb, 1, E'Closures capture variables by reference, not value. When inner() runs, x is already 20.'),
('python', 3, 'lists', E'x = [1, [2, 3]]
y = x.copy()
y[1].append(4)
print(x)', 'What''s the output?', $$["[1, [2, 3]]", "[1, [2, 3, 4]]", "[1, [2, 3], 4]", "Error"]$$::jsonb, 1, E'copy() is shallow -- the inner list is still shared. Modifying y[1] also changes x[1].'),
('python', 3, 'strings', E'x = "hello"
print(x.center(11, "-"))', 'What''s the output?', $$["---hello---", "--hello---", "---hello--", "Error"]$$::jsonb, 0, E'center(11, "-") pads to width 11 with "-" on both sides.'),
('python', 3, 'functions', E'def foo(a, b, /, c, *, d):
    return a + b + c + d
print(foo(1, 2, c=3, d=4))', 'What''s the output?', $$["10", "Error", "1234", "None"]$$::jsonb, 0, E'a,b are positional-only (/), c is either, d is keyword-only (*). 1+2+3+4 = 10.'),
('python', 3, 'comprehensions', E'x = [i for i in range(10) if i % 3 == 0]
print(x)', 'What''s the output?', $$["[0, 3, 6, 9]", "[3, 6, 9]", "[0, 3, 6]", "Error"]$$::jsonb, 0, E'range(10) is 0-9. Multiples of 3: 0, 3, 6, 9.'),
('python', 3, 'classes', E'class Dog:
    count = 0
    def __init__(self):
        Dog.count += 1
a = Dog()
b = Dog()
c = Dog()
print(Dog.count)', 'What''s the output?', $$["3", "1", "0", "Error"]$$::jsonb, 0, E'count is a class variable shared across instances. Each __init__ increments it.'),
('python', 3, 'exceptions', E'try:
    x = 1 / 0
except ZeroDivisionError:
    x = 0
finally:
    x += 1
print(x)', 'What''s the output?', $$["0", "1", "Error", "None"]$$::jsonb, 1, E'The except sets x=0, then finally always runs and adds 1. Result: 1.'),
('python', 3, 'decorators', E'def double(func):
    def wrapper(*args):
        return func(*args) * 2
    return wrapper

@double
def add(a, b):
    return a + b

print(add(3, 4))', 'What''s the output?', $$["7", "14", "Error", "None"]$$::jsonb, 1, E'@double wraps add(). add(3,4) returns 7 inside wrapper, which doubles it to 14.'),
('python', 3, 'generators', E'def fib():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b
g = fib()
print([next(g) for _ in range(6)])', 'What''s the output?', $$["[0, 1, 1, 2, 3, 5]", "[1, 1, 2, 3, 5, 8]", "[0, 1, 2, 3, 5, 8]", "Error"]$$::jsonb, 0, E'Fibonacci generator: yields 0, 1, 1, 2, 3, 5.'),
('python', 3, 'dictionaries', E'x = {"a": 1, "b": 2}
y = {"b": 3, "c": 4}
z = {**x, **y}
print(z)', 'What''s the output?', $$["{'a': 1, 'b': 3, 'c': 4}", "{'a': 1, 'b': 2, 'c': 4}", "{'a': 1, 'b': 2, 'b': 3, 'c': 4}", "Error"]$$::jsonb, 0, E'Dict unpacking merges dicts. Later keys overwrite earlier ones, so "b" becomes 3.'),
('python', 3, 'itertools', E'from itertools import chain
x = [1, 2]
y = [3, 4]
print(list(chain(x, y)))', 'What''s the output?', $$["[1, 2, 3, 4]", "[[1, 2], [3, 4]]", "[1, 3, 2, 4]", "Error"]$$::jsonb, 0, E'chain() flattens multiple iterables into one: [1, 2, 3, 4].'),
('python', 3, 'lambda', E'ops = [lambda x, i=i: x + i for i in range(3)]
print([f(10) for f in ops])', 'What''s the output?', $$["[10, 11, 12]", "[12, 12, 12]", "[10, 10, 10]", "Error"]$$::jsonb, 0, E'The default argument i=i captures each loop value. Results: 10+0, 10+1, 10+2.'),
('python', 3, 'classes', E'class A:
    def __repr__(self):
        return "A"
class B(A):
    pass
print(B())', 'What''s the output?', $$["A", "B", "<B object>", "Error"]$$::jsonb, 0, E'B inherits __repr__ from A. print(B()) calls __repr__ which returns "A".'),
('python', 3, 'comprehensions', E'matrix = [[1,2],[3,4],[5,6]]
flat = [x for row in matrix for x in row]
print(flat)', 'What''s the output?', $$["[1, 2, 3, 4, 5, 6]", "[[1,2],[3,4],[5,6]]", "[1, 3, 5, 2, 4, 6]", "Error"]$$::jsonb, 0, E'Nested comprehension flattens: iterates rows, then elements within each row.'),
('python', 3, 'walrus', E'data = [1, 2, 3, 4, 5, 6]
result = [y for x in data if (y := x ** 2) > 10]
print(result)', 'What''s the output?', $$["[16, 25, 36]", "[4, 5, 6]", "[1, 4, 9, 16, 25, 36]", "Error"]$$::jsonb, 0, E'Walrus operator assigns x**2 to y. Only values >10 pass: 16, 25, 36.'),
('python', 3, 'unpacking', E'first, *middle, last = [1, 2, 3, 4, 5]
print(middle)', 'What''s the output?', $$["[2, 3, 4]", "[1, 2, 3]", "[2, 3]", "Error"]$$::jsonb, 0, E'*middle captures everything between first (1) and last (5): [2, 3, 4].'),
('python', 3, 'functions', E'def foo(x):
    return x, x * 2, x * 3
a, b, c = foo(5)
print(b)', 'What''s the output?', $$["5", "10", "15", "(5, 10, 15)"]$$::jsonb, 1, E'foo returns a tuple (5, 10, 15). Unpacking gives a=5, b=10, c=15.'),
('python', 3, 'strings', E'import re
x = "abc123def456"
print(re.findall(r"\d+", x))', 'What''s the output?', $$["[\"123\", \"456\"]", "[\"1\",\"2\",\"3\",\"4\",\"5\",\"6\"]", "123456", "Error"]$$::jsonb, 0, E'\d+ matches one or more digits. Finds two groups: "123" and "456".'),
('python', 3, 'scope', E'x = [1, 2, 3]
def foo():
    x.append(4)
foo()
print(x)', 'What''s the output?', $$["[1, 2, 3]", "[1, 2, 3, 4]", "Error", "None"]$$::jsonb, 1, E'Lists are mutable. foo() modifies x in-place without needing global keyword.'),
('python', 4, 'metaclasses', E'class Meta(type):
    def __new__(mcs, name, bases, ns):
        ns["greet"] = lambda self: f"I am {name}"
        return super().__new__(mcs, name, bases, ns)

class Foo(metaclass=Meta):
    pass

print(Foo().greet())', 'What''s the output?', $$["I am Foo", "I am Meta", "Error", "None"]$$::jsonb, 0, E'The metaclass injects a greet method using the class name.'),
('python', 4, 'descriptors', E'class Desc:
    def __get__(self, obj, cls):
        return 42

class Foo:
    x = Desc()

print(Foo().x, Foo.x)', 'What''s the output?', $$["42 42", "42 <Desc>", "<Desc> <Desc>", "Error"]$$::jsonb, 0, E'__get__ is called for both instance and class access, returning 42 each time.'),
('python', 4, 'closures', E'funcs = []
for i in range(3):
    funcs.append(lambda: i)
print([f() for f in funcs])', 'What''s the output?', $$["[0, 1, 2]", "[2, 2, 2]", "[3, 3, 3]", "Error"]$$::jsonb, 1, E'Lambda captures i by reference. By the time lambdas run, the loop ended with i=2.'),
('python', 4, 'mro', E'class A:
    def who(self): return "A"
class B(A):
    pass
class C(A):
    def who(self): return "C"
class D(B, C):
    pass
print(D().who())', 'What''s the output?', $$["A", "C", "D", "Error"]$$::jsonb, 1, E'MRO is D -> B -> C -> A. B has no who(), so C.who() is found first.'),
('python', 4, 'generators', E'def gen():
    x = yield 1
    yield x + 10
g = gen()
print(next(g))
print(g.send(5))', 'What''s the output?', $$["1\\n15", "1\\n11", "1\\n5", "Error"]$$::jsonb, 0, E'First next yields 1. send(5) resumes with x=5, then yields 5+10=15.'),
('python', 4, 'dunder', E'class V:
    def __init__(self, x):
        self.x = x
    def __add__(self, other):
        return V(self.x + other.x)
    def __repr__(self):
        return str(self.x)
print(V(3) + V(7))', 'What''s the output?', $$["10", "V(10)", "Error", "None"]$$::jsonb, 0, E'__add__ creates a new V with x=10. __repr__ returns "10".'),
('python', 4, 'decorators', E'def repeat(n):
    def decorator(func):
        def wrapper(*args):
            return [func(*args) for _ in range(n)]
        return wrapper
    return decorator

@repeat(3)
def hi():
    return "hi"

print(hi())', 'What''s the output?', $$["[\"hi\", \"hi\", \"hi\"]", "hi", "hihihi", "Error"]$$::jsonb, 0, E'@repeat(3) is a decorator factory. hi() runs the original 3 times, collecting results.'),
('python', 4, 'context', E'class CM:
    def __enter__(self):
        print("enter", end=" ")
        return self
    def __exit__(self, *args):
        print("exit", end=" ")
        return True

with CM():
    print("body", end=" ")
    raise ValueError', 'What''s the output?', $$["enter body exit", "enter body", "enter exit", "Error"]$$::jsonb, 0, E'__exit__ returning True suppresses the exception.'),
('python', 4, 'iterators', E'class Count:
    def __init__(self, n):
        self.n = n
    def __iter__(self):
        self.i = 0
        return self
    def __next__(self):
        if self.i >= self.n:
            raise StopIteration
        self.i += 1
        return self.i
print(list(Count(4)))', 'What''s the output?', $$["[1, 2, 3, 4]", "[0, 1, 2, 3]", "[0, 1, 2, 3, 4]", "Error"]$$::jsonb, 0, E'The iterator increments i before returning, giving 1 through 4.'),
('python', 4, 'scope', E'def make_counter():
    count = 0
    def inc():
        nonlocal count
        count += 1
        return count
    return inc
c = make_counter()
print(c(), c(), c())', 'What''s the output?', $$["1 1 1", "1 2 3", "0 1 2", "Error"]$$::jsonb, 1, E'nonlocal lets inc() modify count in the enclosing scope. Each call increments.'),
('python', 4, 'slots', E'class Foo:
    __slots__ = ("x",)
    def __init__(self):
        self.x = 1
f = Foo()
try:
    f.y = 2
except AttributeError:
    print("blocked")
print(f.x)', 'What''s the output?', $$["blocked\\n1", "1", "Error", "blocked"]$$::jsonb, 0, E'__slots__ restricts attributes. Setting f.y raises AttributeError.'),
('python', 4, 'async', E'import asyncio

async def foo():
    return 42

result = asyncio.run(foo())
print(result)', 'What''s the output?', $$["42", "<coroutine>", "None", "Error"]$$::jsonb, 0, E'asyncio.run() executes the coroutine and returns its result: 42.'),
('python', 4, 'dataclasses', E'from dataclasses import dataclass, field

@dataclass
class Point:
    x: int
    y: int
    label: str = field(repr=False, default="origin")

p = Point(1, 2)
print(p, p.label)', 'What''s the output?', $$["Point(x=1, y=2) origin", "Point(x=1, y=2, label=origin) origin", "Error", "Point(1, 2) origin"]$$::jsonb, 0, E'repr=False hides label from __repr__. p.label is still accessible.'),
('python', 4, 'typing', E'from typing import TypeVar, Generic
T = TypeVar("T")

class Box(Generic[T]):
    def __init__(self, val: T):
        self.val = val
    def get(self) -> T:
        return self.val

print(Box(42).get())', 'What''s the output?', $$["42", "Box(42)", "Error", "None"]$$::jsonb, 0, E'Generic is erased at runtime. Box(42).get() returns the stored value.'),
('python', 4, 'hashing', E'x = {True: "yes", 1: "one", 1.0: "float"}
print(x)', 'What''s the output?', $$["{True: 'float'}", "{True: 'yes', 1: 'one', 1.0: 'float'}", "{1: 'one'}", "Error"]$$::jsonb, 0, E'True == 1 == 1.0, so they are the same dict key. Last value wins.'),
('python', 4, 'functions', E'def foo():
    try:
        return 1
    finally:
        return 2
print(foo())', 'What''s the output?', $$["1", "2", "Error", "None"]$$::jsonb, 1, E'finally always executes and its return overrides the try block''s return.'),
('python', 4, 'classes', E'class A:
    def __init_subclass__(cls, **kw):
        cls.tag = kw.get("tag", "none")

class B(A, tag="hello"):
    pass

print(B.tag)', 'What''s the output?', $$["hello", "none", "Error", "None"]$$::jsonb, 0, E'__init_subclass__ receives keyword args from the class definition.'),
('python', 4, 'walrus', E'import re
text = "age: 25, score: 98"
if m := re.search(r"score: (\d+)", text):
    print(m.group(1))
else:
    print("no match")', 'What''s the output?', $$["98", "25", "no match", "Error"]$$::jsonb, 0, E'The walrus operator assigns the match. group(1) captures "98".'),
('python', 4, 'itertools', E'from itertools import groupby
data = [1, 1, 2, 2, 2, 3]
result = [(k, list(g)) for k, g in groupby(data)]
print(result)', 'What''s the output?', $$["[(1,[1,1]),(2,[2,2,2]),(3,[3])]", "[(1,2),(2,3),(3,1)]", "[(1,[1,1,2,2,2,3])]", "Error"]$$::jsonb, 0, E'groupby groups consecutive equal elements.'),
('python', 4, 'unpacking', E'def foo(**kw):
    return sorted(kw.items())
print(foo(b=2, a=1, c=3))', 'What''s the output?', $$["[(\"a\",1),(\"b\",2),(\"c\",3)]", "[(\"b\",2),(\"a\",1),(\"c\",3)]", "{\"a\":1,\"b\":2,\"c\":3}", "Error"]$$::jsonb, 0, E'**kw collects keyword args as a dict. sorted() on items() sorts by key.');
