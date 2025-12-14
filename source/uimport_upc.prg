SET SAFE OFF
Public w_field_no, finished, w_cust_no, w_detail_pos, w_ship_from, w_ship_to, w_po_no, w_port_row, w_port_col, w_port_column
Public w_port_po, w_port, w_port_qty, w_min, w_max, w_max_index, w_min_index, temp_item_no, temp_pony_item
Public w_pack_pc_1, w_pack_pc_2, w_pack_pc_3, w_pack_pc_4,w_pack_desp_1, w_pack_desp_2, w_pack_desp_3, w_pack_desp_4, w_mod
Public n_item_no, n_skn_no, n_inner, n_master, n_qty, n_ctn, n_price, n_maker, n_remark, n_po_no, n_port, n_retail_1,n_retail_2, n_ship_from, n_ship_to
Local w_row, w_col
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
set order to iupcprefix

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
         IF at("FW", UPPER(eole.cells(w_row,1).text))= 0
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
endif
w_Total_row = w_header_row+1
DO WHILE .T.
	IF EMPTY(ALLTRIM(eole.cells(w_Total_row ,4).text)) &&   Exit Program if UPC data is empty
		EXIT
	ELSE
		w_Total_row= w_Total_row+1	
	ENDIF
	IF w_Total_row >= 5000
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

DIMENSION arrayUPCField[w_col,2]
intLastField_mUPC=1

FOR i = 1 TO w_col
	strColHeader = UPPER(ALLTRIM(eole.cells(w_header_row,i).text))
	************
	*Map for working variables
	DO CASE 
		CASE at("FW",upper(strColHeader))> 0 
			arrayUPCField[intLastField_mUPC,1] = "w_item_no"
		CASE at("UPC01",upper(strColHeader))>0
			arrayUPCField[intLastField_mUPC,1] = "w_upc_01"			
		CASE at("UPC02",upper(strColHeader))>0
			arrayUPCField[intLastField_mUPC,1] = "w_upc_02"	
		CASE at("UPC03",upper(strColHeader))>0
			arrayUPCField[intLastField_mUPC,1] = "w_upc_03"	
		CASE at("UPC04",upper(strColHeader))>0
			arrayUPCField[intLastField_mUPC,1] = "w_upc_04"
		CASE at("UPC05",upper(strColHeader))>0
			arrayUPCField[intLastField_mUPC,1] = "w_upc_05"
		CASE at("UPC06",upper(strColHeader))>0
			arrayUPCField[intLastField_mUPC,1] = "w_upc_06"
		CASE at("UPC07",upper(strColHeader))>0
			arrayUPCField[intLastField_mUPC,1] = "w_upc_07"
		CASE at("UPC08",upper(strColHeader))>0
			arrayUPCField[intLastField_mUPC,1] = "w_upc_08"
		CASE at("UPC09",upper(strColHeader))>0
			arrayUPCField[intLastField_mUPC,1] = "w_upc_09"
		CASE at("UPC10",upper(strColHeader))>0
			arrayUPCField[intLastField_mUPC,1] = "w_upc_10"																																								
          	OTHERWISE
			arrayUPCField[intLastField_mUPC,1] = ""									
	ENDCASE 
	IF !EMPTY(arrayUPCField[intLastField_mUPC,1])
	     arrayUPCField[intLastField_mUPC,2] = i
	     intLastField_mUPC= intLastField_mUPC+ 1
	ENDIF
ENDFOR 

intLastField_mUPC = intLastField_mUPC- 1

*********************************************************************************************

*********************************************************************************************
*** Start Capture to working variables

FOR j = w_header_row + 1 TO w_Total_row    && loop for every item
  	FOR i = 1 TO intLastField_mUPC        && loop for every field
		strFieldName =arrayUPCField[i,1]
		strFieldValue = eole.cells(j,arrayUPCField[i,2]).text
		&strFieldName=strFieldValue
        ENDFOR
        if !empty(w_item_no)
            select mitem
            set order to item_no
            seek w_item_no
            if !eof()
                w_upc_prefix = mitem.upc_prefix
            else
                 w_upc_prefix = ""
                 messagebox("Item No. :"+alltrim(w_item_no)+ " not exist", 0+16,"Error Message")
            endif           
            w_upc_memo = alltrim(w_upc_prefix)+substr(alltrim(w_upc_01),1,5)+ substr(alltrim(w_upc_01),7,len(alltrim(w_upc_01))-6)
        else
            w_upc_memo = w_upc_memo +chr(10)+alltrim(w_upc_prefix)+alltrim(w_upc_01)    
        endif
        for k = 2 to 10
             w_upc_field = "w_upc_"+strzero(k,2)
             if !empty(&w_upc_field)
                 w_upc_memo =  w_upc_memo + chr(10)+alltrim(w_upc_prefix)+substr(alltrim(&w_upc_field),1,5)+ substr(alltrim(&w_upc_field),7,len(alltrim(&w_upc_field))-6)
             endif    
        endfor     
        select mitem
        if alltrim(mitem.import_ref)==alltrim(w_ref)
           replace mitem.upc_no with w_upc_memo
        endif   
        w_save_item_no = mitem.item_no
        w_pony_item = mitem.pony_item
        if !empty(w_pony_item)
            seek w_pony_item
            if !eof()
                if alltrim(mitem.import_ref)==alltrim(w_ref)
                    replace mitem.upc_no with w_upc_memo
                endif     
            else
                messagebox("Pony Item No. :"+alltrim(w_pony_item)+ " not exist", 0+16,"Error Message")
             endif      
             select mitem
             seek w_save_item_no
        endif          
        WAIT WINDOW "Import UPC data  ...  -" + alltrim(w_item_no) + " ... " + alltrim(str(w_header_row)) + " / " + alltrim(str(w_Total_row)) NOWAIT AT 28,60
         w_header_row=w_header_row + 1
ENDFOR
eole.Workbooks.close
WAIT WINDOW "Import  Item Data  ... Completed " AT 28,70

