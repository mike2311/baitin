FUNCTION SET_COLOR()
do case
     case voe1.cxl_flag <> 0
            RETURN ("RGB(255,255,0)")
     case iif(voe1.cost <=0,100,round(((voe1.price *getExRate('US$'))-(voe1.cost * getExRate(cur_code))) / (voe1.cost * getExRate(cur_code))* 100,2))< 40       
            RETURN ("RGB(255,0,0)")
     case count_moebom(voe1.oe_no, voe1.item_no) > 1
            RETURN ("RGB(255,180,255)")
     otherwise
            RETURN ("RGB(255,255,255)")       
endcase
                     
