		&& vendor maker modification 2017
		select wsetcontgrid1
		SET ORDER TO 
		GO TOP 
		DO WHILE !EOF()
*		   IF wsetcontgrid1.item_no='115494L'
*		      xxx
*		   ENDIF     
		   replace wsetcontgrid1.org_vendor WITH wsetcontgrid1.vendor_no
		   SELECT mvendor
           SEEK  wsetcontgrid1.vendor_no
           IF mvendor.hfw_maker AND w_password="HT"
              Select wsetcontgrid1
              Replace wsetcontgrid1.vendor_no  with "HFW"
           *ELSE
           *   Select wsetcontgrid1
           *   Replace wsetcontgrid1.vendor_no  with wsetcontgrid1.org_vendor
           endif   
		   SELECT wsetcontgrid1
		   SKIP
		ENDDO 