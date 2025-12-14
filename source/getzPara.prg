function getzPara(cType)
	
	cType = alltrim(cType)
	select * from zpara into cursor vTempPara where alltrim(co_code) == alltrim(w_password)
	
	do case
		case cType == "sAddr"
			rtn_value = alltrim(vTempPara.sAddr1) + iif(empty(vTempPara.Saddr2),"",chr(10) + alltrim(vTempPara.Saddr2))+ iif(empty(vTempPara.Saddr3),"",chr(10) + alltrim(vTempPara.Saddr3))+ iif(empty(vTempPara.Saddr4),"",chr(10) + alltrim(vTempPara.Saddr4)) + chr(10) + "TEL: (852)"+ alltrim(vTempPara.Phone) + chr(10) + "FAX: (852)"+ alltrim(vTempPara.fax)

		case cType== "lAddr"
			rtn_value = alltrim(vTempPara.lAddr1) + iif(empty(vTempPara.laddr2),"",chr(10) + alltrim(vTempPara.laddr2))+ iif(empty(vTempPara.laddr3),"",chr(10) + alltrim(vTempPara.laddr3))+ iif(empty(vTempPara.laddr4),"",chr(10) + alltrim(vTempPara.laddr4)) + chr(10) + "TEL: (852)"+ alltrim(vTempPara.Phone) + chr(10) + "FAX: (852)"+ alltrim(vTempPara.fax)

		case cType== "hAddr"
			rtn_value = alltrim(vTempPara.hAddr1) + iif(empty(vTempPara.haddr2),"",chr(10) + alltrim(vTempPara.haddr2))+ iif(empty(vTempPara.haddr3),"",chr(10) + alltrim(vTempPara.haddr3))+ iif(empty(vTempPara.haddr4),"",chr(10) + alltrim(vTempPara.haddr4)) + chr(10) + "TEL: (852)"+ alltrim(vTempPara.hPhone) + chr(10) + "FAX: (852)"+ alltrim(vTempPara.hfax) + chr(10) + "TLX: " + vTempPara.htlx

		case cType== "sAddr_loading"
			rtn_value = alltrim(vTempPara.sAddr1) + iif(empty(vTempPara.Saddr2),"",chr(10) + alltrim(vTempPara.Saddr2))+ iif(empty(vTempPara.Saddr3),"",chr(10) + alltrim(vTempPara.Saddr3))+ iif(empty(vTempPara.Saddr4),"",chr(10) + alltrim(vTempPara.Saddr4))

	
		otherwise
			rtnField = "vTempPara." + alltrim(cType)
			rtn_value = &rtnField 
	endcase
	
	return rtn_value
endfunc
