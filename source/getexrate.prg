function getExRate(strCurCode)

cAlias = alias()

if !used("zcurCode")
	use zcurcode in 0 share
endif
select zcurcode 

if zcurcode.cur_code = strCurCode
	rtn_value = zcurcode.ex_rate
else
	locate for zcurcode.cur_code = strCurCode
	if found()
		rtn_value = zcurcode.ex_rate
	else
		rtn_value = 1
	endif
endif
if rtn_value = 0
	rtn_value = 1
endif

if !empty(cAlias)
	if used(cAlias)
		select &cAlias
	endif
endif

return rtn_value