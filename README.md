# Codeforces project generator

**Warning:** This is a dev version, might be unstable or have errors.

## Instalation

```
npm install -g https://github.com/tao24/gcg.git#dev
```

## Local building and testing

1. Clone repository:

```
git clone -b dev https://github.com/tao24/gcg.git gcg-dev
cd gcg-dev
```

2. Intall, build and run project locally:

```
npm install
npm run build
npm start <params>
```

3. (optional) Before publishing (pushing to repository), remember to build in production mode first:

```
npm run build:prod
```



## Usage instruction

### Directory management
```
gcg init [task-name] [--overwrite] [--input-only]
```

Initializes directory with template ```.cpp``` files and tests (you should start copying tests to clipboard). If [task-name] is specified, then it only initializes this task.

Flag ```--input-only``` [TODO] makes it so it creates only ```*.in``` files, omitting ```.*.out``` files, and creates sample ```[task-name]_out.cpp``` validator file. Make sure to create and compile validator.

### Testing

```
gcg run <task-name> [--no-compile]
```

Runs specified task on its tests (any test that begins with ```<task-name>```). If no corresponding `.out` files are found, then it tries to use `<task-name>_out[.exe]` executable to validate program. Validator should work as follows:

1. read from stdin test specification (`.in` file)
2. read from stdin your programs' output
3. validate output
4. if result is ok, return with no result. If not, it should print something on standard output (it will be displayed in console during testing). 

Flag ```--no-compile``` turns off compiling.

**Note**: Validator runs ```g++ -std=c++17 <task-name>.cpp -o <task-name>```. Make sure you have c++ compiler.
