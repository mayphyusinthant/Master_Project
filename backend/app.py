from flask import Flask, render_template, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
from navigation_utils import create_navigation
from datetime import datetime
import os
import networkx as nx
import time

# Importing map parsing and A* functions
try:
    from map_parser import process_maps
    from a_star_pathfinding import find_node, pathfinding_algo
    FUNCTIONS_LOADED = True
    print("Successfully imported map parsing and A* functions")
except ImportError as e:
    print(f"ERROR: Failed to import required modules: {e}")
    FUNCTIONS_LOADED = False

# Global variable to store pre-parsed graphs
FLOOR_GRAPHS = {}

def initialise_graphs():
    """ Parse all SVG maps on startup """
    global FLOOR_GRAPHS
    if not FUNCTIONS_LOADED:
        print("Skipping graph initialisation due to import errors")
        FLOOR_GRAPHS = {}
        return

    print("Initialising floor map graphs...")

    try:
        base_dir = os.path.dirname(os.path.abspath(__file__)) if '__file__' in locals() else '.'
        map_directory = os.path.join(base_dir, "static")
        print(f"Looking for maps in: {map_directory}")

        FLOOR_GRAPHS = process_maps(directory=map_directory)

        if not FLOOR_GRAPHS:
            print(f"Warning: process_maps returned empty dictionary. No graphs loaded from '{map_directory}'.")
        else:
            print(f"Loaded {len(FLOOR_GRAPHS)} floor graphs: {list(FLOOR_GRAPHS.keys())}")
    except Exception as e:
        print(f"ERROR during graph initialisation: {e}")
        import traceback
        traceback.print_exc() # Print traceback for debugging
        FLOOR_GRAPHS = {}

app = Flask(__name__)

CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

# Call initialisation when app starts
initialise_graphs()

# MySQL Configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'campus_database'

mysql = MySQL(app)

@app.route("/")
def index():
    cur = mysql.connection.cursor()
    cur.execute("SELECT DISTINCT floor FROM room_info ORDER BY floor ASC")
    floors = [row[0] for row in cur.fetchall()]
    cur.close()

    return render_template("index.html", floors=floors)

@app.route("/campus_info")
def campus_mgmt():
    per_page = 25  
    page = request.args.get('page', 1, type=int)  
    offset = (page - 1) * per_page  

    cur = mysql.connection.cursor()
    cur.execute("SELECT COUNT(*) FROM room_info")
    total_rows = cur.fetchone()[0]
    cur.execute("SELECT room_id, room_name, description, floor FROM room_info LIMIT %s OFFSET %s", (per_page, offset))
    rooms = cur.fetchall()
    
    cur.close()

    total_pages = (total_rows // per_page) + (1 if total_rows % per_page > 0 else 0)  
    return render_template('campus_info.html', rooms=rooms, page=page, total_pages=total_pages)


@app.route('/users')
def users():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM users")
    data = cur.fetchall()
    cur.close()
    return str(data)

# api routes for react (need to be imported from file after)
@app.route('/api/rooms', methods=['GET'])
def get_rooms():
    cur = mysql.connection.cursor()
    query = """SELECT * FROM room_info"""
    cur.execute(query)   
    rows = cur.fetchall()
    cur.close()

    rooms = []
    for row in rows:
         rooms.append({
            "roomId": row[0],  # fallback if description is empty
            "roomName": row[1],
            "type": row[2],
            "description": row[3],
            "floor": row[4]
        })

    return jsonify(rooms)


@app.route('/api/navigate', methods=['POST'])
def handle_navigation():
    # Checking if core functions failed to load during startup
    if not FUNCTIONS_LOADED:
        return jsonify({"status": "error", "message": "Navigation system unavailable due to initialisation error."}), 503

    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "message": "Invalid request body"}), 400

    start_room_input = data.get('from')
    goal_room_input = data.get('to')

    if not start_room_input or not goal_room_input:
        return jsonify({"status": "error", "message": "Missing 'from' or 'to' room ID"}), 400

    print(f"\n--- Navigation Request ---")
    print(f"From: '{start_room_input}' To: '{goal_room_input}'")

    # --- Fetch Room Details from DB (including coordinates needed for create_navigation) ---
    from_room_details = None
    to_room_details = None
    try:
        cur = mysql.connection.cursor()
        # Fetch FROM room details
        cur.execute("SELECT room_id, room_name, floor, x_coordinate, y_coordinate FROM room_info WHERE room_name = %s",
                    (start_room_input,))
        from_row = cur.fetchone()
        if from_row:
            from_room_details = {
                "roomId": from_row[0], "roomName": from_row[1], "floor_db": from_row[2],  # Store original DB value
                "x_coordinate": from_row[3], "y_coordinate": from_row[4]
            }

        # Fetch TO room details
        cur.execute("SELECT room_id, room_name, floor, x_coordinate, y_coordinate FROM room_info WHERE room_name = %s",
                    (goal_room_input,))
        to_row = cur.fetchone()
        if to_row:
            to_room_details = {
                "roomId": to_row[0], "roomName": to_row[1], "floor_db": to_row[2],  # Store original DB value
                "x_coordinate": to_row[3], "y_coordinate": to_row[4]
            }
        cur.close()
    except Exception as e:
        print(f"Database error fetching room details: {e}")
        return jsonify({"status": "error", "message": "Error fetching room details."}), 500

    # --- Validate if rooms were found in DB ---
    if not from_room_details or not to_room_details:
        missing = []
        if not from_room_details: missing.append(f"start room '{start_room_input}'")
        if not to_room_details: missing.append(f"goal room '{goal_room_input}'")
        msg = f"Could not find information for {' and '.join(missing)} in the database."
        print(f"Error: {msg}")
        return jsonify({"status": "error", "message": msg}), 404  # Not Found

    # --- Extract Floor Letter ---
    # Assumes floor_db contains something like "Floor A", "Floor B", etc.
    # Extracts the last part after splitting by space. Handles single letters too.
    start_floor_letter = from_room_details['floor_db'].split()[-1] if from_room_details and from_room_details.get('floor_db') else None
    goal_floor_letter = to_room_details['floor_db'].split()[-1] if to_room_details and to_room_details.get('floor_db') else None

    # Add validation for extracted letters
    if not start_floor_letter or not goal_floor_letter:
        msg = "Could not determine valid floor letter from database information."
        print(
            f"Error: {msg} (Start DB: {from_room_details.get('floor_db')}, Goal DB: {to_room_details.get('floor_db')})")
        return jsonify({"status": "error", "message": msg}), 400

    print(f"Determined Floor Letters - Start: {start_floor_letter}, Goal: {goal_floor_letter}")

    # -------------------------------------------------------------------------------------- Handle cross floor navigation (STILL TO IMPLEMENT)
    if start_floor_letter != goal_floor_letter:
        # Implement multi floor pathfinding logic here
        # find elevators and stairs on each floor and combine them? connect nodes?
        msg = f"Cross-floor navigation (Floor {start_floor_letter} to Floor {goal_floor_letter} is not yet implemented"
        print(f"Error: {msg}")
        return jsonify({"status": "error", "message": msg}), 501 # not implemented
    # -------------------------------------------------------------------------------------------------------------------------------------

    # --- Get the correct floor graph ---
    target_floor_filename = f"Floor_{start_floor_letter}.svg"
    print(f"Target floor map file: {target_floor_filename}")

    floor_graph = FLOOR_GRAPHS.get(target_floor_filename)

    if floor_graph is None or not isinstance(floor_graph, nx.Graph):
        print(f"Error: Parsed graph for '{target_floor_filename}' not found or invalid")
        return jsonify({"status": "error", "message": f"Map data for floor {start_floor_letter} is currently unavailable"}), 500

    # --- Find Start/Goal nodes within the Graph
    print(f"Searching graph for node matching '{start_room_input}'...")
    start_node_id = find_node(start_room_input, floor_graph)

    print(f"Searching graph for node matching '{goal_room_input}'...")
    goal_node_id = find_node(goal_room_input, floor_graph)

    # Validate if nodes were found in the graph structure
    if start_node_id is None:
        msg = f"Start location '{start_room_input}' not found as a navigable area on the Floor {start_floor_name} map graph."
        print(f"Error: {msg}")
        return jsonify({"status": "error", "message": msg}), 404
    if goal_node_id is None:
        msg = f"Goal location '{goal_room_input}' not found as a navigable area on the Floor {goal_floor_name} map graph."
        print(f"Error: {msg}")
        return jsonify({"status": "error", "message": msg}), 404

    print(f"Found graph nodes: Start='{start_node_id}', Goal='{goal_node_id}'")

    # --- Run A* Algorithm ---
    print("Running A* pathfinding...")
    path_node_ids = pathfinding_algo(start_node_id, goal_node_id, floor_graph)

    # --- Process and return result ---
    if path_node_ids:
        print(f"A* Path found with {len(path_node_ids)} steps.")
        try:
            # Extract the type from node data for the response
            path_room_types = [floor_graph.nodes[node_id].get('type', 'Unknown') for node_id in path_node_ids]
            print(f"Path (types): {' -> '.join(path_room_types)}")
            # Return success with the path of room types
            return jsonify({
                "status": "success",
                "message": "Path found",
                "path": path_room_types
                # --------------------------- ADD COORDS IF FRONTEND NEEDS TO DRAW A PATH??
                # "path_coords": [(floor_graph.nodes[n]['center_x'], floor_graph.nodes[n]['center_y']) for n in path_nodes_ids]
            }), 200
        except KeyError as e:
            print(f"Error accessing node data while formatting path: {e}")
            return jsonify({
                "status": "success", # Path found but formatting failed
                "message": "Path found, but encountered an error formatting the display path.",
                "path_raw": path_node_ids # Send raw unique ids as fallback
            }), 200
    else:
        # A* returned None
        print("A* algorithm returned no path")
        return jsonify({
            "status": "error",
            "message": f"Sorry, no navigable path could be found between '{start_room_input}' and {goal_room_input}'",
            "path": []
        }), 404

    #------------------------------------ OLD ONES BELOW
    """
    data = request.get_json()
    print(data)
    from_name = data.get('from')
    to_name = data.get('to')

    cur = mysql.connection.cursor()

    # Fetch FROM room
    cur.execute("SELECT room_id, room_name, floor, x_coordinate, y_coordinate FROM room_info WHERE room_name = %s", (from_name,))
    from_row = cur.fetchone()

    # Fetch TO room
    cur.execute("SELECT room_id, room_name, floor, x_coordinate, y_coordinate FROM room_info WHERE room_name = %s", (to_name,))
    to_row = cur.fetchone()

    cur.close()

    if not from_row or not to_row:
        return jsonify({"status": "error", "message": "One or both rooms not found"}), 404
    
    from_room = {
        "roomId": from_row[0],
        "roomName": from_row[1],
        "floor": from_row[2],
        "x_coordinate": from_row[3],
        "y_coordinate": from_row[4]
    }

    to_room = {
        "roomId": to_row[0],
        "roomName": to_row[1],
        "floor": to_row[2],
        "x_coordinate": to_row[3],
        "y_coordinate": to_row[4]
    }

    result = create_navigation(from_room, to_room)

    return jsonify({"status": "success", "message": result}), 200
    """



@app.route('/api/library_room_types', methods=['GET'])
def get_library_room_types():
    cur = mysql.connection.cursor()
    cur.execute("""SELECT DISTINCT room_type FROM `room_info` 
                WHERE room_type != 'Lecture Room'
                AND room_type != 'Stairs'
                AND room_type != 'Toilet'
                AND room_type != 'Elevator'
                """)
    
    rows = cur.fetchall()
    cur.close()

    # Prepare the library_rooms_type
    library_rooms_type = []
    library_rooms_type.append({"type": "All"})

    for row in rows:
        library_rooms_type.append({
            "type": row[0],
        })

    # Debug print to console
    print("Returning data:", library_rooms_type)
    
    # Make sure we're returning a properly formatted JSON array
    return jsonify(library_rooms_type)


@app.route('/api/available_library_rooms', methods=['GET'])
def get_available_library_rooms():

    start_dt = datetime.strptime(request.args.get('start_date_time'), "%Y-%m-%d %H:%M:%S")
    end_dt = datetime.strptime(request.args.get('end_date_time'), "%Y-%m-%d %H:%M:%S")
    room_type = request.args.get('roomType')

    # Validate input
    if not start_dt or not end_dt:
        return jsonify({"error": "start_date_time and end_date_time are required"}), 400

    if not room_type:
        room_type = "All"

    start_dt_str = start_dt.strftime('%Y-%m-%d %H:%M:%S')
    end_dt_str = end_dt.strftime('%Y-%m-%d %H:%M:%S')
        
    cur = mysql.connection.cursor()
    if room_type == "All" or room_type == "":
        query = """
            SELECT * FROM room_info 
            WHERE room_id NOT IN (
                SELECT room_id 
                FROM rooms_booking_info 
                WHERE 
                    (start_date_time >= %s AND start_date_time <= %s)  
                    OR 
                    (end_date_time >= %s AND end_date_time <= %s)
            ) 
            AND room_name LIKE %s OR room_type LIKE %s;
        """
        
        params = (start_dt_str, end_dt_str, start_dt_str, end_dt_str, 'L%', 'SCEBE %')
        cur.execute(query, params)
   
    else:
        query = """
            SELECT * FROM room_info 
            WHERE room_id NOT IN (
                SELECT room_id 
                FROM rooms_booking_info 
                WHERE 
                    (start_date_time >= %s AND start_date_time <= %s)  
                    OR 
                    (end_date_time >= %s AND end_date_time <= %s)
            ) 
            AND room_type = %s;
        """
        
        params = (start_dt_str, end_dt_str, start_dt_str, end_dt_str, room_type)
        cur.execute(query, params)

    rows = cur.fetchall()
    cur.close()

    # Prepare the available rooms data
    available_library_rooms = []
    for row in rows:
        available_library_rooms.append({
            "roomId": row[0],
            "roomName": row[1],
            "type": row[2],
            "description": row[3],
            "floor": row[4]
        })

    return jsonify(available_library_rooms)


@app.route('/api/all_room_types', methods=['GET'])
def get_all_room_types():
    cur = mysql.connection.cursor()
    cur.execute("""SELECT DISTINCT room_type FROM `room_info` 
                WHERE room_type != 'Stairs'
                AND room_type != 'Toilet'
                AND room_type != 'Elevator'
                """)
    
    rows = cur.fetchall()
    cur.close()

    # Prepare the library_rooms_type
    library_rooms_type = []
    library_rooms_type.append({"type": "All"})

    for row in rows:
        library_rooms_type.append({
            "type": row[0],
        })

    # Debug print to console
    print("Returning data:", library_rooms_type)
    
    # Make sure we're returning a properly formatted JSON array
    return jsonify(library_rooms_type)


@app.route('/api/available_rooms', methods=['GET'])
def get_available_rooms():
    room_type = request.args.get('roomType')

    if not room_type:
        room_type = "All"

    cur = mysql.connection.cursor()
    if room_type == "All" or room_type == "":
        query = """SELECT * FROM room_info;"""
        cur.execute(query)
   
    else:
        query = """SELECT * FROM room_info  WHERE room_type = %s; """
        params = (room_type,)
        cur.execute(query, params)

    rows = cur.fetchall()
    cur.close()

    # Prepare the available rooms data
    available_rooms = []
    for row in rows:
        available_rooms.append({
            "roomId": row[0],
            "roomName": row[1],
            "type": row[2],
            "description": row[3],
            "floor": row[4]
        })

    return jsonify(available_rooms)


@app.route('/api/current_bookings', methods=['GET'])
def get_current_bookings():

    student_id = request.args.get('student_id')

    if not student_id:
       return jsonify({"error": "Fetching data failed - student Id Required !"}), 400

    cur = mysql.connection.cursor()
    query = """
        SELECT rooms_booking_info.*, room_info.room_name, room_info.floor FROM rooms_booking_info LEFT JOIN room_info ON rooms_booking_info.room_id = room_info.room_id WHERE rooms_booking_info.student_id = %s
    """
    cur.execute(query, (student_id,))

    rows = cur.fetchall()
    cur.close()

    # Prepare the available rooms data
    current_bookings = []
    for row in rows:
        current_bookings.append({
            "booking_id": row[0],
            "room_id": row[1],
            "start_date_time": row[2],
            "end_date_time": row[3],
            "status": row[4],
            "student_id": row[5],
            "title": row[6],
            "room_name": row[7],
            "floor": row[8],
            
        })

    return jsonify(current_bookings)


@app.route('/api/book_room', methods=['POST'])
def book_room():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    required_fields = ['roomId', 'start_date_time', 'end_date_time', 'matriculationNumber', 'title']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing booking information"}), 400


    room_id = data['roomId']
    start_date_time = data['start_date_time']
    end_date_time = data['end_date_time']
    student_id = data['matriculationNumber']
    title = data['title']

    cur = mysql.connection.cursor()
    query = """
        INSERT INTO rooms_booking_info (room_id, start_date_time, end_date_time, status, student_id, title)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    cur.execute(query, (room_id, start_date_time, end_date_time, '', student_id, title))
    mysql.connection.commit()
    cur.close()

    return jsonify({"message": "Booking successful!"}), 201


@app.route('/api/remove_booking/<bookingId>', methods=['DELETE'])
def remove_booking(bookingId):
    if not bookingId:
        return jsonify({ 'error': 'Booking ID is required.' }), 400

    cur = mysql.connection.cursor()
    query = "DELETE FROM rooms_booking_info WHERE booking_id = %s"
    cur.execute(query, (bookingId,))
    mysql.connection.commit()  # Make sure to commit after delete
    cur.close()
    return jsonify({ 'message': 'Booking removed successfully.' }), 200



if __name__ == '__main__':
    app.run(debug=True)




