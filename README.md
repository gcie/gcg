# Codeforces project generator

## Instalation
```
npm install -g https://github.com/tao24/gcg.git
```

## Usage instruction

### Directory management
```
gcg init <task-name> [--overwrite] [--input-only]
```

Initializes directory with template `.cpp` file and tests (you should start copying tests to clipboard).

Flag `--input-only` makes it so it creates only `*.in` files, omitting `*.out` files. Make sure to create `[task-name]_out.exe` validator file working as specified below.

### Testing

```
gcg run <task-name> [-f <folder-name>] [-t <test-name>] [--no-compile]
```

Runs specified task on its tests (tests in folder `tests` which begin with `<task-name>` and all test in folder `tests/<task-name>`). 
#### Available options:
- `-f, --folder <folder-name>` runs program on all tests in specified folder,
- `-t, --test <test-name>` runs program only on specified test (but it must be in either `tests` folder, in `tests/<program-name>` or in folder specified by `-f <folder-name>`),
- `--no-compile` turns off compiling program before testing.

If no corresponding `.out` or `.ans` files are found, then it tries to use `<task-name>_out[.exe]` executable to validate program. Validator should work as follows:

1. read from stdin test specification (`<test-name>.in` file)
2. read from stdin your programs' output
3. validate output
4. if result is ok, return with no result. If not, it should print non-empty string on standard output (it will be displayed in console during testing). 

**Note**: Validator runs ```g++ -std=c++17 <task-name>.cpp -o <task-name>```. Make sure you have a c++ compiler.


## Local building and testing

1. Clone repository:

```
git clone -b dev https://github.com/tao24/gcg.git gcg-dev
cd gcg-dev
```

2. To install and run project locally:

```
npm install
npm start -- <params>
```

3. (optional) To install CLI from local folder:

```
npm run build
npm install -g
```

<!-- Before publishing (or pushing to repository), remember to build first (`npm run build:prod`). -->
