# BIOPSet front end

## Deploy
0. set Show Actions in App to false
1. ```yarn build```
2. if deploying to a sub directory (like biopset.com/app) then after building all instances of `="/` must be replaced with `="./` in the index.html within the build folder. The url for importing the Octarine font must also be updated to in include a `.` before the first `/` when it is imported with `url(...` in the index.html in the build folder.
3. ```yarn deploy```

### live contracts addresses
Token 0xC3771668ac4d9C727f54dBDe11ed94acAdD5fF86
BO 0x469B65889Da7fCd5a121BA8Abd589215c769624a
Price calc 0x79bc59B174D4579CF16734864522A58Bd92eb504