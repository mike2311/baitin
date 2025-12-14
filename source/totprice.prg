function totprice(f_w_cur, f_w_price,f_prog_id,f_cust_no)
    do case
        case w_password="HT"
                f_w_cur = alltrim(f_w_cur)
        	if substr(alltrim(f_w_cur),1,2) = "HK"
	           return round(f_w_price,1)
	        endif
	        if substr(alltrim(f_w_cur),1,2) = "US"
		   return round(f_w_price,2)
	        endif
	case w_password="BAT"
	        do case 
	             case F_prog_id = "PCONFIRM" or F_prog_id="PINVOICE"
	                     do case
	                          case f_cust_no = "F.W." or f_cust_no = "E.U."
	                                 return round(f_w_price,2)
	                          otherwise
	                                 return round(f_w_price,1)
	                     endcase    
	             case F_prog_id="PCONTRACT"
	                     return round(f_w_price,1)                
                 endcase
    endcase
  
	                                      
	return f_w_price