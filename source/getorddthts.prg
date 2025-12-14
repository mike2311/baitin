
if !used("morddt")
	use morddt in 0
endif

select morddt
*set order to ICONITEHE
LOCATE FOR ALLTRIM(MORDDT.CONF_NO) = "HT-OC/009/04" ;
	AND ITEM_NO = "8122/8140" AND HEAD = .T.
	
		local temp_desc , start_,end_, len_of_memo
		temp_desc = morddt.desc_memo
		start_ = at("HTS#", temp_desc)
		end_ = at(chr(10), substr(temp_desc, start_))
		len_of_memo = len(temp_desc)
				
		if start_ >  0	
			if end_ >0
				HTS = substr(temp_desc, start_, end_)
			else
				HTS = substr(temp_desc, start_)
			endif

		endif
