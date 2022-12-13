# ya-ws-builder
(Йет аназер васаби билдер епта)

Неиллюзорная помощь разработчику в сами-знаете-какой-конторе.

* Конвертирует TypeScript и LESS указанного репозитория
  и кладёт их в нужные директории;
<!-- * Генерирует документацию -->

## Установка

1. `npm i gulp -g`
2. `npm i typescript -g`
3. `npm i`

<!-- Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Unrestricted -Force; -->

## Запуск

Команда `gulp` с аргументами запускает скрипт. Для запуска необходимо
указать аргументы:

* target — один или несколько рабочих каталогов «client», содержащие модули
  фронтенда;
* sdk — расположение SDK;
* distro — расположение распакованного дистрибутива;
* dest — путь сборки (куда обычно разворачивается стенд);
* output — версия ECMAScript на выходе (по-умолчанию es2020).

### Пример PowerShell

```powershell
gulp `
  --target 'C:\work\online\root\client' `
  --target 'C:\work\online\eo\client' `
  --sdk 'C:\Users\%USERNAME%\SBISPlatformSDK\SBISPlatformSDK_231000' `
  --dest 'C:\work\online\build' `
  --distro 'C:\work\online\version\23.1100\ext' `
  --output 'es5'
```

<!-- _Shell_

```sh
gulp \
  --target /srv/online/root/client \
  --target /srv/online/eo/client
``` -->

## История версий

### 1 августа 2022

* Независимая сборка статики. Теперь не нужно собирать проект в Genie.

### 7 Февраля 2021

* Обновлён сборщик. Теперь gulp работает с ts-node;
* Убран глобальный импорт _variables для *.less.

### 16 Ноября 2020

* Полностью переписан на TS,
* Теперь создаёт симлинки JS.

### 25 октября 2020

* Теперь можно задать версию получаемого js: `--output es5`.

### 4 марта 2020

* С новой версией Genie в очередной раз изменён формат мета-информации стенда.
