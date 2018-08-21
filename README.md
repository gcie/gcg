<<<<<<< HEAD
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
gcg init [task-name] [--overwrite]
```

Initializes directory with template ```.cpp``` files and tests (you should start copying tests to clipboard). If [task-name] is specified, then it only initializes this task.

### Testing

```
gcg run <task-name> [--no-compile]
```

Runs specified task on its tests (any test that begins with ```<task-name>```). Flag ```--no-compile``` turns off compiling.

**Note**: Validator runs ```g++ -std=c++17 <task-name>.cpp -o <task-name>```. Make sure it works.
=======
# Generator projektu

## Instalacja

```
npm install -g https://github.com/tao24/gcg.git
```

## Instrukcja obsługi
```
gcg --init
```
Generuje szablonowe pliki ```.cpp``` oraz przygotowuje testy w folderze ```tests```.

```
gcg <nazwa_programu> [--no-compile]
```

Kompiluje i testuje program ```<nazwa-programu>.cpp``` na testach: ```tests\<nazwa-programu>*.in```, a wyniki


**Uwaga**: ```<nazwa_progamu>``` powinna być bez rozszerzenia.

Flaga ```--no-compile``` wyłącza kompilowanie.
>>>>>>> master
