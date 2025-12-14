SELECT HEAD_ITEM, SUM(QTY*PRICE) AS AMOUNT FROM WORDERCONF INTO CURSOR VWORDERCONF GROUP BY HEAD_ITEM ORDER BY head_item
SELECT HEAD_ITEM, SUM(QTY*PRICE) AS AMOUNT FROM MORDDT INTO CURSOR VORDDT GROUP BY HEAD_ITEM where conf_no='HT-OC/002/12 ' and head=.t.
select a.*,b.* from vworderconf a inner join vorddt b on a.head_item=b.head_item into cursor temp
select temp
set filter to amount_a <>amount_b
browse last