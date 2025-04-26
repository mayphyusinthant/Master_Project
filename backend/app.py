from flask import Flask, render_template, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
from datetime import datetime
import os
import networkx as nx
import traceback


# Import map parsing and A* functions
try:
    from map_parser import create_campus_graph
    from a_star_pathfinding import find_node, pathfinding_algo
    from navigation_utils import create_navigation

    # Enable navigation functionality
    FUNCTIONS_LOADED = True
    print("Successfully imported map parsing, A*, and navigation_utils functions.")
except ImportError as e:
    print(f"ERROR: Failed to import required modules: {e}")
    print("Navigation functionality will be disabled.")
    FUNCTIONS_LOADED = False

    # Define dummy functions if import fails, so app can still run (partially)
    def create_campus_graph(directory="static", **kwargs): print("Dummy create_campus_graph called."); return None
    def find_node(room_id, graph): print("Dummy find_node called."); return None
    def pathfinding_algo(start, goal, graph): print("Dummy pathfinding_algo called."); return None
    def create_navigation(f_room, t_room): print("Dummy create_navigation called."); return "Navigation unavailable."

# Global variable to store the combined campus graph
CAMPUS_GRAPH = None

def initialize_graphs():
    """ Parse all SVG maps and creates a combined campus graph on startup """
    global CAMPUS_GRAPH
    if not FUNCTIONS_LOADED:
        print("Skipping graph initialization due to import errors.")
        CAMPUS_GRAPH = None
        return

    print("Initializing combined campus graph...")
    try:
        # Specify the directory containing SVG files
        base_dir = os.path.dirname(os.path.abspath(__file__)) if '__file__' in locals() else '.'
        map_directory = os.path.join(base_dir, "static")
        print(f"Looking for maps in: {map_directory}")

        CAMPUS_GRAPH = create_campus_graph(directory=map_directory)

        if CAMPUS_GRAPH is None or not isinstance(CAMPUS_GRAPH, nx.Graph):
             print(f"ERROR: create_campus_graph failed to return a valid graph from '{map_directory}'.")
             CAMPUS_GRAPH = None
        elif len(CAMPUS_GRAPH.nodes) == 0:
             print(f"Warning: Combined campus graph has 0 nodes. Check parsing.")
        else:
             print(f"Combined campus graph created successfully.")
             print(f"Total Nodes: {CAMPUS_GRAPH.number_of_nodes()}, Total Edges: {CAMPUS_GRAPH.number_of_edges()}")
    except Exception as e:
        print(f"ERROR during graph initialization: {e}")
        traceback.print_exc() # Print detailed traceback for debugging
        CAMPUS_GRAPH = None

app = Flask(__name__)

CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

# Call initialisation when app starts
initialize_graphs()

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
    # Check if core functions loaded and graph is initialized
    if not FUNCTIONS_LOADED:
         return jsonify({"status": "error", "message": "Navigation system unavailable due to import errors."}), 503
    if CAMPUS_GRAPH is None or not isinstance(CAMPUS_GRAPH, nx.Graph):
         return jsonify({"status": "error", "message": "Navigation map data is not available."}), 503

    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "message": "Invalid request body"}), 400

    # Initial and goal inputs
    start_room_input = data.get('from')
    goal_room_input = data.get('to')

    if not start_room_input or not goal_room_input:
        return jsonify({"status": "error", "message": "Missing 'from' or 'to' room ID"}), 400

    print(f"\n--- Navigation Request ---")
    print(f"From: '{start_room_input}' To: '{goal_room_input}'")

    # Fetch Room Details from DB
    from_room_details = None
    to_room_details = None
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT room_id, room_name, floor, x_coordinate, y_coordinate FROM room_info WHERE room_name = %s", (start_room_input,))
        from_row = cur.fetchone()
        if from_row: from_room_details = {"roomId": from_row[0], "roomName": from_row[1], "floor_db": from_row[2], "x_coordinate": from_row[3], "y_coordinate": from_row[4]}
        cur.execute("SELECT room_id, room_name, floor, x_coordinate, y_coordinate FROM room_info WHERE room_name = %s", (goal_room_input,))
        to_row = cur.fetchone()
        if to_row: to_room_details = {"roomId": to_row[0], "roomName": to_row[1], "floor_db": to_row[2], "x_coordinate": to_row[3], "y_coordinate": to_row[4]}
        cur.close()
    except Exception as e:
        print(f"Database error fetching room details: {e}")
        return jsonify({"status": "error", "message": "Error fetching room details."}), 500

    # Validate if rooms were found in DB
    if not from_room_details or not to_room_details:
        missing = []
        if not from_room_details: missing.append(f"start room '{start_room_input}'")
        if not to_room_details: missing.append(f"goal room '{goal_room_input}'")
        msg = f"Could not find information for { ' and '.join(missing) } in the database."
        print(f"Error: {msg}")
        return jsonify({"status": "error", "message": msg}), 404

    # Find Start/Goal Nodes within the COMBINED Graph
    print(f"Searching campus graph for node matching '{start_room_input}'...")
    start_node_id = find_node(start_room_input, CAMPUS_GRAPH)
    print(f"Searching campus graph for node matching '{goal_room_input}'...")
    goal_node_id = find_node(goal_room_input, CAMPUS_GRAPH)

    # Validate if nodes were found in the graph structure
    if start_node_id is None:
        msg = f"Start location '{start_room_input}' not found as a navigable area in the campus map graph."
        print(f"Error: {msg}")
        return jsonify({"status": "error", "message": msg}), 404
    if goal_node_id is None:
        msg = f"Goal location '{goal_room_input}' not found as a navigable area in the campus map graph."
        print(f"Error: {msg}")
        return jsonify({"status": "error", "message": msg}), 404

    print(f"Found graph nodes: Start='{start_node_id}', Goal='{goal_node_id}'")

    # Run A* Pathfinding on the COMBINED Graph
    print("Running A* algorithm...")
    path_node_ids = pathfinding_algo(start_node_id, goal_node_id, CAMPUS_GRAPH)

    # Process and Return Result
    if path_node_ids:
        print(f"A* Path found with {len(path_node_ids)} steps.")
        # Call create_navigation to get the formatted message
        nav_message = "Navigation details unavailable."
        if 'create_navigation' in globals():
            try:
                from_nav = from_room_details.copy(); from_nav['floor'] = from_room_details['floor_db']
                to_nav = to_room_details.copy(); to_nav['floor'] = to_room_details['floor_db']
                nav_message = create_navigation(from_nav, to_nav)
            except Exception as e: print(f"Error calling create_navigation: {e}")

        # Format path for display AND extract coordinates
        path_room_types = []
        path_coordinates = []
        try:
            for node_id in path_node_ids:
                 node_data = CAMPUS_GRAPH.nodes[node_id]
                 path_room_types.append(node_data.get('type', 'Unknown'))
                 # Extract center coordinates
                 path_coordinates.append([
                     node_data.get('center_x', 0.0),
                     node_data.get('center_y', 0.0)
                 ])
            print(f"Path (types): {' -> '.join(path_room_types)}")
        except KeyError as e:
             print(f"Error accessing node data while formatting path: {e}")
             return jsonify({
                 "status": "success",
                 "message": nav_message,
                 "path_raw": path_node_ids,
                 "error_details": "Path found, error formatting display path."
             }), 200

        # Return success response with path types and coordinates
        return jsonify({
            "status": "success",
            "message": nav_message,
            "path": path_room_types,
            "path_coords": path_coordinates
        }), 200
    else:
        # A* returned None
        print("A* algorithm returned no path.")
        return jsonify({
            "status": "error",
            "message": f"Sorry, no navigable path could be found between '{start_room_input}' and '{goal_room_input}'.",
            "path": [],
            "path_coords": [] # Empty list on failure
        }), 404

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

@app.route('/api/history', methods=['GET'])
def get_history():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM navigation_history ORDER BY timestamp DESC")
    rows = cur.fetchall()
    columns = [col[0] for col in cur.description]
    result = [dict(zip(columns, row)) for row in rows]
    cur.close()
    return jsonify(result)


@app.route('/api/history', methods=['POST'])
def add_history():
    data = request.json
    from_room = data.get('from')
    to_room = data.get('to')
    floor_from = data.get('floorFrom')
    floor_to = data.get('floorTo')

    cur = mysql.connection.cursor()
    cur.execute("""
        INSERT INTO navigation_history (from_room, to_room, floor_from, floor_to)
        VALUES (%s, %s, %s, %s)
    """, (from_room, to_room, floor_from, floor_to))
    mysql.connection.commit()
    cur.close()

    return jsonify({"message": "Navigation history saved."})


@app.route('/api/history/<int:history_id>', methods=['DELETE'])
def delete_history_entry(history_id):
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM navigation_history WHERE id = %s", (history_id,))
    mysql.connection.commit()
    cur.close()
    return jsonify({"message": f"Deleted route {history_id}."})


@app.route('/api/history', methods=['DELETE'])
def clear_all_history():
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM navigation_history")
    mysql.connection.commit()
    cur.close()
    return jsonify({"message": "All history cleared."})

from flask import request, jsonify

# ======= CLASS SCHEDULE ROUTES =======

@app.route('/api/class_schedules', methods=['GET'])
def get_class_schedules():
    cur = mysql.connection.cursor()
    query = """
        SELECT cs.schedule_id, cs.room_id, cs.start_date_time, cs.end_date_time, cs.schedule_type, cs.status, r.room_name, r.floor
        FROM class_schedule_info cs
        LEFT JOIN room_info r ON cs.room_id = r.room_id
        ORDER BY cs.start_date_time ASC
    """
    cur.execute(query)
    rows = cur.fetchall()
    cur.close()

    schedules = []
    for row in rows:
        schedules.append({
            "schedule_id": row[0],
            "room_id": row[1],
            "start_date_time": row[2],
            "end_date_time": row[3],
            "schedule_type": row[4],
            "status": row[5],
            "room_name": row[6],
            "floor": row[7]
        })

    return jsonify(schedules)


@app.route('/api/create_class_schedule', methods=['POST'])
def create_class_schedule():
    
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Missing data'}), 400

    room_id = data.get('room_id')
    schedule_type = data.get('schedule_type')
    title = data.get('title')
    start_date_time = data.get('start_date_time')
    end_date_time = data.get('end_date_time')
    status = 'Booked'  # Default to 'Active' if not provided

    if not all([room_id, schedule_type, start_date_time, end_date_time]):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        cur = mysql.connection.cursor()
        cur.execute("""
    INSERT INTO class_schedule_info (room_id, schedule_type, start_date_time, end_date_time, status, title)
    VALUES (%s, %s, %s, %s, %s, %s)
""", (room_id, schedule_type, start_date_time, end_date_time, status, title))
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'Schedule created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/class_schedule', methods=['GET'])
def get_class_schedule():
    try:
        cur = mysql.connection.cursor()
        query = """
            SELECT cs.schedule_id, cs.room_id, cs.start_date_time, cs.end_date_time, cs.schedule_type, cs.status, cs.title, r.room_name, r.room_type, r.floor
            FROM class_schedule_info cs
            LEFT JOIN room_info r ON cs.room_id = r.room_id
            ORDER BY cs.start_date_time ASC
        """
        cur.execute(query)
        rows = cur.fetchall()
        cur.close()

        schedules = []
        for row in rows:
            schedules.append({
                "schedule_id": row[0],
                "room_id": row[1],
                "start_date_time": row[2],
                "end_date_time": row[3],
                "schedule_type": row[4],
                "status": row[5],
                "title": row[6],
                "room_name": row[7],
                "room_type": row[8],
                "floor": row[9]
            })

        
        return jsonify(schedules)
    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/api/update_class_schedule/<int:schedule_id>', methods=['PUT'])
def update_class_schedule(schedule_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid or missing JSON body'}), 400

    try:
        cur = mysql.connection.cursor()
        query = """
            UPDATE class_schedule_info
            SET room_id = %s, schedule_type = %s, start_date_time = %s, end_date_time = %s, title = %s
            WHERE schedule_id = %s
            """
        cur.execute(query, (
            data['room_id'],
            data['schedule_type'],
            data['start_date_time'],
            data['end_date_time'],
            data['title'],  # New
            schedule_id
))
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'Schedule updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500




@app.route('/api/delete_class_schedule/<int:schedule_id>', methods=['DELETE'])
def delete_class_schedule(schedule_id):
    try:
        cur = mysql.connection.cursor()
        cur.execute("DELETE FROM class_schedule_info WHERE schedule_id = %s", (schedule_id,))
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'Schedule deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500




if __name__ == '__main__':
    app.run(debug=True)




