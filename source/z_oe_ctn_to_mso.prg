SELECT MSO
SET FILTER TO CONF_NO = "HT-OC/227/06"
do while !eof()
     select moe
     locate for alltrim(substr(mso.conf_no, 7, len(mso.conf_no) - 7 +1)) == alltrim(moe.oe_no) and;
                     alltrim(mso.item_no) == alltrim(moe.item_no) and;
                     alltrim(mso.po_no) == alltrim(moe.po_no)
      select mso
     replace mso.ctn with moe.ctn
     select mso
     skip
 enddo                    
