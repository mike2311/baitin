FUNCTION NFORMAT(TEMP_NUMERIC)
TempR = ""
Temp2 = ""

Temp_str = Alltrim(Str(Temp_Numeric))
X = Len(Temp_str)
Y = X / 3
IF  Y > 1
      For I = 1 To Round(Y,0)
            R1 = Right(Temp_str,3)
            L1 = Left(Temp_str,X-3)
            TempR = ","+R1
            IF Len(Alltrim(L1)) <= 3
                Rt = L1+TempR+Temp2
                Return Rt
            Else
                Temp_str = L1
                X = Len(Alltrim(L1))
                Temp2 = TempR+Temp2
            Endif
      EndFor
Else
     Rt = Temp_str
Endif     
RETURN (Rt)
                     
