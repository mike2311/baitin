Function Longmonth(wmonth)
Do Case 
     Case Month(wmonth) = 1
            x = "JAN"
     Case Month(wmonth) = 2
             x = "FEB"
    Case Month(wmonth) = 3
             x = "MAR"
   Case Month(wmonth) = 4
             x = "APR"
     Case Month(wmonth) = 5
             x = "MAY"
      Case Month(wmonth) = 6
             x = "JUN"
      Case Month(wmonth) = 7
             x = "JUL"
       Case Month(wmonth) = 8
             x = "AUG"
       Case Month(wmonth) = 9
             x = "SEP"
       Case Month(wmonth) = 10
             x = "OCT"
        Case Month(wmonth) = 11
             x = "NOV"
        Case Month(wmonth) = 12
             x = "DEC"
Endcase
Return strzero(day(wmonth),2)+ " " + x +" "+alltrim(str(year(wmonth)))

                                                                                            
