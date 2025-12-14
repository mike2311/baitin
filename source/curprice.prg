function curprice(f_w_cur, f_w_price)
   do case
        case w_password="HT"
                f_w_cur = alltrim(f_w_cur)
        	if substr(alltrim(f_w_cur),1,2) = "HK"
	          return round(f_w_price,1)
	         
	        endif
	        if substr(alltrim(f_w_cur),1,2) = "US"
		   return round(f_w_price,2)
	        endif
	case w_password="BAT" or w_password = "HFW"
	        do case 
	             case w_cust_type=1
*	                     return round(f_w_price,1)     requested by Carman 090514
	                     return round(f_w_price,2)	                     
	             case w_cust_type=2
	                     return round(f_w_price,2)
                endcase
 endcase
                                      
return f_w_price