Set hour To 24
public w_password, sysuserid 
*SET DEFAULT TO getdir()
SET DELETE ON
SET SAFETY OFF
SET CENTURY ON
SET ENGINEBEHAVIOR 90
sysuserid="VIC"
set delete on
set date mdy
set default to d:\project\victor\baitin9
*set date british

Public w_password,w_user_id, syswork, w_co_name, w_oe_prefix, w_sys_language

w_password = "HT"
w_co_name = "HOLIDAY TIMES UNLIMITED INC"
w_oe_prefix = ""

*w_password = "INSP"
*w_co_name = "InSpirt Designs"
*w_oe_prefix = ""



*w_password = "BAT"
*w_co_name = "BAITIN TRADING LIMITED"
*w_oe_prefix = ""

*w_password = "HFW"
*w_co_name = "HOLIDAY FUNWORLD LIMITED"
*w_oe_prefix = "HFW"




w_sys_language= "E"
w_user_id = "VIC"
sysuserid="VIC"
syswork="c:\"+alltrim(sysuserid)+"work"
if !directory(syswork)
   md &syswork
endif   
*SET ENGINEBEHAVIOR 70
set path to c:\batwork, &syswork








