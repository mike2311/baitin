if MESSAGEBOX("Reindex System Data?",4+64,"System Message") =6
	close table all
	close database
	open database baitin exclusive
	
	@10,10 
	@10,10 say "Packing mitem...."
	use mitem exclusive
	pack 

	@10,10 
	@10,10 say "Packing moehd...."	
	use moehd exclusive
	pack

	@10,10 
	@10,10 say "Packing moe...."		
	use moe exclusive
	pack

	@10,10 
	@10,10 say "Packing moectrl...."		
	use moectrl exclusive
	pack

	@10,10 
	@10,10 say "Packing mcustom...."		
	use mcustom exclusive
	pack 
	
	@10,10 
	@10,10 say "Packing mvendor...."	
	use mvendor exclusive
	pack 

	@10,10 
	@10,10 say "Packing mitemven...."	
	use mitemven exclusive
	pack 

	@10,10 
	@10,10 say "Packing mconthd...."		
	use mconthd exclusive
	pack 

	@10,10 
	@10,10 say "Packing mcontdt...."	
	use mcontdt exclusive
	pack 

	@10,10 
	@10,10 say "Packing minvhd..."	
	use minvhd exclusive
	pack 

	@10,10 
	@10,10 say "Packing minvdt..."	
	use minvdt exclusive
	reindex

	@10,10 
	@10,10 say "Packing mordhd..."	
	use mordhd exclusive
	pack 

	@10,10 
	@10,10 say "Packing morddt..."		
	use morddt exclusive
	reindex

	@10,10 
	@10,10 say "Packing minvadj..."	
	use minvadj exclusive
	pack
	
	use minvbd exclusive
	reindex

	@10,10 
	@10,10 say "Packing mordadj..."		
        use mordadj exclusive
	pack 

	@10,10 
	@10,10 say "Packing mprodbom..."		
	use mprodbom exclusive
	pack 

	@10,10 
	@10,10 say "Packing mshipmark..."		
	use mshipmark exclusive
	pack 

	@10,10 
	@10,10 say "Packing mskn..."	
	use mskn exclusive
	pack 

	@10,10 
	@10,10 say "Packing mso..."		
	use mso exclusive
	pack 

	@10,10 
	@10,10 say "Packing zcountry..."	
	use zcountry exclusive
	pack 

	@10,10 
	@10,10 say "Packing zcurcode..."	
	use zcurcode exclusive
	pack 


	@10,10 
	@10,10 say "Packing zcustcostbrk..."	
	use zcustcostbrk exclusive
	pack 

	@10,10 
	@10,10 say "Packing zfobterm..."	
	use zfobterm exclusive
	pack 

	@10,10 
	@10,10 say "Packing zmftr..."	
	use zmftr exclusive
	pack 

	@10,10 
	@10,10 say "Packing zorigin..."	
	use zorigin exclusive
	pack 

	@10,10 
	@10,10 say "Packing zpayterm..."	
	use zpayterm exclusive
	pack 

	@10,10 
	@10,10 say "Packing zsoformat..."		
	use zsoformat exclusive
	pack 

	@10,10 
	@10,10 say "Packing zstdcode..."		
	use zstdcode exclusive
	pack 

	@10,10 
	@10,10 say "Packing mdnhd..."	
        use mdnhd exclusive
        pack

	@10,10 
	@10,10 say "Packing mdndt ..."	        
        use mdndt exclusive
        pack

	@10,10 
	@10,10 say "Packing  mload ..."	                   
        use mload exclusive
        pack

	@10,10 
	@10,10 say "Packing  mlahd ..."	           
        use mlahd exclusive
        pack

	@10,10 
	@10,10 say "Packing  mladt ..."	        
        use mladt exclusive
        pack
        
	@10,10 say "Data Reorganization Completed!"	               
	close table all
	
*       open database baitin
	
*	validate database
*	Messagebox("Please click the exit to restar this system!",64,"System Message!")
endif