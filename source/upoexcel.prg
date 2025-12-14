function uPOExcel

strWorkName = "Sheet1"
eole=CREATEOBJECT("Excel.application")
eole.Workbooks.add
eole.visible=.t.
eole.Worksheets(strWorkName).Activate
*eole.Worksheets(strWorkName).name = "SO# "+ Alltrim(wpso.so_no)


eole.cells(1,1).value="Attached List"
eole.cells(1,1).Font.Bold = 1
eole.cells(1,1).Font.Size = 20
eole.cells(1,2).value=" S/O No:"
eole.cells(1,2).Font.Bold = 1
eole.cells(1,2).HorizontalAlignment= 4
eole.cells(1,2).Font.Size = 14
eole.cells(1,3).Borders(4).LineStyle = 1
eole.cells(1,4).Borders(4).LineStyle = 1
eole.cells(1,5).Borders(4).LineStyle = 1

eole.cells(3,1).value="SHIPPING MARKS"
eole.cells(3,1).Font.Underline = 2
eole.cells(3,1).Font.Bold = 1
eole.cells(3,1).Font.Name = strFontType 
eole.cells(3,1).Font.Size = intFontHDsize

eole.cells(3,2).value="DESCRIPTION"
eole.cells(3,2).Font.Underline = 2
eole.cells(3,2).Font.Bold = 1
eole.cells(3,2).Font.Name = strFontType 
eole.cells(3,2).Font.Size = intFontHDsize

eole.cells(3,3).value="CTNS"
eole.cells(3,3).Font.Underline = 2
eole.cells(3,3).Font.Bold = 1
eole.cells(3,3).Font.Name = strFontType 
eole.cells(3,3).Font.Size = intFontHDsize

eole.cells(3,4).value="G.W.(KGS)"
eole.cells(3,4).Font.Underline = 2
eole.cells(3,4).Font.Bold = 1
eole.cells(3,4).Font.Name = strFontType 
eole.cells(3,4).Font.Size = intFontHDsize

eole.cells(3,5).value="MEAS.(CBM)"
eole.cells(3,5).Font.Underline = 2
eole.cells(3,5).Font.Bold = 1
eole.cells(3,5).Font.Name = strFontType 
eole.cells(3,5).Font.Size = intFontHDsize

eole.ActiveSheet.PageSetup.PrintTitleRows="$1:$4"

eole.ActiveSheet.Columns(1).ColumnWidth=32
eole.ActiveSheet.Columns(2).ColumnWidth=32
eole.ActiveSheet.Columns(3).ColumnWidth=5
eole.ActiveSheet.Columns(3).HorizontalAlignment =3
eole.ActiveSheet.Columns(4).ColumnWidth=11
eole.ActiveSheet.Columns(4).HorizontalAlignment = 3
eole.ActiveSheet.Columns(5).ColumnWidth=14
eole.ActiveSheet.Columns(5).HorizontalAlignment = 3

intStrRow = 5
select wpso 
goto top
do while !eof()

	eole.cells(intStrRow,1).VerticalAlignment = 1
	eole.cells(intStrRow,1).Font.Name = strFontType 
        eole.cells(intStrRow,1).Font.Size = intFontSize
	eole.cells(intStrRow,1).value=wpso.shipmark

	eole.cells(intStrRow,2).VerticalAlignment = 1
	eole.cells(intStrRow,2).Font.Name = strFontType 
        eole.cells(intStrRow,2).Font.Size = intFontSize
	eole.cells(intStrRow,2).value=wpso.remark_1	
	
	eole.cells(intStrRow,3).VerticalAlignment = 1
	eole.cells(intStrRow,3).Font.Name = strFontType 
        eole.cells(intStrRow,3).Font.Size = intFontSize
	eole.cells(intStrRow,3).value=wpso.ctn
	
	eole.cells(intStrRow,4).VerticalAlignment = 1
	eole.cells(intStrRow,4).Font.Name = strFontType 
        eole.cells(intStrRow,4).Font.Size = intFontSize
	eole.cells(intStrRow,4).value=wpso.gc_wt
	eole.cells(intStrRow,4).NumberFormatLocal = "0.00"
	eole.cells(intStrRow,5).VerticalAlignment = 1
	eole.cells(intStrRow,5).Font.Name = strFontType 
        eole.cells(intStrRow,5).Font.Size = intFontSize
	eole.cells(intStrRow,5).value=wpso.measure
	eole.cells(intStrRow,5).NumberFormatLocal = "0.00"
	
	intStrRow = intStrRow+1
	skip
enddo
intStrRow = intStrRow+1
eole.cells(intStrRow,2).value = "TOTAL:"
eole.cells(intStrRow,2).HorizontalAlignment = 4
eole.cells(intStrRow,2).Font.Size = intFontSize
eole.cells(intStrRow,2).Font.Name = strFontType 

eole.cells(intStrRow,2).Font.Bold = 1

eole.cells(intStrRow,3).Borders(3).LineStyle = 1
eole.cells(intStrRow,3).Borders(4).LineStyle = 9
eole.cells(intStrRow,3).FormulaR1C1 = "=SUM(R[-" + transf(intStrRow-5)+"]C:R[-1]C)"
eole.cells(intStrRow,3).Font.Size = intFontSize
eole.cells(intStrRow,3).Font.Name = strFontType 

eole.cells(intStrRow,4).Borders(3).LineStyle = 1
eole.cells(intStrRow,4).Borders(4).LineStyle = 9
eole.cells(intStrRow,4).FormulaR1C1 = "=SUM(R[-" + transf(intStrRow-5)+"]C:R[-1]C)"
eole.cells(intStrRow,4).Font.Size = intFontSize
eole.cells(intStrRow,4).Font.Name = strFontType 
eole.cells(intStrRow,4).NumberFormatLocal = "0.00"
eole.cells(intStrRow,5).Borders(3).LineStyle = 1
eole.cells(intStrRow,5).Borders(4).LineStyle = 9
eole.cells(intStrRow,5).FormulaR1C1 = "=SUM(R[-" + transf(intStrRow-5)+"]C:R[-1]C)"
eole.cells(intStrRow,5).Font.Size = intFontSize
eole.cells(intStrRow,5).Font.Name = strFontType 
eole.cells(intStrRow,5).NumberFormatLocal = "0.00"
eole.ActiveSheet.PageSetup.LeftMargin=1/0.035
eole.ActiveSheet.PageSetup.RightMargin=1/0.035