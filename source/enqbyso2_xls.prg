if reccount("wenqbyso") = 0
   return
endif    
eole=CreateObject("Excel.Application")
*eole.Workbooks.Open(curdir()+"xls_format\"+"enqbyitem.xls")
eole.Workbooks.Open(sys(5)+curdir()+"xls_format\"+"enqbyso2.xls")

select wenqbyso
go top

i=1
do while !eof()
       	eole.cells(7+i,1)="'"+wenqbyso.item_no
       	eole.cells(7+i,2)="'"+wenqbyso.so_no
         eole.cells(7+i,3)=wenqbyso.cust_no
         eole.cells(7+i,4)=wenqbyso.oc_no
         eole.cells(7+i,5)=wenqbyso.qty
 	eole.cells(7+i,6)="'"+wenqbyso.inv_no
	eole.cells(7+i,7)=wenqbyso.po_no
	eole.cells(7+i,8)="'"+wenqbyso.vessel
	eole.cells(7+i,9)=dtoc(wenqbyso.del_date)
	eole.cells(7+i,10)=wenqbyso.user_id
	   
       w_range="A"+alltrim(str(7+i))+":"+"K"+alltrim(str(7+i))
       eole.activesheet.range(w_range).borders(4).linestyle=1
      w_range="A"+alltrim(str(7+i))+":"+"K"+alltrim(str(7+i))
       eole.activesheet.range(w_range).borders(1).linestyle=1   	         
      w_range="A"+alltrim(str(7+i))+":"+"K"+alltrim(str(7+i))
       eole.activesheet.range(w_range).borders(2).linestyle=1
       
          i=i+1
          select wenqbyso
          skip
     enddo 
     
     eole.cells(5,1)="Print Date: " +dtoc(date())+" "+substr(time(),1,5)
     
     if  empty(w_from_item) and empty(w_to_item)
          eole.ActiveWorkbook.SaveAs(alltrim(syswork)+"\"+"enqbyso_all")
     endif

if !empty(w_from_item) and !empty(w_to_item)
    eole.ActiveWorkbook.SaveAs(alltrim(syswork)+"\"+"enqbyso_"+alltrim(w_from_item)+"_"+alltrim(w_to_item))
endif

if !empty(w_from_item) and empty(w_to_item)
	 eole.ActiveWorkbook.SaveAs(alltrim(syswork)+"\"+"enqbyso_"+alltrim(w_from_item))
endif

if empty(w_from_item) and !empty(w_to_item)
	 eole.ActiveWorkbook.SaveAs(alltrim(syswork)+"\"+"enqbyso_"+alltrim(w_to_item))
	 
endif

eole.ActiveWorkbook.Close

