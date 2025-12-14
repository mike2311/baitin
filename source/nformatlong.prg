FUNCTION Nformatlong(TEMP_NUMERIC)
TempR = ""
Temp2 = ""
Temp3 = ""
Temp_str1 = Alltrim(Str(Temp_Numeric,20,2))
z = AT(".",Temp_str1)
If z > 0
   Temp_str = Left(Temp_str1,z-1)
   Temp3 = Right(Temp_str1,3)
Else
   Temp_str = Temp_str1
   Temp3 = ""
Endif

X = Len(Temp_str)
Y = X / 3
IF  Y > 1
      For I = 1 To Round(Y,0)
            R1 = Right(Temp_str,3)
            L1 = Left(Temp_str,X-3)
            TempR = ","+R1
            IF Len(Alltrim(L1)) <= 3
                Rt = L1+TempR+Temp2                
            Else
                Temp_str = L1
                X = Len(Alltrim(L1))
                Temp2 = TempR+Temp2
            Endif
      EndFor
Else
     Rt = Temp_str
Endif 
    Rt = Rt+Temp3
RETURN (Rt)
                     
