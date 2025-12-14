FUNCTION Ppacklist1(input, cType, x)
public w_input_t, w_cType_t, x_t
w_input_t= input
w_cType_t = cType
x_t = x

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
 endcase
 
 return cOutPut 