Function Uprinted
    IF wexist("Printing...") Or  wexist("¥¿¦b¦C¦L...")
        Lprinted = .T.
    Else
        Lprinted = .F.
    Endif
    Return Lprinted
    