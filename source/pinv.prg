FUNCTION Pinv(input, cType, x)
public w_str, w_carton, cOutPut
cOutPut = ""
do case
	Case cType = 'PA'
        	public pa_cnt
	        pa_cnt = input

		if pa_cnt = 0
			pa_cnt = 1
		endif
	        public array Page_array(pa_cnt,2)
        	narray_cnt = pa_cnt
	        do while narray_cnt > 0
			page_array(narray_cnt,1) = ''
			page_array(narray_cnt,2) = 0
			narray_cnt = narray_cnt - 1
		enddo
		cOutPut = ' '
        
	Case cType = 'CP'
        	nloop_cnt = 1
	        lfound_flag = .F.
        	do while nloop_cnt <= pa_cnt
			if page_array(nloop_cnt,1) = alltrim(x)
				lfound_flag = .T.
				exit
			endif
			nloop_cnt = nloop_cnt + 1
        	enddo
			if lfound_flag 
				if page_array(nloop_cnt,2) < input
					page_array(nloop_cnt,2) = input
           			else
					input = page_array(nloop_cnt,2) 
	           		endif
        		else         
				nloop_cnt = nloop_cnt - 1 
           			do while nloop_cnt > 0
					if !empty(page_array(nloop_cnt,1))
						page_array(nloop_cnt + 1 , 1) = alltrim(x)
						page_array(nloop_cnt + 1 , 2) = input
						exit
					else
                 				if nloop_cnt = 1
                    					page_array(nloop_cnt , 1) = alltrim(x)
					                page_array(nloop_cnt , 2) = input
					                 exit                 
				                 endif
			              endif
			              nloop_cnt = nloop_cnt - 1
		           enddo
	        	endif
	        	cOutPut = input
	Case cType = 'CT'
		w_carton = alltrim(str(x))
		w_str = input
		w_cut = ""
		i = 1

		do while i <= len(w_str)
			w_cut = substr(w_str, i, 1)
			if w_cut = "!"
				w_char1 = substr(w_str,1, i-1)
				w_char =changechar(substr(w_str,i, 2))
				w_char2 =  substr(w_str, i+2)
				w_str = w_char1+w_char+w_char2
				i = i + len(w_char) -1
			endif
			i = i +1
		enddo
		cOutPut = w_str
	
endcase
return cOutPut 
 
 
 
 function changechar(w_para)
	private cVar
	cVar = alltrim(w_para)
	do case 
		case cVar = "!C"
			return alltrim(w_carton)
		otherwise 
			return " <>Error<> "
	endcase 
* endcase
