FUNCTION Ppacklist3(input, cType, x)
do case
	Case cType = 'PA'
        	public pa_cnt
	        pa_cnt = input

		if pa_cnt = 0
			pa_cnt = 1
		endif
	        public array Page_array3(pa_cnt,2)
        	narray_cnt = pa_cnt
	        do while narray_cnt > 0
			Page_array3(narray_cnt,1) = ''
			Page_array3(narray_cnt,2) = 0
			narray_cnt = narray_cnt - 1
		enddo
		cOutPut = ' '
        
	Case cType = 'CP'
        	nloop_cnt = 1
	        lfound_flag = .F.
        	do while nloop_cnt <= pa_cnt
			if Page_array3(nloop_cnt,1) = alltrim(x)
				lfound_flag = .T.
				exit
			endif
			nloop_cnt = nloop_cnt + 1
        	enddo
			if lfound_flag 
				if Page_array3(nloop_cnt,2) < input
					Page_array3(nloop_cnt,2) = input
           			else
					input = Page_array3(nloop_cnt,2) 
	           		endif
        		else         
				nloop_cnt = nloop_cnt - 1 
           			do while nloop_cnt > 0
					if !empty(Page_array3(nloop_cnt,1))
						Page_array3(nloop_cnt + 1 , 1) = alltrim(x)
						Page_array3(nloop_cnt + 1 , 2) = input
						exit
					else
                 				if nloop_cnt = 1
                    					Page_array3(nloop_cnt , 1) = alltrim(x)
					                Page_array3(nloop_cnt , 2) = input
					                 exit                 
				                 endif
			              endif
			              nloop_cnt = nloop_cnt - 1
		           enddo
	        	endif
	        	cOutPut = input

	Case cType = 'CS'
        	nloop_cnt = 1
	        lfound_flag = .F.
        	do while nloop_cnt <= pa_cnt
			if Page_array3(nloop_cnt,1) = alltrim(x)
				lfound_flag = .T.
				exit
			endif
			nloop_cnt = nloop_cnt + 1
        	enddo
			if lfound_flag 
					input = Page_array3(nloop_cnt,2) 
        		endif        
	        	cOutPut = input	        	
 endcase
 
 return cOutPut 