function cutfrombefore(w_input,w_from,w_to)
	a = len(w_input)
	x1 = At(w_from,UPPER(w_input))
	X4 = At(w_to,UPPER(w_input))
	i=0
	do while(substr(w_input),X4+i,1)=chr(10) and x4+i <=len(w_input)
	     i=i+1
	enddo
	     
        IF x1>0 And x4>0
            Y1 = Left(w_input,X1-1)
            Y2 = Right(w_input,A-X4+1 + i)
            Return Y1+Y2
        Else
           Return w_input    
        Endif
    
   