SELECT mcontdt
SET FILTER TO CONF_NO = "HT-OC/227/06"
do while !eof()
     select moe
     locate for alltrim(substr(mcontdt.conf_no, 7, len(mcontdt.conf_no) - 7 +1)) == alltrim(moe.oe_no) and;
                     alltrim(mcontdt.item_no) == alltrim(mcontdt.item_no) and;
                     alltrim(mcontdt.po_no) == alltrim(moe.po_no)
      select mcontdt
     replace mcontdt.ctn with moe.ctn
     select mcontdt
     skip
 enddo                    
