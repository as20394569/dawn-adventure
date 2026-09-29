/* v27e safety net (bug: 藥師香囊 froze the smithy — its recipe had an 'undefined' material (a signed shift of a large hash gave a negative index)
   and drawing it crashed the forge screen). Any recipe material that isn't a real item is dropped, so one bad recipe can't stop the screen again. */
for (const k in GEAR_RECIPE) { const M = GEAR_RECIPE[k].mats || (GEAR_RECIPE[k].mats = {}); for (const i in M) if (!ITEMS[i]) delete M[i]; if (!Object.keys(M).length) M.stone = 2; }
