** check different po within morddt

select conf_no, head_item, po_no from morddt where head=.t.
select conf_no, head_item, po_no from morddt into cursor hd_po where head=.t.
select conf_no, head_item, po_no from morddt into cursor dt_po where head=.f.
select a.*, b.* from hd_po a inner join dt_po b on a.conf_no=b.conf_no and a.head_item=b.head_item
set filter to po_no_a <> po_no_b
browse last