function cutfrombefore(w_input,w_from,w_before)
	a = len(w_input)
	x1 = At(w_from,UPPER(w_input))
	X4 = At(w_before,UPPER(w_input))
        IF x1>0 And x4>0
            Y1 = Left(w_input,X1-1)
            Y2 = Right(w_input,A-X4+1)
            Return Y1+Y2
        Else
           Return w_input    
        Endif
    
   