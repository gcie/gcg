# Codeforces project generator

## Instalation

```
npm install -g https://github.com/tao24/gcg.git
```

## Local building and testing

1. Clone repository:

```
git clone https://github.com/tao24/gcg.git
cd gcg
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
gcg init [task-name] [--overwrite]
```

Initializes directory with template ```.cpp``` files and tests (you should start copying tests to clipboard). If [task-name] is specified, then it only initializes this task.

### Testing

```
gcg run <task-name> [--no-compile]
```

Runs specified task on its tests (any test that begins with ```<task-name>```). Flag ```--no-compile``` turns off compiling.

**Note**: Validator runs ```g++ -std=c++17 <task-name>.cpp -o <task-name>```. Make sure it works.
