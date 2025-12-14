Function nvl2(inputa , inputb , length, ndec)

if empty(length)
   length = 0
endif

If empty(ndec)
   ndec = 0 
endif

cOutPut = nvl(inputa , inputb)

if type('cOutPut') = 'N'
   type = 'N'
   cOutPut = alltrim(str(cOutPut))
else
   type = 'C'
endif

do while len(cOutPut) < length
   if type = 'N'
      cOutPut = '0' + cOutPut
   else
      cOutPut = ' ' + cOutPut
   endif
enddo

return iif(type = 'N' , round(val(cOutPut),ndec) , cOutPut)
