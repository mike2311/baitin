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
set order to itg

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

         IF at("GROUP", UPPER(eole.cells(w_row,1).text))= 0
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

DIMENSION arrayHtsField[w_col,2]
intLastField_mHTS=1

FOR i = 1 TO w_col
	strColHeader = UPPER(ALLTRIM(eole.cells(w_header_row,i).text))
	************
	*Map for working variables
	DO CASE 
		CASE "GROUP"==alltrim(upper(strColHeader)) 
			arrayHtsField[intLastField_mHTS,1] = "w_group"	
		CASE at("PCNT",upper(strColHeader))> 0 
			arrayHtsField[intLastField_mHTS,1] = "w_percent"
		CASE at("HTS",upper(strColHeader))>0
			arrayHtsField[intLastField_mHTS,1] = "w_hts_no"			
		CASE at("DESCRIPTION",upper(alltrim(strColHeader)))= 1
			arrayHtsField[intLastField_mHTS,1] = "w_desp"
		CASE at("DUTY RATE",upper(strColHeader)) > 0
		  	arrayHtsField[intLastField_mHTS,1] = "w_duty_rate"
          	OTHERWISE
			arrayHtsField[intLastField_mHTS,1] = ""									
	ENDCASE 
	IF !EMPTY(arrayHtsField[intLastField_mHTS,1])
	     arrayHtsField[intLastField_mHTS,2] = i
	     intLastField_mHTS= intLastField_mHTS+ 1
	ENDIF
ENDFOR 

intLastField_mHTS = intLastField_mHTS- 1

*********************************************************************************************

*********************************************************************************************
*** Start Capture to working variables

w_hts_memo=""
j = w_header_row + 1
FOR i = 1 TO intLastField_mHTS        && loop for every field
	strFieldName =arrayHtsField[i,1]
	strFieldValue = eole.cells(j,arrayHtsField[i,2]).text
	&strFieldName=strFieldValue
ENDFOR
w_header_row=w_header_row + 1
w_prev_group = w_group

if empty(w_duty_rate) 
   w_duty_rate = "0"
endif
  
w_temp_hts_memo =  substr(w_hts_no, 1,4)+"."+substr(w_hts_no,5,2)+"."+substr(w_hts_no, 7,4)+"."+substr(w_hts_no,11,1)+;
                                       " duty "+alltrim(w_duty_rate)+"%"+;
                                       " - "+alltrim(w_desp)+ " "+alltrim(w_percent)+"%"
w_hts_memo =  w_temp_hts_memo
FOR j = w_header_row + 1 TO w_Total_row    && loop for every item
  	FOR i = 1 TO intLastField_mHTS        && loop for every field
		strFieldName =arrayHtsField[i,1]
		strFieldValue = eole.cells(j,arrayHtsField[i,2]).text
		&strFieldName=strFieldValue
        ENDFOR
        if empty(w_duty_rate) 
            w_duty_rate = "0"
        endif
        if w_group <> w_prev_group 
            select mitem
            set order to itg
            seek w_prev_group+space(10-len(alltrim(w_prev_group)))
            do while !eof() and alltrim(mitem.tariff_group)== alltrim(w_prev_group) 
                 if alltrim(mitem.import_ref)==alltrim(w_ref) 
                    replace mitem.htc_no with w_hts_memo
                 endif   
                 select mitem
                 skip
            enddo
            w_prev_group = w_group
            w_temp_hts_memo =  substr(w_hts_no, 1,4)+"."+substr(w_hts_no,5,2)+"."+substr(w_hts_no, 7,4)+"."+substr(w_hts_no,11,1)+;
                                       " duty "+alltrim(w_duty_rate)+"%"+;
                                       " - "+alltrim(w_desp)+ " "+alltrim(w_percent)+"%"
            w_hts_memo =  w_temp_hts_memo
        else
            w_temp_hts_memo =  substr(w_hts_no, 1,4)+"."+substr(w_hts_no,5,2)+"."+substr(w_hts_no, 7,4)+"."+substr(w_hts_no,11,1)+;
                                       " duty "+alltrim(w_duty_rate)+"%"+;
                                       " - "+alltrim(w_desp)+ " "+alltrim(w_percent)+"%"
            if empty(w_hts_no) and len(alltrim(w_hts_no))= 11
               w_hts_meno = w_temp_hts_memo
            else
               w_hts_memo = w_hts_memo + chr(10) +  w_temp_hts_memo
            endif
        endif        
        WAIT WINDOW "Import HTS data  ...  -" + alltrim(w_group) + " ... " + alltrim(str(w_header_row)) + " / " + alltrim(str(w_Total_row)) NOWAIT AT 28,60
         w_header_row=w_header_row + 1
ENDFOR
eole.Workbooks.close
WAIT WINDOW "Import  Item Data  ... Completed " AT 28,70

