function cutchar(cha1)
	public l, x, z,i
	i=1
	l=0
	do while l<>1
		x = substr(cha1,i,1)
		z = at(x,"   1234567890")
		if z=0
			l=1
			cha1 = substr(cha1, i)
		else
			i=i+1
		endif
	enddo
	release l, x, z, i
	return cha1
