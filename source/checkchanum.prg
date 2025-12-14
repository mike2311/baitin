function checkchanum(cha)
	public cha_num, i, h
	i=1
	h=1
	do while h<>0
		x = substr(cha,i,1)
		h = at(x,"   1234567890")
		cha_num = i-1
		i=i+1	
	enddo
	release i, h, cha
	return cha_num