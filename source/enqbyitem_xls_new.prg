if reccount("wenqbyitem") = 0
   return
endif    
eole=CreateObject("Excel.Application")
*eole.Workbooks.Open(curdir()+"xls_format\"+"enqbyitem.xls")
eole.Workbooks.Open(sys(5)+curdir()+"xls_format\"+"enqbyitem_new.xls")

*w_makedir="\xls_format"
*if directory(w_makedir)=.T.
*	eole.Workbooks.Open(w_makedir+"\enqbyitem.xls")
*else
*	md(w_makedir)
*	copy file enqbyitem.xls to w_makedir+"\enqbyitem.xls"
*	eole.Workbooks.Open(w_makedir+"\enqbyitem.xls")
*endif

eole.visible=.t.

select wenqbyitem
go top

i=1
do while !eof()

       	eole.cells(7+i,1)="'"+wenqbyitem.item_no
       	eole.cells(7+i,2)="'"+wenqbyitem.skn_no
         eole.cells(7+i,3)=wenqbyitem.cust_no
         eole.cells(7+i,4)=wenqbyitem.oe_no
         eole.cells(7+i,5)=dtoc(wenqbyitem.date)
 	eole.cells(7+i,6)="'"+wenqbyitem.po_no
	eole.cells(7+i,7)=wenqbyitem.qty
	eole.cells(7+i,8)="'"+wenqbyitem.packing
	eole.cells(7+i,9)=wenqbyitem.vendor_no
	eole.cells(7+i,10)=wenqbyitem.maker
	eole.cells(7+i,11)=wenqbyitem.price
	eole.cells(7+i,12)=wenqbyitem.cur_code
	eole.cells(7+i,13)=wenqbyitem.cost
	eole.cells(7+i,14)=wenqbyitem.lcl
	eole.cells(7+i,15)=wenqbyitem.rp_rmk_1
	eole.cells(7+i,16)=wenqbyitem.rp_rmk_2
	eole.cells(7+i,17)=wenqbyitem.fob_port
	if !empty(wenqbyitem.maker_sd)
	   eole.cells(7+i,18)=wenqbyitem.maker_sd
	endif    
	eole.cells(7+i,19)=wenqbyitem.ship_qty
	eole.cells(7+i,20)=dtoc(wenqbyitem.del_date)
	eole.cells(7+i,21)=wenqbyitem.balance
	eole.cells(7+i,22)=wenqbyitem.std_desp
	eole.cells(7+i,23)=wenqbyitem.ss_year  
	eole.cells(7+i,24)=wenqbyitem.cxl_rson
       w_range="A"+alltrim(str(7+i))+":"+"X"+alltrim(str(7+i))
       eole.activesheet.range(w_range).borders(4).linestyle=1
      w_range="A"+alltrim(str(7+i))+":"+"X"+alltrim(str(7+i))
       eole.activesheet.range(w_range).borders(1).linestyle=1   	         
      w_range="A"+alltrim(str(7+i))+":"+"X"+alltrim(str(7+i))
       eole.activesheet.range(w_range).borders(2).linestyle=1
       
          i=i+1
          select wenqbyitem
          skip
enddo 
     
     eole.cells(5,1)="Print Date: " +dtoc(date())+" "+substr(time(),1,5)

do case      
     case empty(w_from_item) and empty(w_to_item)
            eole.ActiveWorkbook.SaveAs(alltrim(syswork)+"\"+"item_all")
     case !empty(w_from_item) and !empty(w_to_item)
             eole.ActiveWorkbook.SaveAs(alltrim(syswork)+"\item_"+alltrim(w_from_item)+"_"+alltrim(w_to_item))
     case !empty(w_from_item) and empty(w_to_item)
	    eole.ActiveWorkbook.SaveAs(alltrim(syswork)+"\item_"+alltrim(w_from_item))
     case empty(w_from_item) and !empty(w_to_item)
	    eole.ActiveWorkbook.SaveAs(alltrim(syswork)+"\item_"+alltrim(w_to_item))
endcase


