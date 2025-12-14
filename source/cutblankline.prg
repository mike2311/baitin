Function Cutblankline(w_input)	
    Private w_result, w_index
    w_result=""
    w_index=1
    do while(w_index <=len(w_input))
         do while(substr(w_input,w_index,1) <> chr(10) and w_index <=len(w_input))
              w_result=w_result+substr(w_input,w_index,1) 
              w_index=w_index + 1
         enddo
         if w_index > 1
             w_result=w_result+substr(w_input,w_index,1) 
         endif    
        do while ( substr(w_input,w_index,1) < chr(32)  and w_index <=len(w_input))
             w_index=w_index+1
        enddo 
        x=asc(substr(w_input,w_index,1))
    enddo
    
  return w_result

 