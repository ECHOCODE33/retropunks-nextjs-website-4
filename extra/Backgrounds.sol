// Down: Top left --> bottom right (diagonal)
// Up: Top right --> bottom left (diagonal)

enum E_Background_Type {
    None, // not a background
    Background_Image,
    Solid,

    S_Vertical,
    P_Vertical,

    S_Horizontal,
    P_Horizontal,

    S_Down,
    P_Down,
    S_Up,
    P_Up,

    Radial
}

enum E_Background {
    Default,
    Solid_Black,

    S_Vertical,
    P_Vertical,
    S_Vertical_Inverse,
    P_Vertical_Inverse,

    S_Horizontal,
    P_Horizontal,
    S_Horizontal_Inverse,
    P_Horizontal_Inverse

    S_Down,
    P_Down,
    S_Down_Inverse,
    P_Down_Inverse,

    S_Up,
    P_Up,
    S_Up_Inverse,
    P_Up_Inverse,

    Radial
}