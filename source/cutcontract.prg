function cutcontract(a,x_y, b)
private w_char, w_item, w_str, i,w_cont,w_cut,w_vendor
i = 1
w_cut = ""
w_char = ""
w_str = ""
w_cont = alltrim(a)
w_item = alltrim(b)
w_vendor = alltrim(x_y)
if empty(w_cont)
	return "Empty"
endif
if upper(substr(w_cont, 1,1)) = "B"
	do while i <= len(w_cont) and w_cut <> "-"
		w_cut = substr(w_cont, i, 1 )
		i = i +1
	enddo
	w_str = substr(w_cont,i)+"/"+w_vendor+"/"+w_item
	w_str = alltrim(w_str)+space(40-len(alltrim(w_str)))
	return w_str
ELSE
*xxx
    if upper(substr(w_cont, 1,2)) = "HT" OR upper(substr(w_cont, 1,2)) = "IN"
	**if upper(substr(w_cont, 1,1)) = "H" 
*		i = 1
*		w_cont = substr(w_cont, 3)
*		
*		do while i <= len(w_cont) and w_cut <> "/"
*			w_cut = substr(w_cont, i, 1 )
*			i = i +1
*		enddo
*		w_cont = substr(w_cont, 1,i - 2)
*			
*		if len(w_cont) < 4
*			w_cont = "0"+w_cont
*			if len(w_cont) < 4
*				w_cont = "0"+w_cont
*			endif
*		endif
		w_cont = alltrim(substr(alltrim(w_cont),3))
		w_str = w_cont+"/"+w_vendor+"/"+w_item
		w_str = alltrim(w_str)+space(40-len(alltrim(w_str)))
		return w_str
	ELSE
	   if upper(substr(w_cont, 1,3)) = "HFW" 
	      w_cont = alltrim(substr(alltrim(w_cont),4 ))
		  w_str = w_cont+"/"+w_vendor+"/"+w_item
		  w_str = alltrim(w_str)+space(40-len(alltrim(w_str)))
		  return w_str
	   ENDIF 	
	endif
endif

return ""

