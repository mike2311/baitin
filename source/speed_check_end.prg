function speed_check_end(ref_key_str)
	SELECT wspeed
	GO TOP 
	locate for ALLTRIM(wspeed.ref_key)==ALLTRIM(ref_key_str)
	replace wspeed.end_time   WITH SUBSTR(TIME(),1,8)
	RETURN
	