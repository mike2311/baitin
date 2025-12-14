function get_skn(item_desp)
	temp_pos=AT(CHR(10), item_desp)
    IF temp_pos=0
       RETURN ''
    ENDIF    
	temp_skn=SUBSTR(item_desp, temp_pos+1)
	temp_skn=STRTRAN(temp_skn,'(','')
	skn=STRTRAN(temp_skn,')','')
	RETURN skn
