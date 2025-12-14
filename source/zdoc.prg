@10,10 say "Reindex Oe Detail in progress ...."
USE loe EXCLUSIVE
REINDEX

USE moehd exclusive
REINDEX
USE moectrl exclusive
REINDEX
USE moe exclusive
REINDEX
@10,10

@10,10 say "Reindex oc data in progress ...."
USE mordhd exclusive
REINDEX
USE morddt exclusive
REINDEX
@10,10

@10,10 say "Reindex contract data in progress ...."
USE mconthd exclusive
REINDEX
USE mcontdt exclusive
REINDEX

@10,10

@10,10 say "Reindex so data in progress ...."
USE mso exclusive
REINDEX

@10,10

@10,10 say "Reindex inv data in progress ...."
USE minvhd exclusive
REINDEX
USE minvdt exclusive
REINDEX


@10,10
@10,10 say "Reindex Major Files completed!" 

