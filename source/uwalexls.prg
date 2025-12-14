lparameter strdate, strCustCode, strOE_NO, strxlsFileName 
SET SAFE OFF
Public w_field_no, finished, w_cust_no, w_detail_pos, w_ship_from, w_ship_to, w_po_no, w_port_row, w_port_col, w_port_column
Public w_port_po, w_port, w_port_qty, w_min, w_max, w_max_index, w_min_index
Public w_pack_pc_1, w_pack_pc_2, w_pack_pc_3, w_pack_pc_4,w_pack_desp_1, w_pack_desp_2, w_pack_desp_3, w_pack_desp_4
Public n_item_no, n_skn_no, n_inner, n_master, n_qty, n_ctn, n_price, n_maker, n_remark, n_po_no, n_port, n_retail_1,n_retail_2, n_ship_from, n_ship_to
Public strSkn_no, strItem_no, strCust_code
Local w_row, w_col
w_pack_desp_1=""
w_pack_desp_2=""
w_pack_desp_3=""
w_pack_desp_4=""
prev_item_no = "ZZZ12345"
w_rol=1
w_col=1
w_row = 1
if empty(strdate)
	strdate = date()
endif

If !used("mcustom")
   use baitin!mcustom in 0 SHARED 
endif   

If !used("moe")
    use baitin!moe in 0 SHARED
endif           

If !used("mskn")
    use baitin!mskn in 0 SHARED 
endif           

If !used("mitemven")
    use baitin!mitemven in 0 SHARED 
endif 

If !used("mqtybrk")
    use baitin!mqtybrk in 0 SHARED 
endif                     

If !used("mitem")
	   use baitin!mitem in 0 SHARED 
endif   
select mitem
set order to item_no

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

* locate_header_record
DO WHILE .T.
	IF at("QUOTE", eole.cells(w_row,1).text)= 0
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
w_Totel_row = w_header_row+1
DO WHILE .T.
	IF EMPTY(ALLTRIM(eole.cells(w_Totel_row ,1).text))
		EXIT
	ELSE
		w_Totel_row= w_Totel_row+1	
	ENDIF
	IF w_Totel_row >= 10000
		=MESSAGEBOX("Invalid xls file format. Update Program stopped",48,"System Error Message")
		RETURN 0
	ENDIF 		
ENDDO
w_Totel_row = w_Totel_row -1

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

DIMENSION arrayMoeField[w_col,2]
strMQtyBrkFieldTable = "vMQtyField"
*strQtyBrkFieldTablePath = "c:\batwork\" + strMQtyBrkFieldTable +".dbf"
strQtyBrkFieldTablePath = alltrim(syswork)+"\" + strMQtyBrkFieldTable +".dbf"
CREATE TABLE &strQtyBrkFieldTablePath FREE (field_name c(30), row i, group i, value c(20))
intLastField_mOE=1
intmQtyBrk_group = 0
FOR i = 1 TO w_col
	strColHeader = UPPER(ALLTRIM(eole.cells(w_header_row,i).text))
	************
	*Map for Moe
	DO CASE 
*		CASE at("MAKER", strColHeader ) > 0
*			arrayMoeField[intLastField_mOE,1] = "maker"

		CASE strColHeader = "ITEM"
			arrayMoeField[intLastField_mOE,1] = "item_no"
			
		CASE strColHeader = "SKN"
			arrayMoeField[intLastField_mOE,1] = "skn_no"

		CASE strColHeader = "SELL PRICE"
			arrayMoeField[intLastField_mOE,1] = "price"

		CASE strColHeader == "VENDOR"
			arrayMoeField[intLastField_mOE,1] = "vendor_no"

		CASE strColHeader == "MAKER"
			arrayMoeField[intLastField_mOE,1] = "maker"			

		CASE strColHeader = "TOTAL BY ITEM (PCS)"
			arrayMoeField[intLastField_mOE,1] = "qty"

		CASE strColHeader = "TOTAL BY ITEM (CTNS)"
			arrayMoeField[intLastField_mOE,1] = "ctn"

		CASE strColHeader = "INNER"
			arrayMoeField[intLastField_mOE,1] = "pack_pc_2"

		CASE strColHeader = "MASTER"
			arrayMoeField[intLastField_mOE,1] = "pack_pc_3"

		CASE strColHeader = "RETAIL2" or strColHeader = "RETAIL 2"
			arrayMoeField[intLastField_mOE,1] = "rp_remark_2"
			
		CASE strColHeader = "RETAIL $" or strColHeader = "RETAIL$" 
		           arrayMoeField[intLastField_mOE,1] = "rp_remark_1"

		CASE strColHeader = "COMMENT"
			arrayMoeField[intLastField_mOE,1] = "remark"
			
		CASE strColHeader = "FOB PORT"
			arrayMoeField[intLastField_mOE,1] = "fob_port"	
		
*		CASE strColHeader = "CUSTOMER SHIPDATE"
*		       arrayMoeField[intLastField_mOE,1] = "cust_from_to"
         	OTHERWISE
			
	ENDCASE 
	IF !EMPTY(arrayMoeField[intLastField_mOE,1])
		arrayMoeField[intLastField_mOE,2] = i
		intLastField_mOE= intLastField_mOE+ 1
	ENDIF
	
	************
	*Map for MQtyBrk

	DO CASE 
		CASE upper(strColHeader) = "CUSTOMER SHIPDATE"
			intmQtyBrk_group = intmQtyBrk_group + 1
			INSERT INTO &strMQtyBrkFieldTable (field_name, row, group) VALUES ("ship_from_to", i, intmQtyBrk_group) 

		CASE AT("PO NO",strColHeader) > 0
			INSERT INTO &strMQtyBrkFieldTable (field_name, row, group) VALUES ("po_no", i, intmQtyBrk_group) 
			strPortName = LEFT(strColHeader, AT("PO NO",strColHeader)-2)
			INSERT INTO &strMQtyBrkFieldTable (field_name, group, value) VALUES ("port", intmQtyBrk_group, strPortName) 			

		CASE strColHeader = "PCS."
			INSERT INTO &strMQtyBrkFieldTable (field_name, row, group) VALUES ("qty", i, intmQtyBrk_group) 

		CASE upper(strColHeader) = "MAKER SHIPDATE"
*			intmQtyBrk_group = intmQtyBrk_group + 1    && no need to add group , customer shipdate had added group
			INSERT INTO &strMQtyBrkFieldTable (field_name, row, group) VALUES ("mship_from_to", i, intmQtyBrk_group) 


	ENDCASE 	

	************
ENDFOR 

intLastField_mOE = intLastField_mOE- 1

select &strMQtyBrkFieldTable
goto top
do while !eof()
	if field_name = "port"
		select * from mshipmark into cursor vTmpChkPort where alltrim(cust_no) == alltrim(strCustCode) and alltrim(port_name) ==alltrim(&strMQtyBrkFieldTable..value)
		if !eof()
			replace &strMQtyBrkFieldTable..value with vTmpChkPort.port
		endif
	endif
	select &strMQtyBrkFieldTable
	skip
enddo
*********************************************************************************************

*********************************************************************************************
*** Delete existed record


      select moe
      set order to ioe
      seek w_oe_no
      do while !eof() and alltrim(moe.oe_no)== alltrim(w_oe_no) 
           delete
           skip
      enddo     
       select mqtybrk
       set filter to alltrim(mqtybrk.oe_no)== alltrim(w_oe_no) 
       delete all
       set filter to
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
FOR j = w_header_row + 1 TO w_Totel_row
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
                 IF EMPTY(&strFieldName)
			DO CASE 
				CASE varTYPE(&strFieldName) = "N"
					replace &strFieldName WITH VAL(strtran(strFieldValue,",",""))
				CASE varTYPE(&strFieldName) = "D"
					replace &strFieldName WITH ctod(strFieldValue)
				OTHERWISE 
					replace &strFieldName WITH strFieldValue
			endcase
		ENDIF
        ENDFOR 

	strItemNo = alltrim(&strOETable..item_no)
	strVendor_no=alltrim(&strOETable..vendor_no)
	strMaker=alltrim(&strOETable..maker)
	strSkn_no = alltrim(&strOETable..skn_no)

	if empty(moe.maker)
	   select moe
	   replace moe.maker with strVendor_no
	endif    
	
	
	****************************************
	*** Set Pack
*	if strItemNo= "8181P"
*	   xxx
*	endif   

	if !(alltrim(mitem.item_no) == strItemNo)
	         select mitem
		if seek(strItemNo)          
	           	w_pack_pc_1=Mitem.pack_pc_1
	           	if moe.pack_pc_2 > 0
	           	   w_pack_pc_2 = moe.pack_pc_2
	           	else
	           	   w_pack_pc_2=Mitem.pack_pc_2
	           	endif
	           	if moe.pack_pc_3 > 0
	           	   if moe.pack_pc_3 <> moe.pack_pc_2
	           	      w_pack_pc_3 = moe.pack_pc_3
	           	   else
	           	      w_pack_pc_3 = 0
	           	   endif      
	           	else      
	           	   w_pack_pc_3=Mitem.pack_pc_3
	           	endif   
	           	w_pack_pc_4=Mitem.pack_pc_4
*		        pack_1= space(5)+alltrim(Mitem.pack_desp_1)
*			pack_2= iif(w_pack_pc_2=0,"   ",space(4-len(alltrim(str(w_pack_pc_2))))+alltrim(str(w_pack_pc_2))+" "+alltrim(Mitem.pack_desp_2))
*			pack_3= iif(w_pack_pc_3=0,"   ",space(4-len(alltrim(str(w_pack_pc_3))))+alltrim(str(w_pack_pc_3))+" "+alltrim(Mitem.pack_desp_3))
*			pack_4= iif(w_pack_pc_4=0,"   ",space(4-len(alltrim(str(w_pack_pc_4))))+alltrim(str(w_pack_pc_4))+" "+alltrim(Mitem.pack_desp_4))    	
                         pack_1= space(5)+alltrim(Mitem.pack_desp_1)
                         if (w_pack_pc_2 = w_pack_pc_3 or w_pack_pc_2 = 0) and ;
                            (at("INNER", upper(w_pack_desp_2))> 0 or at("PER DISPLAY BOX", upper(w_pack_desp_2)) > 0)
                            pack_2 = ""
                        else
                             pack_2= " "+iif(w_pack_pc_2=0  ," ",space(3-len(alltrim(str(w_pack_pc_2))))+alltrim(str(w_pack_pc_2)))+" "+alltrim(Mitem.pack_desp_2)
                         endif    
                        if w_pack_pc_3 < 1000
                            pack_3= " "+iif(w_pack_pc_3=0," ",space(3-len(alltrim(str(w_pack_pc_3))))+alltrim(str(w_pack_pc_3)))+" "+alltrim(Mitem.pack_desp_3)
                        else     
	                    pack_3= " "+iif(w_pack_pc_3=0," ",space(4-len(alltrim(str(w_pack_pc_3))))+alltrim(str(w_pack_pc_3)))+" "+alltrim(Mitem.pack_desp_3)
	                endif     
	                pack_4= " "+iif(w_pack_pc_4=0," ",space(3-len(alltrim(str(w_pack_pc_4))))+alltrim(str(w_pack_pc_4)))+" "+alltrim(Mitem.pack_desp_4)  	
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
	****************************************

	****************************************
	*** Set SKN
	do set_skn
*       select moe
 *       if empty(moe.skn_no)
*		select mskn
*             	indexseek(moe.cust_no+moe.item_no,.T.,'mskn','iskn')
*             	if found()
*	             	replace moe.skn_no with mskn.skn_no
*			replace moe.no_desc with mskn.no_desc
*		endif
*        endif    
	
	*******************
	* ** Set OC No. in Moe.dbf
	
	  do case 
	      case w_password="HT"
                     replace moe.oc_no with "HT-OC/"+ALLTRIM(moe.oe_no)
              case w_password = "BAT"
                     replace moe.oc_no with "BTL-"+ALLTRIM(moe.oe_no)
              case w_password = "HFW"
                     replace moe.oc_no with "HFW-OC/"+ALLTRIM(moe.oe_no) 
              case w_password="INSP"
                     replace moe.oc_no with "IN-OC/"+ALLTRIM(moe.oe_no)                           
           endcase
	
	
	
	
	****************************************
	Set_vendor_maker(moe.item_no)
	    
	SELECT &strMQtyBrkFieldTable 
	GOTO top
	intGroup = 0
	w_DelFrom = ctod("//")
	w_DelTo = ctod("//")
	w_mDelFrom = ctod("//")
	w_mDelTo = ctod("//")
	if strItemNo <> prev_item_no
	   w_min_date=ctod("01/01/2099")
	   w_max_date=ctod("01/01/1980")
	   w_min_mdate=ctod("01/01/2099")
	   w_max_mdate=ctod("01/01/1980")
	   prev_item_no = strItemNo
	endif   

*       if strItemNo = "3711WM"
*           xxx
*        endif   
	
	DO WHILE !EOF()
		SELECT mQtyBrk
		strFieldName = ALLTRIM(&strMQtyBrkFieldTable..field_name)
		intRow = &strMQtyBrkFieldTable..row
		IF &strMQtyBrkFieldTable..group # intGroup 
			APPEND BLANK
			REPLACE oe_no WITH strOE_NO,;
				item_no WITH strItemNo,;
				user_id WITH userid(),;
				mod_date WITH DATE(),;
				mod_time WITH TIME()
			intGroup = &strMQtyBrkFieldTable..group
		ENDIF
		
		IF intRow > 0
			strFieldValue = eole.cells(j,intRow).text
		ELSE
			strFieldValue = &strMQtyBrkFieldTable..value
		ENDIF
		IF strFieldName = "ship_from_to"
		    dDelFrom = CTOD(LEFT(strFieldValue , AT("-",strFieldValue) -1))
		    dDelTo = CTOD(RIGHT(strFieldValue , LEN(strFieldValue) - AT("-",strFieldValue)))
		    if dDelFrom < date()
		       dDelFrom=gomonth(dDelFrom,12)
		    endif   
		    if dDelTo < date()
		       dDelTo=gomonth(dDelTo,12)
		    endif   		    
		    replace del_from WITH dDelFrom, del_to WITH dDelTo
		    if !empty(dDelFrom) and dDelFrom < w_min_date
		       w_min_date=dDelFrom
		    endif
		    if dDelTo > w_max_date
		       w_max_date =dDelTo
		    endif  
		    if w_delFrom > dDelFrom or w_delFrom = ctod("//")
		        w_delfrom = dDelFrom
		   endif
		   if w_DelTo < dDelTo
		       w_DelTo = dDelTo
		   endif
	       ELSE
	      	  IF strFieldName = "mship_from_to"
		      dmDelFrom = CTOD(LEFT(strFieldValue , AT("-",strFieldValue) -1))
		      dmDelTo = CTOD(RIGHT(strFieldValue , LEN(strFieldValue) - AT("-",strFieldValue)))
		      if dmDelFrom < date()
		         dmDelFrom=gomonth(dmDelFrom,12)
	    	      endif   
		      if dmDelTo < date()
		         dmDelTo=gomonth(dmDelTo,12)
		      endif   		   		      
*		      replace del_from WITH dDelFrom, del_to WITH dDelTo
		     if !empty(dmDelFrom) and dmDelFrom < w_min_mdate
		         w_min_mdate=dmDelFrom
		     endif
		     if dmDelTo > w_max_mdate
		        w_max_mdate =dmDelTo
		     endif 
		     if w_mdelFrom > dmDelFrom or w_mdelFrom = ctod("//")
			w_mdelfrom = dmDelFrom
		     endif
		    if w_mDelTo < dmDelTo
		       w_mDelTo = dmDelTo
		    endif
		 else
		       DO CASE 
				CASE varTYPE(&strFieldName) = "N"
					replace &strFieldName WITH VAL(strtran(strFieldValue,",",""))
				CASE varTYPE(&strFieldName) = "D"
					replace &strFieldName WITH ctod(strFieldValue)
				OTHERWISE 
					replace &strFieldName WITH strFieldValue
			endcase
		 ENDIF
	     ENDIF
	     SELECT &strMQtyBrkFieldTable 
	     SKIP 	
	ENDDO
 *      if strItemNo = "3711WM"
 *         xxx
 *      endif   
	select moe
        if w_min_date <> ctod("01/01/2099")
           replace moe.cust_from_date with w_min_date
        endif
        if w_max_date <>ctod("01/01/1980")
            replace moe.cust_to_date     with w_max_date
        endif   
        
       if w_min_mdate <> ctod("01/01/2099")
           replace moe.from_date with w_min_mdate
        endif
        if w_max_mdate <>ctod("01/01/1980")    
           replace moe.to_date     with w_max_mdate
        endif   
  
	WAIT WINDOW "Import Walmart OE ... ITEM -" + alltrim(strItemNo) + " ... " + alltrim(str(j-w_header_row)) + " / " + alltrim(str(w_Totel_row-w_header_row)) NOWAIT AT 26,60
ENDFOR 

eole.Workbooks.close
WAIT WINDOW "Import Walmark OE ... Complete " AT 24,60

RETURN j

Procedure Set_packing(strItemNo)
endproc

Procedure Set_vendor_maker(strItemNo)
     *if strItemNo ="9151PDQ"
     *   xxx
     *ENDIF   
      select fob, vendor_no, cur_code from mitemven where alltrim(item_no)==alltrim(strItemNo) and alltrim(vendor_no)==alltrim(strVendor_no) into cursor mitemvendor_cursor
      if  !eof()
	  select moe			
	  replace moe.cur_code with mitemvendor_cursor.CUR_CODE
          replace moe.cost with mitemvendor_cursor.fob
          replace moe.lcl   with mitemvendor_cursor.lcl
*        replace moe.maker with mitemvendor_cursor.vendor_no
      endif      
            
*                   if upper(w_password) = "BAT"
*				select fob, vendor_no,CUR_CODE from mitemven where item_no == alltrim(strItemNo) and ;
*				         default==.t.  into cursor mitemvendor_cursor
*				if reccount("mitemvendor_cursor") = 0
*				   select fob, vendor_no,CUR_CODE from mitemven where item_no == alltrim(strItemNo) and ;
*				          ALLTRIM(VENDOR_NO) <> "BTL" into cursor mitemvendor_cursor
*				endif         								
*				if !eof()
*				        select moe			
*					replace moe.cur_code with mitemvendor_cursor.CUR_CODE
*					replace moe.cost with mitemvendor_cursor.fob
* 			           	replace moe.maker with mitemvendor_cursor.vendor_no
*					select mitemvendor_cursor
*				endif
*				use in mitemvendor_cursor
 *        	    endif
*
*			if upper(w_password) = "HT"
*			    	select fob, vendor_no,CUR_CODE from mitemven where item_no == alltrim(strItemNo) and ;
*				         default==.t. into cursor mitemvendor_cursor
*				if reccount("mitemvendor_cursor") = 0
*			    	   select fob, vendor_no,CUR_CODE from mitemven where item_no == alltrim(strItemNo) and ;
*				           ALLTRIM(VENDOR_NO) <> "BTL" into cursor mitemvendor_cursor
*				endif           				            
*				 if !eof()
*				 	select moe
*					replace moe.cur_code with mitemvendor_cursor.CUR_CODE
*					replace moe.cost with mitemvendor_cursor.fob				 	
*			            replace moe.maker with mitemvendor_cursor.vendor_no
*			        endif
 *      				use in mitemvendor_cursor
*			endif
endproc

Procedure Set_skn
       select mskn
       if !empty(strskn_no)       
            select moe
            replace moe.skn_no with strskn_no
            select mskn
            set order to iskn
            w_cust_code = alltrim(w_cust_code)+space(10-len(alltrim(w_cust_code)))
            if vartype(strItemNO) = "C"
               w_item_no = alltrim(strItemNO)+space(15-len(alltrim(strItemNO)))
            else
               seek w_cust_code + alltrim(str(strItemNO))+space(15-len(alltrim(str(strItemNO))))    
            endif   
            seek w_cust_code+w_item_no
            if eof()
                append blank
                replace mskn.cust_no with w_cust_code
                replace mskn.item_no with w_item_no
                replace mskn.skn_no  with strSkn_no
            else
                if alltrim(mskn.skn_no)<>alltrim(strSkn_no)
                    select wsknlog
                    append blank
                    replace wsknlog.cust_no    with w_cust_code
                    replace wsknlog.item_no    with w_item_no
                    replace wsknlog.skn_no_o with mskn.skn_no
                    replace wsknlog.skn_no_n with strSkn_no
                    select mskn
                    replace mskn.skn_no with strSkn_no    
                endif   
            endif            
       Else
            go top
            locate for alltrim(mskn.cust_no)==alltrim(w_cust_code) and alltrim(mskn.item_no)==alltrim(strItemNO)
            if !eof()
                select moe
                replace moe.skn_no with mskn.skn_no
                replace moe.no_desc with mskn.no_desc
           endif
       endif    