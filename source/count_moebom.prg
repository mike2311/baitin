Function count_moebom( p_oe_no, p_item_no)
select count(item_no) as item_no_count from moebom;
       where alltrim(oe_no) == alltrim(p_oe_no) and alltrim(item_no) == alltrim(p_item_no) into cursor vtemp_moebom
return (vtemp_moebom.item_no_count)
 