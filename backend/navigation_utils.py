def create_navigation(from_room, to_room):
    
    from_name = from_room['roomName']
    to_name = to_room['roomName']
    from_floor = from_room['floor']
    to_floor = to_room['floor']
    from_x = from_room['x_coordinate']
    from_y = from_room['y_coordinate']
    to_x = to_room['x_coordinate']
    to_y = to_room['y_coordinate']
    

    return (
       
        f"The route between rooms {from_name} - {from_floor} and {to_name} - {to_floor} was found. "
        f"Please follow directions on the map to reach your destination. "
        f"Have a great day!"
    )