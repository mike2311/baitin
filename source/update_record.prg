
FUNCTION Update_record(p_field_list,p_file_name,p_key_list, p_prefix)

*sample update_record("field_1,field_2,field_3","file_1","key_1,key_2",t)
*have to define public t_field_1, t_field_2, t_field_3 before calling this function
  
   strSql=""
   w_temp_field_list = p_field_list
   w_brk_pos = AT(",",w_temp_field_list)
   DO WHILE w_brk_pos > 0
      IF EMPTY(strSql) 
         strSql = "Update "+ALLTRIM(p_file_name)+" set " +;
                              ALLTRIM(LEFT(w_temp_field_list, w_brk_pos - 1)) +" ="+ALLTRIM(p_prefix)+"_"+ALLTRIM(LEFT(w_temp_field_list, w_brk_pos - 1)) 
      ELSE
         strSql = strSql +","+ ALLTRIM(LEFT(w_temp_field_list, w_brk_pos - 1)) +" ="+ALLTRIM(p_prefix)+"_"+ALLTRIM(LEFT(w_temp_field_list, w_brk_pos - 1))
      ENDIF
      w_temp_field_list = SUBSTR(w_temp_field_list, w_brk_pos+1, LEN(w_temp_field_list) - w_brk_pos)
      w_brk_pos = AT(",",w_temp_field_list)
   ENDDO
   strSql = strSql +","+ ALLTRIM(w_temp_field_list) +" ="+ALLTRIM(p_prefix)+"_"+ALLTRIM(w_temp_field_list)
   
   

   strWhere=""
   w_temp_key_list = p_key_list
   w_brk_pos = AT(",",w_temp_key_list)
   DO WHILE w_brk_pos > 0
      IF EMPTY(strWhere) 
         strWhere =   ALLTRIM(LEFT(w_temp_key_list, w_brk_pos - 1)) +" ="+ALLTRIM(p_prefix)+"_"+ALLTRIM(LEFT(w_temp_key_list, w_brk_pos - 1)) 
      ELSE
         strWhere = strWhere +" and "+ ALLTRIM(LEFT(w_temp_key_list, w_brk_pos - 1)) +" ="+ALLTRIM(p_prefix)+"_"+ALLTRIM(LEFT(w_temp_key_list, w_brk_pos - 1))
      ENDIF
      w_temp_key_list = SUBSTR(w_temp_key_list, w_brk_pos+1, LEN(w_temp_key_list) - w_brk_pos)
      w_brk_pos = AT(",",w_temp_key_list)
   ENDDO
   IF EMPTY(strWhere)
      strWhere = ALLTRIM(w_temp_key_list) +" = "+ALLTRIM(p_prefix)+"_"+ALLTRIM(w_temp_key_list)
   ELSE
      strWhere = strWhere +" and "+ ALLTRIM(w_temp_key_list) +" ="+ALLTRIM(p_prefix)+"_"+ALLTRIM(w_temp_key_list)
   ENDIF

   strSql = strSql + " WHERE "+ strWhere
  
   &strSql     &&  process update statement
  	

*   IF x < 0
*      MESSAGEBOX("資料未能儲存!",0+16,"Error Message")
*   ELSE
*      WAIT "資料己儲存" windows nowait 
*   endif   


