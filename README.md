# Generator projektu

**Uwaga:** To jest wersja rozwojowa, może nie być stabilna.

## Instalacja

```
npm install -g https://github.com/tao24/gcg.git#dev
```

## Instrukcja obsługi
```
gcg
```
Uruchamia tryb interaktywny tworzenia struktury plików - generuje kolejno szablonowe pliki ```.cpp``` oraz przygotowuje testy na postawie danych ze schowka (wystarczy kolejno skopiować input i output dla każdego testu do schowka).

```
gcg <nazwa_programu> [--no-compile]
```

Kompiluje i testuje program ```<nazwa-programu>.cpp``` na testach: ```tests\<nazwa-programu>*.in```.

Flaga ```--no-compile``` wyłącza kompilowanie.