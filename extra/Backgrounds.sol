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
    Black,

    Smooth_Vertical,
    Pixelated_Vertical,
    Smooth_Vertical_Inverse,
    Pixelated_Vertical_Inverse,

    Smooth_Horizontal,
    Pixelated_Horizontal,
    Smooth_Horizontal_Inverse,
    Pixelated_Horizontal_Inverse,

    Smooth_Down,
    Pixelated_Down,
    Smooth_Down_Inverse,
    Pixelated_Down_Inverse,

    Smooth_Up,
    Pixelated_Up,
    Smooth_Up_Inverse,
    Pixelated_Up_Inverse,

    Radial
}