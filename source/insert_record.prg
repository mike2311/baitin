
FUNCTION Insert_record(p_file_name, p_prefix)

 w_no_of_field=fcount(p_file_name)
 dimension w_data_array(w_no_of_field)
 select &p_file_name
FOR i = 1 TO FCOUNT()
        w_field_name = alltrim(p_prefix)+"_"+alltrim(field(i))
        w_data_array(i) = &w_field_name
ENDFOR
  
   strSql = "insert into "+alltrim(p_file_name) +" from array w_data_array "
    
   &strSql   && execute sql command
   

