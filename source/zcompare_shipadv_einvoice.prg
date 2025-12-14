select inv_no,sum(amount+inv_adj)  as inv_amt, round(sum(amount+inv_adj),2)  as round_amt, sum(net_amt) as sum_net from wpshpadv group by inv_no into cursor vpshpadv
select inv_no, total_am from weinv into cursor veinv
select a.inv_no, a.inv_amt,a.round_amt, a.sum_net, b.total_am from vpshpadv a inner join veinv b on a.inv_no=b.inv_no into cursor temp
select inv_no,sum(amount+inv_adj)  as inv_amt, round(sum(amount+inv_adj),2)  as round_amt  from wpshpadv group by inv_no into cursor vpshpadv
select temp
browse last
