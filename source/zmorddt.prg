@10,10 say "Reindex Order Detail File in progress ...."
close table all
use morddt exclusive
reindex
pack

@10,10
@10,10 say "Reindex Order Detail File completed!" 