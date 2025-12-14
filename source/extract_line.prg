Function Extract_line(w_input, w_char)	
    Private w_result, w_index, w_char
    w_result=""
    w_index=at(w_char, w_input)
    if w_index=0
       return ""
    else
       w_result=substr(w_input,w_index,1)
       do while(substr(w_input,w_index,1) <> chr(10) and w_index <= len(w_input))
            w_index = w_index+1
            w_result = w_result + substr(w_input,w_index,1)
       enddo
       return w_result
    endif
    

 