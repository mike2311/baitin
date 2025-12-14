function speed_check_start(ref_key_str,reference_str)
	SELECT wspeed
	APPEND BLANK
	replace wspeed.ref_key   WITH ref_key_str
	replace wspeed.ref_point WITH reference_str
	replace wspeed.st_time   WITH SUBSTR(TIME(),1,8)
	RETURN
	