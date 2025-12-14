FUNCTION set_field_list(p_file_name, p_prefix)
    if used(p_file_name)
       select &p_file_name
    else
       use &p_file_name in 0
    endif
          

    select &p_file_name
    FOR i = 1 TO FCOUNT()
	    IF i = 1
	       w_field_list = ALLTRIM(FIELD(i))
	    ELSE
	       w_field_list = w_field_list+","+ALLTRIM(FIELD(i))
	    ENDIF
    ENDFOR
    w_temp_field_list = w_field_list
    w_declare_pub=""
    w_brk_pos = AT(",",w_temp_field_list)
   SELECT &p_file_name
    FOR I = 1 TO FCOUNT()
        w_field_name = ALLTRIM(p_prefix)+"_"+ALLTRIM(FIELD(i))
        w_data_name = alltrim(p_file_name)+"."+alltrim(field(i))
        &w_field_name = &w_data_name
    ENDFOR 
    return w_field_list