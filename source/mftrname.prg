FUNCTION mftrname(memo1)
   w_cr_pos=AT(CHR(10),memo1)
   IF LEN(memo1)>w_cr_pos
      w_temp_remark=SUBSTR(memo1,w_cr_pos+1)
      w_cr_pos=AT(CHR(10),w_temp_remark)
      IF LEN(w_temp_remark)>w_cr_pos
         w_temp_remark=SUBSTR(w_temp_remark,w_cr_pos+1)
      ENDIF
      w_cr_pos=AT(CHR(10),w_temp_remark)
      IF LEN(w_temp_remark)>w_cr_pos
         w_temp_remark=SUBSTR(w_temp_remark,1,w_cr_pos-1)
      ENDIF
   ENDIF    
   memo1= w_temp_remark



RETURN memo1