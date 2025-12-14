function sumsm(inv_no)
*     inv_no="HI/0068/03"     
     total_sm=""
     select * from wpacklist where alltrim(wpacklist.inv_no)==alltrim(inv_no);
     	into cursor test
     go top
     locate for alltrim(wpacklist.inv_no)==alltrim(inv_no)
     do while alltrim(wpacklist.inv_no)==alltrim(inv_no) and !eof()
          total_sm=total_sm+test.ship_mark
 *        total_sm=wpacklist.ship_mark
          skip
     enddo     
     
     select test
     use
     select wpacklist 
     
     return(total_sm)	
    