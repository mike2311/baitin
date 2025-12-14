function ctov(C_desp)
c_desp=Alltrim(c_desp)
x2=""
n_rv=0
For I=1 To Len(C_desp)
    x1=Substr(C_desp,I,1)
    Do Case 
       Case x1="-"
           x2=x2+"."
       Case x1="/"
           d_pos=at(".",X2)
           x=substr(x2,d_pos+1)
           y=substr(C_desp,I+1)
           n_rv=val(substr(x2,1,d_pos-1))+val(x)/val(y)
           return n_rv
       Case  between(x1,"0","9")
           x2=x2+x1
       Case x1="=" 
           n_rv=val(x2)
           return n_rv       
       Endcase
      
Endfor
IF n_rv=0
   n_rv=val(x2)
Endif
return n_rv