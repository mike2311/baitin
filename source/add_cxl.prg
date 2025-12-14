close table all
@0,0 say "Converting Moe ...."
if used("moe")
    select moe
else
    use moe in 0 exclusive
endif      
select moe
alter table moe;
        add  cxl_flag  n(1);
        add  cxl_rson c(30)
        
@0,0 
@0,0 say "Converting Morddt ...."        
if used("morddt")
    select morddt
else
    use morddt in 0 exclusive
endif      
select morddt
alter table morddt;
        add  cxl_flag  n(1);
        add  cxl_rson c(30)

@0,0 
@0,0 say "Converting Mcontdt ...."   
if used("mcontdt")
    select mcontdt
else
    use mcontdt in 0 exclusive
endif      
select mcontdt
alter table mcontdt;
        add  cxl_flag  n(1);
        add  cxl_rson c(30)        
        
@0,0 
@0,0 say "Converting Mso ...."   
if used("mso")
    select mso
else
    use mso in 0 exclusive
endif      
select mso
alter table mso;
        add  cxl_flag  n(1);
        add  cxl_rson c(30)         
        
@0,0 
@0,0 say "Conversion Completed ...."     
close table all           