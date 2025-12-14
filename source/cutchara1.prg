function cutchara1(cha1)
	a = len(cha1)
	x1 = At("HTS#",Cha1)
	x2 = At("Duty",Cha1)
	x3 = At("Material",Cha1)
        X4 = At("UPC",Cha1)
        IF X1>0 And X4>0
            Y1 = Left(Cha1,X1-1)
            Y2 = Right(Cha1,A-X4+1)
            Return Y1+Y2
        Endif
    
    IF x1 > 0
       y1 = Left(Cha1,x1-1)
       Y2 = Right(Cha1,a-x1+1)
       IF x3 > 0
          y2 = Right(cha1,a-x3+1)
          x4 = At(Chr(10),Y2)
          y3 = Right(Y2,Len(y2)-x4+1)
          Return Y1+y3
       Else
          IF X2 > 0
             Y2 = Right(Cha1,a-x2+1)
             x4 = At(Chr(10),Y2)
             y3 = Right(Y2,Len(y2)-x4+1)
             Return Y1+y3 
          Else
             x4 = At(Chr(10),Y2)
             y3 = Right(Y2,Len(y2)-x4+1)
             Return Y1+y3 
          Endif
       Endif
    Else
       IF x2 > 0
          Y1 = Left(Cha1,x2-1)
          Y2 = Right(Cha1,a-x2+1)
          IF x3 > 0
             y2 = Right(cha1,a-x3+1)
             x4 = At(Chr(10),Y2)
             y3 = Right(Y2,Len(y2)-x4+1)
             Return Y1+y3
          Else
             x4 = At(Chr(10),Y2)
             y3 = Right(Y2,Len(y2)-x4+1)
             Return Y1+y3
          Endif
       Else
          IF X3 > 0
             Y1 = Left(Cha1,x3-1)
             Y2 = Right(Cha1,a-x3+1)
             x4 = At(Chr(10),Y2)
             y3 = Right(Y2,Len(y2)-x4+1)
             Return Y1+y3
          Else
             y1 = cha1
          Endif  
       Endif       
    Endif
    
 Return y1
 