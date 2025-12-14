FUNCTION init_field_list(p_file_name, p_prefix)
 
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
    DO WHILE w_brk_pos > 0
       IF EMPTY(w_declare_pub) 
          w_declare_pub = "PUBLIC " + ALLTRIM(p_prefix)+"_"+ALLTRIM(LEFT(w_temp_field_list, w_brk_pos - 1))
       ELSE
          w_declare_pub = w_declare_pub +", "+ALLTRIM(p_prefix)+"_"+ ALLTRIM(LEFT(w_temp_field_list, w_brk_pos - 1))
       ENDIF
       w_temp_field_list = SUBSTR(w_temp_field_list, w_brk_pos+1, LEN(w_temp_field_list) - w_brk_pos)
       w_brk_pos = AT(",",w_temp_field_list)
    ENDDO
    w_declare_pub = w_declare_pub+", "+ALLTRIM(p_prefix)+"_"+ALLTRIM(w_temp_field_list)
    &w_declare_pub     && declare field list variable

   SELECT &p_file_name
    FOR I = 1 TO FCOUNT()
        w_field_name = ALLTRIM(p_prefix)+"_"+ALLTRIM(FIELD(i))
        DO CASE
           CASE TYPE(FIELD(i))="C"
                &w_field_name = ""
           CASE TYPE(FIELD(i))="N" OR TYPE(FIELD(i))="I" OR TYPE(FIELD(i))="Y" OR TYPE(FIELD(i))="M"
                &w_field_name = 0
           CASE TYPE(FIELD(i))="D" 
                &w_field_name = CTOD(" /  /    ")
           CASE TYPE(FIELD(i))="L"
                &w_field_name = .F.     
           OTHERWISE
           xxx
                &w_field_name =""
        ENDCASE
    ENDFOR 
    
  	RETURN w_field_list