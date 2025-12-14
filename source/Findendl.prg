Function FindEndl(Char1)	
    Private X1    
    X1 = At("*** End of Product ",Char1)    
    IF X1 > 0      
        Return .T.
    Else
        Return .F.
    Endif 
    


 