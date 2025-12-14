function emonth(in_date)
    m=MONTH(in_date)
    do case
	   CASE m=1
	        RETURN "January"
	   CASE m=2
	        RETURN "February"
	   CASE m=3
	        RETURN "March"
	   CASE m=4
	        RETURN "April"
	   CASE m=5
	        RETURN "May" 
	   CASE m=6
	        RETURN "June"
	   CASE m=7
	        RETURN "July"
	   CASE m=8
	        RETURN "August"
	   CASE m=9
	        RETURN "September"
	   CASE m=10
	        RETURN "October"
	   CASE m=11
	        RETURN "November"
	   CASE m=12
	        RETURN "December"                  		
	endcase
	
