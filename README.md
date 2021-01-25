# mordhau-stat-tracking

## Required Environment Variables

MORDHAU_IP

- IP for your RCON server

MORDHAU_PORT

- Port for your RCON server

MORDHAU_PW

- Password for your RCON server

MONGO_SRV

- SRV link for your mongo database

## Optional Environment Variables

NODE_ENV

- Used for heroku deployments, you don't have to worry about this

PORT

- If you wish to specify a port for the server to listen on, defaults to 6000. This will be used when API for fetching stats is added

## Quick use guide

1. `npm install`
2. Create a file named `.env` which contains all the required environment variables
   - Format should be `name=value` separated by new lines
3. run`npm start`
   - If you see a message that says `Now listening to killfeed broadcasts` then it launched successfully
4. Go to your mordhau server. Try typing `.startmatch <mapname> <mapname> <mapname>` in chat. Minimum 1 map.
5. Map should change and stat tracking should be enabled.

## In game chat commands

`.startmatch <mapname> <mapname> ...`

- Enables stat tracking and stores map rotation. Map will be changed to next map in rotation when an admin types `.next`
- Minimum 1 map, can be as many as you want
- Maps are not case sensitive
- If any invalid maps are detected, match will not start and stat tracking will not be enabled
- Currently only accepted maps are
  - SKM_Steedie_Contraband
  - SKM_Contraband
  - SKM_Steedie_Moshpit_Big
  - SKM_Alden
  - SKM_Chester
  - SKM_Moshpit
  - SKM_steedie_Moshpit
  - SKM_Chasm
- EX: `.startmatch skm_moshpit skm_contraband`

`.next`

- Goes to next map in rotation.
- `.next` triggers all stats in that game to be saved in the database.
  - No need to worry about all players being in the server when you type .next, stats are recorded on every kill
- Typing `.next` when there are no more maps in the rotation, is effectively the same thing as typing `.endmatch`

`.endmatch`

- Ends the match and saves any remaining data in the database.

`.cancelmatch`

- Cancels the match and disregards any unsaved data.'
- Please note that this only disregards data for the current map. If you are on the second map in a match, and you use `.cancelmatch` the first map will stay saved, but not the second.
