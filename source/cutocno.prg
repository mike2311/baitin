Function Cutocno(Char1)	        
    X=Alltrim(Char1)    
    IF w_password = "BAT"
        X1 = At("-",X)    
        IF X1 > 0      
            Z = Right(X,Len(X) - X1)
        Else
            Z = X    
        Endif   
    Else       
       X1 = At("/",X)    
       IF X1 > 0      
           Z = Right(X,Len(X) - X1)
       Else
           Z = X
       Endif   
    Endif
Return Z