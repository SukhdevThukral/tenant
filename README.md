# 👻 TENANT

_a web-based terminal-like horror game where youre alone in a building at 3am and something is moving through it_



## what ts is

youre MAINT-7 in the game, the building management system is under your control and it flags a read on the roof - weight estimated around 190kg

your job is to lock it out all before it reaches u :D

## how its built

ive used [Next.js](https://nextjs.org), [xterm.js](https://xtermjs.org/) for the terminal, [Typescript](https://www.typescriptlang.org/) for everythg else, and Vanilla CSS for styling, glitch effects, scanlines, red pulse and etc. It has obviously no database, just a building graph and a BFS (Breadth First Search) pathfinder running on a tick loop.

## how it plays/works

you get a command line interface into a hypothetcal building managing system. the entity starts from the roof and moves towards you one zone per tick, you can assess sensor logs, and track it through the map option, and even lock door to cut off its path.

your task is to lock the right zones before it reaches the basement and you win :b

## in-game commands

```
status           system overview — threat level, locked zones, tick count
scan             motion sweep across all 11 zones
cameras          camera feed index
cam <zone>       view a specific feed
map              building layout with entity and lock positions
doors            door lock status
lock <zone>      engage electromagnetic lock
unlock <zone>    release lock

```