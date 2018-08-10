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

Kompiluje i testuje program ```<nazwa-programu>.cpp``` na testach: ```tests\<nazwa-programu>*.in```.


**Uwaga**: ```<nazwa_progamu>``` powinna być bez rozszerzenia.

Flaga ```--no-compile``` wyłącza kompilowanie.