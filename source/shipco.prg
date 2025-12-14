function shipco(w_ship, a,b,c,d,e,f,g,h,i)
*a = 111
*b = tt.qty
*c = tt.desp
*d = tt.item_no
*e = tt.material
*f = tt.origin
*g = tt.po_no
*h = tt.skn
*i=rp_remark_2

public w_pack_qty, w_carton, w_desp , w_item, w_material, w_origin, w_po_no, w_sku_no, w_rp_rmk_2

w_pack_qty = alltrim(str(a))
w_carton = alltrim(str(b))
w_desp = c
w_item = d
w_material = e
w_origin = f
w_po_no = g
w_sku_no = h
w_rp_rmk_2=i

w_temp_str=w_ship
w_str=""
*w_str = tt.shipmark
*messagebox(w_str)
*return 
w_cut = ""
break_pos=at("!",w_temp_str)
do while break_pos > 0
     w_str=w_str+ substr(w_temp_str,1,break_pos -1)
     w_temp_str=substr(w_temp_str,break_pos,len(w_temp_str)-break_pos+1)
      do case 
           case at("!EASTER",upper(w_temp_str)) = 1
                   w_str=w_str+substr(w_temp_str,1,7)
                   w_temp_str=substr(w_temp_str,7+1,len(w_temp_str)-7)
           case at("!VALENTINE",upper(w_temp_str)) = 1
                   w_str=w_str+substr(w_temp_str,1,10)
                   w_temp_str=substr(w_temp_str,10+1,len(w_temp_str)-10)
           case at("!CHRISTMAS",upper(w_temp_str)) = 1
                   w_str=w_str+substr(w_temp_str,1,10)
                   w_temp_str=substr(w_temp_str,10+1,len(w_temp_str)-10) 
           case at("!HALLOWEEN",upper(w_temp_str)) = 1
                   w_str=w_str+substr(w_temp_str,1,10)
                   w_temp_str=substr(w_temp_str,10+1,len(w_temp_str)-10) 
           case at("!CHANAAK",upper(w_temp_str)) = 1
                   w_str=w_str+substr(w_temp_str,1,8)
                   w_temp_str=substr(w_temp_str,8+1,len(w_temp_str)-8)
           case at("! EASTER",upper(w_temp_str)) = 1
                   w_str=w_str+substr(w_temp_str,1,8)
                   w_temp_str=substr(w_temp_str,8+1,len(w_temp_str)-8)
           case at("! VALENTINE",upper(w_temp_str)) = 1
                   w_str=w_str+substr(w_temp_str,1,11)
                   w_temp_str=substr(w_temp_str,11+1,len(w_temp_str)-11)
           case at("!CHRISTMAS ",upper(w_temp_str)) = 1
                   w_str=w_str+substr(w_temp_str,1,11)
                   w_temp_str=substr(w_temp_str,11+1,len(w_temp_str)-11) 
           case at("!HALLOWEEN ",upper(w_temp_str)) = 1
                   w_str=w_str+substr(w_temp_str,1,11)
                   w_temp_str=substr(w_temp_str,11+1,len(w_temp_str)-11) 
           case at("!CHANAAK ",upper(w_temp_str)) = 1
                   w_str=w_str+substr(w_temp_str,1,9)
                   w_temp_str=substr(w_temp_str,9+1,len(w_temp_str)-9)                                      
           OTHERWISE
                    w_str=w_str+changechar(substr(w_temp_str,1,2))
                   w_temp_str=substr(w_temp_str,2+1,len(w_temp_str)-2)
      endcase    
      break_pos=at("!",w_temp_str)          
enddo
w_str=w_str+w_temp_str
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
		case cVar = "!R"
			return alltrim(rp_rmk_2)	
		case cVar = "!S"
		
		*	if w_sku_no = .f.
*				return ""
*			else
				return alltrim(w_sku_no)
*			endif
        case cVar="! " 
             return "! "
        case left(cVar,1)="!" and asc(substr(cVar,2,1))=13
             return cVar        
		otherwise 
			return " <>Error<> "
	endcase 