function shipco(w_ship, a,b,c,d,e,f,g,h)
*shipco(wisogrid.shipmark, 111, wisogrid.qty,wisogrid.desp,;
*	wisogrid.item_no,wisogrid.material,wisogrid.origin,wisogrid.po_no,wisogrid.skn)
	
*select * from wisogrid where so_no = "5885/1074-NEW" and cust_no = "MARK" into cursor tt	
*messagebox(x)
*return 
*select shipmark from mshipmark where cust_no = "WHITE" and port = "30" into cursor tt

*a = 111
*b = tt.qty
*c = tt.desp
*d = tt.item_no
*e = tt.material
*f = tt.origin
*g = tt.po_no
*h = tt.skn

public w_pack_qty, w_carton, w_desp , w_item, w_material, w_origin, w_po_no, w_sku_no



     
w_pack_qty = alltrim(str(a))
w_carton = alltrim(str(b))
w_desp = c
w_item = d
w_material = e
w_origin = f
w_po_no = g
w_sku_no = h

w_str =w_ship
*w_str = tt.shipmark
*messagebox(w_str)
*return 
w_cut = ""
i = 1



XXX
w_temp_str=w_str
do while i <= len(w_str)
	w_cut = substr(w_str, i, 1)
	if w_cut = "!"
	    do case
	         case at("!EASTER",upper(w_temp_str))>0
	                 w_char1=substr(w_str,1,i-7)
	                 w_temp_str=substr(w_temp_str,8,len(w_temp_str)-8)
	                 w_char="!EASTER"
	                 w_char2=substr(w_str,i+8)
	                 w_str = w_char1+w_char+w_char2
	                  i=i+len(w_char)-1
	         otherwise        
                         w_char1 = substr(w_str,1, i-1)
		         w_char =changechar(substr(w_str,i, 2))
		         w_char2 =  substr(w_str, i+2)
		         w_str = w_char1+w_char+w_char2
		         i = i + len(w_char) -1
	     endcase	         
	endif
	i = i +1
enddo
*messagebox(w_str)
*set device to printer 
*display tt.shipmark+chr(10)+chr(10)+w_str to printer 
*set device to screen
*messagebox(d)

return w_str

function changechar(w_para)
	private cVar
	cVar = alltrim(w_para)
	do case 
		case cVar ="!A"
			return alltrim(w_pack_qty)
		case cVar = "!C"
			return alltrim(w_carton)
		case cVar = "!D"
			return alltrim(w_desp)
		case cVar =  "!I"
			 return alltrim(w_item)
		case cVar = "!M"
			return alltrim(w_material)
		case cVar = "!O"
			return alltrim(w_origin)
		case cVar = "!P"
			return alltrim(w_po_no)
		case cVar = "!S"
*			if w_sku_no = .f.
*				return ""
*			else
				return alltrim(w_sku_no)
*			endif
                case cVar="! "
                        return "! "
		otherwise 
			return " <>Error<> "
	endcase 