# Generator projektu

## Instrukcja użytkowania

Tryb interaktywny - generuje strukturę projektu:

```
node gcg.js
```

Tryb wsadowy - kompiluje i testuje program na wszystkich testach w folderze ```<nazwa_programu>```:
```
node gcg.js <nazwa_programu> [--no-compile]
```

Uwaga: ```<nazwa_progamu>``` powinna by bez rozszerzenia.

Flaga ```--no-compile``` wyłącza kompilowanie.