function getMySqlConnect 

	IF VARTYPE(nSqlHandle) <> "U"  
		intSqlHandle = nSqlHandle 	
		IF nSqlHandle > -1
			IF SQLGETPROP(nSqlhandle,"ConnectBusy")
				intSqlHandle = -1
			ELSE 
				return nSqlHandle 
			ENDIF
		ENDIF
	ELSE 
		intSqlHandle = -1
	ENDIF
	
	DO WHILE intSqlHandle = -1
		WAIT WINDOW "連接資料庫 ... " NOWAIT 
		intSqlHandle = openMySqlConnect()
	ENDDO
	
	WAIT WINDOW "連接資料庫 ... 成功" NOWAIT 
	RETURN intSqlHandle 
ENDFUNC
