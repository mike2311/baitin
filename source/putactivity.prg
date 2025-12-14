function putActivity(strRefNo,strActCode,strActDesp,strRefNo_2 )

	cAlias = alias()
	
	if empty(strRefNo) or empty(strActCode)
		return -1
	endif

	select max(act_no) from mactivity into cursor vTmpActivity
	
	if eof()
		intActNo = 1
	else
		intActNo = vTmpActivity.max_act_no +1
	endif
	
	if empty(strRefNo_2)
		strRefNo_2 = ""
	endif
	
	use in vTmpActivity
	insert into mactivity ;
				(act_no,act_date,act_time,Ref_no,act_code,act_desp,user_id,ref_no_2);
			values;
				(intActNo,date(),time(),strRefNo,strActCode,strActDesp,sysUserId,strRefNo_2)
	
	if !empty(cAlias)
		if used(cAlias)
			select &cAlias
		endif
	endif
	
	return intActNo 
endfunc