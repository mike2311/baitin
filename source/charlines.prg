function charlines(x)
local line_cnt, i
line_cnt=0
m=len(x)
i=1
y = ""
do while i <=len(x)
     if substr(x,i,1)=chr(10)
        line_cnt=line_cnt+1
    endif
    i=i+1
    
enddo
return line_cnt +1
    
         