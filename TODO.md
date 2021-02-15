# TODO

## Auto detect round by 7 rounds won

- Currently, an admin has to type .next in order to change to the next map in the rotation.

## Once JSON is implemented in the RCON feed, update the database on killfeed, rather than map change

## Fix issue with spectators being recorded in stats

- This is an issue because of it will add to their `rou;ndsPlayed` stat
  - One potential fix is if k/d/a is all 0, don't record for that round

## Add route for getting a players stats by ID

## Save player stats by game as well

- Stats are only saved by players, not by games. Ability to look at any game in the past would be nice
