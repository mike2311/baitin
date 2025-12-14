@10,10 say "Reindex Shipping Order File in progress ...."
close table all
use mso exclusive
reindex
pack
@10,10
@10,10 say "Reindex Shipping Order File completed!" 

