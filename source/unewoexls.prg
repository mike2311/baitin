lparameter strdate, strCustCode, strOE_NO, strxlsFileName 
SET SAFE OFF
Public w_field_no, finished, w_cust_no, w_detail_pos, w_ship_from, w_ship_to, w_po_no, w_port_row, w_port_col, w_port_column
Public w_port_po, w_port, w_port_qty, w_min, w_max, w_max_index, w_min_index
Public w_pack_pc_1, w_pack_pc_2, w_pack_pc_3, w_pack_pc_4,w_pack_desp_1, w_pack_desp_2, w_pack_desp_3, w_pack_desp_4
Public n_item_no, n_skn_no, n_inner, n_master, n_qty, n_ctn, n_price, n_maker, n_remark, n_po_no, n_port, n_retail_1,n_retail_2, n_ship_from, n_ship_to
Public w_fw_ref, w_w_ht_ref, w_po_no, w_first_sd, w_last_sd, w_fw_comm, w_oe_comm
Local w_row, w_col
w_fw_comm=""
w_oe_comm=""
w_rol=1
w_col=1
w_row = 1
if empty(strdate)
	strdate = date()
endif



*SELECT * FROM moe INTO TABLE c:\batwork\vWorkMoe.tmp WHERE .F.
*SELECT * FROM mqtybrk INTO TABLE c:\batwork\vWorkmQtybrk.tmp WHERE .F.

*********************************************************************************************
*** Check Customer
if empty(strCustCode)
   =MESSAGEBOX("Customer cannot be located. Update program stoped.",48,"System Error Message")
    RETURN 0
endif      
select * FROM mcustom INTO CURSOR vtmpCHKCUST WHERE alltrim(mcustom.cust_no)== alltrim(strCustCode)
if eof()
    =MESSAGEBOX("Customer No. : "+alltrim(w_cust_no) + " not exist. Update program stoped.",48,"System Error Message")
    RETURN 0
endif   

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

* locate_header_data
DO WHILE at("ITEM", upper(eole.cells(w_row,1).text)) = 0
       if at ("FW REF", upper(eole.cells(w_row,1).text)) > 0
           w_fw_ref=eole.cells(w_row,2).text
        endif
       if at ("P.O.", upper(eole.cells(w_row,1).text)) > 0 or at ("PO ", upper(eole.cells(w_row,1).text)) > 0 or;
          at ("P. O.", upper(eole.cells(w_row,1).text)) > 0
           w_po_no=eole.cells(w_row,2).text
        endif
       if at ("FIRST", upper(eole.cells(w_row,1).text)) > 0
           w_first_sd=ctod(eole.cells(w_row,3).text)
        endif
       if at ("LAST", upper(eole.cells(w_row,1).text)) > 0
           w_last_sd=ctod(eole.cells(w_row,3).text)
        endif                        
        w_row=w_row+1
	IF w_row > 50
		=MESSAGEBOX("Invalid xls file format. Update Program stopped",48,"System Error Message")
		RETURN 0
	ENDIF 
ENDDO

w_header_row=w_row

w_Total_row = w_header_row+1
DO WHILE .T.
	IF EMPTY(ALLTRIM(eole.cells(w_Total_row ,1).text))
		EXIT
	ELSE
		w_Total_row= w_Total_row+1	
	ENDIF
	IF w_Total_row >= 10000
		=MESSAGEBOX("Invalid xls file format. Update Program stopped",48,"System Error Message")
		RETURN 0
	ENDIF 		
ENDDO
w_Total_row = w_Total_row -1
*********************************************************************************************


*** Mapping Field
w_col = 1
DO WHILE  !EMPTY(eole.cells(w_header_row,w_col).text)
      w_col = w_col + 1
ENDDO
w_col = w_col -1 


DIMENSION arrayMoeField[w_col,2]
*strMQtyBrkFieldTable = "vMQtyField"
*strQtyBrkFieldTablePath = "c:\batwork\" + strMQtyBrkFieldTable +".dbf"
*CREATE TABLE &strQtyBrkFieldTablePath FREE (field_name c(30), row i, group i, value c(20))
intLastField_mOE=1
*intmQtyBrk_group = 0
FOR i = 1 TO w_col
	strColHeader = UPPER(ALLTRIM(eole.cells(w_header_row,i).text))
	************
	*Map for Moe
	DO CASE 
*		CASE at("MAKER", strColHeader ) > 0
*			arrayMoeField[intLastField_mOE,1] = "maker"

		CASE strColHeader == "ITEM"
			arrayMoeField[intLastField_mOE,1] = "item_no"
			
		CASE strColHeader = "SKN"
			arrayMoeField[intLastField_mOE,1] = "skn_no"

		CASE strColHeader = "SELL PRICE"
			arrayMoeField[intLastField_mOE,1] = "price"

		CASE strColHeader == "VENDOR"
			arrayMoeField[intLastField_mOE,1] = "vendor_no"

		CASE AT(" FIRST ",upper(strColHeader)) > 0 or  AT(" FROM ",upper(strColHeader)) > 0
			arrayMoeField[intLastField_mOE,1] = "from_date"

		CASE AT(" LAST ",upper(strColHeader)) > 0 or  AT(" TO ",upper(strColHeader)) > 0
			arrayMoeField[intLastField_mOE,1] = "to_date"						

		CASE upper(strColHeader) == "ITEM PO"
			arrayMoeField[intLastField_mOE,1] = "po_no"			

		CASE strColHeader = "TOTAL QTY"
			arrayMoeField[intLastField_mOE,1] = "qty"

		CASE strColHeader = "TOTAL CTN"
			arrayMoeField[intLastField_mOE,1] = "ctn"

		CASE strColHeader = "INNER"
			arrayMoeField[intLastField_mOE,1] = "pack_pc_2"

		CASE strColHeader = "MASTER"
			arrayMoeField[intLastField_mOE,1] = "pack_pc_3"

		CASE strColHeader = "RETAIL2"
			arrayMoeField[intLastField_mOE,1] = "rp_remark_2"
			
		CASE strColHeader = "RETAIL $"
			arrayMoeField[intLastField_mOE,1] = "rp_remark_1"

		CASE strColHeader = "COMMENT"
			arrayMoeField[intLastField_mOE,1] = "remark"

		OTHERWISE
			
	ENDCASE 
	IF !EMPTY(arrayMoeField[intLastField_mOE,1])
		arrayMoeField[intLastField_mOE,2] = i
		intLastField_mOE = intLastField_mOE+ 1
	ENDIF
	
	************
	*Map for MQtyBrk
*	DO CASE 
*		CASE strColHeader = "VENDOR SHIPDATE"
*			intmQtyBrk_group = intmQtyBrk_group + 1
*			INSERT INTO &strMQtyBrkFieldTable (field_name, row, group) VALUES ("ship_from_to", i, intmQtyBrk_group) 
*
*		CASE AT("PO NO",strColHeader) > 0
*			INSERT INTO &strMQtyBrkFieldTable (field_name, row, group) VALUES ("po_no", i, intmQtyBrk_group) 
*			strPortName = LEFT(strColHeader, AT("PO NO",strColHeader)-2)
*			INSERT INTO &strMQtyBrkFieldTable (field_name, group, value) VALUES ("port", intmQtyBrk_group, strPortName) 			
*
*		CASE strColHeader = "PCS."
*			INSERT INTO &strMQtyBrkFieldTable (field_name, row, group) VALUES ("qty", i, intmQtyBrk_group) 
*
*	ENDCASE 	
	
	************
ENDFOR 
intLastField_mOE = intLastField_mOE- 1

*select &strMQtyBrkFieldTable
*goto top
*do while !eof()
*	if field_name = "port"
*		select * from mshipmark into cursor vTmpChkPort where alltrim(cust_no) == alltrim(strCustCode) and port_name = &strMQtyBrkFieldTable..value
*		if !eof()
*			replace &strMQtyBrkFieldTable..value with vTmpChkPort.port
*		endif
*	endif
*	select &strMQtyBrkFieldTable
*	skip
*enddo
*********************************************************************************************

*********************************************************************************************
*** Delete existed record
      select moe
       set filter to alltrim(moe.oe_no)== alltrim(w_oe_no) 
       delete all
       set filter to
       
*       select mqtybrk
*      set filter to alltrim(mqtybrk.oe_no)== alltrim(w_oe_no) 
*       delete all
*       set filter to
*********************************************************************************************

*********************************************************************************************
*** Start Capture to MOE and mQtyBrk

strIndicator = ""
strOETable = "Moe"
w_pack_pc_1=0
w_pack_pc_2=0
w_pack_pc_3=0
w_pack_pc_4=0
w_pack_desp=""
w_item_desp=""

SELECT &strOETable
FOR j = w_header_row + 1 TO w_Total_row
	SELECT &strOETable
	IF !(strIndicator == ALLTRIM(eole.cells(j,1).text))
		strIndicator = ALLTRIM(eole.cells(j,1).text)
		select moe
		APPEND BLANK
		REPLACE oe_no WITH strOE_NO,;
				date WITH strdate,;
				cust_no with strCustCode,;
				unit WITH "PCS.",;
				cur_code WITH vtmpCHKCUST.cur_code,;
				user_id WITH userid(),;
				comp_code WITH w_password,;
				l_mod_date WITH DATE(),;
				l_mod_time WITH TIME()
	ENDIF

	FOR i = 1 TO intLastField_mOE 
		strFieldName = arrayMoeField[i,1]
		strFieldValue = eole.cells(j,arrayMoeField[i,2]).text
		    DO CASE 
			  CASE varTYPE(&strFieldName) = "N"
			            replace &strFieldName WITH VAL(strtran(strFieldValue,",",""))
			            if UPPER(strFieldName)== "PRICE"
			                if vartype(strFieldValue) = "C"
			                   if at("US$",strFieldValue)=1 or at("HK$",strFieldValue)=1
			                      strFieldValue=substr(strFieldValue, 4, len(strFieldValue)-3)
			                      replace &strFieldName WITH VAL(strtran(strFieldValue,",",""))
			                   endif
			               endif
			            endif          
			  CASE varTYPE(&strFieldName) = "D"
			            replace &strFieldName WITH ctod(strFieldValue)
			  OTHERWISE 
			   	   replace &strFieldName WITH strFieldValue
			endcase
	ENDFOR 

	strItemNo = alltrim(&strOETable..item_no)
	****************************************
	*** Set Pack
	if !(alltrim(mitem.item_no) == strItemNo)
		select mitem
		if seek(strItemNo)          
               	         w_pack_pc_1=Mitem.pack_pc_1
	           	w_pack_pc_2=Mitem.pack_pc_2
	           	w_pack_pc_3=Mitem.pack_pc_3
	           	w_pack_pc_4=Mitem.pack_pc_4
		        pack_1= space(5)+alltrim(Mitem.pack_desp_1)
			pack_2= "  "+iif(w_pack_pc_2=0,"   ",alltrim(str(w_pack_pc_2))+" ")+alltrim(Mitem.pack_desp_2)
			pack_3= "  "+iif(w_pack_pc_3=0,"   ",alltrim(str(w_pack_pc_3))+" ")+alltrim(Mitem.pack_desp_3)
			pack_4= "  "+iif(w_pack_pc_4=0,"   ",alltrim(str(w_pack_pc_4))+" ")+alltrim(Mitem.pack_desp_4)      	
	           	w_pack_desp=CHARCON(pack_1,pack_2,pack_3,pack_4)
	           	w_item_desp = Mitem.desp
	        else
	               w_pack_pc_1=0
	               w_pack_pc_2=0
	               w_pack_pc_3=0
	               w_pack_pc_4=0
	               w_pack_desp=""
	               w_item_desp= ""
		endif        	          
	endif
      	select moe
       	replace 	pack_pc_1 with w_pack_pc_1,;
			pack_pc_2 with w_pack_pc_2,;
			pack_pc_3 with w_pack_pc_3,;
			pack_pc_4 with w_pack_pc_4,;
			pack_desp with w_pack_desp,;
			item_desc with w_item_desp
	replace      moe.fob_port with upper(moe.fob_port)		
	****************************************

	****************************************
	*** Set Pack
        select moe
        if empty(moe.skn_no)
		select mskn
             	indexseek(moe.cust_no+moe.item_no,.T.,'mskn','iskn')
             	if found()
	             	replace moe.skn_no with mskn.skn_no
			replace moe.no_desc with mskn.no_desc
		endif
        endif    
        
        *************************************
        *** Set oc_no to moe.dbf
        
	  do case 
	      case w_password="HT"
                     replace moe.oc_no with "HT-OC/"+ALLTRIM(moe.oe_no)
              case w_password = "BAT"
                     replace moe.oc_no with "BTL-"+ALLTRIM(moe.oe_no)
              case w_password = "HFW"
                     replace moe.oc_no with "HFW-OC/"+ALLTRIM(moe.oe_no)                     
           endcase
        
        
        
	****************************************
	Set_vendor_maker(moe.item_no)
	
*	SELECT &strMQtyBrkFieldTable 
*	GOTO top
*	intGroup = 0
*	w_DelFrom = ctod("//")
*	w_DelTo = ctod("//")
	
*	DO WHILE !EOF()
*		SELECT mQtyBrk
*		strFieldName = ALLTRIM(&strMQtyBrkFieldTable..field_name)
*		intRow = &strMQtyBrkFieldTable..row
*		IF &strMQtyBrkFieldTable..group # intGroup 
*			APPEND BLANK
*			REPLACE oe_no WITH strOE_NO,;
*				item_no WITH strItemNo,;
*				user_id WITH userid(),;
*				mod_date WITH DATE(),;
*				mod_time WITH TIME()
*			intGroup = &strMQtyBrkFieldTable..group
*		ENDIF
*		
*		IF intRow > 0
*			strFieldValue = eole.cells(j,intRow).text
*		ELSE
*			strFieldValue = &strMQtyBrkFieldTable..value
*		ENDIF
*		
*		IF strFieldName = "ship_from_to"
*				dDelFrom = CTOD(LEFT(strFieldValue , AT("-",strFieldValue) -1))
*				dDelTo = CTOD(RIGHT(strFieldValue , LEN(strFieldValue) - AT("-",strFieldValue)))
*				replace del_from WITH dDelFrom, del_to WITH dDelTo
*		ELSE
*			DO CASE 
*				CASE varTYPE(&strFieldName) = "N"
*					replace &strFieldName WITH VAL(strtran(strFieldValue,",",""))
*				CASE varTYPE(&strFieldName) = "D"
*					replace &strFieldName WITH ctod(strFieldValue)
*				OTHERWISE 
*					replace &strFieldName WITH strFieldValue
*			endcase
*		ENDIF
		
*		if w_delFrom > dDelFrom or w_delFrom = ctod("//")
*			w_delfrom = dDelFrom
*		endif
*		if w_DelTo < dDelTo
*			w_DelTo = dDelTo
*		endif
		
*		SELECT &strMQtyBrkFieldTable 
*		SKIP 	
*	ENDDO

*	select moe
*	if moe.from_date > w_delfrom or moe.from_date = ctod("//")
*		replace  moe.from_date with w_delfrom
*	endif
*	if moe.to_date < w_delto
*		replace  moe.to_date with w_delto
*	endif

	WAIT WINDOW "Import OE (New XLS Format ... ITEM -" + alltrim(strItemNo) + " ... " + alltrim(str(j-w_header_row)) + " / " + alltrim(str(w_Total_row-w_header_row)) NOWAIT AT 26,60
ENDFOR 

w_row=w_Total_row+2
do while !empty(upper(eole.cells(w_row,1).text)))
    if at("FW COMM", upper(eole.cells(w_row,1).text)) > 0
       w_fw_comm = eole.cells(w_row,2).text
    endif   
    if at("HTU COMM", upper(eole.cells(w_row,1).text)) > 0
       w_oe_comm = eole.cells(w_row,2).text
    endif 
    w_row = w_row + 1
enddo      

***** Update moehd
select moehd
replace moehd.cust_first_sd with w_first_sd
replace moehd.cust_last_sd  with w_last_sd
replace moehd.fw_ref          with w_fw_ref
replace moehd.fw_comment with w_fw_comm
replace moehd.oe_comment with w_oe_comm

eole.Workbooks.close
WAIT WINDOW "Import Walmark OE ... Complete " AT 24,60

RETURN j

Procedure Set_packing(strItemNo)
endproc

Procedure Set_vendor_maker(strItemNo)
                   if upper(w_password) = "BAT" or upper(w_password) = "HFW"
				select fob, vendor_no,CUR_CODE from mitemven where item_no == alltrim(strItemNo) and ;
				         (default==.t. OR ALLTRIM(VENDOR_NO) <> "BTL") into cursor mitemvendor_cursor
				if !eof()
					select moe			
					replace moe.cur_code with mitemvendor_cursor.CUR_CODE
					replace moe.cost with mitemvendor_cursor.fob
 			           	replace moe.maker with alltrim(mitemvendor_cursor.vendor_no)
					select mitemvendor_cursor
				endif
				use in mitemvendor_cursor
			endif

			if upper(w_password) = "HT"
			    	select fob, vendor_no,CUR_CODE from mitemven where item_no == alltrim(strItemNo) and ;
				         (default==.t. OR ALLTRIM(VENDOR_NO) <> "BTL") into cursor mitemvendor_cursor
				 if !eof()
				 	select moe
					replace moe.cur_code with mitemvendor_cursor.CUR_CODE
					replace moe.cost with mitemvendor_cursor.fob				 	
			            replace moe.maker with alltrim(mitemvendor_cursor.vendor_no)
			        endif
       				use in mitemvendor_cursor
			endif
endproc