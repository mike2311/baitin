function openMySqlConnect 
PUBLIC nSqlHandle

nSqlHandle=0 
cSqlDriver = "MySQL ODBC 3.51 Driver" 

cSqlserver  = w_server_name
cSqlUser    = w_server_user
cSqlPwd     = w_server_password
csqlDbc     = w_server_db

WAIT WINDOW 'Connect to ' + cSqlserver nowait
cNetLib = "dbnetlib" &&用戶端網路程式庫 for Tcp/Ip 
cSqlstring="DRIVER="+cSqlDriver+";SERVER="+cSqlServer+";UID="+cSqlUser+";PWD="+cSqlPwd+";DATABASE="+cSqlDbc+";NETWORK="+cNetLib 
=sqlsetprop(0,"DispLogin",3) 
nSqlHandle = sqlstringconnect(cSqlString,.T.) 

return nSqlHandle
