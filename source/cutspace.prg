Function Cutspace(Char1)	
    Private A1,X,Y,Z,X1
    A1 = Len(Char1)
    X  = Right(Char1,5)		
    Y  = Left(Char1,(A1-5))
    Z  = Alltrim(Char1)
    X1 = At(Chr(10),X)
    IF X1 > 0      
       Z = Y + Left(X,4)
       Return Z       
    Endif    
Return Z

 