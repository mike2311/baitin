SET SAFE OFF
Public w_field_no, finished, w_cust_no, w_detail_pos, w_ship_from, w_ship_to, w_po_no, w_port_row, w_port_col, w_port_column
Public w_port_po, w_port, w_port_qty, w_min, w_max, w_max_index, w_min_index, temp_item_no, temp_pony_item
Public w_pack_pc_1, w_pack_pc_2, w_pack_pc_3, w_pack_pc_4,w_pack_desp_1, w_pack_desp_2, w_pack_desp_3, w_pack_desp_4, w_mod
Public n_item_no, n_skn_no, n_inner, n_master, n_qty, n_ctn, n_price, n_maker, n_remark, n_po_no, n_port, n_retail_1,n_retail_2, n_ship_from, n_ship_to
Public w_item_no, w_pony_item, w_cost_cur
Local w_row, w_col
w_cost_cur = ""
w_pack_desp_1=""
w_pack_desp_2=""
w_pack_desp_3=""
w_pack_desp_4=""
prev_item_no = "ZZZ12345"
w_rol=1
w_col=1
w_row = 1

If !used("mitem")
   use baitin!mitem in 0 SHARED 
endif   
select mitem
set order to item_no

*********************************************************************************************
*** Open Xls
IF EMPTY(strxlsFileName)
	strxlsFileName = GETFILE("xls")
	IF EMPTY(strxlsFileName)
		RETURN
	ENDIF
ENDIF

eole=CREATEOBJECT('Excel.application')
eole.Workbooks.Open(strxlsFileName)
*eole.visible=.t.
* locate_header_record
w_ref = ""
DO WHILE .T.
        if at("REF", upper(eole.cells(w_row,1).text) ) > 0
           w_pos = at(":", eole.cells(w_row,1).text)
           w_ref = alltrim(substr(eole.cells(w_row,1).text, w_pos+1, len(alltrim(eole.cells(w_row,1).text))- w_pos ))
         endif
        if at("REMARK", upper(eole.cells(w_row,1).text) ) > 0
           w_pos = at(":", eole.cells(w_row,1).text)
           w_remark = alltrim(substr(eole.cells(w_row,1).text, w_pos+1, len(alltrim(eole.cells(w_row,1).text))- w_pos ))
         endif
   
	IF at("NUM", UPPER(eole.cells(w_row,1).text))= 0
 	   	w_row=w_row+1
	ELSE
		w_header_row=w_row
		EXIT 	
   	ENDIF
	IF w_row > 50
		=MESSAGEBOX("Invalid xls file format. Update Program stopped",48,"System Error Message")
		RETURN 0
	ENDIF 
ENDDO

if empty(w_ref)
   messagebox("Ref No. cannot be empty, program stoped!", 0+16, "Error Message")
   eole.Workbooks.close
   return
else
   select mitem
   set order to import_ref
   seek  w_ref
   if !eof()
       x = messagebox("Ref No. :"+alltrim(w_ref)+" already imported in "+dtoc(mitem.date)+". Do you want to delete previous records? ",4+32, "Warning Message")
       if x = 7
          return 
       else
          do while alltrim(w_ref)==alltrim(mitem.import_ref) and !eof()
               select mitem
               delete
               skip
          enddo  
          select mitemven
          set order to import_ref
          seek w_ref
          do while alltrim(w_ref)==alltrim(mitemven.import_ref) and !eof()
               select mitemven
               delete
               skip
           enddo    
       endif   
   endif
endif      

*select mitem
*witemlog_dbf = alltrim(syswork)+"\witemlog.dbf"
*copy structure to &witemlog
*use witemlog  exclusive in 0
*select witemlog
*zap

w_Total_row = w_header_row+1
DO WHILE .T.
	IF EMPTY(ALLTRIM(eole.cells(w_Total_row ,1).text))
		EXIT
	ELSE
		w_Total_row= w_Total_row+1	
	ENDIF
	IF w_Total_row >= 10000
		=MESSAGEBOX("Invalid xls file format. Update Program stopped",48,"System Error Message")
		eole.Workbooks.close
		RETURN 0
	ENDIF 		
ENDDO
w_Total_row = w_Total_row -1

*********************************************************************************************
*** Mapping Field
w_col = 1
CellTry = 10
DO WHILE .T.
	IF EMPTY(eole.cells(w_header_row,w_col).text)
		CellTry = CellTry - 1
		if CellTry <= 0
			EXIT
		else
			w_col = w_col + 1
		endif
	ELSE
		w_col = w_col + 1
		CellTry = 10
	ENDIF
ENDDO

DIMENSION arrayMitemField[w_col,2]
*strMQtyBrkFieldTable = "vMQtyField"
*strQtyBrkFieldTablePath = alltrim(syswork)+"\" + strMQtyBrkFieldTable +".dbf"
*CREATE TABLE &strQtyBrkFieldTablePath FREE (field_name c(30), row i, group i, value c(20))
intLastField_mITEM=1
*intmQtyBrk_group = 0

FOR i = 1 TO w_col
	strColHeader = UPPER(ALLTRIM(eole.cells(w_header_row,i).text))
	************
	*Map for Moe
	DO CASE 
		CASE at("FW ITEM",upper(strColHeader))> 0 
			arrayMitemField[intLastField_mITEM,1] = "item_no"
		CASE at("PONY ITEM",upper(strColHeader))>0
			arrayMitemField[intLastField_mITEM,1] = "pony_item"			
		CASE at("TICKLIST DESCRIPTION",upper(strColHeader))>0 
			arrayMitemField[intLastField_mITEM,1] = "short_name"
		CASE at("INNER",upper(strColHeader))> 0
			arrayMitemField[intLastField_mITEM,1] = "pack_pc_2"
		CASE at("OUTER",upper(strColHeader)) > 0
		  	arrayMitemField[intLastField_mITEM,1] = "pack_pc_3"
		CASE at("WEIGHT",upper(strColHeader))> 0 
			arrayMitemField[intLastField_mITEM,1] = "wt"			
		CASE at("CUBE",upper(strColHeader)) > 0
			arrayMitemField[intLastField_mITEM,1] = "cube"			
		CASE at("DUTY",upper(strColHeader)) > 0
			arrayMitemField[intLastField_mITEM,1] = "duty"
		CASE at("HTS NO",upper(strColHeader)) > 0
			arrayMitemField[intLastField_mITEM,1] = "htc_no"					
		CASE at("C/O",upper(strColHeader)) > 0 or at("C/0",upper(strColHeader)) > 0
			arrayMitemField[intLastField_mITEM,1] = "origin"				
		CASE at("STANDARD CODE",upper(strColHeader)) > 0
			arrayMitemField[intLastField_mITEM,1] = "std_code"				
		CASE at("REG PRICE",upper(strColHeader)) > 0
			arrayMitemField[intLastField_mITEM,1] = "price"	
		CASE at("PKGING DESCRIPTION",upper(strColHeader)) > 0
			arrayMitemField[intLastField_mITEM,1] = "pack_desp_1"
		CASE at("UPC PREFIX",upper(strColHeader)) > 0
			arrayMitemField[intLastField_mITEM,1] = "upc_prefix"
		CASE at("UPC CODE",upper(strColHeader)) > 0
			arrayMitemField[intLastField_mITEM,1] = "upc_code"
	        CASE at("CHECK DIGIT",upper(strColHeader)) > 0
			arrayMitemField[intLastField_mITEM,1] = "check_digit"					
		CASE at("VENDOR",upper(strColHeader)) > 0
			arrayMitemField[intLastField_mITEM,1] = "vendor_no" 
		CASE at("C CUR",upper(strColHeader)) > 0
			arrayMitemField[intLastField_mITEM,1] = "cost_cur"
		CASE at("COST",upper(strColHeader)) > 0
			arrayMitemField[intLastField_mITEM,1] = "cost" 
		CASE at("TARIFF",upper(strColHeader)) > 0
			arrayMitemField[intLastField_mITEM,1] = "tariff_group" 								 															
         	OTHERWISE
			arrayMitemField[intLastField_mITEM,1] = ""									
	ENDCASE 
	IF !EMPTY(arrayMitemField[intLastField_mITEM,1])
	     if arrayMitemField[intLastField_mITEM,1] = "item_no"
 	        w_item_no_col = i
 	     endif 
	     if arrayMitemField[intLastField_mITEM,1] = "pony_item"
 	        w_pony_item_col = i
 	     endif    	       
	     arrayMitemField[intLastField_mITEM,2] = i
	     intLastField_mITEM= intLastField_mITEM+ 1
	ENDIF
ENDFOR 

intLastField_mITEM = intLastField_mITEM- 1

*********************************************************************************************

*********************************************************************************************
*** Start Capture to MOE and mQtyBrk

strIndicator = ""
strITEMTable = "Mitem"
w_pack_pc_1=0
w_pack_pc_2=0
w_pack_pc_3=0
w_pack_pc_4=0
w_pack_desp=""
w_item_desp=""

FOR j = w_header_row + 1 TO w_Total_row    && loop for every item
        w_pony_item = eole.cells(j ,w_pony_item_col).text
        w_exist = .f.
        select mitem
        set order to item_no
        seek w_pony_item
        if !eof()
            w_exist = .t.
         endif
  
        w_item_no = eole.cells(j ,w_item_no_col).text        
        select mitem
        set order to item_no
        seek w_item_no
        if !eof()
            w_exist = .t.
        endif
        
        if w_exist = .t.
           do write_werrorlog
        else
           append blank
           replace mitem.item_no with w_item_no
           replace mitem.date with date()
           replace mitem.import_ref with w_ref
           replace mitem.int_remark with w_remark  
  	   FOR i = 1 TO intLastField_mITEM        && loop for every field
  	           select mitem
		   strFieldName =arrayMitemField[i,1]
	      	   strFieldValue = eole.cells(j,arraymitemField[i,2]).text
		   do case
		        case alltrim(strFieldName)  == "upc_code"        
		               w_upc_code = strFieldValue
		        case alltrim(strFieldName)  == "check_digit"        
		               w_check_digit = strFieldValue		            
		        case  alltrim(strFieldName) == "vendor_no" 
		               w_vendor_no = strFieldValue
		        case  alltrim(strFieldName) == "cost_cur" 
		               w_cost_cur = strFieldValue
		        case  alltrim(strFieldName) == "cost" 
		               w_cost = VAL(strtran(strFieldValue,",",""))		                 		                 
		        otherwise       		     
    		              DO CASE 
		                     CASE varTYPE(&strFieldName) = "N"
				               replace &strFieldName WITH VAL(strtran(strFieldValue,",",""))
		                     CASE varTYPE(&strFieldName) = "D"
				               replace &strFieldName WITH ctod(strFieldValue)
		                     OTHERWISE 
				               replace &strFieldName WITH strFieldValue
		               ENDCASE
		          ENDCASE     
		          do case
		               case alltrim(strFieldName)=="short_name"
		                       replace mitem.short_name with upper(mitem.short_name)
		                       replace mitem.desp with mitem.short_name
		               case alltrim(strFieldName)=="wt"    
		                       replace mitem.wt with round(mitem.wt / 2.2,2)
		               case alltrim(strFieldName)=="check_digit" 
		                       if !empty(mitem.upc_prefix)  and alltrim(mitem.upc_prefix) <> "0" 
		                           replace mitem.upc_no with alltrim(mitem.upc_prefix)+alltrim(w_upc_code)+alltrim(w_check_digit)
		                       endif    
		               case alltrim(strFieldName)=="htc_no" 
		                       if len(alltrim(mitem.htc_no)) = 11   
		                          replace mitem.htc_no with substr(mitem.htc_no,1,4)+"."+;
		                                                                     substr(mitem.htc_no,5,2)+"."+;
		                                                                     substr(mitem.htc_no,7,4)+"."+;
		                                                                     substr(mitem.htc_no,11,1)		                    		                         
		                       endif                                              
		               case alltrim(strFieldName)=="origin"
		                       select zorigin
		                       seek alltrim(strFieldValue)
		                       if !eof()
		                           select mitem
		                           replace mitem.origin with zorigin.origin
		                       else
		                            select mitem
		                       endif
		                 case alltrim(strFieldName)=="price"    
		                         replace mitem.price_cur with "US$"
		                 case alltrim(strFieldName) == "pack_pc_2"
		                         if mitem.pack_pc_2 > 0
		                            replace mitem.pack_desp_2 with "PCS. PER INNER CARTON"
		                         endif    
		                 case alltrim(strFieldName) == "pack_pc_3"
		                         if mitem.pack_pc_3 > 0
		                             if mitem.pack_pc_2 > 0		                
		                                 replace mitem.pack_desp_3 with "PCS. PER OUTER CARTON"
		                             else
		                                 replace mitem.pack_pc_2     with mitem.pack_pc_3
		                                 replace mitem.pack_desp_2  with "PCS. PER OUTER CARTON"
		                                 replac mitem.pack_pc_3       with 0    
		                             endif    
		                        endif
		                 case alltrim(strFieldName)=="cost"
		                         if !empty(w_vendor_no)
		                             select  mitemven
		                            w_item_no=alltrim(w_item_no)+space(15-len(alltrim(w_item_no)))
		                            w_vendor_no=alltrim(w_vendor_no)+space(10-len(alltrim(w_vendor_no)))
		                            seek w_item_no + w_vendor_no
		                            if eof()
		                               append blank
		                               replace mitemven.item_no with w_item_no
		                               replace mitemven.vendor_no with upper(w_vendor_no)
		                               replace mitemven.import_ref with w_ref
		                            endif
		                            replace mitemven.fob with w_cost
		                            replace mitemven.cur_code with w_cost_cur
		                            replace mitemven.eff_date  with date()	                         		                     		              
		                        endif   
		             Endcase
                  ENDFOR
              endif         
	temp_item_no = mitem.item_no
	temp_pony_item = mitem.pony_item
	if alltrim(temp_pony_item) = "FALSE" or empty(mitem.pony_item)
	   replace mitem.pony_item with ""
	else   
	   do handle_pony_item
	endif   
	WAIT WINDOW "Import MITEM  ... ITEM -" + alltrim(w_item_no) + " ... " + alltrim(str(j-w_header_row)) + " / " + alltrim(str(w_Total_row-w_header_row)) NOWAIT AT 28,60
     ENDFOR

If reccount("werrorlog") > 0
    werrorlog_xls = alltrim(syswork)+"\werrorlog.xls"
    select werrorlog
    copy to &werrorlog_xls type xls
endif

eole.Workbooks.close
WAIT WINDOW "Import  Item Data  ... Completed " AT 28,70

    
    


Procedure write_witemlog
     select mitem
     scatter to tempitem memo
     select witemlog
     append blank
     gather from tempitem memo

Procedure write_werrorlog
     select werrorlog
     append blank
     replace row_no with j
     replace werrorlog.item_no     with w_item_no
     replace werrorlog.pony_item with w_pony_item
 
Procedure handle_pony_item
	select mitem
	scatter to tempitem memo
	set order to item_no
	seek temp_pony_item
 *      swap item no and pony item no 
         temp_item_no = tempitem(1)
         tempitem(1)= temp_pony_item
         tempitem(29)=temp_item_no
         select mitem
	append blank
	gather from tempitem memo
	    
        select mitemven
        set order to IITERMVEN
        seek alltrim(temp_item_no)+space(15-len(alltrim(temp_item_no)))+;
	                      alltrim(mitemven.vendor_no)+space(10-len(alltrim(mitemven.vendor_no)))
	if !eof()
	    scatter to temp_mitemven
	    temp_mitemven(1)=mitem.item_no
	    select mitemven
	    append blank
	    gather from temp_mitemven
	    replace mitemven.import_ref with w_ref
	endif
	                      
		                