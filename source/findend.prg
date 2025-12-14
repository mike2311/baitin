Function FindEnd(Char1,Char2)	
    Private Z,A1,X1,Z1,Z2,X2,Z3,Z4
    Z = Char1
    A1 = Len(Char1)  
    X1 = At("*** End of Product ",Char1)
    
    IF X1 > 0      
       Z1 = Left(Char1,X1-1)
       Z2 = Right(Char1,A1-x1+1)       
       x2 = At(Chr(10),Z2)
       *Z3 = Left(Z2,X2-1)
       IF X2 > 0
          Z3 = Left(Z2,X2-1)
          Z4 = Right(Z2,Len(z2)-x2+1)
          *Z = z1+z3+Chr(10)+char2+z4
          Z = z1+z3+Chr(10)+char2
          Return Z
       Else
          Z = Z1+Z2+Chr(10)+Char2
          Return Z
       Endif       
    Endif 
    Return Z+Char2   
Return Z

 