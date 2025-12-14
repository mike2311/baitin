Function Findline(Char1)
     w_lineno = 1
     X1 = At("*** End of Product ",Char1)
    IF X1 > 0      
        Z1 = Left(Char1,X1-1)
        For I = 1 To 20             
             X2 = At(Chr(10),Z1) 
             IF X2 > 0
                 x = Len(Z1)
                 Z1 = Right(Z1,x -X2)
                 w_lineno = w_lineno+1
             Else
                 Exit
             Endif
       Endfor       
    Endif   
Return w_lineno+1
